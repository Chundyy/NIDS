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

function OverviewPage({ stats, alerts, loading, error, query, setQuery, period, setPeriod, kpis, timeseries }) {
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
            placeholder="Pesquisar alertas, hosts, regras..."
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
        <AlertsTable rows={alerts} />
      </section>
    </main>
  )
}

export default function App() {
  const [currentPage, setCurrentPage] = useState("overview")
  const [stats, setStats] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState("")
  const [period, setPeriod] = useState("24h")

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [s, a] = await Promise.all([
          getStats(),
          getAlerts({ limit: 200 })
        ])
        if (!active) return
        const normBySev = Object.fromEntries(
          Object.entries(s?.by_severity || {}).map(([k, v]) => [String(k).toUpperCase(), v])
        )
        setStats({ ...s, by_severity: normBySev })
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

  // Debounced search
  useEffect(() => {
    const t = setTimeout(async () => {
      if (!query) {
        const a = await getAlerts({ limit: 200 })
        setAlerts(a)
        return
      }
      try {
        const res = await searchAlerts(query, 200)
        setAlerts(res)
      } catch (e) {
        console.error(e)
      }
    }, 350)
    return () => clearTimeout(t)
  }, [query])

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
        return <OverviewPage stats={stats} alerts={alerts} loading={loading} error={error} query={query} setQuery={setQuery} period={period} setPeriod={setPeriod} kpis={kpis} timeseries={timeseries} />
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
        return <ConfiguraçãoPage />
      default:
        return <OverviewPage stats={stats} alerts={alerts} loading={loading} error={error} query={query} setQuery={setQuery} period={period} setPeriod={setPeriod} kpis={kpis} timeseries={timeseries} />
    }
  }

  return (
    <div className="app-root">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      {renderPage()}
    </div>
  )
}

