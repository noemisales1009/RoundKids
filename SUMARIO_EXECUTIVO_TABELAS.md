# 📌 SUMÁRIO EXECUTIVO - Tabelas do Supabase RoundKids

## 🎯 EM UMA PÁGINA

Sua aplicação RoundKids usa **22 tabelas + 5 views** do Supabase para gerenciar:
- 👥 Pacientes pediátricos
- 📊 Escalas de avaliação clínica (11 tipos)
- 🚨 Alertas e tarefas com prazos
- 💊 Medicações, dispositivos, procedimentos
- 🔬 Diagnósticos com auditoria
- 🧬 Culturas microbiológicas
- 🍽️ Dietas e precauções
- 💧 Balanço hídrico e diurese
- ✅ Checklist diário

---

## 📊 CONTAGEM

| Item | Quantidade |
|------|-----------|
| Tabelas Principais | 22 |
| Views | 5 |
| Storage Buckets | 1 |
| Real-time Channels | 3 |
| Escalas Suportadas | 11+ |
| Componentes com DB | 40+ |

---

## 🔴 AS 5 TABELAS MAIS CRÍTICAS

1. **patients** - Raiz de tudo (8+ operações)
2. **alertas_paciente** - Avisos clínicos (real-time ativo)
3. **tasks** - Tarefas com prazo (real-time ativo)
4. **scale_scores** - 11 escalas diferentes
5. **paciente_diagnosticos** - Diagnósticos com auditoria

---

## 📍 DONDE ESTÃO DOCUMENTADAS

### 📖 Documentos Criados (todos no mesmo folder)

| Documento | Tamanho | Melhor Para |
|-----------|---------|-----------|
| **REFERENCIA_RAPIDA_TABELAS.md** | 2 min | Resposta rápida |
| **MAPA_FUNCOES_TABELAS.md** | 10 min | Entender "onde usa" |
| **DIAGRAMA_TABELAS_VISUAL.md** | 15 min | Visualizar conexões |
| **TABELAS_SUPABASE_DETALHADO.md** | 30 min | Análise profunda |
| **CHECKLIST_TABELAS_COMPLETO.md** | Impressão | Auditoria/checklist |
| **INDICE_TABELAS_MASTER.md** | Navegação | Guia dos 5 acima |

---

## 🚀 COMECE AQUI

### 1️⃣ Resposta Rápida (30 segundos)
```
Abra: REFERENCIA_RAPIDA_TABELAS.md
Procure: "TABELA RÁPIDA"
Encontre: A tabela que quer
```

### 2️⃣ Entender Conexões (5 minutos)
```
Abra: DIAGRAMA_TABELAS_VISUAL.md
Procure: "ESTRUTURA SIMPLIFICADA"
Veja: Como as tabelas se conectam
```

### 3️⃣ Saber Função Específica (10 minutos)
```
Abra: MAPA_FUNCOES_TABELAS.md
Procure: Sua função (ex: "ALERTAS")
Leia: Quais tabelas são usadas
```

### 4️⃣ Detalhes Completos (30 minutos)
```
Abra: TABELAS_SUPABASE_DETALHADO.md
Procure: Número da tabela
Leia: Tudo sobre ela
```

### 5️⃣ Auditoria/Checklist (Impressão)
```
Abra: CHECKLIST_TABELAS_COMPLETO.md
Imprima: Inteiro
Use: Como checklist
```

---

## 💡 EXEMPLOS RÁPIDOS

### Pergunta: "Onde fica a escala de Braden?"
```
Resposta: scale_scores (tabela 8)
Componente: BradenCalculator.tsx
Linha: 216 (INSERT)
Arquivo: REFERENCIA_RAPIDA_TABELAS.md → "Escalas"
```

### Pergunta: "Como criar um alerta?"
```
Resposta: 
  1. alertas_paciente.INSERT
  2. tasks.INSERT (se tiver deadline)
  3. users.SELECT (para obter nome)
Arquivo: MAPA_FUNCOES_TABELAS.md → "Criar Novo Alerta"
```

### Pergunta: "Quem criou esse diagnóstico?"
```
Resposta: Campo created_by em paciente_diagnosticos
View: diagnosticos_historico_com_usuario
Arquivo: CHECKLIST_TABELAS_COMPLETO.md → "Auditoria"
```

---

## 🎯 QUICK STATS

