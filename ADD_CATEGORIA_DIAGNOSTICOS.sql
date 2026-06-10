-- ✅ SEGURO: Apenas adiciona a coluna categoria e atualiza os valores.
-- Nenhum dado de paciente será apagado.

ALTER TABLE public.pergunta_opcoes_diagnostico
  ADD COLUMN IF NOT EXISTS categoria text NULL;

-- ── PRINCIPAL ────────────────────────────────────────────────

UPDATE public.pergunta_opcoes_diagnostico SET categoria = 'Cardiovascular'
WHERE codigo IN ('PRIN_ARRITMIA','PRIN_CH_CARDIO','PRIN_HAS','PRIN_ICC','PRIN_MISC','PRIN_POS_CARD','PRIN_SYND_PCR','PRIN_ARR_BRADI','PRIN_ARR_TAQUI','PRIN_PCR_ASSIST');

UPDATE public.pergunta_opcoes_diagnostico SET categoria = 'Choque / Distributivo'
WHERE codigo IN ('PRIN_CH_ANAFI','PRIN_CH_NEURO','PRIN_CH_HIPO_HEM','PRIN_CH_HIPO_NAO','PRIN_CH_OBST','PRIN_OUTROS_CHOQUE');

UPDATE public.pergunta_opcoes_diagnostico SET categoria = 'Gastrointestinal / Hepático'
WHERE codigo IN ('PRIN_ABD_CLIN','PRIN_ABD_OBST','PRIN_COLEST','PRIN_CORPO','PRIN_DII','PRIN_HDA','PRIN_HDB','PRIN_CAUST','PRIN_INS_HEP');

UPDATE public.pergunta_opcoes_diagnostico SET categoria = 'Hematológico / Oncológico'
WHERE codigo IN ('PRIN_ANEMIA_F','PRIN_CIVD','PRIN_COAGULO','PRIN_COLAG','PRIN_HEMATO','PRIN_ONCO','PRIN_HEMOFAGO','PRIN_LISE','PRIN_HEM_ANEMIA','PRIN_HEM_APLASIA','PRIN_HEM_OUTRAS');

UPDATE public.pergunta_opcoes_diagnostico SET categoria = 'Infeccioso / Séptico'
WHERE codigo IN ('PRIN_CALAZAR','PRIN_DENGUE','PRIN_FEBRE','PRIN_INF_SNC','PRIN_SEPSE','PRIN_SEPSE_NEO');

UPDATE public.pergunta_opcoes_diagnostico SET categoria = 'Metabólico / Endócrino'
WHERE codigo IN ('PRIN_CAD','PRIN_TIREO','PRIN_DESID','PRIN_DIAB_INS','PRIN_DM','PRIN_METAB','PRIN_ERROS','PRIN_ADRENAL','PRIN_SIAAD','PRIN_SRF','PRIN_DIAB_CEN','PRIN_DIAB_NEF');

UPDATE public.pergunta_opcoes_diagnostico SET categoria = 'Neurológico'
WHERE codigo IN ('PRIN_COMA','PRIN_CONVULS','PRIN_DISF_DVP','PRIN_EDEMA','PRIN_ENCEF','PRIN_ENCEF_HIP','PRIN_HTIC','PRIN_MENING','PRIN_MENINGO');

UPDATE public.pergunta_opcoes_diagnostico SET categoria = 'Nutricional / Outros'
WHERE codigo IN ('PRIN_DESNU','PRIN_FMO','PRIN_INTOX','PRIN_OUTROS_1','PRIN_OUTROS_2','PRIN_OUTROS_3','PRIN_OUTROS_4');

UPDATE public.pergunta_opcoes_diagnostico SET categoria = 'Psiquiátrico / Social'
WHERE codigo IN ('PRIN_DIP','PRIN_PSIQ','PRIN_MAUS','PRIN_SUICID');

UPDATE public.pergunta_opcoes_diagnostico SET categoria = 'Renal'
WHERE codigo IN ('PRIN_IRA_REN','PRIN_IRC_REN','PRIN_SIND_NEFRI','PRIN_SIND_NEFRO','PRIN_SPSC');

UPDATE public.pergunta_opcoes_diagnostico SET categoria = 'Respiratório'
WHERE codigo IN ('PRIN_BRONQ','PRIN_DIFIC_RESP','PRIN_FIBROSE','PRIN_IRA','PRIN_PNEUMO','PRIN_SIND_TOR','PRIN_STATUS','PRIN_IRA_4','PRIN_IRA_1','PRIN_IRA_3','PRIN_IRA_2','PRIN_PARDS','PRIN_PNEUMO_HOSP','PRIN_PNEUMO_VIR');

