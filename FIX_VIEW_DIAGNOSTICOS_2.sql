-- ========================================
-- CORRIGIR VIEW DIAGNOSTICOS
-- ========================================

-- 1. Apagar a view antiga para resetar tudo
DROP VIEW IF EXISTS public.diagnosticos_historico_com_usuario CASCADE;

-- 2. Criar a nova view com os nomes de colunas corretos
CREATE VIEW public.diagnosticos_historico_com_usuario AS
SELECT
    d.id,
    d.patient_id,
    d.pergunta_id,
    d.opcao_id,
    d.texto_digitado,
    d.status,
    d.arquivado,
    d.motivo_arquivamento,
    -- Horário de São Paulo (Brasília)
    COALESCE(d.created_at, now()) AS created_at,
    (COALESCE(d.created_at, now()) AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo') AS data_criacao,
    (d.archived_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo') AS data_arquivamento,
    -- IDs de quem fez as ações
    d.created_by,
    d.archived_by,
    -- Nomes amigáveis vindo da tabela users
    COALESCE(u_criador.name, 'Sistema'::text) AS nome_criador,
    COALESCE(u_arquivador.name, '---'::text) AS nome_arquivador,
    -- BUSCA O TEXTO DA OPÇÃO: primeiro tenta na tabela de diagnóstico,
    -- se estiver vazio, busca na coluna 'label' da tabela de opções.
    COALESCE(d.opcao_label, po.label, 'Não informado'::text) AS opcao_label
FROM
    public.paciente_diagnosticos d
LEFT JOIN public.users u_criador ON d.created_by = u_criador.id
LEFT JOIN public.users u_arquivador ON d.archived_by = u_arquivador.id
LEFT JOIN public.pergunta_opcoes_diagnostico po ON d.opcao_id = po.id
ORDER BY d.created_at DESC;

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_diagnosticos_historico_patient_status 
ON public.paciente_diagnosticos(patient_id, status)
WHERE arquivado = false;

CREATE INDEX IF NOT EXISTS idx_diagnosticos_historico_archived 
ON public.paciente_diagnosticos(patient_id, arquivado);

CREATE INDEX IF NOT EXISTS idx_diagnosticos_patient_created_at
ON public.paciente_diagnosticos(patient_id, created_at DESC);

-- ========================================
-- TESTE
-- ========================================
-- Descomente para testar:
-- SELECT * FROM public.diagnosticos_historico_com_usuario LIMIT 5;
