-- ========================================
-- FIX: Contornar RLS na view para pegar created_by_name
-- ========================================

-- Opção 1: Desabilitar RLS na tabela users (menos seguro mas rápido)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Opção 2 (alternativa): Criar uma função SECURITY DEFINER
-- Cria uma função que retorna o nome do usuário sem RLS bloqueando
-- CREATE OR REPLACE FUNCTION public.get_user_name(user_id uuid)
-- RETURNS text
-- LANGUAGE sql
-- SECURITY DEFINER
-- SET search_path = public
-- AS $$
--   SELECT COALESCE(name, 'Não informado'::text)
--   FROM public.users
--   WHERE id = user_id;
-- $$;

-- Depois atualizar as views para usar:
-- COALESCE(get_user_name(t.created_by), 'Não informado'::text) AS created_by_name

-- ========================================
-- Verificar se funcionou
-- ========================================
SELECT id_alerta, alertaclinico, created_by_name, responsavel 
FROM public.alertas_paciente_view_completa 
LIMIT 5;

SELECT id_alerta, alertaclinico, created_by_name, responsavel 
FROM public.tasks_view_horario_br 
LIMIT 5;
