-- Adiciona coluna para controlar visibilidade no export Word
ALTER TABLE paciente_diagnosticos
  ADD COLUMN IF NOT EXISTS mostrar_word BOOLEAN NOT NULL DEFAULT TRUE;
