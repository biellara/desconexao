import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- PONTO DE DEBUG 1: VERIFICAR A URL BASE ---
const baseURL = `${import.meta.env.VITE_API_URL || ''}/api`;
console.log("Configurando apiClient com a baseURL:", baseURL);

const apiClient = axios.create({
  baseURL: baseURL,
});

// Adicionar um interceptor para logar todos os erros de requisição
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // --- PONTO DE DEBUG 2: CAPTURAR O ERRO DO AXIOS ---
    console.error("Erro na chamada da API:", {
      message: error.message,
      url: error.config.url,
      method: error.config.method,
      baseURL: error.config.baseURL,
      responseStatus: error.response?.status,
      responseData: error.response?.data,
    });
    // Rejeita a promise para que o .catch() no DashboardPage.jsx ainda funcione
    return Promise.reject(error);
  }
);


export const fetchClients = async (params = {}) => {
  const { 
    page = 1, limit = 10, searchTerm = '', regionFilter = '', 
    sortKey = 'horas_offline', sortDirection = 'desc' 
  } = params;

  let query = supabase.from('clientes_off').select('*', { count: 'exact' });

  if (searchTerm) {
    query = query.or(`nome_cliente.ilike.%${searchTerm}%,serial_onu.ilike.%${searchTerm}%`);
  }
  if (regionFilter) {
    query = query.eq('olt_regiao', regionFilter);
  }
  if (sortKey && sortDirection) {
    query = query.order(sortKey, { ascending: sortDirection === 'asc' });
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  return { data, error, count };
};

export const fetchAllClientsForExport = async () => {
  const { data, error } = await supabase.from('clientes_off').select('*').order('horas_offline', { ascending: false });
  return { data, error };
};

export const fetchUniqueRegions = async () => {
    const { data, error } = await supabase.rpc('get_unique_olt_regions');
    const regions = data ? data.map(item => item.olt_regiao) : [];
    return { data: regions, error };
};

export const fetchDashboardKpis = async () => {
    console.log("Tentando buscar /stats/kpis");
    const { data } = await apiClient.get('/stats/kpis');
    return data;
};

export const fetchClientsByCityStats = async () => {
    console.log("Tentando buscar /stats/clients-by-city");
    const { data } = await apiClient.get('/stats/clients-by-city');
    return data;
};

export const fetchOfflineHistoryStats = async () => {
    console.log("Tentando buscar /stats/offline-history");
    const { data } = await apiClient.get('/stats/offline-history');
    return data;
};

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  console.log("Tentando fazer upload do ficheiro");
  const response = await apiClient.post('/upload', formData);
  return response.data;
};

// NOVA FUNÇÃO para verificar o estado do relatório
export const fetchReportStatus = async (reportId) => {
  console.log(`Tentando buscar o estado do relatório /relatorios/status/${reportId}`);
  const { data } = await apiClient.get(`/relatorios/status/${reportId}`);
  return data;
}

export const deleteAllClients = async () => {
    console.log("Tentando apagar todos os clientes");
    const response = await apiClient.delete('/clients/all');
    return response.data;
};

export const deleteSelectedClients = async (ids) => {
    console.log("Tentando apagar clientes selecionados");
    const response = await apiClient.delete('/clients', { data: { ids } });
    return response.data;
};

export const createErpAttendance = async (clientName) => {
    console.log("Tentando criar atendimento no ERP");
    const response = await apiClient.post('/erp/create-attendance', { client_name: clientName });
    return response.data;
};