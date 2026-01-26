import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

export default function TopSourcesBarChart({ items = [], loading }) {
  const labels = items.map(i => i.ip)
  const counts = items.map(i => i.count)

  const chartData = {
    labels,
    datasets: [{
      label: 'Ocorrências',
      data: counts,
      backgroundColor: 'rgba(11,74,223,0.25)',
      borderColor: '#0b4adf',
      borderWidth: 1
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
      {loading ? <div className="skeleton"/> : <Bar data={chartData} options={options} />}
    </div>
  )
}
