-- ========================================
-- SISTEMA DE ARQUIVAMENTO DE ALERTAS E TAREFAS
-- Execute TODO este arquivo no Supabase SQL Editor
-- ========================================

-- 1️⃣ Adicionando campos de arquivamento na tabela de Alertas
ALTER TABLE public.alertas_paciente 
ADD COLUMN IF NOT EXISTS archived_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS archived_by uuid REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS motivo_arquivamento text;

-- 2️⃣ Adicionando campos de arquivamento na tabela de Tasks
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS archived_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS archived_by uuid REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS motivo_arquivamento text;

-- 3️⃣ Criar view para monitorar arquivamentos
DROP VIEW IF EXISTS public.monitoramento_arquivamento_geral;

CREATE OR REPLACE VIEW public.monitoramento_arquivamento_geral AS

-- PARTE 1: ALERTAS ARQUIVADOS
SELECT 
    'Alerta'::text AS tipo_origem,
    a.id AS registro_id,
    a.patient_id,
    p.name AS paciente_nome,
    a.alerta_descricao AS descricao_original,
    a.motivo_arquivamento AS motivo_do_arquivamento,
    (a.archived_at AT TIME ZONE 'America/Sao_Paulo') AS data_arquivamento,
    a.archived_by AS quem_arquivou_id,
    COALESCE(u.name, 'Sistema') AS quem_arquivou,
    a.status_conclusao AS status_anterior
FROM 
    public.alertas_paciente a
    LEFT JOIN public.patients p ON a.patient_id = p.id
    LEFT JOIN public.users u ON a.archived_by = u.id
WHERE 
    a.archived_at IS NOT NULL

UNION ALL

-- PARTE 2: TAREFAS ARQUIVADAS
SELECT 
    'Tarefa'::text AS tipo_origem,
    t.id AS registro_id,
    t.patient_id,
    t.patient_name AS paciente_nome,
    t.description AS descricao_original,
    t.motivo_arquivamento AS motivo_do_arquivamento,
    (t.archived_at AT TIME ZONE 'America/Sao_Paulo') AS data_arquivamento,
    t.archived_by AS quem_arquivou_id,
    COALESCE(u2.name, 'Sistema') AS quem_arquivou,
    t.status AS status_anterior
FROM 
    public.tasks t
    LEFT JOIN public.users u2 ON t.archived_by = u2.id
WHERE 
    t.archived_at IS NOT NULL
ORDER BY data_arquivamento DESC;

-- Permissões
GRANT SELECT ON public.monitoramento_arquivamento_geral TO authenticated;
GRANT SELECT ON public.monitoramento_arquivamento_geral TO anon;

-- ✅ SUCESSO!
SELECT '✅ Sistema de arquivamento criado com sucesso!' as resultado;
