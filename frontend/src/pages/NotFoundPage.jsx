import React from 'react';
import { NavLink } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <h1 className="text-9xl font-extrabold text-primary tracking-widest">404</h1>
      <div className="bg-alert px-2 text-sm rounded rotate-12 absolute">
        Página Não Encontrada
      </div>
      <p className="text-secondary mt-4">
        Desculpe, a página que você está procurando não existe.
      </p>
      <NavLink
        to="/dashboard"
        className="mt-6 px-5 py-3 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
      >
        Voltar para o Início
      </NavLink>
    </div>
  );
}
