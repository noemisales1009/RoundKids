-- Adicionar coluna motivo_arquivamento na tabela patients
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS motivo_arquivamento text null;

-- Comentário para documentar
COMMENT ON COLUMN public.patients.motivo_arquivamento IS 'Motivo pelo qual o paciente foi arquivado (Alta, Óbito, Transferência, etc)';
