import { Pie } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

export default function SeverityPieChart({ bySeverity = {}, loading }) {
  const labels = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
  const data = labels.map(l => bySeverity?.[l] || 0)

  const chartData = {
    labels,
    datasets: [{
      data,
      backgroundColor: [
        'rgba(225,29,72,0.6)',
        'rgba(245,158,11,0.6)',
        'rgba(124,58,237,0.6)',
        'rgba(16,185,129,0.6)'
      ],
      borderColor: ['#e11d48','#f59e0b','#7c3aed','#10b981'],
      borderWidth: 1
    }]
  }

  const options = {
    plugins: { legend: { position: 'bottom' } },
    maintainAspectRatio: false
  }

  return (
    <div style={{ height: 240 }}>
      {loading ? <div className="skeleton"/> : <Pie data={chartData} options={options} />}
    </div>
  )
}
