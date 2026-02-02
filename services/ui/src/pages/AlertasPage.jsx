import { useState, useEffect } from "react"
import { getAlerts, searchAlerts } from "../api"
import AlertsTable from "../components/AlertsTable"

export default function AlertasPage() {
  const [alerts, setAlerts] = useState([])
  const [allAlerts, setAllAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [severity, setSeverity] = useState("")
  const [timestamp, setTimestamp] = useState("")
  const [sourceIp, setSourceIp] = useState("")
  const [destIp, setDestIp] = useState("")
  const [description, setDescription] = useState("")

  useEffect(() => {
    loadAlerts()
  }, [])

  const loadAlerts = async () => {
    setLoading(true)
    try {
      const data = await getAlerts({ limit: 500 })
      setAllAlerts(data)
      setAlerts(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!query) {
      // Se não houver query, mostramos todos os alertas
      setAlerts(allAlerts)
      return
    }

    // Se há query, filtramos com debounce
    const t = setTimeout(() => {
      const q = query.toLowerCase()
      const filtered = allAlerts.filter(a => {
        const searchText = [
          a.description || '',
          a.source_ip || '',
          a.destination_ip || '',
          a.rule_name || '',
          a.severity || '',
          a.timestamp ? new Date(a.timestamp).toLocaleString() : ''
        ].join(' ').toLowerCase()
        
        return searchText.includes(q)
      })
      setAlerts(filtered)
    }, 350)
    
    return () => clearTimeout(t)
  }, [query, allAlerts])

  const filteredAlerts = alerts.filter(a => {
    if (severity && a.severity !== severity) return false
    if (timestamp && new Date(a.timestamp).toLocaleString() !== timestamp) return false
    if (sourceIp && a.source_ip !== sourceIp) return false
    if (destIp && a.destination_ip !== destIp) return false
    if (description && a.description !== description) return false
    return true
  }).sort((a, b) => {
    // Ordena por severidade (crítico primeiro) e depois por timestamp (mais recente primeiro)
    const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
    const sevDiff = (severityOrder[a.severity] || 4) - (severityOrder[b.severity] || 4)
    if (sevDiff !== 0) return sevDiff
    return new Date(b.timestamp) - new Date(a.timestamp)
  })

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
            placeholder="Pesquisar por IP, descrição, severidade, hora..."
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

        {(severity || timestamp || sourceIp || destIp || description) && (
          <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>Filtros ativos:</span>
            {severity && (
              <span style={{ 
                background: 'rgba(11,74,223,0.12)', 
                color: '#0b4adf',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: '600'
              }} onClick={() => setSeverity("")}>
                Sev: {severity} ✕
              </span>
            )}
            {timestamp && (
              <span style={{ 
                background: 'rgba(11,74,223,0.12)', 
                color: '#0b4adf',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: '600'
              }} onClick={() => setTimestamp("")}>
                Hora: {timestamp} ✕
              </span>
            )}
            {sourceIp && (
              <span style={{ 
                background: 'rgba(11,74,223,0.12)', 
                color: '#0b4adf',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: '600'
              }} onClick={() => setSourceIp("")}>
                Origem: {sourceIp} ✕
              </span>
            )}
            {destIp && (
              <span style={{ 
                background: 'rgba(11,74,223,0.12)', 
                color: '#0b4adf',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: '600'
              }} onClick={() => setDestIp("")}>
                Destino: {destIp} ✕
              </span>
            )}
            {description && (
              <span style={{ 
                background: 'rgba(11,74,223,0.12)', 
                color: '#0b4adf',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: '600'
              }} onClick={() => setDescription("")}>
                Desc: {description.substring(0, 20)}... ✕
              </span>
            )}
          </div>
        )}

        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>A carregar alertas...</div>
        ) : (
          <AlertsTable 
            rows={filteredAlerts} 
            onSeverityClick={setSeverity}
            onTimestampClick={setTimestamp}
            onSourceIpClick={setSourceIp}
            onDestIpClick={setDestIp}
            onDescriptionClick={setDescription}
            currentSeverityFilter={severity}
            currentTimestampFilter={timestamp}
            currentSourceIpFilter={sourceIp}
            currentDestIpFilter={destIp}
            currentDescriptionFilter={description}
          />
        )}
      </section>
    </main>
  )
}