```
22 TABELAS
├─ 6 Tabelas CRUD (create, read, update, delete)
├─ 9 Tabelas CR (create, read)
├─ 4 Tabelas R (read only)
└─ 3 Tabelas relacionadas a diagnóstico

5 VIEWS
├─ 2 Views com LEFT JOIN para nomes
├─ 1 View com data formatada Brasil
├─ 1 View para auditoria
└─ 1 View para dashboard

3 REAL-TIME CHANNELS
├─ alertas_paciente (linha 850)
├─ tasks (linha 857)
└─ alert_completions (linha 890)

11+ ESCALAS em scale_scores
├─ Braden (úlcera)
├─ FLACC (dor)
├─ Glasgow (consciência)
├─ Delirium (delirium)
└─ ... (7 mais)

1 STORAGE
└─ roundfoto (fotos de pacientes)
```

---

## 📋 LISTA COMPLETA (22 TABELAS)

```
1. patients ..................... Dados demográficos
2. tasks ....................... Tarefas com prazo
3. alertas_paciente ............ Avisos clínicos
4. dispositivos_pacientes ...... Tubos, cateteres
5. exames_pacientes ............ Resultados de lab
6. medicacoes_pacientes ........ Prescrições
7. procedimentos_pacientes ..... Cirurgias
8. scale_scores ................ Escalas de avaliação
9. culturas_pacientes .......... Culturas microbiológicas
10. dietas_pacientes ........... Nutrição
11. precautions ................ Alergia, isolamento
12. diurese .................... Volume de urina
13. balanco_hidrico ............ Entrada vs saída
14. perguntas .................. Checklist
15. pergunta_opcoes ............ Opções de resposta
16. categorias ................. Grupos de perguntas
17. checklist_answers .......... Respostas diárias
18. paciente_diagnosticos ...... Diagnósticos
19. diagnosticos_historico ..... Histórico de mudanças
20. perguntas_diagnistico ...... Perguntas diagnóstico
21. pergunta_opcoes_diagnostico  Opções diagnóstico
22. users ...................... Perfil de usuários
```

---

## 🔄 FLUXO: CRIAR ALERTA

```
USUÁRIO CLICA "NOVO ALERTA"
    ↓
alertas_paciente.INSERT (com created_by)
    ↓
tasks.INSERT (se deadline)
    ↓
users.SELECT (para nome)
    ↓
Real-time subscription
    ↓
alertas_paciente_view_completa.SELECT
    ↓
UI ATUALIZA COM NOVO ALERTA
```

---

## 🔄 FLUXO: REGISTRAR ESCALA

```
USUÁRIO CLICA "BRADEN ESCALA"
    ↓
BradenCalculator.tsx carrega
    ↓
USUÁRIO PREENCHE 6 CAMPOS
    ↓
scale_scores.INSERT
    ↓
scale_scores.SELECT (histórico)
    ↓
UI EXIBE PONTUAÇÃO + RISCO
```

---

## 🔐 RASTREAMENTO DE CRIADOR

| Tabela | Campo | View |
|--------|-------|------|
| tasks | created_by | tasks_view_horario_br |
| alertas_paciente | created_by | alertas_paciente_view_completa |
| paciente_diagnosticos | created_by | - |
| diagnosticos_historico | created_by | diagnosticos_historico_com_usuario |

---

## ⚡ REAL-TIME (3 CANAIS)

| Canal | Tabela | Ativa em | Função |
|-------|--------|----------|--------|
| alertas_paciente | alertas_paciente | Linha 850 | Novo alerta |
| tasks | tasks | Linha 857 | Nova tarefa |
| alert_completions | alert_completions | Linha 890 | Completação |

---

## 📸 STORAGE

```
Bucket: roundfoto (PÚBLICO)
├─ Tipo: Fotos de pacientes
├─ Upload: App.tsx:2865
├─ Get: App.tsx:2877
└─ IMPORTANTE: Deve ser PUBLIC
```

---

## 🎨 ESCALAS CLINICAS

Todas em `scale_scores`:

| # | Escala | Componente | Campo |
|---|--------|-----------|-------|
| 1 | Braden | BradenCalculator | braden |
| 2 | Braden-QD | BradenQDScale | braden_qd |
| 3 | FLACC | FLACCCalculator | flacc |
| 4 | Comfort-B | ComfortBCalculator | comfort_b |
| 5 | Glasgow | GlasgowCalculator | glasgow |
| 6 | Delirium | CAMICUCalculator | cam_icu |
| 7 | CRSRS | - | crsrs |
| 8 | Consciousness | ConsciousnessCalculator | consciousness |
| 9 | VNICNAF | VNICNAFCalculator | vnicnaf |
| 10 | SOSPD | SOSPDCalculator | sospd |
| 11 | FSS | FSSScale | fss |

