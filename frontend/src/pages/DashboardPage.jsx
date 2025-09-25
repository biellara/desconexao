import React, { useState, useEffect, useCallback, useMemo } from "react";
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
} from "../services/api.js";
import KpiCard from "../components/KpiCard.jsx";
import UploadCard from "../components/UploadCard.jsx";
import ClientTable from "../components/ClientTable.jsx";
import Modal from "../components/Modal.jsx";
import ChartContainer from "../components/ChartContainer.jsx";
import ClientsByCityChart from "../components/ClientsByCityChart.jsx";
import OfflineHistoryChart from "../components/OfflineHistoryChart.jsx";
import Header from "../components/Header.jsx";
import useDebounce from "../hooks/useDebounce.js"; // Importa o novo hook
import {
  UsersIcon,
  TrashIcon,
  SearchIcon,
  ClockIcon,
  LocationMarkerIcon,
  PercentIcon,
  DownloadIcon,
} from "../components/Icons.jsx";

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
  const [totalBaseClients] = useState(25000);

  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [modalState, setModalState] = useState({ isOpen: false });

  // Estados dos filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10); // Novo estado para itens por página

  // Aplica o debounce ao termo de busca
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // Atraso de 500ms

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

  const loadClients = useCallback(async () => {
    setIsLoading(true);
    const params = {
      page: currentPage,
      limit: itemsPerPage, // Usa o novo estado
      searchTerm: debouncedSearchTerm, // Usa o termo com debounce
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
      toast.error(`Erro ao buscar clientes: ${error.message}`);
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
      toast.error("Erro ao carregar dados do dashboard.");
    } finally {
      setIsStatsLoading(false);
    }
  }, []);
  
  // Efeito para recarregar os dados quando os filtros mudam
  useEffect(() => {
    loadClients();
  }, [loadClients]);
  
  // Efeito para carregar os dados agregados (gráficos, kpis) apenas uma vez
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Efeito para voltar à primeira página sempre que um filtro é alterado
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, regionFilter, itemsPerPage]);

  const refreshAllData = useCallback(() => {
    setCurrentPage(1);
    loadClients();
    loadDashboardData();
  }, [loadClients, loadDashboardData]);

  const handleUpload = async (file) => {
    setIsUploading(true);
    const toastId = "upload-toast";
    toast.loading("Enviando arquivo...", { id: toastId });
    try {
      const response = await uploadFile(file);
      toast.success(response.message, { id: toastId });
      setTimeout(refreshAllData, 3000);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erro ao enviar.", {
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
    toast.loading("Exportando dados...", { id: toastId });
    const { data, error } = await fetchAllClientsForExport();
    if (error) {
      toast.error("Falha ao exportar dados.", { id: toastId });
    } else {
      exportToCSV(data);
      toast.success("Dados exportados!", { id: toastId });
    }
  };

  const openDeleteModal = (onConfirm, title, message) =>
    setModalState({ isOpen: true, onConfirm, title, message, type: "confirm" });

  const handleConfirmDelete = async () => {
    if (typeof modalState.onConfirm !== "function") return;
    const toastId = "delete-toast";
    toast.loading("Excluindo...", { id: toastId });
    try {
      const response = await modalState.onConfirm();
      toast.success(response.message, { id: toastId });
      refreshAllData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erro ao excluir.", {
        id: toastId,
      });
    }
    setModalState({ isOpen: false });
  };

  const percentOffline = useMemo(() => {
    if (!totalBaseClients || !totalCount) return "0.0%";
    return ((totalCount / totalBaseClients) * 100).toFixed(1) + "%";
  }, [totalCount, totalBaseClients]);

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
            {/* ... Seção de KPIs ... */}
             <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <KpiCard
                title="Total Offline"
                value={isLoading ? "..." : totalCount}
                icon={<UsersIcon />}
                isLoading={isLoading}
              />
              <KpiCard
                title="% da Base Offline"
                value={percentOffline}
                icon={<PercentIcon />}
                isLoading={isLoading}
              />
              <KpiCard
                title="Cidade + Crítica"
                value={
                  isStatsLoading
                    ? "..."
                    : kpiStats.city_with_most_offline || "N/A"
                }
                icon={<LocationMarkerIcon />}
                isLoading={isStatsLoading}
              />
              <KpiCard
                title="Tempo Médio Offline"
                value={
                  isStatsLoading
                    ? "..."
                    : `${Math.round(kpiStats.avg_offline_hours || 0)}h`
                }
                icon={<ClockIcon />}
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
                  {/* NOVO SELETOR DE ITENS POR PÁGINA */}
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

              {/* ... Seção de botões ... */}
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
              />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

