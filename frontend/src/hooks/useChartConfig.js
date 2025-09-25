import { useMemo } from 'react';

/**
 * Um hook customizado que fornece configurações base para o Chart.js,
 * adaptando-se ao tema (claro ou escuro).
 * @param {string} theme - O tema atual ('light' ou 'dark').
 * @returns {object} As opções de configuração para um gráfico Chart.js.
 */
const useChartConfig = (theme) => {
  // Define as cores com base no tema para garantir a legibilidade.
  const textColor = theme === 'dark' ? 'hsl(210, 15%, 90%)' : 'hsl(210, 10%, 45%)';
  const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'hsl(210, 20%, 93%)';
  const tooltipBackgroundColor = theme === 'dark' ? 'hsl(210, 15%, 20%)' : 'hsl(0, 0%, 100%)';
  const tooltipTitleColor = theme === 'dark' ? 'hsl(210, 15%, 90%)' : 'hsl(210, 10%, 20%)';
  const tooltipBodyColor = theme === 'dark' ? 'hsl(210, 15%, 80%)' : 'hsl(210, 10%, 45%)';

  // useMemo é usado para evitar recalcular as opções a cada renderização,
  // a menos que o tema, as cores de texto ou da grade mudem.
  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: textColor,
          font: {
            family: "'Inter', sans-serif",
          }
        },
      },
      title: {
        display: true,
        color: textColor,
        font: {
            family: "'Inter', sans-serif",
            size: 16,
            weight: 'bold',
        }
      },
      tooltip: {
        backgroundColor: tooltipBackgroundColor,
        titleColor: tooltipTitleColor,
        bodyColor: tooltipBodyColor,
        borderColor: gridColor,
        borderWidth: 1,
        padding: 10,
        titleFont: {
            family: "'Inter', sans-serif",
            weight: 'bold',
        },
        bodyFont: {
            family: "'Inter', sans-serif",
        },
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: gridColor,
        },
        ticks: {
          color: textColor,
          font: {
            family: "'Inter', sans-serif",
          }
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: textColor,
          font: {
            family: "'Inter', sans-serif",
          }
        },
      },
    },
  }), [theme, textColor, gridColor, tooltipBackgroundColor, tooltipTitleColor, tooltipBodyColor]);

  return options;
};

export default useChartConfig;
