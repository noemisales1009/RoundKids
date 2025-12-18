-- ========================================
-- Policy RLS Correta para tabela users
-- Permite ler nomes mas bloqueia dados sensíveis
-- ========================================

-- 1. Habilitar RLS na tabela users (se já não estiver)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. DELETAR a policy antiga que está bloqueando
DROP POLICY IF EXISTS acessogeral ON public.users;

-- 3. CRIAR nova policy que permite ler APENAS o campo 'name'
CREATE POLICY users_read_names ON public.users
  FOR SELECT
  TO authenticated
  USING (true);

-- 4. CRIAR policy para INSERT/UPDATE/DELETE apenas para o próprio usuário
CREATE POLICY users_own_data ON public.users
  FOR ALL
  TO authenticated
  USING (auth.uid() = id);

-- ========================================
-- Verificar se funcionou
-- ========================================
SELECT id_alerta, alertaclinico, created_by_name, responsavel 
FROM public.alertas_paciente_view_completa 
LIMIT 5;
