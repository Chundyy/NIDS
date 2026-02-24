from fastapi import APIRouter
from db import get_connection

router = APIRouter()

@router.get("/")
def get_cases():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT id, title, status, priority, description, analyst_assigned, created_at, updated_at
        FROM cases 
        ORDER BY created_at DESC;
    """)
    rows = cur.fetchall()
    conn.close()

    cases = []
    for row in rows:
        cases.append({
            "id": row[0],
            "title": row[1],
            "status": row[2],
            "priority": row[3],
            "description": row[4],
            "analyst_assigned": row[5],
            "created_at": row[6].isoformat() if row[6] else None,
            "updated_at": row[7].isoformat() if row[7] else None
        })
    return cases
