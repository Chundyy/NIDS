from fastapi import APIRouter
from db import get_connection
from pydantic import BaseModel
import hashlib

router = APIRouter()

class Login(BaseModel):
    username: str
    password: str

@router.post("/login")
def login(data: Login):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT password_hash FROM users WHERE username=%s;", (data.username,))
    row = cur.fetchone()
    conn.close()

    if row is None:
        return {"error": "User not found"}

    hashed = hashlib.sha256(data.password.encode()).hexdigest()

    if hashed == row[0]:
        return {"status": "ok"}
    else:
        return {"error": "Invalid credentials"}
