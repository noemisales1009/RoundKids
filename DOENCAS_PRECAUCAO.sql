-- ============================================================
-- 1. CRIAR TABELA DE DOENÇAS COM PRECAUÇÕES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.doencas_precaucao (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo_precaucao TEXT NOT NULL,
  -- Valores: 'padrao' | 'contato' | 'goticula' | 'aerossois'
  --          | 'contato_goticula' | 'contato_aerossois'
  --          | 'contato_goticula_aerossois'
  duracao_observacao TEXT NOT NULL,
  duracao_dias INTEGER NULL,
  -- NULL = duração descritiva (durante a doença, internação, etc.)
  -- número = dias fixos calculáveis a partir de data_inicio
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================
-- 2. POPULAR TABELA COM AS DOENÇAS
-- ============================================================
INSERT INTO public.doencas_precaucao (nome, tipo_precaucao, duracao_observacao, duracao_dias) VALUES
('Abscessos e úlceras (drenagem abundante)', 'contato', 'Até redução da drenagem e ficar contido no curativo. Drenagem pequena: apenas precaução padrão', NULL),
('Adenovirose', 'contato_goticula', 'Durante a doença', NULL),
('AIDS', 'padrao', 'Durante a internação. Atenção para outras infecções associadas', NULL),
('Caxumba', 'goticula', 'Até 5 dias do início da doença. Transmissão começa 6 dias antes dos sintomas', 5),
('Citomegalovirose', 'padrao', 'Durante a doença', NULL),
('Cólera', 'contato', 'Durante a doença. Se paciente incontinente ou em fralda: manter contato', NULL),
('Condilomatose', 'padrao', 'Durante a doença / até retirada da lesão', NULL),
('Conjuntivite viral', 'contato', 'Durante a doença, enquanto tiver secreção e/ou prurido', NULL),
('Conjuntivite (outras etiologias)', 'padrao', 'Durante a doença', NULL),
('Coqueluche', 'goticula', 'Até 5 dias do início do tratamento. Quarto privativo preferencial', 5),
('Covid-19', 'contato_goticula', 'Seguir fluxo da unidade. Se em VM: precaução aerossol. Quarto privativo', NULL),
('Diarreias bacterianas', 'padrao', 'Durante a doença. Se incontinente ou em fralda: precaução de contato', NULL),
('Diarreia por rotavírus, norovírus ou Clostridium difficile', 'contato', 'Durante a doença, enquanto tiver episódios diarreicos', NULL),
('Difteria faríngea', 'goticula', 'Até término do tratamento antimicrobiano e cultura negativa', NULL),
('Doença respiratória aguda (IRA)', 'padrao', 'Em criança e adulto imunocomprometido: precaução de contato durante internação', NULL),
('Escabiose', 'contato', '24 horas após início do tratamento. Acondicionar roupa em sacos plásticos', 1),
('Escarlatina / pneumonia por Streptococcus Grupo A', 'goticula', 'Até 24 horas após início do tratamento', 1),
('Estafilococcia tegumentar', 'contato', 'Durante a doença', NULL),
('Eritema infeccioso', 'goticula', 'Desnecessário — quando surge eritema, transmissão já cessou', NULL),
('Faringite em lactente e pré-escolar', 'goticula', 'Até 24 horas após início do tratamento', 1),
('Febre tifoide', 'padrao', 'Durante a internação ou enquanto durar a doença', NULL),
('Furunculose por Staphylo', 'contato', 'Durante a internação ou enquanto durar a doença', NULL),
('Hanseníase', 'padrao', 'Durante a internação ou enquanto durar a doença', NULL),
('Hepatite A', 'padrao', 'Se incontinente ou em fralda: manter contato', NULL),
('Hepatite B, D e G', 'padrao', 'Durante a internação', NULL),
('Hepatite C', 'padrao', 'Durante a internação', NULL),
('Hepatite E', 'padrao', 'Se incontinente ou em fralda: manter contato', NULL),
('Herpes simples disseminado ou neonatal', 'contato', 'Durante a doença, até lesões secarem e formarem crostas', NULL),
('Herpes zoster localizado (imunocompetente)', 'padrao', 'Durante a internação ou enquanto durar a doença', NULL),
('Herpes zoster localizado (imunocomprometido) ou disseminado', 'contato_aerossois', 'Até cairem as crostas', NULL),
('Herpes zoster disseminado', 'contato_aerossois', 'Até cairem as crostas', NULL),
('Impetigo', 'contato', '24 horas após início do tratamento', 1),
('Infecção por Epstein-Barr / mononucleose infecciosa', 'padrao', 'Durante o cuidado assistencial', NULL),
('Infecções enterovirais (Coxsackie, vírus echo)', 'contato', 'Durante a doença. Contato especialmente para crianças que usam fralda', NULL),
('Infecções por germes multirresistentes', 'contato', 'UTI: até alta para enfermaria. Enfermaria: enquanto tiver ferida aberta ou procedimentos invasivos (traqueostomia, SVD, CVC)', NULL),
('Influenza', 'goticula', 'Durante a doença — até 7 dias após início dos sintomas e 24h afebril', 7),
('Meningite por Neisseria meningitidis', 'goticula', 'Até 24h após início do tratamento. Quarto privativo obrigatório nas primeiras 24h', 1),
('Meningite/epiglotite/pneumonia por Haemophilus influenzae', 'goticula', 'Até 24h após início do tratamento eficaz. Quarto privativo obrigatório', 1),
('Meningites (outras etiologias)', 'padrao', 'Não há necessidade de precaução específica', NULL),
('Metapneumovírus', 'contato', 'Durante a doença', NULL),
('Monkeypox', 'contato_goticula', 'Até lesões secarem e formarem crostas. Se procedimentos geradores de aerossóis: acrescentar precaução aerossol', NULL),
('Parvovirose B19', 'goticula', 'Durante a doença', NULL),
('Pediculose', 'contato', '24 horas após início do tratamento. Acondicionar roupa em sacos plásticos', 1),
('Peste pneumônica', 'goticula', 'Até 48 horas após início da antibioticoterapia eficaz', 2),
('Pneumonia por Mycoplasma pneumoniae', 'goticula', 'Durante a doença', NULL),
('Pneumonia por Burkholderia cepacie com fibrose cística', 'contato', 'Durante a internação', NULL),
('Pneumonia por VSR / Parainfluenza / Metapneumovírus', 'contato', 'Durante a internação. Restringir visitantes com sintomas respiratórios em epidemia', NULL),
('Pneumonia (outras etiologias)', 'padrao', 'Durante a internação ou enquanto durar a doença', NULL),
('Poliomielite', 'contato', 'Durante a doença', NULL),
('Rinovírus', 'goticula', 'Durante a doença. Contato se secreções úmidas abundantes (ex.: bebês)', NULL),
('Rubéola adquirida', 'goticula', 'Até o 7º dia após início do exantema', 7),
('Rubéola congênita', 'goticula', 'Até 1 ano de idade ou cultura de urina/nasofaringe negativas após 3 meses de vida', NULL),
('Sarampo', 'aerossois', 'Até o 4º dia após início do exantema. Em imunossuprimido: durante toda a doença. Transmissão começa no período prodrômico', 4),
('SRAG – Síndrome respiratória aguda grave', 'contato_goticula_aerossois', 'Duração da doença + 10 dias após resolução da febre, desde que sintomas respiratórios ausentes ou melhorando', NULL),
('Tuberculose pulmonar e laríngea', 'aerossois', 'Confirmada: suspender quando em terapia eficaz, melhora clínica e 3 baciloscopias negativas. Suspeita: suspender quando diagnóstico alternativo ou 3 BAAR negativos (amostras a cada 8–24h, ao menos 1 pela manhã)', NULL),
('Tuberculose cutânea com lesão secretante (escrofulose)', 'contato_aerossois', 'Durante a internação ou enquanto durar a doença', NULL),
('Tuberculose de outros órgãos', 'padrao', 'Habitualmente não transmissível', NULL),
('Varicela', 'contato_aerossois', 'Até todas as lesões tornarem-se crostosas. Restringir visitantes comunicantes de casos domiciliares em epidemia', NULL);

-- ============================================================
-- 3. ADICIONAR COLUNAS NA TABELA PRECAUTIONS
-- ============================================================
ALTER TABLE public.precautions
  ADD COLUMN IF NOT EXISTS doenca_id INTEGER REFERENCES public.doencas_precaucao(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS observacao TEXT,
  ADD COLUMN IF NOT EXISTS data_fim_sugerida DATE;

-- ============================================================
-- 4. ATUALIZAR CONSTRAINT DE TIPO_PRECAUCAO (aceitar combinados)
-- ============================================================
ALTER TABLE public.precautions DROP CONSTRAINT IF EXISTS precautions_tipo_precaucao_check;
ALTER TABLE public.precautions
  ADD CONSTRAINT precautions_tipo_precaucao_check
  CHECK (tipo_precaucao IN (
    'padrao', 'contato', 'goticula', 'aerossois',
    'contato_goticula', 'contato_aerossois', 'contato_goticula_aerossois'
  ));

-- ============================================================
-- 5. RLS NA NOVA TABELA
-- ============================================================
ALTER TABLE public.doencas_precaucao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura pública de doenças"
  ON public.doencas_precaucao
  FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================
-- 6. VIEW: PRECAUÇÕES COM DATA FIM CALCULADA
-- ============================================================
CREATE OR REPLACE VIEW public.precautions_com_calculo AS
SELECT
  p.*,
  d.nome               AS doenca_nome,
  d.duracao_observacao AS doenca_duracao_observacao,
  d.duracao_dias,
  CASE
    WHEN p.data_fim_sugerida IS NOT NULL
      THEN p.data_fim_sugerida
    WHEN d.duracao_dias IS NOT NULL
      THEN (p.data_inicio::date + (d.duracao_dias || ' days')::interval)::date
    ELSE NULL
  END AS data_fim_calculada
FROM public.precautions p
LEFT JOIN public.doencas_precaucao d ON p.doenca_id = d.id;
