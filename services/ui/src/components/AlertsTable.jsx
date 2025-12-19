export default function AlertsTable() {
  const alerts = [
    { time: "10:21", severity: "CRITICAL", src: "192.168.1.10", desc: "SQL Injection Attempt" },
    { time: "10:10", severity: "HIGH", src: "192.168.1.22", desc: "Port Scan Detected" },
    { time: "09:50", severity: "MEDIUM", src: "192.168.1.33", desc: "Suspicious DNS Query" }
    { time: "11:50", severity: "LOW", src: "192.168.3.33", desc: "SUspicious IP" }
  ]

  return (
    <table className="alert-table">
      <thead>
        <tr>
          <th>Time</th>
          <th>Severity</th>
          <th>Source IP</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {alerts.map((a, idx) => (
          <tr key={idx}>
            <td>{a.time}</td>
            <td>{a.severity}</td>
            <td>{a.src}</td>
            <td>{a.desc}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
