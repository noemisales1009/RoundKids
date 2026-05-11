CREATE TABLE IF NOT EXISTS public.evolucao_diaria_registros (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id TEXT NOT NULL,
  data_evolucao DATE NOT NULL,
  exame_fisico_monitorizacao  TEXT,
  exame_fisico_ectoscopia     TEXT,
  exame_fisico_pele_faneros   TEXT,
  exame_fisico_respiratorio   TEXT,
  exame_fisico_cardiovascular TEXT,
  exame_fisico_digestivo      TEXT,
  exame_fisico_urinario       TEXT,
  exame_fisico_neurologico    TEXT,
  condutas_criticas           TEXT,
  created_by UUID NOT NULL DEFAULT auth.uid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_evolucao_diaria_patient
  ON public.evolucao_diaria_registros (patient_id);

CREATE INDEX IF NOT EXISTS idx_evolucao_diaria_data
  ON public.evolucao_diaria_registros (data_evolucao);

ALTER TABLE public.evolucao_diaria_registros ENABLE ROW LEVEL SECURITY;

-- Leitura para todos os usuários autenticados
DROP POLICY IF EXISTS evolucao_diaria_select ON public.evolucao_diaria_registros;
CREATE POLICY evolucao_diaria_select
ON public.evolucao_diaria_registros
FOR SELECT
TO authenticated
USING (true);

-- Inserção: qualquer usuário autenticado pode inserir
DROP POLICY IF EXISTS evolucao_diaria_insert ON public.evolucao_diaria_registros;
CREATE POLICY evolucao_diaria_insert
ON public.evolucao_diaria_registros
FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid() OR public.is_admin_user());

-- Exclusão: somente criador ou admin
DROP POLICY IF EXISTS evolucao_diaria_delete ON public.evolucao_diaria_registros;
CREATE POLICY evolucao_diaria_delete
ON public.evolucao_diaria_registros
FOR DELETE
TO authenticated
USING (created_by = auth.uid() OR public.is_admin_user());

GRANT SELECT, INSERT, DELETE
ON public.evolucao_diaria_registros
TO authenticated;
