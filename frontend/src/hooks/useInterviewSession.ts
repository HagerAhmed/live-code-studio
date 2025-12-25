import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SupportedLanguage, DEFAULT_CODE } from '@/types/interview';

interface SessionState {
  code: string;
  language: SupportedLanguage;
  connectedUsers: number;
}

const API_Base = 'http://localhost:8000';

export const useInterviewSession = (sessionId: string) => {
  const queryClient = useQueryClient();
  const userIdRef = useRef<string>(Math.random().toString(36).substring(7));

  // Fetch session state from backend
  const { data: session, isLoading, isError } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: async (): Promise<SessionState> => {
      const response = await fetch(`${API_Base}/sessions/${sessionId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch session');
      }
      return response.json();
    },
    // Poll every 2 seconds to simulate real-time
    refetchInterval: 2000,
  });

  // Mutation for updating session
  const updateSessionMutation = useMutation({
    mutationFn: async (update: Partial<SessionState>) => {
      const response = await fetch(`${API_Base}/sessions/${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(update),
      });
      if (!response.ok) {
        throw new Error('Failed to update session');
      }
      return response.json();
    },
    onSuccess: (updatedSession) => {
      // Optimistically update cache or just invalidate
      queryClient.setQueryData(['session', sessionId], updatedSession);
    },
  });

  const updateCode = (newCode: string) => {
    // Debouncing could be added here to avoid spamming the server
    updateSessionMutation.mutate({ code: newCode });
  };

  const updateLanguage = (newLanguage: SupportedLanguage) => {
    // When changing language, we might want to reset code to default if needed
    // or keep it. The backend currently trusts the payload.
    // Let's send the default code for the new language too, matching previous logic.
    updateSessionMutation.mutate({
      language: newLanguage,
      code: DEFAULT_CODE[newLanguage]
    });
  };

  // Fallback state while loading or on error
  const currentState: SessionState = session || {
    code: DEFAULT_CODE.javascript,
    language: 'javascript',
    connectedUsers: 0,
  };

  return {
    code: currentState.code,
    language: currentState.language,
    connectedUsers: currentState.connectedUsers,
    isConnected: !isLoading && !isError,
    updateCode,
    updateLanguage,
    userId: userIdRef.current,
  };
};
