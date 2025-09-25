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
import useChartConfig from '../hooks/useChartConfig';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ClientsByCityChart({ chartData, theme }) {
  const chartOptions = useChartConfig(theme);

  if (!chartData || chartData.length === 0) {
    return <p className="text-secondary">Nenhum dado disponível para o gráfico de cidades.</p>;
  }

  const data = {
    labels: chartData.map(item => item.cidade),
    datasets: [
      {
        label: 'Clientes Offline',
        data: chartData.map(item => item.total),
        backgroundColor: 'rgba(79, 70, 229, 0.7)',
        borderColor: 'rgba(79, 70, 229, 1)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    ...chartOptions,
    indexAxis: 'y', // <-- Transforma em gráfico de barras horizontais
    plugins: {
      ...chartOptions.plugins,
       legend: {
        display: false,
      },
      title: {
        ...chartOptions.plugins.title,
        text: 'Top Cidades com Clientes Offline',
      },
    },
    scales: {
      ...chartOptions.scales,
      x: {
        ...chartOptions.scales.x,
        grid: {
           color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'hsl(210, 20%, 93%)',
        },
        title: {
          display: true,
          text: 'Quantidade de Clientes',
          color: chartOptions.scales.y.ticks.color, // Reutiliza a cor
        },
      },
       y: {
        ...chartOptions.scales.y,
         grid: {
          display: false,
        },
      }
    },
  };

  return <Bar data={data} options={options} />;
}
