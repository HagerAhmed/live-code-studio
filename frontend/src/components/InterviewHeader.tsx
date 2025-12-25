import { Button } from '@/components/ui/button';
import LanguageSelector from './LanguageSelector';
import { SupportedLanguage } from '@/types/interview';
import { Play, Copy, Check, Users, Link2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface InterviewHeaderProps {
  sessionId: string;
  language: SupportedLanguage;
  onLanguageChange: (language: SupportedLanguage) => void;
  onRunCode: () => void;
  isExecuting: boolean;
  connectedUsers: number;
}

const InterviewHeader = ({
  sessionId,
  language,
  onLanguageChange,
  onRunCode,
  isExecuting,
  connectedUsers,
}: InterviewHeaderProps) => {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    const url = `${window.location.origin}/interview/${sessionId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Interview link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border glass">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <span className="text-primary font-bold text-sm">&lt;/&gt;</span>
          </div>
          <span className="font-semibold text-lg">CodeInterview</span>
        </div>
        
        <div className="h-6 w-px bg-border" />
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>{connectedUsers} connected</span>
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <LanguageSelector language={language} onChange={onLanguageChange} />
        
        <Button
          variant="outline"
          size="sm"
          onClick={copyLink}
          className="gap-2"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied
            </>
          ) : (
            <>
              <Link2 className="w-4 h-4" />
              Share Link
            </>
          )}
        </Button>
        
        <Button
          variant="success"
          size="sm"
          onClick={onRunCode}
          disabled={isExecuting || (language !== 'javascript' && language !== 'typescript')}
          className="gap-2"
        >
          <Play className="w-4 h-4" />
          Run Code
        </Button>
      </div>
    </header>
  );
};

export default InterviewHeader;
