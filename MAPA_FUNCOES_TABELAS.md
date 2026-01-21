# 🗺️ MAPA DE FUNÇÕES - Onde Cada Tabela é Usada

## 📍 VISÃO RÁPIDA POR FUNÇÃO

### 🔴 GERENCIAMENTO DE PACIENTES
| Tabela | Leitura | Criação | Atualização | Exclusão | Componentes |
|--------|---------|---------|-------------|----------|-------------|
| **patients** | ✅ | - | ✅ | - | App.tsx, DestinoComponent, StatusComponent, ComorbidadeComponent |
| **dashboard_summary** | ✅ | - | - | - | App.tsx (Dashboard) |

---

### 🟡 ALERTAS E TAREFAS
| Tabela | Leitura | Criação | Atualização | Exclusão | Componentes |
|--------|---------|---------|-------------|----------|-------------|
| **alertas_paciente** | ✅ | ✅ | ✅ | ✅ | App.tsx, AlertasSection.tsx, DistintvoComponent.tsx |
| **tasks** | ✅ | ✅ | ✅ | ✅ | App.tsx, AlertasSection.tsx |
| **alertas_paciente_view_completa** | ✅ | - | - | - | App.tsx, AlertasSection.tsx, AlertsHistoryScreen.tsx |
| **tasks_view_horario_br** | ✅ | - | - | - | App.tsx, AlertasSection.tsx, AlertsHistoryScreen.tsx |
| **alert_completions_with_user** | ✅ | - | - | - | App.tsx (Real-time) |

---

### 🔵 DIAGNÓSTICOS
| Tabela | Leitura | Criação | Atualização | Exclusão | Componentes |
|--------|---------|---------|-------------|----------|-------------|
| **paciente_diagnosticos** | ✅ | ✅ | ✅ | ✅ | DiagnosticsSection.tsx, DiagnosticsAdmin.tsx |
| **diagnosticos_historico** | ✅ | ✅ | - | - | DiagnosticsSection.tsx |
| **diagnosticos_historico_com_usuario** | ✅ | - | - | - | App.tsx |
| **perguntas_diagnistico** | ✅ | - | ✅ | ✅ | DiagnosticsSection.tsx, DiagnosticsAdmin.tsx |
| **pergunta_opcoes_diagnostico** | ✅ | - | ✅ | ✅ | DiagnosticsSection.tsx, DiagnosticsAdmin.tsx |

---

### 💊 MEDICAÇÕES
| Tabela | Leitura | Criação | Atualização | Exclusão | Componentes |
|--------|---------|---------|-------------|----------|-------------|
| **medicacoes_pacientes** | ✅ | ✅ | ✅ | ✅ | App.tsx (Modal de medicações) |

---

### 🩺 EXAMES
| Tabela | Leitura | Criação | Atualização | Exclusão | Componentes |
|--------|---------|---------|-------------|----------|-------------|
| **exames_pacientes** | ✅ | ✅ | ✅ | ✅ | App.tsx (Modal de exames) |

---

### 🏥 DISPOSITIVOS E PROCEDIMENTOS
| Tabela | Leitura | Criação | Atualização | Exclusão | Componentes |
|--------|---------|---------|-------------|----------|-------------|
| **dispositivos_pacientes** | ✅ | ✅ | ✅ | ✅ | App.tsx (Modals de dispositivos) |
| **procedimentos_pacientes** | ✅ | ✅ | ✅ | ✅ | App.tsx (Modal de procedimentos) |

---

### 🧬 CULTURAS
| Tabela | Leitura | Criação | Atualização | Exclusão | Componentes |
|--------|---------|---------|-------------|----------|-------------|
| **culturas_pacientes** | ✅ | ✅ | ✅ | ✅ | App.tsx (AddCultureModal, EditCultureModal) |

---

### 🍽️ DIETAS
| Tabela | Leitura | Criação | Atualização | Exclusão | Componentes |
|--------|---------|---------|-------------|----------|-------------|
| **dietas_pacientes** | ✅ | ✅ | ✅ | ✅ | App.tsx (AddDietModal, EditDietModal) |

---

### ⚠️ PRECAUÇÕES
| Tabela | Leitura | Criação | Atualização | Exclusão | Componentes |
|--------|---------|---------|-------------|----------|-------------|
| **precautions** | ✅ | ✅ | ✅ | ✅ | App.tsx, PrecautionsCard.tsx |

---

### 📊 ESCALAS DE AVALIAÇÃO
| Tabela | Leitura | Criação | Componentes |
|--------|---------|---------|-------------|
| **scale_scores** | ✅ | ✅ | BradenCalculator, FLACCCalculator, ComfortBCalculator, GlasgowCalculator, CAMICUCalculator, ConsciousnessCalculator, VNICNAFCalculator, AbstinenciaCalculator, SOSPDCalculator |

**Escalas suportadas:**
- 🔹 Braden (App.tsx)
- 🔹 Braden-QD (App.tsx)
- 🔹 FLACC (App.tsx)
- 🔹 Comfort-B (App.tsx)
- 🔹 Glasgow (App.tsx)
- 🔹 Delirium/CAM-ICU (App.tsx)
- 🔹 CRSRS (App.tsx)
- 🔹 Consciousness (App.tsx)
- 🔹 VNICNAF (App.tsx)
- 🔹 SOSPD (App.tsx)
- 🔹 FSS (App.tsx)

