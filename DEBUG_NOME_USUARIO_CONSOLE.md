# 🔍 Debug: Nome do Usuário Ainda Não Funciona

## 📍 Passo 1: Abrir Console do Navegador

1. **Abra a aplicação** na seu navegador
2. Pressione **F12** (ou Clique Direito → Inspecionar)
3. Vá para a aba **Console**
4. **Faça Login** com suas credenciais

---

## 🐛 Procure por estes logs

### Você deve ver:
```
🟢 [USERPROVIDER] Componente montado, chamando loadUser()
🔵 [LOGIN] Sucesso! Iniciando carregamento de usuário...
🔵 [LOGIN] Sessão: uuid-do-usuario seu@email.com
🔵 [LOGIN] Dados extraídos - ID: uuid Email: seu@email.com Name: Seu Nome
✅ [LOGIN] Usuário salvo/atualizado com sucesso!
🔵 [LOGIN] Chamando loadUser()...
✅ [LOGIN] loadUser() concluído!
🟡 [LOADUSER] Iniciando carregamento...
✅ [LOADUSER] Dados encontrados! Nome: Seu Nome
✅ [LOADUSER] Objeto do usuário criado: {id: '...', name: 'Seu Nome', ...}
```

---

## 🚨 Se Ver um Destes Erros

### ❌ Erro: "Usuário não existe no banco"
```
⚠️ [LOADUSER] Nenhum dado retornado (usuário não existe no banco)
```

**Causa:** O usuário não foi salvo na tabela `users`

**Solução:**
1. Verifique se há erro antes deste:
   ```
   ❌ [LOGIN] Erro ao salvar usuário: ...
   ```
2. Se sim, leia o erro e execute [DEBUG_RLS_POLICIES.sql](DEBUG_RLS_POLICIES.sql)

---

### ❌ Erro: "Erro ao salvar usuário"
```
❌ [LOGIN] Erro ao salvar usuário: 
{
  "code": "PGRST301",  ou outro código
  "message": "new row violates row-level security policy"
}
```

**Causa:** RLS está bloqueando a inserção

**Solução:**
1. Vá ao Supabase → SQL Editor
2. Execute [DEBUG_RLS_POLICIES.sql](DEBUG_RLS_POLICIES.sql)
3. Procure por: "SE AINDA NÃO FUNCIONAR: Desabilitar RLS..."
4. Copie e execute o comando `ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;`
5. Tente login novamente

---

### ❌ Erro: "Erro ao obter sessão"
```
🟡 [LOADUSER] Sessão: undefined undefined
❌ [LOADUSER] Erro ao obter sessão: ...
```

**Causa:** Problema com autenticação Supabase

**Solução:**
1. Verifique credenciais em `supabaseClient.ts`:
   ```
   VITE_SUPABASE_URL
   VITE_SUPABASE_ANON_KEY
   ```
2. Verifique em [supabaseClient.ts](supabaseClient.ts#L1-L10)

---

## 🔧 Checklist de Investigação

### 1️⃣ Verificar no Supabase

```sql
-- Execute no SQL Editor

-- Ver RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'users';

-- Ver políticas
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'users';

-- Ver dados
SELECT id, email, name, role FROM public.users;
```

### 2️⃣ Verificar variáveis de ambiente

Arquivo: `.env.local` (ou `.env`)

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

Se não tiver este arquivo:
1. Crie em: `c:\Users\noemi.sales\Documents\RoundiKids\RoundKids\.env.local`
2. Adicione suas credenciais
3. Reinicie a aplicação

### 3️⃣ Verificar dados no banco

```sql
-- Depois de fazer login, execute:
SELECT * FROM public.users WHERE email = 'seu@email.com';

-- Deve retornar uma linha com seus dados
```

---

## 📊 Cenários Possíveis

### Cenário 1: ✅ Tudo OK
```console
✅ [LOGIN] Usuário salvo/atualizado com sucesso!
✅ [LOADUSER] Dados encontrados! Nome: SEU_NOME
```
→ Seu nome deve aparecer na tela

### Cenário 2: ❌ RLS Bloqueando
```console
❌ [LOGIN] Erro ao salvar usuário: new row violates row-level security
```
→ Execute `DEBUG_RLS_POLICIES.sql` e desabilite RLS

### Cenário 3: ❌ Usuário não no banco
```console
✅ [LOGIN] Usuário salvo/atualizado com sucesso!
⚠️ [LOADUSER] Nenhum dado retornado (usuário não existe)
```
→ Problemas com permissões de leitura, também desabilite RLS

### Cenário 4: ❌ Sem sessão
```console
⚠️ [LOADUSER] Nenhuma sessão ativa
```
→ Sessão expirou ou não autenticou corretamente

---

## 🎯 Solução Rápida (Se Tudo Falhe)

1. **Vá ao Supabase Dashboard**
2. **SQL Editor** → **New Query**
3. **Cole isto:**
   ```sql
   ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
   ```
4. **Clique Run**
5. **Tente login novamente**

Se funcionar depois disso, o problema é RLS.

---

## 📋 Informações para Compartilhar Comigo

Se o problema continuar, compartilhe:

1. **Todos os logs do Console** (copie e cole)
2. **Resultado desta query:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'users';
   ```
3. **Resultado desta query:**
   ```sql
   SELECT * FROM public.users WHERE email = 'seu@email.com';
   ```
4. **Valor de RLS:**
   ```sql
   SELECT rowsecurity FROM pg_tables 
   WHERE tablename = 'users';
   ```

---

## 🔗 Próximos Passos

1. ✅ Abra o Console (F12)
2. ✅ Faça Login
3. ✅ Verifique os logs
4. ✅ Se tiver erro, execute o SQL apropriado
5. ✅ Tente novamente

Compartilhe os logs que achar!
