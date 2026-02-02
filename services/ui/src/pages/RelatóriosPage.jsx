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

  return (
    <main className="content">
      <header className="topbar">
        <div className="title">
          <h1>Relatórios</h1>
          <p className="subtitle">Análises e estatísticas do sistema</p>
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
