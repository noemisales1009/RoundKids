# 🛠️ Guia de Verificação: Nome do Criador em Diagnósticos e Alertas

## 🎯 Objetivo
Garantir que o nome de quem criou diagnósticos e alertas apareça corretamente como "Por: [Nome]"

---

## ✅ PASSO 1: Verificar se o Campo `created_by_name` Vem da View

### 1.1 No Supabase Console
1. Abra seu projeto no [Supabase](https://supabase.com)
2. Vá em **SQL Editor**
3. Execute estas queries:

```sql
-- Verificar Tasks
SELECT 
  id,
  patient_id,
  alertaclinico,
  created_by,
  created_by_name
FROM tasks_view_horario_br
LIMIT 5;
```

**Resultado esperado:**
```
id | patient_id | alertaclinico | created_by | created_by_name
---|----------|------------|------|----------------
1  | uuid-xxx | Febre...   | uuid | João Silva
2  | uuid-xxx | Tosse...   | uuid | Maria Santos
...
```

```sql
-- Verificar Alertas
SELECT 
  id,
  patient_id,
  alertaclinico,
  created_by,
  created_by_name
FROM alertas_paciente_view_completa
LIMIT 5;
```

**Resultado esperado:**
```
id | patient_id | alertaclinico | created_by | created_by_name
---|----------|------------|------|----------------
1  | uuid-xxx | Febre...   | uuid | João Silva
2  | uuid-xxx | Tosse...   | uuid | Maria Santos
...
```

---

## ✅ PASSO 2: Verificar se a Tabela `users` Existe

### 2.1 Confirmar que a tabela existe
```sql
SELECT 
  id,
  name,
  email
FROM public.users
LIMIT 5;
```

**Se aparecer "relation "public.users" does not exist":**

Você precisa criar a tabela. Execute:
```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Dar permissões
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT
  USING (auth.uid() = id);
```

### 2.2 Se a tabela existe, verificar se tem dados
```sql
SELECT COUNT(*) as total_usuarios FROM public.users;
```

Se retornar 0, nenhum usuário está salvo.

---

## ✅ PASSO 3: Recriar as Views com o Nome do Criador

### 3.1 Abra o arquivo SQL
Abra o arquivo: `SQL_CREATE_VIEWS_WITH_CREATOR_NAMES.sql`

### 3.2 Copie TODO o conteúdo

### 3.3 Cole no Supabase SQL Editor

### 3.4 Execute (Ctrl+Enter ou clique "Run")

### 3.5 Verifique se não há erros

---

## ✅ PASSO 4: Verificar a View Específica para Diagnósticos

### 4.1 Execute no Supabase:
```sql
SELECT 
  id,
  patient_id,
  opcao_label,
  status,
  created_by,
  created_by_name
FROM diagnosticos_historico_com_usuario
LIMIT 5;
```

**Resultado esperado:**
```
id | patient_id | opcao_label | status | created_by | created_by_name
---|----------|---------|-------|------|----------------
1  | uuid-xxx | Febre   | resolvido | uuid | João Silva
2  | uuid-xxx | Tosse   | nao_resolvido | uuid | Maria
...
```

---

## 🔧 PASSO 5: Forçar Refresh das Views (se usar MATERIALIZED VIEW)

Se as views forem materializadas:

```sql
-- Atualizar views materializadas
REFRESH MATERIALIZED VIEW CONCURRENTLY tasks_view_horario_br;
REFRESH MATERIALIZED VIEW CONCURRENTLY alertas_paciente_view_completa;
REFRESH MATERIALIZED VIEW CONCURRENTLY diagnosticos_historico_com_usuario;
```

---

## 🧪 PASSO 6: Testar no Aplicativo

### 6.1 Fazer login como um usuário
1. Abra o app
2. Faça login
3. Verifique qual é seu ID (abra DevTools → Console)
   ```javascript
   // Cole no console
   const { data } = await supabase.auth.getSession();
   console.log(data.session.user.id);
   ```

### 6.2 Criar um diagnóstico teste
1. Vá para um paciente
2. Na seção de diagnósticos, marque alguma opção
3. Clique em "Salvar Diagnósticos"

### 6.3 Criar um alerta teste
1. Na seção "Checklist", clique em "GERAR ALERTA / INTERVENÇÃO"
2. Preencha os dados
3. Clique em "Criar Alerta"

### 6.4 Verificar no Histórico
1. Abra o histórico do paciente
2. Procure a entrada mais recente
3. Verifique se aparece "Por: [Seu Nome]"

### 6.5 Verificar em Alertas
1. Vá para a seção de alertas
2. Procure o alerta criado
3. Verifique se aparece "Por: [Seu Nome]"

---

## 🐛 Se Não Funcionou: Debugging

### Problema 1: Aparece "Por: Não informado"

**Causa:** O `created_by_name` está `null`

**Solução:**
1. Verifique se a tabela `users` existe e tem dados:
   ```sql
   SELECT id, name FROM public.users;
   ```

2. Se estiver vazia, você precisa popular a tabela. No seu código, quando o usuário faz login, adicione:
   ```tsx
   // Após login bem-sucedido
   const { data: { session } } = await supabase.auth.getSession();
   
   await supabase.from('users').upsert({
     id: session.user.id,
     name: session.user.user_metadata?.name || session.user.email,
     email: session.user.email
   }, { onConflict: 'id' });
   ```

### Problema 2: A View Retorna NULL para `created_by_name`

**Causa:** A view está desatualizada ou o JOINnão está funcionando

**Solução:**
1. Recriar a view executando: `SQL_CREATE_VIEWS_WITH_CREATOR_NAMES.sql`
2. Verificar se o JOIN está correto:
   ```sql
   -- Teste o JOIN
   SELECT 
     t.id,
     t.created_by,
     u.id as user_id,
     u.name
   FROM tasks t
   LEFT JOIN public.users u ON t.created_by = u.id
   LIMIT 5;
   ```

### Problema 3: DevTools mostra erro na View

**Solução:**
1. Abra o console do navegador (F12)
2. Procure por erros vermelhos
3. Tente recarregar a página (Ctrl+Shift+R)
4. Se persistir, limpe o cache do navegador

---

## 📋 Checklist de Verificação Final

- [ ] Tabela `users` existe em `public.users`
- [ ] Tabela `users` tem dados (nomes dos usuários)
- [ ] View `tasks_view_horario_br` retorna `created_by_name`
- [ ] View `alertas_paciente_view_completa` retorna `created_by_name`
- [ ] View `diagnosticos_historico_com_usuario` retorna `created_by_name`
- [ ] App.tsx recupera o campo `created_by_name` nas queries
- [ ] App.tsx exibe o `created_by_name` na tela
- [ ] Criar um teste: alerta ou diagnóstico mostra "Por: [Seu Nome]"

---

## 📞 Se Ainda Não Funcionar

1. **Verifique o console (F12)** para mensagens de erro
2. **Verifique o Supabase Logs** em Project Settings → Logs
3. **Teste manualmente** as queries SQL listadas neste documento
4. **Recrie as views** do zero usando `SQL_CREATE_VIEWS_WITH_CREATOR_NAMES.sql`

---

## 🎉 Se Funcionou!

Ótimo! Agora você tem:
- ✅ Diagnósticos exibindo "Por: [Nome do Criador]"
- ✅ Alertas exibindo "Por: [Nome do Criador]"
- ✅ Sistema de auditoria funcionando
