import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURAÇÃO DOS CLIENTES ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
});


// --- FUNÇÕES DE SERVIÇO ---

export const fetchClients = async () => {
  const { data, error } = await supabase
    .from('clientes_off')
    .select('*')
    .order('data_desconexao', { ascending: false });
  
  return { data, error };
};

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await apiClient.post('/upload', formData);
  return response.data;
};

// --- NOVAS FUNÇÕES DE EXCLUSÃO ---

/**
 * Exclui todos os clientes da base de dados.
 */
export const deleteAllClients = async () => {
    const response = await apiClient.delete('/clients/all');
    return response.data;
};

/**
 * Exclui clientes com base em uma lista de IDs.
 * @param {number[]} ids - Lista de IDs dos clientes a serem excluídos.
 */
export const deleteSelectedClients = async (ids) => {
    const response = await apiClient.delete('/clients', {
        data: { ids } // Em requisições DELETE, o corpo é enviado via `data`
    });
    return response.data;
};

