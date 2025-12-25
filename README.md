# Live Code Studio

A real-time collaborative coding interview platform.

## Features

*   **Real-time Collaboration**: Shared interview session state.
*   **WebAssembly Execution**: Secure client-side execution for **Python** (via Pyodide).
*   **Browser-Based Execution**: Secure execution for **JavaScript** and **TypeScript**.
*   **Simplified Stack**: No complex backend compilers required.
*   **Dockerized**: Single container for both Frontend (Static) and Backend (API).

## Supported Languages

*   JavaScript
*   TypeScript
*   Python (WASM)

## Quick Start (Local)

1.  **Run with Docker (Recommended)**:
    ```bash
    docker build -t live-code-studio .
    docker run -p 8000:8000 live-code-studio
    ```
    Open [http://localhost:8000](http://localhost:8000).

2.  **Run Manually (Dev Mode)**:
    ```bash
    npm run dev
    ```
    *   Backend at `http://localhost:8000`
    *   Frontend at `http://localhost:8080`

## Deployment (Render)

This project is configured for one-click deployment on [Render](https://render.com).

1.  **Push to GitHub**.
2.  **Create Blueprint** in Render dashboard.
3.  Connect your repository.
4.  Render will auto-detect `render.yaml` and deploy.

## Project Structure

*   `frontend/`: React + Vite + Monaco Editor (TypeScript).
*   `backend/`: FastAPI (Python) for session sync.
*   `Dockerfile`: Multi-stage build for production.
*   `render.yaml`: Render deployment configuration.
