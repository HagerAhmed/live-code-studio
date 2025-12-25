from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from .models import SessionState, ExecutionRequest, ExecutionResult
from .executor import execute_code
from .database import db

app = FastAPI(title="Live Code Studio API", version="1.0.0")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173"],
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
