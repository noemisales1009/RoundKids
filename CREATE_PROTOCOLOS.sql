-- ============================================================================
-- CREATE_PROTOCOLOS.sql
-- Protocolos institucionais para consulta durante o round.
--
-- Os PDFs ficam no Storage (bucket privado "protocolos") e esta tabela guarda o
-- cadastro: título, quando usar e o caminho do arquivo. Na pergunta do round, a
-- IA lê o título e o "quando_usar" de cada protocolo para sugerir os que tratam
-- do assunto da pergunta. Por isso o campo quando_usar deve ser bem escrito.
--
-- O cadastro é feito direto no Supabase (não há tela de cadastro no app).
--
-- SEGURO: cria tabela e bucket novos, não toca em nada existente.
-- RLS ligada desde o início, SÓ leitura e SÓ para authenticated (nunca anon).
-- Enquanto a tabela não existir, o app mostra "Nenhum protocolo cadastrado".
--
-- Rodar uma etapa de cada vez no SQL Editor do Supabase.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- ETAPA 1 — Tabela
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS protocolos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT now(),

  titulo        TEXT NOT NULL,     -- ex.: "Protocolo de Nutrição Enteral"

  -- Em que situação a equipe consulta este protocolo, em 1 ou 2 frases.
  -- É o que a IA lê para decidir se o protocolo serve para a pergunta.
  -- ex.: "Início e progressão de dieta enteral, pausas e intolerância alimentar"
  quando_usar   TEXT,

  -- Sistema do round a que pertence (categorias.id). Opcional: só serve para
  -- ordenar a lista completa. Sem FK, para não depender do tipo de categorias.id.
  categoria_id  BIGINT,

  -- Caminho do arquivo dentro do bucket "protocolos". ex.: "nutricao-enteral.pdf"
  arquivo_path  TEXT NOT NULL,

  ativo         BOOLEAN NOT NULL DEFAULT true   -- false = some do app sem apagar
);

-- ----------------------------------------------------------------------------
-- ETAPA 2 — RLS da tabela (rodar logo depois da etapa 1)
-- Usuário logado só lê. Ninguém grava pelo app: o cadastro é pelo painel.
-- ----------------------------------------------------------------------------
ALTER TABLE protocolos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_protocolos" ON protocolos;
CREATE POLICY "authenticated_select_protocolos"
  ON protocolos
  FOR SELECT
  TO authenticated
  USING (true);

GRANT SELECT ON protocolos TO authenticated;

-- Nada para anon: sem GRANT e sem policy.

-- ----------------------------------------------------------------------------
-- ETAPA 3 — Bucket privado para os PDFs
-- public = false: o arquivo só abre por link assinado, gerado para quem está logado.
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('protocolos', 'protocolos', false)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- ETAPA 4 — Leitura dos arquivos só para usuário logado
-- Sem policy de INSERT/UPDATE/DELETE: o upload é feito pelo painel do Supabase.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "authenticated_select_protocolos_arquivos" ON storage.objects;
CREATE POLICY "authenticated_select_protocolos_arquivos"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'protocolos');

-- ============================================================================
-- COMO CADASTRAR UM PROTOCOLO
-- ============================================================================
-- 1. Painel do Supabase > Storage > bucket "protocolos" > Upload do PDF.
--    Usar nome de arquivo sem acento e sem espaço (ex.: nutricao-enteral.pdf).
-- 2. Conferir o id do sistema:
--      SELECT id, nome FROM categorias ORDER BY ordem;
-- 3. Inserir o cadastro (arquivo_path = nome do arquivo no bucket):
--      INSERT INTO protocolos (titulo, quando_usar, categoria_id, arquivo_path)
--      VALUES (
--        'Protocolo de Nutrição Enteral',
--        'Início e progressão de dieta enteral, pausas e intolerância alimentar',
--        1,
--        'nutricao-enteral.pdf'
--      );

-- ============================================================================
-- CHECKLIST DE TESTE
-- ============================================================================
-- [ ] 1. Depois das etapas 1 e 2 — tabela existe, vazia, com RLS:
--          SELECT count(*) FROM protocolos;                                        -- 0
--          SELECT relrowsecurity FROM pg_class WHERE relname = 'protocolos';       -- true
--          SELECT policyname, roles, cmd FROM pg_policies WHERE tablename = 'protocolos';
--        Deve haver uma única policy, SELECT, para authenticated.
-- [ ] 2. Depois das etapas 3 e 4 — bucket privado:
--          SELECT id, public FROM storage.buckets WHERE id = 'protocolos';         -- public = false
-- [ ] 3. Cadastrar um protocolo de teste (upload + INSERT acima).
-- [ ] 4. No app, logada: abrir um paciente > round > um sistema > uma pergunta >
--        CONSULTAR PROTOCOLOS. O protocolo aparece e o PDF abre em nova aba.
-- [ ] 5. Deslogada (aba anônima), o link do PDF copiado deixa de abrir depois de
--        10 minutos, e a tabela não responde para anon.
-- [ ] 6. O round continua funcionando normalmente (responder, gerar alerta).

-- ============================================================================
-- ROLLBACK (desfaz tudo; o app volta a mostrar "Nenhum protocolo cadastrado")
-- ============================================================================
-- DROP POLICY IF EXISTS "authenticated_select_protocolos_arquivos" ON storage.objects;
-- Apagar os arquivos e o bucket pelo painel: Storage > protocolos > Delete bucket.
-- DROP TABLE IF EXISTS protocolos;
