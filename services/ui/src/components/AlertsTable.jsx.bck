export default function AlertsTable({ rows = [] }) {
  return (
    <div className="table-wrap">
      <table className="alert-table">
        <thead>
          <tr>
            <th>Hora</th>
            <th>Origem</th>
            <th>Destino</th>
            <th>Descrição</th>
            <th>Severidade</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td className="mono">{r.timestamp}</td>
              <td>{r.source_ip}</td>
              <td>{r.destination_ip}</td>
              <td>{r.description}</td>
              <td><span className={"sev " + String(r.severity || '').toLowerCase()}>{r.severity}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
