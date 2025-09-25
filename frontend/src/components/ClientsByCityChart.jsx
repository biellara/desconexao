import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ClientsByCityChart({ chartData }) {
  if (!chartData || chartData.length === 0) {
    return <p className="text-gray-500">Nenhum dado disponível para o gráfico de cidades.</p>;
  }

  const data = {
    labels: chartData.map(item => item.cidade),
    datasets: [
      {
        label: 'Clientes Offline',
        data: chartData.map(item => item.total),
        backgroundColor: 'rgba(79, 70, 229, 0.7)', // azul padrão
        borderColor: 'rgba(79, 70, 229, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // legenda não é tão necessária nesse caso
      },
      title: {
        display: true,
        text: 'Clientes Offline por Cidade',
      },
    },
    scales: {
      x: {
        ticks: {
          autoSkip: false,
          maxRotation: 45,
          minRotation: 30,
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Qtde de Clientes',
        },
      },
    },
  };

  return <Bar data={data} options={options} />;
}
