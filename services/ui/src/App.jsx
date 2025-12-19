import Sidebar from "./components/Sidebar"
import KPIBox from "./components/KPIBox"
import AlertsTable from "./components/AlertsTable"

export default function App() {
  return (
    <div className="container">
      <Sidebar />

      <div className="content">
        <h1>Network IDS Dashboard</h1>

        <div className="kpi-container">
          <KPIBox title="Total Alerts (24h)" value="128" />
          <KPIBox title="Critical Alerts" value="12" />
          <KPIBox title="Hosts Monitored" value="34" />
        </div>

        <h2>Recent Alerts</h2>
        <AlertsTable />
      </div>
    </div>
  )
}
