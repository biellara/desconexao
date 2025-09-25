# 📌 Roadmap Evolutivo — Checklist do Projeto

---

## 🚀 Fase 1: Fundações e MVP Robusto  
**Objetivo:** Fortalecer a arquitetura atual, garantir a estabilidade e preparar o terreno para futuras funcionalidades.

### Backend (FastAPI)  
- [x] **Implementar Processamento Assíncrono**  
- [x] **Melhorar Validação com Pydantic**  
- [x] **Adicionar Logging Estruturado**  

### Frontend (React)  
- [x] **Refatorar e Componentizar a UI**  
- [x] **Melhorar Feedback ao Usuário**  

---

## 📊 Fase 2: Melhoria da Experiência do Usuário (UX) e Análise de Dados  
**Objetivo:** Transformar o dashboard em uma ferramenta de trabalho mais interativa, informativa e agradável de usar.

### Tabela de Clientes Interativa  
- [x] **Implementar Paginação**  
- [x] **Adicionar Ordenação**  
- [x] **Criar Filtros e Busca em Tempo Real**  

### Visualização de Dados  
- [x] **Criar Endpoints de Agregação no Backend**  
- [x] **Integrar Gráficos no Frontend**  
  - [x] Conectar os componentes `ClientsByRegionChart.jsx` e `OfflineHistoryChart.jsx`.  
  - [x] Substituir gráfico de **Clientes por Cidade** por **gráfico de barras horizontais** para melhor legibilidade.  
  - [x] Aumentar a área dos gráficos (`col-span-4` + altura fixa) para maior destaque.  
  - [x] Adicionar **tooltip com variação percentual** no histórico.  

### Design e Usabilidade  
- [x] **Paleta de Cores Consistente**  
  - [x] Definir 3 cores oficiais: primária (ex: azul), secundária (cinza neutro) e de alerta (vermelho).  
- [x] **Badges Coloridas para Status**  
  - [x] Verde = <24h offline, Amarelo = 24–48h, Vermelho = >48h.  
- [x] **Indicador de Paginação na Tabela**  
  - [x] Exibir “Exibindo 1–10 de X clientes” abaixo da tabela.  
- [x] **KPIs no Topo**  
  - [x] Total de clientes offline (já existe).  
  - [x] % da base offline.  
  - [x] Cidade com mais clientes offline.  
  - [x] Tempo médio desconectado.  
- [x] **Dark Mode (opcional)**  
  - [x] Implementar toggle de tema para ambientes de operação (NOC).  
- [x] **Exportação Rápida**  
  - [x] Botão para exportar dados em CSV/Excel diretamente do dashboard.  

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

@@ -83,16 +74,10 @@

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