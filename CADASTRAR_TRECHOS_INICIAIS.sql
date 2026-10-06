-- ============================================================================
-- CADASTRAR_TRECHOS_INICIAIS.sql
-- Trechos dos 3 primeiros protocolos, transcritos dos PDFs.
--
-- ANTES: CREATE_PROTOCOLOS.sql, CADASTRAR_PROTOCOLOS_INICIAIS.sql e
--        CREATE_PROTOCOLO_TRECHOS.sql.
--
-- ATENÇÃO — REVISÃO CLÍNICA: este texto é o que a equipe vai ler na tela.
-- Foi transcrito dos PDFs sem corrigir o conteúdo; tabelas e fluxogramas foram
-- passados para texto corrido. Conferir cada trecho com o PDF antes de liberar
-- para a equipe (principalmente doses, valores e os dois fluxogramas).
-- Onde o próprio PDF está incompleto ou parece ter erro de digitação, o texto foi
-- mantido como no PDF e marcado entre colchetes ("[... — confirmar]"). Essas
-- marcas aparecem na tela; a Dra. Lélia decide a redação final de cada uma.
--
-- Rodar um bloco de cada vez (um por protocolo).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- BLOCO 1 — Cetoacidose Diabética
-- ----------------------------------------------------------------------------
INSERT INTO protocolo_trechos (protocolo_id, ordem, pagina, titulo, texto)
SELECT p.id, v.ordem, v.pagina, v.titulo, v.texto
FROM protocolos p,
(VALUES
(1, 1, 'Definição', $t$Tríade:
Hiperglicemia: glicemia > 200 mg/dl.
Cetose: cetonemia (> 3 mMol/L) e cetonúria (> 80 mg/dl).
Acidemia: pH < 7,3 + bicarbonato sérico < 15 mEq/L + aumento de ânion gap.
Obs.: a glicemia pode ser normal ou baixa nas crianças que usaram insulina e/ou tiveram grandes perdas e baixa ingesta oral.$t$),

(2, 1, 'Classificação de gravidade', $t$Leve: pH arterial 7,25 – 7,30; bicarbonato sérico 15 – 18 mEq/L; ânion gap > 10; sensório alerta.
Moderada: pH arterial 7,0 – 7,24; bicarbonato sérico 10 – 15 mEq/L; ânion gap > 12; sensório alerta/sonolento.
Grave: pH arterial < 7,0; bicarbonato sérico < 10 mEq/L; ânion gap > 12; estupor/coma.$t$),

(3, 1, 'Critérios de indicação de UTI', $t$Choque circulatório;
Acidose metabólica moderada ou grave;
Distúrbios eletrolíticos;
Edema cerebral ou pulmonar;
Coma.$t$),

(4, 1, 'Cálculos', $t$Ânion gap = (Na + K) – (Cl + HCO3) = 12 (+/- 2 mmol/L).
Sódio corrigido (mEq/L) = Na encontrado + [1,6 x (glicemia (mg/dl) – 100)] / 100.
Osmolalidade efetiva = 2 x Na (mEq/L) + glicemia (mg/dl) / 18 + ureia / 6.
PCO2 esperado = (Bic x 1,5) + 8 = resultado (+/- 2).$t$),

(5, 2, 'Exames laboratoriais e monitorização', $t$Hemograma: admissão, após expansões iniciais.
Osmolalidade, ânion gap: admissão.
Glicemia, Na, K, fósforo, Mg, ureia, creatinina e gasometria arterial ou venosa: admissão; glicemia, Na, K e gasometria 1/1h inicialmente até estabilizar e depois a cada 2-4h.
Cetonas no plasma e na urina: admissão; cetonúria a cada micção.
Urina I, urocultura: admissão.
Culturas (hemocultura, secreção traqueal quantitativa): se necessário.
RX de tórax: admissão.
FC, FR, PA: 1/1h.
ECG: conforme K.
Balanço hídrico: sonda vesical se alteração da consciência ou ausência de diurese nas primeiras 4h após o início do tratamento; SNG se alteração da consciência.
Ureia e creatinina: repetir após infusão volêmica se necessário.
Avaliação neurológica: admissão e 1/1h.
Glicemia após o início da dieta VO: antes de cada refeição; antes de dormir; entre 2 e 4h da madrugada.

Leucocitose de até 10 000 a 15 000 pode não indicar processo infeccioso. Leucocitose > 25 000 ou presença de > 10% de células jovens são sugestivos de infecção bacteriana.$t$),

(6, 3, 'Tratamento: objetivos e condutas iniciais', $t$Objetivos:
Cuidado com as VAS se alteração do nível de consciência;
Correção da desidratação;
Correção dos distúrbios eletrolíticos e ácido-básicos;
Identificação e tratamento do fator precipitante.

Condutas iniciais:
1 - Monitorização: oximetria de pulso; PANI (pressão arterial não invasiva); monitorização de ECG: reconhecimento precoce de hipercalemia (onda T apiculada), hipocalemia (onda T invertida ou plana) e/ou arritmias fatais.
2 - Avaliação primária: A - vias aéreas; B - respiração; C - circulação; D - estado neurológico; E - exposição, extremidades e temperatura.

Etapas: fluidoterapia; insulinoterapia; terapia eletrolítica; tratamento das causas precipitantes; complicações.$t$),

(7, 4, 'Fluidoterapia', $t$Objetivo: reposição dos déficits em 48 horas e manter a glicemia entre 150 – 250 mg/dl.
Estimativa de déficit fluídico: 5 – 10%.
pH sanguíneo > ou = 7,1 = déficit de fluido de 5%.
pH sanguíneo < 7,1 = déficit de fluido de 10%.
Ex.: paciente 20 kg – pH 7,15 – déficit de fluido de 5% = 1000 ml.
Pacientes com choque hipovolêmico devem receber 10 a 20 ml/kg de solução isotônica em 5 a 10 minutos.
Volume a ser realizado nas primeiras 24h: incomum oferecer mais de 1,5 a 2 vezes a manutenção diária.
Repor perdas continuadas por vômitos e diurese excessiva.
Tipo de solução nas primeiras 24 horas: ver fluxograma. O objetivo é a correção gradual da glicemia entre 50-90 mg/dl/h.
Após as 24 horas: iniciar hidratação de manutenção: 1500 - 2000 ml/m2/sc com sódio a 15% e potássio a 4%, com controle rigoroso dos eletrólitos.
Reposição de perdas (50 ml/kg/d com SF 0,9% + SG 5% 1:1 K 50 mEq/L).
Se evolução favorável, manter 1/3 deste volume EV e 2/3 VO, na forma de dieta conforme a idade (suco, chá, água, leite).$t$),

(8, 5, 'Fluxograma da reposição volêmica', $t$[Fluxograma passado para texto — conferir no PDF]

Choque hipotensivo: expansão volêmica com SF 0,9% - 20 ml/kg em 5 - 10 min (até 60 ml/kg).

Desidratação (5 - 10%), primeiras 24 horas:
1ª hora: SF 0,9% - 10 ml/kg/1h.
2ª, 3ª e 4ª horas: SF 0,9% - 10 ml/kg/h.
Diurese presente, K+ normal ou baixo = 40 mEq/L de K+.

5ª a 24ª hora: volume 2000 ml/m2 em 20h. SC = (P x 4 + 7) / (P + 90).

Bolsa A – Dx > 300 mg/dl: NaCl 150 mEq/L, KCl 40 mEq/L.
Preparo: SF 0,9% = 485 ml; KCl 10% = 15 ml.

Bolsa B – Dx entre 250-300 mg/dl ou queda > 90 mg/dl: ½ bolsa A e ½ bolsa B. NaCl 20% - 150 mEq/L, glicose 10%, KCl 40 mEq/L.
Preparo: SG 5% = 347 ml; G 25% = 116 ml; NaCl 20% = 22 ml; KCl 10% = 15 ml.$t$),

(9, 6, 'Insulinoterapia: infusão contínua', $t$Inicia-se infusão de insulina após expansão inicial de volume e obtenção de boa diurese (> 1,5 ml/kg/h).
A glicemia deverá cair na velocidade de 50 – 90 mg/dl/h (10% por hora).
Iniciar insulina simples 0,1 U/kg/h EV. Se a queda da glicemia for mais rápida que a velocidade determinada, deve-se reduzir a dose para 0,05 U/kg/h e/ou adicionar SG 5 - 10% na fluidoterapia; se a queda for mais lenta ou persistência da acidemia (apesar de glicemia ≤ 250 mg/dl), deve-se aumentar para 0,2 U/kg/h.
Infusão: insulina simples 25 U + SF 0,9% 250 ml. Esta solução tem concentração de 0,1 U/ml e deve ser infundida na velocidade de 1 ml/kg em 1h para dar 0,1 U/kg/h. Devido à ligação da insulina ao plástico, desprezar os 50 ml iniciais desta solução para lavar o equipo.$t$),

(10, 6, 'Insulina regular conforme HGT e critérios de controle', $t$Quando glicemia < 250 mg/dl com Bic > 15 e pH > 7,25 e a criança aceitar dieta VO, inicia-se insulina simples 4/4h, conforme HGT.

Doses de insulina regular utilizadas para reposição:
< ou = 120: refeição rápida.
180 – 240: 0,08 U/kg.
240 – 300: 0,15 U/kg.
> 300: 0,2 U/kg.
[A tabela do PDF não traz a faixa de 120 a 180 — conferir no PDF]

Critérios de controle de CAD: glicemia < ou = 250 mg/dl, bicarbonato sérico ≥ 15 mEq/L e pH > 7,3.
Manter infusão de insulina por 30 minutos após início do esquema fracionado; se acidemia persistir com glicemia ≤ 250 mg/dl, aumenta-se a infusão de glicose.
Em pacientes com diagnóstico prévio de DM: prescrever 10% a mais da dose de NPH SC utilizada anteriormente à crise hiperglicêmica.$t$),

(11, 7, 'Insulina no recém-diagnosticado e tipos de insulina', $t$Em pacientes recém-diagnosticados, inicia-se 0,3 – 0,6 U/kg/d (0,5) SC ou IM, basal + correção, sendo 50% para regular e 50% para NPH, sendo 2/3 da dose diária pela manhã e 1/3 à noite.

Tipos de insulina (via; início da ação; duração da ação; efeito máximo):
Insulina regular (R, cristalina) EV: 3 - 4 min; 30 min; -.
Insulina regular IM/SC: 20 – 30 min; 6 – 8h; 2 – 4h.
NPH IM/SC: início não informado no PDF; 12 – 13h; 5 – 7h.
Glargina (ação prolongada, Lantus) IM/SC: 2h; 24h; não tem. 1x ao dia associada a insulina regular ou lispro ou aspart.
Detemir (Levemir) IM/SC: 3 – 4h; até 24h; 6 – 8h.$t$),

(12, 7, 'Fluxograma da insulina contínua', $t$[Fluxograma passado para texto — conferir no PDF]

Insulina contínua (0,1 U/kg/h).

Se glicemia ≤ 250 mg/dl E bicarbonato > 15 mEq/L:
reduzir a velocidade de infusão da insulina para 0,05 U/kg/h por 2h
E insulina regular SC 0,2 U/kg
E SG 5% na reposição volêmica.

Se glicemia não diminui e/ou bicarbonato < 15 mEq/L:
aumentar insulina contínua: 0,2 U/kg/h.$t$),

(13, 8, 'Terapia eletrolítica: potássio', $t$Potássio: dosar no início da insulinoterapia ou imediatamente se houver sinais de hipocalemia.
> 5,5 mEq/L: não necessita repor; realizar ECG.
3,5 – 5,5 mEq/L: repor 20-40 mEq/L.
≤ 3,5 mEq/L: repor 40 – 60 mEq/L; realizar ECG.
Objetivo: manter K sérico de 4 – 5 mEq/L.
Velocidade de reposição máxima = 0,5 mEq/kg/h.$t$),

(14, 8, 'Terapia eletrolítica: bicarbonato', $t$Bicarbonato: é controverso.
Indicações: pH < 6,9 (após primeira hora de hidratação) OU bicarbonato < 5 mEq/L com contratilidade e tônus vasomotor comprometidos.
Cálculo: 1 - 2 mEq/kg em 1 - 2 horas.
Solução de bicarbonato de Na a 8,4% tem 1 mEq/ml e osmolalidade de 2000 mOsm; portanto, o volume a ser infundido deve ser diluído na proporção 1:3.$t$),

(15, 8, 'Terapia eletrolítica: fósforo', $t$Fósforo.
Indicação: disfunção cardíaca, depressão respiratória e/ou fosfato sérico < 1,0 mg/dl.
Repor fosfato diácido de potássio KH2PO4.
0,5 - 1 mEq/kg.$t$),

(16, 8, 'Tratamento das causas precipitantes', $t$Iniciar antibioticoterapia conforme evidência de infecção, sendo mais comum ITU e pneumonia.$t$),

(17, 9, 'Complicações e edema cerebral', $t$Complicações:
Hipoglicemia: reduzir a infusão de insulina e/ou aumentar a infusão de glicose;
SARA;
Tromboembolismo;
Rabdomiólise não traumática;
Hipopotassemia;
Acidose hiperclorêmica;
Edema pulmonar;
Edema cerebral.

Edema cerebral:
Controlar a redução da osmolalidade;
Restrição fluídica (400 – 600 ml/m2 SC/d + reposição de perdas urinárias);
Se sinais de HIC: manitol 0,5 – 1,5 g/kg EV em 20 min, repetir em 0,5 a 2 horas se não houver resposta inicial;
Não há benefícios no uso de diuréticos ou corticoides;
Alternativa ao manitol: solução salina hipertônica (NaCl 3%) – 2 a 4 ml/kg por 10 min (em bolus); repetir 3x; controle de Na+ sérico;
Cabeça elevada em posição neutra;
Proteção de VAS – intubação endotraqueal;
Ocorre com mais frequência 2 – 24h após o início do tratamento, após melhora clínica, hemodinâmica e bioquímica.$t$),

(18, 9, 'Edema cerebral: escore de sintomas (Muir)', $t$Encontrar critérios diagnósticos definitivos, ou 2 critérios maiores, ou 1 critério maior e 2 menores.

Critérios diagnósticos: postura de descerebração ou decorticação; paralisia de nervos cranianos; resposta anormal à dor; gasping ou respiração de Cheyne-Stokes.
Critérios maiores: alteração do estado mental; bradicardia sem causa.
Critérios menores: vômitos; cefaleia; letargia; sonolência; hipertensão diastólica.$t$)
) AS v(ordem, pagina, titulo, texto)
WHERE p.arquivo_path = 'cetoacidose-diabetica.pdf';