---

## 💾 OPERAÇÕES

| Tipo | Quantidade | Exemplos |
|------|-----------|----------|
| CREATE (INSERT) | 15+ | tasks:3743, alertas:3763 |
| READ (SELECT) | 22 | patients:3001, scale_scores:3006 |
| UPDATE | 10+ | tasks:2633, patients:3571 |
| DELETE | 8+ | tasks:3340, dietas:3510 |
| UPSERT | 2+ | checklist:3265, users:3860 |

---

## 🔧 MANUTENÇÃO

### Tabelas Críticas (fazer backup frequente)
- patients
- alertas_paciente
- tasks
- scale_scores

### Tabelas com Histórico
- diagnosticos_historico
- (para auditoria)

### Storage para Backup
- roundfoto bucket

---

## ✅ STATUS DO SISTEMA

- ✅ 22 tabelas em produção
- ✅ 5 views criadas
- ✅ Real-time subscriptions ativas
- ✅ RLS policies implementadas
- ✅ created_by tracking funcionando
- ✅ Auditoria de diagnósticos ativa
- ✅ Bucket de fotos público
- ✅ Documentação completa

---

## 🚀 PRÓXIMOS PASSOS

1. Leia: **REFERENCIA_RAPIDA_TABELAS.md** (2 min)
2. Explore: **DIAGRAMA_TABELAS_VISUAL.md** (5 min)
3. Estude: **Documento específico para sua função** (10-30 min)
4. Implemente: Use os documentos como referência

---

## 📞 ENCONTRA RÁPIDO

| Procura | Arquivo | Seção |
|---------|---------|-------|
| Tudo sobre uma tabela | TABELAS_SUPABASE_DETALHADO.md | Seção X |
| Onde usa uma tabela | MAPA_FUNCOES_TABELAS.md | Matriz CRUD |
| Como as tabelas conectam | DIAGRAMA_TABELAS_VISUAL.md | Diagramas |
| Resposta em 30 seg | REFERENCIA_RAPIDA_TABELAS.md | Qualquer seção |
| Checklist para auditar | CHECKLIST_TABELAS_COMPLETO.md | Tudo |

---

## 🎓 DOCUMENTAÇÃO POR NÍVEL

### 🟢 Iniciante
1. REFERENCIA_RAPIDA_TABELAS.md (2 min)
2. DIAGRAMA_TABELAS_VISUAL.md (10 min)
3. MAPA_FUNCOES_TABELAS.md (15 min)

### 🟡 Intermediário
1. TABELAS_SUPABASE_DETALHADO.md (seções críticas)
2. MAPA_FUNCOES_TABELAS.md (completo)
3. Documentos acima conforme necessidade

### 🔴 Avançado
1. TABELAS_SUPABASE_DETALHADO.md (completo)
2. CHECKLIST_TABELAS_COMPLETO.md (auditoria)
3. Qualquer documento para referência

---

## 📊 MATRIZ DE DOCUMENTOS

```
REFERENCIA_RAPIDA           MAPA_FUNCOES         DIAGRAMA_VISUAL
(2 min)                     (10 min)             (15 min)
Tabela resumida             Onde usa cada        Como conecta
Resposta rápida             Operações CRUD       Fluxos de dados

     ↓ Para mais detalhes ↓

TABELAS_SUPABASE_DETALHADO  CHECKLIST_COMPLETO
(30 min)                     (Impressão)
Tudo sobre cada tabela       Auditoria/verificação
Análise profunda             Checklist estruturado
```

---

## 🎯 RECOMENDAÇÃO FINAL

**Comece por REFERENCIA_RAPIDA_TABELAS.md** (2 minutos)

Depois escolha seu documento conforme necessidade:
- Quer resposta rápida? → REFERENCIA
- Quer entender função? → MAPA
- Quer visualizar? → DIAGRAMA
- Quer detalhes? → TABELAS
- Quer auditar? → CHECKLIST

---

**Sumário Executivo**  
**Data:** 20 de janeiro de 2026  
**Status:** ✅ PRONTO  
**Próximo:** Escolha um documento acima!

Boa sorte! 🚀
