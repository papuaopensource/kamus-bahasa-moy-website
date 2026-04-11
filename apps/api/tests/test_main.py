from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_read_root():
    """
    Test the root endpoint (/)
    """
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Kamus Bahasa Moy API is running"}


def test_health_check():
    """
    Test the health check endpoint (/health)
    """
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert "database_status" in response.json()
