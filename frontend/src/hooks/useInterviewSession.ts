import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SupportedLanguage, DEFAULT_CODE } from '@/types/interview';

interface SessionState {
  code: string;
  language: SupportedLanguage;
  connectedUsers: number;
}

const API_Base = 'http://127.0.0.1:8000';

export const useInterviewSession = (sessionId: string) => {
  const queryClient = useQueryClient();
  const userIdRef = useRef<string>(Math.random().toString(36).substring(7));

  // Local state for optimistic UI and to prevent flickers during polling
  const [localCode, setLocalCode] = useState<string | null>(null);
  const [localLanguage, setLocalLanguage] = useState<SupportedLanguage | null>(null);

  // Fetch session state from backend
  const { data: session, isLoading, isError } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: async (): Promise<SessionState> => {
      const response = await fetch(`${API_Base}/sessions/${sessionId}`);
      if (!response.ok) throw new Error('Failed to fetch session');
      return response.json();
    },
    refetchInterval: 2000,
  });

  // Mutation for updating session
  const updateSessionMutation = useMutation({
    mutationFn: async (update: Partial<SessionState>) => {
      const response = await fetch(`${API_Base}/sessions/${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update),
      });
      if (!response.ok) throw new Error('Failed to update');
      return response.json();
    },
    onSuccess: (updatedSession) => {
      queryClient.setQueryData(['session', sessionId], updatedSession);
    },
  });

  const updateCode = (newCode: string) => {
    setLocalCode(newCode); // Update UI immediately
    updateSessionMutation.mutate({ code: newCode });
  };

  const updateLanguage = (newLanguage: SupportedLanguage) => {
    const defaultCode = DEFAULT_CODE[newLanguage];
    setLocalLanguage(newLanguage); // Update UI immediately
    setLocalCode(defaultCode);
    updateSessionMutation.mutate({
      language: newLanguage,
      code: defaultCode
    });
  };

  // Determine which values to show
  const code = localCode !== null ? localCode : (session?.code || DEFAULT_CODE.javascript);
  const language = localLanguage !== null ? localLanguage : (session?.language || 'javascript');

  return {
    code,
    language,
    connectedUsers: session?.connectedUsers || 0,
    isConnected: !isLoading && !isError,
    updateCode,
    updateLanguage,
    userId: userIdRef.current,
  };
};