-- ----------------------------------------------------------------------------
-- BLOCO 2 — Sepse e Choque Séptico
-- ----------------------------------------------------------------------------
INSERT INTO protocolo_trechos (protocolo_id, ordem, pagina, titulo, texto)
SELECT p.id, v.ordem, v.pagina, v.titulo, v.texto
FROM protocolos p,
(VALUES
(1, 2, 'Considerações e faixas etárias', $t$Protocolo baseado no Instituto Latino Americano de Sepse (ILAS), que usa as recomendações internacionais vigentes: Surviving Sepsis Campaign, American College of Critical Care Medicine e as definições para sepse da World Federation of Pediatric Intensive and Critical Care Societies.

Faixa etária pediátrica:
Lactente: > 1 mês a 1 ano.
Pré-escolar: ≥ 2 a 5 anos.
Escolar: ≥ 6 a 12 anos.
Adolescente / jovem: ≥ 13 a < 18 anos.$t$),

(2, 2, 'SIRS: parâmetros por faixa etária', $t$Síndrome da resposta inflamatória sistêmica (SIRS) em pediatria: presença de, pelo menos, dois dos critérios, sendo que um deles deve ser alteração da temperatura ou do número de leucócitos.

Parâmetros para critérios de SIRS e pressão arterial por idade (FC bpm; leucócitos x10³/mm³; FR ipm; temperatura °C; PAS mmHg):
1 mês - 1 ano: FC > 180 ou < 90; leucócitos > 17,5 ou < 5,0; FR > 34; temperatura > 38,5 ou < 36; PAS < 75.
> 1 - 5 anos: FC > 140; leucócitos > 15,5 ou < 6,0; FR > 22; temperatura > 38,5 ou < 36; PAS < 74.
> 5 - 12 anos: FC > 130; leucócitos > 13,5 ou < 4,5; FR > 18; temperatura > 38,5 ou < 36; PAS < 83.
> 12 - 18 anos: FC > 110; leucócitos > 11,0 ou < 4,5; FR > 14; temperatura > 38,5 ou < 36; PAS < 90.$t$),

(3, 3, 'SIRS: descrição dos critérios', $t$Alteração de temperatura corpórea: hipertermia ou hipotermia.
Taquicardia: frequência cardíaca (FC) > 2 desvios padrão (DP) acima do normal para idade na ausência de estímulos externos; ou outra elevação inexplicável por período de tempo de 0,5 a 4 horas; ou, para crianças < 1 ano, bradicardia, definida como FC < percentil 10 para idade na ausência de estímulos externos, drogas bloqueadoras ou doenças cardíacas congênitas, ou outra redução inexplicável por um período de tempo de 30 minutos.
Taquipneia: frequência respiratória (FR) > 2 DP acima do normal para idade ou necessidade de ventilação mecânica para um processo agudo não relacionado a doença neuromuscular de base ou necessidade de anestesia geral.
Alteração de leucócitos: leucocitose ou leucopenia não secundárias a quimioterapia, ou presença de formas jovens de neutrófilos no sangue periférico.$t$),

(4, 3, 'Definições: infecção, sepse, sepse grave e choque séptico', $t$Infecção: doença suspeita ou confirmada, causada por qualquer patógeno infeccioso, ou síndrome clínica associada com alta probabilidade de infecção.
Sepse: disfunção orgânica, ameaçadora à vida, causada por uma resposta desregulada do hospedeiro à infecção.
Sepse grave: presença de dois ou mais sinais de SRIS, sendo um deles hipertermia/hipotermia e/ou alteração de leucócitos, concomitantemente à presença de quadro infeccioso confirmado ou suspeito.
Choque séptico: situação em que as alterações circulatórias e celulares/metabólicas decorrentes da sepse são profundas, de modo a aumentar substancialmente a mortalidade.$t$),

(5, 4, 'Critérios de disfunção orgânica', $t$Cardiovascular: apesar da administração de fluidos endovenosos ≥ 40 ml/kg em uma hora, presença de: hipotensão arterial, definida como PAS < percentil 5 para idade ou PAS < 2 desvios padrão abaixo do normal para a idade; OU necessidade de medicação vasoativa para manter a PAS dentro dos valores normais (exceto dopamina ≤ 5 µg/kg/min); OU dois dos seguintes parâmetros de perfusão orgânica inadequada: tempo de enchimento capilar (TEC) prolongado; diferença entre temperatura central e periférica > 3°C; oligúria (débito cardíaco < 1,0 mL/kg/h) [redação do PDF; provável "débito urinário" — confirmar]; acidose metabólica inexplicável: déficit de bases > 5,0 mEq/L; lactato acima de 2 vezes o valor de referência.
Respiratório: PaO2 > 20 mmHg acima da PaCO2 basal [redação do PDF; provável "PaCO2 > 20 mmHg acima da basal" — confirmar]; OU PaO2/FiO2 < 300 na ausência de cardiopatia cianótica ou doença pulmonar pré-existente; OU necessidade de ventilação mecânica não invasiva (VNI) ou ventilação mecânica (VM).
Neurológico: escala de coma de Glasgow ≤ 11; OU alteração aguda do nível de consciência com queda ≥ 3 do nível anormal da ECG basal.
Hepática: aumento significativo de bilirrubinas totais (≥ 4 mg/dL); OU ALT/TGP ≥ 2 vezes maior que o limite superior para a idade.
Renal: creatinina ≥ 2 vezes o limite superior para idade; OU aumento de creatinina de 2 vezes em relação ao basal.
Hematológica: plaquetas < 80.000/mm³ ou redução de 50% do número de plaquetas em relação ao maior valor registrado nos últimos 3 dias; OU alteração significativa de RNI (> 2).$t$),

(6, 5, 'Condições de risco elevado para sepse', $t$Lactentes jovens (< 1 ano) e recém-nascidos;
Doença oncológica;
Asplenia;
Transplante de medula óssea;
Presença de cateter venoso central (CVC);
Transplante de órgãos sólidos;
Imunodeficiência / imunossupressão / imunocomprometido.$t$),

(7, 6, 'Avaliação: sinais de alerta e classificação', $t$Todos os pacientes devem ser avaliados diariamente pela equipe de enfermagem e médico quanto a sinais clínicos de alerta para sepse grave e choque séptico, desde a admissão até a alta:
TEC > 2 segundos;
Alteração do estado mental manifestada por irritabilidade, agitação, choro inapropriado, interação pobre com familiares, sonolência, letargia ou coma;
Pulsos periféricos diminuídos em comparação com os pulsos centrais;
Extremidades frias ou livedo;
Diurese diminuída (< 0,5 mL/kg/h);
Hipotensão (sinal muito tardio, comum em choque descompensado).

Após a identificação do paciente com SUSPEITA de sepse grave ou choque séptico:
1.1 Registrar o diagnóstico no prontuário.
1.2 Realizar exame físico completo com atenção especial ao sistema cardiorrespiratório, com SatO2, FR, FC, PA, TEC, amplitude de pulsos, nível de consciência e diurese.
1.3 O médico deverá classificar o paciente em: sepse (ainda sem disfunção clínica, necessita de coleta de exames para descartar disfunção orgânica laboratorial); sepse grave ou choque séptico; afastado sepse / sepse grave / choque séptico; sepse / sepse grave / choque séptico em cuidados de fim de vida sem conduta no momento.
1.4 Nas crianças com suspeita de sepse sem disfunção orgânica, prescrever antimicrobiano e avaliar a necessidade de coletar o kit sepse. Esses pacientes merecem monitorização mais frequente ou contínua dos sinais vitais.
1.5 Se o diagnóstico for afastado, ou em cuidados de fim de vida sem conduta no momento, o protocolo deverá ser encerrado.$t$),

(8, 7, 'Conduta terapêutica e alvos da 1ª hora', $t$A conduta inicial da sepse é semelhante à instituição de medidas de suporte de vida (estabelecimento de via aérea adequada, manutenção de respiração efetiva, ressuscitação volêmica e cardiovascular).
Um dos princípios fundamentais da sepse pediátrica é a iniciação rápida e adequada de antibióticos de amplo espectro. No caso de sepse grave, não é apropriado aguardar a confirmação etiológica.

Alvos terapêuticos desejáveis da 1ª hora:
Tempo de enchimento capilar: ≤ 2 segundos.
Pressão arterial sistólica: normal para faixa etária.
Avaliação de pulso: ausência de diferença entre pulso central e periférico.
Presença de diurese: > 1 mL/kg/h.
Extremidades: aquecidas.
Estado neurológico: estado mental normal.
Saturação venosa central*: SvcO2 ≥ 70%.
Índice cardíaco*: 3,3 - 6,0 L/min/m².
Pressão de perfusão: normal para faixa etária.
* Se paciente em uso de cateter venoso central ou monitorização invasiva.$t$),

(9, 8, '1ª hora: monitorização, oxigenação e acesso venoso', $t$A. Monitorização: na admissão é recomendada monitorização hemodinâmica básica (oximetria de pulso contínua, ECG contínuo, medida da PA não invasiva de 15/15 minutos, monitorização da temperatura e do débito cardíaco) [redação do PDF; provável "débito urinário" — confirmar].
B. Oxigenação: ofertar oxigênio por meio de máscara não reinalante e, se necessário (desconforto respiratório e hipoxemia) e disponível, CPAP ou cânula nasal de alto fluxo de oxigênio (high flow). O objetivo é manter a saturação de oxigênio > 92%. A decisão de intubação deve ser baseada no diagnóstico clínico de aumento do esforço respiratório, hipoventilação e alteração do nível de consciência.
C. Acesso venoso: obter dois acessos venosos periféricos e/ou intraósseo imediatamente para ressuscitação volêmica e administração inicial de inotrópicos, caso necessário, até a passagem de acesso venoso central.$t$),

(10, 8, '1ª hora: kit sepse (exames)', $t$Kit sepse: gasometria e lactato (venoso ou arterial), hemograma, creatinina, bilirrubina, coagulograma, hemoculturas e culturas de sítios suspeitos. Paciente com cateter: coletar central e periférico.
Identificar os pedidos como parte do protocolo de sepse, de forma a garantir atendimento diferenciado pelo laboratório. O objetivo é ter esse resultado em menos de 30 minutos.
Para hemocultura, recomenda-se 1 vidro para lactentes e escolares (pelo pouco volume de sangue) e 2 para adolescentes e adultos jovens. Colher culturas de todos os outros sítios pertinentes para investigação do foco.
Na 1ª hora, fica a critério do médico a coleta de outros exames: ureia, troponina, glicemia, sódio/potássio, cálcio iônico, transaminases.$t$),

(11, 9, '1ª hora: antimicrobianos', $t$Prescrever e administrar antimicrobianos de amplo espectro por via endovenosa visando o foco sob suspeita, dentro da primeira hora da identificação da sepse.
Entregar a prescrição ao enfermeiro responsável, que tem 30 minutos para administrar a medicação.
Na escolha da antibioticoterapia empírica, consultar o protocolo desenvolvido pela Comissão de Controle de Infecção Hospitalar.
A administração do antimicrobiano não deve ser retardada para a coleta das culturas.$t$),

(12, 9, '1ª hora: ressuscitação volêmica', $t$Pacientes com sinais e sintomas de hipoperfusão tecidual (principalmente com TEC lentificado e/ou alteração do nível de consciência), independente da ocorrência de hipotensão, têm indicação de ressuscitação hemodinâmica.
O volume inicial para reanimação exige 40 a 60 mL/kg ou mais durante as primeiras horas de tratamento. Recomenda-se iniciar imediatamente a ressuscitação fluídica com ringer ou ringer lactato; na ausência, solução salina 0,9% ou coloide (albumina humana a 5%), em bolus de 20 mL/kg em 5 a 10 minutos nos pacientes com sepse grave e choque séptico. A infusão rápida de volume deve ser mantida até a normalização dos sinais de hipoperfusão tecidual ou sinais de hipovolemia [redação do PDF; provável "hipervolemia" — confirmar].
Após cada alíquota de volume, reavaliar o paciente: normalização dos sinais de hipoperfusão e presença de sinais de hipervolemia (hepatomegalia, crepitações à ausculta pulmonar e/ou ganho maior que 10% do peso corporal). Na presença de hipervolemia recomenda-se suspender (se perfusão adequada restabelecida).
Em casos de hipotensão, a ressuscitação fluídica deve ser mais agressiva e o agente inotrópico pode ser iniciado mesmo antes da reposição volêmica. A ressuscitação fluídica está recomendada para choque com e sem hipotensão em crianças.
Em crianças com anemia hemolítica grave que não estejam hipotensas, a transfusão sanguínea é considerada superior à administração de cristaloides ou albumina.
Nas cardiopatias congênitas, suspeita de disfunção miocárdica ou recém-nascido, utilizar alíquotas de 10 mL/kg.$t$),

(13, 10, '1ª hora: inotrópicos e vasopressores', $t$Em caso de persistência de disfunção cardiovascular (sinais de hipoperfusão tecidual e/ou choque) mesmo após a infusão de 40 a 60 ml/kg de volume inicial, recomenda-se iniciar o tratamento com agentes inotrópicos (adrenalina) por via periférica até que o acesso central seja obtido.
Nos casos de choque refratário a fluidos, a escolha da amina vasoativa é inicialmente determinada pelo exame clínico da criança.
Choque frio/hipodinâmico: indicação de adrenalina (0,05 – 0,3 mcg/kg/min); dopamina, na indisponibilidade, na dose de 5 a 10 mcg/kg/min.
Choque quente/hiperdinâmico (20%): indicação de vasopressores (noradrenalina: 0,1 – 1 mcg/kg/min).
A terapia com inotrópicos/vasopressores pode ser necessária para dar suporte à pressão de perfusão mesmo que a hipovolemia ainda não tenha sido corrigida. A droga vasoativa deve ser iniciada até o final da primeira hora nos pacientes em que ela está indicada.
Obs.: pacientes com choque hipodinâmico, ou sepse associada a IRAS, apresentam ↓ PVS e ↑ de DC, com pressão diastólica (PAD) menor que a metade da PAS ou diferença de pressão > 40 mmHg entre PAS e PAD, sugestivos de componentes hiperdinâmicos, sendo necessário noradrenalina. [redação do PDF confusa — conferir no PDF]

Objetivo final da primeira hora: TEC menor ou igual a 2 s; FC dentro dos valores adequados; PA normal para a idade; diurese presente.$t$),

(14, 11, 'Perfil hemodinâmico após a ressuscitação inicial', $t$Crianças com sepse grave / choque séptico refratário a fluidos podem apresentar diferentes perfis hemodinâmicos: baixo débito cardíaco e elevada resistência vascular sistêmica; débito cardíaco elevado e baixa resistência vascular sistêmica; baixo débito cardíaco e baixa resistência vascular sistêmica. O perfil pode mudar rapidamente durante as primeiras 48 horas. A terapia inotrópica ou vasopressora deve ser iniciada de acordo com o perfil hemodinâmico do choque no momento da avaliação.

[Tabela passada para texto — conferir no PDF]
Choque hipodinâmico com PA normal, SvcO2 < 70% / Hb > 10 g/dl, em uso de adrenalina: iniciar infusão de inodilatador (milrinone 0,5 – 1,0 mcg/kg/min) ou vasodilatador (nitroprussiato) se IC < 3,3 L/min/m² e IRVS alto e/ou alteração da perfusão tecidual. Considerar uso de levosimendan.
Choque hipodinâmico com PA baixa, SvcO2 < 70% / Hb > [valor ausente no PDF], em uso de noradrenalina: adicionar noradrenalina com objetivo de normalizar a PA. Se IC < 3,3 L/min/m², associar dobutamina.
Choque hiperdinâmico com PA baixa, ScvO2 > 70%, em uso de noradrenalina: se euvolêmico, considerar vasopressina, terlipressina ou angiotensina. A dose recomendada de vasopressina para o tratamento do choque é de 0,0003 – 0,002 U/kg/min (0,018 - 0,12 U/kg/h) e dose máxima de 0,008 U/kg/min. Se IC < 3,3 L/min/m², associar adrenalina, dobutamina ou levosimendan.$t$),

(15, 12, 'Após a 1ª hora: monitorização e pressão de perfusão', $t$Crianças com choque refratário a fluidos têm indicação de acesso venoso central e cateter arterial. Está indicada monitorização invasiva ou minimamente invasiva:
Pressão arterial invasiva (PAI) através da cateterização arterial;
Pressão venosa central (PVC) através da cateterização venosa central;
Saturação venosa central de oxigênio: coleta de gasometria venosa central seriada ou monitorização contínua da SvcO2;
Ecocardiograma funcional: avaliação do débito cardíaco e complacência da veia cava inferior;
Pressão de perfusão (PP = PVC ou PAM – PIA) [redação do PDF; provável "PAM – PVC ou PAM – PIA" — confirmar].

Limites da pressão de perfusão de acordo com a idade, pela fórmula (55 + idade x 1,5):
Recém-nascido: 55.
Lactentes: 58.
Pré-escolares: 65.

Exames após a 1ª hora: avaliação do status perfusional e presença de novas disfunções orgânicas.$t$),

(16, 12, 'Hidrocortisona', $t$O tratamento com hidrocortisona está indicado nas crianças com choque refratário a fluidos, resistente a catecolaminas (adrenalina ou noradrenalina em doses > 0,6 mcg/kg/min) e/ou risco de insuficiência adrenal (uso prévio de corticoides para tratamento de doenças crônicas, doença pituitária ou adrenal conhecida, púrpura fulminante e suspeita de síndrome de Waterhouse-Friderichsen).
Dose de ataque: 100 mg/m²/dia.
Dose de manutenção: 100 mg/m²/dia EV 6/6 horas.
Dose adolescente: 50 mg 6/6 horas.
A medicação deve ser mantida enquanto a criança apresentar instabilidade hemodinâmica. Em geral, a hidrocortisona pode ser suspensa após 5 dias, porém deve ser mantida se o paciente ainda estiver em uso de vasopressor (até suspensão do mesmo) ou se houver procedimento cirúrgico programado.
O desmame deve ser iniciado 24 horas após suspensão do vasopressor ou após 24 h do procedimento cirúrgico, de forma gradual: D1 25 mg/m2, D2 12,5 mg/m2 e D3 suspenso.$t$),

(17, 13, 'Outras orientações: hemoderivados, VM, distúrbios metabólicos, diurético e TSR', $t$Hemoderivados: sugere-se que o alvo terapêutico para hemoglobina em crianças com sepse grave e choque séptico durante a fase de ressuscitação, em pacientes com SvcO2 < 70%, seja Hb de 10 g/dL. Após a estabilização, o alvo deve ser uma Hb > [valor ausente no PDF — conferir no PDF] g/dL.
Ventilação mecânica: é recomendada a utilização de estratégia protetora pulmonar em crianças com sepse grave / choque séptico que estejam sob suporte ventilatório.
Correção de distúrbios hidroeletrolíticos e metabólicos: correção da hipoglicemia e da hipocalcemia deve ser priorizada na primeira hora de tratamento. Objetivar glicemias ≤ 180 mg/dl, com especial atenção a ocorrências de hipoglicemia em lactentes.
Diurético e terapia de substituição renal: recomenda-se a utilização de diuréticos para reverter sobrecarga hídrica nas crianças com choque séptico após a fase inicial de ressuscitação. Nesses pacientes (ganho maior que 10% do peso corporal), avaliar a necessidade de terapia de substituição renal (diálise peritoneal ou hemodiálise) precocemente, logo após a fase de estabilização.$t$),

(18, 14, 'Pacotes após a 1ª hora e objetivos das primeiras 6 horas', $t$Nas crianças com choque resistente a catecolaminas, está indicada internação em UTIP e monitorização da PVC, PAI, SvcO2, pressão de perfusão e ecocardiograma funcional. Continuar reposição volêmica, orientada pelo exame clínico e outras monitorizações minimamente invasivas, visando atingir o alvo terapêutico. O uso de inotrópicos, vasopressores e vasodilatadores também deve ser avaliado conforme descrito no fluxograma. Avaliar outras causas de instabilidade hemodinâmica.

Objetivos após as primeiras 6 horas:
Pressão de perfusão, SvcO2 > 70%, diurese e IC 3,3 – 6 l/min/m2;
Monitorização multimodal incluindo ecocardiograma funcional;
Alvos de FC e pressão de perfusão.$t$)
) AS v(ordem, pagina, titulo, texto)
WHERE p.arquivo_path = 'sepse-choque-septico.pdf';

