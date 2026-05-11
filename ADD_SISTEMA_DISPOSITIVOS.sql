ALTER TABLE public.dispositivos_pacientes
ADD COLUMN IF NOT EXISTS sistema TEXT;
