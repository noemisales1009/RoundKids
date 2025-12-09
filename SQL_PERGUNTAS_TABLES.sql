-- Tabela: perguntas
-- Descrição: Armazena as perguntas do checklist organizadas por categoria
CREATE TABLE public.perguntas (
  id SERIAL NOT NULL,
  texto TEXT NOT NULL,
  categoria_id INTEGER NULL,
  ordem INTEGER NOT NULL,
  CONSTRAINT perguntas_pkey PRIMARY KEY (id),
  CONSTRAINT perguntas_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES categorias (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Índices para melhor performance
CREATE INDEX idx_perguntas_categoria_id ON public.perguntas(categoria_id);
CREATE INDEX idx_perguntas_ordem ON public.perguntas(ordem);

-- RLS (Row Level Security)
ALTER TABLE public.perguntas ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura para todos
CREATE POLICY "Perguntas são públicas (leitura)" ON public.perguntas
  FOR SELECT
  USING (true);

-- Política para permitir apenas admin fazer alterações
CREATE POLICY "Apenas admin pode editar perguntas" ON public.perguntas
  FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Apenas admin pode deletar perguntas" ON public.perguntas
  FOR DELETE
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Apenas admin pode inserir perguntas" ON public.perguntas
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');


-- Tabela: pergunta_opcoes
-- Descrição: Armazena as opções de resposta para cada pergunta
CREATE TABLE public.pergunta_opcoes (
  id SERIAL NOT NULL,
  pergunta_id INTEGER NOT NULL,
  codigo TEXT NOT NULL,
  label TEXT NOT NULL,
  has_input BOOLEAN NOT NULL DEFAULT false,
  input_placeholder TEXT NULL,
  ordem INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT pergunta_opcoes_pkey PRIMARY KEY (id),
  CONSTRAINT pergunta_opcoes_pergunta_id_fkey FOREIGN KEY (pergunta_id) REFERENCES perguntas (id) ON DELETE CASCADE,
  CONSTRAINT pergunta_opcoes_cod_uniq UNIQUE (pergunta_id, codigo)
) TABLESPACE pg_default;

-- Índices para melhor performance
CREATE INDEX idx_pergunta_opcoes_pergunta_id ON public.pergunta_opcoes(pergunta_id);
CREATE INDEX idx_pergunta_opcoes_ordem ON public.pergunta_opcoes(ordem);

-- RLS (Row Level Security)
ALTER TABLE public.pergunta_opcoes ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura para todos
CREATE POLICY "Opções de perguntas são públicas (leitura)" ON public.pergunta_opcoes
  FOR SELECT
  USING (true);

-- Política para permitir apenas admin fazer alterações
CREATE POLICY "Apenas admin pode editar opções de perguntas" ON public.pergunta_opcoes
  FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Apenas admin pode deletar opções de perguntas" ON public.pergunta_opcoes
  FOR DELETE
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Apenas admin pode inserir opções de perguntas" ON public.pergunta_opcoes
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');
