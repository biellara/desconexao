import React from 'react';

// Props:
// clients: Um array de objetos, onde cada objeto é um cliente.
// isLoading: Um booleano para mostrar o estado de carregamento.
export default function ClientTable({ clients, isLoading }) {

  if (isLoading && clients.length === 0) {
    return <div className="text-center text-gray-500 py-8">Carregando clientes...</div>;
  }
  
  if (!isLoading && clients.length === 0) {
    return <div className="text-center text-gray-500 py-8">Nenhum cliente offline por mais de 48h encontrado.</div>;
  }

  // O container garante que a tabela seja rolável em telas pequenas
  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
          <tr>
            <th scope="col" className="px-6 py-3">Nome Cliente</th>
            <th scope="col" className="px-6 py-3">Serial ONU</th>
            <th scope="col" className="px-6 py-3">OLT/Região</th>
            <th scope="col" className="px-6 py-3">Horas Offline</th>
            <th scope="col" className="px-6 py-3">Desconectado em</th>
          </tr>
        </thead>
        <tbody>
          {clients.map(client => (
            <tr key={client.id} className="bg-white border-b hover:bg-gray-50">
              <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{client.nome_cliente || 'N/A'}</td>
              <td className="px-6 py-4 font-mono text-gray-600">{client.serial_onu}</td>
              <td className="px-6 py-4 text-gray-600">{client.olt_regiao || 'N/A'}</td>
              <td className="px-6 py-4 text-red-600 font-bold">{client.horas_offline}h</td>
              <td className="px-6 py-4 text-gray-600">{new Date(client.data_desconexao).toLocaleString('pt-BR')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};