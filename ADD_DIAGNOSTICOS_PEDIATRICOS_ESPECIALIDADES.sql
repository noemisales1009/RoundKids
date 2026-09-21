-- Adiciona os diagnósticos do "Guia de Referência Clínica: Principais Diagnósticos Pediátricos por Especialidade"
-- como opções de Diagnóstico Principal E Secundário. SEGURO: só insere, nunca apaga ou altera o que já existe.
-- Pula qualquer diagnóstico cujo "label" já esteja cadastrado na mesma pergunta (principal/secundário).

DO $$
DECLARE
  v_principal_id integer;
  v_secundario_id integer;
  v_ordem integer;
BEGIN
  SELECT id INTO v_principal_id FROM public.perguntas_diagnistico WHERE tipo = 'principal' ORDER BY id LIMIT 1;
  SELECT id INTO v_secundario_id FROM public.perguntas_diagnistico WHERE tipo = 'secundario' ORDER BY id LIMIT 1;

  IF v_principal_id IS NULL OR v_secundario_id IS NULL THEN
    RAISE EXCEPTION 'Não encontrei as perguntas de diagnóstico principal/secundário em perguntas_diagnistico.';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Anemia ferropriva') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_1_ANEMIA_FERROPRIVA', 'Anemia ferropriva', false, 5001, 'Hematológico / Oncológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Anemia ferropriva') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_1_ANEMIA_FERROPRIVA', 'Anemia ferropriva', false, 5001, 'Hematológico / Oncológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Anemia megaloblástica por deficiência de vitamina B12 ou folato') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_2_ANEMIA_MEGALOBLASTICA_POR_DEFICIENCIA_DE', 'Anemia megaloblástica por deficiência de vitamina B12 ou folato', false, 5002, 'Hematológico / Oncológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Anemia megaloblástica por deficiência de vitamina B12 ou folato') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_2_ANEMIA_MEGALOBLASTICA_POR_DEFICIENCIA_DE', 'Anemia megaloblástica por deficiência de vitamina B12 ou folato', false, 5002, 'Hematológico / Oncológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Anemia da doença crônica/inflamatória') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_3_ANEMIA_DA_DOENCA_CRONICA_INFLAMATORIA', 'Anemia da doença crônica/inflamatória', false, 5003, 'Hematológico / Oncológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Anemia da doença crônica/inflamatória') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_3_ANEMIA_DA_DOENCA_CRONICA_INFLAMATORIA', 'Anemia da doença crônica/inflamatória', false, 5003, 'Hematológico / Oncológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Anemia hemolítica autoimune') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_4_ANEMIA_HEMOLITICA_AUTOIMUNE', 'Anemia hemolítica autoimune', false, 5004, 'Hematológico / Oncológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Anemia hemolítica autoimune') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_4_ANEMIA_HEMOLITICA_AUTOIMUNE', 'Anemia hemolítica autoimune', false, 5004, 'Hematológico / Oncológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Doença falciforme') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_5_DOENCA_FALCIFORME', 'Doença falciforme', false, 5005, 'Hematológico / Oncológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Doença falciforme') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_5_DOENCA_FALCIFORME', 'Doença falciforme', false, 5005, 'Hematológico / Oncológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Talassemias') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_6_TALASSEMIAS', 'Talassemias', false, 5006, 'Hematológico / Oncológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Talassemias') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_6_TALASSEMIAS', 'Talassemias', false, 5006, 'Hematológico / Oncológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Esferocitose hereditária') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_7_ESFEROCITOSE_HEREDITARIA', 'Esferocitose hereditária', false, 5007, 'Hematológico / Oncológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Esferocitose hereditária') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_7_ESFEROCITOSE_HEREDITARIA', 'Esferocitose hereditária', false, 5007, 'Hematológico / Oncológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Deficiência de glicose-6-fosfato desidrogenase (G6PD)') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_8_DEFICIENCIA_DE_GLICOSE_6_FOSFATO_DESIDRO', 'Deficiência de glicose-6-fosfato desidrogenase (G6PD)', false, 5008, 'Hematológico / Oncológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Deficiência de glicose-6-fosfato desidrogenase (G6PD)') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_8_DEFICIENCIA_DE_GLICOSE_6_FOSFATO_DESIDRO', 'Deficiência de glicose-6-fosfato desidrogenase (G6PD)', false, 5008, 'Hematológico / Oncológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Anemia aplástica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_9_ANEMIA_APLASTICA', 'Anemia aplástica', false, 5009, 'Hematológico / Oncológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Anemia aplástica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_9_ANEMIA_APLASTICA', 'Anemia aplástica', false, 5009, 'Hematológico / Oncológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Aplasia pura da série vermelha') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_10_APLASIA_PURA_DA_SERIE_VERMELHA', 'Aplasia pura da série vermelha', false, 5010, 'Hematológico / Oncológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Aplasia pura da série vermelha') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_10_APLASIA_PURA_DA_SERIE_VERMELHA', 'Aplasia pura da série vermelha', false, 5010, 'Hematológico / Oncológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Anemia de Diamond-Blackfan') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_11_ANEMIA_DE_DIAMOND_BLACKFAN', 'Anemia de Diamond-Blackfan', false, 5011, 'Hematológico / Oncológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Anemia de Diamond-Blackfan') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_11_ANEMIA_DE_DIAMOND_BLACKFAN', 'Anemia de Diamond-Blackfan', false, 5011, 'Hematológico / Oncológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Púrpura trombocitopênica imune (PTI)') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_12_PURPURA_TROMBOCITOPENICA_IMUNE_PTI', 'Púrpura trombocitopênica imune (PTI)', false, 5012, 'Hematológico / Oncológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Púrpura trombocitopênica imune (PTI)') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_12_PURPURA_TROMBOCITOPENICA_IMUNE_PTI', 'Púrpura trombocitopênica imune (PTI)', false, 5012, 'Hematológico / Oncológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Hemofilia A e B') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_13_HEMOFILIA_A_E_B', 'Hemofilia A e B', false, 5013, 'Hematológico / Oncológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Hemofilia A e B') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_13_HEMOFILIA_A_E_B', 'Hemofilia A e B', false, 5013, 'Hematológico / Oncológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Doença de von Willebrand') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_14_DOENCA_DE_VON_WILLEBRAND', 'Doença de von Willebrand', false, 5014, 'Hematológico / Oncológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Doença de von Willebrand') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_14_DOENCA_DE_VON_WILLEBRAND', 'Doença de von Willebrand', false, 5014, 'Hematológico / Oncológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Deficiências congênitas de fatores da coagulação') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_15_DEFICIENCIAS_CONGENITAS_DE_FATORES_DA_CO', 'Deficiências congênitas de fatores da coagulação', false, 5015, 'Hematológico / Oncológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Deficiências congênitas de fatores da coagulação') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_15_DEFICIENCIAS_CONGENITAS_DE_FATORES_DA_CO', 'Deficiências congênitas de fatores da coagulação', false, 5015, 'Hematológico / Oncológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Coagulação intravascular disseminada (CIVD)') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_16_COAGULACAO_INTRAVASCULAR_DISSEMINADA_CIV', 'Coagulação intravascular disseminada (CIVD)', false, 5016, 'Hematológico / Oncológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Coagulação intravascular disseminada (CIVD)') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_16_COAGULACAO_INTRAVASCULAR_DISSEMINADA_CIV', 'Coagulação intravascular disseminada (CIVD)', false, 5016, 'Hematológico / Oncológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Trombocitopenia neonatal') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_17_TROMBOCITOPENIA_NEONATAL', 'Trombocitopenia neonatal', false, 5017, 'Hematológico / Oncológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Trombocitopenia neonatal') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_17_TROMBOCITOPENIA_NEONATAL', 'Trombocitopenia neonatal', false, 5017, 'Hematológico / Oncológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Trombofilias hereditárias e adquiridas') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_18_TROMBOFILIAS_HEREDITARIAS_E_ADQUIRIDAS', 'Trombofilias hereditárias e adquiridas', false, 5018, 'Hematológico / Oncológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Trombofilias hereditárias e adquiridas') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_18_TROMBOFILIAS_HEREDITARIAS_E_ADQUIRIDAS', 'Trombofilias hereditárias e adquiridas', false, 5018, 'Hematológico / Oncológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Trombose venosa associada a cateter') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_19_TROMBOSE_VENOSA_ASSOCIADA_A_CATETER', 'Trombose venosa associada a cateter', false, 5019, 'Hematológico / Oncológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Trombose venosa associada a cateter') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_19_TROMBOSE_VENOSA_ASSOCIADA_A_CATETER', 'Trombose venosa associada a cateter', false, 5019, 'Hematológico / Oncológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Neutropenias transitória, autoimune ou congênita') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_20_NEUTROPENIAS_TRANSITORIA_AUTOIMUNE_OU_CO', 'Neutropenias transitória, autoimune ou congênita', false, 5020, 'Hematológico / Oncológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Neutropenias transitória, autoimune ou congênita') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_20_NEUTROPENIAS_TRANSITORIA_AUTOIMUNE_OU_CO', 'Neutropenias transitória, autoimune ou congênita', false, 5020, 'Hematológico / Oncológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Agranulocitose') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_21_AGRANULOCITOSE', 'Agranulocitose', false, 5021, 'Hematológico / Oncológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Agranulocitose') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_21_AGRANULOCITOSE', 'Agranulocitose', false, 5021, 'Hematológico / Oncológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Pancitopenia') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_22_PANCITOPENIA', 'Pancitopenia', false, 5022, 'Hematológico / Oncológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Pancitopenia') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_22_PANCITOPENIA', 'Pancitopenia', false, 5022, 'Hematológico / Oncológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Síndromes de falência medular') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_23_SINDROMES_DE_FALENCIA_MEDULAR', 'Síndromes de falência medular', false, 5023, 'Hematológico / Oncológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Síndromes de falência medular') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_23_SINDROMES_DE_FALENCIA_MEDULAR', 'Síndromes de falência medular', false, 5023, 'Hematológico / Oncológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Síndrome hemofagocítica/linfo-histiocitose hemofagocítica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_24_SINDROME_HEMOFAGOCITICA_LINFO_HISTIOCITO', 'Síndrome hemofagocítica/linfo-histiocitose hemofagocítica', false, 5024, 'Hematológico / Oncológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Síndrome hemofagocítica/linfo-histiocitose hemofagocítica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_24_SINDROME_HEMOFAGOCITICA_LINFO_HISTIOCITO', 'Síndrome hemofagocítica/linfo-histiocitose hemofagocítica', false, 5024, 'Hematológico / Oncológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Síndromes mielodisplásicas') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_25_SINDROMES_MIELODISPLASICAS', 'Síndromes mielodisplásicas', false, 5025, 'Hematológico / Oncológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Síndromes mielodisplásicas') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_25_SINDROMES_MIELODISPLASICAS', 'Síndromes mielodisplásicas', false, 5025, 'Hematológico / Oncológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Hiperesplenismo') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_26_HIPERESPLENISMO', 'Hiperesplenismo', false, 5026, 'Hematológico / Oncológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Hiperesplenismo') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_26_HIPERESPLENISMO', 'Hiperesplenismo', false, 5026, 'Hematológico / Oncológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Leucemia linfoblástica aguda') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_27_LEUCEMIA_LINFOBLASTICA_AGUDA', 'Leucemia linfoblástica aguda', false, 5027, 'Hematológico / Oncológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Leucemia linfoblástica aguda') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_27_LEUCEMIA_LINFOBLASTICA_AGUDA', 'Leucemia linfoblástica aguda', false, 5027, 'Hematológico / Oncológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Leucemia mieloide aguda') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_28_LEUCEMIA_MIELOIDE_AGUDA', 'Leucemia mieloide aguda', false, 5028, 'Hematológico / Oncológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Leucemia mieloide aguda') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_28_LEUCEMIA_MIELOIDE_AGUDA', 'Leucemia mieloide aguda', false, 5028, 'Hematológico / Oncológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Leucemia mieloide crônica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_29_LEUCEMIA_MIELOIDE_CRONICA', 'Leucemia mieloide crônica', false, 5029, 'Hematológico / Oncológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Leucemia mieloide crônica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_29_LEUCEMIA_MIELOIDE_CRONICA', 'Leucemia mieloide crônica', false, 5029, 'Hematológico / Oncológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Linfoma de Hodgkin') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_30_LINFOMA_DE_HODGKIN', 'Linfoma de Hodgkin', false, 5030, 'Hematológico / Oncológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Linfoma de Hodgkin') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_30_LINFOMA_DE_HODGKIN', 'Linfoma de Hodgkin', false, 5030, 'Hematológico / Oncológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Linfomas não Hodgkin') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_31_LINFOMAS_NAO_HODGKIN', 'Linfomas não Hodgkin', false, 5031, 'Hematológico / Oncológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Linfomas não Hodgkin') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_31_LINFOMAS_NAO_HODGKIN', 'Linfomas não Hodgkin', false, 5031, 'Hematológico / Oncológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Artrite idiopática juvenil') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_32_ARTRITE_IDIOPATICA_JUVENIL', 'Artrite idiopática juvenil', false, 5032, 'Reumatológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Artrite idiopática juvenil') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_32_ARTRITE_IDIOPATICA_JUVENIL', 'Artrite idiopática juvenil', false, 5032, 'Reumatológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Lúpus eritematoso sistêmico juvenil') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_33_LUPUS_ERITEMATOSO_SISTEMICO_JUVENIL', 'Lúpus eritematoso sistêmico juvenil', false, 5033, 'Reumatológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Lúpus eritematoso sistêmico juvenil') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_33_LUPUS_ERITEMATOSO_SISTEMICO_JUVENIL', 'Lúpus eritematoso sistêmico juvenil', false, 5033, 'Reumatológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Dermatomiosite juvenil') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_34_DERMATOMIOSITE_JUVENIL', 'Dermatomiosite juvenil', false, 5034, 'Reumatológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Dermatomiosite juvenil') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_34_DERMATOMIOSITE_JUVENIL', 'Dermatomiosite juvenil', false, 5034, 'Reumatológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Esclerose sistêmica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_35_ESCLEROSE_SISTEMICA', 'Esclerose sistêmica', false, 5035, 'Reumatológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Esclerose sistêmica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_35_ESCLEROSE_SISTEMICA', 'Esclerose sistêmica', false, 5035, 'Reumatológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Esclerodermia localizada/morfeia') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_36_ESCLERODERMIA_LOCALIZADA_MORFEIA', 'Esclerodermia localizada/morfeia', false, 5036, 'Reumatológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Esclerodermia localizada/morfeia') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_36_ESCLERODERMIA_LOCALIZADA_MORFEIA', 'Esclerodermia localizada/morfeia', false, 5036, 'Reumatológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Doença mista do tecido conjuntivo') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_37_DOENCA_MISTA_DO_TECIDO_CONJUNTIVO', 'Doença mista do tecido conjuntivo', false, 5037, 'Reumatológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Doença mista do tecido conjuntivo') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_37_DOENCA_MISTA_DO_TECIDO_CONJUNTIVO', 'Doença mista do tecido conjuntivo', false, 5037, 'Reumatológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Síndrome de Sjögren juvenil') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_38_SINDROME_DE_SJOGREN_JUVENIL', 'Síndrome de Sjögren juvenil', false, 5038, 'Reumatológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Síndrome de Sjögren juvenil') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_38_SINDROME_DE_SJOGREN_JUVENIL', 'Síndrome de Sjögren juvenil', false, 5038, 'Reumatológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Síndromes de sobreposição') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_39_SINDROMES_DE_SOBREPOSICAO', 'Síndromes de sobreposição', false, 5039, 'Reumatológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Síndromes de sobreposição') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_39_SINDROMES_DE_SOBREPOSICAO', 'Síndromes de sobreposição', false, 5039, 'Reumatológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Vasculite por IgA (púrpura de Henoch-Schönlein)') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_40_VASCULITE_POR_IGA_PURPURA_DE_HENOCH_SCHO', 'Vasculite por IgA (púrpura de Henoch-Schönlein)', false, 5040, 'Reumatológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Vasculite por IgA (púrpura de Henoch-Schönlein)') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_40_VASCULITE_POR_IGA_PURPURA_DE_HENOCH_SCHO', 'Vasculite por IgA (púrpura de Henoch-Schönlein)', false, 5040, 'Reumatológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Doença de Kawasaki') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_41_DOENCA_DE_KAWASAKI', 'Doença de Kawasaki', false, 5041, 'Reumatológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Doença de Kawasaki') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_41_DOENCA_DE_KAWASAKI', 'Doença de Kawasaki', false, 5041, 'Reumatológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Arterite de Takayasu') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_42_ARTERITE_DE_TAKAYASU', 'Arterite de Takayasu', false, 5042, 'Reumatológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Arterite de Takayasu') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_42_ARTERITE_DE_TAKAYASU', 'Arterite de Takayasu', false, 5042, 'Reumatológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Poliarterite nodosa') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_43_POLIARTERITE_NODOSA', 'Poliarterite nodosa', false, 5043, 'Reumatológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Poliarterite nodosa') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_43_POLIARTERITE_NODOSA', 'Poliarterite nodosa', false, 5043, 'Reumatológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Granulomatose com poliangiite') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_44_GRANULOMATOSE_COM_POLIANGIITE', 'Granulomatose com poliangiite', false, 5044, 'Reumatológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Granulomatose com poliangiite') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_44_GRANULOMATOSE_COM_POLIANGIITE', 'Granulomatose com poliangiite', false, 5044, 'Reumatológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Poliangiite microscópica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_45_POLIANGIITE_MICROSCOPICA', 'Poliangiite microscópica', false, 5045, 'Reumatológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Poliangiite microscópica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_45_POLIANGIITE_MICROSCOPICA', 'Poliangiite microscópica', false, 5045, 'Reumatológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Vasculites associadas ao ANCA') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_46_VASCULITES_ASSOCIADAS_AO_ANCA', 'Vasculites associadas ao ANCA', false, 5046, 'Reumatológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Vasculites associadas ao ANCA') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_46_VASCULITES_ASSOCIADAS_AO_ANCA', 'Vasculites associadas ao ANCA', false, 5046, 'Reumatológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Febre familiar do Mediterrâneo') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_47_FEBRE_FAMILIAR_DO_MEDITERRANEO', 'Febre familiar do Mediterrâneo', false, 5047, 'Reumatológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Febre familiar do Mediterrâneo') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_47_FEBRE_FAMILIAR_DO_MEDITERRANEO', 'Febre familiar do Mediterrâneo', false, 5047, 'Reumatológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Síndrome PFAPA') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_48_SINDROME_PFAPA', 'Síndrome PFAPA', false, 5048, 'Reumatológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Síndrome PFAPA') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_48_SINDROME_PFAPA', 'Síndrome PFAPA', false, 5048, 'Reumatológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Síndromes periódicas associadas à criopirina') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_49_SINDROMES_PERIODICAS_ASSOCIADAS_A_CRIOPI', 'Síndromes periódicas associadas à criopirina', false, 5049, 'Reumatológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Síndromes periódicas associadas à criopirina') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_49_SINDROMES_PERIODICAS_ASSOCIADAS_A_CRIOPI', 'Síndromes periódicas associadas à criopirina', false, 5049, 'Reumatológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Síndrome de ativação macrofágica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_50_SINDROME_DE_ATIVACAO_MACROFAGICA', 'Síndrome de ativação macrofágica', false, 5050, 'Reumatológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Síndrome de ativação macrofágica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_50_SINDROME_DE_ATIVACAO_MACROFAGICA', 'Síndrome de ativação macrofágica', false, 5050, 'Reumatológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Artrite reativa') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_51_ARTRITE_REATIVA', 'Artrite reativa', false, 5051, 'Reumatológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Artrite reativa') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_51_ARTRITE_REATIVA', 'Artrite reativa', false, 5051, 'Reumatológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Febre reumática') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_52_FEBRE_REUMATICA', 'Febre reumática', false, 5052, 'Reumatológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Febre reumática') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_52_FEBRE_REUMATICA', 'Febre reumática', false, 5052, 'Reumatológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Síndrome antifosfolípide') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_53_SINDROME_ANTIFOSFOLIPIDE', 'Síndrome antifosfolípide', false, 5053, 'Reumatológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Síndrome antifosfolípide') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_53_SINDROME_ANTIFOSFOLIPIDE', 'Síndrome antifosfolípide', false, 5053, 'Reumatológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Uveíte associada às doenças reumatológicas') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_54_UVEITE_ASSOCIADA_AS_DOENCAS_REUMATOLOGIC', 'Uveíte associada às doenças reumatológicas', false, 5054, 'Reumatológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Uveíte associada às doenças reumatológicas') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_54_UVEITE_ASSOCIADA_AS_DOENCAS_REUMATOLOGIC', 'Uveíte associada às doenças reumatológicas', false, 5054, 'Reumatológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Dor musculoesquelética amplificada') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_55_DOR_MUSCULOESQUELETICA_AMPLIFICADA', 'Dor musculoesquelética amplificada', false, 5055, 'Reumatológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Dor musculoesquelética amplificada') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_55_DOR_MUSCULOESQUELETICA_AMPLIFICADA', 'Dor musculoesquelética amplificada', false, 5055, 'Reumatológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Fibromialgia juvenil') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_56_FIBROMIALGIA_JUVENIL', 'Fibromialgia juvenil', false, 5056, 'Reumatológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Fibromialgia juvenil') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_56_FIBROMIALGIA_JUVENIL', 'Fibromialgia juvenil', false, 5056, 'Reumatológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Hipermobilidade articular e síndrome de Ehlers-Danlos') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_57_HIPERMOBILIDADE_ARTICULAR_E_SINDROME_DE_', 'Hipermobilidade articular e síndrome de Ehlers-Danlos', false, 5057, 'Reumatológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Hipermobilidade articular e síndrome de Ehlers-Danlos') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_57_HIPERMOBILIDADE_ARTICULAR_E_SINDROME_DE_', 'Hipermobilidade articular e síndrome de Ehlers-Danlos', false, 5057, 'Reumatológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Osteomielite crônica não bacteriana/CRMO') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_58_OSTEOMIELITE_CRONICA_NAO_BACTERIANA_CRMO', 'Osteomielite crônica não bacteriana/CRMO', false, 5058, 'Reumatológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Osteomielite crônica não bacteriana/CRMO') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_58_OSTEOMIELITE_CRONICA_NAO_BACTERIANA_CRMO', 'Osteomielite crônica não bacteriana/CRMO', false, 5058, 'Reumatológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Doença do refluxo gastroesofágico') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_59_DOENCA_DO_REFLUXO_GASTROESOFAGICO', 'Doença do refluxo gastroesofágico', false, 5059, 'Gastrointestinal / Hepático');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Doença do refluxo gastroesofágico') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_59_DOENCA_DO_REFLUXO_GASTROESOFAGICO', 'Doença do refluxo gastroesofágico', false, 5059, 'Gastrointestinal / Hepático');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Esofagite eosinofílica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_60_ESOFAGITE_EOSINOFILICA', 'Esofagite eosinofílica', false, 5060, 'Gastrointestinal / Hepático');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Esofagite eosinofílica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_60_ESOFAGITE_EOSINOFILICA', 'Esofagite eosinofílica', false, 5060, 'Gastrointestinal / Hepático');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Gastrite e doença ulcerosa péptica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_61_GASTRITE_E_DOENCA_ULCEROSA_PEPTICA', 'Gastrite e doença ulcerosa péptica', false, 5061, 'Gastrointestinal / Hepático');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Gastrite e doença ulcerosa péptica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_61_GASTRITE_E_DOENCA_ULCEROSA_PEPTICA', 'Gastrite e doença ulcerosa péptica', false, 5061, 'Gastrointestinal / Hepático');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Infecção por Helicobacter pylori') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_62_INFECCAO_POR_HELICOBACTER_PYLORI', 'Infecção por Helicobacter pylori', false, 5062, 'Gastrointestinal / Hepático');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Infecção por Helicobacter pylori') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_62_INFECCAO_POR_HELICOBACTER_PYLORI', 'Infecção por Helicobacter pylori', false, 5062, 'Gastrointestinal / Hepático');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Acalasia') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_63_ACALASIA', 'Acalasia', false, 5063, 'Gastrointestinal / Hepático');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Acalasia') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_63_ACALASIA', 'Acalasia', false, 5063, 'Gastrointestinal / Hepático');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Estenoses esofágicas') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_64_ESTENOSES_ESOFAGICAS', 'Estenoses esofágicas', false, 5064, 'Gastrointestinal / Hepático');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Estenoses esofágicas') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_64_ESTENOSES_ESOFAGICAS', 'Estenoses esofágicas', false, 5064, 'Gastrointestinal / Hepático');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Ingestão de corpo estranho ou substância cáustica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_65_INGESTAO_DE_CORPO_ESTRANHO_OU_SUBSTANCIA', 'Ingestão de corpo estranho ou substância cáustica', false, 5065, 'Gastrointestinal / Hepático');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Ingestão de corpo estranho ou substância cáustica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_65_INGESTAO_DE_CORPO_ESTRANHO_OU_SUBSTANCIA', 'Ingestão de corpo estranho ou substância cáustica', false, 5065, 'Gastrointestinal / Hepático');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Distúrbios da deglutição') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_66_DISTURBIOS_DA_DEGLUTICAO', 'Distúrbios da deglutição', false, 5066, 'Gastrointestinal / Hepático');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Distúrbios da deglutição') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_66_DISTURBIOS_DA_DEGLUTICAO', 'Distúrbios da deglutição', false, 5066, 'Gastrointestinal / Hepático');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Constipação intestinal funcional') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_67_CONSTIPACAO_INTESTINAL_FUNCIONAL', 'Constipação intestinal funcional', false, 5067, 'Gastrointestinal / Hepático');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Constipação intestinal funcional') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_67_CONSTIPACAO_INTESTINAL_FUNCIONAL', 'Constipação intestinal funcional', false, 5067, 'Gastrointestinal / Hepático');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Diarreia aguda, persistente ou crônica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_68_DIARREIA_AGUDA_PERSISTENTE_OU_CRONICA', 'Diarreia aguda, persistente ou crônica', false, 5068, 'Gastrointestinal / Hepático');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Diarreia aguda, persistente ou crônica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_68_DIARREIA_AGUDA_PERSISTENTE_OU_CRONICA', 'Diarreia aguda, persistente ou crônica', false, 5068, 'Gastrointestinal / Hepático');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Alergia à proteína do leite de vaca') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_69_ALERGIA_A_PROTEINA_DO_LEITE_DE_VACA', 'Alergia à proteína do leite de vaca', false, 5069, 'Gastrointestinal / Hepático');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Alergia à proteína do leite de vaca') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_69_ALERGIA_A_PROTEINA_DO_LEITE_DE_VACA', 'Alergia à proteína do leite de vaca', false, 5069, 'Gastrointestinal / Hepático');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Intolerância à lactose') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_70_INTOLERANCIA_A_LACTOSE', 'Intolerância à lactose', false, 5070, 'Gastrointestinal / Hepático');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Intolerância à lactose') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_70_INTOLERANCIA_A_LACTOSE', 'Intolerância à lactose', false, 5070, 'Gastrointestinal / Hepático');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Doença celíaca') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_71_DOENCA_CELIACA', 'Doença celíaca', false, 5071, 'Gastrointestinal / Hepático');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Doença celíaca') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_71_DOENCA_CELIACA', 'Doença celíaca', false, 5071, 'Gastrointestinal / Hepático');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Doença de Crohn') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_72_DOENCA_DE_CROHN', 'Doença de Crohn', false, 5072, 'Gastrointestinal / Hepático');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Doença de Crohn') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_72_DOENCA_DE_CROHN', 'Doença de Crohn', false, 5072, 'Gastrointestinal / Hepático');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Retocolite ulcerativa') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_73_RETOCOLITE_ULCERATIVA', 'Retocolite ulcerativa', false, 5073, 'Gastrointestinal / Hepático');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Retocolite ulcerativa') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_73_RETOCOLITE_ULCERATIVA', 'Retocolite ulcerativa', false, 5073, 'Gastrointestinal / Hepático');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Doença inflamatória intestinal não classificada') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_74_DOENCA_INFLAMATORIA_INTESTINAL_NAO_CLASS', 'Doença inflamatória intestinal não classificada', false, 5074, 'Gastrointestinal / Hepático');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Doença inflamatória intestinal não classificada') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_74_DOENCA_INFLAMATORIA_INTESTINAL_NAO_CLASS', 'Doença inflamatória intestinal não classificada', false, 5074, 'Gastrointestinal / Hepático');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Síndrome do intestino irritável') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_75_SINDROME_DO_INTESTINO_IRRITAVEL', 'Síndrome do intestino irritável', false, 5075, 'Gastrointestinal / Hepático');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Síndrome do intestino irritável') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_75_SINDROME_DO_INTESTINO_IRRITAVEL', 'Síndrome do intestino irritável', false, 5075, 'Gastrointestinal / Hepático');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Dor abdominal funcional') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_76_DOR_ABDOMINAL_FUNCIONAL', 'Dor abdominal funcional', false, 5076, 'Gastrointestinal / Hepático');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Dor abdominal funcional') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_76_DOR_ABDOMINAL_FUNCIONAL', 'Dor abdominal funcional', false, 5076, 'Gastrointestinal / Hepático');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Invaginação intestinal') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_77_INVAGINACAO_INTESTINAL', 'Invaginação intestinal', false, 5077, 'Gastrointestinal / Hepático');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Invaginação intestinal') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_77_INVAGINACAO_INTESTINAL', 'Invaginação intestinal', false, 5077, 'Gastrointestinal / Hepático');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Divertículo de Meckel') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_78_DIVERTICULO_DE_MECKEL', 'Divertículo de Meckel', false, 5078, 'Gastrointestinal / Hepático');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Divertículo de Meckel') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_78_DIVERTICULO_DE_MECKEL', 'Divertículo de Meckel', false, 5078, 'Gastrointestinal / Hepático');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Pólipos e poliposes hereditárias') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_79_POLIPOS_E_POLIPOSES_HEREDITARIAS', 'Pólipos e poliposes hereditárias', false, 5079, 'Gastrointestinal / Hepático');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Pólipos e poliposes hereditárias') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_79_POLIPOS_E_POLIPOSES_HEREDITARIAS', 'Pólipos e poliposes hereditárias', false, 5079, 'Gastrointestinal / Hepático');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Síndrome do intestino curto') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_80_SINDROME_DO_INTESTINO_CURTO', 'Síndrome do intestino curto', false, 5080, 'Gastrointestinal / Hepático');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Síndrome do intestino curto') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_80_SINDROME_DO_INTESTINO_CURTO', 'Síndrome do intestino curto', false, 5080, 'Gastrointestinal / Hepático');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Linfangiectasia intestinal') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_81_LINFANGIECTASIA_INTESTINAL', 'Linfangiectasia intestinal', false, 5081, 'Gastrointestinal / Hepático');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Linfangiectasia intestinal') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_81_LINFANGIECTASIA_INTESTINAL', 'Linfangiectasia intestinal', false, 5081, 'Gastrointestinal / Hepático');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Enteropatia perdedora de proteínas') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_82_ENTEROPATIA_PERDEDORA_DE_PROTEINAS', 'Enteropatia perdedora de proteínas', false, 5082, 'Gastrointestinal / Hepático');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Enteropatia perdedora de proteínas') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_82_ENTEROPATIA_PERDEDORA_DE_PROTEINAS', 'Enteropatia perdedora de proteínas', false, 5082, 'Gastrointestinal / Hepático');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Distúrbios da motilidade intestinal') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_83_DISTURBIOS_DA_MOTILIDADE_INTESTINAL', 'Distúrbios da motilidade intestinal', false, 5083, 'Gastrointestinal / Hepático');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Distúrbios da motilidade intestinal') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_83_DISTURBIOS_DA_MOTILIDADE_INTESTINAL', 'Distúrbios da motilidade intestinal', false, 5083, 'Gastrointestinal / Hepático');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Hepatites virais, autoimunes e metabólicas') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_84_HEPATITES_VIRAIS_AUTOIMUNES_E_METABOLICA', 'Hepatites virais, autoimunes e metabólicas', false, 5084, 'Gastrointestinal / Hepático');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Hepatites virais, autoimunes e metabólicas') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_84_HEPATITES_VIRAIS_AUTOIMUNES_E_METABOLICA', 'Hepatites virais, autoimunes e metabólicas', false, 5084, 'Gastrointestinal / Hepático');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Colestase neonatal') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_85_COLESTASE_NEONATAL', 'Colestase neonatal', false, 5085, 'Gastrointestinal / Hepático');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Colestase neonatal') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_85_COLESTASE_NEONATAL', 'Colestase neonatal', false, 5085, 'Gastrointestinal / Hepático');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Atresia de vias biliares') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_86_ATRESIA_DE_VIAS_BILIARES', 'Atresia de vias biliares', false, 5086, 'Gastrointestinal / Hepático');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Atresia de vias biliares') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_86_ATRESIA_DE_VIAS_BILIARES', 'Atresia de vias biliares', false, 5086, 'Gastrointestinal / Hepático');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Deficiência de alfa-1-antitripsina') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_87_DEFICIENCIA_DE_ALFA_1_ANTITRIPSINA', 'Deficiência de alfa-1-antitripsina', false, 5087, 'Gastrointestinal / Hepático');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Deficiência de alfa-1-antitripsina') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_87_DEFICIENCIA_DE_ALFA_1_ANTITRIPSINA', 'Deficiência de alfa-1-antitripsina', false, 5087, 'Gastrointestinal / Hepático');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Doença de Wilson') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_88_DOENCA_DE_WILSON', 'Doença de Wilson', false, 5088, 'Gastrointestinal / Hepático');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Doença de Wilson') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_88_DOENCA_DE_WILSON', 'Doença de Wilson', false, 5088, 'Gastrointestinal / Hepático');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Esteatose hepática associada à disfunção metabólica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_89_ESTEATOSE_HEPATICA_ASSOCIADA_A_DISFUNCAO', 'Esteatose hepática associada à disfunção metabólica', false, 5089, 'Gastrointestinal / Hepático');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Esteatose hepática associada à disfunção metabólica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_89_ESTEATOSE_HEPATICA_ASSOCIADA_A_DISFUNCAO', 'Esteatose hepática associada à disfunção metabólica', false, 5089, 'Gastrointestinal / Hepático');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Insuficiência hepática aguda') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_90_INSUFICIENCIA_HEPATICA_AGUDA', 'Insuficiência hepática aguda', false, 5090, 'Gastrointestinal / Hepático');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Insuficiência hepática aguda') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_90_INSUFICIENCIA_HEPATICA_AGUDA', 'Insuficiência hepática aguda', false, 5090, 'Gastrointestinal / Hepático');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Cirrose e hipertensão portal') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_91_CIRROSE_E_HIPERTENSAO_PORTAL', 'Cirrose e hipertensão portal', false, 5091, 'Gastrointestinal / Hepático');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Cirrose e hipertensão portal') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_91_CIRROSE_E_HIPERTENSAO_PORTAL', 'Cirrose e hipertensão portal', false, 5091, 'Gastrointestinal / Hepático');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Trombose da veia porta') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_92_TROMBOSE_DA_VEIA_PORTA', 'Trombose da veia porta', false, 5092, 'Gastrointestinal / Hepático');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Trombose da veia porta') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_92_TROMBOSE_DA_VEIA_PORTA', 'Trombose da veia porta', false, 5092, 'Gastrointestinal / Hepático');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Colelitíase e coledocolitíase') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_93_COLELITIASE_E_COLEDOCOLITIASE', 'Colelitíase e coledocolitíase', false, 5093, 'Gastrointestinal / Hepático');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Colelitíase e coledocolitíase') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_93_COLELITIASE_E_COLEDOCOLITIASE', 'Colelitíase e coledocolitíase', false, 5093, 'Gastrointestinal / Hepático');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Colangite esclerosante primária') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_94_COLANGITE_ESCLEROSANTE_PRIMARIA', 'Colangite esclerosante primária', false, 5094, 'Gastrointestinal / Hepático');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Colangite esclerosante primária') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_94_COLANGITE_ESCLEROSANTE_PRIMARIA', 'Colangite esclerosante primária', false, 5094, 'Gastrointestinal / Hepático');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Pancreatite aguda, recorrente ou crônica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_95_PANCREATITE_AGUDA_RECORRENTE_OU_CRONICA', 'Pancreatite aguda, recorrente ou crônica', false, 5095, 'Gastrointestinal / Hepático');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Pancreatite aguda, recorrente ou crônica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_95_PANCREATITE_AGUDA_RECORRENTE_OU_CRONICA', 'Pancreatite aguda, recorrente ou crônica', false, 5095, 'Gastrointestinal / Hepático');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Insuficiência pancreática exócrina') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_96_INSUFICIENCIA_PANCREATICA_EXOCRINA', 'Insuficiência pancreática exócrina', false, 5096, 'Gastrointestinal / Hepático');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Insuficiência pancreática exócrina') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_96_INSUFICIENCIA_PANCREATICA_EXOCRINA', 'Insuficiência pancreática exócrina', false, 5096, 'Gastrointestinal / Hepático');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Fibrose cística com comprometimento digestivo') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_97_FIBROSE_CISTICA_COM_COMPROMETIMENTO_DIGE', 'Fibrose cística com comprometimento digestivo', false, 5097, 'Gastrointestinal / Hepático');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Fibrose cística com comprometimento digestivo') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_97_FIBROSE_CISTICA_COM_COMPROMETIMENTO_DIGE', 'Fibrose cística com comprometimento digestivo', false, 5097, 'Gastrointestinal / Hepático');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Síndrome nefrótica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_98_SINDROME_NEFROTICA', 'Síndrome nefrótica', false, 5098, 'Renal');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Síndrome nefrótica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_98_SINDROME_NEFROTICA', 'Síndrome nefrótica', false, 5098, 'Renal');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Síndrome nefrítica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_99_SINDROME_NEFRITICA', 'Síndrome nefrítica', false, 5099, 'Renal');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Síndrome nefrítica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_99_SINDROME_NEFRITICA', 'Síndrome nefrítica', false, 5099, 'Renal');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Glomerulonefrite pós-infecciosa') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_100_GLOMERULONEFRITE_POS_INFECCIOSA', 'Glomerulonefrite pós-infecciosa', false, 5100, 'Renal');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Glomerulonefrite pós-infecciosa') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_100_GLOMERULONEFRITE_POS_INFECCIOSA', 'Glomerulonefrite pós-infecciosa', false, 5100, 'Renal');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Nefropatia por IgA') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_101_NEFROPATIA_POR_IGA', 'Nefropatia por IgA', false, 5101, 'Renal');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Nefropatia por IgA') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_101_NEFROPATIA_POR_IGA', 'Nefropatia por IgA', false, 5101, 'Renal');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Nefrite lúpica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_102_NEFRITE_LUPICA', 'Nefrite lúpica', false, 5102, 'Renal');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Nefrite lúpica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_102_NEFRITE_LUPICA', 'Nefrite lúpica', false, 5102, 'Renal');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Glomerulonefrite membranoproliferativa') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_103_GLOMERULONEFRITE_MEMBRANOPROLIFERATIVA', 'Glomerulonefrite membranoproliferativa', false, 5103, 'Renal');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Glomerulonefrite membranoproliferativa') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_103_GLOMERULONEFRITE_MEMBRANOPROLIFERATIVA', 'Glomerulonefrite membranoproliferativa', false, 5103, 'Renal');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Glomerulonefrite rapidamente progressiva') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_104_GLOMERULONEFRITE_RAPIDAMENTE_PROGRESSIVA', 'Glomerulonefrite rapidamente progressiva', false, 5104, 'Renal');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Glomerulonefrite rapidamente progressiva') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_104_GLOMERULONEFRITE_RAPIDAMENTE_PROGRESSIVA', 'Glomerulonefrite rapidamente progressiva', false, 5104, 'Renal');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Síndrome de Alport') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_105_SINDROME_DE_ALPORT', 'Síndrome de Alport', false, 5105, 'Renal');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Síndrome de Alport') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_105_SINDROME_DE_ALPORT', 'Síndrome de Alport', false, 5105, 'Renal');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Doença de lesões mínimas') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_106_DOENCA_DE_LESOES_MINIMAS', 'Doença de lesões mínimas', false, 5106, 'Renal');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Doença de lesões mínimas') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_106_DOENCA_DE_LESOES_MINIMAS', 'Doença de lesões mínimas', false, 5106, 'Renal');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Glomeruloesclerose segmentar e focal') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_107_GLOMERULOESCLEROSE_SEGMENTAR_E_FOCAL', 'Glomeruloesclerose segmentar e focal', false, 5107, 'Renal');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Glomeruloesclerose segmentar e focal') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_107_GLOMERULOESCLEROSE_SEGMENTAR_E_FOCAL', 'Glomeruloesclerose segmentar e focal', false, 5107, 'Renal');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Lesão renal aguda') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_108_LESAO_RENAL_AGUDA', 'Lesão renal aguda', false, 5108, 'Renal');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Lesão renal aguda') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_108_LESAO_RENAL_AGUDA', 'Lesão renal aguda', false, 5108, 'Renal');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Doença renal crônica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_109_DOENCA_RENAL_CRONICA', 'Doença renal crônica', false, 5109, 'Renal');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Doença renal crônica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_109_DOENCA_RENAL_CRONICA', 'Doença renal crônica', false, 5109, 'Renal');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Nefrite intersticial aguda') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_110_NEFRITE_INTERSTICIAL_AGUDA', 'Nefrite intersticial aguda', false, 5110, 'Renal');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Nefrite intersticial aguda') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_110_NEFRITE_INTERSTICIAL_AGUDA', 'Nefrite intersticial aguda', false, 5110, 'Renal');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Necrose tubular aguda') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_111_NECROSE_TUBULAR_AGUDA', 'Necrose tubular aguda', false, 5111, 'Renal');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Necrose tubular aguda') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_111_NECROSE_TUBULAR_AGUDA', 'Necrose tubular aguda', false, 5111, 'Renal');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Nefrotoxicidade medicamentosa') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_112_NEFROTOXICIDADE_MEDICAMENTOSA', 'Nefrotoxicidade medicamentosa', false, 5112, 'Renal');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Nefrotoxicidade medicamentosa') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_112_NEFROTOXICIDADE_MEDICAMENTOSA', 'Nefrotoxicidade medicamentosa', false, 5112, 'Renal');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Síndrome hemolítico-urêmica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_113_SINDROME_HEMOLITICO_UREMICA', 'Síndrome hemolítico-urêmica', false, 5113, 'Renal');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Síndrome hemolítico-urêmica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_113_SINDROME_HEMOLITICO_UREMICA', 'Síndrome hemolítico-urêmica', false, 5113, 'Renal');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Distúrbios hidroeletrolíticos e acidobásicos') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_114_DISTURBIOS_HIDROELETROLITICOS_E_ACIDOBAS', 'Distúrbios hidroeletrolíticos e acidobásicos', false, 5114, 'Renal');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Distúrbios hidroeletrolíticos e acidobásicos') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_114_DISTURBIOS_HIDROELETROLITICOS_E_ACIDOBAS', 'Distúrbios hidroeletrolíticos e acidobásicos', false, 5114, 'Renal');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Acidose tubular renal') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_115_ACIDOSE_TUBULAR_RENAL', 'Acidose tubular renal', false, 5115, 'Renal');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Acidose tubular renal') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_115_ACIDOSE_TUBULAR_RENAL', 'Acidose tubular renal', false, 5115, 'Renal');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Síndrome de Bartter') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_116_SINDROME_DE_BARTTER', 'Síndrome de Bartter', false, 5116, 'Renal');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Síndrome de Bartter') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_116_SINDROME_DE_BARTTER', 'Síndrome de Bartter', false, 5116, 'Renal');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Síndrome de Gitelman') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_117_SINDROME_DE_GITELMAN', 'Síndrome de Gitelman', false, 5117, 'Renal');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Síndrome de Gitelman') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_117_SINDROME_DE_GITELMAN', 'Síndrome de Gitelman', false, 5117, 'Renal');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Diabetes insípido nefrogênico') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_118_DIABETES_INSIPIDO_NEFROGENICO', 'Diabetes insípido nefrogênico', false, 5118, 'Renal');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Diabetes insípido nefrogênico') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_118_DIABETES_INSIPIDO_NEFROGENICO', 'Diabetes insípido nefrogênico', false, 5118, 'Renal');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Síndrome de Fanconi') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_119_SINDROME_DE_FANCONI', 'Síndrome de Fanconi', false, 5119, 'Renal');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Síndrome de Fanconi') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_119_SINDROME_DE_FANCONI', 'Síndrome de Fanconi', false, 5119, 'Renal');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Infecção do trato urinário') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_120_INFECCAO_DO_TRATO_URINARIO', 'Infecção do trato urinário', false, 5120, 'Renal');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Infecção do trato urinário') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_120_INFECCAO_DO_TRATO_URINARIO', 'Infecção do trato urinário', false, 5120, 'Renal');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Pielonefrite') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_121_PIELONEFRITE', 'Pielonefrite', false, 5121, 'Renal');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Pielonefrite') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_121_PIELONEFRITE', 'Pielonefrite', false, 5121, 'Renal');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Refluxo vesicoureteral') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_122_REFLUXO_VESICOURETERAL', 'Refluxo vesicoureteral', false, 5122, 'Renal');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Refluxo vesicoureteral') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_122_REFLUXO_VESICOURETERAL', 'Refluxo vesicoureteral', false, 5122, 'Renal');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Hidronefrose') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_123_HIDRONEFROSE', 'Hidronefrose', false, 5123, 'Renal');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Hidronefrose') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_123_HIDRONEFROSE', 'Hidronefrose', false, 5123, 'Renal');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Obstrução da junção ureteropélvica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_124_OBSTRUCAO_DA_JUNCAO_URETEROPELVICA', 'Obstrução da junção ureteropélvica', false, 5124, 'Renal');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Obstrução da junção ureteropélvica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_124_OBSTRUCAO_DA_JUNCAO_URETEROPELVICA', 'Obstrução da junção ureteropélvica', false, 5124, 'Renal');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Válvula de uretra posterior') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_125_VALVULA_DE_URETRA_POSTERIOR', 'Válvula de uretra posterior', false, 5125, 'Renal');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Válvula de uretra posterior') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_125_VALVULA_DE_URETRA_POSTERIOR', 'Válvula de uretra posterior', false, 5125, 'Renal');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Megaureter') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_126_MEGAURETER', 'Megaureter', false, 5126, 'Renal');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Megaureter') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_126_MEGAURETER', 'Megaureter', false, 5126, 'Renal');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Bexiga neurogênica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_127_BEXIGA_NEUROGENICA', 'Bexiga neurogênica', false, 5127, 'Renal');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Bexiga neurogênica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_127_BEXIGA_NEUROGENICA', 'Bexiga neurogênica', false, 5127, 'Renal');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Disfunção miccional e enurese') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_128_DISFUNCAO_MICCIONAL_E_ENURESE', 'Disfunção miccional e enurese', false, 5128, 'Renal');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Disfunção miccional e enurese') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_128_DISFUNCAO_MICCIONAL_E_ENURESE', 'Disfunção miccional e enurese', false, 5128, 'Renal');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Rim multicístico displásico') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_129_RIM_MULTICISTICO_DISPLASICO', 'Rim multicístico displásico', false, 5129, 'Renal');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Rim multicístico displásico') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_129_RIM_MULTICISTICO_DISPLASICO', 'Rim multicístico displásico', false, 5129, 'Renal');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Doença renal policística') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_130_DOENCA_RENAL_POLICISTICA', 'Doença renal policística', false, 5130, 'Renal');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Doença renal policística') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_130_DOENCA_RENAL_POLICISTICA', 'Doença renal policística', false, 5130, 'Renal');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Hipoplasia ou displasia renal') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_131_HIPOPLASIA_OU_DISPLASIA_RENAL', 'Hipoplasia ou displasia renal', false, 5131, 'Renal');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Hipoplasia ou displasia renal') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_131_HIPOPLASIA_OU_DISPLASIA_RENAL', 'Hipoplasia ou displasia renal', false, 5131, 'Renal');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Anomalias congênitas dos rins e trato urinário (CAKUT)') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_132_ANOMALIAS_CONGENITAS_DOS_RINS_E_TRATO_UR', 'Anomalias congênitas dos rins e trato urinário (CAKUT)', false, 5132, 'Renal');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Anomalias congênitas dos rins e trato urinário (CAKUT)') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_132_ANOMALIAS_CONGENITAS_DOS_RINS_E_TRATO_UR', 'Anomalias congênitas dos rins e trato urinário (CAKUT)', false, 5132, 'Renal');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Hipertensão arterial sistêmica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_133_HIPERTENSAO_ARTERIAL_SISTEMICA', 'Hipertensão arterial sistêmica', false, 5133, 'Renal');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Hipertensão arterial sistêmica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_133_HIPERTENSAO_ARTERIAL_SISTEMICA', 'Hipertensão arterial sistêmica', false, 5133, 'Renal');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Hematúria e proteinúria') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_134_HEMATURIA_E_PROTEINURIA', 'Hematúria e proteinúria', false, 5134, 'Renal');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Hematúria e proteinúria') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_134_HEMATURIA_E_PROTEINURIA', 'Hematúria e proteinúria', false, 5134, 'Renal');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Litíase urinária') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_135_LITIASE_URINARIA', 'Litíase urinária', false, 5135, 'Renal');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Litíase urinária') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_135_LITIASE_URINARIA', 'Litíase urinária', false, 5135, 'Renal');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Hipercalciúria') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_136_HIPERCALCIURIA', 'Hipercalciúria', false, 5136, 'Renal');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Hipercalciúria') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_136_HIPERCALCIURIA', 'Hipercalciúria', false, 5136, 'Renal');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Nefrocalcinose') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_137_NEFROCALCINOSE', 'Nefrocalcinose', false, 5137, 'Renal');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Nefrocalcinose') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_137_NEFROCALCINOSE', 'Nefrocalcinose', false, 5137, 'Renal');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Infecções de vias aéreas superiores') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_138_INFECCOES_DE_VIAS_AEREAS_SUPERIORES', 'Infecções de vias aéreas superiores', false, 5138, 'Infeccioso / Séptico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Infecções de vias aéreas superiores') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_138_INFECCOES_DE_VIAS_AEREAS_SUPERIORES', 'Infecções de vias aéreas superiores', false, 5138, 'Infeccioso / Séptico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Otite média aguda') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_139_OTITE_MEDIA_AGUDA', 'Otite média aguda', false, 5139, 'Infeccioso / Séptico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Otite média aguda') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_139_OTITE_MEDIA_AGUDA', 'Otite média aguda', false, 5139, 'Infeccioso / Séptico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Sinusite bacteriana') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_140_SINUSITE_BACTERIANA', 'Sinusite bacteriana', false, 5140, 'Infeccioso / Séptico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Sinusite bacteriana') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_140_SINUSITE_BACTERIANA', 'Sinusite bacteriana', false, 5140, 'Infeccioso / Séptico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Faringoamigdalite') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_141_FARINGOAMIGDALITE', 'Faringoamigdalite', false, 5141, 'Infeccioso / Séptico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Faringoamigdalite') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_141_FARINGOAMIGDALITE', 'Faringoamigdalite', false, 5141, 'Infeccioso / Séptico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Bronquiolite viral aguda') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_142_BRONQUIOLITE_VIRAL_AGUDA', 'Bronquiolite viral aguda', false, 5142, 'Infeccioso / Séptico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Bronquiolite viral aguda') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_142_BRONQUIOLITE_VIRAL_AGUDA', 'Bronquiolite viral aguda', false, 5142, 'Infeccioso / Séptico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Pneumonia adquirida na comunidade') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_143_PNEUMONIA_ADQUIRIDA_NA_COMUNIDADE', 'Pneumonia adquirida na comunidade', false, 5143, 'Infeccioso / Séptico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Pneumonia adquirida na comunidade') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_143_PNEUMONIA_ADQUIRIDA_NA_COMUNIDADE', 'Pneumonia adquirida na comunidade', false, 5143, 'Infeccioso / Séptico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Pneumonia hospitalar ou associada à ventilação mecânica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_144_PNEUMONIA_HOSPITALAR_OU_ASSOCIADA_A_VENT', 'Pneumonia hospitalar ou associada à ventilação mecânica', false, 5144, 'Infeccioso / Séptico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Pneumonia hospitalar ou associada à ventilação mecânica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_144_PNEUMONIA_HOSPITALAR_OU_ASSOCIADA_A_VENT', 'Pneumonia hospitalar ou associada à ventilação mecânica', false, 5144, 'Infeccioso / Séptico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Tuberculose') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_145_TUBERCULOSE', 'Tuberculose', false, 5145, 'Infeccioso / Séptico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Tuberculose') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_145_TUBERCULOSE', 'Tuberculose', false, 5145, 'Infeccioso / Séptico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Influenza') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_146_INFLUENZA', 'Influenza', false, 5146, 'Infeccioso / Séptico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Influenza') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_146_INFLUENZA', 'Influenza', false, 5146, 'Infeccioso / Séptico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'COVID-19') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_147_COVID_19', 'COVID-19', false, 5147, 'Infeccioso / Séptico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'COVID-19') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_147_COVID_19', 'COVID-19', false, 5147, 'Infeccioso / Séptico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Coqueluche') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_148_COQUELUCHE', 'Coqueluche', false, 5148, 'Infeccioso / Séptico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Coqueluche') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_148_COQUELUCHE', 'Coqueluche', false, 5148, 'Infeccioso / Séptico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Sepse e choque séptico') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_149_SEPSE_E_CHOQUE_SEPTICO', 'Sepse e choque séptico', false, 5149, 'Infeccioso / Séptico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Sepse e choque séptico') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_149_SEPSE_E_CHOQUE_SEPTICO', 'Sepse e choque séptico', false, 5149, 'Infeccioso / Séptico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Infecções associadas à assistência à saúde') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_150_INFECCOES_ASSOCIADAS_A_ASSISTENCIA_A_SAU', 'Infecções associadas à assistência à saúde', false, 5150, 'Infeccioso / Séptico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Infecções associadas à assistência à saúde') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_150_INFECCOES_ASSOCIADAS_A_ASSISTENCIA_A_SAU', 'Infecções associadas à assistência à saúde', false, 5150, 'Infeccioso / Séptico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Meningite bacteriana, viral ou fúngica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_151_MENINGITE_BACTERIANA_VIRAL_OU_FUNGICA', 'Meningite bacteriana, viral ou fúngica', false, 5151, 'Infeccioso / Séptico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Meningite bacteriana, viral ou fúngica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_151_MENINGITE_BACTERIANA_VIRAL_OU_FUNGICA', 'Meningite bacteriana, viral ou fúngica', false, 5151, 'Infeccioso / Séptico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Encefalite e meningoencefalite') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_152_ENCEFALITE_E_MENINGOENCEFALITE', 'Encefalite e meningoencefalite', false, 5152, 'Infeccioso / Séptico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Encefalite e meningoencefalite') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_152_ENCEFALITE_E_MENINGOENCEFALITE', 'Encefalite e meningoencefalite', false, 5152, 'Infeccioso / Séptico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Abscesso cerebral') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_153_ABSCESSO_CEREBRAL', 'Abscesso cerebral', false, 5153, 'Infeccioso / Séptico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Abscesso cerebral') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_153_ABSCESSO_CEREBRAL', 'Abscesso cerebral', false, 5153, 'Infeccioso / Séptico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Neurotuberculose') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_154_NEUROTUBERCULOSE', 'Neurotuberculose', false, 5154, 'Infeccioso / Séptico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Neurotuberculose') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_154_NEUROTUBERCULOSE', 'Neurotuberculose', false, 5154, 'Infeccioso / Séptico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Endocardite infecciosa') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_155_ENDOCARDITE_INFECCIOSA', 'Endocardite infecciosa', false, 5155, 'Infeccioso / Séptico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Endocardite infecciosa') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_155_ENDOCARDITE_INFECCIOSA', 'Endocardite infecciosa', false, 5155, 'Infeccioso / Séptico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Miocardite e pericardite infecciosas') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_156_MIOCARDITE_E_PERICARDITE_INFECCIOSAS', 'Miocardite e pericardite infecciosas', false, 5156, 'Infeccioso / Séptico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Miocardite e pericardite infecciosas') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_156_MIOCARDITE_E_PERICARDITE_INFECCIOSAS', 'Miocardite e pericardite infecciosas', false, 5156, 'Infeccioso / Séptico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Impetigo, celulite e erisipela') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_157_IMPETIGO_CELULITE_E_ERISIPELA', 'Impetigo, celulite e erisipela', false, 5157, 'Infeccioso / Séptico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Impetigo, celulite e erisipela') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_157_IMPETIGO_CELULITE_E_ERISIPELA', 'Impetigo, celulite e erisipela', false, 5157, 'Infeccioso / Séptico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Abscessos cutâneos') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_158_ABSCESSOS_CUTANEOS', 'Abscessos cutâneos', false, 5158, 'Infeccioso / Séptico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Abscessos cutâneos') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_158_ABSCESSOS_CUTANEOS', 'Abscessos cutâneos', false, 5158, 'Infeccioso / Séptico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Síndrome da pele escaldada estafilocócica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_159_SINDROME_DA_PELE_ESCALDADA_ESTAFILOCOCIC', 'Síndrome da pele escaldada estafilocócica', false, 5159, 'Infeccioso / Séptico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Síndrome da pele escaldada estafilocócica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_159_SINDROME_DA_PELE_ESCALDADA_ESTAFILOCOCIC', 'Síndrome da pele escaldada estafilocócica', false, 5159, 'Infeccioso / Séptico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Osteomielite') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_160_OSTEOMIELITE', 'Osteomielite', false, 5160, 'Infeccioso / Séptico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Osteomielite') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_160_OSTEOMIELITE', 'Osteomielite', false, 5160, 'Infeccioso / Séptico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Artrite séptica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_161_ARTRITE_SEPTICA', 'Artrite séptica', false, 5161, 'Infeccioso / Séptico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Artrite séptica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_161_ARTRITE_SEPTICA', 'Artrite séptica', false, 5161, 'Infeccioso / Séptico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Piomiosite') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_162_PIOMIOSITE', 'Piomiosite', false, 5162, 'Infeccioso / Séptico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Piomiosite') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_162_PIOMIOSITE', 'Piomiosite', false, 5162, 'Infeccioso / Séptico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Dengue') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_163_DENGUE', 'Dengue', false, 5163, 'Infeccioso / Séptico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Dengue') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_163_DENGUE', 'Dengue', false, 5163, 'Infeccioso / Séptico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Chikungunya') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_164_CHIKUNGUNYA', 'Chikungunya', false, 5164, 'Infeccioso / Séptico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Chikungunya') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_164_CHIKUNGUNYA', 'Chikungunya', false, 5164, 'Infeccioso / Séptico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Zika') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_165_ZIKA', 'Zika', false, 5165, 'Infeccioso / Séptico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Zika') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_165_ZIKA', 'Zika', false, 5165, 'Infeccioso / Séptico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Malária') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_166_MALARIA', 'Malária', false, 5166, 'Infeccioso / Séptico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Malária') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_166_MALARIA', 'Malária', false, 5166, 'Infeccioso / Séptico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Leishmaniose visceral e tegumentar') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_167_LEISHMANIOSE_VISCERAL_E_TEGUMENTAR', 'Leishmaniose visceral e tegumentar', false, 5167, 'Infeccioso / Séptico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Leishmaniose visceral e tegumentar') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_167_LEISHMANIOSE_VISCERAL_E_TEGUMENTAR', 'Leishmaniose visceral e tegumentar', false, 5167, 'Infeccioso / Séptico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Doença de Chagas') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_168_DOENCA_DE_CHAGAS', 'Doença de Chagas', false, 5168, 'Infeccioso / Séptico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Doença de Chagas') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_168_DOENCA_DE_CHAGAS', 'Doença de Chagas', false, 5168, 'Infeccioso / Séptico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Febre amarela') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_169_FEBRE_AMARELA', 'Febre amarela', false, 5169, 'Infeccioso / Séptico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Febre amarela') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_169_FEBRE_AMARELA', 'Febre amarela', false, 5169, 'Infeccioso / Séptico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Leptospirose') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_170_LEPTOSPIROSE', 'Leptospirose', false, 5170, 'Infeccioso / Séptico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Leptospirose') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_170_LEPTOSPIROSE', 'Leptospirose', false, 5170, 'Infeccioso / Séptico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Riquetsioses') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_171_RIQUETSIOSES', 'Riquetsioses', false, 5171, 'Infeccioso / Séptico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Riquetsioses') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_171_RIQUETSIOSES', 'Riquetsioses', false, 5171, 'Infeccioso / Séptico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Sífilis congênita') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_172_SIFILIS_CONGENITA', 'Sífilis congênita', false, 5172, 'Infeccioso / Séptico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Sífilis congênita') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_172_SIFILIS_CONGENITA', 'Sífilis congênita', false, 5172, 'Infeccioso / Séptico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Toxoplasmose congênita') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_173_TOXOPLASMOSE_CONGENITA', 'Toxoplasmose congênita', false, 5173, 'Infeccioso / Séptico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Toxoplasmose congênita') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_173_TOXOPLASMOSE_CONGENITA', 'Toxoplasmose congênita', false, 5173, 'Infeccioso / Séptico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Citomegalovirose congênita') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_174_CITOMEGALOVIROSE_CONGENITA', 'Citomegalovirose congênita', false, 5174, 'Infeccioso / Séptico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Citomegalovirose congênita') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_174_CITOMEGALOVIROSE_CONGENITA', 'Citomegalovirose congênita', false, 5174, 'Infeccioso / Séptico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Rubéola congênita') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_175_RUBEOLA_CONGENITA', 'Rubéola congênita', false, 5175, 'Infeccioso / Séptico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Rubéola congênita') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_175_RUBEOLA_CONGENITA', 'Rubéola congênita', false, 5175, 'Infeccioso / Séptico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Herpes neonatal') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_176_HERPES_NEONATAL', 'Herpes neonatal', false, 5176, 'Infeccioso / Séptico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Herpes neonatal') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_176_HERPES_NEONATAL', 'Herpes neonatal', false, 5176, 'Infeccioso / Séptico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'HIV perinatal') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_177_HIV_PERINATAL', 'HIV perinatal', false, 5177, 'Infeccioso / Séptico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'HIV perinatal') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_177_HIV_PERINATAL', 'HIV perinatal', false, 5177, 'Infeccioso / Séptico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Hepatites B e C perinatais') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_178_HEPATITES_B_E_C_PERINATAIS', 'Hepatites B e C perinatais', false, 5178, 'Infeccioso / Séptico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Hepatites B e C perinatais') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_178_HEPATITES_B_E_C_PERINATAIS', 'Hepatites B e C perinatais', false, 5178, 'Infeccioso / Séptico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Sepse neonatal precoce ou tardia') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_179_SEPSE_NEONATAL_PRECOCE_OU_TARDIA', 'Sepse neonatal precoce ou tardia', false, 5179, 'Infeccioso / Séptico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Sepse neonatal precoce ou tardia') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_179_SEPSE_NEONATAL_PRECOCE_OU_TARDIA', 'Sepse neonatal precoce ou tardia', false, 5179, 'Infeccioso / Séptico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Infecção pelo HIV') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_180_INFECCAO_PELO_HIV', 'Infecção pelo HIV', false, 5180, 'Infeccioso / Séptico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Infecção pelo HIV') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_180_INFECCAO_PELO_HIV', 'Infecção pelo HIV', false, 5180, 'Infeccioso / Séptico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Infecções oportunistas') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_181_INFECCOES_OPORTUNISTAS', 'Infecções oportunistas', false, 5181, 'Infeccioso / Séptico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Infecções oportunistas') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_181_INFECCOES_OPORTUNISTAS', 'Infecções oportunistas', false, 5181, 'Infeccioso / Séptico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Infecções em imunodeficientes, transplantados ou neutropênicos') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_182_INFECCOES_EM_IMUNODEFICIENTES_TRANSPLANT', 'Infecções em imunodeficientes, transplantados ou neutropênicos', false, 5182, 'Infeccioso / Séptico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Infecções em imunodeficientes, transplantados ou neutropênicos') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_182_INFECCOES_EM_IMUNODEFICIENTES_TRANSPLANT', 'Infecções em imunodeficientes, transplantados ou neutropênicos', false, 5182, 'Infeccioso / Séptico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Infecções relacionadas a cateter') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_183_INFECCOES_RELACIONADAS_A_CATETER', 'Infecções relacionadas a cateter', false, 5183, 'Infeccioso / Séptico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Infecções relacionadas a cateter') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_183_INFECCOES_RELACIONADAS_A_CATETER', 'Infecções relacionadas a cateter', false, 5183, 'Infeccioso / Séptico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Infecções por bactérias multirresistentes') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_184_INFECCOES_POR_BACTERIAS_MULTIRRESISTENTE', 'Infecções por bactérias multirresistentes', false, 5184, 'Infeccioso / Séptico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Infecções por bactérias multirresistentes') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_184_INFECCOES_POR_BACTERIAS_MULTIRRESISTENTE', 'Infecções por bactérias multirresistentes', false, 5184, 'Infeccioso / Séptico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Infecções fúngicas invasivas') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_185_INFECCOES_FUNGICAS_INVASIVAS', 'Infecções fúngicas invasivas', false, 5185, 'Infeccioso / Séptico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Infecções fúngicas invasivas') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_185_INFECCOES_FUNGICAS_INVASIVAS', 'Infecções fúngicas invasivas', false, 5185, 'Infeccioso / Séptico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Febre de origem indeterminada') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_186_FEBRE_DE_ORIGEM_INDETERMINADA', 'Febre de origem indeterminada', false, 5186, 'Infeccioso / Séptico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Febre de origem indeterminada') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_186_FEBRE_DE_ORIGEM_INDETERMINADA', 'Febre de origem indeterminada', false, 5186, 'Infeccioso / Séptico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Laringite viral/crupe') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_187_LARINGITE_VIRAL_CRUPE', 'Laringite viral/crupe', false, 5187, 'Respiratório');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Laringite viral/crupe') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_187_LARINGITE_VIRAL_CRUPE', 'Laringite viral/crupe', false, 5187, 'Respiratório');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Epiglotite') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_188_EPIGLOTITE', 'Epiglotite', false, 5188, 'Respiratório');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Epiglotite') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_188_EPIGLOTITE', 'Epiglotite', false, 5188, 'Respiratório');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Traqueíte bacteriana') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_189_TRAQUEITE_BACTERIANA', 'Traqueíte bacteriana', false, 5189, 'Respiratório');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Traqueíte bacteriana') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_189_TRAQUEITE_BACTERIANA', 'Traqueíte bacteriana', false, 5189, 'Respiratório');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Laringomalácia e traqueomalácia') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_190_LARINGOMALACIA_E_TRAQUEOMALACIA', 'Laringomalácia e traqueomalácia', false, 5190, 'Respiratório');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Laringomalácia e traqueomalácia') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_190_LARINGOMALACIA_E_TRAQUEOMALACIA', 'Laringomalácia e traqueomalácia', false, 5190, 'Respiratório');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Estenose subglótica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_191_ESTENOSE_SUBGLOTICA', 'Estenose subglótica', false, 5191, 'Respiratório');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Estenose subglótica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_191_ESTENOSE_SUBGLOTICA', 'Estenose subglótica', false, 5191, 'Respiratório');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Paralisia de cordas vocais') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_192_PARALISIA_DE_CORDAS_VOCAIS', 'Paralisia de cordas vocais', false, 5192, 'Respiratório');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Paralisia de cordas vocais') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_192_PARALISIA_DE_CORDAS_VOCAIS', 'Paralisia de cordas vocais', false, 5192, 'Respiratório');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Obstrução por corpo estranho') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_193_OBSTRUCAO_POR_CORPO_ESTRANHO', 'Obstrução por corpo estranho', false, 5193, 'Respiratório');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Obstrução por corpo estranho') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_193_OBSTRUCAO_POR_CORPO_ESTRANHO', 'Obstrução por corpo estranho', false, 5193, 'Respiratório');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Abscesso retrofaríngeo ou peritonsilar') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_194_ABSCESSO_RETROFARINGEO_OU_PERITONSILAR', 'Abscesso retrofaríngeo ou peritonsilar', false, 5194, 'Respiratório');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Abscesso retrofaríngeo ou peritonsilar') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_194_ABSCESSO_RETROFARINGEO_OU_PERITONSILAR', 'Abscesso retrofaríngeo ou peritonsilar', false, 5194, 'Respiratório');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Angioedema com comprometimento da via aérea') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_195_ANGIOEDEMA_COM_COMPROMETIMENTO_DA_VIA_AE', 'Angioedema com comprometimento da via aérea', false, 5195, 'Respiratório');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Angioedema com comprometimento da via aérea') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_195_ANGIOEDEMA_COM_COMPROMETIMENTO_DA_VIA_AE', 'Angioedema com comprometimento da via aérea', false, 5195, 'Respiratório');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Papilomatose respiratória recorrente') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_196_PAPILOMATOSE_RESPIRATORIA_RECORRENTE', 'Papilomatose respiratória recorrente', false, 5196, 'Respiratório');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Papilomatose respiratória recorrente') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_196_PAPILOMATOSE_RESPIRATORIA_RECORRENTE', 'Papilomatose respiratória recorrente', false, 5196, 'Respiratório');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Asma') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_197_ASMA', 'Asma', false, 5197, 'Respiratório');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Asma') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_197_ASMA', 'Asma', false, 5197, 'Respiratório');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Estado de mal asmático') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_198_ESTADO_DE_MAL_ASMATICO', 'Estado de mal asmático', false, 5198, 'Respiratório');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Estado de mal asmático') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_198_ESTADO_DE_MAL_ASMATICO', 'Estado de mal asmático', false, 5198, 'Respiratório');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Sibilância recorrente do lactente') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_199_SIBILANCIA_RECORRENTE_DO_LACTENTE', 'Sibilância recorrente do lactente', false, 5199, 'Respiratório');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Sibilância recorrente do lactente') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_199_SIBILANCIA_RECORRENTE_DO_LACTENTE', 'Sibilância recorrente do lactente', false, 5199, 'Respiratório');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Pneumonia comunitária ou hospitalar') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_200_PNEUMONIA_COMUNITARIA_OU_HOSPITALAR', 'Pneumonia comunitária ou hospitalar', false, 5200, 'Respiratório');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Pneumonia comunitária ou hospitalar') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_200_PNEUMONIA_COMUNITARIA_OU_HOSPITALAR', 'Pneumonia comunitária ou hospitalar', false, 5200, 'Respiratório');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Pneumonia aspirativa') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_201_PNEUMONIA_ASPIRATIVA', 'Pneumonia aspirativa', false, 5201, 'Respiratório');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Pneumonia aspirativa') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_201_PNEUMONIA_ASPIRATIVA', 'Pneumonia aspirativa', false, 5201, 'Respiratório');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Pneumonia grave ou necrosante') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_202_PNEUMONIA_GRAVE_OU_NECROSANTE', 'Pneumonia grave ou necrosante', false, 5202, 'Respiratório');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Pneumonia grave ou necrosante') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_202_PNEUMONIA_GRAVE_OU_NECROSANTE', 'Pneumonia grave ou necrosante', false, 5202, 'Respiratório');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Derrame pleural parapneumônico') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_203_DERRAME_PLEURAL_PARAPNEUMONICO', 'Derrame pleural parapneumônico', false, 5203, 'Respiratório');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Derrame pleural parapneumônico') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_203_DERRAME_PLEURAL_PARAPNEUMONICO', 'Derrame pleural parapneumônico', false, 5203, 'Respiratório');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Empiema pleural') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_204_EMPIEMA_PLEURAL', 'Empiema pleural', false, 5204, 'Respiratório');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Empiema pleural') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_204_EMPIEMA_PLEURAL', 'Empiema pleural', false, 5204, 'Respiratório');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Abscesso pulmonar') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_205_ABSCESSO_PULMONAR', 'Abscesso pulmonar', false, 5205, 'Respiratório');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Abscesso pulmonar') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_205_ABSCESSO_PULMONAR', 'Abscesso pulmonar', false, 5205, 'Respiratório');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Pneumatocele') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_206_PNEUMATOCELE', 'Pneumatocele', false, 5206, 'Respiratório');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Pneumatocele') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_206_PNEUMATOCELE', 'Pneumatocele', false, 5206, 'Respiratório');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Atelectasia') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_207_ATELECTASIA', 'Atelectasia', false, 5207, 'Respiratório');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Atelectasia') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_207_ATELECTASIA', 'Atelectasia', false, 5207, 'Respiratório');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Bronquiectasias') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_208_BRONQUIECTASIAS', 'Bronquiectasias', false, 5208, 'Respiratório');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Bronquiectasias') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_208_BRONQUIECTASIAS', 'Bronquiectasias', false, 5208, 'Respiratório');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Tuberculose pulmonar') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_209_TUBERCULOSE_PULMONAR', 'Tuberculose pulmonar', false, 5209, 'Respiratório');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Tuberculose pulmonar') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_209_TUBERCULOSE_PULMONAR', 'Tuberculose pulmonar', false, 5209, 'Respiratório');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Hemorragia pulmonar/hemoptise') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_210_HEMORRAGIA_PULMONAR_HEMOPTISE', 'Hemorragia pulmonar/hemoptise', false, 5210, 'Respiratório');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Hemorragia pulmonar/hemoptise') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_210_HEMORRAGIA_PULMONAR_HEMOPTISE', 'Hemorragia pulmonar/hemoptise', false, 5210, 'Respiratório');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Doença pulmonar intersticial') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_211_DOENCA_PULMONAR_INTERSTICIAL', 'Doença pulmonar intersticial', false, 5211, 'Respiratório');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Doença pulmonar intersticial') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_211_DOENCA_PULMONAR_INTERSTICIAL', 'Doença pulmonar intersticial', false, 5211, 'Respiratório');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Fibrose pulmonar') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_212_FIBROSE_PULMONAR', 'Fibrose pulmonar', false, 5212, 'Respiratório');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Fibrose pulmonar') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_212_FIBROSE_PULMONAR', 'Fibrose pulmonar', false, 5212, 'Respiratório');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Bronquiolite obliterante') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_213_BRONQUIOLITE_OBLITERANTE', 'Bronquiolite obliterante', false, 5213, 'Respiratório');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Bronquiolite obliterante') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_213_BRONQUIOLITE_OBLITERANTE', 'Bronquiolite obliterante', false, 5213, 'Respiratório');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Discinesia ciliar primária') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_214_DISCINESIA_CILIAR_PRIMARIA', 'Discinesia ciliar primária', false, 5214, 'Respiratório');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Discinesia ciliar primária') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_214_DISCINESIA_CILIAR_PRIMARIA', 'Discinesia ciliar primária', false, 5214, 'Respiratório');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Fibrose cística') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_215_FIBROSE_CISTICA', 'Fibrose cística', false, 5215, 'Respiratório');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Fibrose cística') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_215_FIBROSE_CISTICA', 'Fibrose cística', false, 5215, 'Respiratório');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Displasia broncopulmonar') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_216_DISPLASIA_BRONCOPULMONAR', 'Displasia broncopulmonar', false, 5216, 'Respiratório');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Displasia broncopulmonar') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_216_DISPLASIA_BRONCOPULMONAR', 'Displasia broncopulmonar', false, 5216, 'Respiratório');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Hipertensão pulmonar') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_217_HIPERTENSAO_PULMONAR', 'Hipertensão pulmonar', false, 5217, 'Respiratório');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Hipertensão pulmonar') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_217_HIPERTENSAO_PULMONAR', 'Hipertensão pulmonar', false, 5217, 'Respiratório');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Apneia obstrutiva do sono') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_218_APNEIA_OBSTRUTIVA_DO_SONO', 'Apneia obstrutiva do sono', false, 5218, 'Respiratório');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Apneia obstrutiva do sono') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_218_APNEIA_OBSTRUTIVA_DO_SONO', 'Apneia obstrutiva do sono', false, 5218, 'Respiratório');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Insuficiência respiratória aguda hipoxêmica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_219_INSUFICIENCIA_RESPIRATORIA_AGUDA_HIPOXEM', 'Insuficiência respiratória aguda hipoxêmica', false, 5219, 'Respiratório');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Insuficiência respiratória aguda hipoxêmica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_219_INSUFICIENCIA_RESPIRATORIA_AGUDA_HIPOXEM', 'Insuficiência respiratória aguda hipoxêmica', false, 5219, 'Respiratório');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Insuficiência respiratória aguda hipercápnica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_220_INSUFICIENCIA_RESPIRATORIA_AGUDA_HIPERCA', 'Insuficiência respiratória aguda hipercápnica', false, 5220, 'Respiratório');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Insuficiência respiratória aguda hipercápnica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_220_INSUFICIENCIA_RESPIRATORIA_AGUDA_HIPERCA', 'Insuficiência respiratória aguda hipercápnica', false, 5220, 'Respiratório');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Síndrome do desconforto respiratório agudo pediátrico (PARDS)') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_221_SINDROME_DO_DESCONFORTO_RESPIRATORIO_AGU', 'Síndrome do desconforto respiratório agudo pediátrico (PARDS)', false, 5221, 'Respiratório');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Síndrome do desconforto respiratório agudo pediátrico (PARDS)') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_221_SINDROME_DO_DESCONFORTO_RESPIRATORIO_AGU', 'Síndrome do desconforto respiratório agudo pediátrico (PARDS)', false, 5221, 'Respiratório');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Pneumotórax simples ou hipertensivo') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_222_PNEUMOTORAX_SIMPLES_OU_HIPERTENSIVO', 'Pneumotórax simples ou hipertensivo', false, 5222, 'Respiratório');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Pneumotórax simples ou hipertensivo') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_222_PNEUMOTORAX_SIMPLES_OU_HIPERTENSIVO', 'Pneumotórax simples ou hipertensivo', false, 5222, 'Respiratório');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Hemotórax') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_223_HEMOTORAX', 'Hemotórax', false, 5223, 'Respiratório');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Hemotórax') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_223_HEMOTORAX', 'Hemotórax', false, 5223, 'Respiratório');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Quilotórax') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_224_QUILOTORAX', 'Quilotórax', false, 5224, 'Respiratório');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Quilotórax') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_224_QUILOTORAX', 'Quilotórax', false, 5224, 'Respiratório');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Fístula broncopleural e escape aéreo persistente') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_225_FISTULA_BRONCOPLEURAL_E_ESCAPE_AEREO_PER', 'Fístula broncopleural e escape aéreo persistente', false, 5225, 'Respiratório');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Fístula broncopleural e escape aéreo persistente') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_225_FISTULA_BRONCOPLEURAL_E_ESCAPE_AEREO_PER', 'Fístula broncopleural e escape aéreo persistente', false, 5225, 'Respiratório');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Pneumomediastino') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_226_PNEUMOMEDIASTINO', 'Pneumomediastino', false, 5226, 'Respiratório');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Pneumomediastino') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_226_PNEUMOMEDIASTINO', 'Pneumomediastino', false, 5226, 'Respiratório');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Edema agudo de pulmão') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_227_EDEMA_AGUDO_DE_PULMAO', 'Edema agudo de pulmão', false, 5227, 'Respiratório');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Edema agudo de pulmão') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_227_EDEMA_AGUDO_DE_PULMAO', 'Edema agudo de pulmão', false, 5227, 'Respiratório');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Síndrome de aspiração pulmonar') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_228_SINDROME_DE_ASPIRACAO_PULMONAR', 'Síndrome de aspiração pulmonar', false, 5228, 'Respiratório');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Síndrome de aspiração pulmonar') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_228_SINDROME_DE_ASPIRACAO_PULMONAR', 'Síndrome de aspiração pulmonar', false, 5228, 'Respiratório');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Hemorragia alveolar difusa') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_229_HEMORRAGIA_ALVEOLAR_DIFUSA', 'Hemorragia alveolar difusa', false, 5229, 'Respiratório');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Hemorragia alveolar difusa') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_229_HEMORRAGIA_ALVEOLAR_DIFUSA', 'Hemorragia alveolar difusa', false, 5229, 'Respiratório');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Lesão pulmonar associada à ventilação mecânica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_230_LESAO_PULMONAR_ASSOCIADA_A_VENTILACAO_ME', 'Lesão pulmonar associada à ventilação mecânica', false, 5230, 'Respiratório');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Lesão pulmonar associada à ventilação mecânica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_230_LESAO_PULMONAR_ASSOCIADA_A_VENTILACAO_ME', 'Lesão pulmonar associada à ventilação mecânica', false, 5230, 'Respiratório');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Falha de extubação') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_231_FALHA_DE_EXTUBACAO', 'Falha de extubação', false, 5231, 'Respiratório');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Falha de extubação') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_231_FALHA_DE_EXTUBACAO', 'Falha de extubação', false, 5231, 'Respiratório');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Obstrução de cânula de traqueostomia') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_232_OBSTRUCAO_DE_CANULA_DE_TRAQUEOSTOMIA', 'Obstrução de cânula de traqueostomia', false, 5232, 'Respiratório');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Obstrução de cânula de traqueostomia') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_232_OBSTRUCAO_DE_CANULA_DE_TRAQUEOSTOMIA', 'Obstrução de cânula de traqueostomia', false, 5232, 'Respiratório');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Dependência de ventilação mecânica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_233_DEPENDENCIA_DE_VENTILACAO_MECANICA', 'Dependência de ventilação mecânica', false, 5233, 'Respiratório');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Dependência de ventilação mecânica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_233_DEPENDENCIA_DE_VENTILACAO_MECANICA', 'Dependência de ventilação mecânica', false, 5233, 'Respiratório');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Comunicação interatrial') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_234_COMUNICACAO_INTERATRIAL', 'Comunicação interatrial', false, 5234, 'Cardiovascular');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Comunicação interatrial') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_234_COMUNICACAO_INTERATRIAL', 'Comunicação interatrial', false, 5234, 'Cardiovascular');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Comunicação interventricular') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_235_COMUNICACAO_INTERVENTRICULAR', 'Comunicação interventricular', false, 5235, 'Cardiovascular');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Comunicação interventricular') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_235_COMUNICACAO_INTERVENTRICULAR', 'Comunicação interventricular', false, 5235, 'Cardiovascular');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Persistência do canal arterial') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_236_PERSISTENCIA_DO_CANAL_ARTERIAL', 'Persistência do canal arterial', false, 5236, 'Cardiovascular');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Persistência do canal arterial') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_236_PERSISTENCIA_DO_CANAL_ARTERIAL', 'Persistência do canal arterial', false, 5236, 'Cardiovascular');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Defeito do septo atrioventricular') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_237_DEFEITO_DO_SEPTO_ATRIOVENTRICULAR', 'Defeito do septo atrioventricular', false, 5237, 'Cardiovascular');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Defeito do septo atrioventricular') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_237_DEFEITO_DO_SEPTO_ATRIOVENTRICULAR', 'Defeito do septo atrioventricular', false, 5237, 'Cardiovascular');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Coarctação da aorta') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_238_COARCTACAO_DA_AORTA', 'Coarctação da aorta', false, 5238, 'Cardiovascular');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Coarctação da aorta') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_238_COARCTACAO_DA_AORTA', 'Coarctação da aorta', false, 5238, 'Cardiovascular');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Estenose aórtica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_239_ESTENOSE_AORTICA', 'Estenose aórtica', false, 5239, 'Cardiovascular');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Estenose aórtica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_239_ESTENOSE_AORTICA', 'Estenose aórtica', false, 5239, 'Cardiovascular');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Estenose pulmonar') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_240_ESTENOSE_PULMONAR', 'Estenose pulmonar', false, 5240, 'Cardiovascular');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Estenose pulmonar') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_240_ESTENOSE_PULMONAR', 'Estenose pulmonar', false, 5240, 'Cardiovascular');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Tetralogia de Fallot') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_241_TETRALOGIA_DE_FALLOT', 'Tetralogia de Fallot', false, 5241, 'Cardiovascular');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Tetralogia de Fallot') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_241_TETRALOGIA_DE_FALLOT', 'Tetralogia de Fallot', false, 5241, 'Cardiovascular');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Transposição das grandes artérias') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_242_TRANSPOSICAO_DAS_GRANDES_ARTERIAS', 'Transposição das grandes artérias', false, 5242, 'Cardiovascular');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Transposição das grandes artérias') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_242_TRANSPOSICAO_DAS_GRANDES_ARTERIAS', 'Transposição das grandes artérias', false, 5242, 'Cardiovascular');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Tronco arterial comum') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_243_TRONCO_ARTERIAL_COMUM', 'Tronco arterial comum', false, 5243, 'Cardiovascular');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Tronco arterial comum') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_243_TRONCO_ARTERIAL_COMUM', 'Tronco arterial comum', false, 5243, 'Cardiovascular');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Drenagem anômala das veias pulmonares') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_244_DRENAGEM_ANOMALA_DAS_VEIAS_PULMONARES', 'Drenagem anômala das veias pulmonares', false, 5244, 'Cardiovascular');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Drenagem anômala das veias pulmonares') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_244_DRENAGEM_ANOMALA_DAS_VEIAS_PULMONARES', 'Drenagem anômala das veias pulmonares', false, 5244, 'Cardiovascular');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Atresia pulmonar') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_245_ATRESIA_PULMONAR', 'Atresia pulmonar', false, 5245, 'Cardiovascular');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Atresia pulmonar') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_245_ATRESIA_PULMONAR', 'Atresia pulmonar', false, 5245, 'Cardiovascular');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Atresia tricúspide') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_246_ATRESIA_TRICUSPIDE', 'Atresia tricúspide', false, 5246, 'Cardiovascular');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Atresia tricúspide') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_246_ATRESIA_TRICUSPIDE', 'Atresia tricúspide', false, 5246, 'Cardiovascular');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Anomalia de Ebstein') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_247_ANOMALIA_DE_EBSTEIN', 'Anomalia de Ebstein', false, 5247, 'Cardiovascular');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Anomalia de Ebstein') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_247_ANOMALIA_DE_EBSTEIN', 'Anomalia de Ebstein', false, 5247, 'Cardiovascular');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Síndrome do coração esquerdo hipoplásico') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_248_SINDROME_DO_CORACAO_ESQUERDO_HIPOPLASICO', 'Síndrome do coração esquerdo hipoplásico', false, 5248, 'Cardiovascular');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Síndrome do coração esquerdo hipoplásico') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_248_SINDROME_DO_CORACAO_ESQUERDO_HIPOPLASICO', 'Síndrome do coração esquerdo hipoplásico', false, 5248, 'Cardiovascular');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Ventrículo único') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_249_VENTRICULO_UNICO', 'Ventrículo único', false, 5249, 'Cardiovascular');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Ventrículo único') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_249_VENTRICULO_UNICO', 'Ventrículo único', false, 5249, 'Cardiovascular');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Dupla via de saída do ventrículo direito') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_250_DUPLA_VIA_DE_SAIDA_DO_VENTRICULO_DIREITO', 'Dupla via de saída do ventrículo direito', false, 5250, 'Cardiovascular');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Dupla via de saída do ventrículo direito') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_250_DUPLA_VIA_DE_SAIDA_DO_VENTRICULO_DIREITO', 'Dupla via de saída do ventrículo direito', false, 5250, 'Cardiovascular');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Miocardite') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_251_MIOCARDITE', 'Miocardite', false, 5251, 'Cardiovascular');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Miocardite') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_251_MIOCARDITE', 'Miocardite', false, 5251, 'Cardiovascular');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Pericardite') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_252_PERICARDITE', 'Pericardite', false, 5252, 'Cardiovascular');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Pericardite') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_252_PERICARDITE', 'Pericardite', false, 5252, 'Cardiovascular');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Derrame pericárdico') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_253_DERRAME_PERICARDICO', 'Derrame pericárdico', false, 5253, 'Cardiovascular');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Derrame pericárdico') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_253_DERRAME_PERICARDICO', 'Derrame pericárdico', false, 5253, 'Cardiovascular');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Tamponamento cardíaco') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_254_TAMPONAMENTO_CARDIACO', 'Tamponamento cardíaco', false, 5254, 'Cardiovascular');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Tamponamento cardíaco') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_254_TAMPONAMENTO_CARDIACO', 'Tamponamento cardíaco', false, 5254, 'Cardiovascular');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Endocardite infecciosa') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_255_ENDOCARDITE_INFECCIOSA', 'Endocardite infecciosa', false, 5255, 'Cardiovascular');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Endocardite infecciosa') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_255_ENDOCARDITE_INFECCIOSA', 'Endocardite infecciosa', false, 5255, 'Cardiovascular');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Cardiomiopatias dilatada, hipertrófica ou restritiva') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_256_CARDIOMIOPATIAS_DILATADA_HIPERTROFICA_OU', 'Cardiomiopatias dilatada, hipertrófica ou restritiva', false, 5256, 'Cardiovascular');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Cardiomiopatias dilatada, hipertrófica ou restritiva') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_256_CARDIOMIOPATIAS_DILATADA_HIPERTROFICA_OU', 'Cardiomiopatias dilatada, hipertrófica ou restritiva', false, 5256, 'Cardiovascular');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Doença cardíaca reumática') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_257_DOENCA_CARDIACA_REUMATICA', 'Doença cardíaca reumática', false, 5257, 'Cardiovascular');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Doença cardíaca reumática') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_257_DOENCA_CARDIACA_REUMATICA', 'Doença cardíaca reumática', false, 5257, 'Cardiovascular');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Comprometimento cardíaco na doença de Kawasaki') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_258_COMPROMETIMENTO_CARDIACO_NA_DOENCA_DE_KA', 'Comprometimento cardíaco na doença de Kawasaki', false, 5258, 'Cardiovascular');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Comprometimento cardíaco na doença de Kawasaki') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_258_COMPROMETIMENTO_CARDIACO_NA_DOENCA_DE_KA', 'Comprometimento cardíaco na doença de Kawasaki', false, 5258, 'Cardiovascular');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Disfunção cardíaca associada à sepse') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_259_DISFUNCAO_CARDIACA_ASSOCIADA_A_SEPSE', 'Disfunção cardíaca associada à sepse', false, 5259, 'Cardiovascular');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Disfunção cardíaca associada à sepse') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_259_DISFUNCAO_CARDIACA_ASSOCIADA_A_SEPSE', 'Disfunção cardíaca associada à sepse', false, 5259, 'Cardiovascular');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Síndrome inflamatória multissistêmica pediátrica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_260_SINDROME_INFLAMATORIA_MULTISSISTEMICA_PE', 'Síndrome inflamatória multissistêmica pediátrica', false, 5260, 'Cardiovascular');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Síndrome inflamatória multissistêmica pediátrica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_260_SINDROME_INFLAMATORIA_MULTISSISTEMICA_PE', 'Síndrome inflamatória multissistêmica pediátrica', false, 5260, 'Cardiovascular');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Taquicardia supraventricular') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_261_TAQUICARDIA_SUPRAVENTRICULAR', 'Taquicardia supraventricular', false, 5261, 'Cardiovascular');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Taquicardia supraventricular') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_261_TAQUICARDIA_SUPRAVENTRICULAR', 'Taquicardia supraventricular', false, 5261, 'Cardiovascular');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Taquicardia ventricular') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_262_TAQUICARDIA_VENTRICULAR', 'Taquicardia ventricular', false, 5262, 'Cardiovascular');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Taquicardia ventricular') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_262_TAQUICARDIA_VENTRICULAR', 'Taquicardia ventricular', false, 5262, 'Cardiovascular');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Fibrilação ventricular') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_263_FIBRILACAO_VENTRICULAR', 'Fibrilação ventricular', false, 5263, 'Cardiovascular');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Fibrilação ventricular') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_263_FIBRILACAO_VENTRICULAR', 'Fibrilação ventricular', false, 5263, 'Cardiovascular');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Bradicardia sintomática') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_264_BRADICARDIA_SINTOMATICA', 'Bradicardia sintomática', false, 5264, 'Cardiovascular');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Bradicardia sintomática') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_264_BRADICARDIA_SINTOMATICA', 'Bradicardia sintomática', false, 5264, 'Cardiovascular');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Bloqueios atrioventriculares') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_265_BLOQUEIOS_ATRIOVENTRICULARES', 'Bloqueios atrioventriculares', false, 5265, 'Cardiovascular');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Bloqueios atrioventriculares') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_265_BLOQUEIOS_ATRIOVENTRICULARES', 'Bloqueios atrioventriculares', false, 5265, 'Cardiovascular');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Síndrome do QT longo') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_266_SINDROME_DO_QT_LONGO', 'Síndrome do QT longo', false, 5266, 'Cardiovascular');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Síndrome do QT longo') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_266_SINDROME_DO_QT_LONGO', 'Síndrome do QT longo', false, 5266, 'Cardiovascular');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Síndrome de Wolff-Parkinson-White') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_267_SINDROME_DE_WOLFF_PARKINSON_WHITE', 'Síndrome de Wolff-Parkinson-White', false, 5267, 'Cardiovascular');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Síndrome de Wolff-Parkinson-White') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_267_SINDROME_DE_WOLFF_PARKINSON_WHITE', 'Síndrome de Wolff-Parkinson-White', false, 5267, 'Cardiovascular');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Insuficiência cardíaca aguda ou crônica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_268_INSUFICIENCIA_CARDIACA_AGUDA_OU_CRONICA', 'Insuficiência cardíaca aguda ou crônica', false, 5268, 'Cardiovascular');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Insuficiência cardíaca aguda ou crônica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_268_INSUFICIENCIA_CARDIACA_AGUDA_OU_CRONICA', 'Insuficiência cardíaca aguda ou crônica', false, 5268, 'Cardiovascular');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Crise hipóxica da tetralogia de Fallot') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_269_CRISE_HIPOXICA_DA_TETRALOGIA_DE_FALLOT', 'Crise hipóxica da tetralogia de Fallot', false, 5269, 'Cardiovascular');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Crise hipóxica da tetralogia de Fallot') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_269_CRISE_HIPOXICA_DA_TETRALOGIA_DE_FALLOT', 'Crise hipóxica da tetralogia de Fallot', false, 5269, 'Cardiovascular');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Crise de hipertensão pulmonar') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_270_CRISE_DE_HIPERTENSAO_PULMONAR', 'Crise de hipertensão pulmonar', false, 5270, 'Cardiovascular');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Crise de hipertensão pulmonar') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_270_CRISE_DE_HIPERTENSAO_PULMONAR', 'Crise de hipertensão pulmonar', false, 5270, 'Cardiovascular');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Emergência hipertensiva') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_271_EMERGENCIA_HIPERTENSIVA', 'Emergência hipertensiva', false, 5271, 'Cardiovascular');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Emergência hipertensiva') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_271_EMERGENCIA_HIPERTENSIVA', 'Emergência hipertensiva', false, 5271, 'Cardiovascular');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Trombose arterial ou venosa') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_272_TROMBOSE_ARTERIAL_OU_VENOSA', 'Trombose arterial ou venosa', false, 5272, 'Cardiovascular');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Trombose arterial ou venosa') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_272_TROMBOSE_ARTERIAL_OU_VENOSA', 'Trombose arterial ou venosa', false, 5272, 'Cardiovascular');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Embolia pulmonar') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_273_EMBOLIA_PULMONAR', 'Embolia pulmonar', false, 5273, 'Cardiovascular');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Embolia pulmonar') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_273_EMBOLIA_PULMONAR', 'Embolia pulmonar', false, 5273, 'Cardiovascular');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Parada cardiorrespiratória') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_274_PARADA_CARDIORRESPIRATORIA', 'Parada cardiorrespiratória', false, 5274, 'Cardiovascular');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Parada cardiorrespiratória') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_274_PARADA_CARDIORRESPIRATORIA', 'Parada cardiorrespiratória', false, 5274, 'Cardiovascular');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Síndrome pós-parada cardiorrespiratória') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_275_SINDROME_POS_PARADA_CARDIORRESPIRATORIA', 'Síndrome pós-parada cardiorrespiratória', false, 5275, 'Cardiovascular');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Síndrome pós-parada cardiorrespiratória') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_275_SINDROME_POS_PARADA_CARDIORRESPIRATORIA', 'Síndrome pós-parada cardiorrespiratória', false, 5275, 'Cardiovascular');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Síndrome de baixo débito cardíaco') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_276_SINDROME_DE_BAIXO_DEBITO_CARDIACO', 'Síndrome de baixo débito cardíaco', false, 5276, 'Cardiovascular');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Síndrome de baixo débito cardíaco') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_276_SINDROME_DE_BAIXO_DEBITO_CARDIACO', 'Síndrome de baixo débito cardíaco', false, 5276, 'Cardiovascular');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Pós-operatório de cirurgia cardíaca pediátrica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_277_POS_OPERATORIO_DE_CIRURGIA_CARDIACA_PEDI', 'Pós-operatório de cirurgia cardíaca pediátrica', false, 5277, 'Cardiovascular');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Pós-operatório de cirurgia cardíaca pediátrica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_277_POS_OPERATORIO_DE_CIRURGIA_CARDIACA_PEDI', 'Pós-operatório de cirurgia cardíaca pediátrica', false, 5277, 'Cardiovascular');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Choque hipovolêmico') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_278_CHOQUE_HIPOVOLEMICO', 'Choque hipovolêmico', false, 5278, 'Choque / Distributivo');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Choque hipovolêmico') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_278_CHOQUE_HIPOVOLEMICO', 'Choque hipovolêmico', false, 5278, 'Choque / Distributivo');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Choque distributivo/séptico') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_279_CHOQUE_DISTRIBUTIVO_SEPTICO', 'Choque distributivo/séptico', false, 5279, 'Choque / Distributivo');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Choque distributivo/séptico') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_279_CHOQUE_DISTRIBUTIVO_SEPTICO', 'Choque distributivo/séptico', false, 5279, 'Choque / Distributivo');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Choque cardiogênico') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_280_CHOQUE_CARDIOGENICO', 'Choque cardiogênico', false, 5280, 'Choque / Distributivo');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Choque cardiogênico') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_280_CHOQUE_CARDIOGENICO', 'Choque cardiogênico', false, 5280, 'Choque / Distributivo');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Choque obstrutivo') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_281_CHOQUE_OBSTRUTIVO', 'Choque obstrutivo', false, 5281, 'Choque / Distributivo');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Choque obstrutivo') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_281_CHOQUE_OBSTRUTIVO', 'Choque obstrutivo', false, 5281, 'Choque / Distributivo');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Choque anafilático') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_282_CHOQUE_ANAFILATICO', 'Choque anafilático', false, 5282, 'Choque / Distributivo');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Choque anafilático') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_282_CHOQUE_ANAFILATICO', 'Choque anafilático', false, 5282, 'Choque / Distributivo');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Choque neurogênico') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_283_CHOQUE_NEUROGENICO', 'Choque neurogênico', false, 5283, 'Choque / Distributivo');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Choque neurogênico') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_283_CHOQUE_NEUROGENICO', 'Choque neurogênico', false, 5283, 'Choque / Distributivo');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Desnutrição aguda moderada ou grave') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_284_DESNUTRICAO_AGUDA_MODERADA_OU_GRAVE', 'Desnutrição aguda moderada ou grave', false, 5284, 'Nutricional / Outros');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Desnutrição aguda moderada ou grave') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_284_DESNUTRICAO_AGUDA_MODERADA_OU_GRAVE', 'Desnutrição aguda moderada ou grave', false, 5284, 'Nutricional / Outros');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Desnutrição crônica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_285_DESNUTRICAO_CRONICA', 'Desnutrição crônica', false, 5285, 'Nutricional / Outros');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Desnutrição crônica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_285_DESNUTRICAO_CRONICA', 'Desnutrição crônica', false, 5285, 'Nutricional / Outros');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Baixo peso') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_286_BAIXO_PESO', 'Baixo peso', false, 5286, 'Nutricional / Outros');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Baixo peso') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_286_BAIXO_PESO', 'Baixo peso', false, 5286, 'Nutricional / Outros');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Déficit de crescimento linear') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_287_DEFICIT_DE_CRESCIMENTO_LINEAR', 'Déficit de crescimento linear', false, 5287, 'Nutricional / Outros');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Déficit de crescimento linear') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_287_DEFICIT_DE_CRESCIMENTO_LINEAR', 'Déficit de crescimento linear', false, 5287, 'Nutricional / Outros');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Falha de crescimento') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_288_FALHA_DE_CRESCIMENTO', 'Falha de crescimento', false, 5288, 'Nutricional / Outros');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Falha de crescimento') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_288_FALHA_DE_CRESCIMENTO', 'Falha de crescimento', false, 5288, 'Nutricional / Outros');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Caquexia associada à doença crônica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_289_CAQUEXIA_ASSOCIADA_A_DOENCA_CRONICA', 'Caquexia associada à doença crônica', false, 5289, 'Nutricional / Outros');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Caquexia associada à doença crônica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_289_CAQUEXIA_ASSOCIADA_A_DOENCA_CRONICA', 'Caquexia associada à doença crônica', false, 5289, 'Nutricional / Outros');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Sarcopenia pediátrica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_290_SARCOPENIA_PEDIATRICA', 'Sarcopenia pediátrica', false, 5290, 'Nutricional / Outros');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Sarcopenia pediátrica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_290_SARCOPENIA_PEDIATRICA', 'Sarcopenia pediátrica', false, 5290, 'Nutricional / Outros');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Desnutrição hospitalar') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_291_DESNUTRICAO_HOSPITALAR', 'Desnutrição hospitalar', false, 5291, 'Nutricional / Outros');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Desnutrição hospitalar') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_291_DESNUTRICAO_HOSPITALAR', 'Desnutrição hospitalar', false, 5291, 'Nutricional / Outros');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Deficiência proteico-calórica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_292_DEFICIENCIA_PROTEICO_CALORICA', 'Deficiência proteico-calórica', false, 5292, 'Nutricional / Outros');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Deficiência proteico-calórica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_292_DEFICIENCIA_PROTEICO_CALORICA', 'Deficiência proteico-calórica', false, 5292, 'Nutricional / Outros');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Deficiências de ferro, vitaminas A, D, B12, C e K, folato, zinco, tiamina, cobre ou selênio') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_293_DEFICIENCIAS_DE_FERRO_VITAMINAS_A_D_B12_', 'Deficiências de ferro, vitaminas A, D, B12, C e K, folato, zinco, tiamina, cobre ou selênio', false, 5293, 'Nutricional / Outros');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Deficiências de ferro, vitaminas A, D, B12, C e K, folato, zinco, tiamina, cobre ou selênio') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_293_DEFICIENCIAS_DE_FERRO_VITAMINAS_A_D_B12_', 'Deficiências de ferro, vitaminas A, D, B12, C e K, folato, zinco, tiamina, cobre ou selênio', false, 5293, 'Nutricional / Outros');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Raquitismo nutricional') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_294_RAQUITISMO_NUTRICIONAL', 'Raquitismo nutricional', false, 5294, 'Nutricional / Outros');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Raquitismo nutricional') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_294_RAQUITISMO_NUTRICIONAL', 'Raquitismo nutricional', false, 5294, 'Nutricional / Outros');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Sobrepeso') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_295_SOBREPESO', 'Sobrepeso', false, 5295, 'Nutricional / Outros');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Sobrepeso') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_295_SOBREPESO', 'Sobrepeso', false, 5295, 'Nutricional / Outros');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Obesidade') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_296_OBESIDADE', 'Obesidade', false, 5296, 'Nutricional / Outros');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Obesidade') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_296_OBESIDADE', 'Obesidade', false, 5296, 'Nutricional / Outros');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Obesidade grave') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_297_OBESIDADE_GRAVE', 'Obesidade grave', false, 5297, 'Nutricional / Outros');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Obesidade grave') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_297_OBESIDADE_GRAVE', 'Obesidade grave', false, 5297, 'Nutricional / Outros');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Síndrome metabólica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_298_SINDROME_METABOLICA', 'Síndrome metabólica', false, 5298, 'Nutricional / Outros');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Síndrome metabólica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_298_SINDROME_METABOLICA', 'Síndrome metabólica', false, 5298, 'Nutricional / Outros');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Resistência insulínica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_299_RESISTENCIA_INSULINICA', 'Resistência insulínica', false, 5299, 'Nutricional / Outros');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Resistência insulínica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_299_RESISTENCIA_INSULINICA', 'Resistência insulínica', false, 5299, 'Nutricional / Outros');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Dislipidemia') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_300_DISLIPIDEMIA', 'Dislipidemia', false, 5300, 'Nutricional / Outros');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Dislipidemia') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_300_DISLIPIDEMIA', 'Dislipidemia', false, 5300, 'Nutricional / Outros');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Hipertensão relacionada à obesidade') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_301_HIPERTENSAO_RELACIONADA_A_OBESIDADE', 'Hipertensão relacionada à obesidade', false, 5301, 'Nutricional / Outros');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Hipertensão relacionada à obesidade') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_301_HIPERTENSAO_RELACIONADA_A_OBESIDADE', 'Hipertensão relacionada à obesidade', false, 5301, 'Nutricional / Outros');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Esteatose hepática associada à disfunção metabólica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_302_ESTEATOSE_HEPATICA_ASSOCIADA_A_DISFUNCAO', 'Esteatose hepática associada à disfunção metabólica', false, 5302, 'Nutricional / Outros');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Esteatose hepática associada à disfunção metabólica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_302_ESTEATOSE_HEPATICA_ASSOCIADA_A_DISFUNCAO', 'Esteatose hepática associada à disfunção metabólica', false, 5302, 'Nutricional / Outros');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Diabetes mellitus tipo 2') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_303_DIABETES_MELLITUS_TIPO_2', 'Diabetes mellitus tipo 2', false, 5303, 'Nutricional / Outros');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Diabetes mellitus tipo 2') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_303_DIABETES_MELLITUS_TIPO_2', 'Diabetes mellitus tipo 2', false, 5303, 'Nutricional / Outros');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Obesidade sindrômica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_304_OBESIDADE_SINDROMICA', 'Obesidade sindrômica', false, 5304, 'Nutricional / Outros');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Obesidade sindrômica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_304_OBESIDADE_SINDROMICA', 'Obesidade sindrômica', false, 5304, 'Nutricional / Outros');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Dificuldade alimentar pediátrica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_305_DIFICULDADE_ALIMENTAR_PEDIATRICA', 'Dificuldade alimentar pediátrica', false, 5305, 'Nutricional / Outros');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Dificuldade alimentar pediátrica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_305_DIFICULDADE_ALIMENTAR_PEDIATRICA', 'Dificuldade alimentar pediátrica', false, 5305, 'Nutricional / Outros');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Seletividade alimentar') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_306_SELETIVIDADE_ALIMENTAR', 'Seletividade alimentar', false, 5306, 'Nutricional / Outros');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Seletividade alimentar') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_306_SELETIVIDADE_ALIMENTAR', 'Seletividade alimentar', false, 5306, 'Nutricional / Outros');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Disfagia orofaríngea') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_307_DISFAGIA_OROFARINGEA', 'Disfagia orofaríngea', false, 5307, 'Nutricional / Outros');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Disfagia orofaríngea') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_307_DISFAGIA_OROFARINGEA', 'Disfagia orofaríngea', false, 5307, 'Nutricional / Outros');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Aversão alimentar') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_308_AVERSAO_ALIMENTAR', 'Aversão alimentar', false, 5308, 'Nutricional / Outros');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Aversão alimentar') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_308_AVERSAO_ALIMENTAR', 'Aversão alimentar', false, 5308, 'Nutricional / Outros');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Transtorno alimentar restritivo/evitativo') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_309_TRANSTORNO_ALIMENTAR_RESTRITIVO_EVITATIV', 'Transtorno alimentar restritivo/evitativo', false, 5309, 'Nutricional / Outros');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Transtorno alimentar restritivo/evitativo') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_309_TRANSTORNO_ALIMENTAR_RESTRITIVO_EVITATIV', 'Transtorno alimentar restritivo/evitativo', false, 5309, 'Nutricional / Outros');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Anorexia nervosa') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_310_ANOREXIA_NERVOSA', 'Anorexia nervosa', false, 5310, 'Nutricional / Outros');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Anorexia nervosa') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_310_ANOREXIA_NERVOSA', 'Anorexia nervosa', false, 5310, 'Nutricional / Outros');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Bulimia nervosa') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_311_BULIMIA_NERVOSA', 'Bulimia nervosa', false, 5311, 'Nutricional / Outros');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Bulimia nervosa') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_311_BULIMIA_NERVOSA', 'Bulimia nervosa', false, 5311, 'Nutricional / Outros');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Compulsão alimentar') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_312_COMPULSAO_ALIMENTAR', 'Compulsão alimentar', false, 5312, 'Nutricional / Outros');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Compulsão alimentar') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_312_COMPULSAO_ALIMENTAR', 'Compulsão alimentar', false, 5312, 'Nutricional / Outros');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Síndrome de realimentação') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_313_SINDROME_DE_REALIMENTACAO', 'Síndrome de realimentação', false, 5313, 'Nutricional / Outros');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Síndrome de realimentação') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_313_SINDROME_DE_REALIMENTACAO', 'Síndrome de realimentação', false, 5313, 'Nutricional / Outros');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Intolerância à dieta enteral') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_314_INTOLERANCIA_A_DIETA_ENTERAL', 'Intolerância à dieta enteral', false, 5314, 'Nutricional / Outros');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Intolerância à dieta enteral') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_314_INTOLERANCIA_A_DIETA_ENTERAL', 'Intolerância à dieta enteral', false, 5314, 'Nutricional / Outros');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Falência intestinal') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_315_FALENCIA_INTESTINAL', 'Falência intestinal', false, 5315, 'Nutricional / Outros');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Falência intestinal') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_315_FALENCIA_INTESTINAL', 'Falência intestinal', false, 5315, 'Nutricional / Outros');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Síndrome do intestino curto') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_316_SINDROME_DO_INTESTINO_CURTO', 'Síndrome do intestino curto', false, 5316, 'Nutricional / Outros');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Síndrome do intestino curto') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_316_SINDROME_DO_INTESTINO_CURTO', 'Síndrome do intestino curto', false, 5316, 'Nutricional / Outros');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Dependência de nutrição enteral ou parenteral') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_317_DEPENDENCIA_DE_NUTRICAO_ENTERAL_OU_PAREN', 'Dependência de nutrição enteral ou parenteral', false, 5317, 'Nutricional / Outros');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Dependência de nutrição enteral ou parenteral') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_317_DEPENDENCIA_DE_NUTRICAO_ENTERAL_OU_PAREN', 'Dependência de nutrição enteral ou parenteral', false, 5317, 'Nutricional / Outros');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Complicações da nutrição parenteral') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_318_COMPLICACOES_DA_NUTRICAO_PARENTERAL', 'Complicações da nutrição parenteral', false, 5318, 'Nutricional / Outros');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Complicações da nutrição parenteral') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_318_COMPLICACOES_DA_NUTRICAO_PARENTERAL', 'Complicações da nutrição parenteral', false, 5318, 'Nutricional / Outros');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Distúrbios metabólicos associados à doença crítica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_319_DISTURBIOS_METABOLICOS_ASSOCIADOS_A_DOEN', 'Distúrbios metabólicos associados à doença crítica', false, 5319, 'Nutricional / Outros');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Distúrbios metabólicos associados à doença crítica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_319_DISTURBIOS_METABOLICOS_ASSOCIADOS_A_DOEN', 'Distúrbios metabólicos associados à doença crítica', false, 5319, 'Nutricional / Outros');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Meningite') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_320_MENINGITE', 'Meningite', false, 5320, 'Neurológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Meningite') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_320_MENINGITE', 'Meningite', false, 5320, 'Neurológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Encefalite') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_321_ENCEFALITE', 'Encefalite', false, 5321, 'Neurológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Encefalite') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_321_ENCEFALITE', 'Encefalite', false, 5321, 'Neurológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Meningoencefalite') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_322_MENINGOENCEFALITE', 'Meningoencefalite', false, 5322, 'Neurológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Meningoencefalite') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_322_MENINGOENCEFALITE', 'Meningoencefalite', false, 5322, 'Neurológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Abscesso cerebral') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_323_ABSCESSO_CEREBRAL', 'Abscesso cerebral', false, 5323, 'Neurológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Abscesso cerebral') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_323_ABSCESSO_CEREBRAL', 'Abscesso cerebral', false, 5323, 'Neurológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Empiema subdural') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_324_EMPIEMA_SUBDURAL', 'Empiema subdural', false, 5324, 'Neurológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Empiema subdural') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_324_EMPIEMA_SUBDURAL', 'Empiema subdural', false, 5324, 'Neurológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Encefalomielite disseminada aguda') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_325_ENCEFALOMIELITE_DISSEMINADA_AGUDA', 'Encefalomielite disseminada aguda', false, 5325, 'Neurológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Encefalomielite disseminada aguda') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_325_ENCEFALOMIELITE_DISSEMINADA_AGUDA', 'Encefalomielite disseminada aguda', false, 5325, 'Neurológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Encefalite autoimune') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_326_ENCEFALITE_AUTOIMUNE', 'Encefalite autoimune', false, 5326, 'Neurológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Encefalite autoimune') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_326_ENCEFALITE_AUTOIMUNE', 'Encefalite autoimune', false, 5326, 'Neurológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Neuromielite óptica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_327_NEUROMIELITE_OPTICA', 'Neuromielite óptica', false, 5327, 'Neurológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Neuromielite óptica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_327_NEUROMIELITE_OPTICA', 'Neuromielite óptica', false, 5327, 'Neurológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Doença associada ao anticorpo anti-MOG') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_328_DOENCA_ASSOCIADA_AO_ANTICORPO_ANTI_MOG', 'Doença associada ao anticorpo anti-MOG', false, 5328, 'Neurológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Doença associada ao anticorpo anti-MOG') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_328_DOENCA_ASSOCIADA_AO_ANTICORPO_ANTI_MOG', 'Doença associada ao anticorpo anti-MOG', false, 5328, 'Neurológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Esclerose múltipla pediátrica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_329_ESCLEROSE_MULTIPLA_PEDIATRICA', 'Esclerose múltipla pediátrica', false, 5329, 'Neurológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Esclerose múltipla pediátrica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_329_ESCLEROSE_MULTIPLA_PEDIATRICA', 'Esclerose múltipla pediátrica', false, 5329, 'Neurológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Mielite transversa') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_330_MIELITE_TRANSVERSA', 'Mielite transversa', false, 5330, 'Neurológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Mielite transversa') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_330_MIELITE_TRANSVERSA', 'Mielite transversa', false, 5330, 'Neurológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Síndrome de Guillain-Barré') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_331_SINDROME_DE_GUILLAIN_BARRE', 'Síndrome de Guillain-Barré', false, 5331, 'Neurológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Síndrome de Guillain-Barré') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_331_SINDROME_DE_GUILLAIN_BARRE', 'Síndrome de Guillain-Barré', false, 5331, 'Neurológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Crise convulsiva febril') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_332_CRISE_CONVULSIVA_FEBRIL', 'Crise convulsiva febril', false, 5332, 'Neurológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Crise convulsiva febril') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_332_CRISE_CONVULSIVA_FEBRIL', 'Crise convulsiva febril', false, 5332, 'Neurológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Epilepsia') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_333_EPILEPSIA', 'Epilepsia', false, 5333, 'Neurológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Epilepsia') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_333_EPILEPSIA', 'Epilepsia', false, 5333, 'Neurológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Síndromes epilépticas da infância') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_334_SINDROMES_EPILEPTICAS_DA_INFANCIA', 'Síndromes epilépticas da infância', false, 5334, 'Neurológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Síndromes epilépticas da infância') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_334_SINDROMES_EPILEPTICAS_DA_INFANCIA', 'Síndromes epilépticas da infância', false, 5334, 'Neurológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Estado de mal epiléptico') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_335_ESTADO_DE_MAL_EPILEPTICO', 'Estado de mal epiléptico', false, 5335, 'Neurológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Estado de mal epiléptico') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_335_ESTADO_DE_MAL_EPILEPTICO', 'Estado de mal epiléptico', false, 5335, 'Neurológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Estado de mal epiléptico refratário ou super-refratário') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_336_ESTADO_DE_MAL_EPILEPTICO_REFRATARIO_OU_S', 'Estado de mal epiléptico refratário ou super-refratário', false, 5336, 'Neurológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Estado de mal epiléptico refratário ou super-refratário') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_336_ESTADO_DE_MAL_EPILEPTICO_REFRATARIO_OU_S', 'Estado de mal epiléptico refratário ou super-refratário', false, 5336, 'Neurológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Espasmos infantis') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_337_ESPASMOS_INFANTIS', 'Espasmos infantis', false, 5337, 'Neurológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Espasmos infantis') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_337_ESPASMOS_INFANTIS', 'Espasmos infantis', false, 5337, 'Neurológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Encefalopatia epiléptica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_338_ENCEFALOPATIA_EPILEPTICA', 'Encefalopatia epiléptica', false, 5338, 'Neurológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Encefalopatia epiléptica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_338_ENCEFALOPATIA_EPILEPTICA', 'Encefalopatia epiléptica', false, 5338, 'Neurológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Coma') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_339_COMA', 'Coma', false, 5339, 'Neurológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Coma') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_339_COMA', 'Coma', false, 5339, 'Neurológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Encefalopatia aguda') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_340_ENCEFALOPATIA_AGUDA', 'Encefalopatia aguda', false, 5340, 'Neurológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Encefalopatia aguda') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_340_ENCEFALOPATIA_AGUDA', 'Encefalopatia aguda', false, 5340, 'Neurológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Encefalopatia hipóxico-isquêmica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_341_ENCEFALOPATIA_HIPOXICO_ISQUEMICA', 'Encefalopatia hipóxico-isquêmica', false, 5341, 'Neurológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Encefalopatia hipóxico-isquêmica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_341_ENCEFALOPATIA_HIPOXICO_ISQUEMICA', 'Encefalopatia hipóxico-isquêmica', false, 5341, 'Neurológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Morte encefálica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_342_MORTE_ENCEFALICA', 'Morte encefálica', false, 5342, 'Neurológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Morte encefálica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_342_MORTE_ENCEFALICA', 'Morte encefálica', false, 5342, 'Neurológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Atrofia muscular espinhal') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_343_ATROFIA_MUSCULAR_ESPINHAL', 'Atrofia muscular espinhal', false, 5343, 'Neurológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Atrofia muscular espinhal') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_343_ATROFIA_MUSCULAR_ESPINHAL', 'Atrofia muscular espinhal', false, 5343, 'Neurológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Distrofia muscular de Duchenne') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_344_DISTROFIA_MUSCULAR_DE_DUCHENNE', 'Distrofia muscular de Duchenne', false, 5344, 'Neurológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Distrofia muscular de Duchenne') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_344_DISTROFIA_MUSCULAR_DE_DUCHENNE', 'Distrofia muscular de Duchenne', false, 5344, 'Neurológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Miastenia gravis e crise miastênica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_345_MIASTENIA_GRAVIS_E_CRISE_MIASTENICA', 'Miastenia gravis e crise miastênica', false, 5345, 'Neurológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Miastenia gravis e crise miastênica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_345_MIASTENIA_GRAVIS_E_CRISE_MIASTENICA', 'Miastenia gravis e crise miastênica', false, 5345, 'Neurológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Miopatias congênitas') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_346_MIOPATIAS_CONGENITAS', 'Miopatias congênitas', false, 5346, 'Neurológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Miopatias congênitas') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_346_MIOPATIAS_CONGENITAS', 'Miopatias congênitas', false, 5346, 'Neurológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Doenças mitocondriais') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_347_DOENCAS_MITOCONDRIAIS', 'Doenças mitocondriais', false, 5347, 'Neurológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Doenças mitocondriais') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_347_DOENCAS_MITOCONDRIAIS', 'Doenças mitocondriais', false, 5347, 'Neurológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Leucodistrofias') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_348_LEUCODISTROFIAS', 'Leucodistrofias', false, 5348, 'Neurológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Leucodistrofias') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_348_LEUCODISTROFIAS', 'Leucodistrofias', false, 5348, 'Neurológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Botulismo') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_349_BOTULISMO', 'Botulismo', false, 5349, 'Neurológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Botulismo') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_349_BOTULISMO', 'Botulismo', false, 5349, 'Neurológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Paralisia flácida aguda') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_350_PARALISIA_FLACIDA_AGUDA', 'Paralisia flácida aguda', false, 5350, 'Neurológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Paralisia flácida aguda') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_350_PARALISIA_FLACIDA_AGUDA', 'Paralisia flácida aguda', false, 5350, 'Neurológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Hidrocefalia') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_351_HIDROCEFALIA', 'Hidrocefalia', false, 5351, 'Neurológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Hidrocefalia') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_351_HIDROCEFALIA', 'Hidrocefalia', false, 5351, 'Neurológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Mielomeningocele') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_352_MIELOMENINGOCELE', 'Mielomeningocele', false, 5352, 'Neurológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Mielomeningocele') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_352_MIELOMENINGOCELE', 'Mielomeningocele', false, 5352, 'Neurológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Malformação de Chiari') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_353_MALFORMACAO_DE_CHIARI', 'Malformação de Chiari', false, 5353, 'Neurológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Malformação de Chiari') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_353_MALFORMACAO_DE_CHIARI', 'Malformação de Chiari', false, 5353, 'Neurológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Paralisia cerebral') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_354_PARALISIA_CEREBRAL', 'Paralisia cerebral', false, 5354, 'Neurológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Paralisia cerebral') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_354_PARALISIA_CEREBRAL', 'Paralisia cerebral', false, 5354, 'Neurológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Atraso global ou regressão do desenvolvimento') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_355_ATRASO_GLOBAL_OU_REGRESSAO_DO_DESENVOLVI', 'Atraso global ou regressão do desenvolvimento', false, 5355, 'Neurológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Atraso global ou regressão do desenvolvimento') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_355_ATRASO_GLOBAL_OU_REGRESSAO_DO_DESENVOLVI', 'Atraso global ou regressão do desenvolvimento', false, 5355, 'Neurológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Ataxia aguda') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_356_ATAXIA_AGUDA', 'Ataxia aguda', false, 5356, 'Neurológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Ataxia aguda') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_356_ATAXIA_AGUDA', 'Ataxia aguda', false, 5356, 'Neurológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Cefaleia e enxaqueca') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_357_CEFALEIA_E_ENXAQUECA', 'Cefaleia e enxaqueca', false, 5357, 'Neurológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Cefaleia e enxaqueca') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_357_CEFALEIA_E_ENXAQUECA', 'Cefaleia e enxaqueca', false, 5357, 'Neurológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Acidente vascular cerebral isquêmico ou hemorrágico') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_358_ACIDENTE_VASCULAR_CEREBRAL_ISQUEMICO_OU_', 'Acidente vascular cerebral isquêmico ou hemorrágico', false, 5358, 'Neurológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Acidente vascular cerebral isquêmico ou hemorrágico') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_358_ACIDENTE_VASCULAR_CEREBRAL_ISQUEMICO_OU_', 'Acidente vascular cerebral isquêmico ou hemorrágico', false, 5358, 'Neurológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Trombose venosa cerebral') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_359_TROMBOSE_VENOSA_CEREBRAL', 'Trombose venosa cerebral', false, 5359, 'Neurológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Trombose venosa cerebral') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_359_TROMBOSE_VENOSA_CEREBRAL', 'Trombose venosa cerebral', false, 5359, 'Neurológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Hemorragia intracraniana') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_360_HEMORRAGIA_INTRACRANIANA', 'Hemorragia intracraniana', false, 5360, 'Neurológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Hemorragia intracraniana') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_360_HEMORRAGIA_INTRACRANIANA', 'Hemorragia intracraniana', false, 5360, 'Neurológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Hipertensão intracraniana') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_361_HIPERTENSAO_INTRACRANIANA', 'Hipertensão intracraniana', false, 5361, 'Neurológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Hipertensão intracraniana') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_361_HIPERTENSAO_INTRACRANIANA', 'Hipertensão intracraniana', false, 5361, 'Neurológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Tumores do sistema nervoso central') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_362_TUMORES_DO_SISTEMA_NERVOSO_CENTRAL', 'Tumores do sistema nervoso central', false, 5362, 'Neurológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Tumores do sistema nervoso central') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_362_TUMORES_DO_SISTEMA_NERVOSO_CENTRAL', 'Tumores do sistema nervoso central', false, 5362, 'Neurológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Edema e herniação cerebral') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_363_EDEMA_E_HERNIACAO_CEREBRAL', 'Edema e herniação cerebral', false, 5363, 'Neurológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Edema e herniação cerebral') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_363_EDEMA_E_HERNIACAO_CEREBRAL', 'Edema e herniação cerebral', false, 5363, 'Neurológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Síndrome de disautonomia paroxística') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_364_SINDROME_DE_DISAUTONOMIA_PAROXISTICA', 'Síndrome de disautonomia paroxística', false, 5364, 'Neurológico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Síndrome de disautonomia paroxística') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_364_SINDROME_DE_DISAUTONOMIA_PAROXISTICA', 'Síndrome de disautonomia paroxística', false, 5364, 'Neurológico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'TCE leve, moderado ou grave') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_365_TCE_LEVE_MODERADO_OU_GRAVE', 'TCE leve, moderado ou grave', false, 5365, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'TCE leve, moderado ou grave') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_365_TCE_LEVE_MODERADO_OU_GRAVE', 'TCE leve, moderado ou grave', false, 5365, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Concussão cerebral') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_366_CONCUSSAO_CEREBRAL', 'Concussão cerebral', false, 5366, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Concussão cerebral') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_366_CONCUSSAO_CEREBRAL', 'Concussão cerebral', false, 5366, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Contusão cerebral') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_367_CONTUSAO_CEREBRAL', 'Contusão cerebral', false, 5367, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Contusão cerebral') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_367_CONTUSAO_CEREBRAL', 'Contusão cerebral', false, 5367, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Lesão axonal difusa') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_368_LESAO_AXONAL_DIFUSA', 'Lesão axonal difusa', false, 5368, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Lesão axonal difusa') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_368_LESAO_AXONAL_DIFUSA', 'Lesão axonal difusa', false, 5368, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Hematoma epidural') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_369_HEMATOMA_EPIDURAL', 'Hematoma epidural', false, 5369, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Hematoma epidural') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_369_HEMATOMA_EPIDURAL', 'Hematoma epidural', false, 5369, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Hematoma subdural') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_370_HEMATOMA_SUBDURAL', 'Hematoma subdural', false, 5370, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Hematoma subdural') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_370_HEMATOMA_SUBDURAL', 'Hematoma subdural', false, 5370, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Hemorragia subaracnoidea traumática') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_371_HEMORRAGIA_SUBARACNOIDEA_TRAUMATICA', 'Hemorragia subaracnoidea traumática', false, 5371, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Hemorragia subaracnoidea traumática') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_371_HEMORRAGIA_SUBARACNOIDEA_TRAUMATICA', 'Hemorragia subaracnoidea traumática', false, 5371, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Hemorragia intraparenquimatosa') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_372_HEMORRAGIA_INTRAPARENQUIMATOSA', 'Hemorragia intraparenquimatosa', false, 5372, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Hemorragia intraparenquimatosa') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_372_HEMORRAGIA_INTRAPARENQUIMATOSA', 'Hemorragia intraparenquimatosa', false, 5372, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Fratura de crânio') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_373_FRATURA_DE_CRANIO', 'Fratura de crânio', false, 5373, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Fratura de crânio') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_373_FRATURA_DE_CRANIO', 'Fratura de crânio', false, 5373, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Hipertensão intracraniana traumática') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_374_HIPERTENSAO_INTRACRANIANA_TRAUMATICA', 'Hipertensão intracraniana traumática', false, 5374, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Hipertensão intracraniana traumática') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_374_HIPERTENSAO_INTRACRANIANA_TRAUMATICA', 'Hipertensão intracraniana traumática', false, 5374, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Traumatismo craniano abusivo') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_375_TRAUMATISMO_CRANIANO_ABUSIVO', 'Traumatismo craniano abusivo', false, 5375, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Traumatismo craniano abusivo') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_375_TRAUMATISMO_CRANIANO_ABUSIVO', 'Traumatismo craniano abusivo', false, 5375, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Contusão pulmonar') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_376_CONTUSAO_PULMONAR', 'Contusão pulmonar', false, 5376, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Contusão pulmonar') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_376_CONTUSAO_PULMONAR', 'Contusão pulmonar', false, 5376, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Pneumotórax') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_377_PNEUMOTORAX', 'Pneumotórax', false, 5377, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Pneumotórax') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_377_PNEUMOTORAX', 'Pneumotórax', false, 5377, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Hemotórax ou hemopneumotórax') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_378_HEMOTORAX_OU_HEMOPNEUMOTORAX', 'Hemotórax ou hemopneumotórax', false, 5378, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Hemotórax ou hemopneumotórax') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_378_HEMOTORAX_OU_HEMOPNEUMOTORAX', 'Hemotórax ou hemopneumotórax', false, 5378, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Tórax instável') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_379_TORAX_INSTAVEL', 'Tórax instável', false, 5379, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Tórax instável') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_379_TORAX_INSTAVEL', 'Tórax instável', false, 5379, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Lesão traqueobrônquica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_380_LESAO_TRAQUEOBRONQUICA', 'Lesão traqueobrônquica', false, 5380, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Lesão traqueobrônquica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_380_LESAO_TRAQUEOBRONQUICA', 'Lesão traqueobrônquica', false, 5380, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Contusão cardíaca') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_381_CONTUSAO_CARDIACA', 'Contusão cardíaca', false, 5381, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Contusão cardíaca') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_381_CONTUSAO_CARDIACA', 'Contusão cardíaca', false, 5381, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Tamponamento cardíaco') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_382_TAMPONAMENTO_CARDIACO', 'Tamponamento cardíaco', false, 5382, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Tamponamento cardíaco') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_382_TAMPONAMENTO_CARDIACO', 'Tamponamento cardíaco', false, 5382, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Ruptura diafragmática') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_383_RUPTURA_DIAFRAGMATICA', 'Ruptura diafragmática', false, 5383, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Ruptura diafragmática') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_383_RUPTURA_DIAFRAGMATICA', 'Ruptura diafragmática', false, 5383, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Trauma hepático, esplênico, renal ou pancreático') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_384_TRAUMA_HEPATICO_ESPLENICO_RENAL_OU_PANCR', 'Trauma hepático, esplênico, renal ou pancreático', false, 5384, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Trauma hepático, esplênico, renal ou pancreático') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_384_TRAUMA_HEPATICO_ESPLENICO_RENAL_OU_PANCR', 'Trauma hepático, esplênico, renal ou pancreático', false, 5384, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Perfuração de víscera oca') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_385_PERFURACAO_DE_VISCERA_OCA', 'Perfuração de víscera oca', false, 5385, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Perfuração de víscera oca') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_385_PERFURACAO_DE_VISCERA_OCA', 'Perfuração de víscera oca', false, 5385, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Hemoperitônio') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_386_HEMOPERITONIO', 'Hemoperitônio', false, 5386, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Hemoperitônio') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_386_HEMOPERITONIO', 'Hemoperitônio', false, 5386, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Trauma pélvico') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_387_TRAUMA_PELVICO', 'Trauma pélvico', false, 5387, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Trauma pélvico') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_387_TRAUMA_PELVICO', 'Trauma pélvico', false, 5387, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Trauma de bexiga ou uretra') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_388_TRAUMA_DE_BEXIGA_OU_URETRA', 'Trauma de bexiga ou uretra', false, 5388, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Trauma de bexiga ou uretra') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_388_TRAUMA_DE_BEXIGA_OU_URETRA', 'Trauma de bexiga ou uretra', false, 5388, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Síndrome compartimental abdominal') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_389_SINDROME_COMPARTIMENTAL_ABDOMINAL', 'Síndrome compartimental abdominal', false, 5389, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Síndrome compartimental abdominal') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_389_SINDROME_COMPARTIMENTAL_ABDOMINAL', 'Síndrome compartimental abdominal', false, 5389, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Fraturas fechadas ou expostas') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_390_FRATURAS_FECHADAS_OU_EXPOSTAS', 'Fraturas fechadas ou expostas', false, 5390, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Fraturas fechadas ou expostas') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_390_FRATURAS_FECHADAS_OU_EXPOSTAS', 'Fraturas fechadas ou expostas', false, 5390, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Luxações') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_391_LUXACOES', 'Luxações', false, 5391, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Luxações') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_391_LUXACOES', 'Luxações', false, 5391, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Lesões de partes moles') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_392_LESOES_DE_PARTES_MOLES', 'Lesões de partes moles', false, 5392, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Lesões de partes moles') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_392_LESOES_DE_PARTES_MOLES', 'Lesões de partes moles', false, 5392, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Lesões vasculares ou nervosas') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_393_LESOES_VASCULARES_OU_NERVOSAS', 'Lesões vasculares ou nervosas', false, 5393, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Lesões vasculares ou nervosas') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_393_LESOES_VASCULARES_OU_NERVOSAS', 'Lesões vasculares ou nervosas', false, 5393, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Amputações traumáticas') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_394_AMPUTACOES_TRAUMATICAS', 'Amputações traumáticas', false, 5394, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Amputações traumáticas') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_394_AMPUTACOES_TRAUMATICAS', 'Amputações traumáticas', false, 5394, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Síndrome compartimental') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_395_SINDROME_COMPARTIMENTAL', 'Síndrome compartimental', false, 5395, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Síndrome compartimental') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_395_SINDROME_COMPARTIMENTAL', 'Síndrome compartimental', false, 5395, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Trauma raquimedular') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_396_TRAUMA_RAQUIMEDULAR', 'Trauma raquimedular', false, 5396, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Trauma raquimedular') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_396_TRAUMA_RAQUIMEDULAR', 'Trauma raquimedular', false, 5396, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Politraumatismo') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_397_POLITRAUMATISMO', 'Politraumatismo', false, 5397, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Politraumatismo') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_397_POLITRAUMATISMO', 'Politraumatismo', false, 5397, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Afogamento') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_398_AFOGAMENTO', 'Afogamento', false, 5398, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Afogamento') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_398_AFOGAMENTO', 'Afogamento', false, 5398, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Queimaduras térmicas, químicas ou elétricas') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_399_QUEIMADURAS_TERMICAS_QUIMICAS_OU_ELETRIC', 'Queimaduras térmicas, químicas ou elétricas', false, 5399, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Queimaduras térmicas, químicas ou elétricas') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_399_QUEIMADURAS_TERMICAS_QUIMICAS_OU_ELETRIC', 'Queimaduras térmicas, químicas ou elétricas', false, 5399, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Choque elétrico') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_400_CHOQUE_ELETRICO', 'Choque elétrico', false, 5400, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Choque elétrico') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_400_CHOQUE_ELETRICO', 'Choque elétrico', false, 5400, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Acidentes por animais peçonhentos') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_401_ACIDENTES_POR_ANIMAIS_PECONHENTOS', 'Acidentes por animais peçonhentos', false, 5401, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Acidentes por animais peçonhentos') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_401_ACIDENTES_POR_ANIMAIS_PECONHENTOS', 'Acidentes por animais peçonhentos', false, 5401, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Mordeduras') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_402_MORDEDURAS', 'Mordeduras', false, 5402, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Mordeduras') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_402_MORDEDURAS', 'Mordeduras', false, 5402, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Intoxicações exógenas') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_403_INTOXICACOES_EXOGENAS', 'Intoxicações exógenas', false, 5403, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Intoxicações exógenas') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_403_INTOXICACOES_EXOGENAS', 'Intoxicações exógenas', false, 5403, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Aspiração ou ingestão de corpo estranho') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_404_ASPIRACAO_OU_INGESTAO_DE_CORPO_ESTRANHO', 'Aspiração ou ingestão de corpo estranho', false, 5404, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Aspiração ou ingestão de corpo estranho') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_404_ASPIRACAO_OU_INGESTAO_DE_CORPO_ESTRANHO', 'Aspiração ou ingestão de corpo estranho', false, 5404, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Asfixia, estrangulamento ou sufocação') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_405_ASFIXIA_ESTRANGULAMENTO_OU_SUFOCACAO', 'Asfixia, estrangulamento ou sufocação', false, 5405, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Asfixia, estrangulamento ou sufocação') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_405_ASFIXIA_ESTRANGULAMENTO_OU_SUFOCACAO', 'Asfixia, estrangulamento ou sufocação', false, 5405, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Acidentes automobilísticos') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_406_ACIDENTES_AUTOMOBILISTICOS', 'Acidentes automobilísticos', false, 5406, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Acidentes automobilísticos') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_406_ACIDENTES_AUTOMOBILISTICOS', 'Acidentes automobilísticos', false, 5406, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Quedas') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_407_QUEDAS', 'Quedas', false, 5407, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Quedas') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_407_QUEDAS', 'Quedas', false, 5407, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Violência física e trauma não acidental') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_408_VIOLENCIA_FISICA_E_TRAUMA_NAO_ACIDENTAL', 'Violência física e trauma não acidental', false, 5408, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Violência física e trauma não acidental') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_408_VIOLENCIA_FISICA_E_TRAUMA_NAO_ACIDENTAL', 'Violência física e trauma não acidental', false, 5408, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Atresia de esôfago e fístula traqueoesofágica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_409_ATRESIA_DE_ESOFAGO_E_FISTULA_TRAQUEOESOF', 'Atresia de esôfago e fístula traqueoesofágica', false, 5409, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Atresia de esôfago e fístula traqueoesofágica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_409_ATRESIA_DE_ESOFAGO_E_FISTULA_TRAQUEOESOF', 'Atresia de esôfago e fístula traqueoesofágica', false, 5409, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Hérnia diafragmática congênita') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_410_HERNIA_DIAFRAGMATICA_CONGENITA', 'Hérnia diafragmática congênita', false, 5410, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Hérnia diafragmática congênita') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_410_HERNIA_DIAFRAGMATICA_CONGENITA', 'Hérnia diafragmática congênita', false, 5410, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Gastrosquise') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_411_GASTROSQUISE', 'Gastrosquise', false, 5411, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Gastrosquise') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_411_GASTROSQUISE', 'Gastrosquise', false, 5411, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Onfalocele') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_412_ONFALOCELE', 'Onfalocele', false, 5412, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Onfalocele') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_412_ONFALOCELE', 'Onfalocele', false, 5412, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Atresias intestinais') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_413_ATRESIAS_INTESTINAIS', 'Atresias intestinais', false, 5413, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Atresias intestinais') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_413_ATRESIAS_INTESTINAIS', 'Atresias intestinais', false, 5413, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Má rotação intestinal e volvo') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_414_MA_ROTACAO_INTESTINAL_E_VOLVO', 'Má rotação intestinal e volvo', false, 5414, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Má rotação intestinal e volvo') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_414_MA_ROTACAO_INTESTINAL_E_VOLVO', 'Má rotação intestinal e volvo', false, 5414, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Enterocolite necrosante') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_415_ENTEROCOLITE_NECROSANTE', 'Enterocolite necrosante', false, 5415, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Enterocolite necrosante') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_415_ENTEROCOLITE_NECROSANTE', 'Enterocolite necrosante', false, 5415, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Perfuração intestinal') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_416_PERFURACAO_INTESTINAL', 'Perfuração intestinal', false, 5416, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Perfuração intestinal') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_416_PERFURACAO_INTESTINAL', 'Perfuração intestinal', false, 5416, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Íleo meconial') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_417_ILEO_MECONIAL', 'Íleo meconial', false, 5417, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Íleo meconial') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_417_ILEO_MECONIAL', 'Íleo meconial', false, 5417, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Doença de Hirschsprung') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_418_DOENCA_DE_HIRSCHSPRUNG', 'Doença de Hirschsprung', false, 5418, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Doença de Hirschsprung') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_418_DOENCA_DE_HIRSCHSPRUNG', 'Doença de Hirschsprung', false, 5418, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Malformação anorretal') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_419_MALFORMACAO_ANORRETAL', 'Malformação anorretal', false, 5419, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Malformação anorretal') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_419_MALFORMACAO_ANORRETAL', 'Malformação anorretal', false, 5419, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Persistência do úraco') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_420_PERSISTENCIA_DO_URACO', 'Persistência do úraco', false, 5420, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Persistência do úraco') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_420_PERSISTENCIA_DO_URACO', 'Persistência do úraco', false, 5420, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Extrofia vesical') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_421_EXTROFIA_VESICAL', 'Extrofia vesical', false, 5421, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Extrofia vesical') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_421_EXTROFIA_VESICAL', 'Extrofia vesical', false, 5421, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Cisto de colédoco') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_422_CISTO_DE_COLEDOCO', 'Cisto de colédoco', false, 5422, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Cisto de colédoco') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_422_CISTO_DE_COLEDOCO', 'Cisto de colédoco', false, 5422, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Apendicite aguda') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_423_APENDICITE_AGUDA', 'Apendicite aguda', false, 5423, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Apendicite aguda') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_423_APENDICITE_AGUDA', 'Apendicite aguda', false, 5423, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Peritonite') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_424_PERITONITE', 'Peritonite', false, 5424, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Peritonite') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_424_PERITONITE', 'Peritonite', false, 5424, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Obstrução intestinal') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_425_OBSTRUCAO_INTESTINAL', 'Obstrução intestinal', false, 5425, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Obstrução intestinal') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_425_OBSTRUCAO_INTESTINAL', 'Obstrução intestinal', false, 5425, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Invaginação intestinal') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_426_INVAGINACAO_INTESTINAL', 'Invaginação intestinal', false, 5426, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Invaginação intestinal') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_426_INVAGINACAO_INTESTINAL', 'Invaginação intestinal', false, 5426, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Volvo intestinal') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_427_VOLVO_INTESTINAL', 'Volvo intestinal', false, 5427, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Volvo intestinal') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_427_VOLVO_INTESTINAL', 'Volvo intestinal', false, 5427, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Divertículo de Meckel') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_428_DIVERTICULO_DE_MECKEL', 'Divertículo de Meckel', false, 5428, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Divertículo de Meckel') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_428_DIVERTICULO_DE_MECKEL', 'Divertículo de Meckel', false, 5428, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Perfuração de víscera oca') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_429_PERFURACAO_DE_VISCERA_OCA', 'Perfuração de víscera oca', false, 5429, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Perfuração de víscera oca') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_429_PERFURACAO_DE_VISCERA_OCA', 'Perfuração de víscera oca', false, 5429, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Aderências ou bridas intestinais') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_430_ADERENCIAS_OU_BRIDAS_INTESTINAIS', 'Aderências ou bridas intestinais', false, 5430, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Aderências ou bridas intestinais') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_430_ADERENCIAS_OU_BRIDAS_INTESTINAIS', 'Aderências ou bridas intestinais', false, 5430, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Abscesso intra-abdominal') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_431_ABSCESSO_INTRA_ABDOMINAL', 'Abscesso intra-abdominal', false, 5431, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Abscesso intra-abdominal') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_431_ABSCESSO_INTRA_ABDOMINAL', 'Abscesso intra-abdominal', false, 5431, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Colecistite') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_432_COLECISTITE', 'Colecistite', false, 5432, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Colecistite') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_432_COLECISTITE', 'Colecistite', false, 5432, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Colelitíase e coledocolitíase') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_433_COLELITIASE_E_COLEDOCOLITIASE', 'Colelitíase e coledocolitíase', false, 5433, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Colelitíase e coledocolitíase') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_433_COLELITIASE_E_COLEDOCOLITIASE', 'Colelitíase e coledocolitíase', false, 5433, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Pancreatite com complicação cirúrgica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_434_PANCREATITE_COM_COMPLICACAO_CIRURGICA', 'Pancreatite com complicação cirúrgica', false, 5434, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Pancreatite com complicação cirúrgica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_434_PANCREATITE_COM_COMPLICACAO_CIRURGICA', 'Pancreatite com complicação cirúrgica', false, 5434, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Hérnias inguinal e umbilical') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_435_HERNIAS_INGUINAL_E_UMBILICAL', 'Hérnias inguinal e umbilical', false, 5435, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Hérnias inguinal e umbilical') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_435_HERNIAS_INGUINAL_E_UMBILICAL', 'Hérnias inguinal e umbilical', false, 5435, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Hérnia encarcerada ou estrangulada') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_436_HERNIA_ENCARCERADA_OU_ESTRANGULADA', 'Hérnia encarcerada ou estrangulada', false, 5436, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Hérnia encarcerada ou estrangulada') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_436_HERNIA_ENCARCERADA_OU_ESTRANGULADA', 'Hérnia encarcerada ou estrangulada', false, 5436, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Hidrocele') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_437_HIDROCELE', 'Hidrocele', false, 5437, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Hidrocele') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_437_HIDROCELE', 'Hidrocele', false, 5437, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Criptorquidia') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_438_CRIPTORQUIDIA', 'Criptorquidia', false, 5438, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Criptorquidia') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_438_CRIPTORQUIDIA', 'Criptorquidia', false, 5438, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Torção testicular') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_439_TORCAO_TESTICULAR', 'Torção testicular', false, 5439, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Torção testicular') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_439_TORCAO_TESTICULAR', 'Torção testicular', false, 5439, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Fimose patológica e parafimose') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_440_FIMOSE_PATOLOGICA_E_PARAFIMOSE', 'Fimose patológica e parafimose', false, 5440, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Fimose patológica e parafimose') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_440_FIMOSE_PATOLOGICA_E_PARAFIMOSE', 'Fimose patológica e parafimose', false, 5440, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Hipospádia') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_441_HIPOSPADIA', 'Hipospádia', false, 5441, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Hipospádia') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_441_HIPOSPADIA', 'Hipospádia', false, 5441, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Varicocele') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_442_VARICOCELE', 'Varicocele', false, 5442, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Varicocele') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_442_VARICOCELE', 'Varicocele', false, 5442, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Cisto ou torção ovariana') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_443_CISTO_OU_TORCAO_OVARIANA', 'Cisto ou torção ovariana', false, 5443, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Cisto ou torção ovariana') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_443_CISTO_OU_TORCAO_OVARIANA', 'Cisto ou torção ovariana', false, 5443, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Empiema pleural') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_444_EMPIEMA_PLEURAL', 'Empiema pleural', false, 5444, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Empiema pleural') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_444_EMPIEMA_PLEURAL', 'Empiema pleural', false, 5444, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Pneumotórax') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_445_PNEUMOTORAX', 'Pneumotórax', false, 5445, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Pneumotórax') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_445_PNEUMOTORAX', 'Pneumotórax', false, 5445, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Malformação congênita das vias aéreas pulmonares') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_446_MALFORMACAO_CONGENITA_DAS_VIAS_AEREAS_PU', 'Malformação congênita das vias aéreas pulmonares', false, 5446, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Malformação congênita das vias aéreas pulmonares') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_446_MALFORMACAO_CONGENITA_DAS_VIAS_AEREAS_PU', 'Malformação congênita das vias aéreas pulmonares', false, 5446, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Sequestro pulmonar') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_447_SEQUESTRO_PULMONAR', 'Sequestro pulmonar', false, 5447, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Sequestro pulmonar') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_447_SEQUESTRO_PULMONAR', 'Sequestro pulmonar', false, 5447, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Cisto broncogênico') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_448_CISTO_BRONCOGENICO', 'Cisto broncogênico', false, 5448, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Cisto broncogênico') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_448_CISTO_BRONCOGENICO', 'Cisto broncogênico', false, 5448, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Linfangioma e malformações vasculares') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_449_LINFANGIOMA_E_MALFORMACOES_VASCULARES', 'Linfangioma e malformações vasculares', false, 5449, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Linfangioma e malformações vasculares') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_449_LINFANGIOMA_E_MALFORMACOES_VASCULARES', 'Linfangioma e malformações vasculares', false, 5449, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Cisto tireoglosso') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_450_CISTO_TIREOGLOSSO', 'Cisto tireoglosso', false, 5450, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Cisto tireoglosso') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_450_CISTO_TIREOGLOSSO', 'Cisto tireoglosso', false, 5450, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Cisto branquial') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_451_CISTO_BRANQUIAL', 'Cisto branquial', false, 5451, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Cisto branquial') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_451_CISTO_BRANQUIAL', 'Cisto branquial', false, 5451, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Neuroblastoma') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_452_NEUROBLASTOMA', 'Neuroblastoma', false, 5452, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Neuroblastoma') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_452_NEUROBLASTOMA', 'Neuroblastoma', false, 5452, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Tumor de Wilms') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_453_TUMOR_DE_WILMS', 'Tumor de Wilms', false, 5453, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Tumor de Wilms') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_453_TUMOR_DE_WILMS', 'Tumor de Wilms', false, 5453, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Hepatoblastoma') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_454_HEPATOBLASTOMA', 'Hepatoblastoma', false, 5454, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Hepatoblastoma') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_454_HEPATOBLASTOMA', 'Hepatoblastoma', false, 5454, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Teratomas') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_455_TERATOMAS', 'Teratomas', false, 5455, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Teratomas') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_455_TERATOMAS', 'Teratomas', false, 5455, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Tumores ovarianos, testiculares ou de partes moles') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_456_TUMORES_OVARIANOS_TESTICULARES_OU_DE_PAR', 'Tumores ovarianos, testiculares ou de partes moles', false, 5456, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Tumores ovarianos, testiculares ou de partes moles') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_456_TUMORES_OVARIANOS_TESTICULARES_OU_DE_PAR', 'Tumores ovarianos, testiculares ou de partes moles', false, 5456, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Hemorragia pós-operatória') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_457_HEMORRAGIA_POS_OPERATORIA', 'Hemorragia pós-operatória', false, 5457, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Hemorragia pós-operatória') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_457_HEMORRAGIA_POS_OPERATORIA', 'Hemorragia pós-operatória', false, 5457, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Infecção do sítio cirúrgico') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_458_INFECCAO_DO_SITIO_CIRURGICO', 'Infecção do sítio cirúrgico', false, 5458, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Infecção do sítio cirúrgico') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_458_INFECCAO_DO_SITIO_CIRURGICO', 'Infecção do sítio cirúrgico', false, 5458, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Deiscência de ferida ou anastomose') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_459_DEISCENCIA_DE_FERIDA_OU_ANASTOMOSE', 'Deiscência de ferida ou anastomose', false, 5459, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Deiscência de ferida ou anastomose') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_459_DEISCENCIA_DE_FERIDA_OU_ANASTOMOSE', 'Deiscência de ferida ou anastomose', false, 5459, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Fístula digestiva') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_460_FISTULA_DIGESTIVA', 'Fístula digestiva', false, 5460, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Fístula digestiva') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_460_FISTULA_DIGESTIVA', 'Fístula digestiva', false, 5460, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Sepse abdominal') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_461_SEPSE_ABDOMINAL', 'Sepse abdominal', false, 5461, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Sepse abdominal') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_461_SEPSE_ABDOMINAL', 'Sepse abdominal', false, 5461, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Íleo paralítico') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_462_ILEO_PARALITICO', 'Íleo paralítico', false, 5462, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Íleo paralítico') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_462_ILEO_PARALITICO', 'Íleo paralítico', false, 5462, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Obstrução intestinal pós-operatória') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_463_OBSTRUCAO_INTESTINAL_POS_OPERATORIA', 'Obstrução intestinal pós-operatória', false, 5463, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Obstrução intestinal pós-operatória') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_463_OBSTRUCAO_INTESTINAL_POS_OPERATORIA', 'Obstrução intestinal pós-operatória', false, 5463, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Síndrome compartimental abdominal') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_464_SINDROME_COMPARTIMENTAL_ABDOMINAL', 'Síndrome compartimental abdominal', false, 5464, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Síndrome compartimental abdominal') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_464_SINDROME_COMPARTIMENTAL_ABDOMINAL', 'Síndrome compartimental abdominal', false, 5464, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Complicações de estomias, drenos, gastrostomias e traqueostomias') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_465_COMPLICACOES_DE_ESTOMIAS_DRENOS_GASTROST', 'Complicações de estomias, drenos, gastrostomias e traqueostomias', false, 5465, 'Trauma / Cirúrgico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Complicações de estomias, drenos, gastrostomias e traqueostomias') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_465_COMPLICACOES_DE_ESTOMIAS_DRENOS_GASTROST', 'Complicações de estomias, drenos, gastrostomias e traqueostomias', false, 5465, 'Trauma / Cirúrgico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Transtorno do espectro autista') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_466_TRANSTORNO_DO_ESPECTRO_AUTISTA', 'Transtorno do espectro autista', false, 5466, 'Psiquiátrico / Social');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Transtorno do espectro autista') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_466_TRANSTORNO_DO_ESPECTRO_AUTISTA', 'Transtorno do espectro autista', false, 5466, 'Psiquiátrico / Social');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Transtorno do déficit de atenção e hiperatividade') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_467_TRANSTORNO_DO_DEFICIT_DE_ATENCAO_E_HIPER', 'Transtorno do déficit de atenção e hiperatividade', false, 5467, 'Psiquiátrico / Social');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Transtorno do déficit de atenção e hiperatividade') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_467_TRANSTORNO_DO_DEFICIT_DE_ATENCAO_E_HIPER', 'Transtorno do déficit de atenção e hiperatividade', false, 5467, 'Psiquiátrico / Social');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Deficiência intelectual') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_468_DEFICIENCIA_INTELECTUAL', 'Deficiência intelectual', false, 5468, 'Psiquiátrico / Social');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Deficiência intelectual') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_468_DEFICIENCIA_INTELECTUAL', 'Deficiência intelectual', false, 5468, 'Psiquiátrico / Social');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Transtornos específicos da aprendizagem') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_469_TRANSTORNOS_ESPECIFICOS_DA_APRENDIZAGEM', 'Transtornos específicos da aprendizagem', false, 5469, 'Psiquiátrico / Social');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Transtornos específicos da aprendizagem') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_469_TRANSTORNOS_ESPECIFICOS_DA_APRENDIZAGEM', 'Transtornos específicos da aprendizagem', false, 5469, 'Psiquiátrico / Social');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Transtorno do desenvolvimento da linguagem') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_470_TRANSTORNO_DO_DESENVOLVIMENTO_DA_LINGUAG', 'Transtorno do desenvolvimento da linguagem', false, 5470, 'Psiquiátrico / Social');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Transtorno do desenvolvimento da linguagem') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_470_TRANSTORNO_DO_DESENVOLVIMENTO_DA_LINGUAG', 'Transtorno do desenvolvimento da linguagem', false, 5470, 'Psiquiátrico / Social');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Transtorno do desenvolvimento da coordenação') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_471_TRANSTORNO_DO_DESENVOLVIMENTO_DA_COORDEN', 'Transtorno do desenvolvimento da coordenação', false, 5471, 'Psiquiátrico / Social');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Transtorno do desenvolvimento da coordenação') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_471_TRANSTORNO_DO_DESENVOLVIMENTO_DA_COORDEN', 'Transtorno do desenvolvimento da coordenação', false, 5471, 'Psiquiátrico / Social');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Transtornos de tiques') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_472_TRANSTORNOS_DE_TIQUES', 'Transtornos de tiques', false, 5472, 'Psiquiátrico / Social');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Transtornos de tiques') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_472_TRANSTORNOS_DE_TIQUES', 'Transtornos de tiques', false, 5472, 'Psiquiátrico / Social');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Síndrome de Tourette') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_473_SINDROME_DE_TOURETTE', 'Síndrome de Tourette', false, 5473, 'Psiquiátrico / Social');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Síndrome de Tourette') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_473_SINDROME_DE_TOURETTE', 'Síndrome de Tourette', false, 5473, 'Psiquiátrico / Social');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Transtorno depressivo') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_474_TRANSTORNO_DEPRESSIVO', 'Transtorno depressivo', false, 5474, 'Psiquiátrico / Social');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Transtorno depressivo') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_474_TRANSTORNO_DEPRESSIVO', 'Transtorno depressivo', false, 5474, 'Psiquiátrico / Social');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Transtorno bipolar') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_475_TRANSTORNO_BIPOLAR', 'Transtorno bipolar', false, 5475, 'Psiquiátrico / Social');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Transtorno bipolar') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_475_TRANSTORNO_BIPOLAR', 'Transtorno bipolar', false, 5475, 'Psiquiátrico / Social');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Transtorno de ansiedade generalizada') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_476_TRANSTORNO_DE_ANSIEDADE_GENERALIZADA', 'Transtorno de ansiedade generalizada', false, 5476, 'Psiquiátrico / Social');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Transtorno de ansiedade generalizada') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_476_TRANSTORNO_DE_ANSIEDADE_GENERALIZADA', 'Transtorno de ansiedade generalizada', false, 5476, 'Psiquiátrico / Social');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Ansiedade de separação') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_477_ANSIEDADE_DE_SEPARACAO', 'Ansiedade de separação', false, 5477, 'Psiquiátrico / Social');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Ansiedade de separação') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_477_ANSIEDADE_DE_SEPARACAO', 'Ansiedade de separação', false, 5477, 'Psiquiátrico / Social');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Fobia social e fobias específicas') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_478_FOBIA_SOCIAL_E_FOBIAS_ESPECIFICAS', 'Fobia social e fobias específicas', false, 5478, 'Psiquiátrico / Social');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Fobia social e fobias específicas') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_478_FOBIA_SOCIAL_E_FOBIAS_ESPECIFICAS', 'Fobia social e fobias específicas', false, 5478, 'Psiquiátrico / Social');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Transtorno do pânico') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_479_TRANSTORNO_DO_PANICO', 'Transtorno do pânico', false, 5479, 'Psiquiátrico / Social');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Transtorno do pânico') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_479_TRANSTORNO_DO_PANICO', 'Transtorno do pânico', false, 5479, 'Psiquiátrico / Social');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Mutismo seletivo') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_480_MUTISMO_SELETIVO', 'Mutismo seletivo', false, 5480, 'Psiquiátrico / Social');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Mutismo seletivo') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_480_MUTISMO_SELETIVO', 'Mutismo seletivo', false, 5480, 'Psiquiátrico / Social');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Transtorno obsessivo-compulsivo') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_481_TRANSTORNO_OBSESSIVO_COMPULSIVO', 'Transtorno obsessivo-compulsivo', false, 5481, 'Psiquiátrico / Social');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Transtorno obsessivo-compulsivo') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_481_TRANSTORNO_OBSESSIVO_COMPULSIVO', 'Transtorno obsessivo-compulsivo', false, 5481, 'Psiquiátrico / Social');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Transtorno de estresse pós-traumático') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_482_TRANSTORNO_DE_ESTRESSE_POS_TRAUMATICO', 'Transtorno de estresse pós-traumático', false, 5482, 'Psiquiátrico / Social');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Transtorno de estresse pós-traumático') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_482_TRANSTORNO_DE_ESTRESSE_POS_TRAUMATICO', 'Transtorno de estresse pós-traumático', false, 5482, 'Psiquiátrico / Social');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Transtorno opositor desafiante') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_483_TRANSTORNO_OPOSITOR_DESAFIANTE', 'Transtorno opositor desafiante', false, 5483, 'Psiquiátrico / Social');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Transtorno opositor desafiante') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_483_TRANSTORNO_OPOSITOR_DESAFIANTE', 'Transtorno opositor desafiante', false, 5483, 'Psiquiátrico / Social');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Transtorno de conduta') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_484_TRANSTORNO_DE_CONDUTA', 'Transtorno de conduta', false, 5484, 'Psiquiátrico / Social');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Transtorno de conduta') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_484_TRANSTORNO_DE_CONDUTA', 'Transtorno de conduta', false, 5484, 'Psiquiátrico / Social');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Irritabilidade grave') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_485_IRRITABILIDADE_GRAVE', 'Irritabilidade grave', false, 5485, 'Psiquiátrico / Social');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Irritabilidade grave') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_485_IRRITABILIDADE_GRAVE', 'Irritabilidade grave', false, 5485, 'Psiquiátrico / Social');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Transtorno explosivo intermitente') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_486_TRANSTORNO_EXPLOSIVO_INTERMITENTE', 'Transtorno explosivo intermitente', false, 5486, 'Psiquiátrico / Social');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Transtorno explosivo intermitente') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_486_TRANSTORNO_EXPLOSIVO_INTERMITENTE', 'Transtorno explosivo intermitente', false, 5486, 'Psiquiátrico / Social');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Automutilação') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_487_AUTOMUTILACAO', 'Automutilação', false, 5487, 'Psiquiátrico / Social');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Automutilação') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_487_AUTOMUTILACAO', 'Automutilação', false, 5487, 'Psiquiátrico / Social');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Comportamento suicida') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_488_COMPORTAMENTO_SUICIDA', 'Comportamento suicida', false, 5488, 'Psiquiátrico / Social');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Comportamento suicida') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_488_COMPORTAMENTO_SUICIDA', 'Comportamento suicida', false, 5488, 'Psiquiátrico / Social');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Transtorno de compulsão alimentar') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_489_TRANSTORNO_DE_COMPULSAO_ALIMENTAR', 'Transtorno de compulsão alimentar', false, 5489, 'Psiquiátrico / Social');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Transtorno de compulsão alimentar') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_489_TRANSTORNO_DE_COMPULSAO_ALIMENTAR', 'Transtorno de compulsão alimentar', false, 5489, 'Psiquiátrico / Social');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Pica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_490_PICA', 'Pica', false, 5490, 'Psiquiátrico / Social');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Pica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_490_PICA', 'Pica', false, 5490, 'Psiquiátrico / Social');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Transtorno de ruminação') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_491_TRANSTORNO_DE_RUMINACAO', 'Transtorno de ruminação', false, 5491, 'Psiquiátrico / Social');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Transtorno de ruminação') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_491_TRANSTORNO_DE_RUMINACAO', 'Transtorno de ruminação', false, 5491, 'Psiquiátrico / Social');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Primeiro episódio psicótico') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_492_PRIMEIRO_EPISODIO_PSICOTICO', 'Primeiro episódio psicótico', false, 5492, 'Psiquiátrico / Social');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Primeiro episódio psicótico') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_492_PRIMEIRO_EPISODIO_PSICOTICO', 'Primeiro episódio psicótico', false, 5492, 'Psiquiátrico / Social');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Esquizofrenia de início precoce') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_493_ESQUIZOFRENIA_DE_INICIO_PRECOCE', 'Esquizofrenia de início precoce', false, 5493, 'Psiquiátrico / Social');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Esquizofrenia de início precoce') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_493_ESQUIZOFRENIA_DE_INICIO_PRECOCE', 'Esquizofrenia de início precoce', false, 5493, 'Psiquiátrico / Social');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Transtorno esquizoafetivo') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_494_TRANSTORNO_ESQUIZOAFETIVO', 'Transtorno esquizoafetivo', false, 5494, 'Psiquiátrico / Social');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Transtorno esquizoafetivo') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_494_TRANSTORNO_ESQUIZOAFETIVO', 'Transtorno esquizoafetivo', false, 5494, 'Psiquiátrico / Social');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Psicose induzida por substâncias ou medicamentos') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_495_PSICOSE_INDUZIDA_POR_SUBSTANCIAS_OU_MEDI', 'Psicose induzida por substâncias ou medicamentos', false, 5495, 'Psiquiátrico / Social');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Psicose induzida por substâncias ou medicamentos') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_495_PSICOSE_INDUZIDA_POR_SUBSTANCIAS_OU_MEDI', 'Psicose induzida por substâncias ou medicamentos', false, 5495, 'Psiquiátrico / Social');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Ideação ou tentativa de suicídio') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_496_IDEACAO_OU_TENTATIVA_DE_SUICIDIO', 'Ideação ou tentativa de suicídio', false, 5496, 'Psiquiátrico / Social');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Ideação ou tentativa de suicídio') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_496_IDEACAO_OU_TENTATIVA_DE_SUICIDIO', 'Ideação ou tentativa de suicídio', false, 5496, 'Psiquiátrico / Social');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Agitação psicomotora grave') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_497_AGITACAO_PSICOMOTORA_GRAVE', 'Agitação psicomotora grave', false, 5497, 'Psiquiátrico / Social');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Agitação psicomotora grave') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_497_AGITACAO_PSICOMOTORA_GRAVE', 'Agitação psicomotora grave', false, 5497, 'Psiquiátrico / Social');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Surto psicótico') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_498_SURTO_PSICOTICO', 'Surto psicótico', false, 5498, 'Psiquiátrico / Social');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Surto psicótico') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_498_SURTO_PSICOTICO', 'Surto psicótico', false, 5498, 'Psiquiátrico / Social');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Intoxicação ou abstinência de álcool e outras drogas') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_499_INTOXICACAO_OU_ABSTINENCIA_DE_ALCOOL_E_O', 'Intoxicação ou abstinência de álcool e outras drogas', false, 5499, 'Psiquiátrico / Social');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Intoxicação ou abstinência de álcool e outras drogas') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_499_INTOXICACAO_OU_ABSTINENCIA_DE_ALCOOL_E_O', 'Intoxicação ou abstinência de álcool e outras drogas', false, 5499, 'Psiquiátrico / Social');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Delirium pediátrico') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_500_DELIRIUM_PEDIATRICO', 'Delirium pediátrico', false, 5500, 'Psiquiátrico / Social');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Delirium pediátrico') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_500_DELIRIUM_PEDIATRICO', 'Delirium pediátrico', false, 5500, 'Psiquiátrico / Social');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Síndrome de abstinência iatrogênica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_501_SINDROME_DE_ABSTINENCIA_IATROGENICA', 'Síndrome de abstinência iatrogênica', false, 5501, 'Psiquiátrico / Social');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Síndrome de abstinência iatrogênica') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_501_SINDROME_DE_ABSTINENCIA_IATROGENICA', 'Síndrome de abstinência iatrogênica', false, 5501, 'Psiquiátrico / Social');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Transtorno de adaptação à hospitalização') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_502_TRANSTORNO_DE_ADAPTACAO_A_HOSPITALIZACAO', 'Transtorno de adaptação à hospitalização', false, 5502, 'Psiquiátrico / Social');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Transtorno de adaptação à hospitalização') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_502_TRANSTORNO_DE_ADAPTACAO_A_HOSPITALIZACAO', 'Transtorno de adaptação à hospitalização', false, 5502, 'Psiquiátrico / Social');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Catatonia') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_503_CATATONIA', 'Catatonia', false, 5503, 'Psiquiátrico / Social');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Catatonia') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_503_CATATONIA', 'Catatonia', false, 5503, 'Psiquiátrico / Social');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Transtornos somáticos e sintomas funcionais') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_504_TRANSTORNOS_SOMATICOS_E_SINTOMAS_FUNCION', 'Transtornos somáticos e sintomas funcionais', false, 5504, 'Psiquiátrico / Social');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Transtornos somáticos e sintomas funcionais') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_504_TRANSTORNOS_SOMATICOS_E_SINTOMAS_FUNCION', 'Transtornos somáticos e sintomas funcionais', false, 5504, 'Psiquiátrico / Social');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_principal_id AND label = 'Transtorno factício imposto a outro') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_principal_id, 'PRIN_PED_505_TRANSTORNO_FACTICIO_IMPOSTO_A_OUTRO', 'Transtorno factício imposto a outro', false, 5505, 'Psiquiátrico / Social');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.pergunta_opcoes_diagnostico WHERE pergunta_id = v_secundario_id AND label = 'Transtorno factício imposto a outro') THEN
    INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, codigo, label, has_input, ordem, categoria)
    VALUES (v_secundario_id, 'SEC_PED_505_TRANSTORNO_FACTICIO_IMPOSTO_A_OUTRO', 'Transtorno factício imposto a outro', false, 5505, 'Psiquiátrico / Social');
  END IF;

END $$;
