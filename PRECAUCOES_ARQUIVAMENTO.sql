-- ============================================================
-- 1. ADICIONAR COLUNAS DE ARQUIVAMENTO NA TABELA PRECAUTIONS
-- ============================================================
ALTER TABLE public.precautions
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITHOUT TIME ZONE NULL,
  ADD COLUMN IF NOT EXISTS archived_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS motivo_arquivamento TEXT NULL;

-- ============================================================
-- 2. RECRIAR VIEW INCLUINDO NOVOS CAMPOS
-- ============================================================
CREATE OR REPLACE VIEW public.precautions_com_calculo AS
SELECT
  p.*,
  d.nome               AS doenca_nome,
  d.duracao_observacao AS doenca_duracao_observacao,
  d.duracao_dias,
  CASE
    WHEN p.data_fim_sugerida IS NOT NULL
      THEN p.data_fim_sugerida
    WHEN d.duracao_dias IS NOT NULL
      THEN (p.data_inicio::date + (d.duracao_dias || ' days')::interval)::date
    ELSE NULL
  END AS data_fim_calculada
FROM public.precautions p
LEFT JOIN public.doencas_precaucao d ON p.doenca_id = d.id;
