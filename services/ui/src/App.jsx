import { useEffect, useMemo, useState } from "react"
import Sidebar from "./Sidebar"
import KPIBox from "./KPIBox"
import { getAlerts, getStats, searchAlerts } from "./api"
import AlertsTrendChart from "./components/AlertsTrendChart"
import SeverityPieChart from "./components/SeverityPieChart"
import TopSourcesBarChart from "./components/TopSourcesBarChart"
import AlertsTable from "./components/AlertsTable"
import dayjs from "dayjs"

// Páginas
import AlertasPage from "./pages/AlertasPage"
import CasosPage from "./pages/CasosPage"
import HostsPage from "./pages/HostsPage"
import RegrasPage from "./pages/RegrasPage"
import RelatóriosPage from "./pages/RelatóriosPage"
import ConfiguraçãoPage from "./pages/ConfiguraçãoPage"

function OverviewPage({ stats, alerts, loading, error, query, setQuery, period, setPeriod, kpis, timeseries, severity, setSeverity, timestamp, setTimestamp, sourceIp, setSourceIp, destIp, setDestIp, description, setDescription, onShowAllAlerts, loadingAllAlerts }) {
  const [showAllAlerts, setShowAllAlerts] = useState(false)
  const alertLimit = 50

  useEffect(() => {
    setShowAllAlerts(false)
  }, [period, severity, timestamp, sourceIp, destIp, description, query])

  // Aplicar filtros aos alertas
  const filteredAlerts = alerts.filter(a => {
    if (a.timestamp) {
      const now = dayjs()
      const windowHours = period === "24h" ? 24 : period === "7d" ? 24 * 7 : period === "30d" ? 24 * 30 : null
      if (windowHours) {
        const start = now.subtract(windowHours, "hour")
        if (dayjs(a.timestamp).isBefore(start)) return false
      }
    }
    if (severity && a.severity !== severity) return false
    if (timestamp && new Date(a.timestamp).toLocaleString() !== timestamp) return false
    if (sourceIp && a.source_ip !== sourceIp) return false
    if (destIp && a.destination_ip !== destIp) return false
    if (description && a.description !== description) return false
    return true
  }).sort((a, b) => {
    if (!a.timestamp && !b.timestamp) return 0
    if (!a.timestamp) return 1
    if (!b.timestamp) return -1
    return new Date(b.timestamp) - new Date(a.timestamp)
  })

  const visibleAlerts = showAllAlerts ? filteredAlerts : filteredAlerts.slice(0, alertLimit)

  return (
    <main className="content">
      <header className="topbar">
        <div className="title">
          <h1>NIDS Dashboard</h1>
          <p className="subtitle">Visão geral de alertas e atividade de rede</p>
        </div>

        <div className="controls">
          <input
            className="search"
            placeholder="Pesquisar por IP, descrição, severidade, hora..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <select className="period" value={period} onChange={e => setPeriod(e.target.value)}>
            <option value="24h">Últimas 24h</option>
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Último mês</option>
          </select>
        </div>
      </header>

      <section className="kpi-row">
        <KPIBox title="Total de alertas" value={kpis.total} note="Período selecionado" />
        <KPIBox title="Críticos" value={kpis.critical} note="Ação imediata" />
        <KPIBox title="Altos" value={kpis.high} note="Prioridade alta" />
        <KPIBox title="Hosts ativos" value={kpis.hosts} note="Fonte/Destino únicos" />
      </section>

      <section className="cards-grid">
        <div className="card">
          <h3 className="card-title">Alertas por hora</h3>
          <AlertsTrendChart data={timeseries} loading={loading} />
        </div>
        <div className="card">
          <h3 className="card-title">Distribuição por severidade</h3>
          <SeverityPieChart bySeverity={stats?.by_severity} loading={loading} />
        </div>
        <div className="card">
          <h3 className="card-title">Top IPs de origem</h3>
          <TopSourcesBarChart items={stats?.top_source_ips || []} loading={loading} />
        </div>
      </section>

      <section className="alerts-section">
        <h2 className="section-title">Alertas recentes</h2>
        {error && <div className="error-msg">{error}</div>}
        
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
        
        <AlertsTable 
          rows={visibleAlerts}
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
        {filteredAlerts.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '14px' }}>
            <button
              className="btn-secondary"
              onClick={() => {
                setShowAllAlerts(true)
                if (onShowAllAlerts) onShowAllAlerts()
              }}
              disabled={loadingAllAlerts}
              title={loadingAllAlerts ? "A carregar alertas" : "Mostrar todos os alertas"}
            >
              {loadingAllAlerts ? "A carregar..." : "Ver mais"}
            </button>
          </div>
        )}
      </section>
    </main>
  )
}

