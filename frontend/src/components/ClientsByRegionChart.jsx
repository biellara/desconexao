import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ClientsByRegionChart({ chartData }) {
  if (!chartData || chartData.length === 0) {
    return <p className="text-gray-500">Nenhum dado disponível para o gráfico de regiões.</p>;
  }

  const data = {
    labels: chartData.map(item => item.regiao),
    datasets: [
      {
        label: 'Clientes Offline',
        data: chartData.map(item => item.total),
        backgroundColor: [
          'rgba(79, 70, 229, 0.8)',
          'rgba(220, 38, 38, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(99, 102, 241, 0.8)',
        ],
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  return <Doughnut data={data} options={options} />;
}