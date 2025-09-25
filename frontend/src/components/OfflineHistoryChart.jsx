import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import useChartConfig from '../hooks/useChartConfig';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function OfflineHistoryChart({ chartData, theme }) {
  const chartOptions = useChartConfig(theme);
   if (!chartData || chartData.length === 0) {
    return <p className="text-secondary">Não há dados históricos para exibir.</p>;
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
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      legend: { display: false },
      title: {
        ...chartOptions.plugins.title,
        text: 'Histórico de Novos Clientes Offline'
      },
      tooltip: {
        ...chartOptions.plugins.tooltip,
        callbacks: {
          label: function(context) {
            const currentValue = context.parsed.y;
            const label = context.dataset.label || '';
            const labels = [`${label}: ${currentValue}`];

            if (context.dataIndex > 0) {
              const previousValue = context.chart.data.datasets[0].data[context.dataIndex - 1];
              
              if (previousValue > 0) {
                const percentChange = ((currentValue - previousValue) / previousValue) * 100;
                const sign = percentChange > 0 ? '+' : '';
                const arrow = percentChange >= 0 ? '▲' : '▼';
                const changeString = `${arrow} ${sign}${percentChange.toFixed(1)}% vs dia anterior`;
                labels.push(changeString);
              } else if (currentValue > 0) {
                labels.push(`▲ Aumento (de 0)`);
              }
            }
            return labels;
          }
        }
      }
    },
    scales: {
        ...chartOptions.scales,
        y: {
            ...chartOptions.scales.y,
             grid: { color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'hsl(210, 20%, 93%)' },
        },
        x: {
            ...chartOptions.scales.x,
             grid: { display: false } 
        },
    }
  };

  return <Line data={data} options={options} />;
}
