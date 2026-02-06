-- ========================================
-- SISTEMA DE ARQUIVAMENTO DE DISPOSITIVOS
-- Execute TODO este arquivo no Supabase SQL Editor
-- ========================================

-- 1️⃣ Verificar se as colunas já existem (se não, adicionar)
ALTER TABLE public.dispositivos_pacientes 
ADD COLUMN IF NOT EXISTS motivo_arquivamento text,
ADD COLUMN IF NOT EXISTS criado_por_id uuid REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS arquivado_por_id uuid REFERENCES public.users(id);

-- 2️⃣ Criar/Recriar a VIEW detalhada
DROP VIEW IF EXISTS public.vw_dispositivos_detalhado CASCADE;

CREATE OR REPLACE VIEW public.vw_dispositivos_detalhado AS
SELECT 
    d.id,
    d.created_at,
    d.tipo_dispositivo,
    d.localizacao,
    d.data_insercao,
    d.data_remocao,
    d.is_archived,
    d.motivo_arquivamento,
    d.observacao,
    d.paciente_id,
    d.criado_por_id,
    d.arquivado_por_id,
    -- Nomes traduzidos dos IDs (com fuso horário de São Paulo)
    COALESCE(u_criador.name, 'Sistema') AS nome_criador,
    COALESCE(u_arquivador.name, 'Sistema') AS nome_arquivador,
    (d.created_at AT TIME ZONE 'America/Sao_Paulo') AS created_at_br,
    CASE 
        WHEN d.data_remocao IS NOT NULL THEN (d.data_remocao AT TIME ZONE 'America/Sao_Paulo')
        ELSE NULL
    END AS data_remocao_br
FROM 
    public.dispositivos_pacientes d
LEFT JOIN public.users u_criador ON d.criado_por_id = u_criador.id
LEFT JOIN public.users u_arquivador ON d.arquivado_por_id = u_arquivador.id;

-- Permissões
GRANT SELECT ON public.vw_dispositivos_detalhado TO authenticated;
GRANT SELECT ON public.vw_dispositivos_detalhado TO anon;

-- 3️⃣ Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_dispositivos_paciente_archived 
ON public.dispositivos_pacientes(paciente_id, is_archived);

CREATE INDEX IF NOT EXISTS idx_dispositivos_created_at 
ON public.dispositivos_pacientes(created_at DESC);

-- ✅ SUCESSO!
SELECT '✅ View vw_dispositivos_detalhado criada com sucesso!' as resultado;
