-- ========================================
-- FUNÇÕES PARA TRIGGERS DE CONCLUSÃO
-- Salva quem concluiu e quando
-- ========================================

-- 1. FUNÇÃO PARA TASKS
CREATE OR REPLACE FUNCTION update_task_conclusion()
RETURNS TRIGGER AS $$
BEGIN
  -- Se status mudou para 'concluído' e não estava antes
  IF (NEW.status ILIKE 'concluido' OR NEW.status ILIKE 'concluído') 
     AND (OLD.status IS NULL OR NOT (OLD.status ILIKE 'concluido' OR OLD.status ILIKE 'concluído')) THEN
    
    -- Salva a hora da conclusão
    NEW.concluded_at := NOW() AT TIME ZONE 'America/Sao_Paulo';
    
    -- Salva o ID de quem concluiu (vem do contexto da aplicação)
    -- Se não tiver user_id no contexto, pega do current_setting
    NEW.concluded_by := COALESCE(
      (current_setting('app.current_user_id', true))::uuid,
      NEW.created_by
    );
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. FUNÇÃO PARA ALERTAS
CREATE OR REPLACE FUNCTION update_alerta_conclusion()
RETURNS TRIGGER AS $$
BEGIN
  -- Se status mudou para 'concluído' e não estava antes
  IF (NEW.status ILIKE 'concluido' OR NEW.status ILIKE 'concluído' OR NEW.status ILIKE 'resolvido%') 
     AND (OLD.status IS NULL OR NOT (OLD.status ILIKE 'concluido' OR OLD.status ILIKE 'concluído' OR OLD.status ILIKE 'resolvido%')) THEN
    
    -- Salva a hora da conclusão
    NEW.concluded_at := NOW() AT TIME ZONE 'America/Sao_Paulo';
    
    -- Salva o ID de quem concluiu
    NEW.concluded_by := COALESCE(
      (current_setting('app.current_user_id', true))::uuid,
      NEW.created_by
    );
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- VERIFICAÇÃO
-- ========================================
-- Para usar essas funções, a aplicação deve fazer:
-- 
-- ANTES de fazer UPDATE na task/alerta:
-- SELECT set_config('app.current_user_id', 'UUID_DO_USUARIO', false);
--
-- Exemplo em uma query:
-- BEGIN;
--   SELECT set_config('app.current_user_id', '550e8400-e29b-41d4-a716-446655440000', false);
--   UPDATE tasks SET status = 'concluído' WHERE id = 123;
-- COMMIT;
--
-- Ou se usar supabase/PostgREST, passar o header:
-- Authorization: Bearer TOKEN
-- E a aplicação deve fazer set_config antes de cada UPDATE
-- ========================================
