-- Diurese e Balanço Hídrico: turno escolhido no cadastro (manha / tarde / noite).
-- NULL = registro antigo; nesse caso o app deduz o turno pela hora do registro.

ALTER TABLE public.diurese
  ADD COLUMN IF NOT EXISTS turno text NULL;
ALTER TABLE public.diurese
  DROP CONSTRAINT IF EXISTS diurese_turno_check;
ALTER TABLE public.diurese
  ADD CONSTRAINT diurese_turno_check CHECK (turno IS NULL OR turno IN ('manha', 'tarde', 'noite'));

ALTER TABLE public.balanco_hidrico
  ADD COLUMN IF NOT EXISTS turno text NULL;
ALTER TABLE public.balanco_hidrico
  DROP CONSTRAINT IF EXISTS balanco_hidrico_turno_check;
ALTER TABLE public.balanco_hidrico
  ADD CONSTRAINT balanco_hidrico_turno_check CHECK (turno IS NULL OR turno IN ('manha', 'tarde', 'noite'));
