from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from .models import SessionState, ExecutionRequest, ExecutionResult
from .executor import execute_code
from .database import db

app = FastAPI(title="Live Code Studio API", version="1.0.0")

@app.middleware("http")
async def log_requests(request, call_next):
    print(f"Incoming request: {request.method} {request.url}")
    response = await call_next(request)
    print(f"Response status: {response.status_code}")
    return response

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Default code templates
DEFAULT_CODE = {
  'javascript': "// Welcome to your coding interview!\n// Write your solution below\n\nfunction solution(input) {\n  // Your code here\n  return input;\n}\n\n// Test your solution\nconsole.log(solution(\"Hello, World!\"));\n",
  'python': "# Welcome to your coding interview!\n# Write your solution below\n\ndef solution(input):\n    # Your code here\n    return input\n\n# Test your solution\nprint(solution(\"Hello, World!\"))\n",
}

@app.get("/sessions/{session_id}", response_model=SessionState)
def get_session(session_id: str):
    session = db.get_session(session_id)
    if not session:
        # Auto-create for demo purposes, matching frontend expectation
        session = db.create_session(
            session_id, 
            default_code=DEFAULT_CODE.get('javascript', ''),
            language='javascript'
        )
    return session

@app.post("/sessions/{session_id}", response_model=SessionState)
def update_session(session_id: str, update: dict):
    # Try to update existing session
    session = db.update_session(
        session_id, 
        code=update.get('code'), 
        language=update.get('language')
    )
    
    # If not found, create it (upsert behavior)
    if not session:
        # Determine language to set default code/language
        lang = update.get('language', 'javascript')
        code = update.get('code', DEFAULT_CODE.get(lang, ''))
        session = db.create_session(session_id, default_code=code, language=lang)
        
    return session

@app.post("/execute", response_model=ExecutionResult)
def execute_endpoint(request: ExecutionRequest):
    return execute_code(request.code, request.language)

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Live Code Studio Backend Running"}

# Serve React App (Static Files)
# This requires the "frontend/dist" to be copied to "/app/static" in Docker
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Check if running in Docker where /app/static exists
if os.path.exists("/app/static"):
    app.mount("/assets", StaticFiles(directory="/app/static/assets"), name="assets")
    
    # Catch-all for SPA client-side routing
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Allow API calls to pass through (already handled by routes above, but good safety)
        if full_path.startswith("api/") or full_path.startswith("sessions/") or full_path == "execute":
            return {"error": "Not Found"}
            
        # Serve index.html for any other route
        return FileResponse("/app/static/index.html")
