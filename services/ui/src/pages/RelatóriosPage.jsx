import { useState, useEffect } from "react"
import { getStats } from "../api"

export default function RelatóriosPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const data = await getStats()
      setStats(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const buildMonthlyReportHtml = (data) => {
    const monthLabel = new Date().toLocaleDateString("pt-PT", { month: "long", year: "numeric" })
    const createdAt = new Date().toLocaleString()

    const severityCounts = {
      CRITICAL: data?.by_severity?.CRITICAL || 0,
      HIGH: data?.by_severity?.HIGH || 0,
      MEDIUM: data?.by_severity?.MEDIUM || 0,
      LOW: data?.by_severity?.LOW || 0,
    }

    const totalSeverity = Object.values(severityCounts).reduce((sum, value) => sum + value, 0)
    const maxSeverity = Math.max(...Object.values(severityCounts), 1)

    const percent = (value) => (totalSeverity ? Math.round((value / totalSeverity) * 100) : 0)
    const severityOrder = ["CRITICAL", "HIGH", "MEDIUM", "LOW"]

    const severityBreakdownRows = severityOrder
      .map((sev) => {
        const value = severityCounts[sev]
        const width = ((value / maxSeverity) * 100).toFixed(1)
        return `
          <div class="bar-row">
            <span class="bar-label">${sev}</span>
            <div class="bar-track">
              <div class="bar-fill ${sev.toLowerCase()}" style="width:${width}%"></div>
            </div>
            <span class="bar-value">${value}</span>
          </div>
        `
      })
      .join("")

    const pieSegments = (() => {
      const c = percent(severityCounts.CRITICAL)
      const h = percent(severityCounts.HIGH)
      const m = percent(severityCounts.MEDIUM)
      const l = Math.max(0, 100 - c - h - m)
      const cEnd = c
      const hEnd = c + h
      const mEnd = c + h + m
      return `conic-gradient(#ef4444 0 ${cEnd}%, #f59e0b ${cEnd}% ${hEnd}%, #8b5cf6 ${hEnd}% ${mEnd}%, #10b981 ${mEnd}% 100%)`
    })()

    const topSourceRows = (data?.top_source_ips || [])
      .map((item) => `<tr><td>${item.ip}</td><td>${item.count}</td></tr>`)
      .join("")
    const topDestinationRows = (data?.top_destination_ips || [])
      .map((item) => `<tr><td>${item.ip}</td><td>${item.count}</td></tr>`)
      .join("")

    const highestSeverity = severityOrder
      .map((sev) => ({ sev, value: severityCounts[sev] }))
      .sort((a, b) => b.value - a.value)[0]

    const highestSeverityText = highestSeverity?.value
      ? `A severidade mais comum foi ${highestSeverity.sev}, com ${highestSeverity.value} alertas.`
      : "Não existem dados suficientes para identificar a severidade predominante."

    return `<!doctype html>
<html lang="pt">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Relatório Mensal - ${monthLabel}</title>
    <style>
      body { font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial; background:#f8fafc; color:#0b1220; margin:0; padding:32px; }
      .container { max-width: 980px; margin:0 auto; background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:28px; }
      h1 { margin:0; font-size:24px; }
      h2 { margin:24px 0 12px 0; font-size:18px; }
      p { color:#334155; line-height:1.6; }
      .meta { color:#64748b; font-size:12px; margin-top:6px; }
      .summary { display:grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap:12px; margin-top:18px; }
      .summary-card { background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:16px; }
      .summary-card .label { font-size:12px; color:#64748b; text-transform:uppercase; letter-spacing:0.6px; }
      .summary-card .value { font-size:20px; font-weight:700; margin-top:6px; }
      .charts { display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:18px; margin-top:12px; }
      .chart-card { border:1px solid #e2e8f0; border-radius:12px; padding:16px; }
      .chart-title { font-size:14px; font-weight:600; margin-bottom:10px; }
      .pie { width:180px; height:180px; border-radius:50%; background:${pieSegments}; margin:0 auto; }
      .legend { margin-top:12px; display:grid; gap:6px; font-size:13px; }
      .legend-item { display:flex; align-items:center; gap:8px; }
      .dot { width:10px; height:10px; border-radius:50%; display:inline-block; }
      .dot.critical { background:#ef4444; }
      .dot.high { background:#f59e0b; }
      .dot.medium { background:#8b5cf6; }
      .dot.low { background:#10b981; }
      .bar-row { display:flex; align-items:center; gap:10px; font-size:13px; margin-bottom:8px; }
      .bar-label { width:72px; color:#475569; font-weight:600; }
      .bar-track { flex:1; height:10px; background:#e2e8f0; border-radius:999px; overflow:hidden; }
      .bar-fill { height:100%; border-radius:999px; }
      .bar-fill.critical { background:#ef4444; }
      .bar-fill.high { background:#f59e0b; }
      .bar-fill.medium { background:#8b5cf6; }
      .bar-fill.low { background:#10b981; }
      .bar-value { width:40px; text-align:right; color:#0b1220; font-weight:600; }
      table { width:100%; border-collapse:collapse; font-size:13px; }
      th, td { padding:10px 12px; border:1px solid #e2e8f0; text-align:left; }
      th { background:#f8fafc; font-weight:600; }
      .tables { display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:18px; }
      .note { background:#f1f5f9; border-left:4px solid #4a9aff; padding:12px; border-radius:8px; }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Relatório Mensal de Segurança</h1>
      <div class="meta">Período: ${monthLabel} • Gerado em ${createdAt}</div>

      <div class="summary">
        <div class="summary-card">
          <div class="label">Total de alertas</div>
          <div class="value">${data?.total_alerts || 0}</div>
        </div>
        <div class="summary-card">
          <div class="label">Alertas críticos</div>
          <div class="value">${severityCounts.CRITICAL}</div>
        </div>
        <div class="summary-card">
          <div class="label">IP de origem mais frequente</div>
          <div class="value">${data?.top_source_ips?.[0]?.ip || "N/A"}</div>
        </div>
      </div>

      <h2>Distribuição por Severidade</h2>
      <p>O gráfico apresenta a distribuição dos alertas por severidade, destacando a proporção de ocorrências em cada categoria.</p>
      <div class="charts">
        <div class="chart-card">
          <div class="chart-title">Gráfico de rosca</div>
          <div class="pie"></div>
          <div class="legend">
            <div class="legend-item"><span class="dot critical"></span>Critical (${percent(severityCounts.CRITICAL)}%)</div>
            <div class="legend-item"><span class="dot high"></span>High (${percent(severityCounts.HIGH)}%)</div>
            <div class="legend-item"><span class="dot medium"></span>Medium (${percent(severityCounts.MEDIUM)}%)</div>
            <div class="legend-item"><span class="dot low"></span>Low (${percent(severityCounts.LOW)}%)</div>
          </div>
        </div>
        <div class="chart-card">
          <div class="chart-title">Gráfico de barras</div>
          ${severityBreakdownRows}
        </div>
      </div>
      <p class="note">${highestSeverityText}</p>

      <h2>Top IPs de Origem e Destino</h2>
      <p>Os quadros seguintes evidenciam os IPs com maior volume de alertas, úteis para priorização de investigação e bloqueios.</p>
      <div class="tables">
        <div>
          <table>
            <thead><tr><th>Top IPs de Origem</th><th>Contagem</th></tr></thead>
            <tbody>${topSourceRows || "<tr><td colspan='2'>Sem dados disponíveis</td></tr>"}</tbody>
          </table>
        </div>
        <div>
          <table>
            <thead><tr><th>Top IPs de Destino</th><th>Contagem</th></tr></thead>
            <tbody>${topDestinationRows || "<tr><td colspan='2'>Sem dados disponíveis</td></tr>"}</tbody>
          </table>
        </div>
      </div>

      <h2>Conclusões</h2>
      <p>Recomenda-se análise aprofundada dos IPs mais recorrentes e revisão de regras para mitigar reincidência de alertas críticos e altos.</p>
    </div>
  </body>
</html>`
  }

  const downloadMonthlyReport = () => {
    const html = buildMonthlyReportHtml(stats)
    const blob = new Blob([html], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `relatorio-mensal-${new Date().toISOString().slice(0, 7)}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="content">
      <header className="topbar">
        <div className="title">
          <h1>Relatórios</h1>
          <p className="subtitle">Análises e estatísticas do sistema</p>
        </div>
        <div className="controls">
          <button className="btn-primary" onClick={downloadMonthlyReport} disabled={loading || !stats}>
            Gerar relatório
          </button>
        </div>
      </header>

      {loading ? (
        <div style={{ padding: '20px' }}>A carregar relatórios...</div>
      ) : (
        <section className="reports-grid">
          <div className="report-card">
            <h3 className="card-title">Total de Alertas</h3>
            <div className="report-value">{stats?.total_alerts || 0}</div>
            <p className="report-note">desde o início</p>
          </div>

          <div className="report-card">
            <h3 className="card-title">Distribuição por Severidade</h3>
            <div className="severity-breakdown">
              <div className="severity-item">
                <span className="label">CRITICAL</span>
                <span className={`value sev critical`}>{stats?.by_severity?.CRITICAL || 0}</span>
              </div>
              <div className="severity-item">
                <span className="label">HIGH</span>
                <span className={`value sev high`}>{stats?.by_severity?.HIGH || 0}</span>
              </div>
              <div className="severity-item">
                <span className="label">MEDIUM</span>
                <span className={`value sev medium`}>{stats?.by_severity?.MEDIUM || 0}</span>
              </div>
              <div className="severity-item">
                <span className="label">LOW</span>
                <span className={`value sev low`}>{stats?.by_severity?.LOW || 0}</span>
              </div>
            </div>
          </div>

          <div className="report-card">
            <h3 className="card-title">Top 5 IPs de Origem</h3>
            <div className="ip-list">
              {stats?.top_source_ips?.length ? (
                stats.top_source_ips.map((item, i) => (
                  <div key={i} className="ip-item">
                    <span className="mono">{item.ip}</span>
                    <span className="count">{item.count}</span>
                  </div>
                ))
              ) : (
                <p style={{ color: '#94a3b8' }}>Nenhum dado disponível</p>
              )}
            </div>
          </div>

          <div className="report-card">
            <h3 className="card-title">Top 5 IPs de Destino</h3>
            <div className="ip-list">
              {stats?.top_destination_ips?.length ? (
                stats.top_destination_ips.map((item, i) => (
                  <div key={i} className="ip-item">
                    <span className="mono">{item.ip}</span>
                    <span className="count">{item.count}</span>
                  </div>
                ))
              ) : (
                <p style={{ color: '#94a3b8' }}>Nenhum dado disponível</p>
              )}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
