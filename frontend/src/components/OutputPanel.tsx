import { ExecutionResult } from '@/utils/codeExecutor';
import { CheckCircle, XCircle, Terminal, Clock } from 'lucide-react';

interface OutputPanelProps {
  result: ExecutionResult | null;
  isExecuting: boolean;
}

const OutputPanel = ({ result, isExecuting }: OutputPanelProps) => {
  return (
    <div className="h-full flex flex-col bg-card rounded-lg border border-border overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-secondary/50">
        <Terminal className="w-4 h-4 text-primary" />
        <span className="font-medium text-sm">Output</span>
        {result && (
          <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{result.executionTime}ms</span>
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-auto p-4 font-mono text-sm">
        {isExecuting ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Executing...</span>
          </div>
        ) : result ? (
          <div className="space-y-2">
            {result.success ? (
              <>
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">Success</span>
                </div>
                <pre className="whitespace-pre-wrap text-foreground/90">{result.output}</pre>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-destructive">
                  <XCircle className="w-4 h-4" />
                  <span className="font-medium">Error</span>
                </div>
                <pre className="whitespace-pre-wrap text-destructive/90">{result.error}</pre>
              </>
            )}
          </div>
        ) : (
          <div className="text-muted-foreground">
            Click "Run Code" to execute your solution
          </div>
        )}
      </div>
    </div>
  );
};

export default OutputPanel;
