import React from "react";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { ChevronUpIcon, ChevronDownIcon, SpinnerIcon } from "./Icons.jsx";

const getBadgeColor = (horasOffline) => {
  if (horasOffline < 24)
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
  if (horasOffline <= 48)
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
  return "bg-alert-light text-alert-dark dark:bg-alert dark:text-alert-light";
};

const SortableHeader = ({ children, sortKey, sortConfig, onSort }) => {
  const isSorted = sortConfig.key === sortKey;
  const Icon = isSorted
    ? sortConfig.direction === "asc"
      ? ChevronUpIcon
      : ChevronDownIcon
    : null;
  return (
    <th
      scope="col"
      className="px-6 py-4 cursor-pointer hover:bg-secondary-light/50 dark:hover:bg-secondary-dark/20 transition-colors"
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {children}
        {Icon && (
          <Icon className={`h-4 w-4 ${isSorted ? "" : "text-gray-400"}`} />
        )}
      </div>
    </th>
  );
};

export default function ClientTable({
  clients = [],
  isLoading = false,
  selectedIds = [],
  onSelectClient,
  onSelectAllClients,
  sortConfig,
  onSort,
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}) {
  const firstItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const lastItem = Math.min(firstItem + itemsPerPage - 1, totalItems);

  const renderTableContent = () => {
    if (totalItems === 0 && !isLoading) {
      return (
        <div className="text-center text-secondary py-16">
          Nenhum cliente offline encontrado.
        </div>
      );
    }

    return (
      <div className="relative overflow-x-auto">
        {/* Overlay de Carregamento */}
        {isLoading && (
          <div className="absolute inset-0 bg-card/70 dark:bg-card/50 backdrop-blur-sm flex items-center justify-center z-10">
            <SpinnerIcon className="h-10 w-10 text-primary" />
          </div>
        )}
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-secondary-light dark:bg-secondary-dark/20 text-xs uppercase font-semibold">
            <tr>
              <th scope="col" className="p-4">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
                  checked={
                    clients.length > 0 && selectedIds.length === clients.length
                  }
                  onChange={onSelectAllClients}
                />
              </th>
              <SortableHeader
                sortKey="nome_cliente"
                sortConfig={sortConfig}
                onSort={onSort}
              >
                Nome Cliente
              </SortableHeader>
              <SortableHeader
                sortKey="serial_onu"
                sortConfig={sortConfig}
                onSort={onSort}
              >
                Serial ONU
              </SortableHeader>
              <SortableHeader
                sortKey="olt_regiao"
                sortConfig={sortConfig}
                onSort={onSort}
              >
                OLT/Região
              </SortableHeader>
              <SortableHeader
                sortKey="horas_offline"
                sortConfig={sortConfig}
                onSort={onSort}
              >
                Horas Offline
              </SortableHeader>
              <SortableHeader
                sortKey="data_desconexao"
                sortConfig={sortConfig}
                onSort={onSort}
              >
                Desconectado há
              </SortableHeader>
            </tr>
          </thead>
          <tbody
            className={`divide-y divide-secondary-light dark:divide-secondary-dark/30 ${
              isLoading ? "opacity-50" : ""
            }`}
          >
            {clients.map((client) => (
              <tr
                key={client.id}
                className={`hover:bg-secondary-light dark:hover:bg-secondary-dark/50 transition-colors ${
                  selectedIds.includes(client.id)
                    ? "bg-primary-light dark:bg-primary-dark/20"
                    : ""
                }`}
              >
                <td className="w-4 p-4">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
                    checked={selectedIds.includes(client.id)}
                    onChange={() => onSelectClient(client.id)}
                  />
                </td>
                <td className="px-6 py-4 font-medium">
                  {client.nome_cliente || "N/A"}
                </td>
                <td className="px-6 py-4 font-mono text-secondary">
                  {client.serial_onu}
                </td>
                <td className="px-6 py-4">{client.olt_regiao || "N/A"}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getBadgeColor(
                      client.horas_offline
                    )}`}
                  >
                    {client.horas_offline}h
                  </span>
                </td>
                <td
                  className="px-6 py-4 text-secondary"
                  title={format(
                    new Date(client.data_desconexao),
                    "dd/MM/yyyy 'às' HH:mm",
                    { locale: ptBR }
                  )}
                >
                  {formatDistanceToNow(new Date(client.data_desconexao), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <>
      {renderTableContent()}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-4 pt-4 border-t border-secondary-light dark:border-secondary-dark/30">
        <span className="text-sm text-secondary mb-2 sm:mb-0">
          Exibindo {firstItem}–{lastItem} de {totalItems} clientes
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
            className="px-3 py-1 rounded-md disabled:opacity-50 hover:bg-secondary-light dark:hover:bg-secondary-dark transition-colors"
          >
            Anterior
          </button>
          <span className="text-sm font-medium">
            Página {currentPage} de {totalPages || 1}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || isLoading}
            className="px-3 py-1 rounded-md disabled:opacity-50 hover:bg-secondary-light dark:hover:bg-secondary-dark transition-colors"
          >
            Próxima
          </button>
        </div>
      </div>
    </>
  );
}
