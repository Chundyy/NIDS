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
               total_alerts, alerts_critical, alerts_high, alerts_medium, alerts_low,
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
            "total_alerts": row[7],
            "alerts_critical": row[8],
            "alerts_high": row[9],
            "alerts_medium": row[10],
            "alerts_low": row[11],
            "summary": row[12],
            "file_path": row[13],
            "generated_by": row[14],
            "created_at": row[15].isoformat() if row[15] else None,
            "updated_at": row[16].isoformat() if row[16] else None
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
        
        # Get alerts for the day from eventos_rede table
        cur.execute("""
            SELECT COUNT(*), 
                   SUM(CASE WHEN severidade_ml = 4 THEN 1 ELSE 0 END),
                   SUM(CASE WHEN severidade_ml = 3 THEN 1 ELSE 0 END),
                   SUM(CASE WHEN severidade_ml = 2 THEN 1 ELSE 0 END),
                   SUM(CASE WHEN severidade_ml = 1 THEN 1 ELSE 0 END)
            FROM eventos_rede 
            WHERE DATE(created_at) = %s
        """, (target_date,))
        
        alert_result = cur.fetchone()
        total_alerts = alert_result[0] or 0
        alerts_critical = alert_result[1] or 0
        alerts_high = alert_result[2] or 0
        alerts_medium = alert_result[3] or 0
        alerts_low = alert_result[4] or 0
        
        summary = f"Daily security report: {total_threats} malware threats detected (Critical: {critical_count}, High: {high_count}, Medium: {medium_count}, Low: {low_count}). " \
                 f"{total_alerts} network alerts detected (Critical: {alerts_critical}, High: {alerts_high}, Medium: {alerts_medium}, Low: {alerts_low})."
        
        # Insert or update report
        cur.execute("""
            INSERT INTO daily_reports (report_date, total_threats, critical_count, high_count, medium_count, low_count, 
                                      total_alerts, alerts_critical, alerts_high, alerts_medium, alerts_low, summary, generated_by)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'System')
            ON CONFLICT (report_date) DO UPDATE SET
                total_threats = EXCLUDED.total_threats,
                critical_count = EXCLUDED.critical_count,
                high_count = EXCLUDED.high_count,
                medium_count = EXCLUDED.medium_count,
                low_count = EXCLUDED.low_count,
                total_alerts = EXCLUDED.total_alerts,
                alerts_critical = EXCLUDED.alerts_critical,
                alerts_high = EXCLUDED.alerts_high,
                alerts_medium = EXCLUDED.alerts_medium,
                alerts_low = EXCLUDED.alerts_low,
                summary = EXCLUDED.summary,
                updated_at = CURRENT_TIMESTAMP
            RETURNING id
        """, (target_date, total_threats, critical_count, high_count, medium_count, low_count, 
              total_alerts, alerts_critical, alerts_high, alerts_medium, alerts_low, summary))
        
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
            "total_alerts": total_alerts,
            "alerts_critical": alerts_critical,
            "alerts_high": alerts_high,
            "alerts_medium": alerts_medium,
            "alerts_low": alerts_low,
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


