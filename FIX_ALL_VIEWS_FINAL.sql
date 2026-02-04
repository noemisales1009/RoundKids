-- ========================================
-- FIX COMPLETO: Todas as Views do Histórico
-- Execute TODO este arquivo no Supabase SQL Editor
-- ========================================

-- 1️⃣ RECRIAR VIEW: diagnosticos_historico_com_usuario
DROP VIEW IF EXISTS public.diagnosticos_historico_com_usuario;

CREATE VIEW public.diagnosticos_historico_com_usuario AS
SELECT
  dh.id,
  dh.patient_id,
  dh.pergunta_id,
  dh.opcao_id,
  dh.texto_digitado,
  dh.status,
  dh.arquivado,
  
  -- Ajuste do horário de criação para São Paulo
  (dh.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo') AS created_at,
  
  dh.created_by,
  
  -- Usa o label da tabela ou 'Não informado'
  COALESCE(dh.opcao_label, 'Não informado'::text) AS opcao_label,
  
  -- Busca o nome real de quem criou na tabela public.users
  COALESCE(u.name, 'Sistema'::text) AS created_by_name
FROM
  public.diagnosticos_historico dh
  -- Liga o criador (UUID) ao ID da tabela de usuários
  LEFT JOIN public.users u ON dh.created_by = u.id
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
  ac.source,
  ac.completed_at,
  ac.completed_by,
  ac.created_at,
  -- Nome de quem completou
  COALESCE(u.name, 'Sistema') as completed_by_name,
  -- Patient ID: busca de tasks OU alertas_paciente dependendo da source
  CASE 
    WHEN ac.source = 'tasks' THEN t.patient_id
    WHEN ac.source = 'alertas_paciente' THEN ap.patient_id
    ELSE NULL
  END as patient_id
FROM public.alert_completions ac
LEFT JOIN public.users u ON ac.completed_by = u.id
LEFT JOIN public.tasks t ON (ac.alert_id = t.id AND ac.source = 'tasks')
LEFT JOIN public.alertas_paciente ap ON (ac.alert_id = ap.id AND ac.source = 'alertas_paciente')
ORDER BY ac.created_at DESC;

-- Permissões
GRANT SELECT ON public.alert_completions_with_user TO authenticated;
GRANT SELECT ON public.alert_completions_with_user TO anon;


-- 3️⃣ CRIAR ÍNDICES para Performance
CREATE INDEX IF NOT EXISTS idx_diagnosticos_patient_arquivado 
ON public.paciente_diagnosticos(patient_id, arquivado);

CREATE INDEX IF NOT EXISTS idx_diagnosticos_created_at 
ON public.paciente_diagnosticos(created_at DESC);


-- 4️⃣ CRIAR VIEW: monitoramento_geral_justificativas
DROP VIEW IF EXISTS public.monitoramento_geral_justificativas;

CREATE VIEW public.monitoramento_geral_justificativas AS

-- Parte 1: Busca justificativas nos Alertas
SELECT 
    'Alerta'::text AS tipo_origem,
    a.id,
    a.patient_id,
    p.name AS paciente_nome,
    a.alerta_descricao AS descricao,
    a.justificativa,
    (a.justificativa_at AT TIME ZONE 'America/Sao_Paulo') AS data_justificativa,
    COALESCE(u.name, 'Não informado'::text) AS quem_justificou_nome,
    a.status_conclusao AS status_atual
FROM 
    public.alertas_paciente a
    LEFT JOIN public.patients p ON a.patient_id = p.id
    LEFT JOIN public.users u ON a.justificativa_by = u.id
WHERE 
    a.justificativa IS NOT NULL

UNION ALL

-- Parte 2: Busca justificativas nas Tasks
SELECT 
    'Tarefa'::text AS tipo_origem,
    t.id,
    t.patient_id,
    t.patient_name AS paciente_nome,
    t.description AS descricao,
    t.justification AS justificativa,
    (t.justification_at AT TIME ZONE 'America/Sao_Paulo') AS data_justificativa,
    COALESCE(u2.name, 'Não informado'::text) AS quem_justificou_nome,
    t.status AS status_atual
FROM 
    public.tasks t
    LEFT JOIN public.users u2 ON t.justification_by = u2.id
WHERE 
    t.justification IS NOT NULL;

-- Permissões
GRANT SELECT ON public.monitoramento_geral_justificativas TO authenticated;
GRANT SELECT ON public.monitoramento_geral_justificativas TO anon;


-- ✅ SUCESSO!
SELECT '✅ Todas as views foram recriadas com sucesso!' as resultado;
