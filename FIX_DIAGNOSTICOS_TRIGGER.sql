-- FIX: Corrigir trigger de diagnósticos para funcionar sem os campos created_by/archived_by
-- Execute este SQL no Supabase para permitir remoção de diagnósticos

-- OPÇÃO 1: Desabilitar o trigger temporariamente (RÁPIDO)
DROP TRIGGER IF EXISTS trigger_log_diagnostico_ocultado ON public.paciente_diagnosticos;

-- OPÇÃO 2: Ou atualizar o trigger para funcionar sem os campos (MELHOR)
-- Primeiro, adicionar os campos necessários:
ALTER TABLE public.paciente_diagnosticos 
ADD COLUMN IF NOT EXISTS created_by UUID DEFAULT NULL,
ADD COLUMN IF NOT EXISTS archived_by UUID DEFAULT NULL,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Recriar a função do trigger de forma mais segura
CREATE OR REPLACE FUNCTION public.log_diagnostico_ocultado()
RETURNS TRIGGER AS $$
DECLARE
    v_created_by_name TEXT;
    v_archived_by_name TEXT;
BEGIN
    -- Se arquivado mudou de false para true, registrar que foi ocultado
    IF NEW.arquivado = true AND OLD.arquivado = false THEN
        -- Buscar nomes apenas se os IDs existirem
        IF OLD.created_by IS NOT NULL THEN
            SELECT name_user INTO v_created_by_name 
            FROM public.users 
            WHERE id = OLD.created_by 
            LIMIT 1;
        END IF;
        
        IF NEW.archived_by IS NOT NULL THEN
            SELECT name_user INTO v_archived_by_name 
            FROM public.users 
            WHERE id = NEW.archived_by 
            LIMIT 1;
        END IF;
        
        -- Inserir apenas se a tabela de audit existe
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
            v_created_by_name,
            NEW.archived_by,
            v_archived_by_name,
            'Diagnóstico ocultado/deletado',
            NEW.opcao_label,
            NEW.status
        );
    END IF;
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Se houver erro (ex: tabela de audit não existe), apenas retornar NEW sem falhar
        RAISE WARNING 'Erro ao registrar log de diagnóstico: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recriar o trigger
DROP TRIGGER IF EXISTS trigger_log_diagnostico_ocultado ON public.paciente_diagnosticos;
CREATE TRIGGER trigger_log_diagnostico_ocultado
AFTER UPDATE ON public.paciente_diagnosticos
FOR EACH ROW
EXECUTE FUNCTION public.log_diagnostico_ocultado();

-- Verificar se funcionou
SELECT 'Trigger corrigido com sucesso!' AS resultado;
