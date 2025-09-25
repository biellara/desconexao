import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

// --- COMPONENTES (Simplificados para o MVP) ---

const StatsCard = ({ title, value, isLoading }) => (
  <div className="bg-white p-6 rounded-xl shadow-md">
    <p className="text-sm font-medium text-gray-500">{title}</p>
    <p className="text-3xl font-bold text-gray-800">{isLoading ? '...' : value}</p>
  </div>
);

const UploadFile = ({ onUpload, isLoading }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => setSelectedFile(event.target.files[0]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (selectedFile) onUpload(selectedFile);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Atualizar Dados</h3>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <label htmlFor="file-upload" className="flex-grow border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50">
          <span>{selectedFile ? selectedFile.name : 'Selecione o relatório'}</span>
          <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept=".csv, .xlsx, .xls" />
        </label>
        <button type="submit" disabled={!selectedFile || isLoading} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
          {isLoading ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
    </div>
  );
};

const ClientTable = ({ clients, isLoading }) => {
  if (isLoading && clients.length === 0) return <div className="bg-white p-6 rounded-xl shadow-md text-center">Carregando...</div>;
  if (!isLoading && clients.length === 0) return <div className="bg-white p-6 rounded-xl shadow-md text-center">Nenhum cliente offline encontrado.</div>;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-4 font-semibold">Nome Cliente</th>
            <th className="p-4 font-semibold">Serial ONU</th>
            <th className="p-4 font-semibold">Horas Offline</th>
            <th className="p-4 font-semibold">Desconectado em</th>
          </tr>
        </thead>
        <tbody>
          {clients.map(client => (
            <tr key={client.id} className="border-t">
              <td className="p-4">{client.nome_cliente || 'N/A'}</td>
              <td className="p-4 font-mono">{client.serial_onu}</td>
              <td className="p-4 text-red-600">{client.horas_offline}h</td>
              <td className="p-4">{new Date(client.data_desconexao).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- CONFIGURAÇÃO ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
});

// --- COMPONENTE PRINCIPAL ---

export default function App() {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

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
      setClients(data || []);
    }
    setIsLoading(false);
  };
  
  // Roda uma vez quando o componente carrega
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
      await fetchClients(); // Atualiza a tabela após o upload
    } catch (error) {
      const errorMessage = error.response?.data?.detail || "Erro ao enviar o arquivo.";
      alert(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header>
          <h1 className="text-4xl font-bold text-gray-900">Dashboard de Clientes Offline</h1>
          <p className="text-gray-600">Monitoramento de desconexões críticas na rede ({'>'} 48h).</p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            <UploadFile onUpload={handleUpload} isLoading={isUploading} />
            <ClientTable clients={clients} isLoading={isLoading} />
          </div>
          <div className="lg:col-span-1">
            <StatsCard 
              title="Total de Clientes Offline" 
              value={clients.length}
              isLoading={isLoading} 
            />
          </div>
        </main>
      </div>
    </div>
  );
}

