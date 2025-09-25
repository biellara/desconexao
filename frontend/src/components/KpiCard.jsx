import React from 'react';

const Skeleton = () => (
    <div className="animate-pulse flex flex-col justify-between w-full">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4 mb-4"></div>
        <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded-md w-1/2"></div>
    </div>
);

export default function KpiCard({ title, value, icon, isLoading }) {
  return (
    <div className="bg-card text-card-foreground p-6 rounded-2xl shadow-lg flex items-center justify-between transition-transform transform hover:-translate-y-1">
      {isLoading ? (
        <Skeleton />
      ) : (
        <>
          <div>
            <p className="text-sm font-semibold text-secondary">{title}</p>
            <p className="text-4xl font-bold mt-1">{value}</p>
          </div>
          <div className="bg-primary-light text-primary dark:bg-primary-dark/20 dark:text-primary-light p-4 rounded-full">
            {React.cloneElement(icon, { className: 'h-8 w-8' })}
          </div>
        </>
      )}
    </div>
  );
}
