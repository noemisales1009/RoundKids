# 🩺 Guia Completo - Sistema de Balanço Hídrico

## Resumo Executivo

O sistema de Balanço Hídrico foi criado para ajudar a rastrear fluxos de líquidos em pacientes. Existem **3 componentes principais** que trabalham juntos:

1. **FluidBalanceCalc** - Registra entrada/saída de líquidos
2. **DiuresisCalc** - Calcula volume de urina por peso/hora  
3. **BalanceHydricResume** - Visualiza tendências e alertas

---

## 📊 Conceitos Principais

### BH (Balanço Hídrico)
- **O quê:** Diferença entre líquidos que **ENTRAM** vs **SAEM** do corpo
- **Fórmula:** Volume ÷ (Peso × 10)
- **Resultado Positivo:** Mais entrada que saída (retenção)
- **Resultado Negativo:** Mais saída que entrada (eliminação)
- **Exemplo:** 500mL em paciente de 70kg = 500 ÷ (70 × 10) = 0.71%

### Diurese (Fluxo Urinário)
- **O quê:** Volume de urina produzida em um período
- **Fórmula:** Volume ÷ (Peso × Horas)
- **Valores Normais:** 0.5-1.0 mL/kg/h
- **Exemplo:** 1000mL em 24h de paciente 70kg = 1000 ÷ (70 × 24) = 0.59 mL/kg/h

### BH Cumulativo
- **O quê:** Soma de TODOS os balanços diários
- **Período:** Desde o início do acompanhamento
- **Alertas:**
  - ✅ **-500 a +500:** Equilibrado
  - ⚠️ **> +500:** Sobrecarga de líquidos
  - ⚠️ **< -500:** Desidratação

### BH Dia Anterior
- **O quê:** Comparação com o dia anterior
- **Uso:** Identificar padrões e tendências

---

## 🔧 Implementação Técnica

### Estrutura do Banco de Dados

```sql
-- Tabela Principal
balanco_hidrico (
  id, patient_id, volume, peso, tipo, resultado,
  data_registro, created_at, created_by, descricao
)

-- Views de Cálculo
vw_balanco_diario          → Cálculo diário
vw_resumo_balanco          → Resumo com classificação
vw_balanco_historico_com_usuario → Histórico com nomes
```

### Tabela de Campos

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `patient_id` | UUID | ID do paciente (FK) |
| `volume` | numeric | Volume em mL (positivo ou negativo) |
| `peso` | numeric | Peso do paciente em kg |
| `tipo` | text | 'Positivo' (entrada) ou 'Negativo' (saída) |
| `resultado` | numeric STORED | Cálculo automático: volume / (peso × 10) |
| `data_registro` | timestamp | Quando foi registrado |
| `created_by` | UUID | Quem criou o registro |
| `descricao` | text | Notas (ex: "Soro", "Drenagem", "Urina") |

---

## 🎨 Componentes React

### 1. FluidBalanceCalc (Existing)
**Local:** `components/FluidBalanceCalc.tsx`

**Uso:**
```tsx
import FluidBalanceCalc from './components/FluidBalanceCalc';

<FluidBalanceCalc 
  patientId={patientId}
  onCalculationSaved={() => refreshData()}
/>
```

**Funcionalidades:**
- ✅ Entrada de peso (carrega automaticamente do context)
- ✅ Seleção de tipo (Positivo/Negativo)
- ✅ Entrada de volume
- ✅ Cálculo automático em tempo real
- ✅ Salva em `balanco_hidrico` com tipo e resultado

**Campos de Saída:**
```
Tipo: Positivo/Negativo
Volume: mL digitado (sinal aplicado automaticamente)
Peso: kg do paciente
Resultado: volume / (peso × 10)
```

---

### 2. DiuresisCalc (Existing)
**Local:** `components/DiuresisCalc.tsx`

**Uso:**
```tsx
import DiuresisCalc from './components/DiuresisCalc';

<DiuresisCalc 
  patientId={patientId}
  onCalculationSaved={() => refreshData()}
/>
```

**Funcionalidades:**
- ✅ Calcula diurese em mL/kg/h
- ✅ Período ajustável (padrão 24h)
- ✅ Comparação com normas
- ✅ Histórico salvado

**Fórmula:**
```
Diurese = Volume / (Peso × Horas)
```

---

### 3. BalanceHydricResume (NEW)
**Local:** `components/BalanceHydricResume.tsx`

**Uso:**
```tsx
import BalanceHydricResume from './components/BalanceHydricResume';

<BalanceHydricResume patientId={patientId} />
```

**Funcionalidades:**
- 📊 Resumo visual do balanço de hoje
- 📈 Comparação com dia anterior
- 🎯 BH Cumulativo com alertas
- 📋 Histórico dos últimos 7 dias
- 🚨 Alertas de superávit/déficit

**Dados Exibidos:**
```
┌─────────────────────────────────┐
│ BH do Dia  │ Dia Anterior │ Cum │
│ +250 mL    │ -180 mL      │ +2L │
└─────────────────────────────────┘
↓
Status: Superávit (alerta se > 500mL)
```

