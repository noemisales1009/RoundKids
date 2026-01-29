-- Tabela de auditoria para rastrear quem deletou/ocultou diagnósticos
-- Isso serve para ter um registro indelível de quem fez o quê

CREATE TABLE IF NOT EXISTS public.diagnosticos_audit_log (
    id BIGSERIAL PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    diagnostico_id BIGINT NOT NULL,
    acao TEXT NOT NULL CHECK (acao IN ('CRIADO', 'OCULTADO', 'RESTAURADO')),
    criado_por UUID,
    criado_por_nome TEXT,
    modificado_por UUID NOT NULL,
    modificado_por_nome TEXT,
    descricao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    diagnostico_label TEXT,
    diagnostico_status TEXT
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_diagnosticos_audit_patient ON public.diagnosticos_audit_log(patient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_diagnosticos_audit_acao ON public.diagnosticos_audit_log(acao, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_diagnosticos_audit_modificado_por ON public.diagnosticos_audit_log(modificado_por);

-- Comentários
COMMENT ON TABLE public.diagnosticos_audit_log IS 'Log de auditoria para rastrear criação, ocultação e restauração de diagnósticos';
COMMENT ON COLUMN public.diagnosticos_audit_log.acao IS 'Ação realizada: CRIADO, OCULTADO ou RESTAURADO';
COMMENT ON COLUMN public.diagnosticos_audit_log.modificado_por_nome IS 'Nome de quem realizou a ação (para auditoria rápida)';

-- Trigger para registrar automaticamente quando um diagnóstico é ocultado
CREATE OR REPLACE FUNCTION public.log_diagnostico_ocultado()
RETURNS TRIGGER AS $$
BEGIN
    -- Se arquivado mudou de false para true, registrar que foi ocultado
    IF NEW.arquivado = true AND OLD.arquivado = false THEN
        INSERT INTO public.diagnosticos_audit_log (
            patient_id,
            diagnostico_id,
            acao,
            criado_por,
            criado_por_nome,
            modificado_por,
            modificado_por_nome,
            descricao,
            diagnostico_label,
            diagnostico_status
        ) VALUES (
            NEW.patient_id,
            NEW.id,
            'OCULTADO',
            OLD.created_by,
            (SELECT name_user FROM public.users WHERE id = OLD.created_by LIMIT 1),
            NEW.archived_by,
            (SELECT name_user FROM public.users WHERE id = NEW.archived_by LIMIT 1),
            'Diagnóstico ocultado/deletado',
            NEW.opcao_label,
            NEW.status
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remover trigger anterior se existir
DROP TRIGGER IF EXISTS trigger_log_diagnostico_ocultado ON public.paciente_diagnosticos;

-- Criar novo trigger
CREATE TRIGGER trigger_log_diagnostico_ocultado
AFTER UPDATE ON public.paciente_diagnosticos
FOR EACH ROW
EXECUTE FUNCTION public.log_diagnostico_ocultado();
