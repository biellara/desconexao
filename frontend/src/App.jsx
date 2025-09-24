import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

// Importando os componentes
import StatsCard from './components/StatsCard';
import UploadFile from './components/UploadFile';
import ClientTable from './components/ClientTable';

// --- CONFIGURAÇÃO ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000', // URL do seu backend FastAPI
});

export default function App() {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  // --- FUNÇÕES ---

  // Função para buscar os dados no Supabase
  const fetchClients = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('clientes_off')
      .select('*')
      .order('data_desconexao', { ascending: false }); // Ordena pelos mais recentes

    if (error) {
      console.error("Erro ao buscar clientes:", error);
      alert(`Erro ao buscar clientes: ${error.message}`); // Usando alert por simplicidade
    } else {
      setClients(data);
    }
    setIsLoading(false);
  };
  
  // O 'useEffect' com array vazio roda UMA VEZ quando o componente é montado.
  // Perfeito para buscar os dados iniciais.
  useEffect(() => {
    fetchClients();
  }, []);

  // Função para lidar com o upload do arquivo
  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    setIsUploading(true);

    try {
      const response = await apiClient.post('/upload', formData);
      alert(response.data.message); // Mostra a mensagem de sucesso do backend
      await fetchClients(); // Atualiza a tabela com os novos dados
    } catch (error) {
      const errorMessage = error.response?.data?.detail || "Erro desconhecido ao enviar o arquivo.";
      console.error("Erro no upload:", error);
      alert(errorMessage);
    } finally {
      setIsUploading(false); // Garante que o estado de 'uploading' termine
    }
  };

  // --- RENDERIZAÇÃO ---
  return (
    <div className="min-h-screen text-gray-800 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Dashboard de ONUs</h1>
          <p className="text-gray-500">Monitoramento de clientes offline por mais de 48 horas.</p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <UploadFile onUpload={handleUpload} isLoading={isUploading} />
            <ClientTable clients={clients} isLoading={isLoading} />
          </div>

          <div className="space-y-8">
            <StatsCard 
              title="Total Clientes OFF > 48h" 
              value={isLoading ? '...' : clients.length}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </div>
        </main>
      </div>
    </div>
  );
}

