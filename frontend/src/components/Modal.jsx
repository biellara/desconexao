import React from 'react';
import { AlertTriangleIcon, CheckCircleIcon, XCircleIcon } from './Icons';

export default function Modal({ type, title, message, onConfirm, onCancel, show }) {
  if (!show) return null;

  const icons = {
    confirm: <AlertTriangleIcon className="h-10 w-10 text-yellow-500" />,
    success: <CheckCircleIcon className="h-10 w-10 text-green-500" />,
    error: <XCircleIcon className="h-10 w-10 text-red-500" />,
  };
  
  const confirmButtonColors = {
    confirm: 'bg-yellow-500 hover:bg-yellow-600',
    success: 'bg-indigo-600 hover:bg-indigo-700',
    error: 'bg-red-600 hover:bg-red-700',
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md transform transition-all">
        <div className="p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-6">
            {icons[type]}
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
          <p className="text-gray-600 mt-4">{message}</p>
        </div>
        <div className="bg-gray-50 px-8 py-5 rounded-b-2xl flex flex-col sm:flex-row-reverse gap-4">
          {type === 'confirm' ? (
            <>
              <button
                onClick={onConfirm}
                className={`w-full sm:w-auto px-6 py-3 text-white font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105 ${confirmButtonColors[type]}`}
              >
                Confirmar
              </button>
              <button
                onClick={onCancel}
                className="w-full sm:w-auto px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-100 transition"
              >
                Cancelar
              </button>
            </>
          ) : (
             <button
                onClick={onCancel}
                className={`w-full sm:w-auto px-6 py-3 text-white font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105 ${confirmButtonColors[type]}`}
              >
                Fechar
              </button>
          )}
        </div>
      </div>
    </div>
  );
}