import React, { useState, useEffect, useCallback } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  fetchClients,
  uploadFile,
  deleteAllClients,
  deleteSelectedClients,
  fetchUniqueRegions,
  fetchAllClientsForExport,
  fetchDashboardKpis,
  fetchClientsByCityStats,
  fetchOfflineHistoryStats,
  fetchReportStatus,
  createErpAttendance
} from "../services/api.js";
import KpiCard from "../components/KpiCard.jsx";
import UploadCard from "../components/UploadCard.jsx";
import ClientTable from "../components/ClientTable.jsx";
import Modal from "../components/Modal.jsx";
import ChartContainer from "../components/ChartContainer.jsx";
import ClientsByCityChart from "../components/ClientsByCityChart.jsx";
import OfflineHistoryChart from "../components/OfflineHistoryChart.jsx";
import Header from "../components/Header.jsx";
import useDebounce from "../hooks/useDebounce.js";
import {
  UsersIcon,
  TrashIcon,
  SearchIcon,
  DownloadIcon,
  UserPlusIcon,
  ServerIcon,
  CalendarIcon,
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  SpinnerIcon
} from "../components/Icons.jsx";

// ... (função exportToCSV continua a mesma) ...
const exportToCSV = (clients) => {
  const headers =
    "Nome Cliente,Serial ONU,OLT/Região,Cidade,Horas Offline,Data Desconexão";
  const rows = clients.map(
    (c) =>
      `"${c.nome_cliente || ""}","${c.serial_onu}","${c.olt_regiao || ""}","${
        c.cidade || ""
      }",${c.horas_offline},"${new Date(c.data_desconexao).toLocaleString(
        "pt-BR"
      )}"`
  );
  const csvContent =
    "data:text/csv;charset=utf-8," + encodeURIComponent([headers, ...rows].join("\n"));
  const link = document.createElement("a");
  link.setAttribute("href", csvContent);
  link.setAttribute(
    "download",
    `clientes_offline_${new Date().toISOString().split("T")[0]}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// --- COMPONENTE DE AVISO ATUALIZADO ---
const CustomToast = ({ t, message, type = 'success' }) => {
  const isVisible = t.visible;
  const baseClasses = "max-w-md w-full bg-card text-card-foreground shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 transition-all duration-300 ease-in-out";
  const animationClasses = isVisible ? 'animate-in slide-in-from-bottom-5' : 'animate-out slide-out-to-bottom-5';
  
  const iconColor = type === 'success' ? 'text-green-500' : 'text-red-500';

  return (
    <div className={`${baseClasses} ${animationClasses}`}>
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            {type === 'loading' && <SpinnerIcon className="h-6 w-6 text-primary" />}
            {type === 'success' && <CheckCircleIcon className={`h-6 w-6 ${iconColor}`} />}
            {type === 'error' && <XCircleIcon className={`h-6 w-6 ${iconColor}`} />}
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium">{message}</p>
          </div>
        </div>
      </div>
      {type !== 'loading' && (
        <div className="flex border-l border-secondary/20 dark:border-secondary-dark/30">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center gap-2 text-sm font-medium text-primary hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};


export default function DashboardPage() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );
  const [clients, setClients] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [uniqueRegions, setUniqueRegions] = useState([]);
  const [clientsByCityData, setClientsByCityData] = useState([]);
  const [offlineHistoryData, setOfflineHistoryData] = useState([]);
  const [kpiStats, setKpiStats] = useState({});
  const [totalCount, setTotalCount] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [modalState, setModalState] = useState({ isOpen: false });

  const [searchTerm, setSearchTerm] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [sortConfig, setSortConfig] = useState({
    key: "horas_offline",
    direction: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === "light" ? "dark" : "light");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const showSuccessToast = (message, options) => {
    toast.custom((t) => <CustomToast t={t} message={message} type="success" />, { ...options, duration: 5000 });
  };
  
  const showErrorToast = (message, options) => {
    toast.custom((t) => <CustomToast t={t} message={message} type="error" />, { ...options, duration: 5000 });
  };
  
  const showLoadingToast = (message, options) => {
    toast.custom((t) => <CustomToast t={t} message={message} type="loading" />, { ...options, duration: Infinity });
  };
  
  const loadClients = useCallback(async () => {
    setIsLoading(true);
    const params = {
      page: currentPage,
      limit: itemsPerPage,
      searchTerm: debouncedSearchTerm,
      regionFilter,
      sortKey: sortConfig.key,
      sortDirection: sortConfig.direction,
    };
    try {
      const { data, error, count } = await fetchClients(params);
      if (error) throw new Error(error.message);
      setClients(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      showErrorToast(`Erro ao buscar clientes: ${error.message}`);
    } finally {
      setIsLoading(false);
      setSelectedIds([]);
    }
  }, [currentPage, itemsPerPage, debouncedSearchTerm, regionFilter, sortConfig]);

  const loadDashboardData = useCallback(async () => {
    setIsStatsLoading(true);
    try {
      const [regionsRes, cityData, historyData, kpisData] = await Promise.all([
        fetchUniqueRegions(),
        fetchClientsByCityStats(),
        fetchOfflineHistoryStats(),
        fetchDashboardKpis(),
      ]);
      setUniqueRegions(regionsRes.data || []);
      setClientsByCityData(cityData || []);
      setOfflineHistoryData(historyData || []);
      setKpiStats(kpisData || {});
    } catch (error) {
      showErrorToast("Erro ao carregar dados do dashboard.");
    } finally {
      setIsStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, regionFilter, itemsPerPage]);
  
  const refreshAllData = useCallback(() => {
    loadClients();
    loadDashboardData();
  }, [loadClients, loadDashboardData]);

  const monitorReportStatus = useCallback((reportId, toastId) => {
    const interval = setInterval(async () => {
      try {
        const { status, detalhes_erro } = await fetchReportStatus(reportId);
        if (status === 'COMPLETED') {
          clearInterval(interval);
          toast.dismiss(toastId);
          showSuccessToast('Relatório processado e dados atualizados!', { id: toastId });
          refreshAllData();
        } else if (status === 'FAILED') {
          clearInterval(interval);
          toast.dismiss(toastId);
          showErrorToast(`Falha no processamento: ${detalhes_erro || 'Erro desconhecido'}`, { id: toastId });
        }
      } catch (error) {
        clearInterval(interval);
        toast.dismiss(toastId);
        showErrorToast('Não foi possível verificar o estado do processamento.', { id: toastId });
      }
    }, 5000);

    setTimeout(() => {
      clearInterval(interval);
    }, 120000);

  }, [refreshAllData]);

  const handleUpload = async (file) => {
    setIsUploading(true);
    const toastId = "upload-toast";
    showLoadingToast("A enviar... O processamento pode demorar um pouco.", { id: toastId });
    try {
      const response = await uploadFile(file);
      monitorReportStatus(response.relatorio_id, toastId);
    } catch (error) {
      toast.dismiss(toastId);
      showErrorToast(error.response?.data?.detail || "Erro ao enviar.", {
        id: toastId,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSort = (key) => {
    setCurrentPage(1);
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleExport = async () => {
    const toastId = "export-toast";
    showLoadingToast("Exportando dados...", { id: toastId });
    const { data, error } = await fetchAllClientsForExport();
    toast.dismiss(toastId);
    if (error) {
      showErrorToast("Falha ao exportar dados.", { id: toastId });
    } else {
      exportToCSV(data);
      showSuccessToast("Dados exportados!", { id: toastId });
    }
  };

  const openDeleteModal = (onConfirm, title, message) =>
    setModalState({ isOpen: true, onConfirm, title, message, type: "confirm" });

  const handleConfirmDelete = async () => {
    if (typeof modalState.onConfirm !== "function") return;
    const toastId = "delete-toast";
    showLoadingToast("A eliminar...", { id: toastId });
    try {
      const response = await modalState.onConfirm();
      toast.dismiss(toastId);
      showSuccessToast(response.message, { id: toastId });
      refreshAllData();
    } catch (error) {
      toast.dismiss(toastId);
      showErrorToast(error.response?.data?.detail || "Erro ao eliminar.", {
        id: toastId,
      });
    }
    setModalState({ isOpen: false });
  };

  const handleAbrirAtendimento = async (clientName) => {
    if (!clientName) {
      showErrorToast("Nome do cliente não encontrado para criar atendimento.");
      return;
    }
    const toastId = "erp-toast";
    showLoadingToast(`Criando atendimento para ${clientName}...`, { id: toastId });
    try {
      const result = await createErpAttendance(clientName);
      toast.dismiss(toastId);
      showSuccessToast(result.message, { id: toastId });
      // Não há necessidade de recarregar os dados, pois a ação é externa.
    } catch (error) {
      toast.dismiss(toastId);
      const errorMessage = error.response?.data?.detail || "Não foi possível criar o atendimento.";
      showErrorToast(errorMessage, { id: toastId });
    }
  };

  return (
    <>
      <Toaster position="bottom-right" />
      <Modal
        show={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        onConfirm={handleConfirmDelete}
        onCancel={() => setModalState({ isOpen: false })}
        type={modalState.type}
      />
      <div className="min-h-screen bg-background text-foreground p-4 sm:p-8 font-sans">
        <div className="max-w-7xl mx-auto space-y-8">
          <Header theme={theme} onThemeToggle={toggleTheme} />

          <main className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <KpiCard
                title="Total de Clientes Críticos"
                value={isStatsLoading ? "..." : totalCount}
                icon={<UsersIcon />}
                isLoading={isStatsLoading}
              />
              <KpiCard
                title="Novos Casos (24h)"
                value={isStatsLoading ? "..." : kpiStats.new_critical_cases_24h ?? '0'}
                icon={<UserPlusIcon />}
                isLoading={isStatsLoading}
              />
              <KpiCard
                title="OLT Mais Crítica"
                value={isStatsLoading ? "..." : kpiStats.most_critical_olt || "N/A"}
                icon={<ServerIcon />}
                isLoading={isStatsLoading}
              />
              <KpiCard
                title="Caso Mais Antigo"
                value={isStatsLoading ? "..." : `${kpiStats.oldest_case_days || 0} dias`}
                icon={<CalendarIcon />}
                isLoading={isStatsLoading}
              />
            </div>
            
            <div className="lg:col-span-4">
              <UploadCard onUpload={handleUpload} isLoading={isUploading} />
            </div>

            <div className="lg:col-span-4">
              <ChartContainer
                title="Histórico de Novos Clientes Offline"
                isLoading={isStatsLoading}
              >
                <OfflineHistoryChart chartData={offlineHistoryData} theme={theme}/>
              </ChartContainer>
            </div>
            <div className="lg:col-span-4">
              <ChartContainer
                title="Clientes Offline por Cidade"
                isLoading={isStatsLoading}
              >
                <ClientsByCityChart chartData={clientsByCityData} theme={theme} />
              </ChartContainer>
            </div>

            <div className="lg:col-span-4 bg-card text-card-foreground p-6 rounded-2xl shadow-lg">
               <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-4 gap-4">
                <h3 className="text-xl font-bold">Lista de Clientes</h3>
                <div className="flex flex-col sm:flex-row w-full xl:w-auto items-center gap-2">
                  <div className="relative w-full sm:w-auto">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
                    <input
                      type="text"
                      placeholder="Buscar por nome ou serial..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full sm:w-64 bg-background border-secondary/30 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
                    />
                  </div>
                  <select
                    value={regionFilter}
                    onChange={(e) => setRegionFilter(e.target.value)}
                    className="w-full sm:w-auto px-4 py-2.5 bg-background border-secondary/30 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
                  >
                    <option value="">Todas as Regiões</option>
                    {uniqueRegions.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                   <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="w-full sm:w-auto px-4 py-2.5 bg-background border-secondary/30 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
                  >
                    <option value={10}>10 por página</option>
                    <option value={25}>25 por página</option>
                    <option value={50}>50 por página</option>
                    <option value={100}>100 por página</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end items-center mb-4 gap-2 flex-wrap">
                <button
                  onClick={handleExport}
                  disabled={totalCount === 0}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <DownloadIcon className="h-4 w-4" /> Exportar CSV
                </button>
                <button
                  onClick={() =>
                    openDeleteModal(
                      () => deleteSelectedClients(selectedIds),
                      "Excluir Selecionados",
                      `Deseja excluir ${selectedIds.length} cliente(s)?`
                    )
                  }
                  disabled={selectedIds.length === 0}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-yellow-500 rounded-lg shadow-md hover:bg-yellow-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <TrashIcon className="h-4 w-4" /> Excluir (
                  {selectedIds.length})
                </button>
                <button
                  onClick={() =>
                    openDeleteModal(
                      deleteAllClients,
                      "Excluir Todos",
                      "Deseja excluir TODOS os clientes?"
                    )
                  }
                  disabled={totalCount === 0}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-alert rounded-lg shadow-md hover:bg-alert-dark disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <TrashIcon className="h-4 w-4" /> Excluir Todos
                </button>
              </div>
              <ClientTable
                clients={clients}
                isLoading={isLoading}
                selectedIds={selectedIds}
                onSelectClient={(id) =>
                  setSelectedIds((p) =>
                    p.includes(id) ? p.filter((i) => i !== id) : [...p, id]
                  )
                }
                onSelectAllClients={() =>
                  setSelectedIds(
                    selectedIds.length === clients.length
                      ? []
                      : clients.map((c) => c.id)
                  )
                }
                sortConfig={sortConfig}
                onSort={handleSort}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
                totalItems={totalCount}
                itemsPerPage={itemsPerPage}
                onAbrirAtendimento={handleAbrirAtendimento}
              />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

