import React from "react";

// Componente base para todos os ícones
const Icon = ({ children, className = "h-6 w-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    {children}
  </svg>
);

// --- ÍCONES EXISTENTES ---

// Ícone para total de clientes
export const UsersIcon = ({ className }) => (
  <Icon className={className}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </Icon>
);

// Ícone para tempo/horas
export const ClockIcon = ({ className }) => (
  <Icon className={className}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </Icon>
);

// Ícone para upload de arquivo
export const UploadIcon = ({ className }) => (
  <Icon className={className}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
    />
  </Icon>
);

// Ícone de lixeira para exclusão
export const TrashIcon = ({ className }) => (
  <Icon className={className}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </Icon>
);

// Ícone de busca/filtro
export const SearchIcon = ({ className }) => (
  <Icon className={className}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </Icon>
);

// Ícone de alerta para modais de confirmação
export const AlertTriangleIcon = ({ className }) => (
  <Icon className={className}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    />
  </Icon>
);

// Ícone de sucesso
export const CheckCircleIcon = ({ className }) => (
  <Icon className={className}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </Icon>
);

// Ícone de erro
export const XCircleIcon = ({ className }) => (
  <Icon className={className}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </Icon>
);

// Ícones de ordenação
export const ChevronUpIcon = ({ className }) => (
  <Icon className={className}>
    {" "}
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />{" "}
  </Icon>
);
export const ChevronDownIcon = ({ className }) => (
  <Icon className={className}>
    {" "}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19 9l-7 7-7-7"
    />{" "}
  </Icon>
);
export const ChevronUpDownIcon = ({ className }) => (
  <Icon className={className}>
    {" "}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 9l4-4 4 4m0 6l-4 4-4-4"
    />{" "}
  </Icon>
);

// Ícone para Exportar
export const DownloadIcon = ({ className }) => (
  <Icon className={className}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
    />
  </Icon>
);

// Ícones de Tema
export const SunIcon = ({ className }) => (
  <Icon className={className}>
    {" "}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M12 12a4 4 0 11-8 0 4 4 0 018 0z"
    />{" "}
  </Icon>
);
export const MoonIcon = ({ className }) => (
  <Icon className={className}>
    {" "}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
    />{" "}
  </Icon>
);

// Ícones de Status e KPI
export const SpinnerIcon = ({ className = "h-8 w-8" }) => (
  <svg
    className={`animate-spin ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    {" "}
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>{" "}
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>{" "}
  </svg>
);
export const UserPlusIcon = ({ className }) => (
  <Icon className={className}>
    {" "}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />{" "}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 4v4m0 0v4m0-4h4m-4 0H8"
    />{" "}
  </Icon>
);
export const ServerIcon = ({ className }) => (
  <Icon className={className}>
    {" "}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
    />{" "}
  </Icon>
);
export const CalendarIcon = ({ className }) => (
  <Icon className={className}>
    {" "}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />{" "}
  </Icon>
);
export const XMarkIcon = ({ className }) => (
  <Icon className={className}>
    {" "}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />{" "}
  </Icon>
);

// --- NOVOS ÍCONES PARA NAVEGAÇÃO ---

// Ícone para o Logo
export const LogoIcon = ({ className }) => (
  <Icon className={className}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 18.333l-8-4.666V9.333l8 4.667 8-4.667v4.666l-8 4.667zM12 4L4 8.667 12 13.333 20 8.667 12 4z"
    />
  </Icon>
);

// Ícone para Home/Dashboard
export const HomeIcon = ({ className }) => (
  <Icon className={className}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    />
  </Icon>
);

// Ícone para Saúde da Rede
export const HeartPulseIcon = ({ className }) => (
  <Icon className={className}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14.828 12.172a.5.5 0 01.708 0l1.414 1.414a.5.5 0 010 .708l-2.122 2.12a.5.5 0 01-.707 0l-1.414-1.414a.5.5 0 010-.708l2.12-2.12zM18 12h2"
    />
  </Icon>
);

// Ícone para Performance do SAC
export const UsersGroupIcon = ({ className }) => (
  <Icon className={className}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </Icon>
);
