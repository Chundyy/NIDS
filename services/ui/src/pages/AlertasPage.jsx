import { useState, useEffect } from "react"
import { getAlerts, searchAlerts } from "../api"
import AlertsTable from "../components/AlertsTable"

export default function AlertasPage() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [severity, setSeverity] = useState("")

  useEffect(() => {
    loadAlerts()
  }, [])

  const loadAlerts = async () => {
    setLoading(true)
    try {
      const data = await getAlerts({ limit: 500 })
      setAlerts(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!query) {
        await loadAlerts()
        return
      }
      try {
        const res = await searchAlerts(query, 500)
        setAlerts(res)
      } catch (e) {
        console.error(e)
      }
    }, 350)
    return () => clearTimeout(t)
  }, [query])

  const filteredAlerts = severity
    ? alerts.filter(a => a.severity === severity)
    : alerts

  return (
    <main className="content">
      <header className="topbar">
        <div className="title">
          <h1>Alertas</h1>
          <p className="subtitle">Todos os alertas detectados no sistema</p>
        </div>

        <div className="controls">
          <input
            className="search"
            placeholder="Pesquisar alertas..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <select
            className="period"
            value={severity}
            onChange={e => setSeverity(e.target.value)}
          >
            <option value="">Todas as severidades</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
        </div>
      </header>

      <section className="alerts-section">
        <div className="section-stats">
          <div className="stat-item">
            <span className="stat-label">Total</span>
            <span className="stat-value">{alerts.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Críticos</span>
            <span className="stat-value critical">{alerts.filter(a => a.severity === 'CRITICAL').length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Altos</span>
            <span className="stat-value high">{alerts.filter(a => a.severity === 'HIGH').length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Exibindo</span>
            <span className="stat-value">{filteredAlerts.length}</span>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>A carregar alertas...</div>
        ) : (
          <AlertsTable rows={filteredAlerts} />
        )}
      </section>
    </main>
  )
}
