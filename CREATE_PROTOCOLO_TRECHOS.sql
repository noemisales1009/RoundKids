-- ============================================================================
-- CREATE_PROTOCOLO_TRECHOS.sql
-- Conteúdo dos protocolos institucionais, em trechos, para a busca por dúvida.
--
-- Na tela de protocolos o profissional digita uma dúvida. A IA escolhe quais
-- trechos respondem e o app mostra o TEXTO DO TRECHO, como está aqui, com um
-- link para a página do PDF. A IA não escreve resposta nenhuma.
--
-- Por isso o texto de cada trecho precisa ser fiel ao PDF: o que está nesta
-- tabela é o que a equipe vai ler.
--
-- ANTES: rodar CREATE_PROTOCOLOS.sql e CADASTRAR_PROTOCOLOS_INICIAIS.sql.
--
-- SEGURO: cria tabela nova, não toca em nada existente.
-- RLS ligada desde o início, SÓ leitura e SÓ para authenticated (nunca anon).
-- Enquanto a tabela não existir, a busca avisa que não respondeu e a lista de
-- protocolos continua funcionando.
--
-- Rodar uma etapa de cada vez no SQL Editor do Supabase.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- ETAPA 1 — Tabela
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS protocolo_trechos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocolo_id  UUID NOT NULL REFERENCES protocolos(id) ON DELETE CASCADE,
  ordem         INT  NOT NULL,   -- posição do trecho dentro do protocolo
  pagina        INT  NOT NULL,   -- página do PDF onde o trecho começa
  titulo        TEXT NOT NULL,   -- nome da seção
  texto         TEXT NOT NULL,   -- transcrição do PDF (até ~1500 caracteres)
  UNIQUE (protocolo_id, ordem)
);

-- ----------------------------------------------------------------------------
-- ETAPA 2 — RLS (rodar logo depois da etapa 1)
-- Usuário logado só lê. Ninguém grava pelo app: o cadastro é pelo painel.
-- ----------------------------------------------------------------------------
ALTER TABLE protocolo_trechos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_protocolo_trechos" ON protocolo_trechos;
CREATE POLICY "authenticated_select_protocolo_trechos"
  ON protocolo_trechos
  FOR SELECT
  TO authenticated
  USING (true);

GRANT SELECT ON protocolo_trechos TO authenticated;

-- Nada para anon: sem GRANT e sem policy.

-- ============================================================================
-- CHECKLIST DE TESTE
-- ============================================================================
-- [ ] 1. Tabela existe, vazia, com RLS:
--          SELECT count(*) FROM protocolo_trechos;                                    -- 0
--          SELECT relrowsecurity FROM pg_class WHERE relname = 'protocolo_trechos';   -- true
--          SELECT policyname, roles, cmd FROM pg_policies WHERE tablename = 'protocolo_trechos';
--        Deve haver uma única policy, SELECT, para authenticated.
-- [ ] 2. Rodar CADASTRAR_TRECHOS_INICIAIS.sql e seguir o checklist de lá.

-- ============================================================================
-- ROLLBACK (a busca por dúvida para de achar trechos; o resto segue igual)
-- ============================================================================
-- DROP TABLE IF EXISTS protocolo_trechos;
