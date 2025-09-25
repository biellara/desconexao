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
    <div className="bg-card text-card-foreground p-6 rounded-2xl shadow-lg h-full flex flex-col">
      <h3 className="text-xl font-bold mb-4">Atualizar Relatório</h3>
      <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
        <div
          {...getRootProps()}
          className={`flex-grow flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-primary bg-primary-light dark:bg-primary-dark/20' 
              : 'border-secondary/30 bg-background hover:bg-secondary-light dark:hover:bg-secondary-dark/20'
            }`}
        >
          <input {...getInputProps()} />
          <UploadIcon className="w-12 h-12 text-secondary mb-3" />
          <p className="text-center font-semibold text-foreground">
            {selectedFile ? selectedFile.name : (isDragActive ? 'Solte o arquivo aqui!' : 'Arraste ou clique para selecionar')}
          </p>
          <p className="text-xs text-secondary mt-1">.XLSX, .XLS ou .CSV</p>
        </div>
        
        <button 
          type="submit" 
          disabled={!selectedFile || isLoading}
          className="w-full bg-primary text-white font-bold py-3 mt-4 rounded-lg hover:bg-primary-dark disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg"
        >
          {isLoading ? 'Processando...' : 'Processar Arquivo'}
        </button>
      </form>
    </div>
  );
}
