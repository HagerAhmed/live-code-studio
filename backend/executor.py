import subprocess
import sys
import tempfile
import os
import uuid
import time
from pathlib import Path
from .models import ExecutionResult

def run_command(command, error_msg="Error detected", timeout=5):
    try:
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=timeout,
            shell=True 
        )
        return result
    except subprocess.TimeoutExpired:
        raise TimeoutError("Execution timed out (5s limit)")

def execute_code(code: str, language: str) -> ExecutionResult:
    start_time = time.time()
    
    # Create a unique temporary directory for this execution
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        output = ""
        success = False
        error = None

        try:
            # Write code to a temporary file
            file_extension = {
                "python": "py",
                "javascript": "js",
                "typescript": "ts",
            }.get(language, "txt")

            file_path = temp_path / f"script.{file_extension}"
            file_path.write_text(code)

            result = None
            if language == "python":
                # Run python code
                cmd = [sys.executable, str(file_path)]
                result = subprocess.run(cmd, capture_output=True, text=True, timeout=5)
            elif language == "javascript":
                # Run node.js
                cmd = ["node", str(file_path)]
                result = subprocess.run(cmd, capture_output=True, text=True, timeout=5)
            elif language == "typescript":
                # Run ts-node
                cmd = ["npx", "ts-node", str(file_path)]
                result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
            else:
                return ExecutionResult(
                    success=False,
                    output="",
                    error=f"Language {language} is not supported for backend execution.",
                    executionTime=0
                )

            execution_time = (time.time() - start_time) * 1000
            return ExecutionResult(
                success=result.returncode == 0,
                output=result.stdout,
                error=result.stderr if result.returncode != 0 else None,
                executionTime=execution_time
            )

        except subprocess.TimeoutExpired:
            return ExecutionResult(
                success=False,
                output="",
                error="Execution timed out (5s limit)",
                executionTime=5000
            )
        except Exception as e:
            return ExecutionResult(
                success=False,
                output="",
                error=str(e),
                executionTime=(time.time() - start_time) * 1000
            )

