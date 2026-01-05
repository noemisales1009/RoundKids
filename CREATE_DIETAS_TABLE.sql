-- Criar tabela de Dietas dos Pacientes
CREATE TABLE IF NOT EXISTS public.dietas_pacientes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    paciente_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    
    tipo VARCHAR(50) NOT NULL, -- 'Oral', 'Enteral', 'Parenteral'
    data DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Parâmetros nutricionais com unidades específicas:
    volume NUMERIC(10,2), -- Volume total [ml]
    vet NUMERIC(10,2),    -- Valor Energético Total [kcal/dia]
    pt NUMERIC(10,2),     -- Proteínas [g/dia]
    th NUMERIC(10,2),     -- Taxa Hídrica [ml/m²/dia]
    
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_dietas_pacientes_paciente_id ON public.dietas_pacientes(paciente_id);
CREATE INDEX IF NOT EXISTS idx_dietas_pacientes_data ON public.dietas_pacientes(data);
CREATE INDEX IF NOT EXISTS idx_dietas_pacientes_is_archived ON public.dietas_pacientes(is_archived);

-- Criar política RLS (Row Level Security)
ALTER TABLE public.dietas_pacientes ENABLE ROW LEVEL SECURITY;

-- Política para leitura: usuários autenticados podem ver dietas
CREATE POLICY "Usuários autenticados podem ver dietas" 
ON public.dietas_pacientes
FOR SELECT
USING (auth.role() = 'authenticated');

-- Política para inserção: usuários autenticados podem criar
CREATE POLICY "Usuários autenticados podem criar dietas" 
ON public.dietas_pacientes
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Política para atualização: usuários autenticados podem atualizar
CREATE POLICY "Usuários autenticados podem atualizar dietas" 
ON public.dietas_pacientes
FOR UPDATE
USING (auth.role() = 'authenticated');

-- Política para exclusão: usuários autenticados podem deletar
CREATE POLICY "Usuários autenticados podem deletar dietas" 
ON public.dietas_pacientes
FOR DELETE
USING (auth.role() = 'authenticated');

-- Adicionar comentários nas colunas para documentação
COMMENT ON COLUMN public.dietas_pacientes.volume IS 'Volume total [ml]';
COMMENT ON COLUMN public.dietas_pacientes.vet IS 'Valor Energético Total [kcal/dia]';
COMMENT ON COLUMN public.dietas_pacientes.pt IS 'Proteínas [g/dia]';
COMMENT ON COLUMN public.dietas_pacientes.th IS 'Taxa Hídrica [ml/m²/dia]';
COMMENT ON TABLE public.dietas_pacientes IS 'Registros de dietas dos pacientes com tipos (Oral, Enteral, Parenteral) e parâmetros nutricionais';
