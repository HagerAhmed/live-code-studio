import { useState, useEffect, useCallback, useRef } from 'react';
import { SupportedLanguage, DEFAULT_CODE } from '@/types/interview';

interface SessionState {
  code: string;
  language: SupportedLanguage;
  connectedUsers: number;
}

// Simple in-memory store for demo (in production, use Supabase Realtime)
const sessionStore = new Map<string, SessionState>();
const listeners = new Map<string, Set<(state: SessionState) => void>>();

const getOrCreateSession = (sessionId: string): SessionState => {
  if (!sessionStore.has(sessionId)) {
    sessionStore.set(sessionId, {
      code: DEFAULT_CODE.javascript,
      language: 'javascript',
      connectedUsers: 0,
    });
  }
  return sessionStore.get(sessionId)!;
};

const notifyListeners = (sessionId: string) => {
  const state = sessionStore.get(sessionId);
  const sessionListeners = listeners.get(sessionId);
  if (state && sessionListeners) {
    sessionListeners.forEach(listener => listener(state));
  }
};

export const useInterviewSession = (sessionId: string) => {
  const [state, setState] = useState<SessionState>(() => getOrCreateSession(sessionId));
  const [isConnected, setIsConnected] = useState(false);
  const userIdRef = useRef<string>(Math.random().toString(36).substring(7));

  useEffect(() => {
    // Get or create session
    const session = getOrCreateSession(sessionId);
    session.connectedUsers += 1;
    sessionStore.set(sessionId, session);
    setState(session);
    setIsConnected(true);

    // Register listener
    if (!listeners.has(sessionId)) {
      listeners.set(sessionId, new Set());
    }
    const sessionListeners = listeners.get(sessionId)!;
    const listener = (newState: SessionState) => setState(newState);
    sessionListeners.add(listener);

    notifyListeners(sessionId);

    return () => {
      // Cleanup
      sessionListeners.delete(listener);
      const currentSession = sessionStore.get(sessionId);
      if (currentSession) {
        currentSession.connectedUsers = Math.max(0, currentSession.connectedUsers - 1);
        sessionStore.set(sessionId, currentSession);
        notifyListeners(sessionId);
      }
    };
  }, [sessionId]);

  const updateCode = useCallback((newCode: string) => {
    const session = sessionStore.get(sessionId);
    if (session) {
      const updatedSession = { ...session, code: newCode };
      sessionStore.set(sessionId, updatedSession);
      notifyListeners(sessionId);
    }
  }, [sessionId]);

  const updateLanguage = useCallback((newLanguage: SupportedLanguage) => {
    const session = sessionStore.get(sessionId);
    if (session) {
      const updatedSession = {
        ...session,
        language: newLanguage,
        code: DEFAULT_CODE[newLanguage]
      };
      sessionStore.set(sessionId, updatedSession);
      notifyListeners(sessionId);
    }
  }, [sessionId]);

  return {
    code: state.code,
    language: state.language,
    connectedUsers: state.connectedUsers,
    isConnected,
    updateCode,
    updateLanguage,
    userId: userIdRef.current,
  };
};
