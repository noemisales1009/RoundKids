# 📊 Análise Completa de Tabelas do Supabase - RoundKids

## 🎯 Resumo Executivo

Esta aplicação usa **21 tabelas principais** do Supabase + **5 views** para gerenciar dados de pacientes pediátricos em UTI, com funcionalidades de escalas de avaliação, alertas, medicações, dispositivos, culturas, dietas e precauções.

---

## 📋 TABELAS PRINCIPAIS

### 1. **patients**
**Função:** Armazena informações básicas dos pacientes

**Operações:**
- `SELECT` - Listar todos os pacientes (App.tsx:3001)
- `UPDATE` - Atualizar informações do paciente (App.tsx:3571)
- `SELECT` com filtro - Recuperar pacientes específicos

**Campos principais:**
- id, name, bed_number, e outros dados demográficos

**Componentes que usam:**
- App.tsx (dashboard, listagem de pacientes)
- AlertsHistoryScreen.tsx (histórico de alertas)
- DestinoComponent.tsx (destino do paciente)
- StatusComponent.tsx (status do paciente)
- ComorbidadeComponent.tsx (comorbidades)

---

### 2. **tasks**
**Função:** Armazena tarefas/alarmes com prazo associados aos pacientes

**Operações:**
- `INSERT` - Criar nova tarefa (App.tsx:3743)
- `SELECT` - Listar tarefas (App.tsx:3001)
- `UPDATE` - Atualizar status da tarefa (App.tsx:2633, 2655, 2682)
- `DELETE` - Deletar tarefa

**Campos principais:**
- id_alerta, patient_id, status, created_at, created_by, deadline, etc.

**Ativações:**
- Quando cria um novo alerta com prazo
- Real-time subscription para atualizações (App.tsx:857)

---

### 3. **alertas_paciente**
**Função:** Armazena alertas/avisos clínicos para pacientes

**Operações:**
- `INSERT` - Criar novo alerta (App.tsx:3763)
- `SELECT` - Listar alertas de um paciente
- `UPDATE` - Atualizar alerta
- `DELETE` - Remover alerta

**Campos principais:**
- id_alerta, patient_id, tipo, descricao, status, created_at, created_by

**Ativações:**
- Quando identifica uma situação clínica que requer atenção
- Real-time subscription para mudanças (App.tsx:850)

**Views relacionadas:**
- `alertas_paciente_view_completa` (App.tsx:2560)
- `tasks_view_horario_br` (App.tsx:2559)

---

### 4. **dispositivos_pacientes**
**Função:** Registra dispositivos médicos em uso (tubos, cateteres, etc.)

**Operações:**
- `INSERT` - Adicionar novo dispositivo (App.tsx:3279)
- `SELECT` - Listar dispositivos do paciente (App.tsx:3002)
- `UPDATE` - Atualizar informações do dispositivo
- `DELETE` - Remover dispositivo (App.tsx:3340)

**Campos principais:**
- id, patient_id, tipo, data_inicio, data_remocao, created_at

**Componentes:**
- App.tsx (seção de dispositivos)

---

### 5. **exames_pacientes**
**Função:** Armazena resultados de exames laboratoriais/clínicos

**Operações:**
- `INSERT` - Adicionar novo exame (App.tsx:3290)
- `SELECT` - Recuperar exames do paciente (App.tsx:3003)
- `UPDATE` - Atualizar resultado do exame
- `DELETE` - Remover exame (App.tsx:3380)

**Campos principais:**
- id, patient_id, tipo, resultado, data, reference_value

**Componentes:**
- App.tsx (seção de exames)

---

### 6. **medicacoes_pacientes**
**Função:** Registra medicações em uso e histórico de medicamentos

**Operações:**
- `INSERT` - Prescrever nova medicação (App.tsx:3304)
- `SELECT` - Listar medicações ativas (App.tsx:3004)
- `UPDATE` - Atualizar dosagem/medicação (App.tsx:3355, 3362, 3404)
- `DELETE` - Descontinuar medicação

**Campos principais:**
- id, patient_id, medicacao, dosagem, unidade, via, frequencia, data_inicio, data_fim

**Componentes:**
- App.tsx (gerenciamento de medicações)

---

### 7. **procedimentos_pacientes**
**Função:** Registra procedimentos realizados (cirurgias, intubação, etc.)

**Operações:**
- `INSERT` - Registrar novo procedimento (App.tsx:3316)
- `SELECT` - Histórico de procedimentos (App.tsx:3005)
- `UPDATE` - Atualizar informações do procedimento
- `DELETE` - Remover procedimento (App.tsx:3430)

**Campos principais:**
- id, patient_id, tipo, data, descricao, cirurgiao

**Componentes:**
- App.tsx (histórico cirúrgico)

---

