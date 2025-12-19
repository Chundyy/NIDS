from fastapi import APIRouter
from db import get_connection
import json

router = APIRouter()

@router.get("/")
def list_scans():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, scan_type, target, status, results FROM scans;")
    rows = cur.fetchall()
    conn.close()

    scans = []
    for row in rows:
        scans.append({
            "id": row[0],
            "scan_type": row[1],
            "target": row[2],
            "status": row[3],
            "results": row[4]
        })
    return scans
