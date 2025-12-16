# 🎬 Exemplo Prático: Rastreamento de "Quem Criou"

## Cenário Real

Você está logado como **João Silva** (ID: `550e8400-e29b-41d4-a716-446655440000`)

---

## 📝 PASSO 1: Criar um Alerta

### Código que Executa (App.tsx - AlertModal.tsx:3030)
```tsx
const handleSave = async () => {
  // ... validações ...
  
  addTask({
    patientId: "123",          // ID do paciente
    categoryId: 456,           // ID da categoria
    description: "Febre acima de 38°C",
    responsible: "Enfermeiro João",
    deadline: "2024-12-15T14:30:00Z",
    patientName: "Maria Silva",
    categoryName: "Monitoramento",
    timeLabel: "24 horas",
    options: { /* ... */ }
  });
};
```

### Função que Salva (App.tsx - linha 4558)
```tsx
const addTask = async (taskData) => {
  // 1. Pega a sessão do usuário logado
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id || null;
  // userId = "550e8400-e29b-41d4-a716-446655440000"
  
  // 2. Insere no banco com created_by
  const { error } = await supabase.from('tasks').insert([{
    patient_id: "123",
    category_id: 456,
    description: "Febre acima de 38°C",
    responsible: "Enfermeiro João",
    deadline: "2024-12-15T14:30:00Z",
    status: "alerta",
    patient_name: "Maria Silva",
    category: "Monitoramento",
    time_label: "24 horas",
    options: { /* ... */ },
    
    // ← A CHAVE: Salva o ID do usuário
    created_by: "550e8400-e29b-41d4-a716-446655440000"
  }]);
};
```

### O que foi salvo no Supabase (Tabela: `tasks`)
```
id | patient_id | category_id | description        | created_by (UUID)
---|----------|---------|----------------|-------------------
42 | 123      | 456     | Febre acima... | 550e8400-e29b-41d4-a716-446655440000
```

---

## 🔗 PASSO 2: A View Converte UUID em Nome

### A View (SQL_CREATE_VIEWS_WITH_CREATOR_NAMES.sql)
```sql
CREATE OR REPLACE VIEW tasks_view_horario_br AS
SELECT 
  t.id,
  t.patient_id,
  t.category_id,
  t.description,
  t.responsible,
  ...
  t.created_by,
  
  -- ← AQUI: Busca o nome na tabela users
  COALESCE(u.name, 'Sistema') as created_by_name
  
FROM tasks t
-- ← JOINcom a tabela users usando o UUID
LEFT JOIN public.users u ON t.created_by = u.id
ORDER BY t.created_at DESC;
```

### O Resultado da View
```
id | patient_id | ... | created_by (UUID)                | created_by_name
---|----------|-----|--------------------------------|------------------
42 | 123      | ... | 550e8400-e29b-41d4-a716-... | João Silva
```

**O que aconteceu:**
1. A tabela `users` tem:
   ```sql
   id                            | name
   550e8400-e29b-41d4-a716-...  | João Silva
   ```

2. A view fez o JOIN:
   ```
   tasks.created_by (550e8400-...) = users.id (550e8400-...)
   ↓
   Retorna: users.name = "João Silva"
   ```

---

## 🖥️ PASSO 3: O App Recupera e Exibe

### Código que Recupera (App.tsx - linha 3384)
```tsx
const fetchAlerts = async () => {
  const [tasksResult, alertsResult, patientsResult] = await Promise.all([
    // ← Pede o campo created_by_name da view
    supabase.from('tasks_view_horario_br').select(
      'id, patient_id, ... created_by_name'
    ),
    
    supabase.from('alertas_paciente_view_completa').select(
      'id, patient_id, ... created_by_name'
    ),
    
    supabase.from('patients').select('id, name, bed_number')
  ]);
  
  // tasksResult.data retorna:
  // [
  //   {
  //     id: 42,
  //     patient_id: 123,
  //     alertaclinico: "Febre acima de 38°C",
  //     created_by_name: "João Silva"  ← AQUI!
  //   }
  // ]
};
```

### Código que Processa (App.tsx - linha 3399)
```tsx
const allAlerts = [
  ...(tasksResult.data || []).map(t => {
    const patientInfo = patientsMap.get(t.patient_id);
    return {
      ...t,
      id: t.id_alerta,
      source: 'tasks',
      patient_name: patientInfo?.name || 'Desconhecido',
      bed_number: patientInfo?.bed_number || null,
      
      // ← Usa o nome que veio da view, com fallback
      created_by_name: t.created_by_name && t.created_by_name !== '' 
        ? t.created_by_name 
        : user?.name || 'Não informado'
    };
  })
];
```

### Código que Exibe (App.tsx - linha 3590)
```tsx
{/* Quem Criou */}
{alert.created_by_name && alert.created_by_name !== 'Não informado' && (
  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
    Por: <strong>{alert.created_by_name}</strong>
    {/* ↓ Renderiza */}
    {/* Por: João Silva */}
  </p>
)}
```

