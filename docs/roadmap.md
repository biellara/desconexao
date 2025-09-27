# 📌 Roadmap Evolutivo — Plataforma de Inteligência Operacional

---

## 🚀 Fase 1: Fundação da Plataforma e Unificação da UI/UX
**Objetivo:** Re-arquitetar a aplicação para suportar múltiplos módulos de dados, implementando uma navegação escalável e um dashboard principal que unifica os KPIs mais críticos.

### Frontend (React)
- [ ] **Layout com Menu Lateral:**  
  Substituir a estrutura de página única por navegação principal fixa.  
  *💡Melhoria:* usar **React Router v6** + **Tailwind/Chakra** para padronizar design responsivo.  
- [ ] **Roteamento de Páginas:**  
  Estruturar URLs dedicadas por módulo (`/dashboard`, `/saude-rede`, `/performance-sac`).  
  *💡Melhoria:* aplicar **lazy loading** para otimizar performance.  
- [ ] **Dashboard "Visão Geral":**  
  Criar uma home executiva que exiba KPIs-chave (Clientes Offline, Nota de Monitoria, Volume de Ligações).  
  *💡Melhoria:* incluir **filtros dinâmicos** (período, região, equipe).  
- [ ] **Centralização de Componentes:**  
  Criar biblioteca de componentes (Gráficos, KPIs, Tabelas).  
  *💡Melhoria:* documentar no **Storybook** para padronizar e facilitar reuso.

### Backend (FastAPI)
- [ ] **Refatorar Endpoint de Upload:**  
  Criar `/upload` genérico que aceita parâmetro de tipo (Desconexão, Monitoria, Retenção).  
- [ ] **Estruturar Módulos de Processamento:**  
  Processadores específicos: `processador_desconexao.py`, `processador_monitoria.py`.  
  *💡Melhoria:* usar **Celery ou RQ** para filas assíncronas, evitando travar o backend.  
- [ ] **Expandir Modelo de Dados (Supabase):**  
  Criar tabelas para SAC, Canais e Retenção.  
  *💡Melhoria:* aplicar **migrations com Alembic** para versionamento do schema.

---

## 📊 Fase 2: Módulo de Saúde da Rede (Avançado)
**Objetivo:** Expandir o monitoramento além das desconexões, criando visão 360° da qualidade da conexão.

### Frontend
- [ ] **Seção "Saúde da Rede":**  
  Nova categoria no menu.  
- [ ] **Página "Clientes Críticos":**  
  Migrar clientes offline para esta página.  
- [ ] **Página "Recorrência e Instabilidade":**  
  Gráficos + tabelas com dados de `Conexao.csv` e `Recorrencia.csv`.  
  *💡Melhoria:* incluir **heatmaps** para identificar regiões críticas.  
- [ ] **Página "Qualidade de Sinal":**  
  Identificar clientes com atenuação via `Sinal.csv`.  
  *💡Melhoria:* adicionar **ícones de severidade** (verde, amarelo, vermelho).  
- [ ] **Integração com ERP:**  
  Botão "Abrir Atendimento" com redirecionamento automático.

### Backend
- [ ] **Endpoints de Agregação:**  
  Criar APIs para Recorrência e Qualidade de Sinal.  
- [ ] **Lógica de Desduplicação e Status:**  
  - Verificar se já existe problema aberto para o cliente.  
  - Status: `ATIVO`, `EM ATENDIMENTO`, `RESOLVIDO`.  
  *💡Melhoria:* implementar **websockets** para atualização em tempo real.

---

## 🤖 Fase 3: Módulo de Performance do SAC e Automação
**Objetivo:** Medir produtividade/qualidade da equipe e iniciar automação de coleta de dados.

### Frontend
- [ ] **Seção "Performance do SAC":**  
  Nova entrada no menu.  
- [ ] **Página "Visão Geral da Equipe":**  
  Dashboards baseados em `FEEDBACK.csv`.  
- [ ] **Página "Ranking de Agentes":**  
  Ranking dinâmico de premiação via `PROJETO_DE_PREMIACAO_SAC.csv`.  
- [ ] **Página "Monitoria de Qualidade":**  
  Notas por agente/equipe.  
  *💡Melhoria:* destacar **top 5 positivos/negativos**.

### Backend & Automação
- [ ] **Endpoints SAC:**  
  APIs para performance, ranking e monitoria.  
- [ ] **Script Robô de Coleta:**  
  Automatizar login no OLT Cloud + download de relatórios (Selenium/Playwright).  
- [ ] **Agendamento:**  
  Cron Job (Render, GitHub Actions ou Supabase Edge Functions).  
  *💡Melhoria:* armazenar históricos em **S3/MinIO** para backup.

---

## 🔒 Fase 4: Inteligência, Alertas e Segurança
**Objetivo:** Tornar a plataforma proativa com alertas automáticos e garantir segurança de acesso.

### Funcionalidades
- [ ] **Sistema de Alertas Automáticos:**  
  - Detectar novos clientes críticos.  
  - Notificação por **E-mail** ou **Webhook** (MS Teams/Slack).  
  *💡Melhoria:* incluir **limiares configuráveis** (ex: só alertar >10 clientes críticos).  
- [ ] **Autenticação de Usuários:**  
  - Usar **Supabase Auth** com login seguro.  
  - Proteger rotas API e frontend.  
  *💡Melhoria:* adicionar **roles** (Admin, Operador, Visualizador).  
- [ ] **Gerenciamento de Status na UI:**  
  Alterar status dos clientes pela interface.

### DevOps
- [ ] **CI/CD:**  
  Pipeline com **GitHub Actions** para rodar testes e deploy automático (frontend + backend).  
  *💡Melhoria:* adicionar **testes e2e com Cypress** para validar fluxo completo.

---

## 🌟 Melhorias Extras (Cross-Fase)
- 📈 **Observabilidade:** usar **Prometheus + Grafana** ou **Sentry** para logs, métricas e erros.  
- ⚡ **Performance:** aplicar **caching com Redis** para APIs mais acessadas.  
- 📚 **Documentação:** manter wiki no GitHub ou Notion com tutoriais + decisões técnicas.  
- 👥 **Colaboração:** criar **board no Trello/Linear/Jira** para acompanhar as fases.  
