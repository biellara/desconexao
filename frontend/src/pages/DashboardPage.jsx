import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

// Serviços e Componentes
import { fetchClients, uploadFile, deleteAllClients, deleteSelectedClients } from '../services/api';
import KpiCard from '../components/KpiCard';
import UploadCard from '../components/UploadCard';
import ClientTable from '../components/ClientTable';
import Modal from '../components/Modal';
import { UsersIcon, TrashIcon } from '../components/Icons';

export default function DashboardPage() {
  // Estados da página
  const [clients, setClients] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [modalState, setModalState] = useState({ isOpen: false, title: '', message: '', onConfirm: null, type: 'confirm' });

  // --- LÓGICA DE DADOS ---
  const loadClients = async () => {
    setIsLoading(true);
    const { data, error } = await fetchClients();

    if (error) {
      toast.error(`Erro ao buscar clientes: ${error.message}`);
    } else {
      setClients(data || []);
    }
    setIsLoading(false);
  };
  
  useEffect(() => {
    loadClients();
  }, []);

  // --- MANIPULADORES DE EVENTOS ---
  const handleUpload = async (file) => {
    setIsUploading(true);
    toast.loading('Enviando arquivo...', { id: 'upload-toast' });
    try {
      const response = await uploadFile(file);
      toast.success(response.message, { id: 'upload-toast' });
    } catch (error) {
      const errorMessage = error.response?.data?.detail || "Erro ao enviar o arquivo.";
      toast.error(errorMessage, { id: 'upload-toast' });
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleSelectClient = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllClients = () => {
    if (selectedIds.length === clients.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(clients.map(c => c.id));
    }
  };
  
  const openModal = (title, message, onConfirm) => {
    setModalState({ isOpen: true, title, message, onConfirm, type: 'confirm' });
  };
  
  const closeModal = () => {
    setModalState({ isOpen: false, title: '', message: '', onConfirm: null, type: 'confirm' });
  };

  const handleDeleteSelected = () => {
    openModal(
      'Confirmar Exclusão',
      `Você tem certeza que deseja excluir ${selectedIds.length} cliente(s) selecionado(s)? Esta ação não pode ser desfeita.`,
      async () => {
        toast.loading('Excluindo clientes...', { id: 'delete-toast' });
        try {
          const response = await deleteSelectedClients(selectedIds);
          toast.success(response.message, { id: 'delete-toast' });
          setSelectedIds([]);
          await loadClients();
        } catch (error) {
          const errorMessage = error.response?.data?.detail || "Erro ao excluir clientes.";
          toast.error(errorMessage, { id: 'delete-toast' });
        } finally {
          closeModal();
        }
      }
    );
  };
  
  const handleDeleteAll = () => {
    openModal(
      'Excluir TUDO?',
      'Você está prestes a excluir TODOS os registros de clientes offline. Esta ação é irreversível. Deseja continuar?',
      async () => {
        toast.loading('Excluindo todos os clientes...', { id: 'delete-toast' });
        try {
          const response = await deleteAllClients();
          toast.success(response.message, { id: 'delete-toast' });
          setSelectedIds([]);
          await loadClients();
        } catch (error) {
          const errorMessage = error.response?.data?.detail || "Erro ao excluir clientes.";
          toast.error(errorMessage, { id: 'delete-toast' });
        } finally {
          closeModal();
        }
      }
    );
  };

  // --- RENDERIZAÇÃO ---
  return (
    <>
      <Modal 
        show={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        onConfirm={modalState.onConfirm}
        onCancel={closeModal}
        type={modalState.type}
      />
      <div className="min-h-screen bg-gray-100 p-4 sm:p-8 font-sans">
        <div className="max-w-7xl mx-auto space-y-8">
          <header>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Dashboard de Clientes Offline</h1>
            <p className="text-gray-600 mt-1">Monitoramento de desconexões críticas na rede ({'>'} 48h).</p>
          </header>

          <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="md:col-span-2 lg:col-span-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KpiCard title="Total de Clientes Offline" value={clients.length} isLoading={isLoading} icon={<UsersIcon className="h-8 w-8" />} />
                <div className="md:col-span-2">
                  <UploadCard onUpload={handleUpload} isLoading={isUploading} />
                </div>
              </div>
            </div>

            <div className="md:col-span-2 lg:col-span-4 bg-white p-6 rounded-2xl shadow-lg">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Lista de Clientes</h3>
                  <div className="flex items-center gap-2 mt-4 sm:mt-0">
                    <button 
                      onClick={handleDeleteSelected} 
                      disabled={selectedIds.length === 0}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-yellow-500 rounded-lg shadow-md hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
                    >
                      <TrashIcon className="h-4 w-4" />
                      Excluir ({selectedIds.length})
                    </button>
                    <button 
                      onClick={handleDeleteAll} 
                      disabled={clients.length === 0}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg shadow-md hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
                    >
                      <TrashIcon className="h-4 w-4" />
                      Excluir Todos
                    </button>
                  </div>
                </div>
                <ClientTable 
                  clients={clients} 
                  isLoading={isLoading}
                  selectedIds={selectedIds}
                  onSelectClient={handleSelectClient}
                  onSelectAllClients={handleSelectAllClients}
                />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

