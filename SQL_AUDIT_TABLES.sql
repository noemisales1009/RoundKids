-- Tabela de auditoria para Perguntas
CREATE TABLE public.perguntas_audit (
  id SERIAL NOT NULL,
  pergunta_id INTEGER NOT NULL,
  texto_antigo TEXT,
  texto_novo TEXT,
  categoria_id_antigo INTEGER,
  categoria_id_novo INTEGER,
  ordem_antigo INTEGER,
  ordem_novo INTEGER,
  tipo_operacao VARCHAR(10) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
  usuario_id UUID,
  data_alteracao TIMESTAMP NOT NULL DEFAULT NOW(),
  ip_address VARCHAR(50),
  CONSTRAINT perguntas_audit_pkey PRIMARY KEY (id),
  CONSTRAINT perguntas_audit_pergunta_id_fkey FOREIGN KEY (pergunta_id) REFERENCES perguntas (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Tabela de auditoria para Opções de Perguntas
CREATE TABLE public.pergunta_opcoes_audit (
  id SERIAL NOT NULL,
  opcao_id INTEGER NOT NULL,
  pergunta_id INTEGER NOT NULL,
  codigo_antigo TEXT,
  codigo_novo TEXT,
  label_antigo TEXT,
  label_novo TEXT,
  has_input_antigo BOOLEAN,
  has_input_novo BOOLEAN,
  input_placeholder_antigo TEXT,
  input_placeholder_novo TEXT,
  ordem_antigo INTEGER,
  ordem_novo INTEGER,
  tipo_operacao VARCHAR(10) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
  usuario_id UUID,
  data_alteracao TIMESTAMP NOT NULL DEFAULT NOW(),
  ip_address VARCHAR(50),
  CONSTRAINT pergunta_opcoes_audit_pkey PRIMARY KEY (id),
  CONSTRAINT pergunta_opcoes_audit_opcao_id_fkey FOREIGN KEY (opcao_id) REFERENCES pergunta_opcoes (id) ON DELETE CASCADE,
  CONSTRAINT pergunta_opcoes_audit_pergunta_id_fkey FOREIGN KEY (pergunta_id) REFERENCES perguntas (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Índices para melhor performance
CREATE INDEX idx_perguntas_audit_pergunta_id ON public.perguntas_audit(pergunta_id);
CREATE INDEX idx_perguntas_audit_data ON public.perguntas_audit(data_alteracao DESC);
CREATE INDEX idx_perguntas_audit_usuario ON public.perguntas_audit(usuario_id);

CREATE INDEX idx_pergunta_opcoes_audit_opcao_id ON public.pergunta_opcoes_audit(opcao_id);
CREATE INDEX idx_pergunta_opcoes_audit_pergunta_id ON public.pergunta_opcoes_audit(pergunta_id);
CREATE INDEX idx_pergunta_opcoes_audit_data ON public.pergunta_opcoes_audit(data_alteracao DESC);
CREATE INDEX idx_pergunta_opcoes_audit_usuario ON public.pergunta_opcoes_audit(usuario_id);

-- RLS (Row Level Security) - Exemplo de política (adaptar conforme necessário)
ALTER TABLE public.perguntas_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pergunta_opcoes_audit ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura apenas para admin
CREATE POLICY "Apenas admin pode ver auditoria de perguntas" ON public.perguntas_audit
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Apenas admin pode ver auditoria de opções" ON public.pergunta_opcoes_audit
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

-- Função para log automático (trigger) - Perguntas
CREATE OR REPLACE FUNCTION log_perguntas_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO perguntas_audit (pergunta_id, texto_novo, categoria_id_novo, ordem_novo, tipo_operacao, usuario_id, data_alteracao)
    VALUES (NEW.id, NEW.texto, NEW.categoria_id, NEW.ordem, 'INSERT', auth.uid(), NOW());
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO perguntas_audit (pergunta_id, texto_antigo, texto_novo, categoria_id_antigo, categoria_id_novo, ordem_antigo, ordem_novo, tipo_operacao, usuario_id, data_alteracao)
    VALUES (NEW.id, OLD.texto, NEW.texto, OLD.categoria_id, NEW.categoria_id, OLD.ordem, NEW.ordem, 'UPDATE', auth.uid(), NOW());
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO perguntas_audit (pergunta_id, texto_antigo, categoria_id_antigo, ordem_antigo, tipo_operacao, usuario_id, data_alteracao)
    VALUES (OLD.id, OLD.texto, OLD.categoria_id, OLD.ordem, 'DELETE', auth.uid(), NOW());
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger para Perguntas
CREATE TRIGGER trigger_perguntas_audit
AFTER INSERT OR UPDATE OR DELETE ON perguntas
FOR EACH ROW EXECUTE FUNCTION log_perguntas_changes();

-- Função para log automático (trigger) - Opções
CREATE OR REPLACE FUNCTION log_pergunta_opcoes_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO pergunta_opcoes_audit (opcao_id, pergunta_id, codigo_novo, label_novo, has_input_novo, input_placeholder_novo, ordem_novo, tipo_operacao, usuario_id, data_alteracao)
    VALUES (NEW.id, NEW.pergunta_id, NEW.codigo, NEW.label, NEW.has_input, NEW.input_placeholder, NEW.ordem, 'INSERT', auth.uid(), NOW());
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO pergunta_opcoes_audit (opcao_id, pergunta_id, codigo_antigo, codigo_novo, label_antigo, label_novo, has_input_antigo, has_input_novo, input_placeholder_antigo, input_placeholder_novo, ordem_antigo, ordem_novo, tipo_operacao, usuario_id, data_alteracao)
    VALUES (NEW.id, NEW.pergunta_id, OLD.codigo, NEW.codigo, OLD.label, NEW.label, OLD.has_input, NEW.has_input, OLD.input_placeholder, NEW.input_placeholder, OLD.ordem, NEW.ordem, 'UPDATE', auth.uid(), NOW());
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO pergunta_opcoes_audit (opcao_id, pergunta_id, codigo_antigo, label_antigo, has_input_antigo, input_placeholder_antigo, ordem_antigo, tipo_operacao, usuario_id, data_alteracao)
    VALUES (OLD.id, OLD.pergunta_id, OLD.codigo, OLD.label, OLD.has_input, OLD.input_placeholder, OLD.ordem, 'DELETE', auth.uid(), NOW());
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger para Opções
CREATE TRIGGER trigger_pergunta_opcoes_audit
AFTER INSERT OR UPDATE OR DELETE ON pergunta_opcoes
FOR EACH ROW EXECUTE FUNCTION log_pergunta_opcoes_changes();
