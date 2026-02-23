-- =============================================
-- APORTES (VO + H. VENOSA/NPT + MEDICAÇÕES)
-- Cálculo do THT é feito no banco (coluna gerada)
-- =============================================

CREATE TABLE IF NOT EXISTS public.aportes_pacientes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  paciente_id uuid NOT NULL,
  data_referencia date NOT NULL DEFAULT current_date,
  vo_ml_kg_h numeric(10, 3) NOT NULL DEFAULT 0,
  hv_npt_ml_kg_h numeric(10, 3) NOT NULL DEFAULT 0,
  medicacoes_ml_kg_h numeric(10, 3) NOT NULL DEFAULT 0,
  tht_ml_kg_h numeric(10, 3) GENERATED ALWAYS AS (
    COALESCE(vo_ml_kg_h, 0) + COALESCE(hv_npt_ml_kg_h, 0) + COALESCE(medicacoes_ml_kg_h, 0)
  ) STORED,
  created_by uuid NOT NULL DEFAULT auth.uid(),
  updated_by uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT aportes_pacientes_pkey PRIMARY KEY (id),
  CONSTRAINT aportes_pacientes_patient_fkey FOREIGN KEY (paciente_id)
    REFERENCES public.patients(id) ON DELETE CASCADE,
  CONSTRAINT aportes_pacientes_unique_day UNIQUE (paciente_id, data_referencia),
  CONSTRAINT aportes_vo_non_negative CHECK (vo_ml_kg_h >= 0),
  CONSTRAINT aportes_hv_non_negative CHECK (hv_npt_ml_kg_h >= 0),
  CONSTRAINT aportes_med_non_negative CHECK (medicacoes_ml_kg_h >= 0)
);

CREATE INDEX IF NOT EXISTS idx_aportes_paciente_data
  ON public.aportes_pacientes (paciente_id, data_referencia DESC);

CREATE INDEX IF NOT EXISTS idx_aportes_created_by
  ON public.aportes_pacientes (created_by);

DROP TRIGGER IF EXISTS update_aportes_pacientes_updated_at ON public.aportes_pacientes;
CREATE TRIGGER update_aportes_pacientes_updated_at
BEFORE UPDATE ON public.aportes_pacientes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.aportes_pacientes ENABLE ROW LEVEL SECURITY;

-- Função auxiliar para admin (caso ainda não exista)
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = auth.uid()
      AND u.access_level = 'adm'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin_user() TO authenticated;

DROP POLICY IF EXISTS aportes_select_authenticated ON public.aportes_pacientes;
CREATE POLICY aportes_select_authenticated
ON public.aportes_pacientes
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS aportes_insert_owner_or_admin ON public.aportes_pacientes;
CREATE POLICY aportes_insert_owner_or_admin
ON public.aportes_pacientes
FOR INSERT
TO authenticated
WITH CHECK (
  created_by = auth.uid()
  OR public.is_admin_user()
);

DROP POLICY IF EXISTS aportes_update_owner_or_admin ON public.aportes_pacientes;
CREATE POLICY aportes_update_owner_or_admin
ON public.aportes_pacientes
FOR UPDATE
TO authenticated
USING (
  created_by = auth.uid()
  OR public.is_admin_user()
)
WITH CHECK (
  created_by = auth.uid()
  OR public.is_admin_user()
);

DROP POLICY IF EXISTS aportes_delete_owner_or_admin ON public.aportes_pacientes;
CREATE POLICY aportes_delete_owner_or_admin
ON public.aportes_pacientes
FOR DELETE
TO authenticated
USING (
  created_by = auth.uid()
  OR public.is_admin_user()
);

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.aportes_pacientes
TO authenticated;

COMMENT ON TABLE public.aportes_pacientes IS
'APORTES por paciente e por dia. THT (VO + HV/NPT + MED) calculado no banco.';

COMMENT ON COLUMN public.aportes_pacientes.tht_ml_kg_h IS
'THT calculado automaticamente pelo banco (VO + HV/NPT + MED), em ml/kg/h.';
