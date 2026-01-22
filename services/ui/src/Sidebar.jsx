import React from "react"

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">Network IDS</div>

      <nav className="nav">
        <ul>
          <li className="nav-item active">Visão geral</li>
          <li className="nav-item">Alertas</li>
          <li className="nav-item">Hosts</li>
          <li className="nav-item">Regras</li>
          <li className="nav-item">Relatórios</li>
          <li className="nav-item">Configuração</li>
        </ul>
      </nav>

      <div className="sidebar-foot">Versão de exemplo</div>
    </aside>
  )
}

