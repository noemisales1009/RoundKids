# 📋 CHECKLIST ESTRUTURADO - Tabelas do Supabase RoundKids

## 🔴 TABELAS CRÍTICAS (Sistema depende delas)

### 1️⃣ **patients**
```
✓ Dados: id, name, bed_number, age, weight, admission_date, comorbidities
✓ Operações: SELECT, UPDATE
✓ Frequência: MUITO ALTA (toda ação referencia paciente)
✓ Linhas: App.tsx 3001, 3571, 2561
✓ Real-time: Não
✓ Backup: Crítico - é a raiz de todos os dados
```

### 2️⃣ **alertas_paciente**
```
✓ Dados: id_alerta, patient_id, tipo, descricao, status, created_by, created_at
✓ Operações: CRUD
✓ Frequência: ALTA
✓ Linhas: App.tsx 824, 3727, 3763
✓ Real-time: SIM - Subscription ativa em linha 850
✓ View: alertas_paciente_view_completa
✓ Relacionamento: LEFT JOIN com users para created_by_name
```

### 3️⃣ **tasks**
```
✓ Dados: id_alerta, patient_id, deadline, status, tipo_alerta, created_by
✓ Operações: CRUD
✓ Frequência: ALTA
✓ Linhas: App.tsx 828, 3743, 2633-2682
✓ Real-time: SIM - Subscription ativa em linha 857
✓ View: tasks_view_horario_br (com data formatada BR)
✓ Relacionamento: LEFT JOIN com users para created_by_name
✓ Propósito: Tarefas/Alarmes com prazo
```

---

## 🟡 TABELAS DE ALTA IMPORTÂNCIA

### 4️⃣ **scale_scores**
```
✓ Dados: id, patient_id, escala_tipo, pontuacao, risco, data, observacoes
✓ Operações: CREATE, READ
✓ Frequência: MUITO ALTA (11+ calculadores diferentes)
✓ Escalas suportadas:
  • Braden (risco úlcera)
  • Braden-QD (pediátrica)
  • FLACC (dor pediátrica)
  • Comfort-B (conforto)
  • Glasgow (nível consciência)
  • CAM-ICU (delirium)
  • CRSRS (abstinência)
  • Consciousness
  • VNICNAF
  • SOSPD
  • FSS (Functional Status)
✓ Componentes: Todos os calculadores lazy-loaded
```

### 5️⃣ **paciente_diagnosticos**
```
✓ Dados: id, patient_id, pergunta_id, resposta, data_resposta, created_by
✓ Operações: CRUD
✓ Frequência: MÉDIA-ALTA
✓ Componentes: DiagnosticsSection.tsx, DiagnosticsAdmin.tsx
✓ Auditoria: Cada mudança cria registro em diagnosticos_historico
✓ Importante: Correlacionado com perguntas_diagnistico
```

---

## 🔵 TABELAS DE MÉDIA IMPORTÂNCIA

### 6️⃣ **medicacoes_pacientes**
```
✓ Função: Prescrição e controle de medicações
✓ Dados: id, patient_id, medicacao, dosagem, unidade, via, frequencia, data_inicio, data_fim
✓ Operações: CRUD
✓ Linhas: INSERT(3304), UPDATE(3355, 3362, 3404), DELETE(3362)
✓ Modal: AddMedicationModal, EditMedicationModal
```

### 7️⃣ **dispositivos_pacientes**
```
✓ Função: Tubos, cateteres, sondas, etc
✓ Dados: id, patient_id, tipo, data_inicio, data_remocao
✓ Operações: CRUD
✓ Linhas: INSERT(3279), UPDATE, DELETE(3340)
✓ Soft-delete: usa data_remocao
✓ Modal: AddDeviceModal, EditDeviceModal, AddRemovalDateModal
```

### 8️⃣ **exames_pacientes**
```
✓ Função: Resultados laboratoriais e clínicos
✓ Dados: id, patient_id, tipo, resultado, data, referencia
✓ Operações: CRUD
✓ Linhas: INSERT(3290), UPDATE(3380), DELETE(3380)
✓ Modal: AddExamModal, EditExamModal
```

