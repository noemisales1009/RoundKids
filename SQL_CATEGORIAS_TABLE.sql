CREATE TABLE public.categorias (
  id SERIAL NOT NULL,
  nome TEXT NOT NULL,
  icone TEXT NULL,
  ordem INTEGER NULL,
  CONSTRAINT categorias_pkey PRIMARY KEY (id),
  CONSTRAINT categorias_nome_key UNIQUE (nome)
) TABLESPACE pg_default;

-- Índice para melhor performance ao ordenar
CREATE INDEX idx_categorias_ordem ON public.categorias(ordem);

-- RLS (Row Level Security)
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura para todos
CREATE POLICY "Categorias são públicas (leitura)" ON public.categorias
  FOR SELECT
  USING (true);

-- Política para permitir apenas admin fazer alterações
CREATE POLICY "Apenas admin pode editar categorias" ON public.categorias
  FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Apenas admin pode deletar categorias" ON public.categorias
  FOR DELETE
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Apenas admin pode inserir categorias" ON public.categorias
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');
