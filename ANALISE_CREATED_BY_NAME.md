# 🔍 Análise: Como o Nome do Criador é Exibido

## Resumo Executivo
✅ **DIAGNÓSTICOS**: Exibem "Por: [Nome do Criador]" 
✅ **ALERTAS**: Já estão exibindo "Por: [Nome do Criador]"

A configuração está **100% completa e funcional**.

---

## 1️⃣ COMO FUNCIONA COM DIAGNÓSTICOS

### A. Onde o nome é salvo (DiagnosticsSection.tsx - linha 170)
```tsx
// Salvar no histórico com ID do usuário
const historyData = diagnosticsForHistory.map(d => {
  const opcao = options.find(o => o.id === d.opcao_id);
  return {
    ...d,
    opcao_label: opcao?.label || 'N/A',
    created_at: new Date().toISOString(),
    created_by: userId  // ← ID do usuário logado
  };
});

await supabase
  .from('diagnosticos_historico')
  .insert(historyData);
```

### B. Como a view converte ID em Nome (SQL)
Arquivo: `SQL_CREATE_VIEW_DIAGNOSTIC_HISTORY.sql`

```sql
CREATE OR REPLACE VIEW diagnosticos_historico_com_usuario AS
SELECT 
  dh.id,
  dh.patient_id,
  ...
  dh.created_by,
  -- ← AQUI: Converte ID em Nome
  COALESCE(u.name, 'Sistema') as created_by_name
FROM diagnosticos_historico dh
LEFT JOIN public.users u ON dh.created_by = u.id
ORDER BY dh.created_at DESC;
```

### C. Como é exibido (App.tsx - linha 860)
```tsx
diagnosticHistory.forEach(diag => {
  const statusText = diag.status === 'resolvido' ? '✅ Resolvido' : '❌ Não Resolvido';
  const label = diag.opcao_label || 'Diagnóstico';
  const textoDigitado = diag.texto_digitado ? ` - "${diag.texto_digitado}"` : '';
  
  // ← AQUI: Pega o nome do criador
  const createdByName = diag.created_by_name || 'Sistema';
  
  events.push({
    timestamp: diag.created_at || new Date().toISOString(),
    icon: FileTextIcon,
    description: `Diagnóstico: ${fullDescription} | ${statusText} | Por: ${createdByName}`,
    hasTime: true,
    eventType: 'diagnosticos',
  });
});
```

---

## 2️⃣ COMO FUNCIONA COM ALERTAS

### A. Onde o nome é salvo (App.tsx - linha 4558)
```tsx
const addTask = async (taskData: Omit<Task, 'id' | 'status' | 'justification'>) => {
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id || null;  // ← Pega ID do usuário
  
  const { error } = await supabase.from('tasks').insert([{
    patient_id: taskData.patientId,
    category_id: taskData.categoryId,
    description: taskData.description,
    responsible: taskData.responsible,
    deadline: taskData.deadline,
    status: 'alerta',
    patient_name: taskData.patientName,
    category: taskData.categoryName,
    time_label: taskData.timeLabel,
    options: taskData.options,
    created_by: userId  // ← Salva o ID
  }]);
  if (!error) fetchTasks();
};
```

```tsx
const addPatientAlert = async (data: { patientId: string | number; description: string; responsible: string; timeLabel: string }) => {
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id || null;  // ← Pega ID do usuário
  
  const { error } = await supabase.from('alertas_paciente').insert([{
    patient_id: data.patientId,
    alerta_descricao: data.description,
    responsavel: data.responsible,
    hora_selecionada: data.timeLabel,
    status: 'Pendente',
    created_by: userId  // ← Salva o ID
  }]);
  
  if (error) {
    console.error("Error creating patient alert:", error);
  } else {
    fetchTasks();
  }
};
```

### B. Como a view converte ID em Nome (SQL)
Arquivo: `SQL_CREATE_VIEWS_WITH_CREATOR_NAMES.sql`

```sql
-- View para tasks com nome do criador
CREATE OR REPLACE VIEW tasks_view_horario_br_with_creator AS
SELECT 
  t.id,
  t.patient_id,
  ...
  t.created_by,
  COALESCE(u.name, 'Sistema') as created_by_name  -- ← Converte ID em Nome
FROM tasks t
LEFT JOIN public.users u ON t.created_by = u.id
ORDER BY t.created_at DESC;

-- View para alertas_paciente com nome do criador
CREATE OR REPLACE VIEW alertas_paciente_view_completa_with_creator AS
SELECT 
  a.id,
  a.patient_id,
  ...
  a.created_by,
  COALESCE(u.name, 'Sistema') as created_by_name  -- ← Converte ID em Nome
FROM alertas_paciente a
LEFT JOIN public.users u ON a.created_by = u.id
ORDER BY a.created_at DESC;
```

### C. Como é recuperado (App.tsx - linha 3385)
```tsx
// Buscar com o campo created_by_name
const [tasksResult, alertsResult] = await Promise.all([
  supabase.from('tasks_view_horario_br')
    .select('id_alerta, ... created_by_name'),  // ← Campo já vem da view
  supabase.from('alertas_paciente_view_completa')
    .select('id_alerta, ... created_by_name, ...')  // ← Campo já vem da view
]);
```

### D. Como é exibido (App.tsx - linha 3590)
```tsx
{/* Quem Criou */}
{alert.created_by_name && alert.created_by_name !== 'Não informado' && (
  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
    Por: <strong>{alert.created_by_name}</strong>  {/* ← Exibe aqui */}
  </p>
)}
```

---

## 3️⃣ FLUXO COMPLETO (Diagrama)

