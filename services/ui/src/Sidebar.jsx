import React from "react"

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">NIDS SIEM</div>

      <nav className="nav">
        <ul>
          <li className="nav-item active">VISÃO GERAL</li>
          <li className="nav-item">ALERTAS</li>
          <li className="nav-item">CASOS</li>
          <li className="nav-item">HOSTS</li>
          <li className="nav-item">REGRAS</li>
          <li className="nav-item">RELATÓRIOS</li>
          <li className="nav-item">CONFIGURAÇÃO</li>
        </ul>
      </nav>

      <div className="sidebar-foot">Versão de exemplo</div>
    </aside>
  )
}
