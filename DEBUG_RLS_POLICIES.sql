-- =====================================================
-- DEBUG: Verificar Block Level Security (RLS)
-- =====================================================

-- 1️⃣ Ver se RLS está ATIVADO
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'users';

-- Resultado esperado:
-- tablename | rowsecurity
-- users     | true (ou false - qualquer um funciona)

-- =====================================================
-- 2️⃣ Ver TODAS as POLÍTICAS da tabela users
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- =====================================================
-- 3️⃣ SE houver muitas políticas antigas, DELETAR TODAS:
-- =====================================================

-- ❌ DELETAR TODAS (use com cuidado)
DROP POLICY IF EXISTS "allow_upsert_on_signup" ON public.users;
DROP POLICY IF EXISTS "allow_update_own_row" ON public.users;
DROP POLICY IF EXISTS "allow_read_own_row" ON public.users;
DROP POLICY IF EXISTS "admin_read_all" ON public.users;
DROP POLICY IF EXISTS "allow_insert_on_auth" ON public.users;
DROP POLICY IF EXISTS "allow_update_on_auth" ON public.users;
DROP POLICY IF EXISTS "allow_select_on_auth" ON public.users;
DROP POLICY IF EXISTS "allow_insert_own_user" ON public.users;
DROP POLICY IF EXISTS "allow_update_own_user" ON public.users;
DROP POLICY IF EXISTS "allow_select_own_user" ON public.users;

-- =====================================================
-- 4️⃣ SOLUÇÃO: Criar NOVAS políticas SIMPLES
-- =====================================================

-- Primeiro, garantir que RLS está ativado
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Política 1: Permitir INSERT com verificação
CREATE POLICY "users_insert_own"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Política 2: Permitir SELECT de dados próprios
CREATE POLICY "users_select_own"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Política 3: Permitir UPDATE de dados próprios
CREATE POLICY "users_update_own"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- =====================================================
-- 5️⃣ VERIFICAR se funcionou
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'users';

-- =====================================================
-- 6️⃣ TESTAR INSERÇÃO (RUN como usuário autenticado)
-- Nota: Você precisa estar autenticado para isso funcionar

-- Ver dados
SELECT id, email, name, role FROM public.users;

-- =====================================================
-- 7️⃣ SE AINDA NÃO FUNCIONAR: Desabilitar RLS temporariamente
-- (apenas para testes/debug)

-- ⚠️ ATENÇÃO: Isto remove segurança!
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Depois de testes, reabilitar:
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

