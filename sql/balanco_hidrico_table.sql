-- Create balanco_hidrico table (com BIGINT como no schema fornecido)
CREATE TABLE IF NOT EXISTS balanco_hidrico (
    id BIGSERIAL PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    peso DECIMAL(10, 2) NOT NULL CHECK (peso > 0),
    volume DECIMAL(10, 2) NOT NULL,
    resultado DECIMAL(10, 4) GENERATED ALWAYS AS (
        CASE
            WHEN (peso > 0) THEN (volume / (peso * 10.0))
            ELSE 0
        END
    ) STORED,
    data_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create balanco_hidrico_historico table for timeline
CREATE TABLE IF NOT EXISTS balanco_hidrico_historico (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    peso DECIMAL(10, 2) NOT NULL,
    volume DECIMAL(10, 2) NOT NULL,
    resultado DECIMAL(10, 4) NOT NULL,
    data_calculo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indices for performance
CREATE INDEX IF NOT EXISTS idx_balanco_hidrico_patient_id ON balanco_hidrico(patient_id);
CREATE INDEX IF NOT EXISTS idx_balanco_hidrico_data_registro ON balanco_hidrico(data_registro DESC);
CREATE INDEX IF NOT EXISTS idx_balanco_hidrico_historico_patient_id ON balanco_hidrico_historico(patient_id);
CREATE INDEX IF NOT EXISTS idx_balanco_hidrico_historico_data_calculo ON balanco_hidrico_historico(data_calculo DESC);
