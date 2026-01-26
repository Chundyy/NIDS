import { useState, useEffect } from "react"
import { getAlerts } from "../api"

export default function CasosPage() {
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCases()
  }, [])

  const loadCases = async () => {
    setLoading(true)
    try {
      const alerts = await getAlerts({ limit: 100 })
      // Agrupar alertas por categoria para criar casos
      const caseMap = {}
      alerts.forEach(alert => {
        const category = alert.category || "Sem categoria"
        if (!caseMap[category]) {
          caseMap[category] = {
            id: `case-${Object.keys(caseMap).length + 1}`,
            title: `Caso: ${category}`,
            category,
            severity: alert.severity,
            count: 0,
            lastAlert: alert.timestamp,
            status: alert.severity === "CRITICAL" ? "ABERTO" : "MONITORADO"
          }
        }
        caseMap[category].count += 1
      })
      setCases(Object.values(caseMap).sort((a, b) => b.count - a.count))
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
          <h1>Casos de Segurança</h1>
          <p className="subtitle">Incidentes e casos em investigação</p>
        </div>
      </header>

      <section className="cases-grid">
        {loading ? (
          <div style={{ padding: '20px' }}>A carregar casos...</div>
        ) : cases.length === 0 ? (
          <div style={{ padding: '20px', color: '#94a3b8' }}>Nenhum caso encontrado</div>
        ) : (
          cases.map(c => (
            <div key={c.id} className="case-card">
              <div className="case-header">
                <h3>{c.title}</h3>
                <span className={`case-status ${c.status.toLowerCase()}`}>{c.status}</span>
              </div>
              <div className="case-body">
                <div className="case-stat">
                  <span className="label">Categoria</span>
                  <span className="value">{c.category}</span>
                </div>
                <div className="case-stat">
                  <span className="label">Alertas</span>
                  <span className="value">{c.count}</span>
                </div>
                <div className="case-stat">
                  <span className="label">Severidade Máxima</span>
                  <span className={`sev ${c.severity.toLowerCase()}`}>{c.severity}</span>
                </div>
                <div className="case-stat">
                  <span className="label">Último alerta</span>
                  <span className="mono">{new Date(c.lastAlert).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </section>
    </main>
  )
}
