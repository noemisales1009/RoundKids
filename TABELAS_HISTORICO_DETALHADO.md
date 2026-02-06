# 📊 TABELAS DO SUPABASE - HISTÓRICO DO PACIENTE

## 🎯 Visão Geral da Lógica

A página **Histórico do Paciente** (PatientHistoryScreen) agrega dados de **múltiplas tabelas e views** do Supabase para criar uma **linha do tempo unificada** de todos os eventos relacionados a um paciente.

---

## 📋 TABELAS E VIEWS UTILIZADAS

### 📌 **TABELAS BASE (Estrutura Principal)**

#### 🔹 **patients** (TABELA)
**Tipo:** Tabela principal de pacientes

**Campos principais:**
- `id` - UUID do paciente (chave primária)
- `name` - Nome completo do paciente
- `bed_number` - Número do leito
- `admissionDate` - Data de admissão
- `comorbidade` - Comorbidades separadas por | (pipe)
- `age` - Idade
- `weight` - Peso em kg
- `created_at` - Data de criação do registro

**Como é usada:**
```typescript
// Buscada via Context (PatientsContext)
const { patients } = useContext(PatientsContext);
const patient = patients.find(p => p.id === patientId);

// Também usada em JOINs nas views
LEFT JOIN patients p ON a.patient_id = p.id
```

**Aparece no histórico como:**
- Informações básicas do paciente no topo da página
- Comorbidades listadas como eventos iniciais
- `[COMORBIDADE] 🏥 Comorbidade: Diabetes Mellitus`

---

#### 🔹 **users** (TABELA)
**Tipo:** Tabela de usuários do sistema

**Campos principais:**
- `id` - UUID do usuário (chave primária)
- `name` - Nome completo do usuário
- `email` - Email do usuário
- `role` - Função (médico, enfermeiro, etc)
- `created_at` - Data de criação

**Como é usada:**
```typescript
// Usada em JOINs para mostrar nomes de quem fez ações
LEFT JOIN users u ON dh.created_by = u.id

// Campos que referenciam users:
- created_by (quem criou)
- completed_by (quem concluiu)
- archived_by (quem arquivou)
- justificativa_by (quem justificou)
```

**Aparece no histórico como:**
- "Criado por: Dr. João Silva"
- "Concluído por: Enf. Maria Santos"
- "Arquivado por: Noemi Sales"

---

#### 🔹 **tasks** (TABELA BASE)
**Tipo:** Tabela de tarefas/alertas do sistema

**Campos principais:**
- `id` - UUID da tarefa
- `patient_id` - ID do paciente
- `patient_name` - Nome do paciente (desnormalizado)
- `category_id` - ID da categoria (1-5)
- `description` - Descrição completa da tarefa
- `responsible` - Responsável pela execução
- `deadline` - Prazo para conclusão
- `status` - 'pendente', 'concluido', 'alerta'
- `justification` - Justificativa (se houver)
- `justification_at` - Data da justificativa
- `justification_by` - UUID de quem justificou
- `archived_at` - Data de arquivamento
- `archived_by` - UUID de quem arquivou
- `motivo_arquivamento` - Motivo do arquivamento
- `created_at` - Data de criação
- `created_by` - UUID de quem criou

**Categorias:**
1. Dispositivos
2. Medicações
3. Exames
4. Cirúrgico
5. Escalas

**Como é usada:**
```typescript
// Via view tasks_view_horario_br (processada)
.from('tasks_view_horario_br')
.eq('patient_id', patientId)

// Diretamente para UPDATE/INSERT
.from('tasks')
.update({ status: 'concluido' })
```

---

#### 🔹 **alertas_paciente** (TABELA BASE)
**Tipo:** Tabela de alertas clínicos específicos

**Campos principais:**
- `id` - UUID do alerta
- `patient_id` - ID do paciente
- `alerta_descricao` - Descrição do alerta clínico
- `responsavel` - Responsável pela ação
- `hora_selecionada` - Prazo selecionado (2h, 4h, etc)
- `status` - Status atual
- `status_conclusao` - Status de conclusão
- `justificativa` - Justificativa (se houver)
- `justificativa_at` - Data da justificativa
- `justificativa_by` - UUID de quem justificou
- `archived_at` - Data de arquivamento
- `archived_by` - UUID de quem arquivou
- `motivo_arquivamento` - Motivo do arquivamento
- `created_at` - Data de criação
- `created_by` - UUID de quem criou

