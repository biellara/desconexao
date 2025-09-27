import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import { SpinnerIcon } from './components/Icons';

// Lazy loading das páginas para otimizar o carregamento inicial
const DashboardVisaoGeral = lazy(() => import('./pages/DashboardVisaoGeral'));
const ClientesCriticosPage = lazy(() => import('./pages/ClientesCriticosPage'));
const SacPerformancePage = lazy(() => import('./pages/SacPerformancePage')); // Nova página importada
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<DashboardVisaoGeral />} />
        <Route path="dashboard" element={<DashboardVisaoGeral />} />
        
        {/* Módulo de Saúde da Rede */}
        <Route 
          path="saude-rede/clientes-criticos" 
          element={
            <Suspense fallback={<div className="flex justify-center items-center h-full"><SpinnerIcon className="h-10 w-10 text-primary" /></div>}>
              <ClientesCriticosPage />
            </Suspense>
          } 
        />
        
        {/* Módulo de Performance do SAC */}
        <Route 
          path="performance-sac" 
          element={
            <Suspense fallback={<div className="flex justify-center items-center h-full"><SpinnerIcon className="h-10 w-10 text-primary" /></div>}>
              <SacPerformancePage />
            </Suspense>
          } 
        />

        {/* Rota para página não encontrada */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;

