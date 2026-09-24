-- ============================================================================
-- ALTER_CALC_RESP_ADD_METAS_OBS.sql
-- Calculadora Respiratória: metas individuais, dados de referência do ventilador
-- e observações de beira-leito que faltavam para fechar as três specs.
--
-- Fontes: "Alarmes respiratórios para o Round" (itens 3, 4, 6, 7, 10, 11 e 13),
-- "Alarmes de relação IE Ti e PEEP" (itens 4, 6, 8 e 9) e
-- "Constante de tempo e cálculo do Ti" (itens 7 e 9).
--
--   - meta_spo2_min / meta_spo2_max: meta individual de SpO2 usada nos alarmes,
--     importada do bloco de suporte. Sem ela, o alarme usa 92-97%.
--   - meta_peep_min / meta_peep_max: faixa individual de PEEP ou PEEP de
--     sustentacao na malacia.
--   - meta_vmin_l: meta de ventilacao minuto (falha da bomba).
--   - vt_programado_ml: volume corrente programado, para o alarme de VTe abaixo
--     de 80% do programado.
--   - ie_informada: relacao I:E mostrada no ventilador (so o numero depois do 1:),
--     comparada com a calculada.
--   - raw_exp / tau_exp_seg: resistencia expiratoria medida e constante de tempo
--     expiratoria propria. Sem elas, o Te minimo usa a tau inspiratoria.
--   - ovas_fixa: TRUE = obstrucao fixa, FALSE = dinamica (malacia), NULL = nao
--     classificada. Muda a leitura dos alarmes de PEEP na OVAS.
--   - assincronias / sinais_vni: listas marcadas na avaliacao (JSONB).
--   - observacoes_beira_leito: apneia, backup, PIP no limite, interrupcao do
--     fluxo inspiratorio, tau incompativel, obstrucao persistente e reavaliacao
--     registrada (JSONB).
--
-- Requer CREATE_CALC_RESPIRATORIA.sql e ALTER_CALC_RESP_ADD_CONTEXTO.sql.
-- SEGURO: so adiciona colunas opcionais. Registros antigos ficam com NULL e a
-- tela continua funcionando sem o script (os campos so nao sao gravados).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- ETAPA 1 - Metas individuais
-- ----------------------------------------------------------------------------
ALTER TABLE public.calc_resp_avaliacoes
  ADD COLUMN IF NOT EXISTS meta_spo2_min   NUMERIC,
  ADD COLUMN IF NOT EXISTS meta_spo2_max   NUMERIC,
  ADD COLUMN IF NOT EXISTS meta_peep_min   NUMERIC,
  ADD COLUMN IF NOT EXISTS meta_peep_max   NUMERIC,
  ADD COLUMN IF NOT EXISTS meta_vmin_l     NUMERIC;

-- ----------------------------------------------------------------------------
-- ETAPA 2 - Dados de referencia do ventilador e mecanica expiratoria
-- ----------------------------------------------------------------------------
ALTER TABLE public.calc_resp_avaliacoes
  ADD COLUMN IF NOT EXISTS vt_programado_ml NUMERIC,
  ADD COLUMN IF NOT EXISTS ie_informada     NUMERIC,
  ADD COLUMN IF NOT EXISTS raw_exp          NUMERIC,
  ADD COLUMN IF NOT EXISTS tau_exp_seg      NUMERIC;

-- ----------------------------------------------------------------------------
-- ETAPA 3 - Observacoes de beira-leito
-- ----------------------------------------------------------------------------
ALTER TABLE public.calc_resp_avaliacoes
  ADD COLUMN IF NOT EXISTS ovas_fixa                BOOLEAN,
  ADD COLUMN IF NOT EXISTS assincronias             JSONB,
  ADD COLUMN IF NOT EXISTS sinais_vni               JSONB,
  ADD COLUMN IF NOT EXISTS observacoes_beira_leito  JSONB;

-- ============================================================================
-- CHECKLIST DE TESTE
-- ============================================================================
-- 1) Colunas criadas (espera 13 linhas):
--
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'calc_resp_avaliacoes'
--   AND column_name IN ('meta_spo2_min','meta_spo2_max','meta_peep_min','meta_peep_max',
--                       'meta_vmin_l','vt_programado_ml','ie_informada','raw_exp',
--                       'tau_exp_seg','ovas_fixa','assincronias','sinais_vni',
--                       'observacoes_beira_leito')
-- ORDER BY column_name;
--
-- 2) No app, com um paciente em VMI:
--    a) Bloco de suporte: preencher Meta de SpO2 minima e maxima e gravar.
--    b) Calc. Respiratoria: as duas metas aparecem no card "Metas individuais e
--       dados de referencia" marcadas como "importado".
--    c) Informar SpO2 abaixo da meta > aba Alarmes mostra "SpO2 abaixo da meta"
--       com a referencia "(meta individual)".
--    d) Preencher volume corrente programado maior que o VTe > aparece o alarme
--       "VTe abaixo de 80% do volume programado".
--    e) Marcar duas assincronias > aparece um unico alarme de assincronia com
--       as duas marcadas no campo Valor.
--    f) Validar e gravar.
--
-- 3) SELECT criado_em, meta_spo2_min, meta_spo2_max, vt_programado_ml,
--           tau_exp_seg, ovas_fixa, assincronias, sinais_vni,
--           jsonb_array_length(alertas) AS qtd_alarmes
--    FROM calc_resp_avaliacoes ORDER BY criado_em DESC LIMIT 5;
--
-- 4) Segunda avaliacao no mesmo paciente, mudando FR ou PEEP: deve surgir o
--    alarme "Parametro alterado desde a ultima avaliacao validada". Marcar a
--    observacao de reavaliacao registrada faz o alarme sair.

-- ============================================================================
-- ROLLBACK (por etapa, na ordem inversa)
-- ============================================================================
-- ALTER TABLE public.calc_resp_avaliacoes
--   DROP COLUMN IF EXISTS ovas_fixa,
--   DROP COLUMN IF EXISTS assincronias,
--   DROP COLUMN IF EXISTS sinais_vni,
--   DROP COLUMN IF EXISTS observacoes_beira_leito;
--
-- ALTER TABLE public.calc_resp_avaliacoes
--   DROP COLUMN IF EXISTS vt_programado_ml,
--   DROP COLUMN IF EXISTS ie_informada,
--   DROP COLUMN IF EXISTS raw_exp,
--   DROP COLUMN IF EXISTS tau_exp_seg;
--
-- ALTER TABLE public.calc_resp_avaliacoes
--   DROP COLUMN IF EXISTS meta_spo2_min,
--   DROP COLUMN IF EXISTS meta_spo2_max,
--   DROP COLUMN IF EXISTS meta_peep_min,
--   DROP COLUMN IF EXISTS meta_peep_max,
--   DROP COLUMN IF EXISTS meta_vmin_l;
