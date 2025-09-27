import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, HeartPulseIcon, UsersGroupIcon, LogoIcon } from './Icons'; // Adicionar novos ícones

const NavItem = ({ to, icon, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center px-4 py-3 my-1 transition-colors duration-200 transform rounded-lg hover:bg-primary-light hover:text-primary-dark dark:hover:bg-primary-dark/20 dark:hover:text-primary-light ${
        isActive ? 'bg-primary-light text-primary-dark dark:bg-primary-dark/30 dark:text-primary-light font-bold' : 'text-secondary'
      }`
    }
  >
    {React.cloneElement(icon, { className: 'h-6 w-6' })}
    <span className="mx-4 font-medium">{children}</span>
  </NavLink>
);

export default function Sidebar() {
  return (
    <aside className="flex flex-col w-64 h-screen px-4 py-8 overflow-y-auto bg-card border-r rtl:border-r-0 rtl:border-l dark:border-secondary-dark/20">
      <div className="flex items-center px-4">
        <LogoIcon className="h-8 w-8 text-primary" />
        <span className="ml-2 text-xl font-bold">Operações</span>
      </div>

      <div className="flex flex-col justify-between flex-1 mt-6">
        <nav>
          <NavItem to="/dashboard" icon={<HomeIcon />}>
            Visão Geral
          </NavItem>
          
          <p className="px-4 mt-4 mb-2 text-xs text-secondary/70 uppercase">Módulos</p>
          
          <NavItem to="/saude-rede/clientes-criticos" icon={<HeartPulseIcon />}>
            Saúde da Rede
          </NavItem>
          
          <NavItem to="/performance-sac" icon={<UsersGroupIcon />}>
            Performance SAC
          </NavItem>

          {/* Adicionar novos links de navegação aqui */}
        </nav>
      </div>
    </aside>
  );
}
