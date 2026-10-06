-- ============================================================================
-- CREATE_IA_SUGESTOES_LOG.sql
-- Medição das sugestões de IA: o que a IA sugeriu e o que o profissional salvou.
--
-- Serve para responder, por campo: "quando a IA estava segura, em quantos % o
-- profissional salvou a mesma coisa?". É com esse número que se decide religar
-- (ou não) o preenchimento automático de cada campo.
--
-- NÃO guarda paciente nem texto clínico: só o nome do campo, a opção sugerida
-- (tirada das listas fixas do app) e a opção salva.
--
-- SEGURO: cria tabela nova, não toca em nada existente.
-- RLS ligada desde o início, policies SÓ para authenticated (nunca anon).
-- Enquanto a tabela não existir, o app funciona normalmente e só não mede.
--
-- Rodar uma etapa de cada vez no SQL Editor do Supabase.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- ETAPA 1 — Tabela
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ia_sugestoes_log (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  criado_em    TIMESTAMPTZ NOT NULL DEFAULT now(),
  criado_por   UUID DEFAULT auth.uid(),

  -- Onde a sugestão apareceu: alerta.sistema | alerta.responsavel | alerta.prazo |
  -- justificativa.motivo | exame.sistema | cultura.sistema | medicacao.sistema |
  -- parecer.sistema | exame_imagem.sistema | painel_viral.sistema | cirurgia.sistema
  campo        TEXT NOT NULL,

  sugestao     TEXT NOT NULL,     -- opção que a IA sugeriu
  confianca    NUMERIC NOT NULL,  -- segurança da IA, de 0 a 1
  valor_final  TEXT               -- opção que o profissional salvou (NULL = deixou em branco)
);

CREATE INDEX IF NOT EXISTS idx_ia_sugestoes_log_campo
  ON ia_sugestoes_log (campo, criado_em DESC);

-- ----------------------------------------------------------------------------
-- ETAPA 2 — RLS (rodar logo depois da etapa 1)
-- Usuário logado pode gravar a própria linha e ler todas. Ninguém altera nem apaga.
-- ----------------------------------------------------------------------------
ALTER TABLE ia_sugestoes_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_insert_ia_sugestoes_log" ON ia_sugestoes_log;
CREATE POLICY "authenticated_insert_ia_sugestoes_log"
  ON ia_sugestoes_log
  FOR INSERT
  TO authenticated
  WITH CHECK (criado_por = auth.uid());

DROP POLICY IF EXISTS "authenticated_select_ia_sugestoes_log" ON ia_sugestoes_log;
CREATE POLICY "authenticated_select_ia_sugestoes_log"
  ON ia_sugestoes_log
  FOR SELECT
  TO authenticated
  USING (true);

-- Neste projeto a tabela nova nasce sem permissão para anon; o GRANT abaixo garante
-- leitura e gravação só para usuário logado.
GRANT SELECT, INSERT ON ia_sugestoes_log TO authenticated;

-- Nada para anon: sem GRANT e sem policy.

-- ============================================================================
-- CHECKLIST DE TESTE (depois das etapas 1 e 2)
-- ============================================================================
-- [ ] 1. A tabela existe e está vazia:
--          SELECT count(*) FROM ia_sugestoes_log;            -- 0
-- [ ] 2. RLS ligada:
--          SELECT relrowsecurity FROM pg_class WHERE relname = 'ia_sugestoes_log';   -- true
-- [ ] 3. Só as duas policies, ambas para authenticated:
--          SELECT policyname, roles, cmd FROM pg_policies WHERE tablename = 'ia_sugestoes_log';
-- [ ] 4. No app, logada: criar um alerta com uma descrição que gere sugestão de
--        sistema e salvar. Depois:
--          SELECT campo, sugestao, confianca, valor_final, criado_em
--          FROM ia_sugestoes_log ORDER BY criado_em DESC LIMIT 5;
--        Deve aparecer uma linha por campo que tinha sugestão na hora de salvar.
-- [ ] 5. O alerta foi criado normalmente (a medição nunca pode travar o cadastro).

-- ============================================================================
-- CONSULTA DA RÉGUA — taxa de acerto por campo
-- "aceitas" = o profissional salvou exatamente o que a IA sugeriu.
-- ============================================================================
-- SELECT
--   campo,
--   CASE WHEN confianca >= 0.9 THEN 'alta' ELSE 'media' END           AS seguranca,
--   count(*)                                                          AS sugestoes,
--   count(*) FILTER (WHERE valor_final = sugestao)                    AS aceitas,
--   round(100.0 * count(*) FILTER (WHERE valor_final = sugestao) / count(*), 1) AS pct_aceitas
-- FROM ia_sugestoes_log
-- GROUP BY 1, 2
-- ORDER BY 1, 2;
--
-- Divergências, para a revisão clínica:
-- SELECT campo, sugestao, valor_final, confianca, criado_em
-- FROM ia_sugestoes_log
-- WHERE valor_final IS DISTINCT FROM sugestao AND confianca >= 0.9
-- ORDER BY criado_em DESC;

-- ============================================================================
-- ROLLBACK (desfaz tudo; o app volta a funcionar sem medir)
-- ============================================================================
-- DROP TABLE IF EXISTS ia_sugestoes_log;
