import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function OfflineHistoryChart({ chartData }) {
   if (!chartData || chartData.length === 0) {
    return <p className="text-gray-500">Não há dados históricos para exibir.</p>;
  }
  
  const data = {
    labels: chartData.map(item => new Date(item.data + 'T00:00:00').toLocaleDateString('pt-BR')),
    datasets: [
      {
        label: 'Novos Clientes Offline',
        data: chartData.map(item => item.total),
        fill: true,
        backgroundColor: 'rgba(79, 70, 229, 0.2)',
        borderColor: 'rgba(79, 70, 229, 1)',
        tension: 0.4,
        pointBackgroundColor: 'rgba(79, 70, 229, 1)',
        pointBorderColor: '#fff',
        pointHoverRadius: 7,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: '#e5e7eb' } },
      x: { grid: { display: false } },
    }
  };

  return <Line data={data} options={options} />;
}