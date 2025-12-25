import subprocess
import tempfile
import time
import os
from .models import ExecutionResult

def execute_code(code: str, language: str) -> ExecutionResult:
    start_time = time.time()
    
    try:
        if language == 'python':
            # Safe for extremely simple testing only
            result = subprocess.run(
                ['python', '-c', code],
                capture_output=True,
                text=True,
                timeout=5
            )
            output = result.stdout + result.stderr
            success = result.returncode == 0
            error = None if success else result.stderr

        elif language == 'javascript' or language == 'typescript':
            # Requires Node.js
            result = subprocess.run(
                ['node', '-e', code],
                capture_output=True,
                text=True,
                timeout=5
            )
            output = result.stdout + result.stderr
            success = result.returncode == 0
            error = None if success else result.stderr

        else:
            # Temporary stub for compiled languages or missing runtimes
            return ExecutionResult(
                success=False,
                output="",
                error=f"Execution for {language} is not yet implemented in this environment.",
                executionTime=0
            )

        duration = (time.time() - start_time) * 1000  # ms
        return ExecutionResult(
            success=success,
            output=output.strip(),
            error=error.strip() if error else None,
            executionTime=duration
        )

    except subprocess.TimeoutExpired:
        duration = (time.time() - start_time) * 1000
        return ExecutionResult(
            success=False,
            output="",
            error="Execution timed out (5s limit)",
            executionTime=duration
        )
    except Exception as e:
        duration = (time.time() - start_time) * 1000
        return ExecutionResult(
            success=False,
            output="",
            error=f"Internal Server Error: {str(e)}",
            executionTime=duration
        )
