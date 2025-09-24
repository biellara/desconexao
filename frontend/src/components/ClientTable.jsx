import React from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

const SkeletonRow = () => (
    <tr className="animate-pulse">
        <td className="w-4 p-4"><div className="h-5 w-5 bg-gray-200 rounded"></div></td>
        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-3/4"></div></td>
        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-full"></div></td>
        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
        <td className="px-6 py-4 text-center"><div className="h-6 bg-gray-200 rounded-full w-16 mx-auto"></div></td>
        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-full"></div></td>
    </tr>
);

export default function ClientTable({ clients, isLoading, selectedIds, onSelectClient, onSelectAllClients }) {

  if (isLoading) {
    return (
        <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-100 text-xs text-gray-600 uppercase font-semibold">
                <tr>
                    <th scope="col" className="p-4"></th>
                    <th scope="col" className="px-6 py-4">Nome Cliente</th>
                    <th scope="col" className="px-6 py-4">Serial ONU</th>
                    <th scope="col" className="px-6 py-4">OLT/Região</th>
                    <th scope="col" className="px-6 py-4 text-center">Horas Offline</th>
                    <th scope="col" className="px-6 py-4">Desconectado há</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
                {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
            </tbody>
        </table>
    );
  }
  
  if (clients.length === 0) {
    return <div className="text-center text-gray-500 py-16">Nenhum cliente offline encontrado com os filtros atuais.</div>;
  }

  const isAllSelected = clients.length > 0 && selectedIds.length === clients.length;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-gray-100 text-xs text-gray-600 uppercase font-semibold">
          <tr>
            <th scope="col" className="p-4">
              <input 
                type="checkbox"
                className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
                checked={isAllSelected}
                onChange={onSelectAllClients}
                aria-label="Selecionar todos os clientes"
              />
            </th>
            <th scope="col" className="px-6 py-4">Nome Cliente</th>
            <th scope="col" className="px-6 py-4">Serial ONU</th>
            <th scope="col" className="px-6 py-4">OLT/Região</th>
            <th scope="col" className="px-6 py-4 text-center">Horas Offline</th>
            <th scope="col" className="px-6 py-4">Desconectado há</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {clients.map(client => (
            <tr key={client.id} className={`hover:bg-gray-50 transition-colors ${selectedIds.includes(client.id) ? 'bg-indigo-50' : ''}`}>
              <td className="w-4 p-4">
                <input 
                  type="checkbox"
                  className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
                  checked={selectedIds.includes(client.id)}
                  onChange={() => onSelectClient(client.id)}
                  aria-label={`Selecionar cliente ${client.nome_cliente}`}
                />
              </td>
              <td className="px-6 py-4 font-medium text-gray-800">{client.nome_cliente || 'N/A'}</td>
              <td className="px-6 py-4 font-mono text-gray-500">{client.serial_onu}</td>
              <td className="px-6 py-4 text-gray-600">{client.olt_regiao || 'N/A'}</td>
              <td className="px-6 py-4 text-center">
                <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {client.horas_offline}h
                </span>
              </td>
              <td className="px-6 py-4 text-gray-500" title={format(new Date(client.data_desconexao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}>
                {formatDistanceToNow(new Date(client.data_desconexao), { addSuffix: true, locale: ptBR })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

