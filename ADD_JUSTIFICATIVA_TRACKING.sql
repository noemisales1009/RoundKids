-- ========================================
-- ADICIONAR CAMPOS PARA RASTREAMENTO DE JUSTIFICATIVAS
-- Execute no Supabase SQL Editor
-- ========================================

-- 1️⃣ ADICIONAR CAMPOS NA TABELA alertas_paciente
ALTER TABLE public.alertas_paciente 
ADD COLUMN IF NOT EXISTS justificativa_by UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS justificativa_at TIMESTAMPTZ;

-- 2️⃣ ADICIONAR CAMPOS NA TABELA tasks
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS justification_by UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS justification_at TIMESTAMPTZ;

-- 3️⃣ CRIAR VIEW DE MONITORAMENTO GERAL DE JUSTIFICATIVAS
DROP VIEW IF EXISTS public.monitoramento_geral_justificativas CASCADE;

CREATE VIEW public.monitoramento_geral_justificativas AS
-- 1. Busca justificativas nos Alertas
SELECT 
    'Alerta' AS tipo_origem,
    a.id,
    p.name AS paciente,
    a.alertaclinico AS descricao,
    a.justificativa,
    -- Horário de São Paulo
    (a.justificativa_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo') AS data_justificativa,
    -- Nome de quem justificou
    COALESCE(u.name, 'Não informado') AS quem_justificou_nome,
    u.email AS quem_justificou_email,
    a.status AS status_atual,
    a.created_at,
    p.bed_number AS leito
FROM public.alertas_paciente a
LEFT JOIN public.patients p ON a.patient_id = p.id
LEFT JOIN public.users u ON a.justificativa_by = u.id
WHERE a.justificativa IS NOT NULL

UNION ALL

-- 2. Busca justificativas nas Tasks
SELECT 
    'Tarefa' AS tipo_origem,
    t.id,
    p.name AS paciente,
    t.description AS descricao,
    t.justification AS justificativa,
    -- Horário de São Paulo
    (t.justification_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo') AS data_justificativa,
    -- Nome de quem justificou
    COALESCE(u2.name, 'Não informado') AS quem_justificou_nome,
    u2.email AS quem_justificou_email,
    t.status AS status_atual,
    t.created_at,
    p.bed_number AS leito
FROM public.tasks t
LEFT JOIN public.patients p ON t.patient_id = p.id
LEFT JOIN public.users u2 ON t.justification_by = u2.id
WHERE t.justification IS NOT NULL
ORDER BY data_justificativa DESC;

-- Permissões
GRANT SELECT ON public.monitoramento_geral_justificativas TO authenticated;
GRANT SELECT ON public.monitoramento_geral_justificativas TO anon;

-- 4️⃣ CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_alertas_justificativa_by 
ON public.alertas_paciente(justificativa_by);

CREATE INDEX IF NOT EXISTS idx_tasks_justification_by 
ON public.tasks(justification_by);

CREATE INDEX IF NOT EXISTS idx_alertas_justificativa_at 
ON public.alertas_paciente(justificativa_at DESC);

CREATE INDEX IF NOT EXISTS idx_tasks_justification_at 
ON public.tasks(justification_at DESC);

-- ✅ SUCESSO!
SELECT '✅ Campos de rastreamento de justificativas adicionados com sucesso!' as resultado;
