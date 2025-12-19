from fastapi import FastAPI
from routers import alerts, scans, malware, auth

app = FastAPI(
    title="IDS API",
    version="1.0.0"
)

# Routers
app.include_router(alerts.router, prefix="/alerts", tags=["Alerts"])
app.include_router(scans.router, prefix="/scans", tags=["Scans"])
app.include_router(malware.router, prefix="/malware", tags=["Malware"])
app.include_router(auth.router, prefix="/auth", tags=["Auth"])

@app.get("/health")
def health():
    return {"status": "ok"}
