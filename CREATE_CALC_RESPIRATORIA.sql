-- ============================================================================
-- CREATE_CALC_RESPIRATORIA.sql
-- Calculadora respiratória automática do Round (oxigenação, ventilação, mecânica
-- respiratória e proteção pulmonar), integrada ao bloco Suporte de Oxigenação e
-- Ventilação. Requer CREATE_SUPORTE_RESPIRATORIO.sql já aplicado.
--
-- Referências da especificação: PALICC-2 (Emeriaud G, et al. Pediatr Crit Care Med.
-- 2023;24(2):143-168) e Sundaram M, et al. Indian J Pediatr. 2021;88:64-72.
--
-- SEGURO: cria tabela nova, não toca em nada existente.
-- RLS ligada desde o início, policy SÓ para authenticated (nunca anon).
-- Histórico imutável: apenas SELECT e INSERT, para manter a tendência dos índices
-- sem apagar cálculos anteriores (item 8.6 da spec).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- ETAPA 1 — Tabela
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS calc_resp_avaliacoes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id      UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  episodio_id      UUID REFERENCES suporte_resp_episodios(id) ON DELETE SET NULL,

  -- Autoria da validação (item 8.5)
  criado_em        TIMESTAMPTZ NOT NULL DEFAULT now(),
  validado_por     UUID,
  validado_por_nome TEXT,

  -- Horário das fontes, para não misturar gasometria antiga com parâmetros atuais
  gasometria_em    TIMESTAMPTZ,
  ventilador_em    TIMESTAMPTZ,

  -- Dados de entrada
  suporte          TEXT,      -- rótulo do suporte no momento (ex.: VPM invasiva)
  modo             TEXT,
  peso_kg          NUMERIC,
  peso_ideal_kg    NUMERIC,
  spo2             NUMERIC,   -- %
  fio2             NUMERIC,   -- fração decimal (0,21–1,0)
  pao2             NUMERIC,   -- mmHg
  paco2            NUMERIC,   -- mmHg
  ph               NUMERIC,
  etco2            NUMERIC,   -- mmHg
  peco2            NUMERIC,   -- mmHg (CO2 expirado misto)
  pip              NUMERIC,   -- cmH2O
  pplat            NUMERIC,   -- cmH2O
  peep_programada  NUMERIC,   -- cmH2O
  peep_total       NUMERIC,   -- cmH2O
  map              NUMERIC,   -- cmH2O
  vte_ml           NUMERIC,   -- mL
  vazamento_pct    NUMERIC,   -- %
  fr               NUMERIC,   -- irpm
  ti_seg           NUMERIC,   -- s
  fluxo_insp_lmin  NUMERIC,   -- L/min

  -- Condições de validade confirmadas pelo profissional
  sinal_spo2_ok    BOOLEAN,
  contemporaneos   BOOLEAN,
  pausa_insp_ok    BOOLEAN,
  pausa_exp_ok     BOOLEAN,
  vte_confiavel    BOOLEAN,

  -- Resultados (NULL = não calculado por falta de dado ou de condição de validade)
  pf               NUMERIC,
  sf               NUMERIC,
  io               NUMERIC,
  is_osi           NUMERIC,
  classe_oxigenacao TEXT,     -- sem_criterio | leve_moderada | grave
  vte_kg           NUMERIC,   -- mL/kg
  vmin_l           NUMERIC,   -- L/min
  gradiente_co2    NUMERIC,   -- mmHg
  te_seg           NUMERIC,
  ie               TEXT,      -- ex.: 1:2,1
  vd_vt            NUMERIC,
  dp               NUMERIC,   -- cmH2O
  cstat            NUMERIC,   -- mL/cmH2O
  cstat_kg         NUMERIC,   -- mL/kg/cmH2O
  cdyn             NUMERIC,   -- mL/cmH2O
  raw              NUMERIC,   -- cmH2O/L/s
  tau_seg          NUMERIC,
  auto_peep        NUMERIC,   -- cmH2O

  -- Rastreabilidade (itens 8.2 e 8.5)
  origem_dados     JSONB,     -- por campo: importado | digitado
  memoria_calculo  JSONB,     -- por indicador: fórmula, valores usados e resultado
  alertas          JSONB,     -- alertas exibidos no momento da validação
  sintese          TEXT       -- texto revisado e validado pelo profissional
);

CREATE INDEX IF NOT EXISTS idx_calc_resp_avaliacoes_paciente
  ON calc_resp_avaliacoes (paciente_id, criado_em DESC);

-- ----------------------------------------------------------------------------
-- ETAPA 2 — RLS (rodar logo depois da etapa 1)
-- ----------------------------------------------------------------------------
ALTER TABLE calc_resp_avaliacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_calc_resp_avaliacoes" ON calc_resp_avaliacoes;
CREATE POLICY "authenticated_select_calc_resp_avaliacoes"
  ON calc_resp_avaliacoes FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_calc_resp_avaliacoes" ON calc_resp_avaliacoes;
CREATE POLICY "authenticated_insert_calc_resp_avaliacoes"
  ON calc_resp_avaliacoes FOR INSERT TO authenticated WITH CHECK (true);

-- Sem UPDATE e sem DELETE: cálculo validado não se altera nem se apaga.
-- Nada para anon: sem GRANT e sem policy.

-- ============================================================================
-- CHECKLIST DE TESTE (rodar depois de aplicar)
-- ============================================================================
-- 1) Tabela criada e RLS ligada (rowsecurity deve ser true):
--
-- SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'calc_resp_avaliacoes';
--
-- 2) Policies (só SELECT e INSERT, só authenticated):
--
-- SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'calc_resp_avaliacoes';
--
-- 3) No app: paciente > "Oxigenação e Ventilação" > aba Calculadora > preencher
--    FiO2, PaO2, SpO2 e MAP > marcar as confirmações > validar e gravar.
--
-- 4) Conferir o registro:
--
-- SELECT criado_em, validado_por_nome, pf, sf, io, is_osi, classe_oxigenacao, dp, cstat_kg
-- FROM calc_resp_avaliacoes ORDER BY criado_em DESC LIMIT 5;

-- ============================================================================
-- ROLLBACK (desfaz tudo)
-- ============================================================================
-- DROP TABLE IF EXISTS calc_resp_avaliacoes;
