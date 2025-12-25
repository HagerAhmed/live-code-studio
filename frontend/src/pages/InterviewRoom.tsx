import { useState, useCallback } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useInterviewSession } from '@/hooks/useInterviewSession';
import { executeCode, ExecutionResult } from '@/utils/codeExecutor';
import CodeEditor from '@/components/CodeEditor';
import OutputPanel from '@/components/OutputPanel';
import InterviewHeader from '@/components/InterviewHeader';
import { Helmet } from 'react-helmet-async';

const InterviewRoom = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const {
    code,
    language,
    connectedUsers,
    updateCode,
    updateLanguage,
  } = useInterviewSession(sessionId || '');

  const handleRunCode = useCallback(async () => {
    setIsExecuting(true);
    const result = await executeCode(code, language);
    setExecutionResult(result);
    setIsExecuting(false);
  }, [code, language]);

  if (!sessionId) {
    return <Navigate to="/" replace />;
  }

  // Show generic loading or error overlay if strictly needed, 
  // but for now let's just show a toaster or banner if disconnected.
  // Actually, useInterviewSession returns `isConnected`.

  // Identify if we really are disconnected (fetch failed) vs just loading
  // The hook abstracts this into `isConnected`. 
  // Let's add an visual indicator in the UI via the Header or a banner.


  return (
    <>
      <Helmet>
        <title>Interview Session | CodeInterview</title>
        <meta name="description" content="Collaborative coding interview session with real-time code editing and execution." />
      </Helmet>

      <div className="h-screen flex flex-col bg-background">
        <InterviewHeader
          sessionId={sessionId}
          language={language}
          onLanguageChange={updateLanguage}
          onRunCode={handleRunCode}
          isExecuting={isExecuting}
          connectedUsers={connectedUsers}
        />

        <div className="flex-1 flex overflow-hidden">
          {/* Code Editor Panel */}
          <div className="flex-1 p-4 min-w-0">
            <CodeEditor
              code={code}
              language={language}
              onChange={updateCode}
            />
          </div>

          {/* Output Panel */}
          <div className="w-[400px] p-4 pl-0">
            <OutputPanel result={executionResult} isExecuting={isExecuting} />
          </div>
        </div>
      </div>
    </>
  );
};

export default InterviewRoom;
