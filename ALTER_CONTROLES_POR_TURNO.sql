-- Controles e Saídas por turno (manha / tarde / noite).
-- Registros que já existem viram "manha", então nada do que está cadastrado muda.

ALTER TABLE public.patient_controles_saidas
  ADD COLUMN IF NOT EXISTS turno text NOT NULL DEFAULT 'manha';

ALTER TABLE public.patient_controles_saidas
  DROP CONSTRAINT IF EXISTS patient_controles_saidas_turno_check;
ALTER TABLE public.patient_controles_saidas
  ADD CONSTRAINT patient_controles_saidas_turno_check CHECK (turno IN ('manha', 'tarde', 'noite'));

-- Antes: um registro por paciente por dia. Agora: um por paciente, dia e turno.
ALTER TABLE public.patient_controles_saidas
  DROP CONSTRAINT IF EXISTS patient_controles_saidas_unique;
ALTER TABLE public.patient_controles_saidas
  ADD CONSTRAINT patient_controles_saidas_unique UNIQUE (patient_id, data, turno);