### O que o Usuário Vê
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Alerta - Maria Silva              | Leito: 10
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Febre acima de 38°C
Responsável: Enfermeiro João
Por: João Silva  ← AQUI! Nome do criador
Prazo: 24 horas
```

---

## 📊 Diagrama Completo: Do Clique ao Resultado

```
┌──────────────────────────────────────────────────────────────┐
│  USUÁRIO CLICA: "Criar Alerta"                               │
│  (Usuário logado: João Silva, UUID: 550e8400-...)            │
└──────────────┬───────────────────────────────────────────────┘
               ↓
        ┌──────────────────────────────────┐
        │  addTask(taskData)               │
        │                                  │
        │  const userId =                  │
        │    "550e8400-e29b-41d4-..."      │
        └────────┬─────────────────────────┘
                 ↓
    ┌─────────────────────────────────────────────────────┐
    │ Supabase INSERT INTO tasks:                         │
    │                                                     │
    │ {                                                   │
    │   patient_id: "123",                                │
    │   alertaclinico: "Febre acima de 38°C",             │
    │   created_by: "550e8400-..." ← UUID do João       │
    │ }                                                   │
    └────────┬────────────────────────────────────────────┘
             ↓
    ┌──────────────────────────────────────────────────────┐
    │      BANCO DE DADOS (Tabela: tasks)                 │
    │                                                      │
    │  id | patient_id | created_by                       │
    │  42 | 123        | 550e8400-... (UUID)             │
    └────────┬─────────────────────────────────────────────┘
             ↓
    ┌──────────────────────────────────────────────────────┐
    │   VIEW (tasks_view_horario_br)                       │
    │                                                      │
    │   SELECT ... FROM tasks t                           │
    │   LEFT JOIN users u ON t.created_by = u.id         │
    │   COALESCE(u.name, 'Sistema') as created_by_name   │
    └────────┬─────────────────────────────────────────────┘
             ↓
    ┌──────────────────────────────────────────────────────┐
    │  Resultado da View:                                  │
    │                                                      │
    │  id | created_by (UUID) | created_by_name           │
    │  42 | 550e8400-...      | João Silva  ← Convertido! │
    └────────┬─────────────────────────────────────────────┘
             ↓
    ┌──────────────────────────────────────────────────────┐
    │  App.tsx: fetchAlerts()                              │
    │                                                      │
    │  select('id, ... created_by_name')                  │
    │  ↓                                                   │
    │  Recebe: { created_by_name: "João Silva" }          │
    └────────┬─────────────────────────────────────────────┘
             ↓
    ┌──────────────────────────────────────────────────────┐
    │  App.tsx: Renderiza                                  │
    │                                                      │
    │  <p>Por: <strong>{alert.created_by_name}</strong></p>│
    └────────┬─────────────────────────────────────────────┘
             ↓
        ┌─────────────────────────────────┐
        │  TELA DO USUÁRIO:               │
        │                                 │
        │  Alerta - Maria Silva           │
        │  Febre acima de 38°C           │
        │  Por: João Silva  ← RESULTADO! │
        └─────────────────────────────────┘
```

---

## 🧬 Código Resumido: Arquitetura

| Camada | Arquivo | Responsabilidade |
|--------|---------|------------------|
| **Apresentação** | App.tsx:3590 | Renderizar `{alert.created_by_name}` |
| **Lógica de Recuperação** | App.tsx:3384 | Buscar `created_by_name` da view |
| **Lógica de Salvamento** | App.tsx:4558 | Salvar `created_by: userId` |
| **Banco de Dados** | tasks table | Coluna `created_by` com UUID |
| **View/Transformação** | SQL_CREATE_VIEWS_WITH_CREATOR_NAMES.sql | Converter UUID para Nome |
| **Dados de Referência** | users table | Mapear UUID → Nome |

---

## ✨ Analogia: Cartório

```
Você (João) vai a um cartório para registrar um documento.

┌─────────────────────────────────────────────────────┐
│  1. REGISTRO (O que fica no banco)                  │
│                                                     │
│  Documento: "Alerta de Febre"                       │
│  Criador: "550e8400-e29b-41d4-..." (seu RG/UUID)   │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│  2. CONSULTA (A view traduz)                        │
│                                                     │
│  "Qual é o nome de quem tem RG 550e8400...?"       │
│  Resposta: "João Silva"                             │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│  3. RESULTADO (O que o usuário vê)                  │
│                                                     │
│  Documento: "Alerta de Febre"                       │
│  Criado por: João Silva ← Nome, não RG!            │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 Conclusão

O fluxo é simples:

1. **Usuário cria** → Salvamos seu **UUID**
2. **View traduz** → UUID em **Nome** (via LEFT JOIN)
3. **App recupera** → Campo `created_by_name` (já pronto)
4. **Usuário vê** → "Por: João Silva"

Sem a view, teríamos que:
- Recuperar UUID
- Fazer outra query na tabela users
- Processar manualmente
- Exibir

Com a view, tudo é **automático e eficiente**! 🚀
