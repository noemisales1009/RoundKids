-- =====================================================
-- 🔍 DESCOBRIR QUAL É O USUÁRIO DO NOEMI
-- =====================================================

-- 1️⃣ Ver TODOS os usuários com seus IDs
SELECT id, email, name, role FROM public.users ORDER BY created_at DESC;

-- 2️⃣ Procurar por "noemi" (case-insensitive)
SELECT id, email, name, role FROM public.users 
WHERE LOWER(email) LIKE '%noemi%' 
   OR LOWER(name) LIKE '%noemi%';

-- 3️⃣ Ver os 5 usuários mais recentes
SELECT id, email, name, role, created_at FROM public.users 
ORDER BY created_at DESC 
LIMIT 5;

-- 4️⃣ Ver quantos usuários têm cada role
SELECT role, COUNT(*) as quantidade FROM public.users GROUP BY role;

-- =====================================================
-- Se encontrar o email do Noemi acima, pode executar:
-- =====================================================

-- Atualizar o nome de um usuário específico (substitua os valores):
-- UPDATE public.users 
-- SET name = 'Noemi Sales' 
-- WHERE email = 'noemi-email@example.com';

-- =====================================================
-- Ver também qual sessão está ativa no Supabase:
-- =====================================================

-- Ver usuários do auth
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 10;