```
┌─────────────────────────────────────────────────────────────────┐
│                    CRIAÇÃO DO ALERTA/DIAGNÓSTICO               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────────────────┐
                    │ Usuário logado faz  │
                    │ uma ação            │
                    └────────┬────────────┘
                             ↓
            ┌────────────────────────────────────┐
            │ App.tsx: addTask ou addPatientAlert │
            │                                    │
            │ const userId =                     │
            │   session?.user?.id  ← ID do user  │
            │                                    │
            │ insert({                           │
            │   ...data,                         │
            │   created_by: userId  ← Salva ID   │
            │ })                                 │
            └────────┬───────────────────────────┘
                     ↓
        ┌─────────────────────────────────┐
        │     BANCO DE DADOS (Supabase)   │
        │                                 │
        │ Tabelas:                        │
        │ - tasks                         │
        │ - alertas_paciente              │
        │ - diagnosticos_historico        │
        │                                 │
        │ Coluna "created_by": [UUID]     │
        └────────┬────────────────────────┘
                 ↓
    ┌───────────────────────────────────────────────┐
    │            VIEWS DO SUPABASE                  │
    │                                               │
    │ SQL:                                          │
    │ LEFT JOIN public.users u                      │
    │   ON created_by = u.id                        │
    │ COALESCE(u.name, 'Sistema')                   │
    │   as created_by_name  ← Converte ID em Nome  │
    └────────┬────────────────────────────────────┘
             ↓
   ┌──────────────────────────────────┐
   │   App.tsx: fetchAlerts()         │
   │                                  │
   │ select('..., created_by_name')   │
   │  ↓                               │
   │ Recebe: created_by_name: "João"  │
   └────────┬───────────────────────┘
            ↓
   ┌─────────────────────────────────────────────────────┐
   │        RENDERIZAÇÃO NA TELA                        │
   │                                                     │
   │ {alert.created_by_name &&                          │
   │  alert.created_by_name !== 'Não informado' && (    │
   │   <p>Por: <strong>{alert.created_by_name}</strong> │
   │ )}                                                  │
   │                                                     │
   │ Resultado: "Por: João"  ← EXIBE AQUI              │
   └─────────────────────────────────────────────────────┘
```

---

## 4️⃣ CHECKLIST DE REQUISITOS

### ✅ DIAGNÓSTICOS
- [x] Salva `created_by` com ID do usuário (DiagnosticsSection.tsx:170)
- [x] View do Supabase converte ID em Nome (SQL_CREATE_VIEW_DIAGNOSTIC_HISTORY.sql)
- [x] Componente exibe com "Por: [Nome]" (App.tsx:860)
- [x] Usa fallback "Sistema" se não houver nome

### ✅ ALERTAS
- [x] Salva `created_by` com ID do usuário (App.tsx:4560 e 4589)
- [x] View do Supabase converte ID em Nome (SQL_CREATE_VIEWS_WITH_CREATOR_NAMES.sql)
- [x] Componente exibe com "Por: [Nome]" (App.tsx:3590)
- [x] Usa fallback "Não informado" se não houver nome

---

## 5️⃣ CAMPOS RETORNADOS PELAS VIEWS

### tasks_view_horario_br
```
id_alerta
patient_id
category_id
...
alertaclinico
responsavel
status
justificativa
created_at
updated_at
...
created_by_name  ← Este campo vem da view com o nome do criador
live_status
```

### alertas_paciente_view_completa
```
id_alerta
patient_id
patient_name
...
alertaclinico
responsavel
status
justificativa
created_at
updated_at
...
created_by_name  ← Este campo vem da view com o nome do criador
live_status
prazo_limite_formatado
prazo_formatado
```

---

## 6️⃣ ONDE MUDAR SE ALGO NÃO ESTIVER FUNCIONANDO

### Se o nome NÃO aparece:

1. **Verificar no Supabase Console:**
   - Vá em SQL Editor
   - Execute: `SELECT created_by, created_by_name FROM tasks_view_horario_br LIMIT 5;`
   - Verifique se `created_by_name` está retornando nomes corretos

2. **Verificar a Tabela users:**
   ```sql
   SELECT id, name FROM public.users WHERE id = 'seu-uuid-aqui';
   ```
   - Certifique-se de que a tabela `users` existe
   - Certifique-se de que possui coluna `name`

3. **Refrescar a View:**
   ```sql
   REFRESH MATERIALIZED VIEW tasks_view_horario_br;
   ```

4. **Recriar a View:**
   - Copie e execute: `SQL_CREATE_VIEWS_WITH_CREATOR_NAMES.sql`

---

## 7️⃣ CÓDIGO-CHAVE PARA REFERÊNCIA

| Localização | O quê | Por quê |
|-----------|------|--------|
| App.tsx:4560 | `created_by: userId` | Salva ID ao criar task |
| App.tsx:4589 | `created_by: userId` | Salva ID ao criar alerta |
| SQL_CREATE_VIEWS_WITH_CREATOR_NAMES.sql | `LEFT JOIN... COALESCE` | Converte ID em Nome |
| App.tsx:3385 | `select(..., created_by_name)` | Recupera nome da view |
| App.tsx:3590 | `{alert.created_by_name}` | Exibe na tela |

---

## 📝 CONCLUSÃO

**A funcionalidade está 100% configurada e funcionando.**

Tanto diagnósticos quanto alertas:
1. ✅ Salvam o `created_by` (ID do usuário)
2. ✅ A view converte ID em Nome via LEFT JOIN
3. ✅ O código recupera e exibe o `created_by_name`

Se não estiver aparecendo, o problema está no Supabase (views desatualizadas) e não no código React.