### 9️⃣ **procedimentos_pacientes**
```
✓ Função: Cirurgias e procedimentos
✓ Dados: id, patient_id, tipo, data, descricao, cirurgiao
✓ Operações: CRUD
✓ Linhas: INSERT(3316), UPDATE, DELETE(3430)
✓ Modal: AddSurgicalProcedureModal, EditSurgicalProcedureModal
```

### 🔟 **culturas_pacientes**
```
✓ Função: Culturas microbiológicas
✓ Dados: id, patient_id, tipo (sangue/urina/secrecao), data_coleta, resultado
✓ Operações: CRUD
✓ Linhas: INSERT(3450), UPDATE(3463), DELETE(3470)
✓ Modal: AddCultureModal, EditCultureModal
```

---

## 🟢 TABELAS SUPORTE

### 1️⃣1️⃣ **dietas_pacientes**
```
✓ Função: Prescrição e controle de dietas
✓ Dados: id, patient_id, tipo_dieta, volume_diario, data_inicio, data_remocao
✓ Operações: CRUD
✓ Linhas: INSERT(3483), UPDATE(3502, 3510), DELETE
✓ Soft-delete: usa data_remocao
✓ Modals: AddDietModal, EditDietModal, AddDietRemovalDateModal
✓ Campos extras: CAMPOS_ADICIONAIS_DIETAS.tsx
```

### 1️⃣2️⃣ **precautions**
```
✓ Função: Precauções especiais (isolamento, alergia, etc)
✓ Dados: id, patient_id, tipo_precaucao, descricao, ativa, data
✓ Operações: CRUD
✓ Linhas: INSERT(3529), UPDATE(3541), DELETE(3548, 3559)
✓ Componente: PrecautionsCard.tsx
```

### 1️⃣3️⃣ **diurese**
```
✓ Função: Medidas de volume de urina
✓ Dados: id, patient_id, volume, data_hora, tipo (espontânea/cateter)
✓ Operações: CREATE, READ
✓ Linhas: INSERT(DiuresisCalc:61), SELECT(3014)
✓ Componentes: DiuresisCalc.tsx, DiuresisHistory.tsx, LatestCalculationsCard.tsx
```

### 1️⃣4️⃣ **balanco_hidrico**
```
✓ Função: Balanço entrada vs saída
✓ Dados: id, patient_id, entrada_total, saida_total, balance, data
✓ Operações: CREATE, READ
✓ Linhas: INSERT(FluidBalanceCalc:60), SELECT(3015)
✓ Componentes: FluidBalanceCalc.tsx, FluidBalanceHistory.tsx
```

---

## 📋 TABELAS DE CONFIGURAÇÃO E QUESTIONÁRIOS

### 1️⃣5️⃣ **checklist_answers**
```
✓ Função: Respostas do checklist diário
✓ Dados: id, patient_id, pergunta_id, resposta, data
✓ Operações: UPSERT, READ
✓ Linhas: UPSERT(3265), SELECT(3010)
✓ Propósito: Avaliação diária do paciente
```

### 1️⃣6️⃣ **perguntas**
```
✓ Função: Define perguntas do checklist
✓ Dados: id, categoria_id, descricao, ordem, tipo
✓ Operações: READ
✓ Linhas: SELECT(3007)
✓ Ordenação: order: 'ordem', ascending: true
```

### 1️⃣7️⃣ **pergunta_opcoes**
```
✓ Função: Opções de resposta para checklist
✓ Dados: id, pergunta_id, opcao, ordem
✓ Operações: READ
✓ Linhas: SELECT(3008)
```

### 1️⃣8️⃣ **categorias**
```
✓ Função: Grupos de perguntas do checklist
✓ Dados: id, nome, ordem, icone
✓ Operações: READ
✓ Linhas: SELECT(3009, 3627)
```

---

## 🔬 TABELAS DIAGNÓSTICO

