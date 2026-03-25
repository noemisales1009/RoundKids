-- ============================================================
-- ATUALIZAÇÃO: View de Balanço Hídrico Cumulativo
-- Data: 24/03/2026
-- ============================================================
-- LÓGICA CORRIGIDA:
--   BH Atual (últimas 24h)  = soma dos registros das últimas 24 horas
--   BH Anterior             = soma de TODOS os registros ANTES das últimas 24h
--                              (desde a internação do paciente)
--   BH Cumulativo Total     = soma de TODOS os registros desde a internação
--                              (= BH Anterior + BH Atual)
--
-- O BH Cumulativo reflete o acúmulo ou perda total desde a internação,
-- sendo atualizado a cada novo cálculo de BH.
-- ============================================================

-- PASSO 1: Apagar a View antiga
DROP VIEW IF EXISTS public.balanco_hidrico_cumulativo;

-- PASSO 2: Criar a View nova
CREATE VIEW public.balanco_hidrico_cumulativo AS
WITH
  janela_tempo AS (
    SELECT
      (now() AT TIME ZONE 'America/Sao_Paulo') AS agora_sp,
      (now() AT TIME ZONE 'America/Sao_Paulo') - interval '24 hours' AS limite_24h_sp
  ),

  -- BH Anterior: soma de todos os registros ANTES das últimas 24h (desde internação)
  soma_historico_antigo AS (
    SELECT
      bh.patient_id,
      SUM(bh.resultado) AS total_antigo
    FROM balanco_hidrico bh
    INNER JOIN patients p ON p.id = bh.patient_id
    WHERE bh.data_registro >= p.dt_internacao
      AND (bh.data_registro AT TIME ZONE 'America/Sao_Paulo') < (SELECT limite_24h_sp FROM janela_tempo)
    GROUP BY bh.patient_id
  ),

  -- BH Atual: soma dos registros das últimas 24 horas
  soma_ultimas_24h AS (
    SELECT
      bh.patient_id,
      SUM(bh.resultado) AS total_24h,
      COUNT(*) AS qtd_registros_24h
    FROM balanco_hidrico bh
    WHERE (bh.data_registro AT TIME ZONE 'America/Sao_Paulo') >= (SELECT limite_24h_sp FROM janela_tempo)
      AND (bh.data_registro AT TIME ZONE 'America/Sao_Paulo') <= (SELECT agora_sp FROM janela_tempo)
    GROUP BY bh.patient_id
  ),

  -- BH Cumulativo: soma de TODOS os registros desde a internação
  soma_total_internacao AS (
    SELECT
      bh.patient_id,
      SUM(bh.resultado) AS total_desde_internacao
    FROM balanco_hidrico bh
    INNER JOIN patients p ON p.id = bh.patient_id
    WHERE bh.data_registro >= p.dt_internacao
    GROUP BY bh.patient_id
  )

SELECT
  p.id AS patient_id,
  p.name AS patient_name,
  p.dt_internacao,
  (SELECT agora_sp FROM janela_tempo)::timestamp with time zone AS data_calculo,

  -- BH de todos os dias anteriores (antes das últimas 24h, desde internação)
  COALESCE(sha.total_antigo, 0::numeric) AS bh_historico_antigo,

  -- BH das últimas 24h (período atual aberto)
  COALESCE(su24.total_24h, 0::numeric) AS bh_ultimas_24h,

  -- BH Cumulativo = soma total desde a internação
  COALESCE(sti.total_desde_internacao, 0::numeric) AS bh_cumulativo_total,

  -- Quantidade de registros nas últimas 24h
  COALESCE(su24.qtd_registros_24h, 0) AS registros_ultimas_24h

FROM patients p
LEFT JOIN soma_historico_antigo sha ON p.id = sha.patient_id
LEFT JOIN soma_ultimas_24h su24 ON p.id = su24.patient_id
LEFT JOIN soma_total_internacao sti ON p.id = sti.patient_id
WHERE p.archived_at IS NULL;

-- ============================================================
-- TESTES
-- ============================================================
-- Visualizar dados da view:
-- SELECT * FROM balanco_hidrico_cumulativo WHERE bh_cumulativo_total != 0;

-- Verificar que o cumulativo = anterior + últimas 24h:
-- SELECT patient_name, bh_historico_antigo, bh_ultimas_24h, bh_cumulativo_total,
--        (bh_historico_antigo + bh_ultimas_24h) AS soma_verificacao
-- FROM balanco_hidrico_cumulativo
-- WHERE bh_cumulativo_total != 0;
