export interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
}

export const executeCode = async (code: string, language: string): Promise<ExecutionResult> => {
  const startTime = performance.now();

  // JavaScript/TypeScript: Execute in browser
  if (language === 'javascript' || language === 'typescript') {
    try {
      // Capture console.log outputs
      const logs: string[] = [];
      const originalLog = console.log;
      const originalError = console.error;
      const originalWarn = console.warn;

      console.log = (...args) => {
        logs.push(args.map(arg =>
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '));
      };
      console.error = (...args) => {
        logs.push(`[ERROR] ${args.map(arg =>
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ')}`);
      };
      console.warn = (...args) => {
        logs.push(`[WARN] ${args.map(arg =>
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ')}`);
      };

      // Create a sandboxed execution environment
      const sandbox = new Function(`
        'use strict';
        ${code}
      `);

      // Execute with timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Execution timed out (5s limit)')), 5000);
      });

      const executionPromise = new Promise<void>((resolve, reject) => {
        try {
          sandbox();
          resolve();
        } catch (e) {
          reject(e);
        }
      });

      await Promise.race([executionPromise, timeoutPromise]);

      // Restore console
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;

      const endTime = performance.now();

      return {
        success: true,
        output: logs.join('\n') || 'Code executed successfully (no output)',
        executionTime: Math.round(endTime - startTime),
      };
    } catch (error) {
      const endTime = performance.now();
      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        executionTime: Math.round(endTime - startTime),
      };
    }
  }

  // Other languages: Call backend API
  try {
    const response = await fetch('http://localhost:8000/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, language }),
    });

    if (!response.ok) {
      // If backend returns a structured error, try to use it
      const result = await response.json().catch(() => null);
      throw new Error(result?.error || `Execution failed with status: ${response.status}`);
    }

    const result = await response.json();
    return {
      success: result.success,
      output: result.output,
      error: result.error,
      executionTime: result.executionTime,
    };
  } catch (error) {
    const endTime = performance.now();
    return {
      success: false,
      output: '',
      error: `Backend connection failed: ${error instanceof Error ? error.message : 'Unknown error'}. Ensure the backend is running on port 8000.`,
      executionTime: Math.round(endTime - startTime),
    };
  }
};
