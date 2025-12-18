-- Script para resetar checklist diariamente às 05:00 (UTC-3 Brasília)
-- Execute isso no SQL Editor do Supabase

-- 1. Criar extensão para agendamento (se ainda não existir)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Criar função para limpar respostas diárias
CREATE OR REPLACE FUNCTION reset_daily_checklist()
RETURNS void AS $$
BEGIN
  -- Limpar respostas do checklist do dia anterior
  DELETE FROM public.checklist_answers
  WHERE date < CURRENT_DATE;
  
  -- Log da execução
  INSERT INTO public.audit_log (event, timestamp)
  VALUES ('Checklist reset executado', NOW());
  
  RAISE NOTICE 'Checklist resetado em %', NOW();
END;
$$ LANGUAGE plpgsql;

-- 3. Agendar execução diária às 05:00 (UTC-3)
-- Nota: Supabase usa UTC, então 05:00 Brasília = 08:00 UTC
SELECT cron.schedule(
  'reset-checklist-daily',
  '0 8 * * *',  -- 08:00 UTC (05:00 Brasília em horário de verão)
  'SELECT reset_daily_checklist()'
);

-- 4. Ver jobs agendados
SELECT * FROM cron.job;

-- 5. Ver histórico de execução
SELECT * FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 10;
