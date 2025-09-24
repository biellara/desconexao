import React from 'react';

export default function StatsCard({ title, value, icon, className = '' }) {
  return (
    <div className={`bg-white p-6 rounded-xl shadow-lg flex items-center justify-between ${className}`}>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-4xl font-bold text-gray-800 mt-1">{value}</p>
      </div>
      <div className="bg-red-100 text-red-600 p-4 rounded-full">
        {icon}
      </div>
    </div>
  );
}