-- ----------------------------------------------------------------------------
-- BLOCO 3 — Pneumonias Virais por Influenza e outros vírus respiratórios (SRAG)
-- ----------------------------------------------------------------------------
INSERT INTO protocolo_trechos (protocolo_id, ordem, pagina, titulo, texto)
SELECT p.id, v.ordem, v.pagina, v.titulo, v.texto
FROM protocolos p,
(VALUES
(1, 2, 'Etiologia das pneumonias por idade', $t$[Tabela passada para texto — conferir no PDF]
≤ 5 anos — vírus: vírus sincicial respiratório (VRS), influenza A e B, SARS-CoV-2, parainfluenza 1, 2, 3, adenovírus, rinovírus. Bactérias: Streptococcus pneumoniae, Haemophilus influenzae, Streptococcus pyogenes, Staphylococcus aureus, Mycoplasma pneumoniae.
≥ 5 anos — vírus: influenza A e B, SARS-CoV-2, rinovírus, adenovírus, parainfluenza, CMV. Bactérias: Mycoplasma pneumoniae, Streptococcus pneumoniae, Staphylococcus aureus, Streptococcus pyogenes, Chlamydia pneumoniae.$t$),

(2, 3, 'Vírus influenza, VRS e bronquiolite', $t$Na pediatria os vírus que causam pneumonia são: VRS (vírus sincicial respiratório), influenza A e B, parainfluenza, metapneumovírus e adenovírus 1-4.
O vírus influenza pertence à família Orthomyxoviridae e possui três tipos: A, B e C. Os vírus tipo A são os mais suscetíveis a mutações e são responsáveis pela maioria das epidemias de gripe. Os vírus influenza B sofrem menos variações antigênicas e estão associados a epidemias mais localizadas. Os vírus influenza C têm pouca importância clínica.
Os subtipos A que mais frequentemente infectam são A (H1N1) e A (H3N2); os subtipos B são classificados como linhagens Victoria e Yamagata.
O VRS é o vírus causador da bronquiolite, da família Paramyxoviridae.
A bronquiolite é uma doença aguda infecciosa e inflamatória do trato respiratório superior e inferior que pode resultar em obstrução das pequenas vias aéreas, identificada clinicamente como episódio de sibilância em crianças com idade inferior a 2 anos, sem antecedentes de atopia.$t$),

(3, 4, 'Influenza: transmissão, precaução e isolamento', $t$[Tabela passada para texto — conferir no PDF]
Transmissão: direta por gotículas respiratórias; indireta por mãos e objetos contaminados (48h); não transmite por aerossol.
Período de incubação: 24 a 48 horas antes dos sintomas.
Precaução: gotículas (máscara cirúrgica a menos de 1 m); no transporte, máscara no paciente; aerossol (N95) + contato em intubação, aspiração e nebulização.
Isolamento: quarto privativo, até painel negativo, ou área de coorte; 7 dias do início dos sintomas ou até 24h após cura clínica (o que for mais longo). RN: incubadora. Imunossuprimidos: 14 dias do início dos sintomas ou a critério médico.
Prevenção: vacinação; anticorpos em 14 a 21 dias; duração de 9 a 11 meses.$t$),

(4, 5, 'Bronquiolite: transmissão, precaução e isolamento', $t$[Tabela passada para texto — conferir no PDF]
Transmissão: direta com secreções, com mão ou fômites contaminados.
Período de incubação: 2 a 8 dias. Contágio: 3 a 4 semanas.
Precaução: contato.
Isolamento: quarto privativo ou área de coorte; recém-nascido (RN): incubadora.
Prevenção: prevenção primária (higienização das mãos). Não há vacina. Imunização passiva: palivizumabe (prematuros, pneumopatas, cardiopatas e neuropatas).$t$),

(5, 5, 'COVID-19: transmissão, precaução e isolamento', $t$[Tabela passada para texto — conferir no PDF]
Transmissão: direta por gotículas infecciosas; aerossóis em situações especiais; indireta por superfícies contaminadas; vertical: evento raro.
Período de incubação: 5 a 6 dias. A clínica pode ocorrer entre o 1º e o 10º dia.
Precaução: contato; gotículas (máscara cirúrgica); aerossol (N95) em intubação, aspiração e nebulização.
Isolamento: quarto privativo ou área de coorte; recém-nascido (RN): incubadora.
Casos leves e moderados: 7 dias do início dos sintomas, se afebril e sem sintomas respiratórios; no 5º dia se testagem negativa. Se reagente, completar 10 dias.
Casos graves: 20 dias do início dos sintomas, se afebril e sem sintomas respiratórios.
Prevenção: vacinação.$t$),

(6, 6, 'Diagnóstico diferencial', $t$Com COVID-19: exclusão diagnóstica por questões clínicas, epidemiológicas e teste laboratorial específico (PCR ou detecção de antígeno em amostra respiratória);
Broncopneumonia bacteriana;
Amigdalite bacteriana;
Resfriado comum;
Laringites virais.$t$),

(7, 6, 'Diagnóstico clínico: síndrome gripal e SRAG', $t$Síndrome gripal: febre de início súbito; tosse; dor de garganta; cefaleia; mialgia; artralgia; em ≤ 2 anos: coriza e obstrução nasal.

Síndrome respiratória aguda grave (SRAG): sintomas gripais associados a: taquipneia; desconforto respiratório (BAN, tiragens intercostais, retrações subcostais, gemido etc.); cianose; saturação de SpO2 < 94% em ar ambiente; hipoatividade/sonolência; deterioração do estado clínico; recusa alimentar/vômitos; IRA com sinais de choque séptico: alteração perfusional/hipotensão.$t$),

(8, 7, 'Diagnóstico laboratorial e radiológico', $t$Hemograma completo: leucocitose, leucopenia ou neutrofilia.
Gasometria arterial:
Insuficiência respiratória tipo I: PaO2 < 55 a 60 mmHg e PaCO2 < 40 mmHg.
Insuficiência respiratória tipo II: PaO2 < 55 a 60 mmHg e PaCO2 > 50 mmHg.
RX de tórax na influenza: infiltrado intersticial localizado ou difuso ou presença de área de condensação.
RX de tórax na bronquiolite: hiperinflação, retração do diafragma, infiltrados peribroncovasculares e atelectasias subsegmentares.$t$),

(9, 7, 'Diagnóstico etiológico: painel viral', $t$Indicação de testagem: todos os casos de síndrome gripal ou SRAG de pacientes hospitalizados ou oriundos do serviço de emergência.
Crianças < 2 anos (amostra de nasofaringe): painel para vírus respiratórios (VRS, influenza A e B) e RT-PCR SARS-CoV-2.
Crianças > 2 anos (amostra de nasofaringe): painel viral (influenza A e B) e RT-PCR SARS-CoV-2.
Se resultados não reagentes: opção de solicitar painel viral ampliado para 24 patógenos.
Os três painéis (VRS e influenza A e B; influenza A e B; ampliado de 24 patógenos) são por PCR em secreção nasofaríngea, com prazo de 1 dia no ambulatório e 2 horas na urgência.
O laboratório envia amostras biológicas para o LACEN-MA, para identificação de cepa, junto com a ficha de notificação.$t$),

(10, 8, 'Critérios de internação em unidade de internação', $t$Sinais de alerta para pneumonia: taquipneia mantida após tratamento conservador: < 2 meses: FR ≥ 60 ipm; 2-11 meses: FR ≥ 50 ipm; 1-5 anos: > 40 ipm.
Lactente < 3 meses de idade com FR > 60.
Broncoespasmo leve.
Baixa ingesta < 50% em 24 horas: necessidade de hidratação venosa.
Letargia.
Comorbidades nos casos de bronquiolite: histórico de prematuridade; cardiopatias congênitas; pneumopatias crônicas; imunodeficiências; doenças neuromusculares.
Dúvidas diagnósticas.
Sinais de alerta: dificuldade na amamentação ou para beber líquidos, letargia ou redução no nível de consciência ou convulsões.$t$),

(11, 9, 'Critérios de internação em UTI pediátrica', $t$Incapacidade de manter SpO2 > 94% em oxigenoterapia;
Deterioração do quadro clínico;
Desconforto respiratório;
Apneias recorrentes;
PaO2 < 60 mmHg e PaCO2 > 50 mmHg com FiO2 > 0,4 / pH < 7,4 [conferir o valor de pH no PDF];
Convulsões;
Rebaixamento do sensório;
Instabilidade hemodinâmica;
Disfunção de órgãos.$t$),

(12, 9, 'Doença crítica: classificação de SARA', $t$Insuficiência respiratória grave por hipoxemia, que necessita de VPM - SRAG (síndrome respiratória aguda grave) e/ou pacientes em choque séptico.

Em crianças:
VNI ou CPAP: PaO2/FiO2 ≤ 300 mmHg ou SpO2/FiO2 ≤ 264.
SARA leve: IO ≥ 4 e < 8 ou ISO ≥ 5 e < 7,5.
SARA moderada: IO ≥ 8 e < 16 ou ISO ≥ 7,5 e < 12,3.
SARA grave: IO ≥ 16 ou ISO ≥ 12,3.
Obs.: para usar ISO, ajustar FiO2 para SatO2 ≤ 97 para calcular SpO2/FiO2.
IO = FiO2 x MAP x 100 / PaO2.
ISO = FiO2 x MAP x 100 / SpO2.$t$),

(13, 10, 'Oseltamivir: indicações e doses', $t$O momento ideal para a introdução do antiviral é nas 48 horas do início dos sintomas, mas em casos graves (SRAG) é necessário iniciar a medicação mesmo após esse intervalo.
Indicações: painel viral positivo para influenza A ou B.
Síndrome gripal com risco de complicações: < 2 anos de idade; pacientes com tuberculose; portadores de comorbidades: cardiopatias, pneumopatias (incluindo asma), nefropatias, neuropatias, doenças hematológicas e oncológicas.

Fosfato de oseltamivir (Tamiflu), > 1 ano:
≤ 15 kg: 30 mg, 12/12h, 5 dias.
> 15 a 23 kg: 45 mg, 12/12h, 5 dias.
> 23 a 40 kg: 60 mg, 12/12h, 5 dias.
> 40 kg: 75 mg, 12/12h, 5 dias.

Fosfato de oseltamivir (Tamiflu), < 1 ano:
0 a 8 meses: 3 mg/kg, 12/12h, 5 dias.
9 a 11 meses: 3,5 mg/kg, 12/12h, 5 dias.

Suspender oseltamivir se painel viral negativo para influenza A ou B. Se o paciente vomitar até uma hora após ingestão do medicamento, administrar dose adicional.
Prolongamento do tratamento (validado pela equipe médica da CCIH): doença grave ou prolongada, por julgamento clínico e virológico; pacientes imunossuprimidos (replicação viral prolongada).
A dispensação é feita pela Vigilância Epidemiológica de São Luís; a farmácia hospitalar agiliza a dispensação após receber a prescrição em duas vias, cópia do exame positivo e notificação.$t$),

(14, 11, 'Antibióticos, corticoides, sintomáticos e hidratação', $t$Antibióticos: a pneumonia bacteriana é uma complicação comum da síndrome gripal, e a associação de antibióticos ao tratamento com o antiviral deve seguir protocolos e consensos específicos de pneumonia, como as diretrizes brasileiras para pneumonia adquirida na comunidade.
Corticoides: não há evidência de benefícios do uso de corticoide em pacientes infectados por influenza, salvo casos em que comorbidades ou doenças associadas tenham essa medicação como indicação benéfica para o tratamento.
Sintomáticos e hidratação: analgésicos e antitérmicos são indicados conforme a intensidade dos sintomas; os mais utilizados são dipirona e paracetamol. A hidratação intravenosa é necessária durante os primeiros dias de internação, na maioria dos casos. O aumento da ingesta de líquidos por VO deve ser indicado para todos os pacientes em tratamento domiciliar.

O tratamento da insuficiência respiratória aguda grave (SRAG), da bronquiolite e broncoespasmo e da COVID-19 está em protocolos e fluxogramas institucionais próprios, que não estão anexados a este documento.$t$),

(15, 12, 'Complicações da síndrome gripal e notificação', $t$Complicações da síndrome gripal:
SRAG;
Persistência ou aumento da febre por mais de 3 dias: pneumonite primária pelo vírus influenza ou secundária a uma infecção bacteriana;
Disfunções orgânicas graves, como insuficiência renal aguda;
Miosite comprovada por creatinofosfoquinase (CPK): ≥ 2 a 3 vezes;
Encefalites;
Exacerbação dos sintomas gastrointestinais em crianças;
Desidratação.

Vigilância epidemiológica: influenza com SRAG é doença de notificação compulsória.$t$)
) AS v(ordem, pagina, titulo, texto)
WHERE p.arquivo_path = 'pneumonias-virais-srag.pdf';

