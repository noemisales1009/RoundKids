# ⚡ REFERÊNCIA RÁPIDA - Tabelas Supabase RoundKids

## 🎯 22 TABELAS + 5 VIEWS

### 📊 TABELA RÁPIDA

| # | Tabela | Função Principal | CRUD | Uso Principal |
|---|--------|------------------|------|---------------|
| 1 | **patients** | Dados demográficos | CRUD | Dashboard, Leitos |
| 2 | **tasks** | Tarefas com prazo | CRUD | Alertas com deadline |
| 3 | **alertas_paciente** | Avisos clínicos | CRUD | Problemas detectados |
| 4 | **dispositivos_pacientes** | Tubos, cateteres | CRUD | Equipamentos em uso |
| 5 | **exames_pacientes** | Lab/clínicos | CRUD | Resultados |
| 6 | **medicacoes_pacientes** | Prescrições | CRUD | Medicações ativas |
| 7 | **procedimentos_pacientes** | Cirurgias, etc | CRUD | Histórico cirúrgico |
| 8 | **scale_scores** | Avaliações clínicas | CR | Escalas (Braden, FLACC, etc) |
| 9 | **culturas_pacientes** | Sangue, urina | CRUD | Microbiologia |
| 10 | **dietas_pacientes** | Prescrição dietética | CRUD | Nutrição |
| 11 | **precautions** | Isolamento, alergia | CRUD | Segurança |
| 12 | **diurese** | Medida de urina | CR | I/O hídrico |
| 13 | **balanco_hidrico** | Entrada vs saída | CR | Balanço hídrico |
| 14 | **perguntas** | Checklist de perguntas | R | Avaliação diária |
| 15 | **pergunta_opcoes** | Opções de resposta | R | Respostas checklist |
| 16 | **categorias** | Grupos de perguntas | R | Organização checklist |
| 17 | **checklist_answers** | Respostas diárias | CRU | Avaliação completa |
| 18 | **paciente_diagnosticos** | Diagnósticos | CRUD | Problemas clínicos |
| 19 | **diagnosticos_historico** | Histórico mudanças | CR | Auditoria |
| 20 | **perguntas_diagnistico** | Perguntas diagnóstico | CR | Diagnóstico |
| 21 | **pergunta_opcoes_diagnostico** | Opções diagnóstico | CR | Opções diagnóstico |
| 22 | **users** | Usuários sistema | R | Criador de registros |

---

## 🔑 VIEWS (Consultado, não escrita direta)

| View | Função |
|------|--------|
| **alertas_paciente_view_completa** | Alertas + nome do criador |
| **tasks_view_horario_br** | Tarefas com data/hora Brasil |
| **diagnosticos_historico_com_usuario** | Histórico com criador |
| **alert_completions_with_user** | Completações com user |
| **dashboard_summary** | Resumo do dashboard |

---

## 📍 ONDE CADA TABELA É USADA

### 🟢 Uso Frequente
```
patients           → App.tsx (8+ vezes)
scale_scores       → 12 calculadores diferentes
tasks              → AlertasSection, App
alertas_paciente   → AlertasSection, App, DistintvoComponent
```

### 🟡 Uso Médio
```
medicacoes_pacientes       → Modal de medicações
dispositivos_pacientes     → Modal de dispositivos
procedimentos_pacientes    → Modal de procedimentos
culturas_pacientes         → Culturas component
dietas_pacientes          → Dietas component
precautions               → PrecautionsCard
diurese                   → DiuresisCalc, History
balanco_hidrico           → FluidBalanceCalc, History
```

### 🔵 Uso Específico
```
checklist_answers         → Apenas na seção de checklist
paciente_diagnosticos     → DiagnosticsSection
perguntas_diagnistico     → Diagnósticos
```

---

## 💾 OPERAÇÕES PRINCIPAIS

### CREATE (INSERT)
| Tabela | Linha |
|--------|-------|
| tasks | 3743 |
| alertas_paciente | 3763 |
| dispositivos_pacientes | 3279 |
| exames_pacientes | 3290 |
| medicacoes_pacientes | 3304 |
| procedimentos_pacientes | 3316 |
| scale_scores | 3437 |
| culturas_pacientes | 3450 |
| dietas_pacientes | 3483 |
| precautions | 3529 |
| diurese | DiuresisCalc:61 |
| balanco_hidrico | FluidBalanceCalc:60 |

### READ (SELECT)
```
Todas as 22 tabelas + 5 views
Carregadas em: App.tsx:3001-3015 (useEffect)
```

### UPDATE
| Tabela | Linhas |
|--------|--------|
| patients | 3571 |
| tasks | 2633, 2655, 2682 |
| medicacoes_pacientes | 3355, 3362, 3404 |
| exames_pacientes | 3380 |
| dispositivos_pacientes | 3387 |
| procedimentos_pacientes | 3418 |
| culturas_pacientes | 3463 |
| dietas_pacientes | 3502, 3510 |
| precautions | 3541 |
| checklist_answers | 3265 |
| users | 3860 |

### DELETE
| Tabela | Linhas |
|--------|--------|
| dispositivos_pacientes | 3340 |
| medicacoes_pacientes | 3362 |
| exames_pacientes | 3380 |
| procedimentos_pacientes | 3430 |
| culturas_pacientes | 3470 |
| dietas_pacientes | 3510 |
| precautions | 3548, 3559 |
| alertas_paciente | - |
| tasks | - |

