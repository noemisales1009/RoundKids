-- SCRIPT DE ALTERAÇÃO DA TABELA dietas_pacientes
-- Adiciona campos de data_inicio, data_remocao e observacao

-- 1. Renomear a coluna 'data' para 'data_inicio'
ALTER TABLE public.dietas_pacientes 
RENAME COLUMN data TO data_inicio;

-- 2. Adicionar as novas colunas
ALTER TABLE public.dietas_pacientes
ADD COLUMN IF NOT EXISTS data_remocao TIMESTAMP WITH TIME ZONE NULL, -- Data de fim/retirada da dieta
ADD COLUMN IF NOT EXISTS observacao TEXT NULL; -- Campo de observações livres

-- 3. Adicionar comentários nas novas colunas
COMMENT ON COLUMN public.dietas_pacientes.data_inicio IS 'Data de início da dieta [YYYY-MM-DD HH:MM:SS]';
COMMENT ON COLUMN public.dietas_pacientes.data_remocao IS 'Data de fim/retirada da dieta [YYYY-MM-DD HH:MM:SS]';
COMMENT ON COLUMN public.dietas_pacientes.observacao IS 'Observações adicionais sobre a dieta';