**Como é usada:**
```typescript
// Via view alertas_paciente_view_completa (processada)
.from('alertas_paciente_view_completa')
.eq('patient_id', patientId)

// Diretamente para UPDATE/INSERT
.from('alertas_paciente')
.update({ justificativa: '...' })
```

---

#### 🔹 **alert_completions** (TABELA BASE)
**Tipo:** Tabela de registros de conclusão de alertas

**Campos principais:**
- `id` - UUID do registro
- `alert_id` - ID do alerta concluído
- `source` - 'tasks' ou 'alertas_paciente'
- `completed_at` - Data/hora da conclusão
- `completed_by` - UUID de quem concluiu
- `created_at` - Data de criação do registro

**Como é usada:**
```typescript
// Via view alert_completions_with_user
.from('alert_completions_with_user')
.eq('patient_id', patientId)

// INSERT direto ao concluir
.from('alert_completions')
.insert({
    alert_id: alertId,
    source: 'tasks',
    completed_at: new Date(),
    completed_by: user.id
})
```

---

#### 🔹 **paciente_diagnosticos** (TABELA BASE)
**Tipo:** Tabela de diagnósticos ativos do paciente

**Campos principais:**
- `id` - UUID do diagnóstico
- `patient_id` - ID do paciente
- `pergunta_id` - ID da pergunta do formulário
- `opcao_id` - ID da opção escolhida
- `texto_digitado` - Texto livre (se aplicável)
- `status` - 'nao_resolvido', 'resolvido'
- `arquivado` - true/false (ocultado)
- `created_at` - Data de criação
- `created_by` - UUID de quem criou

**Como é usada:**
```typescript
// Para INSERT/UPDATE direto
.from('paciente_diagnosticos')
.insert({
    patient_id: patientId,
    pergunta_id: question.id,
    opcao_id: option.id,
    created_by: user.id
})

// Para marcar como resolvido
.update({ status: 'resolvido' })

// Para ocultar
.update({ arquivado: true })
```

---

#### 🔹 **diagnosticos_historico** (TABELA BASE)
**Tipo:** Tabela de histórico de diagnósticos (imutável)

**Campos principais:**
- `id` - UUID do registro histórico
- `patient_id` - ID do paciente
- `pergunta_id` - ID da pergunta
- `opcao_id` - ID da opção
- `opcao_label` - Label da opção (snapshot)
- `texto_digitado` - Texto digitado
- `status` - Status no momento do registro
- `arquivado` - Se estava arquivado
- `created_at` - Data do snapshot
- `created_by` - UUID de quem criou

**Como é usada:**
```typescript
// INSERT automático via trigger quando paciente_diagnosticos muda
// Mantém histórico imutável de todas as mudanças

// Lida pela view diagnosticos_historico_com_usuario
```

---

### 📌 **VIEWS PROCESSADAS (Agregações e Cálculos)**

### 1️⃣ **diagnosticos_historico_com_usuario** (VIEW)
**Tipo:** View SQL que junta diagnósticos com informações do usuário

**Campos principais:**
- `patient_id` - ID do paciente
- `pergunta_id` - ID da pergunta do diagnóstico
- `opcao_id` - ID da opção escolhida
- `opcao_label` - Texto da opção (ex: "Broncodisplasia")
- `status` - 'nao_resolvido', 'resolvido'
- `arquivado` - true/false (se foi ocultado)
- `created_at` - Data de criação
- `created_by` - UUID do usuário que criou
- `created_by_name` - Nome do usuário (vem do JOIN com users)

**SQL da View:**
```sql
SELECT
  dh.*,
  COALESCE(u.name, 'Sistema') AS created_by_name
FROM diagnosticos_historico dh
LEFT JOIN users u ON dh.created_by = u.id
```

**Como é usada:**
```typescript
// Busca diagnósticos ATIVOS (não resolvidos)
.from('diagnosticos_historico_com_usuario')
.eq('patient_id', patientId)
.eq('status', 'nao_resolvido')

// Busca diagnósticos RESOLVIDOS
.eq('status', 'resolvido')

// Busca diagnósticos ARQUIVADOS (ocultados)
.eq('arquivado', true)
```

