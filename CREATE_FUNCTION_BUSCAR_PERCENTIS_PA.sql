-- ============================================================
-- FUNÇÃO: buscar_percentis_pa
-- Retorna os percentis de PA de referência (por sexo e idade) da
-- tabela pa_percentis, INCLUINDO o P90, e calcula os percentis da
-- PA Média a partir da sistólica e diastólica: (sist + 2*diast) / 3.
--
-- Usada pelo card "PA Percentis" (services/paPercentis.ts) para
-- classificar a PA em 5 faixas:
--   < P5        → Hipotensão
--   P5  a < P50 → Normal
--   P50 a < P90 → Aceitável
--   P90 a < P95 → Pré-hipertensão
--   ≥ P95       → Hipertensão
-- ============================================================

-- 1) Remove a versão antiga da função (qualquer assinatura)
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT oid::regprocedure AS sig FROM pg_proc WHERE proname = 'buscar_percentis_pa'
  LOOP EXECUTE 'DROP FUNCTION ' || r.sig; END LOOP;
END $$;

-- 2) Cria a versão nova (com P90)
CREATE FUNCTION public.buscar_percentis_pa(p_sexo TEXT, p_idade_label TEXT)
RETURNS TABLE (
  idade_label TEXT,
  sist_p5  INTEGER, sist_p10  INTEGER, sist_p50  INTEGER, sist_p90  INTEGER, sist_p95  INTEGER,
  diast_p5 INTEGER, diast_p10 INTEGER, diast_p50 INTEGER, diast_p90 INTEGER, diast_p95 INTEGER,
  media_p5  NUMERIC, media_p10 NUMERIC, media_p50 NUMERIC, media_p90 NUMERIC, media_p95 NUMERIC
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    p.idade_label,
    p.sist_p5,  p.sist_p10,  p.sist_p50,  p.sist_p90,  p.sist_p95,
    p.diast_p5, p.diast_p10, p.diast_p50, p.diast_p90, p.diast_p95,
    ROUND((p.sist_p5  + 2.0 * p.diast_p5)  / 3, 1),
    ROUND((p.sist_p10 + 2.0 * p.diast_p10) / 3, 1),
    ROUND((p.sist_p50 + 2.0 * p.diast_p50) / 3, 1),
    ROUND((p.sist_p90 + 2.0 * p.diast_p90) / 3, 1),
    ROUND((p.sist_p95 + 2.0 * p.diast_p95) / 3, 1)
  FROM public.pa_percentis p
  WHERE LOWER(p.sexo) = LOWER(p_sexo)
    AND UPPER(p.idade_label) = UPPER(p_idade_label)
  LIMIT 1;
$$;

-- 3) Permite que o app chame a função
GRANT EXECUTE ON FUNCTION public.buscar_percentis_pa(TEXT, TEXT) TO anon, authenticated;
