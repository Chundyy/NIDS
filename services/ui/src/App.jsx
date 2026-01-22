import Sidebar from "./Sidebar"
import KPIBox from "./KPIBox"

export default function App() {
  const sampleAlerts = [
    { time: "2026-01-22 12:34", src: "10.0.0.5", dst: "10.0.0.10", rule: "SQL Injection", severity: "Critical" },
    { time: "2026-01-22 11:50", src: "10.0.1.8", dst: "192.168.1.12", rule: "Port Scan", severity: "High" },
    { time: "2026-01-22 10:15", src: "172.16.0.3", dst: "10.0.0.2", rule: "Brute Force", severity: "Medium" },
    { time: "2026-01-21 23:05", src: "192.168.0.20", dst: "10.0.0.7", rule: "Suspicious DNS", severity: "Low" },
  ]

  function AlertsTable({ rows }) {
    return (
      <div className="table-wrap">
        <table className="alert-table">
          <thead>
            <tr>
              <th>Hora</th>
              <th>Origem</th>
              <th>Destino</th>
              <th>Regra</th>
              <th>Severidade</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td className="mono">{r.time}</td>
                <td>{r.src}</td>
                <td>{r.dst}</td>
                <td>{r.rule}</td>
                <td><span className={"sev " + r.severity.toLowerCase()}>{r.severity}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="app-root">
      <Sidebar />

      <main className="content">
        <header className="topbar">
          <div className="title">
            <h1>NIDS SIEM</h1>
            <p className="subtitle">Painel estilo SIEM — dados de exemplo</p>
          </div>

          <div className="controls">
            <input className="search" placeholder="Pesquisar alertas, hosts, regras..." />
            <select className="period">
              <option>Últimas 24h</option>
              <option>Últimas 7 dias</option>
              <option>Último mês</option>
            </select>
          </div>
        </header>

        <section className="kpi-row">
          <KPIBox title="Total de alertas" value="128" note="Últimas 24 horas" />
          <KPIBox title="Alertas críticas" value="12" note="Ação imediata" />
          <KPIBox title="Hosts ativos" value="34" note="Conectados no período" />
        </section>

        <section className="alerts-section">
          <h2 className="section-title">Alertas recentes</h2>
          <AlertsTable rows={sampleAlerts} />
        </section>
      </main>
    </div>
  )
}
