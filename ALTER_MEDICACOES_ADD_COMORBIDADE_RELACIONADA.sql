-- Adiciona coluna para vincular medicação a uma comorbidade (Reconciliação de Medicamentos)
ALTER TABLE medicacoes_pacientes
ADD COLUMN IF NOT EXISTS comorbidade_relacionada text null;
