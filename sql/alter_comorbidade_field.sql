-- Alterar o campo comorbidade para suportar texto ilimitado
-- De: character varying(255) para text
-- Isso permite armazenar múltiplas comorbidades com nomes longos e espaços

ALTER TABLE patients 
ALTER COLUMN comorbidade TYPE text;

-- Adicionar comentário explicativo
COMMENT ON COLUMN patients.comorbidade IS 'Armazena comorbidades separadas por pipe (|). Ex: Transtorno de Déficit de Atenção|Asma Alérgica|Diabetes Mellitus';
