# 🔀 Comparação: Diagnósticos vs Alertas - Sistema de \"Quem Criou\"

## 📊 Tabela Comparativa Completa

```
┌────────────────────┬──────────────────────────┬──────────────────────────┐
│ Aspecto            │ DIAGNÓSTICOS             │ ALERTAS                  │
├────────────────────┼──────────────────────────┼──────────────────────────┤
│ Tabela Principal   │ paciente_diagnosticos    │ tasks / alertas_paciente │
│ Coluna Criador     │ created_by (UUID)        │ created_by (UUID)        │
│ Tabela Histórico   │ diagnosticos_historico   │ (sem histórico separado) │
│ View Nome Criador  │ diagnosticos_historico_  │ tasks_view_horario_br    │
│                    │ com_usuario              │ alertas_paciente_view... │
├────────────────────┼──────────────────────────┼──────────────────────────┤
│ SALVANDO           │                          │                          │
│ ├─ Onde salva      │ DiagnosticsSection.tsx   │ App.tsx (addTask)        │
│ │                  │ linha 170                │ linha 4560               │
│ ├─ O que salva     │ created_by: userId       │ created_by: userId       │
│ ├─ Quando salva    │ Ao clicar \"Salvar\"      │ Ao clicar \"Criar Alerta\" │
│ └─ Quem chama      │ handleSave()             │ addTask()                │
├────────────────────┼──────────────────────────┼──────────────────────────┤
│ CONVERTENDO        │                          │                          │
│ ├─ Arquivo SQL     │ SQL_CREATE_VIEW_         │ SQL_CREATE_VIEWS_        │
│ │                  │ DIAGNOSTIC_HISTORY.sql   │ WITH_CREATOR_NAMES.sql   │
│ ├─ Tipo SQL        │ CREATE OR REPLACE VIEW   │ CREATE OR REPLACE VIEW   │
│ ├─ JOIN            │ LEFT JOIN users u ON     │ LEFT JOIN users u ON     │
│ │                  │ dh.created_by = u.id     │ t.created_by = u.id      │
│ ├─ Campo Resultado │ COALESCE(u.name,         │ COALESCE(u.name,         │
│ │                  │ 'Sistema') as...         │ 'Sistema') as...         │
│ └─ Fallback        │ 'Sistema'                │ 'Sistema'                │
├────────────────────┼──────────────────────────┼──────────────────────────┤
│ RECUPERANDO        │                          │                          │
│ ├─ Arquivo JS      │ App.tsx                  │ App.tsx                  │
│ │                  │ (PatientHistoryScreen)   │ (TaskStatusScreen)       │
│ ├─ Linha Código    │ linha 662                │ linha 3384 / 3385        │
│ ├─ Query SELECT    │ from('diag_historico_    │ from('tasks_view_...')   │
│ │                  │ com_usuario')            │ from('alertas_paciente_..│
│ │                  │                          │ view_completa')          │
│ ├─ Campo Usado     │ .select('*')             │ .select('...,            │
│ │                  │                          │ created_by_name')        │
│ ├─ Variável        │ diagnosticHistory        │ alerts                   │
│ │                  │ (array)                  │ (array)                  │
│ └─ Campo Obtido    │ diag.created_by_name     │ alert.created_by_name    │
├────────────────────┼──────────────────────────┼──────────────────────────┤
│ EXIBINDO           │                          │                          │
│ ├─ Arquivo React   │ App.tsx                  │ App.tsx                  │
│ │                  │ (PatientHistoryScreen)   │ (TaskStatusScreen)       │
│ ├─ Linha Código    │ linha 860                │ linha 3590               │
│ ├─ Componente      │ description em eventos   │ <p> tag                  │
│ ├─ Formato         │ \"Por: ${createdByName}\" │ \"Por: <strong>...\" │
│ ├─ Condição        │ (sempre mostra)          │ (if created_by_name)     │
│ ├─ Fallback UI     │ 'Sistema'                │ 'Não informado'          │
│ └─ CSS Classes     │ (no texto, sem classe)   │ text-xs text-slate-500   │
├────────────────────┼──────────────────────────┼──────────────────────────┤
│ RESULTADO FINAL    │                          │                          │
│ ├─ Texto Exibido   │ \"Por: João Silva\"       │ \"Por: João Silva\"       │
│ ├─ Localização     │ Histórico do paciente    │ Card de alerta           │
│ ├─ Exemplo         │ Diagnóstico: Febre       │ Alerta - Maria Silva     │
│ │                  │ Por: João Silva          │ Por: João Silva          │
│ └─ Funcionando     │ ✅ SIM                   │ ✅ SIM                   │
└────────────────────┴──────────────────────────┴──────────────────────────┘
```

---

## 🔗 Mapeamento de Código Linha por Linha

### DIAGNÓSTICOS

```
┌─────────────────────────────────────────────────────────────┐
│ 1. SALVANDO                                                 │
│ Arquivo: components/DiagnosticsSection.tsx                 │
│ Linha: 170                                                  │
│                                                             │
│ created_by: userId  ← Salva ID do usuário                 │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. CONVERTENDO (no Supabase)                               │
│ Arquivo: SQL_CREATE_VIEW_DIAGNOSTIC_HISTORY.sql            │
│                                                             │
│ LEFT JOIN public.users u ON dh.created_by = u.id          │
│ COALESCE(u.name, 'Sistema') as created_by_name            │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. RECUPERANDO                                              │
│ Arquivo: App.tsx                                            │
│ Linha: 662                                                  │
│                                                             │
│ from('diagnosticos_historico_com_usuario')                │
│   .select('*')  ← Já vem com created_by_name              │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. EXIBINDO                                                 │
│ Arquivo: App.tsx                                            │
│ Linha: 860                                                  │
│                                                             │
│ const createdByName = diag.created_by_name ||'Sistema'    │
│ description: `Diagnóstico... | Por: ${createdByName}`     │
└─────────────────────────────────────────────────────────────┘
```

