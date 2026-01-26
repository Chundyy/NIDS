import { useState, useEffect } from "react"
import { getAlerts } from "../api"

export default function HostsPage() {
  const [hosts, setHosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHosts()
  }, [])

  const loadHosts = async () => {
    setLoading(true)
    try {
      const alerts = await getAlerts({ limit: 500 })
      
      // Extrair IPs únicos
      const hostMap = {}
      alerts.forEach(alert => {
        [alert.source_ip, alert.destination_ip].forEach(ip => {
          if (!hostMap[ip]) {
            hostMap[ip] = {
              ip,
              totalAlerts: 0,
              critical: 0,
              high: 0,
              lastAlert: alert.timestamp,
              categories: new Set()
            }
          }
          hostMap[ip].totalAlerts += 1
          if (alert.severity === "CRITICAL") hostMap[ip].critical += 1
          if (alert.severity === "HIGH") hostMap[ip].high += 1
          hostMap[ip].lastAlert = Math.max(new Date(hostMap[ip].lastAlert), new Date(alert.timestamp))
          hostMap[ip].categories.add(alert.category || "Desconhecido")
        })
      })

      const hostsArray = Object.values(hostMap).map(h => ({
        ...h,
        categories: Array.from(h.categories)
      })).sort((a, b) => b.totalAlerts - a.totalAlerts)

      setHosts(hostsArray)
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
          <h1>Hosts Ativos</h1>
          <p className="subtitle">IPs envolvidos em atividades detectadas</p>
        </div>
      </header>

      <section className="hosts-section">
        <div className="table-wrap">
          <table className="alert-table">
            <thead>
              <tr>
                <th>Endereço IP</th>
                <th>Total de Alertas</th>
                <th>Críticos</th>
                <th>Altos</th>
                <th>Categorias</th>
                <th>Último Alerta</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>A carregar hosts...</td>
                </tr>
              ) : hosts.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>Nenhum host encontrado</td>
                </tr>
              ) : (
                hosts.map((h, i) => (
                  <tr key={i}>
                    <td className="mono">{h.ip}</td>
                    <td>{h.totalAlerts}</td>
                    <td><span className="sev critical">{h.critical}</span></td>
                    <td><span className="sev high">{h.high}</span></td>
                    <td>
                      <div style={{ fontSize: '12px' }}>
                        {h.categories.slice(0, 2).join(', ')}
                        {h.categories.length > 2 ? ` +${h.categories.length - 2}` : ''}
                      </div>
                    </td>
                    <td className="mono">{new Date(h.lastAlert).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
