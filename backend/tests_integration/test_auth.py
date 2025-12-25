from fastapi.testclient import TestClient
import pytest
from ..main import app, db
from ..database import Base, engine

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield

def test_signup_login_flow():
    # 1. Signup
    signup_data = {
        "email": "test@example.com",
        "full_name": "Test User",
        "password": "password123"
    }
    response = client.post("/auth/signup", json=signup_data)
    assert response.status_code == 200
    assert response.json()["email"] == signup_data["email"]

    # 2. Login
    login_data = {
        "email": "test@example.com",
        "password": "password123"
    }
    response = client.post("/auth/login", json=login_data)
    assert response.status_code == 200
    token = response.json()["access_token"]
    assert token is not None

    # 3. Get Me
    response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["full_name"] == "Test User"

def test_login_invalid_credentials():
    login_data = {
        "email": "wrong@example.com",
        "password": "wrongpassword"
    }
    response = client.post("/auth/login", json=login_data)
    assert response.status_code == 401
