-- Create diurese table
CREATE TABLE IF NOT EXISTS diurese (
    id BIGSERIAL PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    volume DECIMAL(10, 2) NOT NULL,
    peso DECIMAL(10, 2) NOT NULL,
    horas INTEGER NOT NULL,
    resultado DECIMAL(10, 4) GENERATED ALWAYS AS (
        CASE
            WHEN (peso > 0 AND horas > 0) THEN (volume / horas::NUMERIC) / peso
            ELSE 0
        END
    ) STORED,
    data_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create diurese_historico table for timeline
CREATE TABLE IF NOT EXISTS diurese_historico (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    volume DECIMAL(10, 2) NOT NULL,
    peso DECIMAL(10, 2) NOT NULL,
    horas INTEGER NOT NULL,
    resultado DECIMAL(10, 4) NOT NULL,
    data_calculo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indices for performance
CREATE INDEX IF NOT EXISTS idx_diurese_patient_id ON diurese(patient_id);
CREATE INDEX IF NOT EXISTS idx_diurese_data_registro ON diurese(data_registro DESC);
CREATE INDEX IF NOT EXISTS idx_diurese_historico_patient_id ON diurese_historico(patient_id);
CREATE INDEX IF NOT EXISTS idx_diurese_historico_data_calculo ON diurese_historico(data_calculo DESC);