**Aparece no histórico como:**
- `[DIAGNOSTICO] 📋 Diagnóstico: Broncodisplasia (Status: nao_resolvido)`
- Criado por: Noemi Sales em 05/02/2026 19:12

---

### 2️⃣ **diagnosticos_audit_log** (TABELA)
**Tipo:** Tabela de auditoria para rastreamento de ações em diagnósticos

**Campos principais:**
- `patient_id` - ID do paciente
- `diagnostico_id` - ID do diagnóstico afetado
- `acao` - 'OCULTADO', 'CRIADO', 'RESOLVIDO'
- `created_at` - Quando a ação foi feita
- `created_by` - UUID de quem fez a ação
- `motivo` - Motivo da ação (texto)

**Como é usada:**
```typescript
// Busca registros de diagnósticos ocultados
.from('diagnosticos_audit_log')
.eq('patient_id', patientId)
.eq('acao', 'OCULTADO')
```

**Aparece no histórico como:**
- Diagnóstico ocultado por motivo de auditoria

---

### 3️⃣ **dispositivos_pacientes** (TABELA)
**Tipo:** Tabela de dispositivos médicos em uso (tubos, cateteres, sondas)

**Campos principais:**
- `id` - UUID do dispositivo
- `paciente_id` - ID do paciente (FK para patients)
- `tipo_dispositivo` - Tipo (TOT, CVU, SNE, Cateter Central, etc)
- `localizacao` - Localização do dispositivo
- `data_insercao` - Data de inserção
- `data_remocao` - Data de remoção (null se ainda ativo)
- `observacao` - Observações adicionais
- `is_archived` - Soft delete
- `created_at` - Data de criação do registro

**Como é usada:**
```typescript
// INSERT - Adicionar dispositivo
.from('dispositivos_pacientes')
.insert({
    paciente_id: patientId,
    tipo_dispositivo: device.name,
    localizacao: device.location,
    data_insercao: device.startDate,
    observacao: device.observacao
})

// UPDATE - Adicionar data de remoção
.update({ data_remocao: removalDate })
.eq('id', deviceId)

// SELECT - Via Context (lido do patient.devices)
// Vem do fetchPatients que busca patients com relacionamentos
```

**Aparece no histórico como:**
- `[DISPOSITIVO] 🔌 Dispositivo Inserido: TOT em CABEÇA`
- Data de inserção: 05/02/2026 19:12
- Criado por: Noemi Sales

**Modais relacionados:**
- AddDeviceModal - Adicionar novo dispositivo
- EditDeviceModal - Editar dispositivo existente
- AddRemovalDateModal - Registrar remoção

---

### 4️⃣ **medicacoes_pacientes** (TABELA)
**Tipo:** Tabela de medicações prescritas e em uso

**Campos principais:**
- `id` - UUID da medicação
- `paciente_id` - ID do paciente (FK para patients)
- `nome_medicacao` - Nome da medicação
- `dosagem_valor` - Valor numérico da dose
- `unidade_medida` - Unidade (mg, ml, UI, etc)
- `data_inicio` - Data de início do tratamento
- `data_fim` - Data de término (null se ainda em uso)
- `observacao` - Observações (via, frequência, etc)
- `is_archived` - Soft delete
- `created_at` - Data de criação do registro

**Como é usada:**
```typescript
// INSERT - Prescrever medicação
.from('medicacoes_pacientes')
.insert({
    paciente_id: patientId,
    nome_medicacao: medication.name,
    dosagem_valor: valor,
    unidade_medida: unidade,
    data_inicio: medication.startDate,
    observacao: medication.observacao
})

// UPDATE - Modificar ou adicionar data_fim
.update({
    nome_medicacao: medicationData.name,
    dosagem_valor: valor,
    data_fim: medicationData.endDate
})
.eq('id', medicationId)

// DELETE - Soft delete
.update({ is_archived: true })
.eq('id', medicationId)
```

**Aparece no histórico como:**
- `[MEDICACAO] 💊 Início Medicação: Dobutamina (3345 mg/kg/dia)`
- Data de início: 05/02/2026 19:12
- Criado por: Dr. Silva

