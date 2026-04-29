-- Adicionar campo para rastrear quando um diagnóstico foi marcado como resolvido

ALTER TABLE public.paciente_diagnosticos
ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Índice para performance em consultas de diagnósticos resolvidos
CREATE INDEX IF NOT EXISTS idx_paciente_diagnosticos_resolved_at
ON public.paciente_diagnosticos(patient_id, resolved_at)
WHERE resolved_at IS NOT NULL;

COMMENT ON COLUMN public.paciente_diagnosticos.resolved_at IS 'Data/hora quando o diagnóstico foi marcado como resolvido';
