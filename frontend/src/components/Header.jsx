import React from 'react';
import { MoonIcon, SunIcon } from './Icons';

export default function Header({ theme, onThemeToggle }) {
  // O título agora será gerenciado pela própria página para maior flexibilidade
  return (
    <div className="flex justify-end items-center mb-6">
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
    </div>
  );
}