---

### ⏱️ BALANÇO HÍDRICO E DIURESE
| Tabela | Leitura | Criação | Componentes |
|--------|---------|---------|-------------|
| **diurese** | ✅ | ✅ | DiuresisCalc.tsx, DiuresisHistory.tsx, LatestCalculationsCard.tsx |
| **balanco_hidrico** | ✅ | ✅ | FluidBalanceCalc.tsx, FluidBalanceHistory.tsx, LatestCalculationsCard.tsx |

---

### ✅ CHECKLIST DIÁRIO
| Tabela | Leitura | Criação | Atualização | Componentes |
|--------|---------|---------|-------------|-------------|
| **checklist_answers** | ✅ | ✅ | ✅ | App.tsx (Seção de checklist) |
| **perguntas** | ✅ | - | - | App.tsx |
| **pergunta_opcoes** | ✅ | - | - | App.tsx |
| **categorias** | ✅ | - | - | App.tsx, PerguntasAdmin.tsx |

---

### 👤 USUÁRIOS
| Tabela | Leitura | Escrita | Componentes |
|--------|---------|--------|-------------|
| **users** | ✅ | ✅ | App.tsx (Sincronização de perfil) |

---

### 📸 ARMAZENAMENTO
| Storage | Operações | Componentes |
|---------|-----------|-------------|
| **roundfoto** | Upload, Get URL | App.tsx (Foto do paciente) |

---

## 🔄 SEQUÊNCIA DE OPERAÇÕES POR AÇÃO DO USUÁRIO

### ⚡ Criar Novo Alerta
```
1. alertas_paciente.INSERT
2. tasks.INSERT (se houver prazo)
3. users.SELECT (para obter created_by_name via view)
4. alertas_paciente_view_completa.SELECT (atualizar UI)
```

### ⚡ Registrar Escala (ex: Braden)
```
1. scale_scores.INSERT
2. scale_scores.SELECT (atualizar histórico)
```

### ⚡ Prescrever Medicação
```
1. medicacoes_pacientes.INSERT
2. medicacoes_pacientes.SELECT (atualizar lista)
```

### ⚡ Registrar Cultura
```
1. culturas_pacientes.INSERT
2. culturas_pacientes.SELECT (atualizar lista)
```

### ⚡ Responder Checklist
```
1. checklist_answers.UPSERT
2. checklist_answers.SELECT (se mudar de data)
```

### ⚡ Diagnosticar
```
1. paciente_diagnosticos.INSERT/UPDATE
2. diagnosticos_historico.INSERT
3. diagnosticos_historico_com_usuario.SELECT
```

---

## 📋 TABELAS POR TIPO DE OPERAÇÃO

### CREATE ONLY
- `dashboard_summary` (view - leitura apenas)
- `diagnosticos_historico_com_usuario` (view - leitura apenas)
- `alert_completions_with_user` (view - leitura apenas)
- `alertas_paciente_view_completa` (view - leitura apenas)
- `tasks_view_horario_br` (view - leitura apenas)

### FULL CRUD
- patients
- alertas_paciente
- tasks
- medicacoes_pacientes
- exames_pacientes
- dispositivos_pacientes
- procedimentos_pacientes
- culturas_pacientes
- dietas_pacientes
- precautions
- scale_scores
- checklist_answers
- paciente_diagnosticos

### APPEND-ONLY
- diagnosticos_historico (INSERT apenas)
- diurese (INSERT e SELECT)
- balanco_hidrico (INSERT e SELECT)

---

## 🎯 QUANTAS VEZES CADA TABELA É USADA

| Tabela | Contagem de Referências | Frequência |
|--------|------------------------|-----------|
| **patients** | 8+ | Muito alta |
| **scale_scores** | 12+ | Muito alta |
| **tasks** | 5+ | Alta |
| **alertas_paciente** | 7+ | Alta |
| **medicacoes_pacientes** | 3+ | Média |
| **dispositivos_pacientes** | 5+ | Média |
| **exames_pacientes** | 3+ | Média |
| **procedimentos_pacientes** | 3+ | Média |
| **culturas_pacientes** | 3+ | Média |
| **dietas_pacientes** | 4+ | Média |
| **precautions** | 5+ | Média |
| **diurese** | 3+ | Média |
| **balanco_hidrico** | 3+ | Média |
| **checklist_answers** | 2+ | Baixa |

---

## 🚀 PERFORMANCE CRÍTICA

**Tabelas com múltiplas operações simultâneas:**
1. **patients** - Dashboard carrega todos
2. **scale_scores** - Múltiplas calculadoras
3. **alertas_paciente** + **tasks** - Real-time subscriptions ativas

---

## 🔐 TABELAS COM RASTREAMENTO DE AUDITORIA

Todas que têm `created_by`:
- tasks
- alertas_paciente
- paciente_diagnosticos
- diagnosticos_historico

---

**Última atualização:** 20 de janeiro de 2026
