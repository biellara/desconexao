# 📌 Roadmap — Dashboard ONUs (Clientes OFF > 48h)

## 🔹 Etapa 1 — Planejamento

* Definir escopo mínimo (MVP):

  * Upload de relatórios Excel/CSV do OLT Cloud.
  * Processamento automático → calcular clientes OFF > 48h.
  * Salvar registros no Supabase (tabela `clientes_off`).
  * Dashboard web com lista, contador e filtros.

---

## 🔹 Etapa 2 — Stack de Tecnologias

* **Frontend:**

  * React + Vite
  * TailwindCSS (estilização rápida e responsiva)
  * Axios (consumo da API backend)
  * Supabase JS SDK (acesso direto ao banco para algumas consultas, se necessário)

* **Backend:**

  * Python (FastAPI)
  * Pandas (processar Excel/CSV)
  * SQLAlchemy + Supabase client (persistência no banco)

* **Banco de Dados:**

  * Supabase (Postgres gerenciado)
  * Tabelas principais:

    * `relatorios` (metadados do upload)
    * `clientes_off` (clientes desconectados filtrados pelo backend)

* **Infra/Hospedagem:**

  * Backend: Render/Railway (FastAPI)
  * Frontend: Vercel/Netlify (React)
  * Banco: Supabase (já gerenciado)

---

## 🔹 Etapa 3 — Estrutura de Diretórios


olt-dashboard/
│
├── backend/                        # API (FastAPI)
│   ├── main.py                     # Rotas principais
│   ├── services/                   
│   │   ├── file_processor.py       # Lógica de leitura/processamento do Excel
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
│   │   │   ├── supabase.js         # Conexão direta com Supabase (opcional)
│   ├── package.json
│
├── docs/                           # Documentação do projeto
│   ├── roadmap.md
│   ├── arquitetura.png             # Diagrama simples
│
└── README.md


---

## 🔹 Etapa 4 — Desenvolvimento Incremental

1. **Configuração do Supabase**

   * Criar projeto no Supabase.
   * Criar tabelas `relatorios` e `clientes_off`.
   * Gerar chaves de acesso.

2. **Backend (FastAPI)**

   * Rota `/upload` para receber arquivo Excel.
   * Processamento (Pandas → cálculo de OFF >48h).
   * Salvar resultado no Supabase.

3. **Frontend (React + Vite)**

   * Tela inicial com upload de arquivo.
   * Dashboard:

     * Card → Total clientes off >48h.
     * Tabela com lista filtrada.
     * Filtros por OLT/região.

4. **Integração**

   * Conectar frontend ao backend (upload).
   * Conectar backend ao Supabase.
   * (Opcional) Conectar frontend direto ao Supabase para relatórios históricos.

5. **Deploy**

   * Backend no Render/Railway.
   * Frontend no Vercel/Netlify.
   * Supabase já em nuvem.

---

## 🔹 Etapa 5 — Evoluções Futuras

* Automatizar ingestão (script que baixa CSV do OLT Cloud automaticamente).
* Alertas (e-mail/WhatsApp/Teams quando cliente ficar >48h OFF).
* Painel de histórico (gráfico de clientes off por dia/semana).
* Controle de usuários com Supabase Auth.