### 1️⃣9️⃣ **perguntas_diagnistico**
```
✓ Função: Perguntas específicas para diagnóstico
✓ Dados: id, descricao, ordem
✓ Operações: READ, CREATE, UPDATE
✓ Linhas: SELECT(DiagnosticsSection:60), CRU em DiagnosticsAdmin.tsx
✓ Diferente: De perguntas normais (separado)
```

### 2️⃣0️⃣ **pergunta_opcoes_diagnostico**
```
✓ Função: Opções para perguntas diagnóstico
✓ Dados: id, pergunta_id, opcao, ordem
✓ Operações: READ, CREATE, UPDATE
✓ Linhas: SELECT(DiagnosticsSection:61)
```

### 2️⃣1️⃣ **diagnosticos_historico**
```
✓ Função: Auditoria de mudanças em diagnósticos
✓ Dados: id, patient_id, pergunta_id, resposta_anterior, resposta_nova, created_by, data_mudanca
✓ Operações: INSERT (automático), READ
✓ Linhas: INSERT(DiagnosticsSection:214), SELECT(724)
✓ Importante: Criado automaticamente quando diagnosticos mudam
```

---

## 👤 TABELA DE USUÁRIOS

### 2️⃣2️⃣ **users**
```
✓ Função: Perfil de usuários do sistema
✓ Dados: id, name, email, avatar_url
✓ Operações: READ, UPSERT
✓ Linhas: SELECT(3817), UPSERT(3860)
✓ Importante: Sincronizado com auth.users
✓ Uso: Identificar criador em alertas/diagnósticos/tarefas
```

---

## 🔄 VIEWS (Tabelas Virtuais)

### VIEW 1️⃣ **alertas_paciente_view_completa**
```
✓ Função: Alertas + nome do usuário criador
✓ SQL: SELECT a.*, u.name as created_by_name FROM alertas_paciente a LEFT JOIN users u
✓ Uso: App.tsx 2560, AlertasSection 64, AlertsHistoryScreen 28
✓ Motivo: Evita JOIN no frontend
```

### VIEW 2️⃣ **tasks_view_horario_br**
```
✓ Função: Tarefas com data/hora formatada para Brasil
✓ SQL: SELECT t.*, u.name as created_by_name FROM tasks t LEFT JOIN users u
✓ Uso: App.tsx 2559, AlertasSection 60, AlertsHistoryScreen 27
✓ Motivo: Formatação de data já feita no banco
```

### VIEW 3️⃣ **diagnosticos_historico_com_usuario**
```
✓ Função: Histórico de diagnósticos com nome do criador
✓ Uso: App.tsx 724
```

### VIEW 4️⃣ **alert_completions_with_user**
```
✓ Função: Completações de alertas com usuário
✓ Uso: App.tsx 876 (Real-time)
```

### VIEW 5️⃣ **dashboard_summary**
```
✓ Função: Resumo para dashboard
✓ Uso: App.tsx 433 (Dashboard page)
```

---

## 💾 STORAGE

### 🎬 Bucket: **roundfoto**
```
✓ Tipo: Bucket PÚBLICO
✓ Função: Fotos de pacientes
✓ Upload: App.tsx linha 2865
✓ Get URL: App.tsx linha 2877
✓ CRÍTICO: Deve ser PUBLIC para exibir fotos
✓ Estrutura: /patient-id/filename.jpg
```

---

## ⚡ REAL-TIME SUBSCRIPTIONS (3 Canais Ativos)

### Canal 1️⃣: alertas_paciente
```typescript
// Linha 850 (App.tsx)
supabase.channel('alertas_paciente').on(
  'postgres_changes',
  { event: '*', schema: 'public', table: 'alertas_paciente' },
  handleAlertsChange
)
```

### Canal 2️⃣: tasks
```typescript
// Linha 857 (App.tsx)
supabase.channel('tasks').on(
  'postgres_changes',
  { event: '*', schema: 'public', table: 'tasks' },
  handleTasksChange
)
```

### Canal 3️⃣: alert_completions
```typescript
// Linha 890 (App.tsx)
supabase.channel('alert_completions').on(
  'postgres_changes',
  { event: '*', schema: 'public', table: 'alert_completions' },
  handleCompletionsChange
)
```

