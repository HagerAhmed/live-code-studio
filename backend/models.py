from pydantic import BaseModel
from typing import Optional, Literal

SupportedLanguage = Literal[
    'javascript', 'typescript', 'python'
]

class SessionState(BaseModel):
    code: str
    language: SupportedLanguage
    connectedUsers: int

class ExecutionRequest(BaseModel):
    code: str
    language: SupportedLanguage

class ExecutionResult(BaseModel):
    success: bool
    output: str
    error: Optional[str] = None
    executionTime: float
