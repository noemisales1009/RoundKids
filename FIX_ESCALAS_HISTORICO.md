# 🔧 FIX: Escalas Não Aparecem no Histórico

## 🔍 Diagnóstico

As escalas não estão aparecendo no histórico porque:

### Opção 1: RLS (Row Level Security) está bloqueando os dados
As políticas RLS em `scale_scores` verificam `patients.user_id = auth.uid()`, mas:
- A coluna `user_id` pode não existir em `patients`
- A coluna pode estar `NULL` para todos os registros
- Isso causa 403 Forbidden silencioso (dados vazios em vez de erro)

### Opção 2: Sem dados na tabela
- Nenhuma escala foi registrada ainda

### Opção 3: Problema de permissões Supabase
- Usuário não tem acesso de leitura à tabela

## ✅ Solução (3 passos)

### Passo 1: Verificar se há dados
No Supabase Dashboard:
1. Vá em **SQL Editor**
2. Execute:
```sql
SELECT COUNT(*) as total_escalas, 
       COUNT(DISTINCT patient_id) as pacientes_com_escalas
FROM public.scale_scores;
```

**Resultado esperado:** Se for 0, não há dados registrados. Se for > 0, o RLS está bloqueando.

### Passo 2: Corrigir RLS (IMPORTANTE!)
Se tem dados mas não aparecem, execute no SQL Editor:

```sql
-- Desabilitar RLS temporariamente para debug
ALTER TABLE public.scale_scores DISABLE ROW LEVEL SECURITY;

-- Se quiser manter RLS mas permitir acesso:
-- DROP POLICY IF EXISTS "Users can view scale_scores from their patients" ON public.scale_scores;
-- CREATE POLICY "Authenticated access to scale_scores" 
--   ON public.scale_scores 
--   FOR ALL 
--   USING (auth.role() = 'authenticated')
--   WITH CHECK (auth.role() = 'authenticated');
```

### Passo 3: Testar no App
1. Atualize o navegador (F5)
2. Abra DevTools (F12) → Console
3. Procure por:
   - `🔥 scalesRes.error:` (deve ser `null`)
   - `🔥 scalesRes.data length:` (deve ser > 0 se tem dados)
   - `📊 Paciente ... tem X escalas:` (confirma dados carregados)

## 🧪 Test Data (Para testar)

Se não tiver dados de escala para testar:

```sql
-- Inserir uma escala de teste
INSERT INTO public.scale_scores (patient_id, scale_name, score, interpretation, date)
SELECT 
  id as patient_id,
  'Glasgow' as scale_name,
  15 as score,
  'Acordado e orientado' as interpretation,
  NOW() as date
FROM public.patients
LIMIT 1;
```

## 📋 Checklist

- [ ] Verificou se há dados em `scale_scores`
- [ ] Se não há dados: registre uma escala no app (Calculador → Escala → Salvar)
- [ ] Se tem dados mas não aparecem: corrigiu o RLS
- [ ] Atualizou o navegador após corrigir RLS
- [ ] Vê mensagens de debug no Console mostrando dados

## 🐛 Debug: Entender o fluxo

```
1. App.tsx fetchPatients() (linha 3200)
   ↓
2. Query: supabase.from('scale_scores').select('*')
   ↓
3. scalesRes.data retorna dados ou array vazio
   ↓
4. scalesMap mapeia dados por patient_id (linha 3088)
   ↓
5. mappedPatients.scaleScores recebe array
   ↓
6. PatientHistoryScreen itera scaleScores (linha 1005)
   ↓
7. Renderiza [ESCALA] eventos
```

**Se quebra em #2:** Problema com query ou RLS (vê console `🔥 scalesRes.error:`)
**Se quebra em #3:** RLS bloqueou (array vazio, sem erro)
**Se quebra em #5:** Dados não mapeados (vê `📊 scalesMap:` vazio)
**Se quebra em #6:** paciente.scaleScores é undefined (dados não carregados)

## 📞 Próximos passos

1. **Execute a query de verificação** acima
2. **Se tem dados:** Execute o FIX RLS
3. **Se não tem dados:** Vá para Escalas do paciente e registre uma
4. **Se ainda não funciona:** Cole a saída do console aqui

## 🔐 Segurança (Pós-Fix)

Depois de resolver, recomendo:
1. Revisar RLS policies em `scale_scores`
2. Garantir que `patients.user_id` está preenchido corretamente
3. Implementar RLS baseado em `user_id` de verdade (não `null`)

---

**Arquivo de referência:** `FIX_SCALE_SCORES_RLS.sql`
