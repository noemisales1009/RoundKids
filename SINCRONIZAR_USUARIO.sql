-- =====================================================
-- 🎯 SINCRONIZAR USUÁRIO AUTENTICADO COM TABELA users
-- =====================================================
-- Depois que você executar ENCONTRAR_USUARIO_NOEMI.sql,
-- compartilha comigo o resultado para eu saber qual é seu email
-- 
-- Então execute este script com SEU email:
-- =====================================================

-- PASSO 1: Ver qual é seu email no auth.users
SELECT id, email, created_at FROM auth.users WHERE role = 'authenticated' LIMIT 10;

-- PASSO 2: Procurar seu email na tabela users
-- (Substitua 'seu@email.com' pelo seu email real)
SELECT id, email, name, role FROM public.users 
WHERE email = 'seu@email.com';

-- PASSO 3: Se não encontrar, inserir você na tabela
-- (Substitua os valores com os reais)
-- INSERT INTO public.users (id, email, name, role, access_level)
-- VALUES (
--   'SEU-UUID-DO-AUTH-AQUI',
--   'seu@email.com',
--   'SEU NOME AQUI',
--   'Médica',
--   'geral'
-- );

-- PASSO 4: Se JÁ existe, atualizar o nome
-- (Substitua os valores com os reais)
-- UPDATE public.users 
-- SET name = 'SEU NOME CORRETO'
-- WHERE email = 'seu@email.com';

-- PASSO 5: Verificar que funcionou
-- SELECT id, email, name, role FROM public.users WHERE email = 'seu@email.com';

