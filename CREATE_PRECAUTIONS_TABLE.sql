-- ==========================================
-- CRIAÇÃO DA TABELA DE PRECAUÇÕES
-- ==========================================
-- Tabela para gerenciar precauções de isolamento dos pacientes
-- Tipos: padrão, contato, gotícula, aerossóis
-- ==========================================

-- 1. Cria a tabela de precauções
create table if not exists public.precautions (
  -- ID único da precaução (gerado automaticamente)
  id uuid not null default gen_random_uuid (),
  
  -- ID do paciente (Vínculo com a tabela patients)
  patient_id uuid not null,
  
  -- Tipo da precaução (Texto)
  tipo_precaucao text not null,
  
  -- Data de início (Se não preencher, pega a data de hoje automaticamente)
  data_inicio date not null default current_date,
  
  -- Data de saída (Pode ser nula. Se for NULL, o paciente ainda está em isolamento)
  data_fim date null,
  
  -- Data de criação do registro (Para auditoria)
  created_at timestamp with time zone null default now(),
  
  -- DEFINIÇÃO DA CHAVE PRIMÁRIA
  constraint precautions_pkey primary key (id),
  
  -- REGRA DE SEGURANÇA (Validação)
  -- Só aceita: padrao, contato, goticula ou aerossois
  constraint check_tipos_aceitos 
    check (tipo_precaucao in ('padrao', 'contato', 'goticula', 'aerossois')),

  -- REGRA DE CASCATA (O que você pediu)
  -- Se o paciente for deletado da tabela 'patients', esta precaução também é deletada
  constraint fk_patient 
    foreign key (patient_id) 
    references public.patients (id) 
    on delete cascade
) tablespace pg_default;

-- 2. Cria o índice (Para deixar o sistema rápido quando buscar pelo ID do paciente)
create index if not exists idx_precautions_patient_id 
  on public.precautions using btree (patient_id) tablespace pg_default;

-- 3. Habilita RLS (Row Level Security) na tabela
alter table public.precautions enable row level security;

-- 4. Cria política de segurança: qualquer usuário autenticado pode ver todas as precauções
create policy "Allow authenticated users to view all precautions"
  on public.precautions
  for select
  to authenticated
  using (true);

-- 5. Cria política de segurança: qualquer usuário autenticado pode inserir precauções
create policy "Allow authenticated users to insert precautions"
  on public.precautions
  for insert
  to authenticated
  with check (true);

-- 6. Cria política de segurança: qualquer usuário autenticado pode atualizar precauções
create policy "Allow authenticated users to update precautions"
  on public.precautions
  for update
  to authenticated
  using (true)
  with check (true);

-- 7. Cria política de segurança: qualquer usuário autenticado pode deletar precauções
create policy "Allow authenticated users to delete precautions"
  on public.precautions
  for delete
  to authenticated
  using (true);

-- ==========================================
-- FIM DO SCRIPT
-- ==========================================

-- ✅ COMO USAR:
-- 1. Copie este código
-- 2. Abra o Supabase Dashboard
-- 3. Vá em "SQL Editor"
-- 4. Cole o código e execute (Run)
-- 5. Pronto! A tabela estará criada

-- ==========================================
-- EXEMPLOS DE USO:
-- ==========================================

-- Inserir uma precaução de contato para um paciente
-- INSERT INTO public.precautions (patient_id, tipo_precaucao, data_inicio)
-- VALUES ('id-do-paciente-uuid', 'contato', '2026-01-15');

-- Finalizar uma precaução (adicionar data de fim)
-- UPDATE public.precautions 
-- SET data_fim = '2026-01-20'
-- WHERE id = 'id-da-precaucao';

-- Buscar precauções ativas de um paciente
-- SELECT * FROM public.precautions
-- WHERE patient_id = 'id-do-paciente-uuid'
-- AND data_fim IS NULL;

-- Calcular dias em precaução
-- SELECT 
--   tipo_precaucao,
--   data_inicio,
--   COALESCE(data_fim, CURRENT_DATE) - data_inicio as dias_em_precaucao
-- FROM public.precautions
-- WHERE patient_id = 'id-do-paciente-uuid';
