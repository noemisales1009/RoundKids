-- ============================================================
-- FIND-009: exigir usuário APROVADO no RLS (não só no cliente)
--
-- Problema: hoje as policies são "TO authenticated USING (true)",
-- ou seja, QUALQUER usuário logado (inclusive um recém-criado com
-- access_level 'restrito'/'pendente', ou uma conta criada direto
-- pela API do Supabase) tem acesso total aos dados de paciente.
-- O gate de domínio e o papel 'restrito' só existem no navegador
-- (LoginScreen.tsx) e NÃO são aplicados no banco.
--
-- Objetivo: fazer o RLS só liberar dados para usuários aprovados
-- (access_level 'adm' ou 'geral'). Assim 'restrito'/'pendente'
-- viram de fato bloqueados no nível do dado.
--
-- ⚠️ RISCO: se algum usuário legítimo estiver com access_level
-- diferente de 'adm'/'geral', ele será BLOQUEADO. Rode a ETAPA 0
-- ANTES e corrija os access_level antes de aplicar a ETAPA 2.
--
-- Rode UMA ETAPA por vez. Teste o app entre elas.
-- ============================================================


-- ============================================================
-- ETAPA 0 — PRÉ-CHECAGEM (só leitura, não muda nada)
-- Veja quem seria bloqueado. Todos os usuários REAIS da equipe
-- devem estar como 'adm' ou 'geral'. Se algum aparecer como
-- 'restrito'/'pendente'/NULL e for legítimo, corrija (ETAPA 1b).
-- ============================================================
SELECT email, name, role, access_level
FROM public.users
ORDER BY access_level, email;


-- ============================================================
-- ETAPA 1a — Função is_approved() (SECURITY DEFINER p/ não recursar)
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_approved()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
      AND access_level IN ('adm', 'geral')
  );
$$;

-- ETAPA 1b — (SE a ETAPA 0 mostrou usuário legítimo bloqueado)
-- Ajuste manualmente o access_level de quem for da equipe.
-- Troque o email pelo real. NÃO promova ninguém a 'adm' sem querer.
-- UPDATE public.users SET access_level = 'geral' WHERE email = 'fulano@roundikids.com';


-- ============================================================
-- ETAPA 2 — PILOTO na tabela patients
-- Substitui a policy aberta por uma que exige usuário aprovado.
-- Teste MUITO bem antes de estender às demais tabelas (ETAPA 3).
-- ============================================================

-- >>> APLICAR <<<
DROP POLICY IF EXISTS "patients_authenticated_only" ON public.patients;
CREATE POLICY "patients_approved_only"
  ON public.patients
  FOR ALL
  TO authenticated
  USING (public.is_approved())
  WITH CHECK (public.is_approved());

-- >>> ROLLBACK DA ETAPA 2 (só se travar) <<<
-- DROP POLICY IF EXISTS "patients_approved_only" ON public.patients;
-- CREATE POLICY "patients_authenticated_only" ON public.patients
--   FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- CHECKLIST DE TESTE:
--   [ ] Login com SEU usuário (aprovado) -> Dashboard carrega os pacientes
--   [ ] Criar/editar paciente funciona
--   [ ] (Opcional) Um usuário 'restrito' NÃO vê a lista de pacientes


-- ============================================================
-- ETAPA 3 — Estender o mesmo padrão às demais tabelas clínicas
-- Só faça depois que a ETAPA 2 estiver validada.
-- Repita o bloco abaixo trocando o nome da tabela e da policy.
-- (peça pro assistente gerar a lista completa quando chegar aqui)
-- ============================================================
-- Exemplo para triagem_ipcs_pacientes:
-- DROP POLICY IF EXISTS "Permitir acesso ao app (triagem_ipcs)" ON public.triagem_ipcs_pacientes;
-- CREATE POLICY "triagem_ipcs_approved" ON public.triagem_ipcs_pacientes
--   FOR ALL TO authenticated
--   USING (public.is_approved()) WITH CHECK (public.is_approved());
