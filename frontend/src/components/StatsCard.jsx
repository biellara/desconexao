import React from 'react';

export default function StatsCard({ title, value, icon }) {
  return (
    // A 'div' principal define o estilo do card: fundo branco, padding,
    // cantos arredondados, sombra e layout flex para alinhar os itens.
    <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
      <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
        {icon}
      </div>
    </div>
  );
}
