export default function KPIBox({ title, value }) {
  return (
    <div className="kpi-box">
      <h3>{title}</h3>
      <p>{value}</p>
    </div>
  )
}
