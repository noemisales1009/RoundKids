-- ========================================
-- FIX COMPLETO: Todas as Views do Histórico
-- Execute TODO este arquivo no Supabase SQL Editor
-- ========================================

-- 1️⃣ RECRIAR VIEW: diagnosticos_historico_com_usuario
DROP VIEW IF EXISTS public.diagnosticos_historico_com_usuario CASCADE;

CREATE VIEW public.diagnosticos_historico_com_usuario AS
SELECT
  dh.id,
  dh.patient_id,
  dh.pergunta_id,
  dh.opcao_id,
  dh.texto_digitado,
  dh.status,
  dh.arquivado,
  dh.archived_by,
  dh.archived_at,        -- ✅ INCLUIR archived_at
  dh.created_at,
  dh.created_by,
  -- Labels e nomes (CORRIGIDO: usa apenas 'name')
  COALESCE(po.label, 'Não informado') AS opcao_label,
  COALESCE(u.name, 'Sistema') AS created_by_name,
  COALESCE(archived_user.name, 'Desconhecido') AS archived_by_name
FROM
  public.paciente_diagnosticos dh
  LEFT JOIN public.users u ON dh.created_by = u.id
  LEFT JOIN public.users archived_user ON dh.archived_by = archived_user.id
  LEFT JOIN public.pergunta_opcoes_diagnostico po ON dh.opcao_id = po.id
ORDER BY
  dh.created_at DESC;

-- Permissões
GRANT SELECT ON public.diagnosticos_historico_com_usuario TO authenticated;
GRANT SELECT ON public.diagnosticos_historico_com_usuario TO anon;


-- 2️⃣ RECRIAR VIEW: alert_completions_with_user
DROP VIEW IF EXISTS public.alert_completions_with_user CASCADE;

CREATE VIEW public.alert_completions_with_user AS
SELECT 
  ac.id,
  ac.alert_id,
  t.patient_id,          -- ✅ INCLUIR patient_id via JOIN com tasks
  ac.source,
  ac.completed_at,
  ac.completed_by,
  COALESCE(u.name, 'Sistema') as completed_by_name,  -- CORRIGIDO: usa apenas 'name'
  ac.created_at
FROM public.alert_completions ac
LEFT JOIN public.tasks t ON ac.alert_id = t.id
LEFT JOIN public.users u ON ac.completed_by = u.id
ORDER BY ac.created_at DESC;

-- Permissões
GRANT SELECT ON public.alert_completions_with_user TO authenticated;
GRANT SELECT ON public.alert_completions_with_user TO anon;


-- 3️⃣ CRIAR ÍNDICES para Performance
CREATE INDEX IF NOT EXISTS idx_diagnosticos_patient_arquivado 
ON public.paciente_diagnosticos(patient_id, arquivado);

CREATE INDEX IF NOT EXISTS idx_diagnosticos_created_at 
ON public.paciente_diagnosticos(created_at DESC);


-- ✅ SUCESSO!
SELECT '✅ Todas as views foram recriadas com sucesso!' as resultado;
