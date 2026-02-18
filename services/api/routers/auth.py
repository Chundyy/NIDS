from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class Login(BaseModel):
    username: str
    password: str

@router.post("/login")
def login(data: Login):
    """
    Simple login endpoint without database.
    Accepts any username and password combination.
    This is a placeholder until database integration is configured.
    """
    if not data.username or not data.password:
        return {"error": "Username and password are required"}
    
    # Accept any valid credentials (temporary solution without database)
    return {
        "status": "ok",
        "username": data.username,
        "role": "Security Analyst"
    }

@router.post("/logout")
def logout():
    """
    Logout endpoint.
    """
    return {"status": "ok", "message": "Logged out successfully"}
