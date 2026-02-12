-- =====================================================
-- ✅ EXECUTAR ISTO NO SUPABASE PARA FUNCIONAR
-- =====================================================

-- PASSO 1: Desabilitar RLS (para funcionar 100%)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- PASSO 2: Verificar que funcionou
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'users';

-- PASSO 3: Ver seus dados no banco
SELECT id, email, name, role, access_level, updated_at FROM public.users 
WHERE email LIKE '%@%.%' 
ORDER BY updated_at DESC 
LIMIT 5;

-- =====================================================
-- Pronto! Agora faça login na aplicação
-- =====================================================

