import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadIcon } from './Icons.jsx';

export default function UploadCard({ onUpload, isLoading }) {
  const [selectedFile, setSelectedFile] = useState(null);

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    if (selectedFile) {
      onUpload(selectedFile);
      setSelectedFile(null);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg h-full flex flex-col">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Atualizar Relatório</h3>
      <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
        <div
          {...getRootProps()}
          className={`flex-grow flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors
            ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}
        >
          <input {...getInputProps()} />
          <UploadIcon className="w-12 h-12 text-gray-400 mb-3" />
          <p className="text-center font-semibold text-gray-600">
            {selectedFile ? selectedFile.name : (isDragActive ? 'Solte o arquivo aqui!' : 'Arraste ou clique para selecionar')}
          </p>
          <p className="text-xs text-gray-500 mt-1">.XLSX, .XLS ou .CSV</p>
        </div>
        
        <button 
          type="submit" 
          disabled={!selectedFile || isLoading}
          className="w-full bg-indigo-600 text-white font-bold py-3 mt-4 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg"
        >
          {isLoading ? 'Processando...' : 'Processar Arquivo'}
        </button>
      </form>
    </div>
  );
}