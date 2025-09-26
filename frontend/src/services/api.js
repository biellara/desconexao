import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || ''}/api`
});

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
    const { data } = await apiClient.get('/stats/kpis');
    return data;
};

export const fetchClientsByCityStats = async () => {
    const { data } = await apiClient.get('/stats/clients-by-city');
    return data;
};

export const fetchOfflineHistoryStats = async () => {
    const { data } = await apiClient.get('/stats/offline-history');
    return data;
};

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post('/upload', formData);
  return response.data;
};

// NOVA FUNÇÃO para verificar o estado do relatório
export const fetchReportStatus = async (reportId) => {
  const { data } = await apiClient.get(`/relatorios/status/${reportId}`);
  return data;
}

export const deleteAllClients = async () => {
    const response = await apiClient.delete('/clients/all');
    return response.data;
};

export const deleteSelectedClients = async (ids) => {
    const response = await apiClient.delete('/clients', { data: { ids } });
    return response.data;
};

export const createErpAttendance = async (clientName) => {
    const response = await apiClient.post('/erp/create-attendance', { client_name: clientName });
    return response.data;
};