UPDATE public.pergunta_opcoes_diagnostico SET categoria = 'Trauma / Cirúrgico'
WHERE codigo IN ('PRIN_COMP_POS','PRIN_POLI','PRIN_POS_OP','PRIN_QUEIMA','PRIN_TCE','PRIN_OUTROS_TRAU','PRIN_SIND_COMP');

-- ── SECUNDÁRIO ───────────────────────────────────────────────

UPDATE public.pergunta_opcoes_diagnostico SET categoria = 'Cardiovascular'
WHERE codigo IN ('SEC_BRADI','SEC_HAS','SEC_POS_PCR','SEC_TAQUI','SEC_BRADIARR');

UPDATE public.pergunta_opcoes_diagnostico SET categoria = 'Gastrointestinal / Hepático'
WHERE codigo IN ('SEC_COLEST','SEC_CONSTIP','SEC_DIARREIA','SEC_DIARREIA_ATB','SEC_ENTERO','SEC_ESOFAG','SEC_HEMORRAGIA','SEC_INSUF_HEP','SEC_PARASITO');

UPDATE public.pergunta_opcoes_diagnostico SET categoria = 'Hematológico / Oncológico'
WHERE codigo IN ('SEC_ANEMIAS','SEC_CIVD','SEC_COAG','SEC_COLAGENO','SEC_LAMG');

UPDATE public.pergunta_opcoes_diagnostico SET categoria = 'Infeccioso / Séptico'
WHERE codigo IN ('SEC_IPCS_2','SEC_MULTI','SEC_CONJUNT','SEC_FUNGO','SEC_ISC','SEC_ITU','SEC_INFEC_SANGUE','SEC_IPCS_1','SEC_OUTRAS_INF','SEC_SEPSE');

UPDATE public.pergunta_opcoes_diagnostico SET categoria = 'Metabólico / Endócrino'
WHERE codigo IN ('SEC_ACIDOSE','SEC_ALCALOSE','SEC_CAD','SEC_TIREO','SEC_DESID_HIPER','SEC_DESID_HIPO','SEC_DI','SEC_DM','SEC_MITO','SEC_ERROS','SEC_HIPEROSM','SEC_HIPERCA','SEC_HIPERK','SEC_HIPERFOS','SEC_HIPERGLI','SEC_HIPERMG','SEC_HIPERNA','SEC_HIPER','SEC_HIPERTRI','SEC_HIPOCA','SEC_HIPOK','SEC_HIPOFOS','SEC_HIPOGLI','SEC_HIPOMG','SEC_HIPONA','SEC_HIPO','SEC_INSUF_ADR','SEC_ADRENAL_AG','SEC_SRF','SEC_ACID_MET');

UPDATE public.pergunta_opcoes_diagnostico SET categoria = 'Neurológico'
WHERE codigo IN ('SEC_COMA','SEC_CONV_DIF','SEC_DVE','SEC_DELIR','SEC_DISF_DVP','SEC_POLINEU','SEC_REC_COMA','SEC_SIHAD','SEC_ABSTIN','SEC_SPSC','SEC_VENTRI');

UPDATE public.pergunta_opcoes_diagnostico SET categoria = 'Nutricional / Outros'
WHERE codigo IN ('SEC_DESNU','SEC_ERRO_ALIM','SEC_ESCARA','SEC_ODONTO','SEC_OUTROS_1','SEC_OUTROS_2','SEC_OUTROS_3','SEC_OUTROS_4');

UPDATE public.pergunta_opcoes_diagnostico SET categoria = 'Renal'
WHERE codigo IN ('SEC_IRA_RIM','SEC_IRC_RIM','SEC_NEFRI','SEC_NEFRO','SEC_SPSC','SEC_SOBRE_HID','SEC_SOBRECARGA_HID');

UPDATE public.pergunta_opcoes_diagnostico SET categoria = 'Respiratório'
WHERE codigo IN ('SEC_BRONCO','SEC_DERRAME','SEC_FALHA_EXT','SEC_IRA_SEC','SEC_PAV','SEC_PNEUMO','SEC_PARDS','SEC_PNEUMO_VIR','SEC_CORP_VIAS');

UPDATE public.pergunta_opcoes_diagnostico SET categoria = 'Trauma / Cirúrgico'
WHERE codigo IN ('SEC_COMP_CIR','SEC_POS_OP','SEC_SIND_COMP');

-- Tudo que foi digitado manualmente (sem categoria) fica como Outros
UPDATE public.pergunta_opcoes_diagnostico
SET categoria = 'Outros'
WHERE categoria IS NULL;

-- Verificar resultado
SELECT id, pergunta_id, codigo, label, categoria
FROM public.pergunta_opcoes_diagnostico
ORDER BY pergunta_id, categoria, ordem;
