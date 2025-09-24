import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

// Componentes
import StatsCard from './components/StatsCard.jsx';
import UploadFile from './components/UploadFile.jsx';
import ClientTable from './components/ClientTable.jsx';
import { ClockIcon, HomeIcon, CloudUploadIcon, FilterIcon, UsersIcon } from './components/Icons.jsx'; // Ícones centralizados

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

  // --- FUNÇÕES ---
  const fetchClients = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('clientes_off')
      .select('*')
      .order('data_desconexao', { ascending: false });

    if (error) {
      console.error("Erro ao buscar clientes:", error);
      alert(`Erro ao buscar clientes: ${error.message}`);
    } else {
      setClients(data);
    }
    setIsLoading(false);
  };
  
  useEffect(() => {
    fetchClients();
  }, []);

  const handleUpload = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setIsUploading(true);
    try {
      const response = await apiClient.post('/upload', formData);
      alert(response.data.message || "Arquivo enviado com sucesso!");
      await fetchClients();
    } catch (error) {
      const errorMessage = error.response?.data?.detail || "Erro desconhecido ao enviar o arquivo.";
      console.error("Erro no upload:", error);
      alert(`Falha no Upload: ${errorMessage}`);
    } finally {
      setIsUploading(false);
    }
  };

  const clientesFiltrados = clients.filter(client => 
    (client.olt_regiao && client.olt_regiao.toLowerCase().includes(filtro.toLowerCase())) ||
    (client.nome_cliente && client.nome_cliente.toLowerCase().includes(filtro.toLowerCase())) ||
    (client.serial_onu && client.serial_onu.toLowerCase().includes(filtro.toLowerCase()))
  );

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200">
        <div className="h-20 flex items-center justify-center border-b border-gray-200">
          <h1 className="text-2xl font-bold text-red-600">ONU Status</h1>
        </div>
        <nav className="mt-6">
          <a href="#" className="flex items-center px-6 py-3 text-gray-700 bg-red-50 border-l-4 border-red-500">
            <HomeIcon className="w-6 h-6 mr-4 text-red-600" />
            <span className="font-semibold">Dashboard</span>
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-8 sm:p-10">
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Visão Geral</h1>
          <p className="text-gray-500 mt-2">Monitoramento de clientes offline por mais de 48 horas.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* Coluna de Upload e Stats */}
          <div className="lg:col-span-1">
            <UploadFile onUpload={handleUpload} isLoading={isUploading} />
          </div>
          <div className="lg:col-span-2">
            <StatsCard 
              title="Total de Clientes Offline (> 48h)" 
              value={isLoading ? '...' : clients.length}
              icon={<UsersIcon className="h-8 w-8" />}
            />
             <StatsCard 
              title="Exibidos no Filtro Atual" 
              value={isLoading ? '...' : clientesFiltrados.length}
              icon={<FilterIcon className="h-8 w-8" />}
              className="mt-8"
            />
          </div>
        </div>

        {/* Tabela de Clientes */}
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
          <ClientTable clients={clientesFiltrados} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}