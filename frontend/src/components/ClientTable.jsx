import React from 'react';

export default function ClientTable({ clients, isLoading }) {

  if (isLoading && clients.length === 0) {
    return <div className="text-center text-gray-500 py-16">Carregando clientes...</div>;
  }
  
  if (!isLoading && clients.length === 0) {
    return <div className="text-center text-gray-500 py-16">Nenhum cliente offline encontrado.</div>;
  }

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-gray-100 text-xs text-gray-600 uppercase font-semibold">
          <tr>
            <th scope="col" className="px-6 py-4">Nome Cliente</th>
            <th scope="col" className="px-6 py-4">Serial ONU</th>
            <th scope="col" className="px-6 py-4">OLT/Região</th>
            <th scope="col" className="px-6 py-4 text-center">Horas Offline</th>
            <th scope="col" className="px-6 py-4">Desconectado em</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {clients.map(client => (
            <tr key={client.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 font-medium text-gray-800">{client.nome_cliente || 'N/A'}</td>
              <td className="px-6 py-4 font-mono text-gray-500">{client.serial_onu}</td>
              <td className="px-6 py-4 text-gray-600">{client.olt_regiao || 'N/A'}</td>
              <td className="px-6 py-4 text-center">
                <span className="bg-red-100 text-red-800 text-sm font-bold px-3 py-1 rounded-full">
                  {client.horas_offline}h
                </span>
              </td>
              <td className="px-6 py-4 text-gray-600">{new Date(client.data_desconexao).toLocaleString('pt-BR')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};