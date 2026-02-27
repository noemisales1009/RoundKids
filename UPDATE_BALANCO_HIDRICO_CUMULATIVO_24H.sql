-- ATUALIZAÇÃO: View de Balanço Hídrico Cumulativo com Regra de 24 Horas
-- Data: 27/02/2026
-- Descrição: Recria a view com cálculo de 24 horas em timezone Brasil

-- PASSO 1: Apagar a View antiga
DROP VIEW IF EXISTS public.balanco_hidrico_cumulativo;

-- PASSO 2: Criar a View nova com a regra de 24 horas
CREATE VIEW public.balanco_hidrico_cumulativo AS
WITH 
  janela_tempo AS (
    SELECT 
      (now() AT TIME ZONE 'America/Sao_Paulo') AS agora_sp,
      (now() AT TIME ZONE 'America/Sao_Paulo') - interval '24 hours' AS limite_24h_sp
  ),

  soma_historico_antigo AS (
    SELECT
      patient_id,
      SUM(resultado) AS total_antigo
    FROM balanco_hidrico
    WHERE (data_registro AT TIME ZONE 'America/Sao_Paulo') < (SELECT limite_24h_sp FROM janela_tempo)
    GROUP BY patient_id
  ),

  soma_ultimas_24h AS (
    SELECT
      patient_id,
      SUM(resultado) AS total_24h,
      COUNT(*) AS qtd_registros_24h
    FROM balanco_hidrico
    WHERE (data_registro AT TIME ZONE 'America/Sao_Paulo') >= (SELECT limite_24h_sp FROM janela_tempo)
    GROUP BY patient_id
  )

SELECT
  p.id AS patient_id,
  p.name AS patient_name,
  (SELECT agora_sp FROM janela_tempo)::timestamp with time zone AS data_calculo,
  
  COALESCE(sha.total_antigo, 0::numeric) AS bh_historico_antigo,
  
  COALESCE(su24.total_24h, 0::numeric) AS bh_ultimas_24h,
  
  COALESCE(sha.total_antigo, 0::numeric) + COALESCE(su24.total_24h, 0::numeric) AS bh_cumulativo_total,
  
  COALESCE(su24.qtd_registros_24h, 0) AS registros_ultimas_24h

FROM patients p
LEFT JOIN soma_historico_antigo sha ON p.id = sha.patient_id
LEFT JOIN soma_ultimas_24h su24 ON p.id = su24.patient_id;

-- TESTE: Visualizar dados da view
-- SELECT * FROM balanco_hidrico_cumulativo LIMIT 10;

-- TESTE: Verificar campos retornados
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'balanco_hidrico_cumulativo' 
-- ORDER BY ordinal_position;
