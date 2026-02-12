-- =====================================================
-- VERIFICAÇÃO E AJUSTES PARA A TABELA users
-- =====================================================

-- 1️⃣ VERIFICAR RLS (Row Level Security)
--    Se estiver ativado, pode estar bloqueando as operações

-- Ver se RLS está ativado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'users';

-- 2️⃣ SE RLS ESTIVER ATIVADO, VERIFIQUE AS POLÍTICAS
SELECT * FROM pg_policies WHERE tablename = 'users';

-- 3️⃣ PARA O APP FUNCIONAR CORRETAMENTE, VOCÊ TEM DUAS OPÇÕES:

-- ❌ OPÇÃO 1: Desabilitar RLS (mais simples, menos seguro)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- ✅ OPÇÃO 2: Manter RLS mas com políticas permissivas (recomendado)
-- Execute as políticas abaixo se RLS estiver ativado:

-- Habilitar RLS se não estiver
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Permitir que usuários façam upsert de seus próprios dados durante login
CREATE POLICY "allow_upsert_on_signup" 
  ON public.users 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "allow_update_own_row" 
  ON public.users 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "allow_read_own_row" 
  ON public.users 
  FOR SELECT 
  USING (auth.uid() = id);

-- Permitir que admin leia tudo
CREATE POLICY "admin_read_all" 
  ON public.users 
  FOR SELECT 
  USING (
    (SELECT access_level FROM public.users WHERE id = auth.uid()) = 'adm'
  );

-- 4️⃣ VERIFICAR DADOS NA TABELA
SELECT id, email, name, role, access_level FROM public.users LIMIT 10;

-- 5️⃣ TESTAR INSERÇÃO (substitua os valores)
-- INSERT INTO public.users (id, email, name, role, access_level)
-- VALUES ('uuid-aqui', 'email@example.com', 'Noemi Sales', 'Médica', 'adm')
-- ON CONFLICT (id) DO UPDATE SET
--   email = EXCLUDED.email,
--   name = EXCLUDED.name,
--   role = EXCLUDED.role,
--   access_level = EXCLUDED.access_level;