@router.get("/{report_id}/html")
def download_report_html(report_id: int):
    """Download a professional HTML report with charts and analysis"""
    try:
        conn = get_connection()
        cur = conn.cursor()
        
        # Get report data
        cur.execute("""
            SELECT id, report_date, total_threats, critical_count, high_count, medium_count, low_count, 
                   total_alerts, alerts_critical, alerts_high, alerts_medium, alerts_low,
                   summary, file_path, generated_by, created_at
            FROM daily_reports 
            WHERE id = %s
        """, (report_id,))
        
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Report not found")
        
        report_date = row[1]
        total_threats = row[2]
        critical_count = row[3]
        high_count = row[4]
        medium_count = row[5]
        low_count = row[6]
        total_alerts = row[7] or 0
        alerts_critical = row[8] or 0
        alerts_high = row[9] or 0
        alerts_medium = row[10] or 0
        alerts_low = row[11] or 0
        summary = row[12]
        generated_at = row[14]
        
        # Get detailed malware list for the day
        cur.execute("""
            SELECT name, type, severity, source_ip, detected_at, description
            FROM malware_reports 
            WHERE DATE(detected_at) = %s
            ORDER BY 
                CASE severity 
                    WHEN 'CRITICAL' THEN 1 
                    WHEN 'HIGH' THEN 2 
                    WHEN 'MEDIUM' THEN 3 
                    ELSE 4 
                END,
                detected_at DESC
            LIMIT 20
        """, (report_date,))
        
        malware_list = cur.fetchall()
        
        # Get detailed alerts list for the day
        cur.execute("""
            SELECT src_ip, dest_ip, porta_destino, protocolo, severidade_ml, confianca_ml, alerta_assinatura, created_at
            FROM eventos_rede 
            WHERE DATE(created_at) = %s
            ORDER BY 
                CASE severidade_ml 
                    WHEN 4 THEN 1 
                    WHEN 3 THEN 2 
                    WHEN 2 THEN 3 
                    ELSE 4 
                END,
                created_at DESC
            LIMIT 20
        """, (report_date,))
        
        alerts_list = cur.fetchall()
        
        # Get trend data (last 7 days)
        cur.execute("""
            SELECT report_date, total_threats, critical_count, high_count, medium_count, low_count,
                   total_alerts, alerts_critical, alerts_high, alerts_medium, alerts_low
            FROM daily_reports 
            WHERE report_date <= %s
            ORDER BY report_date DESC
            LIMIT 7
        """, (report_date,))
        
        trend_data = cur.fetchall()
        conn.close()
        
        # Generate analysis and recommendations
        analysis = generate_analysis(total_threats, critical_count, high_count, medium_count, low_count, trend_data)
        recommendations = generate_recommendations(total_threats, critical_count, high_count, malware_list)
        
        # Build malware table HTML
        malware_rows = ""
        for malware in malware_list:
            severity_class = malware[2].lower() if malware[2] else 'low'
            time_str = malware[4].strftime('%H:%M:%S') if malware[4] and hasattr(malware[4], 'strftime') else str(malware[4]) if malware[4] else 'N/A'
            malware_rows += f"""
                <tr>
                    <td>{malware[0]}</td>
                    <td>{malware[1] or 'Unknown'}</td>
                    <td><span class="severity-badge {severity_class}">{malware[2]}</span></td>
                    <td>{malware[3] or 'N/A'}</td>
                    <td>{time_str}</td>
                </tr>
            """
        
        # Build alerts table HTML
        severity_map = {4: 'CRITICAL', 3: 'HIGH', 2: 'MEDIUM', 1: 'LOW'}
        alerts_rows = ""
        for alert in alerts_list:
            severity_num = alert[4] or 1
            severity_text = severity_map.get(severity_num, 'LOW')
            severity_class = severity_text.lower()
            confidence = alert[5] or 0.0
            alert_time = alert[7].strftime('%H:%M:%S') if alert[7] and hasattr(alert[7], 'strftime') else str(alert[7]) if alert[7] else 'N/A'
            alerts_rows += f"""
                <tr>
                    <td>{alert[0] or 'N/A'}</td>
                    <td>{alert[1] or 'N/A'}</td>
                    <td>{alert[2] or 'N/A'}</td>
                    <td>{alert[3] or 'N/A'}</td>
                    <td><span class="severity-badge {severity_class}">{severity_text}</span></td>
                    <td>{confidence:.1f}%</td>
                    <td>{alert[6][:50] + '...' if alert[6] and len(alert[6]) > 50 else alert[6] or 'N/A'}</td>
                    <td>{alert_time}</td>
                </tr>
            """
        
        # Prepare chart data
        trend_dates = [t[0].strftime('%Y-%m-%d') if hasattr(t[0], 'strftime') else str(t[0]) for t in reversed(trend_data)]
        trend_totals = [t[1] for t in reversed(trend_data)]
        trend_critical = [t[2] for t in reversed(trend_data)]
        trend_high = [t[3] for t in reversed(trend_data)]
        trend_alerts = [t[6] if len(t) > 6 else 0 for t in reversed(trend_data)]
        
        html_content = generate_html_template(
            report_date=report_date.strftime('%Y-%m-%d') if hasattr(report_date, 'strftime') else str(report_date),
            total_threats=total_threats,
            critical_count=critical_count,
            high_count=high_count,
            medium_count=medium_count,
            low_count=low_count,
            total_alerts=total_alerts,
            alerts_critical=alerts_critical,
            alerts_high=alerts_high,
            alerts_medium=alerts_medium,
            alerts_low=alerts_low,
            summary=summary,
            malware_rows=malware_rows,
            alerts_rows=alerts_rows,
            analysis=analysis,
            recommendations=recommendations,
            trend_dates=trend_dates,
            trend_totals=trend_totals,
            trend_critical=trend_critical,
            trend_high=trend_high,
            trend_alerts=trend_alerts,
            generated_at=generated_at.strftime('%Y-%m-%d %H:%M:%S') if generated_at and hasattr(generated_at, 'strftime') else str(generated_at) if generated_at else 'N/A'
        )
        
        filename = f"Security_Report_{report_date.strftime('%Y-%m-%d') if hasattr(report_date, 'strftime') else str(report_date)}.html"
        
        return Response(
            content=html_content,
            media_type="text/html",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"'
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def generate_analysis(total, critical, high, medium, low, trend_data):
    """Generate intelligent analysis based on threat data"""
    analysis = []
    
    # Threat level assessment
    if critical > 0:
        analysis.append(f"<strong>Alto Risco:</strong> {critical} ameaças críticas detectadas que requerem ação imediata.")
    elif high > 5:
        analysis.append(f"<strong>Risco Moderado:</strong> {high} ameaças de alta severidade identificadas.")
    else:
        analysis.append("<strong>Risco Baixo:</strong> Nenhuma ameaça crítica detectada hoje.")
    
    # Trend analysis
    if len(trend_data) >= 2:
        today_threats = trend_data[0][1]
        yesterday_threats = trend_data[1][1]
        diff = today_threats - yesterday_threats
        percent_change = (diff / yesterday_threats * 100) if yesterday_threats > 0 else 0
        
        if diff > 0:
            analysis.append(f"<strong>Tendência:</strong> Aumento de {abs(diff)} ameaças ({percent_change:.1f}%) comparado com ontem.")
        elif diff < 0:
            analysis.append(f"<strong>Tendência:</strong> Redução de {abs(diff)} ameaças ({abs(percent_change):.1f}%) comparado com ontem.")
        else:
            analysis.append("<strong>Tendência:</strong> Nível de ameaças estável.")
    
    # Average calculation
    avg_threats = sum(t[1] for t in trend_data) / len(trend_data) if trend_data else 0
    if total > avg_threats * 1.5:
        analysis.append(f"<strong>Análise Estatística:</strong> Hoje registou {total - avg_threats:.0f} ameaças acima da média semanal ({avg_threats:.0f}).")
    
    return "<br>".join(analysis)


def generate_recommendations(total, critical, high, malware_list):
    """Generate actionable recommendations"""
    recommendations = []
    
    if critical > 0:
        recommendations.append("<strong>Ação Imediata:</strong> Isolar sistemas comprometidos e iniciar análise forense.")
        recommendations.append("Verificar logs de autenticação e acessos não autorizados.")
    
    if high > 3:
        recommendations.append("<strong>Prioridade Alta:</strong> Atualizar definições antivírus em todos os endpoints.")
        recommendations.append("Reforçar regras de firewall e segmentação de rede.")
    
    if total > 10:
        recommendations.append("Conduzir campanha de awareness sobre phishing com colaboradores.")
        recommendations.append("Agendar scan completo de vulnerabilidades nos sistemas críticos.")
    
    # Check for specific threat types
    threat_types = [m[1] for m in malware_list if m[1]]
    if any('Ransomware' in t for t in threat_types):
        recommendations.append("<strong>Ransomware Detectado:</strong> Verificar integridade dos backups imediatamente.")
    
    if any('Trojan' in t for t in threat_types):
        recommendations.append("Forçar reset de passwords em contas com atividade suspeita.")
    
    if not recommendations:
        recommendations.append("Sistema estável. Manter monitorização contínua.")
        recommendations.append("Rever políticas de segurança e access control.")
    
    return "<br>".join(recommendations)


def generate_html_template(report_date, total_threats, critical_count, high_count, medium_count, 
                          low_count, total_alerts, alerts_critical, alerts_high, alerts_medium, alerts_low,
                          summary, malware_rows, alerts_rows, analysis, recommendations,
                          trend_dates, trend_totals, trend_critical, trend_high, trend_alerts, generated_at):
    """Generate professional HTML report template"""
    return f"""
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Segurança - {report_date}</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #1a1a2e;
            color: #333;
            min-height: 100vh;
        }}
        
        .container {{
            min-height: 100vh;
            background: white;
        }}
        
        .header {{
            background: #0f3460;
            color: white;
            padding: 40px;
            text-align: center;
        }}
        
        .header h1 {{
            font-size: 32px;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 2px;
        }}
        
        .header .subtitle {{
            font-size: 18px;
            opacity: 0.9;
        }}
        
        .content {{
            padding: 40px;
        }}
        
        .stats-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }}
        
        .stat-card {{
            background: #16213e;
            padding: 25px;
            border-radius: 8px;
            color: white;
            border: 2px solid #16213e;
        }}
        
        .stat-card.critical {{
            background: #c1121f;
            border-color: #c1121f;
        }}
        
        .stat-card.high {{
            background: #ff6700;
            border-color: #ff6700;
        }}
        
        .stat-card.medium {{
            background: #ffa500;
            border-color: #ffa500;
        }}
        
        .stat-card.low {{
            background: #2d6a4f;
            border-color: #2d6a4f;
        }}
        
        .stat-card h3 {{
            font-size: 14px;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }}
        
        .stat-card .number {{
            font-size: 48px;
            font-weight: bold;
        }}
        
        .section {{
            margin-bottom: 40px;
        }}
        
        .section h2 {{
            font-size: 24px;
            margin-bottom: 20px;
            color: #0f3460;
            border-bottom: 3px solid #0f3460;
            padding-bottom: 10px;
        }}
        
        .analysis-box, .recommendations-box {{
            background: #f8f9fa;
            padding: 25px;
            border-radius: 8px;
            border-left: 4px solid #0f3460;
            line-height: 1.8;
            margin-bottom: 20px;
        }}
        
        .recommendations-box {{
            border-left-color: #2d6a4f;
        }}
        
        .chart-container {{
            margin: 30px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
        }}
        
        .charts-grid {{
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: 30px;
            margin-bottom: 40px;
        }}
        
        table {{
            width: 100%;
            border-collapse: collapse;
            background: white;
            border: 1px solid #dee2e6;
        }}
        
        th {{
            background: #0f3460;
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 12px;
            letter-spacing: 1px;
        }}
        
        td {{
            padding: 15px;
            border-bottom: 1px solid #e9ecef;
        }}
        
        tr:hover {{
            background: #f8f9fa;
        }}
        
        .severity-badge {{
            padding: 5px 12px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
        }}
        
        .severity-badge.critical {{
            background: #c1121f;
            color: white;
        }}
        
        .severity-badge.high {{
            background: #ff6700;
            color: white;
        }}
        
        .severity-badge.medium {{
            background: #ffa500;
            color: white;
        }}
        
        .severity-badge.low {{
            background: #2d6a4f;
            color: white;
        }}
        
        .footer {{
            background: #f8f9fa;
            padding: 30px;
            text-align: center;
            color: #6c757d;
            border-top: 1px solid #dee2e6;
        }}
        
        .footer strong {{
            color: #333;
        }}
        
        @media print {{
            body {{
                background: white;
            }}
            .container {{
                box-shadow: none;
            }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Relatório de Segurança</h1>
            <div class="subtitle">Network Intrusion Detection System</div>
            <div class="subtitle" style="margin-top: 10px; font-size: 16px;">{report_date}</div>
        </div>
        
        <div class="content">
            <!-- Statistics Cards -->
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>Total de Ameaças</h3>
                    <div class="number">{total_threats}</div>
                </div>
                <div class="stat-card critical">
                    <h3>Críticas</h3>
                    <div class="number">{critical_count}</div>
                </div>
                <div class="stat-card high">
                    <h3>Altas</h3>
                    <div class="number">{high_count}</div>
                </div>
                <div class="stat-card medium">
                    <h3>Médias</h3>
                    <div class="number">{medium_count}</div>
                </div>
                <div class="stat-card low">
                    <h3>Baixas</h3>
                    <div class="number">{low_count}</div>
                </div>
                <div class="stat-card" style="background: #1e3a5f;">
                    <h3>Total de Alerts</h3>
                    <div class="number">{total_alerts}</div>
                </div>
                <div class="stat-card critical">
                    <h3>Alerts Críticos</h3>
                    <div class="number">{alerts_critical}</div>
                </div>
                <div class="stat-card high">
                    <h3>Alerts Altos</h3>
                    <div class="number">{alerts_high}</div>
                </div>
                <div class="stat-card medium">
                    <h3>Alerts Médios</h3>
                    <div class="number">{alerts_medium}</div>
                </div>
                <div class="stat-card low">
                    <h3>Alerts Baixos</h3>
                    <div class="number">{alerts_low}</div>
                </div>
            </div>
            
            <!-- Analysis Section -->
            <div class="section">
                <h2>Análise Executiva</h2>
                <div class="analysis-box">
                    {analysis}
                </div>
            </div>
            
            <!-- Recommendations Section -->
            <div class="section">
                <h2>Recomendações</h2>
                <div class="recommendations-box">
                    {recommendations}
                </div>
            </div>
            
            <!-- Charts Section -->
            <div class="section">
                <h2>Visualização de Dados</h2>
                <div class="charts-grid">
                    <div class="chart-container">
                        <canvas id="severityChart"></canvas>
                    </div>
                    <div class="chart-container">
                        <canvas id="trendChart"></canvas>
                    </div>
                </div>
            </div>
            
            <!-- Malware List -->
            <div class="section">
                <h2>Ameaças Detectadas (Top 20)</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Tipo</th>
                            <th>Severidade</th>
                            <th>IP Origem</th>
                            <th>Hora</th>
                        </tr>
                    </thead>
                    <tbody>
                        {malware_rows if malware_rows else '<tr><td colspan="5" style="text-align:center;">Nenhuma ameaça detectada</td></tr>'}
                    </tbody>
                </table>
            </div>
            
            <!-- Alerts List -->
            <div class="section">
                <h2>Alerts da Rede Detectados (Top 20)</h2>
                <table>
                    <thead>
                        <tr>
                            <th>IP Origem</th>
                            <th>IP Destino</th>
                            <th>Porta</th>
                            <th>Protocolo</th>
                            <th>Severidade</th>
                            <th>Confiança</th>
                            <th>Assinatura</th>
                            <th>Hora</th>
                        </tr>
                    </thead>
                    <tbody>
                        {alerts_rows if alerts_rows else '<tr><td colspan="8" style="text-align:center;">Nenhum alert detectado</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>
        
        <div class="footer">
            <strong>Network Intrusion Detection System (NIDS)</strong><br>
            Relatório gerado automaticamente em <strong>{generated_at}</strong><br>
            <em>Este documento é confidencial e destinado apenas para uso interno</em>
        </div>
    </div>
    
    <script>
        // Severity Distribution Pie Chart
        const severityCtx = document.getElementById('severityChart').getContext('2d');
        new Chart(severityCtx, {{
            type: 'doughnut',
            data: {{
                labels: ['Críticas', 'Altas', 'Médias', 'Baixas'],
                datasets: [{{
                    data: [{critical_count}, {high_count}, {medium_count}, {low_count}],
                    backgroundColor: [
                        '#c1121f',
                        '#ff6700',
                        '#ffa500',
                        '#2d6a4f'
                    ],
                    borderWidth: 0
                }}]
            }},
            options: {{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {{
                    legend: {{
                        position: 'bottom'
                    }},
                    title: {{
                        display: true,
                        text: 'Distribuição por Severidade',
                        font: {{
                            size: 14,
                            weight: 'bold'
                        }}
                    }}
                }}
            }}
        }});
        
        // Trend Line Chart
        const trendCtx = document.getElementById('trendChart').getContext('2d');
        new Chart(trendCtx, {{
            type: 'line',
            data: {{
                labels: {trend_dates},
                datasets: [
                    {{
                        label: 'Total',
                        data: {trend_totals},
                        borderColor: '#0f3460',
                        backgroundColor: '#0f3460',
                        tension: 0.4,
                        fill: false,
                        borderWidth: 3
                    }},
                    {{
                        label: 'Críticas',
                        data: {trend_critical},
                        borderColor: '#c1121f',
                        backgroundColor: '#c1121f',
                        tension: 0.4,
                        fill: false,
                        borderWidth: 2
                    }},
                    {{
                        label: 'Altas',
                        data: {trend_high},
                        borderColor: '#ff6700',
                        backgroundColor: '#ff6700',
                        tension: 0.4,
                        fill: false,
                        borderWidth: 2
                    }},
                    {{
                        label: 'Alerts (Total)',
                        data: {trend_alerts},
                        borderColor: '#7209b7',
                        backgroundColor: '#7209b7',
                        tension: 0.4,
                        fill: false,
                        borderWidth: 2,
                        borderDash: [5, 5]
                    }}
                ]
            }},
            options: {{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {{
                    legend: {{
                        position: 'bottom'
                    }},
                    title: {{
                        display: true,
                        text: 'Tendência (Últimos 7 Dias)',
                        font: {{
                            size: 14,
                            weight: 'bold'
                        }}
                    }}
                }},
                scales: {{
                    y: {{
                        beginAtZero: true,
                        ticks: {{
                            stepSize: 1
                        }}
                    }}
                }}
            }}
        }});
    </script>
</body>
</html>
    """