---

## 🔐 AUDITORIA E TRACKING

### Tabelas com created_by
```
✓ tasks ..................... Quem criou a tarefa
✓ alertas_paciente .......... Quem criou o alerta
✓ paciente_diagnosticos ..... Quem diagnosticou
✓ diagnosticos_historico .... Quem mudou o diagnóstico
```

### Tabelas com timestamps
```
✓ Todas têm: created_at (criação)
✓ Algumas têm: updated_at (atualização)
✓ Soft-delete usa: data_remocao
```

---

## 🎯 MAPEAMENTO: COMPONENTES ↔ TABELAS

```
App.tsx (Principal)
├─ patients (3001, 3571)
├─ scale_scores (3437)
├─ tasks (3743, 2633-2682)
├─ alertas_paciente (3763, 3727)
├─ medicacoes_pacientes (3304-3404)
├─ dispositivos_pacientes (3279-3387)
├─ exames_pacientes (3290-3380)
├─ procedimentos_pacientes (3316-3430)
├─ culturas_pacientes (3450-3470)
├─ dietas_pacientes (3483-3510)
├─ precautions (3529-3559)
├─ checklist_answers (3265)
└─ storage.roundfoto (2865, 2877)

DiagnosticsSection.tsx
├─ paciente_diagnosticos (CRUD)
├─ diagnosticos_historico (INSERT)
├─ perguntas_diagnistico (SELECT)
└─ pergunta_opcoes_diagnostico (SELECT)

AlertasSection.tsx
├─ alertas_paciente_view_completa
├─ tasks_view_horario_br
└─ Real-time subscriptions

Calculadores (Braden, FLACC, etc)
└─ scale_scores (INSERT)
```

---

## 📊 CARGA DE DADOS INICIAL (useEffect)

```typescript
// App.tsx linhas 3001-3015
Promise.all([
  supabase.from('patients').select('*'),              // 1
  supabase.from('dispositivos_pacientes').select('*'),// 2
  supabase.from('exames_pacientes').select('*'),      // 3
  supabase.from('medicacoes_pacientes').select('*'),  // 4
  supabase.from('procedimentos_pacientes').select('*'),// 5
  supabase.from('scale_scores').select('*'),          // 6
  supabase.from('perguntas').select('*').order(...),  // 7
  supabase.from('pergunta_opcoes').select('*').order(...),// 8
  supabase.from('categorias').select('*').order(...), // 9
  supabase.from('checklist_answers').select('*').eq('date', today),// 10
  supabase.from('culturas_pacientes').select('*'),    // 11
  supabase.from('dietas_pacientes').select('*'),      // 12
  supabase.from('precautions').select('*'),           // 13
  supabase.from('diurese').select('*'),               // 14
  supabase.from('balanco_hidrico').select('*')        // 15
])
```

---

## 🔍 ÍNDICES RECOMENDADOS (Performance)

```sql
-- Básicos (provavelmente existem)
CREATE INDEX idx_tasks_patient_id ON tasks(patient_id);
CREATE INDEX idx_alertas_paciente_patient_id ON alertas_paciente(patient_id);

-- Para created_by tracking
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_alertas_created_by ON alertas_paciente(created_by);

-- Para filtros de data
CREATE INDEX idx_tasks_deadline ON tasks(deadline);
CREATE INDEX idx_scale_scores_date ON scale_scores(date);
```

---

## ✅ CHECKLIST DE VERIFICAÇÃO

- [ ] Todas as 22 tabelas existem no banco
- [ ] 5 Views criadas e ativas
- [ ] RLS policies configuradas
- [ ] Real-time subscriptions funcionando
- [ ] created_by tracking implementado
- [ ] Bucket roundfoto é PÚBLICO
- [ ] Índices de performance criados
- [ ] Backups configurados

---

**Documento:** CHECKLIST_TABELAS_COMPLETO.md
**Data:** 20 de janeiro de 2026
**Status:** ✅ COMPLETO E PRONTO PARA IMPRESSÃO
