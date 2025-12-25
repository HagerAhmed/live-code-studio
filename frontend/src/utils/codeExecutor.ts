export interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
}

declare global {
  interface Window {
    loadPyodide: (config: { indexURL: string }) => Promise<any>;
    pyodide: any;
  }
}

let pyodideReadyPromise: Promise<any> | null = null;

const getPyodide = async () => {
  if (!pyodideReadyPromise) {
    pyodideReadyPromise = window.loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/"
    });
  }
  return pyodideReadyPromise;
};

export const executeCode = async (code: string, language: string): Promise<ExecutionResult> => {
  const startTime = performance.now();

  try {
    // JavaScript/TypeScript: Execute in browser (Native V8)
    if (language === 'javascript' || language === 'typescript') {
      // Capture console.log
      const logs: string[] = [];
      const originalLog = console.log;
      const originalError = console.error;

      console.log = (...args) => logs.push(args.map(a =>
        typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)
      ).join(' '));

      console.error = (...args) => logs.push(`[Error] ${args.map(a => String(a)).join(' ')}`);

      try {
        // Simple sandbox
        const sandbox = new Function(`"use strict";\n${code}`);
        sandbox();
      } catch (e) {
        throw e;
      } finally {
        console.log = originalLog;
        console.error = originalError;
      }

      return {
        success: true,
        output: logs.join('\n') || 'Code executed successfully (no output)',
        executionTime: Math.round(performance.now() - startTime),
      };
    }

    // Python: Execute in browser (WASM/Pyodide)
    if (language === 'python') {
      const pyodide = await getPyodide();

      // Redirect stdout to capture print statements
      pyodide.runPython(`
import sys
import io
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
      `);

      try {
        await pyodide.runPythonAsync(code);
        const stdout = pyodide.runPython("sys.stdout.getvalue()");
        const stderr = pyodide.runPython("sys.stderr.getvalue()");

        return {
          success: true,
          output: (stdout + stderr).trim() || 'Code executed successfully (no output)',
          executionTime: Math.round(performance.now() - startTime),
        };
      } catch (err: any) {
        return {
          success: false,
          output: '',
          error: String(err),
          executionTime: Math.round(performance.now() - startTime),
        };
      }
    }

    // Fallback for unexpected inputs
    return {
      success: false,
      output: '',
      error: `Unsupported language: ${language}`,
      executionTime: 0
    };

  } catch (error) {
    return {
      success: false,
      output: '',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      executionTime: Math.round(performance.now() - startTime),
    };
  }
};

