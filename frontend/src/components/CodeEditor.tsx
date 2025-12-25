import { useCallback, memo } from 'react';
import Editor, { OnChange } from '@monaco-editor/react';
import { SupportedLanguage } from '@/types/interview';

interface CodeEditorProps {
  code: string;
  language: SupportedLanguage;
  onChange: (code: string) => void;
  readOnly?: boolean;
}

const monacoLanguageMap: Record<SupportedLanguage, string> = {
  javascript: 'javascript',
  typescript: 'typescript',
  python: 'python',
};

const CodeEditor = memo(({ code, language, onChange, readOnly = false }: CodeEditorProps) => {
  const handleChange: OnChange = useCallback((value) => {
    if (value !== undefined) {
      onChange(value);
    }
  }, [onChange]);

  return (
    <div className="h-full w-full rounded-lg overflow-hidden border border-border">
      <Editor
        height="100%"
        language={monacoLanguageMap[language]}
        value={code}
        onChange={handleChange}
        theme="vs-dark"
        options={{
          readOnly,
          fontSize: 14,
          fontFamily: "'JetBrains Mono', monospace",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          lineNumbers: 'on',
          renderLineHighlight: 'line',
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          tabSize: 2,
          wordWrap: 'on',
          automaticLayout: true,
          padding: { top: 16, bottom: 16 },
          scrollbar: {
            vertical: 'auto',
            horizontal: 'auto',
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
        }}
        loading={
          <div className="flex items-center justify-center h-full bg-editor-bg">
            <div className="text-muted-foreground animate-pulse">Loading editor...</div>
          </div>
        }
      />
    </div>
  );
});

CodeEditor.displayName = 'CodeEditor';

export default CodeEditor;
