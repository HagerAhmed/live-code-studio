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

# Auth Models
class UserBase(BaseModel):
    email: str
    full_name: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserOut(UserBase):
    id: int

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