**Modais relacionados:**
- AddMedicationModal - Prescrever nova medicação
- EditMedicationModal - Editar medicação existente

---

### 5️⃣ **exames_pacientes** (TABELA)
**Tipo:** Tabela de exames e resultados laboratoriais/clínicos

**Campos principais:**
- `id` - UUID do exame
- `paciente_id` - ID do paciente (FK para patients)
- `nome_exame` - Nome do exame (Hemograma, RX Tórax, USG, etc)
- `data_exame` - Data de realização
- `observacao` - Resultados e observações
- `is_archived` - Soft delete
- `created_at` - Data de criação do registro

**Como é usada:**
```typescript
// INSERT - Registrar exame
.from('exames_pacientes')
.insert({
    paciente_id: patientId,
    nome_exame: exam.name,
    data_exame: exam.date,
    observacao: exam.observation
})

// UPDATE - Atualizar resultado
.update({
    nome_exame: examData.name,
    data_exame: examData.date,
    observacao: examData.observation
})
.eq('id', examId)

// DELETE - Soft delete
.update({ is_archived: true })
.eq('id', examId)
```

**Aparece no histórico como:**
- `[EXAME] 📋 Exame Realizado: ggfdg`
- Data: 05/02/2026
- Observação: [resultados]

**Modais relacionados:**
- AddExamModal - Registrar novo exame
- EditExamModal - Editar exame existente

---

### 6️⃣ **procedimentos_pacientes** (TABELA)
**Tipo:** Tabela de procedimentos cirúrgicos e invasivos

**Campos principais:**
- `id` - UUID do procedimento
- `paciente_id` - ID do paciente (FK para patients)
- `nome_procedimento` - Nome do procedimento/cirurgia
- `data_procedimento` - Data de realização
- `nome_cirurgiao` - Nome do cirurgião/executor
- `notas` - Notas e observações do procedimento
- `is_archived` - Soft delete
- `created_at` - Data de criação do registro

**Como é usada:**
```typescript
// INSERT - Registrar procedimento
.from('procedimentos_pacientes')
.insert({
    paciente_id: patientId,
    nome_procedimento: procedure.name,
    data_procedimento: procedure.date,
    nome_cirurgiao: procedure.surgeon,
    notas: procedure.notes
})

// UPDATE - Atualizar informações
.update({
    nome_procedimento: procedureData.name,
    data_procedimento: procedureData.date,
    nome_cirurgiao: procedureData.surgeon,
    notas: procedureData.notes
})
.eq('id', procedureId)

// DELETE - Soft delete
.update({ is_archived: true })
.eq('id', procedureId)
```

**Aparece no histórico como:**
- `[CIRURGICO] ✂️ Cirurgia Realizada: gdfgdfg por Dr(a). gdfgdf`
- Data: 05/02/2026
- Notas: gdfgd

**Modais relacionados:**
- AddSurgicalProcedureModal - Registrar novo procedimento
- EditSurgicalProcedureModal - Editar procedimento existente

---

### 7️⃣ **culturas_pacientes** (TABELA)
**Tipo:** Tabela de culturas microbiológicas (sangue, urina, secreção)

**Campos principais:**
- `id` - UUID da cultura
- `paciente_id` - ID do paciente (FK para patients)
- `local` - Local da coleta (Sangue, Urina, Secreção, etc)
- `microorganismo` - Microorganismo identificado ou resultado
- `data_coleta` - Data de coleta da amostra
- `observacao` - Observações e sensibilidade antimicrobiana
- `is_archived` - Soft delete
- `created_at` - Data de criação do registro

**SQL da Tabela:**
```sql
CREATE TABLE culturas_pacientes (
  id bigint primary key,
  created_at timestamptz default now(),
  paciente_id uuid references patients(id) on delete cascade,
  local varchar(255) not null,
  microorganismo varchar(255) not null,
  data_coleta date not null,
  is_archived boolean default false,
  observacao text
);
```

**Como é usada:**
```typescript
// INSERT - Registrar cultura
.from('culturas_pacientes')
.insert({
    paciente_id: patientId,
    local: culture.site,
    microorganismo: culture.microorganism,
    data_coleta: culture.collectionDate,
    observacao: culture.observation
})

// UPDATE - Atualizar resultado
.update({
    local: cultureData.site,
    microorganismo: cultureData.microorganism,
    data_coleta: cultureData.collectionDate,
    observacao: cultureData.observation
})
.eq('id', cultureId)

// DELETE - Soft delete
.update({ is_archived: true })
.eq('id', cultureId)
```

