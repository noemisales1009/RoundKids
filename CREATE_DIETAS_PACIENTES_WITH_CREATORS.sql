-- ===============================================================================
-- SCRIPT: Criar/Recriar tabela dietas_pacientes com campos de rastreamento
-- ===============================================================================
-- Objetivo: Tabela para registrar dietas dos pacientes com:
--   1. Cálculo automático de VET AT e PT AT
--   2. Rastreamento de quem criou a dieta (criado_por_id)
--   3. Rastreamento de quem arquivou (arquivado_por_id)
--   4. Campos de observação e motivo de arquivamento
-- ===============================================================================

-- 1. PRIMEIRO: Apaga a tabela antiga para não dar erro (se existir)
DROP TABLE IF EXISTS public.dietas_pacientes CASCADE;

-- 2. SEGUNDO: Cria a tabela nova com a "Inteligência" de cálculo e rastreamento
CREATE TABLE public.dietas_pacientes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  paciente_id uuid NOT NULL,
  tipo character varying(50) NOT NULL,
  data_inicio date NOT NULL DEFAULT CURRENT_DATE,
  
  -- Valores realizados
  volume numeric(10, 2) NULL,
  vet numeric(10, 2) NULL,
  pt numeric(10, 2) NULL,
  th numeric(10, 2) NULL,
  
  -- Metas (Pleno)
  vet_pleno numeric(10, 2) NULL,
  pt_g_dia numeric(10, 2) NULL,

  -- CÁLCULO AUTOMÁTICO (AT - Atingido %)
  -- O banco vai dividir o REALIZADO pela META automaticamente
  vet_at numeric(10, 2) GENERATED ALWAYS AS (
    CASE 
      WHEN vet_pleno IS NOT NULL AND vet_pleno > 0 
      THEN (vet / vet_pleno) * 100 
      ELSE 0 
    END
  ) STORED,

  pt_at numeric(10, 2) GENERATED ALWAYS AS (
    CASE 
      WHEN pt_g_dia IS NOT NULL AND pt_g_dia > 0 
      THEN (pt / pt_g_dia) * 100 
      ELSE 0 
    END
  ) STORED,

  -- Campos de controle
  is_archived boolean NULL DEFAULT false,
  created_at timestamp with time zone NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone NULL DEFAULT CURRENT_TIMESTAMP,
  data_remocao timestamp with time zone NULL,
  observacao text NULL,
  motivo_arquivamento text NULL,
  
  -- 🟢 NOVO: Rastreamento de quem criou e quem arquivou
  criado_por_id uuid NULL,
  arquivado_por_id uuid NULL,

  -- Constraints
  CONSTRAINT dietas_pacientes_pkey PRIMARY KEY (id),
  CONSTRAINT dietas_pacientes_paciente_id_fkey FOREIGN KEY (paciente_id) REFERENCES public.patients (id) ON DELETE CASCADE,
  CONSTRAINT dietas_pacientes_criado_por_id_fkey FOREIGN KEY (criado_por_id) REFERENCES public.users (id) ON DELETE SET NULL,
  CONSTRAINT dietas_pacientes_arquivado_por_id_fkey FOREIGN KEY (arquivado_por_id) REFERENCES public.users (id) ON DELETE SET NULL
) TABLESPACE pg_default;

-- 3. TERCEIRO: Cria os índices para busca rápida
CREATE INDEX IF NOT EXISTS idx_dietas_pacientes_paciente_id 
  ON public.dietas_pacientes USING btree (paciente_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_dietas_pacientes_data 
  ON public.dietas_pacientes USING btree (data_inicio) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_dietas_pacientes_is_archived 
  ON public.dietas_pacientes USING btree (is_archived) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_dietas_pacientes_criado_por_id 
  ON public.dietas_pacientes USING btree (criado_por_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_dietas_pacientes_arquivado_por_id 
  ON public.dietas_pacientes USING btree (arquivado_por_id) TABLESPACE pg_default;

-- 4. COMENTÁRIOS para documentação
COMMENT ON TABLE public.dietas_pacientes 
  IS 'Registros de dietas dos pacientes com tipos (Oral, Enteral, Parenteral) e parâmetros nutricionais. Inclui rastreamento de quem criou e arquivou.';

COMMENT ON COLUMN public.dietas_pacientes.volume 
  IS 'Volume total (ml)';

COMMENT ON COLUMN public.dietas_pacientes.vet 
  IS 'Valor Energético Total [kcal/dia] - Valor realizado';

COMMENT ON COLUMN public.dietas_pacientes.vet_pleno 
  IS 'VET Pleno - Valor Energético Total alvo/meta [kcal/dia]';

COMMENT ON COLUMN public.dietas_pacientes.vet_at 
  IS 'VET AT - Percentual atingido (vet / vet_pleno * 100). Calculado automaticamente.';

COMMENT ON COLUMN public.dietas_pacientes.pt 
  IS 'Proteínas [g/dia] - Valor realizado';

COMMENT ON COLUMN public.dietas_pacientes.pt_g_dia 
  IS 'Proteína Total em gramas absolutas [g/dia] - Meta';

COMMENT ON COLUMN public.dietas_pacientes.pt_at 
  IS 'PT AT - Percentual atingido (pt / pt_g_dia * 100). Calculado automaticamente.';

COMMENT ON COLUMN public.dietas_pacientes.th 
  IS 'Taxa Hídrica [ml/m²/dia]';

COMMENT ON COLUMN public.dietas_pacientes.criado_por_id 
  IS 'UUID do usuário que criou a dieta. Salvo automaticamente ao cadastrar.';

COMMENT ON COLUMN public.dietas_pacientes.arquivado_por_id 
  IS 'UUID do usuário que arquivou a dieta. Salvo automaticamente ao arquivar.';

COMMENT ON COLUMN public.dietas_pacientes.motivo_arquivamento 
  IS 'Motivo pelo qual a dieta foi arquivada (retirada, mudança de tipo, etc.)';

-- 5. VERIFICAR: Confirmar que a tabela foi criada corretamente
SELECT column_name, data_type, is_nullable, column_default, generation_expression
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'dietas_pacientes'
ORDER BY ordinal_position;
