# Live Code Studio - Backend

This is the backend API for Live Code Studio, built with **Python 3.12+** and **FastAPI**.

## Core Responsibilities

1.  **Session Management**: Syncs code state between users.
2.  **Static Serving**: Serves the compiled Frontend React app in production.
3.  **Execution (Legacy/Fallback)**: Minimal `subprocess` support for script languages (mostly handled by Frontend/WASM now).

## Prerequisites

*   **Python**: 3.12+
*   **uv**: Package manager (`pip install uv`)

## Running Locally

```bash
# From project root
uv run uvicorn backend.main:app --reload --port 8000
```

## Running Tests

```bash
uv run pytest
```

## API Endpoints

*   `GET /health`: Health check (and production root `/` serves Frontend).
*   `GET/POST /sessions/{id}`: Session state management.
*   `POST /execute`: (Legacy) Backend execution endpoint.
