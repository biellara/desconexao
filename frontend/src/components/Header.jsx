import React from 'react';
import { MoonIcon, SunIcon } from './Icons';

export default function Header({ theme, onThemeToggle }) {
  return (
    <header className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold">
          Dashboard de Clientes Offline
        </h1>
        <p className="text-secondary mt-1">
          Monitoramento de desconexões na rede.
        </p>
      </div>
      <button
        onClick={onThemeToggle}
        className="p-2 rounded-full hover:bg-secondary-light dark:hover:bg-secondary-dark/30 transition-colors"
        aria-label="Mudar tema"
      >
        {theme === 'light' ? (
          <MoonIcon className="h-6 w-6" />
        ) : (
          <SunIcon className="h-6 w-6" />
        )}
      </button>
    </header>
  );
}
