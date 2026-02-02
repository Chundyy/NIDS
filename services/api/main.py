from fastapi import FastAPI
from routers import alerts, scans, malware, auth, rules
from ml.engine import IDSPredictor
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="IDS API",
    version="1.0.0",
    redirect_slashes=False
)
try:
    app.state.ml_engine = IDSPredictor()
    print("ML Engine pronto.")
except Exception as e:
    print(f"Falha ao carregar ML Engine: {e}")
    app.state.ml_engine = None

# CORS para permitir o frontend em desenvolvimento (Vite em localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000",
                   "http://127.0.0.1:3000",
                   "http://192.168.207.181:3000",
                   "http://10.56.109.201/:3000",
		   "*",
    ],
    allow_credentials=False, #Temporario alterar depois pa!!!!
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

@app.get("/")
def health_check():
    return {"status": "online", "ml_loaded": app.state.ml_engine is not None}
