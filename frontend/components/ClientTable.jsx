import React from 'react';

// Props:
// clients: Um array de objetos, onde cada objeto é um cliente.
// isLoading: Um booleano para mostrar o estado de carregamento.
export default function ClientTable({ clients, isLoading }) {

  // 1. Renderização condicional para o estado de carregamento inicial
  // Mostra esta mensagem se estiver carregando e a lista de clientes estiver vazia.
  if (isLoading && clients.length === 0) {
    return <div className="bg-white p-6 rounded-xl shadow-md text-center text-gray-500">Carregando clientes...</div>;
  }
  
  // 2. Renderização condicional para quando não há dados
  // Mostra esta mensagem se não estiver carregando e a lista estiver vazia.
  if (!isLoading && clients.length === 0) {
    return <div className="bg-white p-6 rounded-xl shadow-md text-center text-gray-500">Nenhum cliente offline por mais de 48h encontrado.</div>;
  }

  // 3. Renderização da tabela quando há dados
  return (
    // O container garante que a tabela seja rolável em telas pequenas (overflow-x-auto)
    <div className="bg-white rounded-xl shadow-md overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="p-4 text-sm font-semibold text-gray-600">Nome Cliente</th>
            <th className="p-4 text-sm font-semibold text-gray-600">Serial ONU</th>
            <th className="p-4 text-sm font-semibold text-gray-600">OLT/Região</th>
            <th className="p-4 text-sm font-semibold text-gray-600">Horas Offline</th>
            <th className="p-4 text-sm font-semibold text-gray-600">Desconectado em</th>
          </tr>
        </thead>
        <tbody>
          {/* Usamos .map() para iterar sobre o array de clientes e criar uma linha (<tr>) para cada um */}
          {clients.map(client => (
            <tr key={client.id} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="p-4 text-gray-800">{client.nome_cliente || 'N/A'}</td>
              <td className="p-4 text-gray-800 font-mono">{client.serial_onu}</td>
              <td className="p-4 text-gray-800">{client.olt_regiao || 'N/A'}</td>
              <td className="p-4 text-red-600 font-semibold">{client.horas_offline}h</td>
              {/* Formatamos a data para uma leitura mais amigável (ex: 24/09/2025, 08:17:00) */}
              <td className="p-4 text-gray-600">{new Date(client.data_desconexao).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
