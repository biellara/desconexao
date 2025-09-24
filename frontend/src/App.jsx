import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

// Componentes
import StatsCard from './components/StatsCard.jsx';
import UploadFile from './components/UploadFile.jsx';
import ClientTable from './components/ClientTable.jsx';
import { FilterIcon, UsersIcon, TrashIcon } from './components/Icons.jsx'; // Importa o novo ícone

// --- CONFIGURAÇÃO ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000',
});

export default function App() {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [filtro, setFiltro] = useState('');
  const [selectedIds, setSelectedIds] = useState([]); // Estado para os IDs selecionados

  // --- FUNÇÕES DE DADOS ---
  const fetchClients = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('clientes_off').select('*').order('data_desconexao', { ascending: false });
    if (error) {
        console.error("Erro ao buscar clientes:", error);
        alert(`Erro ao buscar clientes: ${error.message}`);
    } else {
        setClients(data);
    }
    setIsLoading(false);
  };
  
  useEffect(() => { fetchClients(); }, []);

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    setIsUploading(true);
    try {
      const response = await apiClient.post('/upload', formData);
      alert(response.data.message);
      await fetchClients();
    } catch (error) {
      const errorMessage = error.response?.data?.detail || "Erro desconhecido ao enviar o arquivo.";
      alert(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  // --- FUNÇÕES DE EXCLUSÃO ---
  const handleDeleteAll = async () => {
    if (window.confirm("Você tem certeza que deseja excluir TODO o histórico? Esta ação não pode ser desfeita.")) {
      try {
        const response = await apiClient.delete('/clients/all');
        alert(response.data.message);
        await fetchClients();
        setSelectedIds([]);
      } catch (error) {
        alert(error.response?.data?.detail || "Erro ao excluir o histórico.");
      }
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Você tem certeza que deseja excluir os ${selectedIds.length} registros selecionados?`)) {
      try {
        const response = await apiClient.delete('/clients', { data: { ids: selectedIds } });
        alert(response.data.message);
        await fetchClients();
        setSelectedIds([]);
      } catch (error) {
        alert(error.response?.data?.detail || "Erro ao excluir registros.");
      }
    }
  };

  // --- FUNÇÕES DE SELEÇÃO E FILTRO ---
  const handleSelectClient = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]
    );
  };

  const clientesFiltrados = clients.filter(client => 
    (client.nome_cliente && client.nome_cliente.toLowerCase().includes(filtro.toLowerCase())) ||
    (client.serial_onu && client.serial_onu.toLowerCase().includes(filtro.toLowerCase())) ||
    (client.olt_regiao && client.olt_regiao.toLowerCase().includes(filtro.toLowerCase()))
  );

  const handleSelectAllClients = () => {
    if (selectedIds.length === clientesFiltrados.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(clientesFiltrados.map(client => client.id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header>
          <h1 className="text-4xl font-bold text-gray-800">Dashboard de ONUs Offline</h1>
          <p className="text-gray-500 mt-2">Monitoramento de clientes desconectados por mais de 48 horas.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1"><UploadFile onUpload={handleUpload} isLoading={isUploading} /></div>
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
            <StatsCard title="Total de Clientes Offline" value={isLoading ? '...' : clients.length} icon={<UsersIcon className="h-8 w-8" />} />
            <StatsCard title="Exibidos no Filtro" value={isLoading ? '...' : clientesFiltrados.length} icon={<FilterIcon className="h-8 w-8" />} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h3 className="text-xl font-semibold text-gray-700">Lista de Clientes Offline</h3>
            <div className="relative w-full sm:w-72">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <FilterIcon className="h-5 w-5 text-gray-400" />
                </span>
                <input 
                    type="text"
                    placeholder="Filtrar por nome, serial ou região..."
                    className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4 p-4 bg-gray-50 rounded-lg border">
             <div className="text-sm font-semibold text-gray-700">
                {selectedIds.length} de {clientesFiltrados.length} selecionado(s)
             </div>
             <div className="flex items-center gap-3">
                <button
                  onClick={handleDeleteSelected}
                  disabled={selectedIds.length === 0}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <TrashIcon className="h-4 w-4" />
                  Excluir Selecionados
                </button>
                <button
                  onClick={handleDeleteAll}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <TrashIcon className="h-4 w-4" />
                  Limpar Histórico
                </button>
             </div>
          </div>

          <ClientTable 
            clients={clientesFiltrados} 
            isLoading={isLoading}
            selectedIds={selectedIds}
            onSelectClient={handleSelectClient}
            onSelectAllClients={handleSelectAllClients}
          />
        </div>
      </div>
    </div>
  );
}