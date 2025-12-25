# Live Code Studio

A real-time collaborative coding interview platform.

## Quick Start

1.  **Install Root Dependencies**:
    ```bash
    npm install
    ```

2.  **Setup Backend**:
    ```bash
    cd backend
    uv sync
    cd ..
    ```

3.  **Setup Frontend**:
    ```bash
    cd frontend
    npm install
    cd ..
    ```

4.  **Run Full Stack**:
    ```bash
    npm run dev
    ```
    This will start:
    *   Backend API at `http://localhost:8000`
    *   Frontend App at `http://localhost:5173` (or similar)

## Structure

*   `backend/`: FastAPI application (Python)
*   `frontend/`: React + Vite application (TypeScript)