**Aparece no histórico como:**
- `[EXAME] 🧬 Cultura Coletada: Urina`
- Microorganismo: E. coli
- Data de coleta: 05/02/2026

**Modais relacionados:**
- AddCultureModal - Registrar nova cultura
- EditCultureModal - Editar cultura existente

---

### 8️⃣ **diurese** (TABELA)
**Tipo:** Tabela de registros de diurese do paciente

**Campos principais:**
- `patient_id` - ID do paciente
- `data_registro` - Data/hora do registro
- `volume` - Volume em ml
- `peso` - Peso do paciente em kg
- `created_by` - UUID de quem registrou

**Como é usada:**
```typescript
.from('diurese')
.eq('patient_id', patientId)
.order('data_registro', { ascending: false })
```

**Aparece no histórico como:**
- `[DIURESE] 💧 Diurese Registrada`
- Volume: 250ml | Peso: 60kg
- Data: 05/02/2026 18:46

---

### 9️⃣ **balanco_hidrico** (TABELA)
**Tipo:** Tabela de balanço hídrico (entradas e saídas)

**Campos principais:**
- `patient_id` - ID do paciente
- `data_registro` - Data/hora do registro
- `entradas` - JSON com entradas de líquidos
- `saidas` - JSON com saídas de líquidos
- `balanco_total` - Cálculo do balanço (entrada - saída)

**Como é usada:**
```typescript
.from('balanco_hidrico')
.eq('patient_id', patientId)
.order('data_registro', { ascending: false })
```

**Aparece no histórico como:**
- `[BALANÇO] 💧 Balanço Hídrico`
- Entradas: 1500ml | Saídas: 1200ml | Balanço: +300ml

---

### 🔟 **dietas_pacientes** (TABELA)
**Tipo:** Tabela de dietas prescritas para o paciente

**Campos principais:**
- `paciente_id` - ID do paciente
- `via_administracao` - 'Oral', 'Enteral', 'Parenteral'
- `tipo_dieta` - Tipo da dieta
- `volume_prescrito` - Volume em ml
- `intervalo_horas` - Intervalo entre administrações
- `horario_inicio` - Horário de início
- `created_at` - Data de criação

**Como é usada:**
```typescript
.from('dietas_pacientes')
.eq('paciente_id', patientId)
```

**Aparece no histórico como:**
- `[DIETA] 🍽️ Dieta Iniciada: Enteral`
- Volume: 200ml | Intervalo: 3h | Início: 08:00

---

### 6️⃣ **alertas_paciente_view_completa** (VIEW)
**Tipo:** View que processa alertas clínicos com cálculo de prazos

**Campos principais:**
- `id_alerta` - ID do alerta
- `patient_id` - ID do paciente
- `alertaclinico` - Descrição do alerta
- `responsavel` - Quem é responsável
- `status` - Status do alerta
- `justificativa` - Justificativa se houver
- `created_at` - Data de criação
- `deadline` - Prazo calculado
- `archived_at` - Data de arquivamento (null se ativo)
- `prazo_formatado` - "2 horas", "30 min"
- `live_status` - 'no_prazo', 'fora_do_prazo', 'concluido'

**Como é usada:**
```typescript
.from('alertas_paciente_view_completa')
.eq('patient_id', patientId)
// Retorna TODOS os alertas (ativos e arquivados)
```

**Aparece no histórico como:**
- `[ALERTA] 🔔 AVALIAR BH`
- Responsável: Enfermagem | Prazo: 2 horas
- Status: no_prazo

---

### 7️⃣ **tasks_view_horario_br** (VIEW)
**Tipo:** View de tarefas com horários no fuso de São Paulo

**Campos principais:**
- `id_alerta` - ID da tarefa
- `patient_id` - ID do paciente
- `alertaclinico` - Descrição limpa da tarefa
- `responsavel` - Responsável
- `status` - Status da tarefa
- `justificativa` - Justificativa (chamado 'justification' na tabela tasks)
- `created_at` - Data de criação
- `deadline` - Prazo
- `archived_at` - Data de arquivamento
- `prazo_formatado` - Prazo em formato legível
- `hora_criacao_formatado` - "05/02/2026 19:12"

