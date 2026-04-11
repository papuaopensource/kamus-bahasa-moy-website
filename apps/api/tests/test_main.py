from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_root_endpoint():
    """
    Test root endpoint
    """
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Kamus Bahasa Moy API is running"}


def test_health_check():
    """
    Test healthcheck endpoint
    """
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert "database_status" in response.json()
