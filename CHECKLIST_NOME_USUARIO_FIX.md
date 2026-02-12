# ✅ Checklist: Correção do Nome do Usuário no Login

## 📋 Estrutura da Tabela (Confirmar)

A tabela `public.users` deve ter EXATAMENTE essas colunas:

```sql
create table public.users (
  id uuid not null,
  name text null,
  email text null,
  sector text null,
  role text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  foto text null,
  access_level text null,
  constraint users_pkey primary key (id),
  constraint users_email_key unique (email),
  constraint users_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE,
  constraint users_access_level_check check ((access_level = any (array['adm'::text, 'geral'::text])))
) TABLESPACE pg_default;
```

## 🔍 Verificações no Supabase SQL Editor

Execute CADA uma dessas queries para verificar:

### 1️⃣ Verificar se a tabela existe
```sql
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'users';
```
✅ **Esperado:** Uma linha com "users"

### 2️⃣ Verificar estrutura da tabela
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;
```
✅ **Esperado:** Todas essas colunas:
- id (uuid)
- name (text)
- email (text)
- sector (text)
- role (text)
- created_at (timestamp)
- updated_at (timestamp)
- foto (text)
- access_level (text)

### 3️⃣ Verificar RLS Status
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'users';
```
✅ **Esperado:** rowsecurity = true ou false (qualquer um funciona)

### 4️⃣ Se RLS estiver ativado, verificar políticas
```sql
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'users';
```

### 5️⃣ Verificar dados na tabela
```sql
SELECT id, email, name, role, access_level, foto, sector 
FROM public.users 
LIMIT 10;
```

---

## 🔧 Mapeamento Frontend ↔️ Banco de Dados

O código faz este mapeamento automaticamente:

| Frontend (`User` interface) | Banco (`users` table) | Frontend vê como |
|---------------------------|---------------------|------------------|
| `user.name` | `name` | Nome do usuário |
| `user.title` | `role` | Cargo/Profissão |
| `user.avatarUrl` | `foto` | Imagem do perfil |
| `user.sector` | `sector` | Setor/Unidade |
| `user.access_level` | `access_level` | Nível permissões |

---

## 🚀 Fluxo de Login Corrigido

### Antes ❌
```
1. Usuário faz login
2. Tenta carregar dados da tabela users
3. Não encontra (tabela vazia ou RLS bloqueando)
4. Mostra "Noemi" (valor padrão)
```

### Depois ✅
```
1. Usuário faz login
2. ✅ NOVO: Insere/atualiza usuário na tabela users automaticamente
3. Carrega dados do usuário da tabela
4. Mostra o nome correto do usuário
```

---

## 🐛 Se Ainda Não Funcionar

### Problema: RLS está bloqueando
**Solução:** Execute no SQL Editor:

```sql
-- Ver políticas atuais
SELECT * FROM pg_policies WHERE tablename = 'users';

-- Se houver problemas, remova todas:
DROP POLICY IF EXISTS "allow_upsert_on_signup" ON public.users;
DROP POLICY IF EXISTS "allow_update_own_row" ON public.users;
DROP POLICY IF EXISTS "allow_read_own_row" ON public.users;
DROP POLICY IF EXISTS "admin_read_all" ON public.users;

-- Disable RLS temporariamente para testes
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
```

### Problema: Erro de permissão ao inserir
**Solução:** Adicione esta política:

```sql
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Permite qualquer usuário autenticado inserir seus próprios dados
CREATE POLICY "allow_insert_on_auth" 
  ON public.users 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Permite qualquer usuário autenticado atualizar seus próprios dados
CREATE POLICY "allow_update_on_auth" 
  ON public.users 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Permite qualquer usuário autenticado ler seus próprios dados
CREATE POLICY "allow_select_on_auth" 
  ON public.users 
  FOR SELECT 
  USING (auth.uid() = id);
```

---

## ✅ Teste Final

Depois de todas as verificações:

1. **Faça logout** da aplicação (botão "Sair")
2. **Feche o navegador** completamente
3. **Abra novamente** e vá para a aplicação
4. **Faça login** com suas credenciais
5. **Verifique o nome** que aparece (seu nome real, não "Noemi")
6. **Aperte F5** e confirme que permanece o mesmo nome

---

## 📊 Exemplo de Dados Esperados

Depois que você fizer login, a tabela `users` deve ter:

```sql
SELECT * FROM public.users WHERE email = 'seu@email.com';
```

Resultado esperado:
```
id              | noemi-uuid-aqui-1234567890ab
name            | Noemi Sales (ou seu nome real)
email           | seu@email.com
sector          | (pode ser null)
role            | Médica
created_at      | 2026-02-12 10:30:00
updated_at      | 2026-02-12 10:30:00
foto            | (pode ser null)
access_level    | geral
```

---

## 💡 Próximos Passos

1. ✅ Confirmar que a tabela existe
2. ✅ Fazer login novamente
3. ✅ Verificar nome na tela
4. ✅ Confirmar que persiste após F5
5. 🔧 Se não funcionar, execute o SQL de troubleshooting acima

Se ainda tiver problemas, compartilhe os erros do **Console do Navegador** (F12 → Console).
