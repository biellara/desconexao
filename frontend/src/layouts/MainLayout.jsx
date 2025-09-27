import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header'; // O Header agora é mais genérico

export default function MainLayout() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') || 'light'
  );

  React.useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background">
           <div className="container mx-auto px-6 py-8">
            {/* O Header pode ser usado aqui se for comum a todas as páginas */}
            {/* Ou pode ser movido para dentro de cada página para ser mais específico */}
            <Header theme={theme} onThemeToggle={toggleTheme} />
            <div className="mt-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
