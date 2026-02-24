from fastapi import APIRouter
from db import get_connection

router = APIRouter()

@router.get("/")
def get_hosts():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT id, hostname, ip_address, os, status, risk_level, last_seen, alerts_count, created_at, updated_at
        FROM hosts 
        ORDER BY hostname ASC;
    """)
    rows = cur.fetchall()
    conn.close()

    hosts = []
    for row in rows:
        hosts.append({
            "id": row[0],
            "hostname": row[1],
            "ip_address": row[2],
            "os": row[3],
            "status": row[4],
            "risk_level": row[5],
            "last_seen": row[6].isoformat() if row[6] else None,
            "alerts_count": row[7],
            "created_at": row[8].isoformat() if row[8] else None,
            "updated_at": row[9].isoformat() if row[9] else None
        })
    return hosts
