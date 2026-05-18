ALTER TABLE public.medicacoes_pacientes
  ADD COLUMN IF NOT EXISTS categoria text null;
