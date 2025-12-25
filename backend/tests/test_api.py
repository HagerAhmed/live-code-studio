from fastapi.testclient import TestClient
from ..main import app, db

client = TestClient(app)

from ..database import Base, engine

def teardown_function():
    # Drop and recreate tables to ensure a clean state for each test
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "message": "Live Code Studio Backend Running"}

def test_get_session_creates_default():
    session_id = "test-session-1"
    response = client.get(f"/sessions/{session_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["language"] == "javascript"
    assert "Welcome" in data["code"]

def test_update_session():
    session_id = "test-session-2"
    
    # 1. Create/Get initial
    client.get(f"/sessions/{session_id}")
    
    # 2. Update code
    new_code = "console.log('Updated');"
    response = client.post(f"/sessions/{session_id}", json={"code": new_code})
    assert response.status_code == 200
    assert response.json()["code"] == new_code
    
    # 3. Verify get reflects change
    response = client.get(f"/sessions/{session_id}")
    assert response.json()["code"] == new_code

def test_execution_python():
    response = client.post("/execute", json={
        "code": "print('Hello Test')",
        "language": "python"
    })
    assert response.status_code == 200
    data = response.json()
    if not data["success"]:
        print(f"\nExecution failed: {data.get('error')}")
    assert data["success"] is True
    assert "Hello Test" in data["output"]

def test_execute_invalid_input():
    # Missing 'language' field
    response = client.post("/execute", json={
        "code": "print('fail')",
    })
    assert response.status_code == 422
    data = response.json()
    assert data["detail"][0]["type"] == "missing"
    assert data["detail"][0]["loc"] == ["body", "language"]

def test_execution_unsupported():
    response = client.post("/execute", json={
        "code": "fn main() {}",
        "language": "rust" # Now invalid in schema
    })
    # Should be 422 Unprocessable Entity due to Pydantic validation
    assert response.status_code == 422
