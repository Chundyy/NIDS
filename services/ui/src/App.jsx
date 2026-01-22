import Sidebar from "./components/Sidebar"
import KPIBox from "./components/KPIBox"
import AlertsTable from "./components/AlertsTable"

export default function App() {
  return (
    <div className="app-root">
      <Sidebar />

      <main className="content">
        <header className="topbar">
          <div className="title">
            <h1>IDS Dashboard</h1>
            <p className="subtitle">Visão geral do tráfego e alertas — dados de exemplo</p>
          </div>

          <div className="controls">
            <input className="search" placeholder="Pesquisar alertas, hosts..." />
            <select className="period">
              <option>Últimas 24h</option>
              <option>Últimas 7 dias</option>
              <option>Último mês</option>
            </select>
          </div>
        </header>

        <section className="kpi-row">
          <KPIBox title="Total de alertas (24h)" value="128" note="Agregado por severidade" />
          <KPIBox title="Alertas críticas" value="12" note="Requer atenção imediata" />
          <KPIBox title="Hosts monitorizados" value="34" note="Ativos no período" />
        </section>

        <section className="alerts-section">
          <h2 className="section-title">Alertas recentes</h2>
          <AlertsTable />
        </section>
      </main>
    </div>
  )
}