-- ============================================================================
-- CHECKLIST DE TESTE
-- ============================================================================
-- [ ] 1. Contagem por protocolo (18, 18 e 15):
--          SELECT p.titulo, count(*) FROM protocolo_trechos t
--          JOIN protocolos p ON p.id = t.protocolo_id GROUP BY 1 ORDER BY 1;
--        Se algum vier 0, o arquivo_path do protocolo está diferente do esperado.
-- [ ] 2. Nenhum trecho passa de 1500 caracteres por muito (o app corta o que a IA lê):
--          SELECT titulo, length(texto) FROM protocolo_trechos ORDER BY 2 DESC LIMIT 5;
-- [ ] 3. No app, em CONSULTAR PROTOCOLOS, digitar e conferir com o PDF:
--          "dose de insulina na cetoacidose"      -> Insulinoterapia: infusão contínua
--          "quando repor potássio"                -> Terapia eletrolítica: potássio
--          "exames do kit sepse"                  -> 1ª hora: kit sepse
--          "dose de noradrenalina no choque"      -> 1ª hora: inotrópicos e vasopressores
--          "tempo de isolamento na bronquiolite"  -> Bronquiolite: transmissão, precaução...
--          "dose de oseltamivir"                  -> Oseltamivir: indicações e doses
-- [ ] 4. Digitar algo fora dos protocolos ("dose de fenobarbital"): deve aparecer
--        "Não encontrei esse assunto nos protocolos cadastrados".
-- [ ] 5. "Conferir no PDF (pág. N)" abre o PDF na página certa.

-- ============================================================================
-- ROLLBACK
-- ============================================================================
-- DELETE FROM protocolo_trechos;
