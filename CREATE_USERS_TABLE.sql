-- =====================================================
-- CRIAR TABELA DE USUÁRIOS SE NÃO EXISTIR
-- =====================================================

-- Criar tabela de usuários com as mesmas colunas esperadas pelo código
CREATE TABLE IF NOT EXISTS public.users (
    id UUID NOT NULL DEFAULT auth.uid() PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'Médica',
    foto TEXT,
    sector TEXT,
    access_level TEXT DEFAULT 'geral' CHECK (access_level IN ('adm', 'geral')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice no email para melhor performance
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users(email);

-- Criar política de segurança RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Usuários podem ler seus próprios dados
CREATE POLICY "users_can_read_own" 
    ON public.users 
    FOR SELECT 
    USING (auth.uid() = id);

-- Usuários podem atualizar seus próprios dados
CREATE POLICY "users_can_update_own" 
    ON public.users 
    FOR UPDATE 
    USING (auth.uid() = id);

-- Admins podem ler todos os dados
CREATE POLICY "admins_can_read_all" 
    ON public.users 
    FOR SELECT 
    USING (
        (SELECT access_level FROM public.users WHERE id = auth.uid()) = 'adm'
    );

-- Função para atualizar `updated_at` automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar `updated_at` quando modificar um usuário
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMENTÁRIOS PARA REFERÊNCIA
-- =====================================================
-- Esta tabela é usada para armazenar informações adicionais dos usuários
-- que não são armazenadas no auth.users do Supabase
-- 
-- Colunas:
-- - id: UUID do usuário (referencia auth.users)
-- - email: Email único do usuário
-- - name: Nome completo do usuário
-- - role: Cargo/profissão (ex: 'Médica', 'Fisioterapeuta')
-- - foto: URL da foto do usuário
-- - sector: Setor onde trabalha
-- - access_level: Nível de acesso ('adm' para administrador, 'geral' para usuário comum)
-- - created_at: Data de criação
-- - updated_at: Data da última atualização
