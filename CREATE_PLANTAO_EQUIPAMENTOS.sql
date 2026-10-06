-- ============================================================================
-- CREATE_PLANTAO_EQUIPAMENTOS.sql
-- Registro de "Problemas com equipamento?" da tela de Análises (aba Agora).
-- Cada registro diz se houve inconformidade ou pane de equipamento no plantão
-- e, se houve, qual foi.
--
-- SEGURO: cria tabela nova, não toca em nada existente.
-- RLS ligada desde o início, policy SÓ para authenticated (nunca anon).
-- Histórico imutável: apenas SELECT e INSERT. Registro errado se corrige com
-- um registro novo, o anterior continua no histórico.
--
-- Rodar UMA ETAPA POR VEZ e conferir o checklist no fim antes de usar.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- ETAPA 1 — Tabela
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS plantao_equipamentos (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registrado_em       TIMESTAMPTZ NOT NULL DEFAULT now(),
  registrado_por      UUID,
  registrado_por_nome TEXT,                 -- nome no momento do registro (auditoria)

  houve_problema      BOOLEAN NOT NULL,     -- false = todos os equipamentos normais
  descricao           TEXT,                 -- equipamento e defeito

  -- Quem marca problema precisa descrever qual foi
  CONSTRAINT plantao_equipamentos_descricao_check
    CHECK (houve_problema = false OR length(trim(coalesce(descricao, ''))) > 0)
);

CREATE INDEX IF NOT EXISTS idx_plantao_equipamentos_registrado_em
  ON plantao_equipamentos (registrado_em DESC);

-- ----------------------------------------------------------------------------
-- ETAPA 2 — RLS (rodar logo depois da etapa 1)
-- ----------------------------------------------------------------------------
ALTER TABLE plantao_equipamentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_plantao_equipamentos" ON plantao_equipamentos;
CREATE POLICY "authenticated_select_plantao_equipamentos"
  ON plantao_equipamentos FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_plantao_equipamentos" ON plantao_equipamentos;
CREATE POLICY "authenticated_insert_plantao_equipamentos"
  ON plantao_equipamentos FOR INSERT TO authenticated WITH CHECK (true);

-- Sem UPDATE e sem DELETE: registro de plantão não se altera nem se apaga.
-- Nada para anon: sem GRANT e sem policy.

-- ============================================================================
-- CHECKLIST DE TESTE (rodar depois de aplicar)
-- ============================================================================
-- 1) Tabela criada e RLS ligada (rowsecurity deve ser true):
--    SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'plantao_equipamentos';
--
-- 2) Só existem as duas policies, ambas para authenticated:
--    SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'plantao_equipamentos';
--
-- 3) anon não tem nenhum privilégio (deve voltar zero linhas):
--    SELECT grantee, privilege_type FROM information_schema.role_table_grants
--    WHERE table_name = 'plantao_equipamentos' AND grantee = 'anon';
--    Se voltar alguma linha: REVOKE ALL ON plantao_equipamentos FROM anon;
--
-- 4) No app, logado: Análises > aba Agora > "Problemas com equipamento?".
--    Registrar "todos normais" e depois um problema com descrição; os dois
--    devem aparecer na lista com seu nome e horário.
--
-- 5) A regra da descrição funciona (deve dar erro de CHECK):
--    INSERT INTO plantao_equipamentos (houve_problema, descricao) VALUES (true, '   ');

-- ============================================================================
-- ROLLBACK (desfaz tudo; apaga os registros feitos)
-- ============================================================================
-- DROP TABLE IF EXISTS plantao_equipamentos;