---

## 🔄 FLUXO DE DADOS

### Quando Paciente é Criado
```
patients INSERT
    ↓
Todos os dados vazios
```

### Quando Alerta é Criado
```
alertas_paciente INSERT (com created_by)
    ↓
tasks INSERT (se houver deadline)
    ↓
users SELECT (para obter nome)
    ↓
alertas_paciente_view_completa SELECT (UI atualiza)
    ↓
Real-time subscription dispara
```

### Quando Escala é Registrada
```
scale_scores INSERT
    ↓
scale_scores SELECT (atualizar histórico)
```

### Quando Diagnóstico Muda
```
paciente_diagnosticos UPDATE
    ↓
diagnosticos_historico INSERT (auditoria)
    ↓
diagnosticos_historico_com_usuario SELECT
```

---

## ⚡ REAL-TIME SUBSCRIPTIONS

Três canais ativos (App.tsx):

```typescript
// Linha 850 - Alertas
supabase.channel('alertas_paciente')
  .on('postgres_changes', { table: 'alertas_paciente' }, ...)
  
// Linha 857 - Tarefas
supabase.channel('tasks')
  .on('postgres_changes', { table: 'tasks' }, ...)
  
// Linha 890 - Completações
supabase.channel('alert_completions')
  .on('postgres_changes', { table: 'alert_completions' }, ...)
```

---

## 🎨 ESCALAS (Todas em scale_scores)

| Escala | Componente | Campo |
|--------|-----------|-------|
| Braden | BradenCalculator.tsx | escala_tipo = 'braden' |
| Braden-QD | BradenQDScale.tsx | escala_tipo = 'braden_qd' |
| FLACC | FLACCCalculator.tsx | escala_tipo = 'flacc' |
| Comfort-B | ComfortBCalculator.tsx | escala_tipo = 'comfort_b' |
| Glasgow | GlasgowCalculator.tsx | escala_tipo = 'glasgow' |
| Delirium/CAM-ICU | CAMICUCalculator.tsx | escala_tipo = 'cam_icu' |
| CRSRS | - | escala_tipo = 'crsrs' |
| Consciousness | ConsciousnessCalculator.tsx | escala_tipo = 'consciousness' |
| VNICNAF | VNICNAFCalculator.tsx | escala_tipo = 'vnicnaf' |
| SOSPD | SOSPDCalculator.tsx | escala_tipo = 'sospd' |
| FSS | FSSScale.tsx | escala_tipo = 'fss' |

---

## 🔐 FIELDS COM TRACKING

| Campo | Tabelas | Uso |
|-------|---------|-----|
| created_by | tasks, alertas_paciente, paciente_diagnosticos, diagnosticos_historico | Quem criou |
| created_by_name | Views | Exibição do nome |
| created_at | Todas | Timestamp |
| status | tasks, alertas_paciente | Ativo/Inativo |
| data_remocao | dispositivos_pacientes, dietas_pacientes | Soft delete |

---

## 📸 STORAGE

```
Bucket: roundfoto (PÚBLICO)
├─ Fotos de pacientes
├─ Upload: App.tsx:2865
├─ Get URL: App.tsx:2877
└─ Necessário: Bucket PÚBLICO
```

---

## 🚀 PERFORMANCE

**Heavy hitters (mais consultadas):**
1. **patients** - Toda vez que abre um paciente
2. **scale_scores** - Múltiplas calculadoras simultaneamente
3. **alertas_paciente** + **tasks** - Real-time sempre ativa

**Otimização:**
- Views pré-processam dados (nome do user, data formatada)
- Índices em: patient_id, created_by, data

---

## 🔗 REFERÊNCIAS CRUZADAS

```
patients
├─ tem N tasks
├─ tem N alertas_pacientes
├─ tem N scale_scores
├─ tem N dispositivos_pacientes
├─ tem N exames_pacientes
├─ tem N medicacoes_pacientes
├─ tem N procedimentos_pacientes
├─ tem N culturas_pacientes
├─ tem N dietas_pacientes
├─ tem N precautions
├─ tem N paciente_diagnosticos
├─ tem N checklist_answers
├─ tem N diurese
└─ tem N balanco_hidrico

users
├─ criou N tasks (created_by)
├─ criou N alertas_paciente (created_by)
└─ criou N paciente_diagnosticos (created_by)
```

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

- ✅ Todas as 22 tabelas em produção
- ✅ 5 Views com joins configuradas
- ✅ Real-time subscriptions ativas
- ✅ created_by tracking implementado
- ✅ Auditoria de diagnósticos
- ✅ Soft delete de dispositivos e dietas
- ✅ Bucket de fotos público
- ✅ RLS policies implementadas

---

## 🎓 PARA APRENDER MAIS

📖 **Documentos disponíveis:**
- `TABELAS_SUPABASE_DETALHADO.md` - Análise completa
- `MAPA_FUNCOES_TABELAS.md` - Onde usa cada tabela
- `DIAGRAMA_TABELAS_VISUAL.md` - Diagramas ASCII
- `QUICK_REFERENCE.md` - Referência SQL rápida

---

**Atualizado:** 20 de janeiro de 2026
**Status:** ✅ Completo e Documentado
