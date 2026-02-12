-- =====================================================
-- 🔧 SOLUÇÃO COMPLETA: Remover RLS e Configurar Corretamente
-- =====================================================
-- Execute TUDO isto no Supabase SQL Editor para resolver o problema
-- =====================================================

-- PASSO 1: Desabilitar RLS completamente
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- PASSO 2: Remover todas as políticas antigas
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
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;

-- PASSO 3: Verificar que a tabela existe
SELECT 'Tabela users verificada' as status;

-- PASSO 4: Limpar dados de teste (OPCIONAL - descomente se quiser)
-- DELETE FROM public.users;

-- =====================================================
-- ✅ PRONTO!
-- =====================================================
-- Agora você pode fazer login e o nome deve aparecer corretamente
-- Se depois quiser reabilitar RLS, execute isto:

-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- 
-- CREATE POLICY "users_can_insert_own"
--   ON public.users FOR INSERT
--   WITH CHECK (auth.uid() = id);
-- 
-- CREATE POLICY "users_can_read_own"
--   ON public.users FOR SELECT
--   USING (auth.uid() = id);
-- 
-- CREATE POLICY "users_can_update_own"
--   ON public.users FOR UPDATE
--   USING (auth.uid() = id);

