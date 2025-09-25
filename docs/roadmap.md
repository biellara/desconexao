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
- [ ] **Implementar Redirecionamento Dinâmico**  

---

## 🤖 Fase 3: Automação e Proatividade  
**Objetivo:** Eliminar a necessidade de intervenção manual, transformando o sistema em uma ferramenta de monitoramento proativo.

### Automação da Coleta  
- [ ] **Desenvolver Script "Robô" de Coleta**  
- [ ] **Criar Endpoint para Ingestão Automática**  
- [ ] **Agendar a Execução (Cron Job)**  

### Inteligência de Dados  
- [ ] **Implementar Lógica de Desduplicação**  
- [ ] **Criar Sistema de Alertas Automáticos**  

---

## 🔒 Fase 4: Escalabilidade e Features Avançadas  
**Objetivo:** Adicionar funcionalidades que aumentem a segurança, a inteligência e o valor da ferramenta para a empresa.

### Segurança e Controle  
- [ ] **Implementar Autenticação de Usuários**  
- [ ] **Adicionar Gerenciamento de Status**  

### Inteligência de Dados  
- [ ] **Dashboard de Histórico Avançado**  

### DevOps  
- [ ] **Configurar CI/CD (Integração e Deploy Contínuos)**  
