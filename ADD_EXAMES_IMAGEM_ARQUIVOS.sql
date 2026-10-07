-- ============================================================================
-- ADD_EXAMES_IMAGEM_ARQUIVOS.sql
-- Anexar imagens (foto do raio-X, print do laudo...) ao exame de imagem.
--
-- As imagens ficam no Storage, num bucket PRIVADO ("exames-imagem"), e a linha
-- do exame guarda os caminhos dos arquivos na coluna nova `imagens`.
-- São imagens de paciente: só usuário logado envia e vê, sempre por link
-- assinado e temporário. Nada para anon.
--
-- SEGURO: coluna nova (NULL, sem default) e bucket novo; não toca em nada
-- existente. Enquanto isto não for rodado, o cadastro de exame continua
-- funcionando sem imagem; quem tentar anexar recebe mensagem de erro e o
-- exame não é salvo pela metade.
--
-- Rodar uma etapa de cada vez no SQL Editor do Supabase.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- ETAPA 1 — Coluna com os caminhos das imagens
-- ----------------------------------------------------------------------------
ALTER TABLE public.exames_imagem_pacientes
  ADD COLUMN IF NOT EXISTS imagens text[];

-- ----------------------------------------------------------------------------
-- ETAPA 2 — Bucket privado, só imagem, até 10 MB por arquivo
-- (o app já reduz a foto antes de enviar; o limite é só uma trava)
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('exames-imagem', 'exames-imagem', false, 10485760,
        ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- ETAPA 3 — Permissões dos arquivos: só usuário logado, só neste bucket
-- Ver, enviar e apagar (apagar é usado quando a imagem é tirada do exame).
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "authenticated_select_exames_imagem_arquivos" ON storage.objects;
CREATE POLICY "authenticated_select_exames_imagem_arquivos"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'exames-imagem');

DROP POLICY IF EXISTS "authenticated_insert_exames_imagem_arquivos" ON storage.objects;
CREATE POLICY "authenticated_insert_exames_imagem_arquivos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'exames-imagem');

DROP POLICY IF EXISTS "authenticated_delete_exames_imagem_arquivos" ON storage.objects;
CREATE POLICY "authenticated_delete_exames_imagem_arquivos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'exames-imagem');

-- ============================================================================
-- CHECKLIST DE TESTE
-- ============================================================================
-- [ ] 1. Coluna criada, NULL nos exames antigos:
--          SELECT exame, imagens FROM exames_imagem_pacientes ORDER BY created_at DESC LIMIT 5;
-- [ ] 2. Bucket privado:
--          SELECT id, public, file_size_limit FROM storage.buckets WHERE id = 'exames-imagem';   -- public = false
-- [ ] 3. Três policies, todas para authenticated:
--          SELECT policyname, roles, cmd FROM pg_policies
--          WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname LIKE '%exames_imagem%';
-- [ ] 4. No app: Exame de Imagem > Cadastrar > escolher exame > Adicionar > escolher
--        uma foto > Salvar. A miniatura aparece no cartão do exame; clicar amplia.
-- [ ] 5. Editar o exame, tirar a imagem (x vermelho) e salvar: a miniatura some.
--          SELECT name FROM storage.objects WHERE bucket_id = 'exames-imagem';   -- arquivo apagado
-- [ ] 6. Cadastrar um exame SEM imagem continua funcionando como antes.

-- ============================================================================
-- ROLLBACK
-- ============================================================================
-- DROP POLICY IF EXISTS "authenticated_select_exames_imagem_arquivos" ON storage.objects;
-- DROP POLICY IF EXISTS "authenticated_insert_exames_imagem_arquivos" ON storage.objects;
-- DROP POLICY IF EXISTS "authenticated_delete_exames_imagem_arquivos" ON storage.objects;
-- Apagar os arquivos e o bucket pelo painel: Storage > exames-imagem > Delete bucket.
-- ALTER TABLE public.exames_imagem_pacientes DROP COLUMN IF EXISTS imagens;
