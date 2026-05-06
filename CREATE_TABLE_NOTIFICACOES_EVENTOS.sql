-- Tabela: notificacoes_eventos_paciente
-- Notificação de Eventos Adversos e Conduta Imediata (UTI Ped)

CREATE TABLE IF NOT EXISTS notificacoes_eventos_paciente (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id            TEXT NOT NULL,
  data_hora             TIMESTAMPTZ NOT NULL,

  -- Tipo de evento por natureza (múltiplos)
  tipo_natureza         TEXT[],
  tipo_natureza_outros  TEXT,

  -- Gravidade (único valor)
  gravidade             TEXT,

  -- Identificação
  profissional          TEXT,
  local_evento          TEXT,

  -- Seções textuais
  descricao             TEXT,
  conduta_descricao     TEXT,

  -- Conduta
  tempo_resposta        TEXT,

  -- Desfecho (único valor)
  desfecho              TEXT,

  -- Notificação institucional (múltiplos)
  notificacao           TEXT[],

  -- Causa (múltiplos)
  causa                 TEXT[],
  causa_outros          TEXT,

  -- Auditoria
  created_by            UUID REFERENCES auth.users(id),
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  archived_at           TIMESTAMPTZ,
  archived_by           UUID REFERENCES auth.users(id)
);

-- RLS: habilitar
ALTER TABLE notificacoes_eventos_paciente ENABLE ROW LEVEL SECURITY;

-- Policy: usuários autenticados podem inserir e ler
CREATE POLICY "autenticados podem inserir notificacoes"
  ON notificacoes_eventos_paciente FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "autenticados podem ler notificacoes"
  ON notificacoes_eventos_paciente FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "autenticados podem atualizar notificacoes"
  ON notificacoes_eventos_paciente FOR UPDATE
  TO authenticated USING (true);
