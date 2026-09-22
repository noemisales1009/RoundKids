-- ============================================================================
-- CREATE_SUPORTE_RESPIRATORIO.sql
-- Bloco "Suporte de Oxigenação e Ventilação" do Round eletrônico da UTI Pediátrica
-- (Especificação funcional do bloco de suporte de oxigenação e ventilação).
--
-- Duas tabelas:
--   suporte_resp_episodios  = um episódio por dispositivo/modalidade (início, fim, motivo).
--   suporte_resp_parametros = cada confirmação ou alteração de parâmetros (histórico).
--
-- SEGURO: cria tabelas novas, não toca em nada existente.
-- RLS ligada desde o início, policy SÓ para authenticated (nunca anon).
-- O histórico de parâmetros é imutável: a policy permite apenas SELECT e INSERT,
-- o que preserva versão, data, hora e autoria de cada modificação (item 10 da spec).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- ETAPA 1 — Tabela de episódios
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS suporte_resp_episodios (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id     UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,

  -- ar_ambiente | o2_convencional | alto_fluxo | vni | vmi
  situacao        TEXT NOT NULL
                  CHECK (situacao IN ('ar_ambiente', 'o2_convencional', 'alto_fluxo', 'vni', 'vmi')),
  -- cateter_nasal | mascara_simples | mascara_parcial | mascara_nao_reinalante
  -- | venturi | cnaf | bipap | cpap.  NULL em ar_ambiente e vmi.
  dispositivo     TEXT,

  inicio          TIMESTAMPTZ NOT NULL DEFAULT now(),
  fim             TIMESTAMPTZ,            -- NULL = episódio em curso
  motivo_fim      TEXT,                   -- motivo da mudança ou retirada

  criado_em       TIMESTAMPTZ NOT NULL DEFAULT now(),
  criado_por      UUID,
  criado_por_nome TEXT,                   -- nome no momento do registro (auditoria)
  encerrado_por      UUID,
  encerrado_por_nome TEXT,

  -- Impede data de retirada anterior à data de início (item 10 da spec)
  CONSTRAINT suporte_resp_episodios_fim_check CHECK (fim IS NULL OR fim >= inicio)
);

CREATE INDEX IF NOT EXISTS idx_suporte_resp_episodios_paciente
  ON suporte_resp_episodios (paciente_id, inicio DESC);

-- Só pode existir UM episódio em curso por paciente
CREATE UNIQUE INDEX IF NOT EXISTS uq_suporte_resp_episodio_ativo
  ON suporte_resp_episodios (paciente_id) WHERE fim IS NULL;

-- ----------------------------------------------------------------------------
-- ETAPA 2 — Tabela de parâmetros (histórico imutável)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS suporte_resp_parametros (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episodio_id     UUID NOT NULL REFERENCES suporte_resp_episodios(id) ON DELETE CASCADE,
  paciente_id     UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,

  registrado_em   TIMESTAMPTZ NOT NULL DEFAULT now(),
  registrado_por  UUID,
  registrado_por_nome TEXT,
  -- inicio = abertura do episódio | alteracao = mudou parâmetro | confirmacao = conferiu sem mudar
  tipo_registro   TEXT NOT NULL
                  CHECK (tipo_registro IN ('inicio', 'alteracao', 'confirmacao')),

  -- Avaliação da oxigenação (cabeçalho do bloco)
  spo2            NUMERIC,   -- %
  spo2_meta_min   NUMERIC,   -- %
  spo2_meta_max   NUMERIC,   -- %

  -- Parâmetros (preenchidos conforme o suporte; os não aplicáveis ficam NULL)
  modo            TEXT,      -- modo ventilatório (VMI)
  fluxo_lmin      NUMERIC,   -- L/min
  fio2            NUMERIC,   -- fração decimal (0,21–1,0), mesmo padrão de pards_avaliacoes
  temperatura_c   NUMERIC,   -- °C (CNAF)
  ipap            NUMERIC,   -- cmH2O
  epap            NUMERIC,   -- cmH2O
  peep            NUMERIC,   -- cmH2O (CPAP/PEEP)
  pip             NUMERIC,   -- cmH2O
  fr              NUMERIC,   -- irpm (frequência programada)
  ti_seg          NUMERIC,   -- segundos
  map             NUMERIC,   -- cmH2O (pressão média das vias aéreas)
  vc_ml           NUMERIC,   -- mL
  vc_ml_kg        NUMERIC,   -- mL/kg (calculado com o peso abaixo)
  peso_kg         NUMERIC,   -- peso usado no cálculo de mL/kg
  pressao_suporte NUMERIC,   -- cmH2O (no BIPAP = IPAP - EPAP, calculado)

  -- Texto clínico revisado pelo profissional no momento do registro
  texto_clinico   TEXT
);

