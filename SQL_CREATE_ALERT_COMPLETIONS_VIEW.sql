-- View para alert_completions com nome de quem concluiu
-- IMPORTANTE: Faz JOIN com tasks para obter patient_id
-- Execute este SQL completo no Supabase SQL Editor

-- 1. Remove a view antiga se existir
DROP VIEW IF EXISTS public.alert_completions_with_user CASCADE;

-- 2. Cria a view nova com patient_id
CREATE VIEW public.alert_completions_with_user AS
SELECT 
  ac.id,
  ac.alert_id,
  t.patient_id,  -- Obtém patient_id através da tabela tasks
  ac.source,
  ac.completed_at,
  ac.completed_by,
  COALESCE(u.name, 'Sistema') as completed_by_name,
  ac.created_at
FROM public.alert_completions ac
LEFT JOIN public.tasks t ON ac.alert_id = t.id
LEFT JOIN public.users u ON ac.completed_by = u.id
ORDER BY ac.created_at DESC;

-- 3. Configura permissões
GRANT SELECT ON public.alert_completions_with_user TO authenticated;
GRANT SELECT ON public.alert_completions_with_user TO anon;

-- 4. Ativa segurança
ALTER VIEW public.alert_completions_with_user SET (security_barrier = on);
