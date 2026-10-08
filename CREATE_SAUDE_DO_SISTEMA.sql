-- ============================================================================
-- CREATE_SAUDE_DO_SISTEMA.sql
-- Dados da tela "Saúde do sistema" (só administrador):
--   1. app_erros            — erros que acontecem no uso do aplicativo
--   2. tamanhos_do_sistema  — quanto cada tabela e cada pasta de arquivos ocupa
--
-- O que app_erros guarda: quando, quem, em que tela, de que tipo e a mensagem
-- do erro. A tela é gravada sem os números da rota ("/patient/:id"), então não
-- carrega o identificador do paciente. A mensagem é a que o aplicativo mostrou;
-- como uma mensagem do banco pode, em casos raros, citar um valor digitado, a
-- LEITURA é só para administrador.
--
-- SEGURO: cria tabela e função novas, não toca em nada existente.
-- RLS ligada desde o início. Nada para anon.
-- Enquanto isto não for rodado, o aplicativo funciona normalmente e só não
-- registra; a tela Saúde do sistema avisa que os dados não estão disponíveis.
--
-- Depende de public.is_admin_user(), já usada em outras tabelas. Conferir antes:
--   SELECT public.is_admin_user();     -- logada como admin no app, devolve true;
--                                      -- no SQL Editor devolve false (sem usuário)
--
-- Rodar uma etapa de cada vez no SQL Editor do Supabase.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- ETAPA 1 — Tabela de erros
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.app_erros (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT now(),
  criado_por  UUID DEFAULT auth.uid(),

  -- mensagem     = mensagem vermelha mostrada ao usuário
  -- tela_quebrou = uma tela parou de funcionar (página de erro)
  -- nao_tratado  = erro que escapou de qualquer tratamento
  origem      TEXT NOT NULL,
  tela        TEXT NOT NULL,     -- rota sem números, ex.: /patient/:id
  mensagem    TEXT NOT NULL      -- até 500 caracteres
);

CREATE INDEX IF NOT EXISTS idx_app_erros_criado_em ON public.app_erros (criado_em DESC);

-- ----------------------------------------------------------------------------
-- ETAPA 2 — RLS (rodar logo depois da etapa 1)
-- Qualquer usuário logado grava a própria linha. Só administrador lê.
-- Ninguém altera nem apaga pelo aplicativo.
-- ----------------------------------------------------------------------------
ALTER TABLE public.app_erros ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_insert_app_erros" ON public.app_erros;
CREATE POLICY "authenticated_insert_app_erros"
  ON public.app_erros FOR INSERT TO authenticated
  WITH CHECK (criado_por = auth.uid());

DROP POLICY IF EXISTS "admin_select_app_erros" ON public.app_erros;
CREATE POLICY "admin_select_app_erros"
  ON public.app_erros FOR SELECT TO authenticated
  USING (public.is_admin_user());

GRANT SELECT, INSERT ON public.app_erros TO authenticated;

-- Nada para anon: sem GRANT e sem policy.

-- ----------------------------------------------------------------------------
-- ETAPA 3 — Função que devolve os tamanhos (só administrador)
-- Lê os catálogos do banco, por isso roda com permissão própria (SECURITY
-- DEFINER); a primeira linha recusa quem não é administrador.
-- "registros" é a estimativa do banco, não uma contagem exata.
-- A linha tipo 'banco' traz o tamanho total, usado para mostrar o espaço livre.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.tamanhos_do_sistema()
RETURNS TABLE (tipo TEXT, nome TEXT, registros BIGINT, bytes BIGINT)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  IF NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'Acesso restrito a administradores';
  END IF;

  RETURN QUERY
    SELECT 'tabela'::TEXT, c.relname::TEXT,
           GREATEST(c.reltuples, 0)::BIGINT,
           pg_total_relation_size(c.oid)::BIGINT
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'r'
    UNION ALL
    SELECT 'arquivos'::TEXT, o.bucket_id::TEXT,
           COUNT(*)::BIGINT,
           COALESCE(SUM((o.metadata->>'size')::BIGINT), 0)::BIGINT
    FROM storage.objects o
    GROUP BY o.bucket_id
    UNION ALL
    -- Tamanho total do banco, como o Supabase conta para o limite do plano
    -- (inclui as tabelas internas, por isso é maior que a soma das tabelas acima)
    SELECT 'banco'::TEXT, 'total'::TEXT, 0::BIGINT,
           pg_database_size(current_database())::BIGINT;
END;
$$;

REVOKE ALL ON FUNCTION public.tamanhos_do_sistema() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.tamanhos_do_sistema() FROM anon;
GRANT EXECUTE ON FUNCTION public.tamanhos_do_sistema() TO authenticated;

-- ============================================================================
-- CHECKLIST DE TESTE
-- ============================================================================
-- [ ] 1. Depois das etapas 1 e 2 — tabela vazia, com RLS e duas policies:
--          SELECT count(*) FROM app_erros;                                       -- 0
--          SELECT relrowsecurity FROM pg_class WHERE relname = 'app_erros';      -- true
--          SELECT policyname, roles, cmd FROM pg_policies WHERE tablename = 'app_erros';
-- [ ] 2. Depois da etapa 3 — a função existe e anon não executa:
--          SELECT has_function_privilege('anon', 'public.tamanhos_do_sistema()', 'execute');           -- false
--          SELECT has_function_privilege('authenticated', 'public.tamanhos_do_sistema()', 'execute');  -- true
-- [ ] 3. No app, logada como administradora: menu Saúde do sistema. Aparecem o
--        espaço usado e livre do plano e os tamanhos das tabelas e dos arquivos.
--        Conferir o "usado" do banco com o painel: Database > Database size.
-- [ ] 4. Provocar uma mensagem vermelha de erro no app (qualquer uma) e atualizar
--        a tela Saúde do sistema: o erro aparece na lista.
-- [ ] 5. Com uma conta que NÃO é administradora: o menu não aparece e
--          SELECT count(*) FROM app_erros;   -- pelo app, devolve 0 linhas
-- [ ] 6. O restante do aplicativo segue funcionando normalmente.

-- Limpeza periódica (opcional; rodar à mão quando quiser):
--   DELETE FROM app_erros WHERE criado_em < now() - interval '90 days';

-- ============================================================================
-- ROLLBACK (o app volta a funcionar sem registrar erros)
-- ============================================================================
-- DROP FUNCTION IF EXISTS public.tamanhos_do_sistema();
-- DROP TABLE IF EXISTS public.app_erros;
