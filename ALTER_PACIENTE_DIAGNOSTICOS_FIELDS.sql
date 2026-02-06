-- ============================================
-- ALTERAÇÕES NA TABELA paciente_diagnosticos
-- ============================================
-- Adicionar campos se não existirem

-- 1. Adicionar campo opcao_label (para armazenar o rótulo da opção no momento da criação)
ALTER TABLE public.paciente_diagnosticos
ADD COLUMN IF NOT EXISTS opcao_label text DEFAULT NULL;

-- 2. Adicionar campo archived_at (quando foi arquivado)
ALTER TABLE public.paciente_diagnosticos
ADD COLUMN IF NOT EXISTS archived_at timestamp with time zone DEFAULT NULL;

-- 3. Adicionar campo motivo_arquivamento (por que foi arquivado)
ALTER TABLE public.paciente_diagnosticos
ADD COLUMN IF NOT EXISTS motivo_arquivamento text DEFAULT NULL;

-- ============================================
-- TRIGGER PARA AUDITORIA (Opcional)
-- ============================================
-- Quando um diagnóstico é arquivado, pode-se opcionalmente
-- copiar para diagnosticos_historico (se essa tabela existir)
-- Para isso, crie um trigger AFTER UPDATE

-- CREATE OR REPLACE FUNCTION log_diagnostico_arquivado()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   IF NEW.arquivado = true AND OLD.arquivado = false THEN
--     INSERT INTO diagnosticos_historico (...)
--     SELECT ...FROM paciente_diagnosticos WHERE id = NEW.id;
--   END IF;
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;
--
-- CREATE TRIGGER trg_log_diagnostico_arquivado
-- AFTER UPDATE ON paciente_diagnosticos
-- FOR EACH ROW
-- EXECUTE FUNCTION log_diagnostico_arquivado();

-- ============================================
-- COMENTÁRIOS
-- ============================================
-- 1. Quando criar: salvar opcao_label do rótulo da opção selecionada
-- 2. Quando arquivar: salvar archived_by, archived_at, motivo_arquivamento
-- 3. View diagnosticos_historico_com_usuario faz JOIN com users para trazer nomes