**Como é usada:**
```typescript
.from('tasks_view_horario_br')
.eq('patient_id', patientId)
// Combina com alertas_paciente_view_completa para lista unificada
```

**Aparece no histórico como:**
- `[ALERTA] 📋 CONTROLE RIGOROSO DE PANI`
- Responsável: Médico | Prazo: 4 horas

---

### 8️⃣ **alert_completions_with_user** (VIEW)
**Tipo:** View que registra conclusões de alertas com nome do usuário

**Campos principais:**
- `id` - ID do registro de conclusão
- `alert_id` - ID do alerta concluído
- `source` - 'tasks' ou 'alertas_paciente'
- `completed_at` - Data/hora da conclusão
- `completed_by` - UUID de quem concluiu
- `completed_by_name` - Nome de quem concluiu (JOIN com users)
- `patient_id` - ID do paciente (JOIN)

**Como é usada:**
```typescript
.from('alert_completions_with_user')
.eq('patient_id', patientId)
// Patient_id vem do JOIN com tasks ou alertas_paciente
```

**Aparece no histórico como:**
- `[COMPLETACAO_ALERTA] ✓ Alerta Concluído (🔔 Alerta)`
- Concluído por: Noemi Sales em 05/02/2026 20:30

---

### 9️⃣ **monitoramento_geral_justificativas** (VIEW)
**Tipo:** View que agrega justificativas de alertas e tasks

**Campos principais:**
- `tipo_origem` - 'Alerta' ou 'Tarefa'
- `id` - ID do registro
- `patient_id` - ID do paciente
- `descricao` - Descrição do alerta/tarefa
- `justificativa` - Texto da justificativa
- `data_justificativa` - Quando foi justificado
- `quem_justificou_nome` - Nome de quem justificou

**SQL da View:**
```sql
-- UNION de alertas_paciente e tasks
SELECT 'Alerta' AS tipo_origem, ...
FROM alertas_paciente
WHERE justificativa IS NOT NULL

UNION ALL

SELECT 'Tarefa' AS tipo_origem, ...
FROM tasks
WHERE justification IS NOT NULL
```

**Como é usada:**
```typescript
.from('monitoramento_geral_justificativas')
.eq('patient_id', patientId)
```

**Aparece no histórico como:**
- `[JUSTIFICATIVA_ADICIONADA] ✓ Justificativa Adicionada (🔔 Alerta)`
- Justificativa: Paciente apresentou melhora
- Justificado por: Dr. Silva em 05/02/2026 15:20

---

### 🔟 **monitoramento_arquivamento_geral** (VIEW)
**Tipo:** View que agrega alertas e tasks arquivados

**Campos principais:**
- `tipo_origem` - 'Alerta' ou 'Tarefa'
- `registro_id` - ID do registro arquivado
- `patient_id` - ID do paciente
- `descricao_original` - Descrição do alerta/tarefa
- `motivo_do_arquivamento` - Motivo digitado pelo usuário
- `data_arquivamento` - Quando foi arquivado
- `quem_arquivou` - Nome de quem arquivou

**SQL da View:**
```sql
-- UNION de alertas_paciente e tasks arquivados
SELECT 'Alerta' AS tipo_origem, ...
FROM alertas_paciente
WHERE archived_at IS NOT NULL

UNION ALL

SELECT 'Tarefa' AS tipo_origem, ...
FROM tasks
WHERE archived_at IS NOT NULL
```

**Como é usada:**
```typescript
.from('monitoramento_arquivamento_geral')
.eq('patient_id', patientId)
```

**Aparece no histórico como:**
- `[ALERTA_ARQUIVADO] 📦 🔔 Alerta Arquivado`
- Descrição: AVALIAR BH
- Motivo: Paciente não necessita mais
- Arquivado por: Noemi Sales em 05/02/2026 21:00

---

## 🔄 LÓGICA DE AGREGAÇÃO E EXIBIÇÃO

### 1. **Busca de Dados (useEffect)**