### ALERTAS

```
┌─────────────────────────────────────────────────────────────┐
│ 1. SALVANDO (2 tipos)                                       │
│ Arquivo: App.tsx                                            │
│                                                             │
│ A. Tasks (Checklist)                                       │
│    Linha: 4560                                              │
│    created_by: userId  ← Salva ID do usuário              │
│                                                             │
│ B. Alertas Paciente                                        │
│    Linha: 4589                                              │
│    created_by: userId  ← Salva ID do usuário              │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. CONVERTENDO (no Supabase - 2 views)                     │
│ Arquivo: SQL_CREATE_VIEWS_WITH_CREATOR_NAMES.sql           │
│                                                             │
│ View 1: tasks_view_horario_br                              │
│   LEFT JOIN public.users u ON t.created_by = u.id         │
│   COALESCE(u.name, 'Sistema') as created_by_name          │
│                                                             │
│ View 2: alertas_paciente_view_completa                    │
│   LEFT JOIN public.users u ON a.created_by = u.id         │
│   COALESCE(u.name, 'Sistema') as created_by_name          │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. RECUPERANDO                                              │
│ Arquivo: App.tsx                                            │
│ Linha: 3384-3385                                            │
│                                                             │
│ from('tasks_view_horario_br')                              │
│   .select('id_alerta, ... created_by_name')  ← Pede campo │
│                                                             │
│ from('alertas_paciente_view_completa')                    │
│   .select('id_alerta, ... created_by_name')  ← Pede campo │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. EXIBINDO                                                 │
│ Arquivo: App.tsx                                            │
│ Linha: 3590                                                 │
│                                                             │
│ {alert.created_by_name &&                                 │
│  alert.created_by_name !== 'Não informado' && (           │
│   <p>Por: <strong>{alert.created_by_name}</strong></p>   │
│ )}                                                          │
│                                                             │
│ Renderiza: \"Por: João Silva\"                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Checklist de Similaridades

- [x] Ambos salvam `created_by`
- [x] Ambos têm views com `created_by_name`
- [x] Ambos recuperam com `.select('..., created_by_name')`
- [x] Ambos exibem com `{created_by_name}`
- [x] Ambos têm fallback ('Sistema' ou 'Não informado')
- [x] Ambos funcionam com LEFT JOIN na tabela users

---

## 🎯 Diferenças Principais

| Aspecto | Diagnósticos | Alertas |
|--------|-------------|---------|
| **Tabelas** | Usa tabela diagnósticos_historico | Usa tabelas tasks e alertas_paciente |
| **View** | 1 view (diagnósticos_historico_com_usuario) | 2 views (tasks_view + alertas_paciente_view) |
| **Recuperação** | Linha 662 | Linhas 3384-3385 |
| **Exibição** | Timeline (no histórico) | Card (no status screen) |
| **Fallback** | 'Sistema' | 'Não informado' |
| **Local** | Histórico do paciente | Tela de alertas |

---

## 🔄 Ciclo de Vida Comparado

```
DIAGNÓSTICO:
1. Usuário marca opção → 2. Salva created_by: UUID
   ↓
3. View converte UUID → 4. App recupera created_by_name
   ↓
5. Exibe no histórico → 6. \"Por: João Silva\"

ALERTA:
1. Usuário cria alerta → 2. Salva created_by: UUID
   ↓
3. View converte UUID → 4. App recupera created_by_name
   ↓
5. Exibe no card → 6. \"Por: João Silva\"
```

---

## 🎨 Componentes Visuais

### Diagnóstico (Timeline)
```
┌─────────────────────────────────────┐
│ 📋 Diagnóstico: Febre               │
│    ✅ Resolvido                     │
│    Por: João Silva  ← created_by    │
│ 2024-12-15 14:30                    │
└─────────────────────────────────────┘
```

### Alerta (Card)
```
┌──────────────────────────────────────┐
│ 🔴 Maria Silva         │ Leito: 5   │
├──────────────────────────────────────┤
│ Febre acima de 38°C                  │
│ Responsável: Enfermeiro João         │
│ Por: João Silva  ← created_by        │
│ Prazo: 24 horas                      │
└──────────────────────────────────────┘
```

---

## ✅ Conclusão

**Diagnósticos e Alertas usam EXATAMENTE o mesmo padrão:**

1. ✅ Salvar criador
2. ✅ View converte UUID
3. ✅ App recupera
4. ✅ Exibe na tela

**Resultado:** Ambos mostram \"Por: [Nome do Criador]\" ✨

---

## 🚀 Se Quiser Adicionar em Outro Lugar

Use este template:

```tsx
// 1. Ao salvar:
created_by: userId

// 2. Na view SQL:
LEFT JOIN users u ON created_by = u.id
COALESCE(u.name, 'Sistema') as created_by_name

// 3. Ao recuperar:
.select('..., created_by_name')

// 4. Ao exibir:
{item.created_by_name}
```

Pronto! 🎉
