import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

// Componentes (CAMINHO CORRIGIDO)
import StatsCard from './components/StatsCard.jsx';
import UploadFile from './components/UploadFile.jsx';
import ClientTable from './components/ClientTable.jsx';

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
    const formData = new FormData();
    formData.append('file', file);
    setIsUploading(true);
    try {
      const response = await apiClient.post('/upload', formData);
      alert(response.data.message);
      await fetchClients();
    } catch (error) {
      const errorMessage = error.response?.data?.detail || "Erro desconhecido ao enviar o arquivo.";
      console.error("Erro no upload:", error);
      alert(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const clientesFiltrados = clients.filter(client => 
    client.olt_regiao && client.olt_regiao.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    // Container principal com padding responsivo
    <div className="min-h-screen text-gray-800 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Cabeçalho da Página */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Dashboard de ONUs</h1>
          <p className="text-gray-500 mt-1">Monitoramento de clientes offline por mais de 48 horas.</p>
        </header>

        {/* Layout em Grid (2 colunas em telas grandes) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Coluna Principal (esquerda) */}
          <main className="lg:col-span-2 space-y-8">
            <UploadFile onUpload={handleUpload} isLoading={isUploading} />
            
            {/* Tabela e Filtro agrupados em um card */}
            <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">Clientes Offline</h3>
              <input 
                type="text"
                placeholder="Filtrar por OLT/Região..."
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
              <ClientTable clients={clientesFiltrados} isLoading={isLoading} />
            </div>
          </main>

          {/* Coluna Lateral (direita) */}
          <aside className="space-y-8">
            <StatsCard 
              title="Clientes OFF > 48h (Exibidos)" 
              value={isLoading ? '...' : clientesFiltrados.length}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </aside>
        </div>
      </div>
    </div>
  );
}