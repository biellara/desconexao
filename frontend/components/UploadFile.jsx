import React, { useState } from 'react';

// Este componente receberá duas props:
// onUpload: Uma função que será chamada quando o formulário for enviado.
// isLoading: Um booleano para sabermos se um upload já está em andamento.
export default function UploadFile({ onUpload, isLoading }) {
  // Usamos o 'useState' para guardar o arquivo que o usuário selecionou.
  // 'selectedFile' armazena o arquivo, e 'setSelectedFile' é a função para atualizá-lo.
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    // Quando o usuário escolhe um arquivo, o guardamos no nosso estado.
    setSelectedFile(event.target.files[0]);
  };

  const handleSubmit = (event) => {
    // Previne o comportamento padrão do formulário (que é recarregar a página).
    event.preventDefault();
    if (selectedFile) {
      // Se um arquivo foi selecionado, chamamos a função 'onUpload'
      // que recebemos via props, passando o arquivo para o componente pai (App.jsx).
      onUpload(selectedFile);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Atualizar Dados</h3>
      {/* Quando o formulário é submetido, a função handleSubmit é chamada */}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        
        {/* Usamos um 'label' estilizado para criar uma área de clique bonita.
            O 'input' de arquivo real fica escondido. */}
        <label htmlFor="file-upload" className="flex-grow border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50">
          <span className="text-gray-500">
            {/* Mostra o nome do arquivo selecionado ou um texto padrão */}
            {selectedFile ? selectedFile.name : 'Clique para selecionar o relatório'}
          </span>
          <input 
            id="file-upload" 
            type="file" 
            className="hidden" 
            onChange={handleFileChange}
            // Aceita apenas os formatos de arquivo especificados
            accept=".csv, .xlsx, .xls" 
          />
        </label>
        
        <button 
          type="submit" 
          // O botão é desabilitado se nenhum arquivo for selecionado ou se um upload estiver em andamento.
          disabled={!selectedFile || isLoading}
          className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-300"
        >
          {/* O texto do botão muda para indicar o estado de carregamento */}
          {isLoading ? 'Enviando...' : 'Enviar Arquivo'}
        </button>
      </form>
    </div>
  );
}
