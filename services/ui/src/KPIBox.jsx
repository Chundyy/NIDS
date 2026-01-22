import React from "react"

export default function KPIBox({ title, value, note }) {
  return (
    <div className="kpi-box">
      <div className="kpi-title">{title}</div>
      <div className="kpi-value">{value}</div>
      {note && <div className="kpi-note">{note}</div>}
    </div>
  )
}
