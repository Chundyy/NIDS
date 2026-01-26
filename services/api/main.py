from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import alerts, scans, malware, auth, rules

app = FastAPI(
    title="IDS API",
    version="1.0.0"
)

# CORS para permitir o frontend em desenvolvimento (Vite em localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(alerts.router, prefix="/alerts", tags=["Alerts"])
app.include_router(scans.router, prefix="/scans", tags=["Scans"])
app.include_router(malware.router, prefix="/malware", tags=["Malware"])
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(rules.router, prefix="/rules", tags=["Rules"])

@app.get("/health")
def health():
    return {"status": "ok"}
