-- Recriar a view adicionando a coluna "sistema"
DROP VIEW IF EXISTS public.diagnosticos_historico_com_usuario CASCADE;

CREATE VIEW public.diagnosticos_historico_com_usuario AS
SELECT
    d.id,
    d.patient_id,
    d.pergunta_id,
    d.opcao_id,
    d.texto_digitado,
    d.sistema,
    d.status,
    d.arquivado,
    d.motivo_arquivamento,
    COALESCE(d.created_at, now()) AS created_at,
    (COALESCE(d.created_at, now()) AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo') AS data_criacao,
    (d.archived_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo') AS data_arquivamento,
    d.created_by,
    d.archived_by,
    COALESCE(u_criador.name, 'Sistema'::text) AS nome_criador,
    COALESCE(u_arquivador.name, '---'::text) AS nome_arquivador,
    COALESCE(d.opcao_label, po.label, 'Não informado'::text) AS opcao_label
FROM
    public.paciente_diagnosticos d
LEFT JOIN public.users u_criador ON d.created_by = u_criador.id
LEFT JOIN public.users u_arquivador ON d.archived_by = u_arquivador.id
LEFT JOIN public.pergunta_opcoes_diagnostico po ON d.opcao_id = po.id
ORDER BY d.created_at DESC;

GRANT SELECT ON public.diagnosticos_historico_com_usuario TO authenticated;
GRANT SELECT ON public.diagnosticos_historico_com_usuario TO anon;
