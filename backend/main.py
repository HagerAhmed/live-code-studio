import os
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from .executor import execute_code
from .database import db, SessionLocal, DBUser
from .models import SessionState, ExecutionRequest, ExecutionResult, UserCreate, UserLogin, UserOut, Token
from datetime import datetime, timedelta
from jose import JWTError, jwt
import bcrypt
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from fastapi import Depends

# Auth configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-for-dev-only")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 1 day

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub") # type: ignore
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    session = SessionLocal()
    try:
        user = session.query(DBUser).filter(DBUser.email == email).first()
        if user is None:
            raise credentials_exception
        return user
    finally:
        session.close()

app = FastAPI(title="Live Code Studio API", version="1.0.0")

# Auth Endpoints
@app.post("/auth/signup", response_model=UserOut)
def signup(user_in: UserCreate):
    session = SessionLocal()
    try:
        # Check if user exists
        existing_user = session.query(DBUser).filter(DBUser.email == user_in.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create new user
        db_user = DBUser(
            email=user_in.email,
            full_name=user_in.full_name,
            hashed_password=get_password_hash(user_in.password)
        )
        session.add(db_user)
        session.commit()
        session.refresh(db_user)
        return db_user
    finally:
        session.close()

@app.post("/auth/login", response_model=Token)
def login(user_in: UserLogin):
    session = SessionLocal()
    try:
        user = session.query(DBUser).filter(DBUser.email == user_in.email).first()
        if not user or not verify_password(user_in.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}
    finally:
        session.close()

@app.get("/auth/me", response_model=UserOut)
def read_users_me(current_user: DBUser = Depends(get_current_user)):
    return current_user

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

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Live Code Studio Backend Running"}

# Serve React App (Static Files)
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Check if running in Docker where /app/static exists
if os.path.exists("/app/static"):
    app.mount("/assets", StaticFiles(directory="/app/static/assets"), name="assets")
    
    # Catch-all for SPA client-side routing
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str = ""):
        # Allow API calls to pass through
        if full_path.startswith("api/") or full_path.startswith("sessions/") or full_path == "execute" or full_path == "health":
            return {"error": "Not Found"}
            
        # Serve index.html for root and any other SPA route
        return FileResponse("/app/static/index.html")
else:
    # Local development feedback
    @app.get("/")
    def root():
        return {"message": "Backend is running. In production, this serves the React app."}
