# Live Code Studio - Backend

This is the backend API for Live Code Studio, built with **Python 3.12+** and **FastAPI**. It handles session management for collaborative coding and executing code snippets.

## Features

*   **REST API**: Endpoints for session retrieval and updates.
*   **Code Execution**: Supports running Python and JavaScript (Node.js) code.
*   **Typed Validation**: Uses Pydantic models for request/response validation.

## Prerequisites

*   **Python**: Version 3.12 or higher.
*   **uv**: A fast Python package manager. Install it via `pip install uv` or see [uv docs](https://docs.astral.sh/uv/).
*   **Node.js**: Required if you want to execute JavaScript/TypeScript code via the backend.

## Installation

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```

2.  Install dependencies (automatically creates a virtual environment):
    ```bash
    uv sync
    ```

## Running the Server

Start the server from the **root directory** of the repository (parent of `backend/`):

```bash
# From /path/live-code-studio
uv run uvicorn backend.main:app --reload --port 8000
```

The API will be available at [http://localhost:8000](http://localhost:8000).
Interactive API documentation is available at [http://localhost:8000/docs](http://localhost:8000/docs).

## Running Tests

Integration tests are located in `tests/` and use `pytest`.

To run all tests:

```bash
uv run pytest
```

## API Endpoints

*   `GET /sessions/{session_id}`: Get session state.
*   `POST /sessions/{session_id}`: Update session state (code/language).
*   `POST /execute`: Execute code.

## Development

*   **Framework**: FastAPI
*   **Testing**: Pytest + TestClient
*   **Dependency Management**: uv
