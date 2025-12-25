from typing import Optional, Dict
from .models import SessionState, SupportedLanguage

# In-memory store
_store: Dict[str, SessionState] = {}

class MockDatabase:
    def get_session(self, session_id: str) -> Optional[SessionState]:
        return _store.get(session_id)

    def create_session(self, session_id: str, default_code: str, language: SupportedLanguage = 'javascript') -> SessionState:
        session = SessionState(
            code=default_code,
            language=language,
            connectedUsers=0
        )
        _store[session_id] = session
        return session

    def update_session(self, session_id: str, code: Optional[str] = None, language: Optional[SupportedLanguage] = None) -> Optional[SessionState]:
        session = _store.get(session_id)
        if not session:
            return None
        
        if code is not None:
            session.code = code
        if language is not None:
            session.language = language
            # In a real app, we might reset code to default template here if logic dictates,
            # but usually the frontend handles that.
            
        _store[session_id] = session
        return session

    def delete_session(self, session_id: str) -> bool:
        if session_id in _store:
            del _store[session_id]
            return True
        return False

# Singleton instance for now
db = MockDatabase()
