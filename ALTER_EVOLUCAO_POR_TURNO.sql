-- Evolução Diária por turno (manha / tarde / noite).
-- Registros que já existem viram "manha", então nada do que está cadastrado muda.

ALTER TABLE public.evolucao_diaria_registros
  ADD COLUMN IF NOT EXISTS turno text NOT NULL DEFAULT 'manha';

ALTER TABLE public.evolucao_diaria_registros
  DROP CONSTRAINT IF EXISTS evolucao_diaria_registros_turno_check;
ALTER TABLE public.evolucao_diaria_registros
  ADD CONSTRAINT evolucao_diaria_registros_turno_check CHECK (turno IN ('manha', 'tarde', 'noite'));

-- Situação clínica (Avaliação Clínica): de qual turno é. NULL = registro antigo (conta como manha).
ALTER TABLE public.clinical_situations_24h
  ADD COLUMN IF NOT EXISTS turno text NULL;

ALTER TABLE public.clinical_situations_24h
  DROP CONSTRAINT IF EXISTS clinical_situations_24h_turno_check;
ALTER TABLE public.clinical_situations_24h
  ADD CONSTRAINT clinical_situations_24h_turno_check CHECK (turno IS NULL OR turno IN ('manha', 'tarde', 'noite'));
