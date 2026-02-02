import React from "react"

export default function Sidebar({ currentPage, onNavigate }) {
  const pages = [
    { id: "overview", label: "VISÃO GERAL" },
    { id: "alerts", label: "ALERTAS" },
    { id: "cases", label: "CASOS" },
    { id: "hosts", label: "HOSTS" },
    { id: "rules", label: "REGRAS" },
    { id: "reports", label: "RELATÓRIOS" },
    { id: "settings", label: "CONFIGURAÇÃO" }
  ]

  return (
    <aside className="sidebar">
      <div className="brand">NIDS SIEM</div>

      <nav className="nav">
        <ul>
          {pages.map(page => (
            <li
              key={page.id}
              className={`nav-item ${currentPage === page.id ? 'active' : ''}`}
              onClick={() => onNavigate(page.id)}
              style={{ cursor: 'pointer' }}
            >
              {page.label}
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-foot">v1.0.0</div>
    </aside>
  )
}
