-- =============================================
-- SITUAÇÃO CLÍNICA 24H
-- Regras:
-- 1) Visível no card por 24h (via visible_until)
-- 2) Depois de 24h aparece somente no histórico (query da aplicação)
-- 3) Criador pode editar/apagar; admin pode tudo
-- =============================================

CREATE TABLE IF NOT EXISTS public.clinical_situations_24h (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  situacao_texto text NOT NULL,
  created_by uuid NOT NULL DEFAULT auth.uid(),
  updated_by uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  visible_until timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  CONSTRAINT clinical_situations_24h_pkey PRIMARY KEY (id),
  CONSTRAINT clinical_situations_24h_patient_fkey FOREIGN KEY (patient_id)
    REFERENCES public.patients(id) ON DELETE CASCADE,
  CONSTRAINT clinical_situations_24h_text_check CHECK (length(trim(situacao_texto)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_clinical_situations_24h_patient
  ON public.clinical_situations_24h (patient_id);

CREATE INDEX IF NOT EXISTS idx_clinical_situations_24h_visible_until
  ON public.clinical_situations_24h (visible_until);

CREATE INDEX IF NOT EXISTS idx_clinical_situations_24h_created_by
  ON public.clinical_situations_24h (created_by);

-- Trigger padrão do projeto para updated_at
DROP TRIGGER IF EXISTS update_clinical_situations_24h_updated_at ON public.clinical_situations_24h;
CREATE TRIGGER update_clinical_situations_24h_updated_at
BEFORE UPDATE ON public.clinical_situations_24h
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.clinical_situations_24h ENABLE ROW LEVEL SECURITY;

-- Função auxiliar para identificar admin na tabela public.users
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

-- Leitura para usuários autenticados (app decide o que é card 24h x histórico)
DROP POLICY IF EXISTS clinical_situations_select_authenticated ON public.clinical_situations_24h;
CREATE POLICY clinical_situations_select_authenticated
ON public.clinical_situations_24h
FOR SELECT
TO authenticated
USING (true);

-- Inserção: criador é o próprio usuário (ou admin)
DROP POLICY IF EXISTS clinical_situations_insert_owner_or_admin ON public.clinical_situations_24h;
CREATE POLICY clinical_situations_insert_owner_or_admin
ON public.clinical_situations_24h
FOR INSERT
TO authenticated
WITH CHECK (
  created_by = auth.uid()
  OR public.is_admin_user()
);

-- Edição: somente criador ou admin
DROP POLICY IF EXISTS clinical_situations_update_owner_or_admin ON public.clinical_situations_24h;
CREATE POLICY clinical_situations_update_owner_or_admin
ON public.clinical_situations_24h
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

-- Exclusão: somente criador ou admin
DROP POLICY IF EXISTS clinical_situations_delete_owner_or_admin ON public.clinical_situations_24h;
CREATE POLICY clinical_situations_delete_owner_or_admin
ON public.clinical_situations_24h
FOR DELETE
TO authenticated
USING (
  created_by = auth.uid()
  OR public.is_admin_user()
);

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.clinical_situations_24h
TO authenticated;

COMMENT ON TABLE public.clinical_situations_24h IS
'Situação clínica com validade de 24h no card principal; após isso permanece para histórico.';

COMMENT ON COLUMN public.clinical_situations_24h.visible_until IS
'Controla a janela de 24h para exibição no card principal.';