### 8. **scale_scores**
**Função:** Armazena pontuações de escalas de avaliação clínica

**Operações:**
- `INSERT` - Registrar nova avaliação de escala (App.tsx:3437)
- `SELECT` - Recuperar histórico de escalas (App.tsx:3006)

**Escala utilizadas:**
- Braden (úlceras por pressão)
- Braden-QD (pediátrica)
- FLACC (dor em crianças)
- Comfort-B (conforto)
- Glasgow (nível de consciência)
- Delirium (CAM-ICU)
- CRSRS (abstinência)
- Consciousness
- VNICNAF
- SOSPD
- FSS (Functional Status Scale)

**Componentes que salvam:**
- BradenCalculator.tsx (App.tsx:3437)
- FLACCCalculator.tsx
- ComfortBCalculator.tsx
- GlasgowCalculator.tsx
- CAMICUCalculator.tsx
- ConsciousnessCalculator.tsx
- VNICNAFCalculator.tsx
- AbstinenciaCalculator.tsx
- SOSPDCalculator.tsx

---

### 9. **culturas_pacientes**
**Função:** Registra culturas (sangue, urina, secreção) para teste de sensibilidade antimicrobiana

**Operações:**
- `INSERT` - Adicionar nova cultura (App.tsx:3450)
- `SELECT` - Listar culturas do paciente (App.tsx:3011)
- `UPDATE` - Atualizar resultado da cultura (App.tsx:3463)
- `DELETE` - Remover cultura (App.tsx:3470)

**Campos principais:**
- id, patient_id, tipo (sangue, urina, secrecao), data_coleta, resultado

**Ativações:**
- AddCultureModal - Criar nova cultura
- EditCultureModal - Modificar cultura

---

### 10. **dietas_pacientes**
**Função:** Armazena dietas prescritas e suas alterações

**Operações:**
- `INSERT` - Prescrever nova dieta (App.tsx:3483)
- `SELECT` - Recuperar dietas ativas (App.tsx:3012)
- `UPDATE` - Modificar dieta (App.tsx:3502, 3510)
- `DELETE` - Descontinuar dieta

**Campos principais:**
- id, patient_id, tipo_dieta, data_inicio, data_remocao, volume_diario

**Relacionamentos:**
- CAMPOS_ADICIONAIS_DIETAS.tsx - Componente para campos extras
- AddDietModal, EditDietModal - Criar/editar dietas
- AddDietRemovalDateModal - Registrar data de remoção

---

### 11. **precautions**
**Função:** Registra precauções especiais para o paciente (isolamento, alergia, etc.)

**Operações:**
- `INSERT` - Adicionar precaução (App.tsx:3529)
- `SELECT` - Listar precauções (App.tsx:3013)
- `UPDATE` - Modificar precaução (App.tsx:3541)
- `DELETE` - Remover precaução (App.tsx:3548, 3559)

**Campos principais:**
- id, patient_id, tipo_precaucao, descricao, ativa

**Componentes:**
- PrecautionsCard.tsx - Exibir precauções
- App.tsx - Gerenciar precauções

---

### 12. **diurese**
**Função:** Registra volumes de diurese (urina) coletados

**Operações:**
- `INSERT` - Registrar nova medição (DiuresisCalc.tsx:61)
- `SELECT` - Recuperar histórico (App.tsx:3014)

**Campos principais:**
- id, patient_id, volume, data_hora, tipo (espontânea, cateter)

**Componentes:**
- DiuresisCalc.tsx (calcular diurese)
- DiuresisHistory.tsx (histórico)
- LatestCalculationsCard.tsx (últimas medições)

---

### 13. **balanco_hidrico**
**Função:** Registra balanço hídrico (entrada vs saída)

**Operações:**
- `INSERT` - Registrar novo balanço (FluidBalanceCalc.tsx:60)
- `SELECT` - Recuperar histórico (App.tsx:3015)

**Campos principais:**
- id, patient_id, entrada_total, saida_total, balance, data

**Componentes:**
- FluidBalanceCalc.tsx (calcular balanço)
- FluidBalanceHistory.tsx (histórico)
- LatestCalculationsCard.tsx (últimas medições)

---

### 14. **perguntas**
**Função:** Define perguntas do checklist de avaliação diária

**Operações:**
- `SELECT` - Recuperar perguntas com ordenação (App.tsx:3007)

**Campos principais:**
- id, categoria_id, descricao, ordem, tipo

**Uso:**
- Checklist diário do paciente
- Avaliação de status

---

### 15. **pergunta_opcoes**
**Função:** Define as opções de resposta para cada pergunta

**Operações:**
- `SELECT` - Recuperar opções (App.tsx:3008)

**Campos principais:**
- id, pergunta_id, opcao, ordem

**Uso:**
- Apresentar opções de resposta no checklist

---

