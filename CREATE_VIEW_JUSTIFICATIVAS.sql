-- ========================================
-- VIEW: Monitoramento Geral de Justificativas
-- Mostra todos os alertas/tarefas que têm justificativas
-- ========================================

-- 1. Limpa a versão anterior
DROP VIEW IF EXISTS public.monitoramento_geral_justificativas;

-- 2. Cria a nova versão com informações completas
CREATE VIEW public.monitoramento_geral_justificativas AS

-- Parte 1: Alertas de alertas_paciente
SELECT 
    'Alerta'::text AS tipo_origem,
    a.id,
    a.patient_id,
    p.name AS paciente_nome,
    a.alerta_descricao AS descricao,
    a.responsavel,
    a.prazo_limite,
    a.justificativa,
    (a.justificativa_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo') AS data_justificativa,
    (a.hora_criacao AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo') AS data_criacao,
    
    -- Nome de quem criou o alerta
    COALESCE(criador.name, 'Sistema'::text) AS criado_por_nome,
    
    -- Nome de quem justificou
    COALESCE(justificador.name, 'Não informado'::text) AS quem_justificou_nome,
    
    -- Status atual
    CASE 
        WHEN a.justificativa IS NOT NULL AND a.justificativa <> '' 
        THEN 'pendente_com_justificativa'::text 
        ELSE COALESCE(a.status_conclusao, 'sem_status')
    END AS status_atual,
    
    -- Fonte
    'alertas_paciente'::text AS tabela_origem
FROM 
    public.alertas_paciente a
    LEFT JOIN public.patients p ON a.patient_id = p.id
    LEFT JOIN public.users criador ON a.created_by = criador.id
    LEFT JOIN public.users justificador ON a.justificativa_by = justificador.id
WHERE 
    a.justificativa IS NOT NULL 
    AND a.justificativa <> ''

UNION ALL

-- Parte 2: Tarefas (Tasks)
SELECT 
    'Tarefa'::text AS tipo_origem,
    t.id,
    t.patient_id,
    t.patient_name AS paciente_nome,
    t.description AS descricao,
    t.responsible AS responsavel,
    t.deadline AS prazo_limite,
    t.justification AS justificativa,
    (t.justification_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo') AS data_justificativa,
    (t.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo') AS data_criacao,
    
    -- Nome de quem criou a tarefa
    COALESCE(criador2.name, 'Sistema'::text) AS criado_por_nome,
    
    -- Nome de quem justificou
    COALESCE(justificador2.name, 'Não informado'::text) AS quem_justificou_nome,
    
    -- Status atual
    CASE 
        WHEN t.justification IS NOT NULL AND t.justification <> '' 
        THEN 'pendente_com_justificativa'::text 
        ELSE COALESCE(t.status, 'sem_status')
    END AS status_atual,
    
    -- Fonte
    'tasks'::text AS tabela_origem
FROM 
    public.tasks t
    LEFT JOIN public.users criador2 ON t.created_by = criador2.id
    LEFT JOIN public.users justificador2 ON t.justification_by = justificador2.id
WHERE 
    t.justification IS NOT NULL 
    AND t.justification <> ''

ORDER BY data_justificativa DESC NULLS LAST;

-- Permissões
GRANT SELECT ON public.monitoramento_geral_justificativas TO authenticated;
GRANT SELECT ON public.monitoramento_geral_justificativas TO anon;

-- ✅ SUCESSO!
SELECT '✅ View monitoramento_geral_justificativas criada com sucesso!' as resultado;
