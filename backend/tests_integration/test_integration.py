from fastapi.testclient import TestClient
import os
import pytest
from ..main import app
from ..database import Base, engine, SessionLocal

# Ensure we use a test database
TEST_DB_URL = "sqlite:///./test.db"

# Override dependency or setup for tests
# For integration tests, we want to run against a real file-based SQLite to be closest to "real" usage
# but we need to make sure we clean it up.

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    # Create tables
    Base.metadata.create_all(bind=engine)
    yield
    # Cleanup (Optional: Drop tables or delete file)
    Base.metadata.drop_all(bind=engine)
    # if os.path.exists("./sql_app.db"):
    #     os.remove("./sql_app.db")

def test_full_flow_integration():
    """
    Test the full lifecycle of a session using the real SQLite database logic in database.py
    """
    session_id = "integration-test-session"
    
    # 1. Get Session (should create it)
    response = client.get(f"/sessions/{session_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["language"] == "javascript"
    
    # 2. Update Session
    new_code = "print('Integration Test')"
    response = client.post(f"/sessions/{session_id}", json={
        "code": new_code,
        "language": "python"
    })
    assert response.status_code == 200
    
    # 3. Verify Update Persisted
    response = client.get(f"/sessions/{session_id}")
    data = response.json()
    assert data["code"] == new_code
    assert data["language"] == "python"

def test_execute_flow():
    """
    Test execution endpoint integration
    """
    response = client.post("/execute", json={
        "code": "print(1 + 1)",
        "language": "python"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "2" in data["output"]
