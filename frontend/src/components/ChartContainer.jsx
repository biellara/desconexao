import React from 'react';

const Skeleton = () => (
    <div className="w-full h-full animate-pulse bg-gray-200 rounded-xl"></div>
);

export default function ChartContainer({ title, children, isLoading }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg h-full flex flex-col">
      <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
      <div className="flex-grow flex items-center justify-center min-h-[300px]">
        {isLoading ? <Skeleton /> : children}
      </div>
    </div>
  );
}