---

## 💡 Como Usar na Prática

### Cenário 1: Paciente Internado - Entrada Normal

```
1. Paciente toma 500mL de água
   → FluidBalanceCalc: Volume = 500mL, Tipo = Positivo
   → Salva na tabela

2. Paciente urina 800mL
   → FluidBalanceCalc: Volume = 800mL, Tipo = Negativo
   → Salva na tabela

3. Final do dia
   → BalanceHydricResume mostra:
     BH = 500 - 800 = -300mL (Déficit)
     Classificação = "Déficit"
```

### Cenário 2: Monitoramento Cumulativo

```
Dia 1: BH = +200mL → Cumulativo = +200mL
Dia 2: BH = +150mL → Cumulativo = +350mL
Dia 3: BH = +100mL → Cumulativo = +450mL
Dia 4: BH = +200mL → Cumulativo = +650mL ⚠️ ALERTA!
```

### Cenário 3: Cálculo de Diurese

```
Paciente de 70kg produz 1400mL de urina em 24h
Diurese = 1400 / (70 × 24) = 0.83 mL/kg/h ✅ Normal
```

---

## 🎯 Integração com a Aplicação

### Adicionar ao Dashboard do Paciente

Em `App.tsx` ou componente principal do paciente:

```tsx
import FluidBalanceCalc from './components/FluidBalanceCalc';
import BalanceHydricResume from './components/BalanceHydricResume';

export function PatientDashboard({ patientId }) {
  return (
    <div className="space-y-4">
      {/* Seção de Cálculos */}
      <FluidBalanceCalc 
        patientId={patientId}
        onCalculationSaved={refreshData}
      />
      
      {/* Seção de Resumo */}
      <BalanceHydricResume patientId={patientId} />
      
      {/* ... outros componentes */}
    </div>
  );
}
```

---

## 🚨 Alertas Automáticos

O sistema gera alertas em 3 situações:

### 1. Superávit Alto (BH > +500mL)
- **Risco:** Sobrecarga de volume
- **Ação:** Monitorar edema, falta de ar
- **Status:** 🔴 Superávit Alto

### 2. Déficit Alto (BH < -500mL)
- **Risco:** Desidratação
- **Ação:** Aumentar hidratação, monitorar eletrólitos
- **Status:** 🔵 Déficit Alto

### 3. Diurese Anormal
- **Baixa (<0.5 mL/kg/h):** Oligúria
- **Alta (>1.0 mL/kg/h):** Poliúria

---

## 🔐 Segurança e RLS

O banco de dados implementa **Row Level Security (RLS)**:

```sql
-- Usuários só veem BH de pacientes da sua clínica
CREATE POLICY "balanco_hidrico_select_own_clinic"
  ON balanco_hidrico
  FOR SELECT
  USING (patient_id IN (
    SELECT id FROM patients 
    WHERE clinic_id IN (
      SELECT clinic_id FROM users 
      WHERE id = auth.uid()
    )
  ));
```

---

## 📋 Checklist de Implementação

- [x] Tabela `balanco_hidrico` criada
- [x] Views de cálculo criadas
- [x] Componente `BalanceHydricResume` criado
- [x] RLS configurado
- [ ] Testes em produção
- [ ] Treinamento de usuários
- [ ] Documentação no manual do usuário

---

## 🔍 Queries Úteis para Debug

### Ver histórico de um paciente
```sql
SELECT * FROM vw_balanco_historico_com_usuario
WHERE patient_id = 'UUID_DO_PACIENTE'
ORDER BY data_registro DESC;
```

### Ver resumo dos últimos 7 dias
```sql
SELECT * FROM vw_resumo_balanco
WHERE patient_id = 'UUID_DO_PACIENTE'
AND dia >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY dia DESC;
```

### Totais por período
```sql
SELECT 
  date_trunc('day', data_registro) AS dia,
  SUM(volume) AS total_volume,
  COUNT(*) AS registros
FROM balanco_hidrico
WHERE patient_id = 'UUID_DO_PACIENTE'
GROUP BY date_trunc('day', data_registro)
ORDER BY dia DESC;
```

---

## ❓ FAQ

**P: Posso editar um registro depois de salvo?**
R: Atualmente não, mas pode ser adicionado. Crie um issue no GitHub.

**P: Qual é a unidade de medida?**
R: Tudo em **mL** (mililitros) e **kg** (quilogramas).

**P: O cálculo do resultado é automático?**
R: Sim! Campo `resultado` é **GENERATED ALWAYS**.

**P: Posso ver o histórico de quem criou cada registro?**
R: Sim! Consulte `vw_balanco_historico_com_usuario`.

**P: Como interpretar BH negativo?**
R: Significa que o paciente **eliminou mais líquido que recebeu** (bom para reduzir edema).

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Consulte este guia
2. Verifique os testes em `TESTES_RASTREAMENTO_DIETAS.sql`
3. Abra uma issue no repositório
