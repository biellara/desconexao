import React from 'react';

const Skeleton = () => (
    <div className="w-full h-full animate-pulse bg-secondary-light dark:bg-secondary-dark/20 rounded-xl"></div>
);

export default function ChartContainer({ title, children, isLoading }) {
  return (
    <div className="bg-card text-card-foreground p-6 rounded-2xl shadow-lg h-full flex flex-col">
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <div className="flex-grow flex items-center justify-center min-h-[400px]">
        {isLoading ? <Skeleton /> : children}
      </div>
    </div>
  );
}
