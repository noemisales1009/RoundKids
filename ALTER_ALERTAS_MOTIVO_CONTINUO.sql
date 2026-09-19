-- Motivo padronizado da justificativa e alerta "contínuo" (não trava a criação de novos alertas).
ALTER TABLE public.alertas_paciente
  ADD COLUMN IF NOT EXISTS justificativa_motivo text,
  ADD COLUMN IF NOT EXISTS continuo boolean NOT NULL DEFAULT false;

ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS justificativa_motivo text,
  ADD COLUMN IF NOT EXISTS continuo boolean NOT NULL DEFAULT false;
