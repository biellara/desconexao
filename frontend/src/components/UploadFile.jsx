import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudUploadIcon } from './Icons.jsx'; // Importando o ícone

export default function UploadFile({ onUpload, isLoading }) {
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
      setSelectedFile(null); // Limpa o arquivo após o envio
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg h-full flex flex-col">
      <h3 className="text-xl font-semibold text-gray-700 mb-4">Atualizar Relatório</h3>
      <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
        <div
          {...getRootProps()}
          className={`flex-grow flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer transition-colors
            ${isDragActive ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}
        >
          <input {...getInputProps()} />
          <CloudUploadIcon className="w-12 h-12 text-gray-400 mb-2" />
          <p className="text-center text-gray-500">
            {selectedFile ? selectedFile.name : (isDragActive ? 'Solte o arquivo aqui!' : 'Arraste ou clique para selecionar')}
          </p>
          <p className="text-xs text-gray-400 mt-1">.XLSX, .XLS ou .CSV</p>
        </div>
        
        <button 
          type="submit" 
          disabled={!selectedFile || isLoading}
          className="w-full bg-red-600 text-white font-bold py-3 mt-4 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300"
        >
          {isLoading ? 'Enviando...' : 'Enviar Arquivo'}
        </button>
      </form>
    </div>
  );
}