Cada tabela/view tem seu próprio `useEffect` que:
1. Verifica se `patientId` existe
2. Faz query no Supabase
3. Armazena resultado no state correspondente
4. Alguns têm **real-time subscriptions** para atualização automática

```typescript
// Exemplo de subscription em tempo real:
const unsubscribeAlertas = supabase
    .channel(`public:alertas_paciente:patient_id=eq.${patientId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'alertas_paciente' }, () => {
        fetchAlerts(); // Recarrega quando há mudança
    })
    .subscribe();
```

---

### 2. **Transformação em Timeline (useMemo)**

O `useMemo` chamado `patientHistory`:
1. Recebe todos os states de dados
2. Cria array de **eventos** (`TimelineEvent[]`)
3. Cada evento tem:
   - `timestamp` - Data/hora do evento
   - `icon` - Ícone React
   - `description` - Descrição formatada com marcador [TIPO]
   - `hasTime` - Se tem hora específica

```typescript
type TimelineEvent = {
    timestamp: string;
    icon: React.FC<{ className?: string; }>;
    description: string;
    hasTime: boolean;
};
```

**Exemplo de transformação:**
```typescript
// Adicionar diurese
diuresisData.forEach(diuresis => {
    events.push({
        timestamp: diuresis.data_registro,
        icon: DropletIcon,
        description: `[DIURESE] 💧 Diurese Registrada\nVolume: ${diuresis.volume}ml`,
        hasTime: true,
    });
});
```

---

### 3. **Agrupamento por Data**

Após criar todos os eventos:
1. Ordena por timestamp (mais recente primeiro)
2. Agrupa por data (chave: YYYY-MM-DD)
3. Cria objeto: `{ "2026-02-05": [eventos...], "2026-02-04": [eventos...] }`

```typescript
const groupedEvents = events.reduce((acc, event) => {
    const dateKey = event.timestamp.split('T')[0]; // "2026-02-05"
    if (!acc[dateKey]) {
        acc[dateKey] = [];
    }
    acc[dateKey].push(event);
    return acc;
}, {} as Record<string, TimelineEvent[]>);
```

---

### 4. **Filtros de Categoria**

A função `getEventCategory` mapeia marcadores para categorias:

```typescript
const categoryMap: Record<string, string> = {
    '[DISPOSITIVO]': 'Dispositivos',
    '[MEDICACAO]': 'Medicações',
    '[EXAME]': 'Exames',
    '[CIRURGICO]': 'Cirúrgico',
    '[ESCALA]': 'Escalas',
    '[DIAGNOSTICO]': 'Diagnósticos',
    '[DIURESE]': 'Diurese',
    '[BALANÇO]': 'Balanço Hídrico',
    '[ALERTA]': 'Alertas',
    '[COMORBIDADE]': 'Comorbidades',
    '[COMPLETACAO_ALERTA]': 'Completações',
    '[DIETA]': 'Dietas',
    '[JUSTIFICATIVA_ADICIONADA]': 'Justificativas',
    '[ALERTA_ARQUIVADO]': 'Arquivamentos'
};
```

Quando usuário seleciona filtros:
```typescript
const filteredHistory = () => {
    if (selectedCategories.size === 0) {
        return patientHistory; // Mostra tudo
    }
    
    // Filtra eventos que pertencem às categorias selecionadas
    const filtered: Record<string, TimelineEvent[]> = {};
    Object.entries(patientHistory).forEach(([date, events]) => {
        const filteredEvents = events.filter(event => {
            const category = getEventCategory(event.description);
            return category && selectedCategories.has(category);
        });
        if (filteredEvents.length > 0) {
            filtered[date] = filteredEvents;
        }
    });
    return filtered;
};
```

---

### 5. **Filtro por Data**

Se `dataInicio` ou `dataFinal` estão preenchidos:
```typescript
// Filtra eventos dentro do range de datas
const eventDate = new Date(event.timestamp);
const startDate = dataInicio ? new Date(dataInicio) : null;
const endDate = dataFinal ? new Date(dataFinal) : null;