### 16. **categorias**
**Função:** Agrupa perguntas em categorias temáticas

**Operações:**
- `SELECT` - Recuperar categorias ordenadas (App.tsx:3009, 3627)

**Campos principais:**
- id, nome, ordem, icone

**Uso:**
- Organizar checklist por temas
- Filtrar perguntas por categoria

---

### 17. **checklist_answers**
**Função:** Armazena respostas do checklist diário

**Operações:**
- `UPSERT` - Salvar/atualizar resposta (App.tsx:3265)
- `SELECT` - Recuperar respostas do dia (App.tsx:3010)

**Campos principais:**
- id, patient_id, pergunta_id, resposta, data

**Uso:**
- Registro diário de avaliação
- Histórico de resposta por paciente

---

### 18. **paciente_diagnosticos**
**Função:** Armazena diagnósticos clínicos do paciente

**Operações:**
- `SELECT` - Listar diagnósticos (App.tsx:3001 - via fetchDiagnostics)
- `INSERT` - Registrar novo diagnóstico (DiagnosticsSection.tsx)
- `UPDATE` - Modificar diagnóstico
- `DELETE` - Remover diagnóstico

**Campos principais:**
- id, patient_id, pergunta_id, resposta, data_resposta, created_by

**Componentes:**
- DiagnosticsSection.tsx (gerenciar diagnósticos)
- DiagnosticsAdmin.tsx (administração)

---

### 19. **diagnosticos_historico**
**Função:** Mantém histórico de alterações de diagnósticos

**Operações:**
- `SELECT` - Recuperar histórico (App.tsx via fetchDiagnosticsHistory)
- `INSERT` - Registrar mudança (DiagnosticsSection.tsx:214)

**Campos principais:**
- id, patient_id, pergunta_id, resposta_anterior, resposta_nova, data_mudanca, created_by

**Uso:**
- Auditoria de mudanças em diagnósticos
- Tracking de evolução clínica

---

### 20. **perguntas_diagnistico** ⚠️
**Função:** Define perguntas de diagnóstico (separadas das perguntas de checklist)

**Operações:**
- `SELECT` - Recuperar perguntas de diagnóstico (DiagnosticsSection.tsx:60)

**Componentes:**
- DiagnosticsSection.tsx
- DiagnosticsAdmin.tsx

---

### 21. **pergunta_opcoes_diagnostico** ⚠️
**Função:** Define opções para perguntas de diagnóstico

**Operações:**
- `SELECT` - Recuperar opções ordenadas (DiagnosticsSection.tsx:61)

**Componentes:**
- DiagnosticsSection.tsx
- DiagnosticsAdmin.tsx

---

### 22. **users** 👤
**Função:** Armazena usuários do sistema (para tracking de criador)

**Operações:**
- `SELECT` - Recuperar usuários (App.tsx:3817)
- `UPSERT` - Atualizar perfil de usuário (App.tsx:3860)

**Campos principais:**
- id, name, email, avatar_url

**Uso:**
- Identificar quem criou alerta/diagnóstico
- Sincronizar dados do auth.users

---

## 🔄 VIEWS (Tabelas Virtuais)

### 1. **alertas_paciente_view_completa**
**Função:** View que combina dados de alertas com nome do criador
```sql
SELECT 
  a.*,
  COALESCE(u.name, 'Não informado') as created_by_name
FROM alertas_paciente a
LEFT JOIN public.users u ON a.created_by = u.id
```
**Uso:** App.tsx:2560, AlertasSection.tsx:64

---

### 2. **tasks_view_horario_br**
**Função:** View de tarefas formatadas com data/hora em Brasil
```sql
SELECT 
  t.*,
  COALESCE(u.name, 'Não informado') as created_by_name
FROM tasks t
LEFT JOIN public.users u ON t.created_by = u.id
```
**Uso:** App.tsx:2559, AlertasSection.tsx:60

---

### 3. **diagnosticos_historico_com_usuario**
**Função:** View de histórico de diagnósticos com nome do usuário criador
**Uso:** App.tsx:724

---

### 4. **alert_completions_with_user**
**Função:** View de completações de alertas com informações do usuário
**Uso:** App.tsx:876

---

### 5. **dashboard_summary**
**Função:** View resumida para o dashboard
**Uso:** App.tsx:433

---

## 📊 STORAGE (Arquivos)

### **roundfoto** 🎥
**Função:** Bucket de armazenamento para fotos de pacientes
**Operações:**
- `UPLOAD` - Enviar foto (App.tsx:2865)
- `GET URL` - Obter link da foto (App.tsx:2877)

**Uso:**
- Foto do rosto do paciente
- Identificação visual rápida

---

## 🔗 FLUXO DE DADOS PRINCIPAL

