from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .models import SessionState, ExecutionRequest, ExecutionResult, SupportedLanguage
from .executor import execute_code

app = FastAPI(title="Live Code Studio API", version="1.0.0")

# Setup CORS to allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"], # Vite defaults
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session store (Mock database)
sessions = {}

# Default code templates matching frontend
DEFAULT_CODE = {
  'javascript': "// Welcome to your coding interview!\n// Write your solution below\n\nfunction solution(input) {\n  // Your code here\n  return input;\n}\n\n// Test your solution\nconsole.log(solution(\"Hello, World!\"));\n",
  'python': "# Welcome to your coding interview!\n# Write your solution below\n\ndef solution(input):\n    # Your code here\n    return input\n\n# Test your solution\nprint(solution(\"Hello, World!\"))\n",
  # Add others as needed or rely on frontend to send initial
}

@app.get("/sessions/{session_id}", response_model=SessionState)
def get_session(session_id: str):
    if session_id not in sessions:
        # Create default session if it doesn't exist (auto-create logic matching frontend)
        sessions[session_id] = SessionState(
            code=DEFAULT_CODE.get('javascript', ''),
            language='javascript',
            connectedUsers=1
        )
    return sessions[session_id]

@app.post("/sessions/{session_id}", response_model=SessionState)
def update_session(session_id: str, update: dict):
    # Note: 'update' body schema should ideally be partial session state
    # For now, we'll just accept relevant fields manualy
    if session_id not in sessions:
         sessions[session_id] = SessionState(
            code=DEFAULT_CODE.get('javascript', ''),
            language='javascript',
            connectedUsers=0
        )
    
    current = sessions[session_id]
    
    if 'code' in update:
        current.code = update['code']
    if 'language' in update:
        current.language = update['language']
        # Reset code on language switch? 
        # Frontend does it, backend should probably just trust the payload or handle logic.
        # Here we just trust the payload.
    
    sessions[session_id] = current
    return current

@app.post("/execute", response_model=ExecutionResult)
def execute_endpoint(request: ExecutionRequest):
    return execute_code(request.code, request.language)

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Live Code Studio Backend Running"}
