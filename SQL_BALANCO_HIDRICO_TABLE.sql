-- Tabela para armazenar registros de balanço hídrico dos pacientes
-- Execute este SQL no Supabase SQL Editor

CREATE TABLE IF NOT EXISTS balanco_hidrico (
    id BIGSERIAL PRIMARY KEY,
    patient_id TEXT NOT NULL,
    volume DECIMAL(10, 2) NOT NULL,  -- Volume do balanço em mL
    peso DECIMAL(10, 2) NOT NULL,     -- Peso do paciente em kg
    resultado DECIMAL(10, 2) NOT NULL, -- Resultado em percentagem
    data_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key para a tabela patients (se existir)
    CONSTRAINT fk_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- Índice para melhorar performance nas consultas por paciente
CREATE INDEX IF NOT EXISTS idx_balanco_hidrico_patient_id ON balanco_hidrico(patient_id);

-- Índice para consultas por data
CREATE INDEX IF NOT EXISTS idx_balanco_hidrico_data_registro ON balanco_hidrico(data_registro DESC);

-- Row Level Security (RLS) - opcional mas recomendado
ALTER TABLE balanco_hidrico ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura para usuários autenticados
CREATE POLICY "Usuários autenticados podem ver balanço hídrico"
    ON balanco_hidrico FOR SELECT
    USING (auth.role() = 'authenticated');

-- Política para permitir inserção para usuários autenticados
CREATE POLICY "Usuários autenticados podem inserir balanço hídrico"
    ON balanco_hidrico FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Política para permitir atualização para usuários autenticados
CREATE POLICY "Usuários autenticados podem atualizar balanço hídrico"
    ON balanco_hidrico FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Política para permitir deleção para usuários autenticados
CREATE POLICY "Usuários autenticados podem deletar balanço hídrico"
    ON balanco_hidrico FOR DELETE
    USING (auth.role() = 'authenticated');

-- Comentários para documentação
COMMENT ON TABLE balanco_hidrico IS 'Registros de balanço hídrico dos pacientes';
COMMENT ON COLUMN balanco_hidrico.volume IS 'Volume do balanço em mL (pode ser positivo ou negativo)';
COMMENT ON COLUMN balanco_hidrico.peso IS 'Peso do paciente em kg';
COMMENT ON COLUMN balanco_hidrico.resultado IS 'Resultado em percentagem: (volume / (peso * 10)) * 100';
COMMENT ON COLUMN balanco_hidrico.data_registro IS 'Data e hora do registro do balanço';