CREATE INDEX IF NOT EXISTS idx_suporte_resp_parametros_episodio
  ON suporte_resp_parametros (episodio_id, registrado_em DESC);
CREATE INDEX IF NOT EXISTS idx_suporte_resp_parametros_paciente
  ON suporte_resp_parametros (paciente_id, registrado_em DESC);

-- ----------------------------------------------------------------------------
-- ETAPA 3 — RLS (rodar logo depois das etapas 1 e 2)
-- ----------------------------------------------------------------------------
ALTER TABLE suporte_resp_episodios  ENABLE ROW LEVEL SECURITY;
ALTER TABLE suporte_resp_parametros ENABLE ROW LEVEL SECURITY;

-- Episódios: ler, abrir e encerrar (UPDATE). Sem DELETE.
DROP POLICY IF EXISTS "authenticated_select_suporte_resp_episodios" ON suporte_resp_episodios;
CREATE POLICY "authenticated_select_suporte_resp_episodios"
  ON suporte_resp_episodios FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_suporte_resp_episodios" ON suporte_resp_episodios;
CREATE POLICY "authenticated_insert_suporte_resp_episodios"
  ON suporte_resp_episodios FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_suporte_resp_episodios" ON suporte_resp_episodios;
CREATE POLICY "authenticated_update_suporte_resp_episodios"
  ON suporte_resp_episodios FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Parâmetros: só ler e inserir. Sem UPDATE e sem DELETE = histórico imutável.
DROP POLICY IF EXISTS "authenticated_select_suporte_resp_parametros" ON suporte_resp_parametros;
CREATE POLICY "authenticated_select_suporte_resp_parametros"
  ON suporte_resp_parametros FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_suporte_resp_parametros" ON suporte_resp_parametros;
CREATE POLICY "authenticated_insert_suporte_resp_parametros"
  ON suporte_resp_parametros FOR INSERT TO authenticated WITH CHECK (true);

-- Nada para anon: sem GRANT e sem policy.

-- ============================================================================
-- CHECKLIST DE TESTE (rodar depois de aplicar)
-- ============================================================================
-- 1) Tabelas criadas e RLS ligada (rowsecurity deve ser true nas duas):
--
-- SELECT relname, relrowsecurity FROM pg_class
-- WHERE relname IN ('suporte_resp_episodios', 'suporte_resp_parametros');
--
-- 2) Policies (só authenticated; parametros NÃO pode ter UPDATE nem DELETE):
--
-- SELECT tablename, policyname, cmd, roles FROM pg_policies
-- WHERE tablename IN ('suporte_resp_episodios', 'suporte_resp_parametros')
-- ORDER BY tablename, cmd;
--
-- 3) No app: paciente > botão "Oxigenação e Ventilação" > escolher CNAF >
--    preencher fluxo, FiO2 e temperatura > Salvar. Depois trocar para VPM invasiva,
--    informar o motivo e salvar: o episódio de CNAF deve aparecer encerrado no histórico.
--
-- 4) Conferir os registros:
--
-- SELECT situacao, dispositivo, inicio, fim, motivo_fim, criado_por_nome
-- FROM suporte_resp_episodios ORDER BY inicio DESC LIMIT 5;
--
-- SELECT registrado_em, tipo_registro, modo, fluxo_lmin, fio2, peep, registrado_por_nome
-- FROM suporte_resp_parametros ORDER BY registrado_em DESC LIMIT 5;

-- ============================================================================
-- ROLLBACK (desfaz tudo; parametros primeiro por causa da chave estrangeira)
-- ============================================================================
-- DROP TABLE IF EXISTS suporte_resp_parametros;
-- DROP TABLE IF EXISTS suporte_resp_episodios;