```
┌─────────────────────┐
│   AUTENTICAÇÃO      │
│    (auth.users)     │
└──────────┬──────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│    PACIENTE (patients)                   │
│  - ID, Nome, Leito, Admissão            │
└──────────┬───────────────────────────────┘
           │
    ┌──────┴──────────────────────────────────┬──────────────┬─────────────┐
    │                                          │              │             │
    ▼                                          ▼              ▼             ▼
┌────────────────────┐  ┌──────────────┐  ┌─────────┐  ┌──────────┐ ┌──────────┐
│ CHECKLIST DIÁRIO   │  │   ESCALAS    │  │ ALERTAS │  │ TAREFAS  │ │HISTÓRICO │
│ (checklist_answers)│  │(scale_scores)│  │(alertas │  │(tasks)   │ │(vários)  │
│ perguntas          │  │ (Braden,     │  │_paciente│  │          │ │histórico │
│ categorias         │  │  FLACC, etc) │  │         │  │          │ │tabelas)  │
└────────────────────┘  └──────────────┘  └─────────┘  └──────────┘ └──────────┘
                                                │
                                    ┌───────────┴────────────┬──────────┬──────────────┐
                                    ▼                        ▼          ▼              ▼
                              ┌────────────────┐     ┌──────────────┐ ┌─────────┐ ┌─────────┐
                              │ DIAGNÓSTICOS   │     │ MEDICAÇÕES   │ │CULTURAS │ │ DIETAS  │
                              │(paciente_      │     │(medicacoes_  │ │(culturas│ │(dietas_ │
                              │ diagnosticos)  │     │ pacientes)   │ │_        │ │pacientes│
                              │                │     │              │ │pacientes│ │)        │
                              └────────────────┘     └──────────────┘ └─────────┘ └─────────┘

    ┌──────────────────────────────────────────────────────────────┐
    │ DISPOSITIVOS | EXAMES | PROCEDIMENTOS | PRECAUÇÕES           │
    │ (dispositivos_pacientes, exames_pacientes, etc)              │
    └──────────────────────────────────────────────────────────────┘

    ┌──────────────────────────────────────────────────────────────┐
    │ BALANÇO HÍDRICO (balanco_hidrico) | DIURESE (diurese)        │
    └──────────────────────────────────────────────────────────────┘
```

---

## 🎯 RESUMO DE OPERAÇÕES POR TIPO

### CREATE (INSERT)
- tasks, alertas_paciente, dispositivos_pacientes, exames_pacientes
- medicacoes_pacientes, procedimentos_pacientes, scale_scores
- culturas_pacientes, dietas_pacientes, precautions
- diurese, balanco_hidrico, checklist_answers
- paciente_diagnosticos, diagnosticos_historico

### READ (SELECT)
- **Todas as 22 tabelas** + 5 views

### UPDATE
- patients, tasks, alertas_paciente, dispositivos_pacientes
- exames_pacientes, medicacoes_pacientes, procedimentos_pacientes
- culturas_pacientes, dietas_pacientes, precautions, users
- checklist_answers

### DELETE
- tasks, alertas_paciente, dispositivos_pacientes
- exames_pacientes, medicacoes_pacientes, procedimentos_pacientes
- culturas_pacientes, dietas_pacientes, precautions

---

## ⚡ ATUALIZAÇÕES EM TEMPO REAL (Real-time Subscriptions)

```typescript
// App.tsx:850
supabase.channel('alertas_paciente').on(
  'postgres_changes',
  { event: '*', schema: 'public', table: 'alertas_paciente' },
  (payload) => { /* atualizar */ }
)

// App.tsx:857
supabase.channel('tasks').on(
  'postgres_changes',
  { event: '*', schema: 'public', table: 'tasks' },
  (payload) => { /* atualizar */ }
)

// App.tsx:890
supabase.channel('alert_completions').on(
  'postgres_changes',
  { event: '*', schema: 'public', table: 'alert_completions' },
  (payload) => { /* atualizar */ }
)
```

---

## 🔐 Row Level Security (RLS)

Existe arquivo `CREATE_RLS_POLICY.sql` e `FIX_RLS_VIEWS.sql` que devem estar implementados

---

## 📝 NOTAS IMPORTANTES

1. **created_by tracking**: Tabelas de alertas, tarefas e diagnósticos armazenam o UUID do usuário que criou
2. **Views com usuario**: As views retornam `created_by_name` já processado (não precisa de JOIN no frontend)
3. **Horário Brasil**: `tasks_view_horario_br` já formata data/hora para padrão BR
4. **Bucket de fotos**: O bucket `roundfoto` deve ser **PÚBLICO** para acessar as imagens
5. **Historico**: Diagnósticos e alertas mantêm histórico em tabelas separadas para auditoria

---

**Última atualização:** 20 de janeiro de 2026
**Status:** ✅ Análise Completa
