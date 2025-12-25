from typing import Optional
import os
from sqlalchemy import create_engine, Column, String, Integer, Text, BigInteger
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .models import SessionState, SupportedLanguage

# Database Setup
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./sql_app.db")

# Handle Render's Postgres URL (it starts with postgres:// but SQLAlchemy requires postgresql://)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# SQLAlchemy Model
class DBSession(Base):
    __tablename__ = "sessions"

    id = Column(String, primary_key=True, index=True)
    code = Column(Text, default="")
    language = Column(String, default="javascript")
    connected_users = Column(Integer, default=0)

# Create tables
Base.metadata.create_all(bind=engine)

# Database Interface
class Database:
    def get_db(self):
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()

    def get_session(self, session_id: str) -> Optional[SessionState]:
        db = SessionLocal()
        try:
            db_session = db.query(DBSession).filter(DBSession.id == session_id).first()
            if db_session:
                return SessionState(
                    code=db_session.code,
                    language=db_session.language, # type: ignore
                    connectedUsers=db_session.connected_users
                )
            return None
        finally:
            db.close()

    def create_session(self, session_id: str, default_code: str, language: SupportedLanguage = 'javascript') -> SessionState:
        db = SessionLocal()
        try:
            db_session = DBSession(
                id=session_id,
                code=default_code,
                language=language,
                connected_users=0
            )
            db.add(db_session)
            db.commit()
            db.refresh(db_session)
            return SessionState(
                code=db_session.code,
                language=db_session.language, # type: ignore
                connectedUsers=db_session.connected_users
            )
        finally:
            db.close()

    def update_session(self, session_id: str, code: Optional[str] = None, language: Optional[SupportedLanguage] = None) -> Optional[SessionState]:
        db = SessionLocal()
        try:
            db_session = db.query(DBSession).filter(DBSession.id == session_id).first()
            if not db_session:
                return None
            
            if code is not None:
                db_session.code = code
            if language is not None:
                db_session.language = language
            
            db.commit()
            db.refresh(db_session)
            
            return SessionState(
                code=db_session.code,
                language=db_session.language, # type: ignore
                connectedUsers=db_session.connected_users
            )
        finally:
            db.close()

    def delete_session(self, session_id: str) -> bool:
        db = SessionLocal()
        try:
            db_session = db.query(DBSession).filter(DBSession.id == session_id).first()
            if db_session:
                db.delete(db_session)
                db.commit()
                return True
            return False
        finally:
            db.close()

# Singleton instance
db = Database()
