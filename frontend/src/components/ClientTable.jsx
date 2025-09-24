import React from 'react';

// Props atualizadas para incluir a lógica de seleção
export default function ClientTable({ clients, isLoading, selectedIds, onSelectClient, onSelectAllClients }) {

  if (isLoading && clients.length === 0) {
    return <div className="text-center text-gray-500 py-16">Carregando clientes...</div>;
  }
  
  if (!isLoading && clients.length === 0) {
    return <div className="text-center text-gray-500 py-16">Nenhum cliente offline encontrado.</div>;
  }

  // Verifica se todos os clientes visíveis estão selecionados
  const isAllSelected = clients.length > 0 && selectedIds.length === clients.length;

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-gray-100 text-xs text-gray-600 uppercase font-semibold">
          <tr>
            <th scope="col" className="p-4">
              <input 
                type="checkbox"
                className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                checked={isAllSelected}
                onChange={onSelectAllClients}
              />
            </th>
            <th scope="col" className="px-6 py-4">Nome Cliente</th>
            <th scope="col" className="px-6 py-4">Serial ONU</th>
            <th scope="col" className="px-6 py-4">OLT/Região</th>
            <th scope="col" className="px-6 py-4 text-center">Horas Offline</th>
            <th scope="col" className="px-6 py-4">Desconectado em</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {clients.map(client => (
            <tr key={client.id} className={`hover:bg-gray-50 transition-colors ${selectedIds.includes(client.id) ? 'bg-red-50' : ''}`}>
              <td className="w-4 p-4">
                <input 
                  type="checkbox"
                  className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                  checked={selectedIds.includes(client.id)}
                  onChange={() => onSelectClient(client.id)}
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
              <td className="px-6 py-4 text-gray-500">{new Date(client.data_desconexao).toLocaleString('pt-BR')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}