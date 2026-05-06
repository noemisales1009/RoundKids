ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS sexo text
    CONSTRAINT patients_sexo_check CHECK (sexo IS NULL OR sexo = ANY (ARRAY['Masculino', 'Feminino']));
