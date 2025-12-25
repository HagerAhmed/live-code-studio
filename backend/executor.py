import subprocess
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
    # This prevents filename collisions (especially for Java's strict naming)
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        output = ""
        success = False
        error = None

        try:
            if language == 'python':
                # Existing Python logic
                result = run_command(['python', '-c', code])
                output = result.stdout + result.stderr
                success = result.returncode == 0
                error = None if success else result.stderr

            elif language == 'javascript':
                # Existing JS logic using Node
                result = run_command(['node', '-e', code])
                output = result.stdout + result.stderr
                success = result.returncode == 0
                error = None if success else result.stderr

            elif language == 'typescript':
                # Needs ts-node installed: npm install -g ts-node typescript
                # Or we can write to .ts file and run with ts-node
                file_path = temp_path / "script.ts"
                file_path.write_text(code)
                try:
                    # npx ts-node might be safer if not globally installed, but slower
                    # We'll assume ts-node is in path or try npx
                    result = run_command(f'npx -y ts-node "{file_path}"', timeout=10)
                    output = result.stdout + result.stderr
                    success = result.returncode == 0
                    error = None if success else result.stderr
                except Exception as e:
                    error = "TypeScript execution failed. Ensure `ts-node` is available. " + str(e)

            elif language == 'java':
                # Java requires class name to match filename. 
                # We'll search for "public class Name" or assume "Solution"
                # For simplicity, we write to Solution.java and expect user uses "class Solution"
                # If they use "public class Foo", this will fail. 
                # Better: parse class name or just name file Main.java and remove public?
                # Let's enforce standard "Solution" class convention or Main
                file_name = "Solution.java" 
                if "class Main" in code: file_name = "Main.java"
                
                file_path = temp_path / file_name
                file_path.write_text(code)
                
                # Compile
                compile_res = run_command(f'javac "{file_path}"')
                if compile_res.returncode != 0:
                    success = False
                    error = "Compilation Error:\n" + compile_res.stderr
                else:
                    # Run
                    class_name = file_path.stem
                    run_res = run_command(f'java -cp "{temp_path}" {class_name}')
                    output = run_res.stdout + run_res.stderr
                    success = run_res.returncode == 0
                    error = None if success else run_res.stderr

            elif language == 'cpp':
                file_path = temp_path / "solution.cpp"
                exe_path = temp_path / "solution.exe"
                file_path.write_text(code)
                
                # Compile (g++)
                compile_res = run_command(f'g++ "{file_path}" -o "{exe_path}"')
                if compile_res.returncode != 0:
                    success = False
                    error = "Compilation Error:\n" + compile_res.stderr
                else:
                    # Run
                    run_res = run_command(f'"{exe_path}"')
                    output = run_res.stdout + run_res.stderr
                    success = run_res.returncode == 0
                    error = None if success else run_res.stderr
            
            elif language == 'csharp':
                # C# typically requires a project file for `dotnet run`.
                # Simpler: Use `dotnet-script` if available, or write a .cs file and compile with csc (Windows) or mcs.
                # Assuming standard .NET SDK installed. 
                # We will create a full console project temp structure.
                
                # 1. dotnet new console
                run_command(f'dotnet new console -o "{temp_path}" --force')
                
                # 2. Replace Program.cs
                program_cs = temp_path / "Program.cs"
                program_cs.write_text(code)
                
                # 3. dotnet run
                # dotnet run is slow for "live" code but robust
                run_res = run_command(f'dotnet run --project "{temp_path}"', timeout=15)
                output = run_res.stdout + run_res.stderr
                # Dotnet run output includes build info, might want to clean it
                success = run_res.returncode == 0
                error = None if success else run_res.stderr

            elif language == 'go':
                file_path = temp_path / "main.go"
                file_path.write_text(code)
                
                result = run_command(f'go run "{file_path}"')
                output = result.stdout + result.stderr
                success = result.returncode == 0
                error = None if success else result.stderr

            elif language == 'rust':
                file_path = temp_path / "main.rs"
                exe_path = temp_path / "main.exe"
                file_path.write_text(code)
                
                # Compile
                compile_res = run_command(f'rustc "{file_path}" -o "{exe_path}"')
                if compile_res.returncode != 0:
                    success = False
                    error = "Compilation Error:\n" + compile_res.stderr
                else:
                    # Run
                    run_res = run_command(f'"{exe_path}"')
                    output = run_res.stdout + run_res.stderr
                    success = run_res.returncode == 0
                    error = None if success else run_res.stderr

            else:
                return ExecutionResult(
                    success=False,
                    output="",
                    error=f"Language {language} execution logic not implemented.",
                    executionTime=0
                )

        except TimeoutError:
            success = False
            error = "Execution timed out (limit exceeded)"
        except Exception as e:
            success = False
            error = f"Internal Execution Error: {str(e)}"

        duration = (time.time() - start_time) * 1000  # ms
        return ExecutionResult(
            success=success,
            output=output.strip() if output else "",
            error=error.strip() if error else None,
            executionTime=duration
        )
