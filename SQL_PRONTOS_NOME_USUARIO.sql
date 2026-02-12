-- =====================================================
-- SQL PRONTO PARA COPIAR E COLAR NO SUPABASE
-- (Caso o nome do usuário ainda não apareça)
-- =====================================================

-- 🔍 PASSO 1: VERIFICAR SE A TABELA EXISTE
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'users';

-- 🔍 PASSO 2: VERIFICAR COLUNAS
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

-- 🔍 PASSO 3: VERIFICAR RLS STATUS
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'users';

-- 🔍 PASSO 4: VER DADOS EXISTENTES
SELECT id, email, name, role, access_level FROM public.users LIMIT 20;

-- =====================================================
-- SE RLS ESTIVER BLOQUEANDO, EXECUTE ISTO:
-- =====================================================

-- Desabilitar RLS temporariamente para debug
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Depois de testes, reabilitar:
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- ADICIONAR POLÍTICAS CORRETAS DE RLS:
-- =====================================================

-- 1. Remover todas as políticas antigas (se existirem)
DROP POLICY IF EXISTS "allow_upsert_on_signup" ON public.users;
DROP POLICY IF EXISTS "allow_update_own_row" ON public.users;
DROP POLICY IF EXISTS "allow_read_own_row" ON public.users;
DROP POLICY IF EXISTS "admin_read_all" ON public.users;
DROP POLICY IF EXISTS "allow_insert_on_auth" ON public.users;
DROP POLICY IF EXISTS "allow_update_on_auth" ON public.users;
DROP POLICY IF EXISTS "allow_select_on_auth" ON public.users;

-- 2. Garantir que RLS está ativado
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas simples e funcionais
-- Permitir INSERT durante login
CREATE POLICY "allow_insert_own_user"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Permitir UPDATE de seus próprios dados
CREATE POLICY "allow_update_own_user"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- Permitir SELECT de seus próprios dados
CREATE POLICY "allow_select_own_user"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Permitir que ADMINs leiam tudo (opcional)
-- CREATE POLICY "allow_select_all_if_admin"
--   ON public.users
--   FOR SELECT
--   USING (
--     auth.uid() IN (
--       SELECT id FROM public.users WHERE access_level = 'adm'
--     )
--   );

-- =====================================================
-- TESTE MANUAL (substitua com email real):
-- =====================================================

-- Simular o que o app faz ao fazer login
-- Nota: Você precisa usar seu UUID real do auth.users

-- INSERT INTO public.users (id, email, name, role, access_level)
-- VALUES (
--   'SEU-UUID-AQUI',
--   'seu@email.com',
--   'Seu Nome Real',
--   'Médica',
--   'geral'
-- )
-- ON CONFLICT (id) DO UPDATE SET
--   email = EXCLUDED.email,
--   name = EXCLUDED.name,
--   role = EXCLUDED.role,
--   access_level = EXCLUDED.access_level;

-- =====================================================
-- LIMPAR DADOS (APENAS SE NECESSÁRIO):
-- =====================================================

-- Deletar um usuário específico
-- DELETE FROM public.users WHERE email = 'seu@email.com';

-- Deletar todos os usuários (use com cuidado!)
-- DELETE FROM public.users;

-- =====================================================
-- VERIFICAR depois de fazer login:
-- =====================================================

-- Depois de fazer login, execute isto para verificar
-- se o usuário foi criado/atualizado:
SELECT 
  id, 
  email, 
  name, 
  role, 
  sector, 
  foto,
  access_level,
  created_at,
  updated_at
FROM public.users
WHERE email = 'seu@email.com';

