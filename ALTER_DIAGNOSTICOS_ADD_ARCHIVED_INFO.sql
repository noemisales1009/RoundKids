-- Adicionar campos para rastrear quem e quando ocultou um diagnóstico
-- Estes campos são usados para mostrar no histórico "Ocultado por [nome]"

ALTER TABLE public.paciente_diagnosticos 
ADD COLUMN IF NOT EXISTS archived_by UUID DEFAULT NULL,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_paciente_diagnosticos_archived_info 
ON public.paciente_diagnosticos(patient_id, arquivado, archived_by);

-- Comentário para documentação
COMMENT ON COLUMN public.paciente_diagnosticos.archived_by IS 'UUID do usuário que ocultou o diagnóstico';
COMMENT ON COLUMN public.paciente_diagnosticos.archived_at IS 'Data/hora quando o diagnóstico foi ocultado';
