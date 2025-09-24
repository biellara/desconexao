import React from 'react';

const Skeleton = () => (
    <div className="animate-pulse flex flex-col justify-between">
        <div className="h-4 bg-gray-200 rounded-md w-3/4 mb-4"></div>
        <div className="h-10 bg-gray-300 rounded-md w-1/2"></div>
    </div>
);

export default function KpiCard({ title, value, icon, isLoading }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg flex items-center justify-between transition-transform transform hover:-translate-y-1">
      {isLoading ? (
        <Skeleton />
      ) : (
        <>
          <div>
            <p className="text-sm font-semibold text-gray-500">{title}</p>
            <p className="text-4xl font-bold text-gray-800 mt-1">{value}</p>
          </div>
          <div className="bg-indigo-100 text-indigo-600 p-4 rounded-full">
            {icon}
          </div>
        </>
      )}
    </div>
  );
}