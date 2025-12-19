import requests

BASE_URL = "http://localhost:8000"

def test_search():
    r = requests.get(f"{BASE_URL}/alerts/search", params={"q": "scan"})
    assert r.status_code == 200
    data = r.json()
    assert len(data) >= 1
    assert "scan" in data[0]["description"].lower()

if __name__ == "__main__":
    test_search()
    print("Teste de pesquisa full-text OK")
