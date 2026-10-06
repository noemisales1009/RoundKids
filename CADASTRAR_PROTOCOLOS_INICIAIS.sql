-- ============================================================================
-- CADASTRAR_PROTOCOLOS_INICIAIS.sql
-- Cadastro dos 3 primeiros protocolos institucionais.
--
-- ANTES: rodar CREATE_PROTOCOLOS.sql (etapas 1 a 4).
--
-- PASSO 1 — Subir os PDFs no painel: Storage > bucket "protocolos" > Upload.
--   Renomear os arquivos ANTES de subir, exatamente assim (sem acento e sem espaço):
--     CETOACIDOSE METABÓLICA 1.pdf              ->  cetoacidose-diabetica.pdf
--     PROTOCOLO DE SEPSE E CHOQUE SEPTICO.pdf   ->  sepse-choque-septico.pdf
--     PROTOCOLO SARG- LELIA BRAGA.pdf           ->  pneumonias-virais-srag.pdf
--
-- PASSO 2 — Conferir os nomes dos sistemas (os INSERTs abaixo procuram por nome):
--     SELECT id, nome FROM categorias ORDER BY ordem;
--
-- PASSO 3 — Rodar os INSERTs abaixo.
-- ============================================================================

INSERT INTO protocolos (titulo, quando_usar, categoria_id, arquivo_path)
VALUES (
  'Cetoacidose Diabética',
  'Criança com hiperglicemia, cetose e acidose metabólica: classificação de gravidade, hidratação e reposição volêmica, insulina contínua, reposição de potássio, bicarbonato e fósforo, controle de glicemia e eletrólitos, edema cerebral.',
  (SELECT id FROM categorias WHERE nome ILIKE '%hídrico%' OR nome ILIKE '%hidrico%' LIMIT 1),
  'cetoacidose-diabetica.pdf'
);

INSERT INTO protocolos (titulo, quando_usar, categoria_id, arquivo_path)
VALUES (
  'Sepse e Choque Séptico',
  'Suspeita de infecção com sinais de má perfusão ou disfunção orgânica: critérios de sepse por faixa etária, pacote da 1ª hora (kit sepse, culturas, antibiótico), ressuscitação volêmica, drogas vasoativas, hidrocortisona e monitorização hemodinâmica.',
  (SELECT id FROM categorias WHERE nome ILIKE '%hemodin%' LIMIT 1),
  'sepse-choque-septico.pdf'
);

INSERT INTO protocolos (titulo, quando_usar, categoria_id, arquivo_path)
VALUES (
  'Pneumonias Virais por Influenza e outros vírus respiratórios (SRAG)',
  'Síndrome gripal, bronquiolite, influenza ou COVID-19: precaução e tempo de isolamento, coleta de painel viral, critérios de internação em UTI, classificação de SARA pelo índice de oxigenação, oseltamivir e notificação compulsória.',
  (SELECT id FROM categorias WHERE nome ILIKE '%respirat%' LIMIT 1),
  'pneumonias-virais-srag.pdf'
);

-- ============================================================================
-- CONFERÊNCIA
-- ============================================================================
-- Os 3 devem aparecer, cada um com o sistema preenchido:
--   SELECT p.titulo, c.nome AS sistema, p.arquivo_path
--   FROM protocolos p LEFT JOIN categorias c ON c.id = p.categoria_id
--   ORDER BY p.titulo;
-- Se "sistema" vier vazio em algum, o nome não bateu. Corrigir com o id certo:
--   UPDATE protocolos SET categoria_id = <id> WHERE arquivo_path = '<arquivo>.pdf';
--
-- No app: round > Hemodinâmico/Infecção > qualquer pergunta > CONSULTAR PROTOCOLOS.
-- O de sepse deve abrir em nova aba. Se der "Não foi possível abrir o protocolo",
-- o nome do arquivo no bucket está diferente do arquivo_path.

-- ============================================================================
-- ROLLBACK
-- ============================================================================
-- DELETE FROM protocolos WHERE arquivo_path IN
--   ('cetoacidose-diabetica.pdf', 'sepse-choque-septico.pdf', 'pneumonias-virais-srag.pdf');
-- E apagar os 3 arquivos no bucket pelo painel.
