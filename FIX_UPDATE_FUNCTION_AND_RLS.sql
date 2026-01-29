-- Criar a função update_updated_at_column que está faltando
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Verificar se a RLS policy em 'patients' está bloqueando UPDATE
-- Se houver RLS ativa, precisa permitir UPDATE para o usuário logado
-- Desabilitar RLS temporariamente para testar salvamento
ALTER TABLE public.patients DISABLE ROW LEVEL SECURITY;

-- Se precisar ativar novamente, use:
-- ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
-- E depois crie as policies corretas
