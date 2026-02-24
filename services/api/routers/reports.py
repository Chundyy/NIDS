from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from db import get_connection
from datetime import datetime, date
from pydantic import BaseModel
from typing import Optional
import os
import json

router = APIRouter()

class GenerateReportRequest(BaseModel):
    report_date: Optional[str] = None

@router.get("/")
def get_daily_reports():
    """List all daily reports"""
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT id, report_date, total_threats, critical_count, high_count, medium_count, low_count, 
               summary, file_path, generated_by, created_at, updated_at
        FROM daily_reports 
        ORDER BY report_date DESC;
    """)
    rows = cur.fetchall()
    conn.close()

    reports = []
    for row in rows:
        reports.append({
            "id": row[0],
            "report_date": row[1].isoformat() if row[1] else None,
            "total_threats": row[2],
            "critical_count": row[3],
            "high_count": row[4],
            "medium_count": row[5],
            "low_count": row[6],
            "summary": row[7],
            "file_path": row[8],
            "generated_by": row[9],
            "created_at": row[10].isoformat() if row[10] else None,
            "updated_at": row[11].isoformat() if row[11] else None
        })
    return reports


@router.post("/generate")
def generate_daily_report(request: GenerateReportRequest = GenerateReportRequest()):
    """Generate a daily report for a specific date (or today if not specified)"""
    try:
        if request.report_date:
            target_date = datetime.fromisoformat(request.report_date).date()
        else:
            target_date = date.today()
        
        conn = get_connection()
        cur = conn.cursor()
        
        # Get malware reports for the day
        cur.execute("""
            SELECT COUNT(*), 
                   SUM(CASE WHEN severity = 'CRITICAL' THEN 1 ELSE 0 END),
                   SUM(CASE WHEN severity = 'HIGH' THEN 1 ELSE 0 END),
                   SUM(CASE WHEN severity = 'MEDIUM' THEN 1 ELSE 0 END),
                   SUM(CASE WHEN severity = 'LOW' THEN 1 ELSE 0 END)
            FROM malware_reports 
            WHERE DATE(detected_at) = %s
        """, (target_date,))
        
        result = cur.fetchone()
        total_threats = result[0] or 0
        critical_count = result[1] or 0
        high_count = result[2] or 0
        medium_count = result[3] or 0
        low_count = result[4] or 0
        
        summary = f"Daily malware analysis report: {total_threats} threats detected including {critical_count} critical. " \
                 f"High: {high_count}, Medium: {medium_count}, Low: {low_count}."
        
        # Insert or update report
        cur.execute("""
            INSERT INTO daily_reports (report_date, total_threats, critical_count, high_count, medium_count, low_count, summary, generated_by)
            VALUES (%s, %s, %s, %s, %s, %s, %s, 'System')
            ON CONFLICT (report_date) DO UPDATE SET
                total_threats = EXCLUDED.total_threats,
                critical_count = EXCLUDED.critical_count,
                high_count = EXCLUDED.high_count,
                medium_count = EXCLUDED.medium_count,
                low_count = EXCLUDED.low_count,
                summary = EXCLUDED.summary,
                updated_at = CURRENT_TIMESTAMP
            RETURNING id
        """, (target_date, total_threats, critical_count, high_count, medium_count, low_count, summary))
        
        report_id = cur.fetchone()[0]
        conn.commit()
        conn.close()
        
        return {
            "id": report_id,
            "report_date": target_date.isoformat(),
            "total_threats": total_threats,
            "critical_count": critical_count,
            "high_count": high_count,
            "medium_count": medium_count,
            "low_count": low_count,
            "summary": summary,
            "message": "Report generated successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{report_id}/download")
def download_report(report_id: int):
    """Download a report as JSON"""
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT id, report_date, total_threats, critical_count, high_count, medium_count, low_count, 
                   summary, file_path, generated_by, created_at
            FROM daily_reports 
            WHERE id = %s
        """, (report_id,))
        
        row = cur.fetchone()
        conn.close()
        
        if not row:
            raise HTTPException(status_code=404, detail="Report not found")
        
        # Create JSON report
        report_data = {
            "id": row[0],
            "report_date": row[1].isoformat() if row[1] else None,
            "total_threats": row[2],
            "critical_count": row[3],
            "high_count": row[4],
            "medium_count": row[5],
            "low_count": row[6],
            "summary": row[7],
            "generated_by": row[9],
            "generated_at": row[10].isoformat() if row[10] else None
        }
        
        filename = f"malware_report_{row[1]}.json"
        content = json.dumps(report_data, indent=2)
        
        return Response(
            content=content,
            media_type="application/json",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"'
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
