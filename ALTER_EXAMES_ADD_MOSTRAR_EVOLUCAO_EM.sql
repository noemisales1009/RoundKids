-- Marca QUANDO o exame foi marcado manualmente (checkbox da lista) para a Evolução Diária.
--   mostrar_evolucao = true  e mostrar_evolucao_em NULL     -> FIXO (permanente)  [todos os já existentes continuam assim]
--   mostrar_evolucao = true  e mostrar_evolucao_em preenchido -> marcado manualmente: vale por 24h
--   mostrar_evolucao = NULL                                  -> automático: data do exame nas últimas 24h
--   mostrar_evolucao = false                                 -> excluído
ALTER TABLE public.exames_pacientes
  ADD COLUMN IF NOT EXISTS mostrar_evolucao_em timestamptz NULL;