export default function App() {
  const [currentPage, setCurrentPage] = useState("overview")
  const [stats, setStats] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [allAlerts, setAllAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingAllAlerts, setLoadingAllAlerts] = useState(false)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState("")
  const [period, setPeriod] = useState("24h")
  const [severity, setSeverity] = useState("")
  const [timestamp, setTimestamp] = useState("")
  const [sourceIp, setSourceIp] = useState("")
  const [destIp, setDestIp] = useState("")
  const [description, setDescription] = useState("")
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('nids_darkMode')
    return saved ? JSON.parse(saved) : false
  })

  // Aplicar tema escuro ao documentro
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark-mode')
    } else {
      document.documentElement.classList.remove('dark-mode')
    }
    localStorage.setItem('nids_darkMode', JSON.stringify(darkMode))
  }, [darkMode])

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [s, a] = await Promise.all([
          getStats(),
          getAlerts({ limit: 500 })
        ])
        if (!active) return
        const normBySev = Object.fromEntries(
          Object.entries(s?.by_severity || {}).map(([k, v]) => [String(k).toUpperCase(), v])
        )
        setStats({ ...s, by_severity: normBySev })
        setAllAlerts(a)
        setAlerts(a)
      } catch (e) {
        console.error(e)
        if (!active) return
        setError("Falha a carregar dados do API")
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [])

  const fetchAllAlerts = async () => {
    if (loadingAllAlerts) return
    setLoadingAllAlerts(true)
    try {
      const all = await getAlerts({ limit: 100000 })
      setAllAlerts(all)
      if (!query) {
        setAlerts(all)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingAllAlerts(false)
    }
  }

  // Debounced search with client-side filtering
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

  const kpis = useMemo(() => {
    const total = stats?.total_alerts ?? alerts.length
    const bySev = stats?.by_severity ?? {}
    const critical = bySev["CRITICAL"] || 0
    const high = bySev["HIGH"] || 0
    const hosts = new Set(alerts.flatMap(a => [a.source_ip, a.destination_ip])).size
    return { total, critical, high, hosts }
  }, [stats, alerts])

  // Build timeseries by hour for the selected period
  const timeseries = useMemo(() => {
    const now = dayjs()
    const hours = 24
    const buckets = Array.from({ length: hours }, (_, i) => ({
      label: now.subtract(hours - i - 1, 'hour').format('HH:mm'),
      count: 0,
    }))
    for (const a of alerts) {
      const t = dayjs(a.timestamp)
      const diff = now.diff(t, 'hour')
      if (diff >= 0 && diff < hours) {
        const idx = hours - diff - 1
        buckets[idx].count += 1
      }
    }
    return buckets
  }, [alerts, period])

  const renderPage = () => {
    switch (currentPage) {
      case "overview":
        return <OverviewPage stats={stats} alerts={alerts} loading={loading} error={error} query={query} setQuery={setQuery} period={period} setPeriod={setPeriod} kpis={kpis} timeseries={timeseries} severity={severity} setSeverity={setSeverity} timestamp={timestamp} setTimestamp={setTimestamp} sourceIp={sourceIp} setSourceIp={setSourceIp} destIp={destIp} setDestIp={setDestIp} description={description} setDescription={setDescription} onShowAllAlerts={fetchAllAlerts} loadingAllAlerts={loadingAllAlerts} />
      case "alerts":
        return <AlertasPage />
      case "cases":
        return <CasosPage />
      case "hosts":
        return <HostsPage />
      case "rules":
        return <RegrasPage />
      case "reports":
        return <RelatóriosPage />
      case "settings":
        return <ConfiguraçãoPage darkMode={darkMode} setDarkMode={setDarkMode} />
      default:
        return <OverviewPage stats={stats} alerts={alerts} loading={loading} error={error} query={query} setQuery={setQuery} period={period} setPeriod={setPeriod} kpis={kpis} timeseries={timeseries} severity={severity} setSeverity={setSeverity} timestamp={timestamp} setTimestamp={setTimestamp} sourceIp={sourceIp} setSourceIp={setSourceIp} destIp={destIp} setDestIp={setDestIp} description={description} setDescription={setDescription} />
    }
  }

  return (
    <div className="app-root">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      {renderPage()}
    </div>
  )
}

