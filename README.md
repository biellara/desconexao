# 📖 Projeto: Dashboard ONUs — Monitoramento de Clientes OFF > 48h

## 🔹 Visão Geral

O **Dashboard ONUs** é uma aplicação web desenvolvida para provedores de internet que desejam **automatizar o monitoramento de clientes desconectados**. A solução processa relatórios exportados do sistema **OLT Cloud**, identifica quais ONUs estão **sem sinal (LOSS)** e calcula há quanto tempo os clientes estão offline, destacando aqueles que estão **OFF por mais de 48 horas**.

Essa aplicação tem como objetivo eliminar processos manuais de análise de relatórios, fornecendo **um dashboard dinâmico e acessível via web**, além da possibilidade de manter **histórico** e gerar **alertas automáticos**.

---

## 🔹 Funcionalidades Principais (MVP)

* Upload de relatórios **Excel/CSV** exportados do OLT Cloud.
* Processamento automático dos dados (via backend Python).
* Identificação de clientes com **Status = LOSS**.
* Cálculo do tempo de desconexão e filtragem de clientes com **mais de 48h OFF**.
* Dashboard web com:

  * **Tabela** dos clientes afetados.
  * **Card** com o total de clientes OFF > 48h.
  * **Filtros** por OLT/região.
* Persistência no **Supabase (Postgres)** para histórico.

---

## 🔹 Stack de Tecnologias

* **Frontend:** React + Vite, TailwindCSS, Axios, Supabase JS SDK.
* **Backend:** FastAPI (Python), Pandas, SQLAlchemy, Supabase client.
* **Banco de Dados:** Supabase (Postgres).
* **Infra/Hospedagem:** Backend no Render/Railway, Frontend no Vercel/Netlify, Banco no Supabase.

---

## 🔹 Estrutura do Projeto

```bash
olt-dashboard/
│
├── backend/                        # API (FastAPI)
│   ├── main.py                     # Rotas principais
│   ├── services/                   
│   │   ├── file_processor.py       # Processamento do Excel/CSV
│   │   ├── supabase_client.py      # Conexão e queries no Supabase
│   ├── models/                     
│   │   ├── cliente_off.py          # Modelo ORM/DTO
│   ├── requirements.txt            # Dependências do Python
│
├── frontend/                       # Interface (React + Vite)
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── UploadFile.jsx      # Upload de relatórios
│   │   │   ├── ClientTable.jsx     # Tabela de clientes off
│   │   │   ├── StatsCard.jsx       # Cards de resumo
│   │   ├── services/
│   │   │   ├── api.js              # Comunicação com backend
│   │   │   ├── supabase.js         # Conexão direta com Supabase
│   ├── package.json
│
├── docs/                           # Documentação
│   ├── roadmap.md
│   ├── arquitetura.png             # Diagrama da arquitetura
│
└── README.md                       # Documentação do projeto
```

---

## 🔹 Roadmap de Desenvolvimento

1. Configuração do Supabase (projeto + tabelas).
2. Desenvolvimento do backend (FastAPI) com rota `/upload`.
3. Integração Pandas para processar relatórios Excel/CSV.
4. Persistência dos dados processados no Supabase.
5. Desenvolvimento do frontend (React + Vite).
6. Implementação do dashboard (cards, tabelas, filtros).
7. Integração frontend ↔ backend ↔ banco.
8. Deploy da aplicação (backend + frontend).

---

## 🔹 Futuras Evoluções

* Ingestão automática de relatórios (robô para baixar CSV direto do OLT Cloud).
* **Alertas automáticos** via e-mail, WhatsApp ou Teams quando cliente ficar >48h OFF.
* Relatórios históricos e gráficos de tendência (quantidade de clientes OFF por período).
* Autenticação de usuários com Supabase Auth.
* Multi-tenant: suporte para vários provedores em uma única aplicação.

---

## 🔹 Público-Alvo

Provedores de internet que utilizam OLTs e precisam acompanhar a situação de clientes desconectados de forma **rápida, visual e automatizada**, sem depender de análises manuais demoradas.

---

## 🔹 Objetivo Final

Fornecer uma aplicação web confiável que permita **monitorar proativamente a saúde da rede**, **reduzir tempo de resposta para clientes críticos** e **facilitar a tomada de decisão operacional** através de dados organizados e acessíveis em qualquer dispositivo.
