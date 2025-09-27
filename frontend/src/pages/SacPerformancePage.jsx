import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { fetchSacKpis, fetchAgentPerformance } from '../services/api';
import KpiCard from '../components/KpiCard';
import ChartContainer from '../components/ChartContainer';
import { StarIcon, ClockIcon, UsersIcon } from '../components/Icons';
import { Bar } from 'react-chartjs-2';
import useChartConfig from '../hooks/useChartConfig';

const AgentPerformanceChart = ({ chartData, theme }) => {
  const chartOptions = useChartConfig(theme);

  if (!chartData || chartData.length === 0) {
    return <p className="text-secondary">Nenhum dado de performance por agente disponível.</p>;
  }

  const data = {
    labels: chartData.map(item => item.agente),
    datasets: [{
      label: 'Nota Média de Monitoria',
      data: chartData.map(item => item.nota_media),
      backgroundColor: 'rgba(54, 162, 235, 0.7)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
      borderRadius: 4,
    }],
  };

  const options = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      legend: { display: false },
      title: {
        ...chartOptions.plugins.title,
        text: 'Ranking de Agentes por Nota Média',
      },
    },
    scales: {
      ...chartOptions.scales,
      y: { ...chartOptions.scales.y, min: 0, max: 10 },
    },
  };

  return <Bar data={data} options={options} />;
};


export default function SacPerformancePage() {
  const [theme] = useState(() => localStorage.getItem("theme") || "light");
  const [kpiData, setKpiData] = useState({});
  const [agentData, setAgentData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [kpis, agents] = await Promise.all([
          fetchSacKpis(),
          fetchAgentPerformance(),
        ]);
        setKpiData(kpis);
        setAgentData(agents);
      } catch (error) {
        console.error("Erro ao carregar dados de performance do SAC", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <>
      <Toaster position="bottom-right" />
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Performance do SAC</h1>
        <p className="text-secondary mb-6">Análise de qualidade e produtividade da equipe de atendimento.</p>

        <main className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <KpiCard
              title="Nota Média Geral"
              value={isLoading ? "..." : (kpiData.media_nota_monitoria?.toFixed(2) || '0.00')}
              icon={<StarIcon />}
              isLoading={isLoading}
            />
            <KpiCard
              title="Tempo Médio Atendimento"
              value={isLoading ? "..." : `${kpiData.tempo_medio_atendimento_minutos?.toFixed(1) || '0.0'} min`}
              icon={<ClockIcon />}
              isLoading={isLoading}
            />
            <KpiCard
              title="Agentes no Ranking"
              value={isLoading ? "..." : agentData.length}
              icon={<UsersIcon />}
              isLoading={isLoading}
            />
          </div>
          <div>
            <ChartContainer title="Performance dos Agentes" isLoading={isLoading}>
              <AgentPerformanceChart chartData={agentData} theme={theme} />
            </ChartContainer>
          </div>
        </main>
      </div>
    </>
  );
}
