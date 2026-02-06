-- ========================================
-- FIX: Recriar view monitoramento_geral_justificativas
-- com patient_id para filtrar por paciente
-- ========================================

-- 1. Limpa a versão anterior
DROP VIEW IF EXISTS public.monitoramento_geral_justificativas;

-- 2. Cria a nova versão com patient_id
CREATE VIEW public.monitoramento_geral_justificativas AS

-- Parte 1: Alertas
SELECT 
    'Alerta'::text AS tipo_origem,
    a.id,
    a.patient_id,  -- ✅ ADICIONADO
    p.name AS paciente,
    a.alerta_descricao AS descricao,
    a.responsavel,
    a.justificativa,
    (a.justificativa_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo') AS data_justificativa,
    (a.hora_criacao AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo') AS data_criacao,
    COALESCE(u.name, 'Não informado'::text) AS quem_justificou_nome,
    COALESCE(criador.name, 'Sistema'::text) AS criado_por_nome,
    -- REGRA DE STATUS:
    CASE 
        WHEN a.justificativa IS NOT NULL AND a.justificativa <> '' 
        THEN 'pendente_com_justificativa'::text 
        ELSE COALESCE(a.status_conclusao, 'sem_status')
    END AS status_atual
FROM 
    public.alertas_paciente a
    LEFT JOIN public.patients p ON a.patient_id = p.id
    LEFT JOIN public.users u ON a.justificativa_by = u.id
    LEFT JOIN public.users criador ON a.created_by = criador.id
WHERE 
    a.justificativa IS NOT NULL 
    AND a.justificativa <> ''

UNION ALL

-- Parte 2: Tarefas (Tasks)
SELECT 
    'Tarefa'::text AS tipo_origem,
    t.id,
    t.patient_id,  -- ✅ ADICIONADO
    t.patient_name AS paciente,
    t.description AS descricao,
    t.responsible AS responsavel,
    t.justification AS justificativa,
    (t.justification_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo') AS data_justificativa,
    (t.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo') AS data_criacao,
    COALESCE(u2.name, 'Não informado'::text) AS quem_justificou_nome,
    COALESCE(criador2.name, 'Sistema'::text) AS criado_por_nome,
    -- REGRA DE STATUS:
    CASE 
        WHEN t.justification IS NOT NULL AND t.justification <> '' 
        THEN 'pendente_com_justificativa'::text 
        ELSE COALESCE(t.status, 'sem_status')
    END AS status_atual
FROM 
    public.tasks t
    LEFT JOIN public.users u2 ON t.justification_by = u2.id
    LEFT JOIN public.users criador2 ON t.created_by = criador2.id
WHERE 
    t.justification IS NOT NULL 
    AND t.justification <> ''
ORDER BY data_justificativa DESC NULLS LAST;

-- Permissões
GRANT SELECT ON public.monitoramento_geral_justificativas TO authenticated;
GRANT SELECT ON public.monitoramento_geral_justificativas TO anon;

-- ✅ SUCESSO!
SELECT '✅ View monitoramento_geral_justificativas recriada com patient_id!' as resultado;
