-- Criar tabela para rastrear conclusões de alertas
CREATE TABLE IF NOT EXISTS alert_completions (
  id SERIAL PRIMARY KEY,
  alert_id VARCHAR NOT NULL,
  source VARCHAR NOT NULL CHECK (source IN ('tasks', 'alertas_paciente')),
  completed_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(alert_id, source)
);

-- Criar índice para buscar rápido
CREATE INDEX IF NOT EXISTS idx_alert_completions_alert_id 
ON alert_completions(alert_id, source);

-- Política RLS (Row Level Security)
ALTER TABLE alert_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access" ON alert_completions
  FOR ALL USING (true);
