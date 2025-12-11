-- Create balanco_hidrico table
CREATE TABLE IF NOT EXISTS balanco_hidrico (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    peso DECIMAL(10, 2) NOT NULL,
    volume DECIMAL(10, 2) NOT NULL,
    resultado DECIMAL(10, 2) GENERATED ALWAYS AS (volume / (peso * 10.0)) STORED,
    data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create balanco_hidrico_historico table for timeline
CREATE TABLE IF NOT EXISTS balanco_hidrico_historico (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    peso DECIMAL(10, 2) NOT NULL,
    volume DECIMAL(10, 2) NOT NULL,
    resultado DECIMAL(10, 2) NOT NULL,
    data_calculo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indices for performance
CREATE INDEX IF NOT EXISTS idx_balanco_hidrico_patient_id ON balanco_hidrico(patient_id);
CREATE INDEX IF NOT EXISTS idx_balanco_hidrico_data_registro ON balanco_hidrico(data_registro DESC);
CREATE INDEX IF NOT EXISTS idx_balanco_hidrico_historico_patient_id ON balanco_hidrico_historico(patient_id);
CREATE INDEX IF NOT EXISTS idx_balanco_hidrico_historico_data_calculo ON balanco_hidrico_historico(data_calculo DESC);
