import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

// Componentes
import KpiCard from './components/KpiCard.jsx';
import UploadCard from './components/UploadCard.jsx';
import ClientTable from './components/ClientTable.jsx';
import ChartContainer from './components/ChartContainer.jsx';
import ClientsByRegionChart from './components/ClientsByRegionChart.jsx';
import OfflineHistoryChart from './components/OfflineHistoryChart.jsx';
import Modal from './components/Modal.jsx';
import { UsersIcon, ClockIcon, GlobeAltIcon, SearchIcon, TrashIcon, AlertTriangleIcon } from './components/Icons.jsx';

// --- CONFIGURAÇÃO ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
});

export default function App() {
  // Estados de dados
  const [clients, setClients] = useState([]);
  const [kpiData, setKpiData] = useState(null);
  const [regionData, setRegionData] = useState([]);
  const [historyData, setHistoryData] = useState([]);

  // Estados de UI
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [filtro, setFiltro] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [modalState, setModalState] = useState({ show: false, type: '', title: '', message: '', onConfirm: null });

  // --- FUNÇÕES DE DADOS ---
  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [clientsRes, kpiRes, regionRes, historyRes] = await Promise.all([
        supabase.from('clientes_off').select('*').order('data_desconexao', { ascending: false }),
        apiClient.get('/stats/kpi'),
        apiClient.get('/stats/by-region'),
        apiClient.get('/stats/history')
      ]);

      if (clientsRes.error) throw new Error(clientsRes.error.message);
      
      setClients(clientsRes.data || []);
      setKpiData(kpiRes.data);
      setRegionData(regionRes.data);
      setHistoryData(historyRes.data);
    } catch (error) {
      showModal('error', 'Erro ao Carregar Dados', `Não foi possível buscar os dados do dashboard: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  // --- LÓGICA DE MODAL ---
  const showModal = (type, title, message, onConfirm = null) => {
    setModalState({ show: true, type, title, message, onConfirm });
  };
  
  const hideModal = () => {
    setModalState({ show: false, type: '', title: '', message: '', onConfirm: null });
  };
  
  const handleConfirm = () => {
    if (modalState.onConfirm) {
      modalState.onConfirm();
    }
    hideModal();
  };

  // --- LÓGICA DE UPLOAD ---
  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    setIsUploading(true);
    try {
      const response = await apiClient.post('/upload', formData);
      showModal('success', 'Sucesso!', response.data.message);
      await fetchAllData();
      setSelectedIds([]);
    } catch (error) {
      const errorMessage = error.response?.data?.detail || "Erro desconhecido ao enviar o arquivo.";
      showModal('error', 'Falha no Upload', errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  // --- LÓGICA DE EXCLUSÃO ---
  const confirmDeleteAll = () => {
    showModal('confirm', 'Limpar Histórico?', 'Você tem certeza que deseja excluir TODO o histórico? Esta ação não pode ser desfeita.', async () => {
        try {
            const response = await apiClient.delete('/clients/all');
            showModal('success', 'Histórico Limpo!', response.data.message);
            await fetchAllData();
            setSelectedIds([]);
        } catch (error) {
            showModal('error', 'Erro!', error.response?.data?.detail || "Não foi possível limpar o histórico.");
        }
    });
  };

  const confirmDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    showModal('confirm', 'Excluir Selecionados?', `Você tem certeza que deseja excluir os ${selectedIds.length} registros selecionados?`, async () => {
        try {
            const response = await apiClient.delete('/clients', { data: { ids: selectedIds } });
            showModal('success', 'Registros Excluídos!', response.data.message);
            await fetchAllData();
            setSelectedIds([]);
        } catch (error) {
            showModal('error', 'Erro!', error.response?.data?.detail || "Não foi possível excluir os registros.");
        }
    });
  };

  // --- FILTRO E SELEÇÃO ---
  const clientesFiltrados = useMemo(() => clients.filter(client => 
    Object.values(client).some(value => 
      String(value).toLowerCase().includes(filtro.toLowerCase())
    )
  ), [clients, filtro]);

  const handleSelectAll = useCallback(() => {
    if (selectedIds.length === clientesFiltrados.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(clientesFiltrados.map(client => client.id));
    }
  }, [clientesFiltrados, selectedIds.length]);

  return (
    <>
      <Modal {...modalState} onConfirm={handleConfirm} onCancel={hideModal} />
      <div className="min-h-screen bg-gray-100 text-gray-800">
        <div className="max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
          
          <header>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Dashboard de Clientes Offline</h1>
            <p className="text-gray-600 mt-1">Análise de desconexões críticas na rede ({'>'} 48h).</p>
          </header>

          <main className="space-y-8">
            {/* Seção de KPIs */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <KpiCard title="Total de Clientes Offline" value={kpiData?.total_offline ?? '0'} icon={<UsersIcon className="h-8 w-8" />} isLoading={isLoading} />
              <KpiCard title="Média de Horas Offline" value={`${kpiData?.media_horas_offline ?? '0'}h`} icon={<ClockIcon className="h-8 w-8" />} isLoading={isLoading} />
              <KpiCard title="Região Mais Afetada" value={kpiData?.regiao_mais_afetada ?? 'N/A'} icon={<GlobeAltIcon className="h-8 w-8" />} isLoading={isLoading} />
            </section>
            
            {/* Seção de Gráficos */}
            <section className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-2">
                <ChartContainer title="Clientes por Região" isLoading={isLoading}>
                    <ClientsByRegionChart chartData={regionData} />
                </ChartContainer>
              </div>
              <div className="lg:col-span-3">
                <ChartContainer title="Histórico de Desconexões" isLoading={isLoading}>
                    <OfflineHistoryChart chartData={historyData} />
                </ChartContainer>
              </div>
            </section>

            {/* Seção Operacional */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-1">
                <UploadCard onUpload={handleUpload} isLoading={isUploading} />
              </div>

              <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Clientes Atualmente Offline</h3>
                    <div className="relative w-full md:w-64">
                      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input 
                        type="text"
                        placeholder="Filtrar dados..."
                        className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                      />
                    </div>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4 p-3 bg-gray-50 rounded-lg border">
                    <div className="text-sm font-semibold text-gray-700">
                      {selectedIds.length} de {clientesFiltrados.length} selecionado(s)
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={confirmDeleteSelected} disabled={selectedIds.length === 0} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
                            <TrashIcon className="h-4 w-4" /> Excluir Seleção
                        </button>
                        <button onClick={confirmDeleteAll} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition-colors">
                            <AlertTriangleIcon className="h-4 w-4" /> Limpar Tudo
                        </button>
                    </div>
                </div>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <ClientTable 
                    clients={clientesFiltrados} 
                    isLoading={isLoading && clients.length === 0}
                    selectedIds={selectedIds}
                    onSelectClient={(id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id])}
                    onSelectAllClients={handleSelectAll}
                  />
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </>
  );
}