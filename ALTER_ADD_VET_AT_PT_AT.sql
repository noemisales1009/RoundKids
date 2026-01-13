-- SCRIPT: Recriar tabela dietas_pacientes com CÁLCULO AUTOMÁTICO
-- Execute este script no Supabase SQL Editor

-- 1. PRIMEIRO: Apaga a tabela antiga para não dar erro
DROP TABLE IF EXISTS public.dietas_pacientes CASCADE;

-- 2. SEGUNDO: Cria a tabela nova com a "Inteligência" de cálculo
create table public.dietas_pacientes (
  id uuid not null default gen_random_uuid (),
  paciente_id uuid not null,
  tipo character varying(50) not null,
  data_inicio date not null default CURRENT_DATE,
  
  -- Valores realizados
  volume numeric(10, 2) null,
  vet numeric(10, 2) null,
  pt numeric(10, 2) null,
  th numeric(10, 2) null,
  
  -- Metas (Pleno)
  vet_pleno numeric(10, 2) null,
  pt_g_dia numeric(10, 2) null,

  -- CÁLCULO AUTOMÁTICO (AT - Atingido %)
  -- O banco vai dividir o REALIZADO pela META automaticamente
  vet_at numeric(10, 2) GENERATED ALWAYS AS (
    CASE 
      WHEN vet_pleno IS NOT NULL AND vet_pleno > 0 
      THEN (vet / vet_pleno) * 100 
      ELSE 0 
    END
  ) STORED,

  pt_at numeric(10, 2) GENERATED ALWAYS AS (
    CASE 
      WHEN pt_g_dia IS NOT NULL AND pt_g_dia > 0 
      THEN (pt / pt_g_dia) * 100 
      ELSE 0 
    END
  ) STORED,

  -- Campos de controle
  is_archived boolean null default false,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  data_remocao timestamp with time zone null,
  observacao text null,

  constraint dietas_pacientes_pkey primary key (id),
  constraint dietas_pacientes_paciente_id_fkey foreign KEY (paciente_id) references patients (id) on delete CASCADE
) TABLESPACE pg_default;

-- 3. TERCEIRO: Cria os índices para busca rápida
create index IF not exists idx_dietas_pacientes_paciente_id on public.dietas_pacientes using btree (paciente_id) TABLESPACE pg_default;
create index IF not exists idx_dietas_pacientes_data on public.dietas_pacientes using btree (data_inicio) TABLESPACE pg_default;

-- 4. VERIFICAR: Confirmar que a tabela foi criada corretamente
SELECT column_name, data_type, is_nullable, column_default, generation_expression
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'dietas_pacientes'
ORDER BY ordinal_position;