if (startDate && eventDate < startDate) return false;
if (endDate && eventDate > endDate) return false;
return true;
```

---

## 📊 DEPENDÊNCIAS E CONTEXTOS

### **Dados que vêm de Context (não do Supabase direto):**

1. **PatientsContext** - Lista de pacientes
   - Busca `patient` pelo `patientId` da URL
   - Fonte: `patients` array do context

2. **TasksContext** - Tasks do sistema
   - Usado para adicionar dispositivos, medicações, exames, etc.
   - Cada task tem `categoria` que determina o ícone

### **Dados de Task (de Context):**
```typescript
const { tasks } = useContext(TasksContext)!;

// Filtra tasks desse paciente
const patientTasks = tasks.filter(t => t.patient_id === patientId);

// Agrupa por categoria:
- Dispositivos (categoria 1)
- Medicações (categoria 2)  
- Exames (categoria 3)
- Cirúrgico (categoria 4)
- Escalas (categoria 5)
```

---

## 🔐 SEGURANÇA E PERMISSÕES (RLS)

Todas as tabelas/views devem ter **Row Level Security (RLS)** ativado no Supabase:

```sql
-- Exemplo de política RLS
CREATE POLICY "Usuários autenticados podem ver seus dados"
ON public.diagnosticos_historico_com_usuario
FOR SELECT
TO authenticated
USING (true);
```

As views têm `GRANT SELECT` para `authenticated` e `anon`.

---

## 📈 PERFORMANCE E OTIMIZAÇÃO

### **Índices Importantes:**
```sql
-- Performance para busca por patient_id
CREATE INDEX IF NOT EXISTS idx_diagnosticos_patient_arquivado 
ON paciente_diagnosticos(patient_id, arquivado);

CREATE INDEX IF NOT EXISTS idx_diagnosticos_created_at 
ON paciente_diagnosticos(created_at DESC);
```

### **Real-time Subscriptions:**
- Alertas (alertas_paciente e tasks) - Atualiza quando há INSERT/UPDATE/DELETE
- Alert Completions - Atualiza quando alerta é concluído

**Cleanup:**
```typescript
return () => {
    supabase.removeChannel(unsubscribeAlertas);
    supabase.removeChannel(unsubscribeTasks);
};
```

---

## 🎨 RENDERIZAÇÃO VISUAL

### **Estrutura HTML:**
```
<div className="patient-history">
  {Object.entries(filteredHistory()).map(([date, events]) => (
    <div key={date} className="date-group">
      <h3>{formatDate(date)}</h3> // "Hoje, 5 de fevereiro"
      {events.map((event, i) => (
        <div key={i} className="timeline-event">
          <Icon /> // Ícone do evento
          <div className="event-content">
            <p>{event.description}</p> // Descrição formatada
            {event.hasTime && <span>{formatTime(event.timestamp)}</span>}
          </div>
        </div>
      ))}
    </div>
  ))}
</div>
```

---

## 🧩 FLUXO COMPLETO (RESUMO)

```
1. URL: /patient-history/:patientId
   ↓
2. Busca patient no PatientsContext
   ↓
3. 10 useEffects paralelos buscam dados:
   - diagnosticos_historico_com_usuario (3x com filtros diferentes)
   - diagnosticos_audit_log
   - diurese
   - balanco_hidrico
   - dietas_pacientes
   - alertas_paciente_view_completa
   - tasks_view_horario_br
   - alert_completions_with_user
   - monitoramento_geral_justificativas
   - monitoramento_arquivamento_geral
   ↓
4. useMemo transforma dados em array de eventos
   - Adiciona marcador [TIPO] em cada descrição
   - Ordena por timestamp
   - Agrupa por data
   ↓
5. Filtros aplicados:
   - Por categoria (checkboxes)
   - Por data (dataInicio/dataFinal)
   ↓
6. Renderiza timeline agrupada por data
   - Ícones específicos por tipo
   - Formatação de datas/horas
   - Exportação para PDF
```

---

## 🎯 CASOS DE USO PRINCIPAIS

1. **Ver todos os eventos do paciente** - Histórico completo cronológico
2. **Filtrar por tipo** - Ver só diagnósticos, ou só alertas
3. **Buscar por período** - Eventos de uma data específica
4. **Auditoria** - Quem fez o quê e quando
5. **Real-time** - Alertas aparecem instantaneamente quando criados
6. **Exportar PDF** - Relatório completo para impressão

---

**Data:** 05/02/2026  
**Última Atualização:** Sistema de arquivamento implementado
