# 📌 Roadmap Evolutivo — Checklist do Projeto

---

## 🚀 Fase 1: Fundações e MVP Robusto  
**Objetivo:** Fortalecer a arquitetura atual, garantir a estabilidade e preparar o terreno para futuras funcionalidades.

### Backend (FastAPI)  
- [x] **Implementar Processamento Assíncrono**  
  - [x] Alterar a rota `/upload` para usar `BackgroundTasks`, permitindo que o processamento do arquivo ocorra em segundo plano e a resposta ao usuário seja imediata.  
  - [x] Adicionar uma coluna de status na tabela `relatorios` do Supabase para rastrear o progresso (`PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`).  

- [x] **Melhorar Validação com Pydantic**  
  - [x] Criar modelos Pydantic para as respostas das rotas da API, garantindo consistência e melhorando a documentação automática.  

- [x] **Adicionar Logging Estruturado**  
  - [x] Implementar a biblioteca `logging` do Python para registrar eventos importantes (início/fim de uploads, erros, etc.), facilitando a depuração.  

### Frontend (React)  
- [x] **Refatorar e Componentizar a UI**  
  - [x] Criar componentes de página (ex: `DashboardPage.jsx`) para organizar o layout principal, separando-o do `App.jsx`.  
  - [x] Isolar a lógica de chamada de API em um módulo de serviço dedicado (ex: `src/services/api.js`).  

- [ ] **Melhorar Feedback ao Usuário**  
  - [ ] Substituir os `alert()` por um sistema de notificações *toast* (ex: `react-hot-toast`) para uma experiência mais fluida.  
  - [ ] Utilizar o `Modal.jsx` existente para todas as ações que exijam confirmação do usuário.  

---

## 📊 Fase 2: Melhoria da Experiência do Usuário (UX) e Análise de Dados  
**Objetivo:** Transformar o dashboard em uma ferramenta de trabalho mais interativa, informativa e agradável de usar.

### Tabela de Clientes Interativa  
- [ ] **Implementar Paginação:** Adicionar controles de paginação para lidar com grandes volumes de dados de forma eficiente.  
- [ ] **Adicionar Ordenação:** Permitir que o usuário clique nos cabeçalhos da `ClientTable` para ordenar os dados.  
- [ ] **Criar Filtros e Busca em Tempo Real**  
  - [ ] Adicionar um campo de busca para filtrar clientes por nome ou serial da ONU.  
  - [ ] Adicionar um filtro de dropdown para selecionar clientes por `olt_regiao`.  

### Visualização de Dados  
- [ ] **Criar Endpoints de Agregação no Backend**  
  - [ ] `GET /stats/clients-by-region`: Rota para alimentar o gráfico de clientes por região.  
  - [ ] `GET /stats/offline-history`: Rota para alimentar o gráfico de histórico de clientes offline.  

- [ ] **Integrar Gráficos no Frontend**  
  - [ ] Conectar os componentes `ClientsByRegionChart.jsx` e `OfflineHistoryChart.jsx` aos novos endpoints da API para exibir dados dinâmicos.  

### Integração com ERP  
- [ ] **Adicionar Ação na Tabela**  
  - [ ] Incluir uma coluna "Ações" na `ClientTable` com um botão/link "Abrir Atendimento" para cada cliente.  

- [ ] **Implementar Redirecionamento Dinâmico**  
  - [ ] Configurar o botão para construir a URL do ERP com base em um identificador do cliente (ex: serial da ONU) e abrir em uma nova aba.  

---

## 🤖 Fase 3: Automação e Proatividade  
**Objetivo:** Eliminar a necessidade de intervenção manual, transformando o sistema em uma ferramenta de monitoramento proativo.

### Automação da Coleta  
- [ ] **Desenvolver Script "Robô" de Coleta**  
  - [ ] Criar um script em Python (usando `Selenium` ou `Playwright`) para automatizar o login no OLT Cloud e o download do relatório.  

- [ ] **Criar Endpoint para Ingestão Automática**  
  - [ ] Desenvolver uma rota segura no backend (ex: `/upload/automatico`) que será chamada pelo robô.  

- [ ] **Agendar a Execução (Cron Job)**  
  - [ ] Configurar um agendador na plataforma de hospedagem (ex: Render Cron Jobs) para executar o script de coleta em intervalos regulares (ex: a cada 4 horas).  

### Inteligência de Dados  
- [ ] **Implementar Lógica de Desduplicação**  
  - [ ] No `file_processor.py`, antes de inserir um cliente, verificar se um registro ativo para o mesmo `serial_onu` já existe para evitar duplicatas.  
  - [ ] Adicionar um campo `status` (`ATIVO`, `RESOLVIDO`) à tabela `clientes_off` para gerenciar o ciclo de vida do problema.  

- [ ] **Criar Sistema de Alertas Automáticos**  
  - [ ] Após um processamento automático bem-sucedido, se novos clientes críticos forem identificados, disparar uma notificação.  
  - [ ] Escolher e implementar um canal de alerta (E-mail, Telegram, ou um webhook para MS Teams/Slack).  

---

## 🔒 Fase 4: Escalabilidade e Features Avançadas  
**Objetivo:** Adicionar funcionalidades que aumentem a segurança, a inteligência e o valor da ferramenta para a empresa.

### Segurança e Controle  
- [ ] **Implementar Autenticação de Usuários**  
  - [ ] Utilizar o `Supabase Auth` para criar um sistema de login seguro.  
  - [ ] Proteger as rotas da API e as páginas do frontend para permitir o acesso apenas a usuários autenticados.  

- [ ] **Adicionar Gerenciamento de Status**  
  - [ ] Permitir que usuários marquem um cliente como "Resolvido" ou "Em Atendimento" diretamente pela interface.  

### Inteligência de Dados  
- [ ] **Dashboard de Histórico Avançado**  
  - [ ] Criar uma nova página dedicada a análises históricas, como tempo médio para resolução, OLTs com maior reincidência, etc.  

### DevOps  
- [ ] **Configurar CI/CD (Integração e Deploy Contínuos)**  
  - [ ] Criar um workflow (ex: GitHub Actions) para automatizar testes e o deploy do backend e frontend sempre que houver atualizações na branch principal.  
