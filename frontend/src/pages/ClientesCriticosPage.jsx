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
  findErpClient,
} from "../services/api";
import KpiCard from "../components/KpiCard";
import UploadCard from "../components/UploadCard";
import ClientTable from "../components/ClientTable";
import Modal from "../components/Modal";
import ChartContainer from "../components/ChartContainer";
import ClientsByCityChart from "../components/ClientsByCityChart";
import OfflineHistoryChart from "../components/OfflineHistoryChart";
import useDebounce from "../hooks/useDebounce";
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
  SpinnerIcon,
  ClockIcon,
} from "../components/Icons";

const exportToCSV = (clients) => {
  const headers =
    "Nome Cliente,Serial ONU,OLT/Região,CTO,Cidade,Horas Offline,Data Desconexão,Motivo,RX ONU,RX OLT,Distância (m)";
  const rows = clients.map(
    (c) =>
      `"${c.nome_cliente || ""}","${c.serial_onu}","${c.olt_regiao || ""}","${c.cto || ""}","${
        c.cidade || ""
      }",${c.horas_offline},"${new Date(c.data_desconexao).toLocaleString(
        "pt-BR"
      )}","${c.motivo_desconexao || ""}","${c.rx_onu || ""}","${c.rx_olt || ""}","${c.distancia_m || ""}"`
  );
  const csvContent =
    "data:text/csv;charset=utf-8," +
    encodeURIComponent([headers, ...rows].join("\n"));
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

const CustomToast = ({ t, message, type = "success" }) => {
  const isVisible = t.visible;
  const baseClasses =
    "max-w-md w-full bg-card text-card-foreground shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 transition-all duration-300 ease-in-out";
  const animationClasses = isVisible
    ? "animate-in slide-in-from-bottom-5"
    : "animate-out slide-out-to-bottom-5";

  const iconColor = type === "success" ? "text-green-500" : "text-red-500";

  return (
    <div className={`${baseClasses} ${animationClasses}`}>
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            {type === "loading" && (
              <SpinnerIcon className="h-6 w-6 text-primary" />
            )}
            {type === "success" && (
              <CheckCircleIcon className={`h-6 w-6 ${iconColor}`} />
            )}
            {type === "error" && (
              <XCircleIcon className={`h-6 w-6 ${iconColor}`} />
            )}
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium">{message}</p>
          </div>
        </div>
      </div>
      {type !== "loading" && (
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

// Renomeado de DashboardPage para ClientesCriticosPage
export default function ClientesCriticosPage() {
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
  const [hoursFilter, setHoursFilter] = useState(48);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const debouncedHoursFilter = useDebounce(hoursFilter, 500);
  const [sortConfig, setSortConfig] = useState({
    key: "horas_offline",
    direction: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const showSuccessToast = (message, options) =>
    toast.custom(
      (t) => <CustomToast t={t} message={message} type="success" />,
      { ...options, duration: 5000 }
    );
  const showErrorToast = (message, options) =>
    toast.custom((t) => <CustomToast t={t} message={message} type="error" />, {
      ...options,
      duration: 5000,
    });
  const showLoadingToast = (message, options) =>
    toast.custom(
      (t) => <CustomToast t={t} message={message} type="loading" />,
      { ...options, duration: Infinity }
    );

  const loadClients = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error, count } = await fetchClients({
        page: currentPage,
        limit: itemsPerPage,
        searchTerm: debouncedSearchTerm,
        regionFilter,
        sortKey: sortConfig.key,
        sortDirection: sortConfig.direction,
        hoursFilter: debouncedHoursFilter,
      });
      if (error) throw new Error(error.message);
      setClients(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      showErrorToast(`Erro ao buscar clientes: ${error.message}`);
    } finally {
      setIsLoading(false);
      setSelectedIds([]);
    }
  }, [
    currentPage,
    itemsPerPage,
    debouncedSearchTerm,
    regionFilter,
    sortConfig,
    debouncedHoursFilter,
  ]);

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
  }, [debouncedSearchTerm, regionFilter, itemsPerPage, debouncedHoursFilter]);

  const refreshAllData = useCallback(() => {
    loadClients();
    loadDashboardData();
  }, [loadClients, loadDashboardData]);

  const monitorReportStatus = useCallback(
    (reportId, toastId) => {
      const interval = setInterval(async () => {
        try {
          const { status, detalhes_erro } = await fetchReportStatus(reportId);
          if (status === "COMPLETED") {
            clearInterval(interval);
            toast.dismiss(toastId);
            showSuccessToast("Relatório processado e dados atualizados!", {
              id: toastId,
            });
            refreshAllData();
          } else if (status === "FAILED") {
            clearInterval(interval);
            toast.dismiss(toastId);
            showErrorToast(
              `Falha no processamento: ${detalhes_erro || "Erro desconhecido"}`,
              { id: toastId }
            );
          }
        } catch (error) {
          clearInterval(interval);
          toast.dismiss(toastId);
          showErrorToast(
            "Não foi possível verificar o estado do processamento.",
            { id: toastId }
          );
        }
      }, 5000);
      setTimeout(() => {
        clearInterval(interval);
      }, 120000);
    },
    [refreshAllData]
  );

  // CORRIGIDO: agora recebe file + reportType
  const handleUpload = async (file, reportType) => {
    setIsUploading(true);
    const toastId = "upload-toast";
    showLoadingToast("A enviar... O processamento pode demorar um pouco.", {
      id: toastId,
    });
    try {
      console.log("[ClientesCriticosPage] Upload iniciado:", { file: file.name, reportType });

      const response = await uploadFile(file, reportType); // agora passa reportType
      console.log("[ClientesCriticosPage] Resposta upload:", response);

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
      showErrorToast("Nome do cliente inválido.");
      return;
    }

    const toastId = "erp-toast";
    showLoadingToast(`Buscando ${clientName} no ERP...`, { id: toastId });

    try {
      const erpClient = await findErpClient(clientName);
      const { client_id } = erpClient;

      const erpUrlPattern = import.meta.env.VITE_ERP_CLIENT_URL_PATTERN;
      if (!erpUrlPattern) {
        throw new Error("URL do ERP não configurada no frontend.");
      }

      const finalUrl = `${erpUrlPattern}${client_id}`;
      toast.success(`Cliente encontrado! Redirecionando...`, { id: toastId });
      window.open(finalUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.dismiss(toastId);
      const errorMessage =
        error.response?.data?.detail ||
        "Não foi possível encontrar o cliente no ERP.";
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
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Saúde da Rede</h1>
        <p className="text-secondary mb-6">Monitoramento de desconexões e clientes críticos.</p>

        <main className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KpiCard
              title="Total de Clientes Offline"
              value={isStatsLoading ? "..." : totalCount}
              icon={<UsersIcon />}
              isLoading={isStatsLoading}
            />
            <KpiCard
              title="Novos Casos (24h)"
              value={isStatsLoading ? "..." : kpiStats.new_critical_cases_24h ?? "0"}
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
          <div>
            <UploadCard onUpload={handleUpload} isLoading={isUploading} />
          </div>
          <div>
            <ChartContainer title="Histórico de Novos Clientes Offline" isLoading={isStatsLoading}>
              <OfflineHistoryChart chartData={offlineHistoryData} theme={theme} />
            </ChartContainer>
          </div>
          <div>
            <ChartContainer title="Clientes Offline por Cidade" isLoading={isStatsLoading}>
              <ClientsByCityChart chartData={clientsByCityData} theme={theme} />
            </ChartContainer>
          </div>
          <div className="bg-card text-card-foreground p-6 rounded-2xl shadow-lg">
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
                <div className="relative w-full sm:w-auto">
                  <ClockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
                  <input
                    type="number"
                    placeholder="Horas mín."
                    value={hoursFilter}
                    onChange={(e) => setHoursFilter(Number(e.target.value))}
                    className="pl-10 pr-4 py-2 w-full sm:w-40 bg-background border-secondary/30 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
                    title="Filtrar por horas mínimas offline"
                  />
                </div>
                <select
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-background border-secondary/30 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
                >
                  <option value="">Todas as Regiões</option>
                  {uniqueRegions.map((r) => (<option key={r} value={r}>{r}</option>))}
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
                onClick={() => openDeleteModal(() => deleteSelectedClients(selectedIds), "Excluir Selecionados", `Deseja excluir ${selectedIds.length} cliente(s)?`)}
                disabled={selectedIds.length === 0}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-yellow-500 rounded-lg shadow-md hover:bg-yellow-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <TrashIcon className="h-4 w-4" /> Excluir ({selectedIds.length})
              </button>
              <button
                onClick={() => openDeleteModal(deleteAllClients, "Excluir Todos", "Deseja excluir TODOS os clientes?")}
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
              onSelectClient={(id) => setSelectedIds((p) => p.includes(id) ? p.filter((i) => i !== id) : [...p, id])}
              onSelectAllClients={() => setSelectedIds(selectedIds.length === clients.length ? [] : clients.map((c) => c.id))}
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
    </>
  );
}
