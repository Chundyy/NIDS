import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

export default function AlertsTrendChart({ data = [], loading }) {
  const labels = data.map(d => d.label)
  const counts = data.map(d => d.count)

  const chartData = {
    labels,
    datasets: [{
      label: 'Alertas',
      data: counts,
      borderColor: '#0b4adf',
      backgroundColor: 'rgba(11,74,223,0.15)',
      tension: 0.35,
      fill: true,
      pointRadius: 2
    }]
  }
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { grid: { color: 'rgba(15,23,36,0.08)' }, ticks: { precision: 0 } },
      x: { grid: { display: false } }
    }
  }

  return (
    <div style={{ height: 240 }}>
      {loading ? <div className="skeleton"/> : <Line data={chartData} options={options} />}
    </div>
  )
}
