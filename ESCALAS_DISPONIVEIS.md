# 📊 ESCALAS DO APLICATIVO ROUND KIDS

## ✅ Total de Escalas: 11

---

## 📋 Lista Completa das Escalas

### 1. 📊 **Escala COMFORT-B**
- **ID:** `comfort-b`
- **Componente:** `ComfortBCalculator`
- **Descrição:** Avaliação de conforto em pacientes críticos
- **Ícone:** 📊 (BarChart)
- **Status:** ✅ Ativa

### 2. 🧠 **Escala CAM-ICU Pediátrico**
- **ID:** `delirium`
- **Componente:** `CAMICUCalculator`
- **Descrição:** Detecção de delirium em crianças na UTI
- **Ícone:** 🧠 (Brain)
- **Status:** ✅ Ativa

### 3. 🧠 **Escala de Coma de Glasgow**
- **ID:** `glasgow`
- **Componente:** `GlasgowCalculator`
- **Descrição:** Avaliação do nível de consciência (adulto)
- **Ícone:** 🧠 (Brain)
- **Status:** ✅ Ativa

### 4. 🧠 **Escala de Recuperação de Coma (CRS-R)**
- **ID:** `crs-r`
- **Componente:** `CRSRScale`
- **Descrição:** Avaliação de consciência em pacientes comatosos
- **Ícone:** 🧠 (Brain)
- **Status:** ✅ Ativa
- **Nota:** Usa `onSaveScore` callback

### 5. 💊 **Escala de Dor FLACC / FLACC-R**
- **ID:** `flacc`
- **Componente:** `FLACCCalculator`
- **Descrição:** Avaliação de dor em crianças não comunicativas
- **Ícone:** 💊 (Pill)
- **Status:** ✅ Ativa

### 6. 🛡️ **Escala de Braden**
- **ID:** `braden`
- **Componente:** `BradenCalculator`
- **Descrição:** Avaliação de risco de úlcera por pressão (padrão)
- **Ícone:** 🛡️ (Shield)
- **Status:** ✅ Ativa

### 7. 🛡️ **Escala de Braden QD (Ampliada)**
- **ID:** `braden-qd`
- **Componente:** `BradenQDScale`
- **Descrição:** Avaliação ampliada de risco de úlcera por pressão
- **Ícone:** 🛡️ (Shield)
- **Status:** ✅ Ativa
- **Nota:** Usa `onSaveScore` callback

### 8. 💨 **Escala VNI/CNAF Pediatria**
- **ID:** `vni-cnaf`
- **Componente:** `VNICNAFCalculator`
- **Descrição:** Avaliação de interface ventilatória não invasiva
- **Ícone:** 💨 (Lungs)
- **Status:** ✅ Ativa

### 9. 💪 **Escala de Status Funcional (FSS)** ✨ NOVO
- **ID:** `fss`
- **Componente:** `FSSScale`
- **Descrição:** Avaliação de funcionalidade em pediatria
- **Ícone:** 💪 (Dumbbell)
- **Status:** ✅ Ativa (Recém adicionada)
- **Nota:** Usa `onSaveScore` callback
- **Pontuação:** 6-30 pontos
- **Cores:** Verde/Ciano/Âmbar/Laranja/Vermelho

### 10. 🧠 **Escala de Abstinência (Finnegan & WAT-1)**
- **ID:** `abstinencia`
- **Componente:** `AbstinenciaCalculator`
- **Descrição:** Avaliação de síndrome de abstinência neonatal
- **Ícone:** 🧠 (Brain)
- **Status:** ✅ Ativa

### 11. 🧠 **Escala SOS-PD (Delirium/Abstinência)**
- **ID:** `sos-pd`
- **Componente:** `SOSPDCalculator`
- **Descrição:** Avaliação de delirium e abstinência pediátrica
- **Ícone:** 🧠 (Brain)
- **Status:** ✅ Ativa

### 12. 🧠 **Avaliação Consciência (CRS-R/FOUR/JFK)**
- **ID:** `consciousness`
- **Componente:** `ConsciousnessCalculator`
- **Descrição:** Avaliação integrada de consciência com múltiplas escalas
- **Ícone:** 🧠 (Brain)
- **Status:** ✅ Ativa

---

## 📊 Categorias de Escalas

### 🧠 Neurológicas / Consciência (5)
- Escala de Coma de Glasgow
- Escala de Recuperação de Coma (CRS-R)
- Escala CAM-ICU Pediátrico
- Escala de Abstinência (Finnegan & WAT-1)
- Escala SOS-PD (Delirium/Abstinência)
- Avaliação Consciência (CRS-R/FOUR/JFK)

### 💊 Dor e Conforto (2)
- Escala COMFORT-B
- Escala de Dor FLACC / FLACC-R

### 🛡️ Risco de Úlcera por Pressão (2)
- Escala de Braden
- Escala de Braden QD (Ampliada)

### 💨 Respiratório (1)
- Escala VNI/CNAF Pediatria

### 💪 Funcionalidade (1)
- Escala de Status Funcional (FSS)

---

## 🔄 Fluxo de Uso

```
App.tsx
├── Seção "Escalas"
│   ├── scaleView === 'list'  → Mostra lista de 12 escalas
│   ├── Usuário clica em uma escala
│   └── scaleView muda para ID da escala (comfort-b, fss, etc)
│       ├── Renderiza componente específico
│       ├── Usuário preenche formulário
│       ├── Se tiver onSaveScore:
│       │   └── Salva no banco de dados
│       └── Volta para lista
```

---

## 🔗 Imports em App.tsx

```typescript
// Escalas com componentes próprios
import { ComfortBScale } from './components/ComfortBScale';
import { DeliriumScale } from './components/DeliriumScale';
import { GlasgowScale } from './components/GlasgowScale';
import { CRSRScale } from './components/CRSRScale';
import { FLACCScale } from './components/FLACCScale';
import { BradenScale } from './components/BradenScale';
import { BradenQDScale } from './components/BradenQDScale';
import { VniCnafScale } from './components/VniCnafScale';
import { FSSScale } from './components/FSSScale';  // ✨ NOVO

// Calculadores
import { BradenCalculator } from './components/BradenCalculator';
import { FLACCCalculator } from './components/FLACCCalculator';
import ComfortBCalculator from './components/ComfortBCalculator';
import GlasgowCalculator from './components/GlasgowCalculator';
import AbstinenciaCalculator from './components/AbstinenciaCalculator';
import CAMICUCalculator from './components/CAMICUCalculator';
import SOSPDCalculator from './components/SOSPDCalculator';
import ConsciousnessCalculator from './components/ConsciousnessCalculator';
import VNICNAFCalculator from './components/VNICNAFCalculator';
```

---

## 📍 Localização no Código

**Arquivo:** `App.tsx`

| Seção | Linhas | Descrição |
|-------|--------|-----------|
| Imports | ~7-26 | Importação de componentes |
| State | ~1414 | Definição do state `scaleView` |
| Handler | ~1428 | `handleSaveScaleScore()` |
| Lista Visual | ~1755-1788 | Cards com nomes das escalas |
| Renderização | ~1796-1807 | Componentes renderizados |

---

## 🎨 Ícones Utilizados

- 📊 **BarChartIcon** - COMFORT-B
- 🧠 **BrainIcon** - Neurológicas (Glasgow, CRS-R, CAM-ICU, etc)
- 💊 **PillIcon** - FLACC (Dor)
- 🛡️ **ShieldIcon** - Braden (Úlcera)
- 💨 **LungsIcon** - VNI/CNAF (Respiratório)
- 💪 **DumbbellIcon** - FSS (Funcionalidade)

---

## ✨ Características Especiais

### 💾 Salvamento no Banco
**Todas as 12 escalas salvam dados** na tabela `public.scale_scores`:
- ✅ COMFORT-B
- ✅ CAM-ICU Pediátrico
- ✅ Glasgow
- ✅ CRS-R
- ✅ FLACC
- ✅ Braden
- ✅ Braden QD
- ✅ VNI/CNAF
- ✅ FSS (Novo!)
- ✅ Abstinência
- ✅ SOS-PD
- ✅ Consciência

### Com Componente Calculador
Estas usam componentes específicos com lógica customizada:
- ✅ ComfortB
- ✅ Glasgow
- ✅ FLACC
- ✅ Braden
- ✅ Abstinência
- ✅ CAM-ICU
- ✅ SOS-PD
- ✅ Consciousness
- ✅ VNI-CNAF

---

## 🚀 Próximos Passos para Novas Escalas

Se quiser adicionar uma nova escala:

1. **Criar componente** → `components/MinhaEscala.tsx`
2. **Importar em App.tsx** → Linha ~26
3. **Adicionar ID** → Adicionar ao state `scaleView` (linha ~1414)
4. **Adicionar Card** → Na lista visual (línea ~1755-1788)
5. **Renderizar** → Adicionar condicional (linha ~1796-1807)

---

## 📈 Estatísticas

```
Total de Escalas: 12
├─ Salvam no Banco: 12 (100%)
├─ Com Calculador: 9
├─ Neurológicas: 6
├─ Dor/Conforto: 2
├─ Risco Úlcera: 2
├─ Respiratório: 1
└─ Funcionalidade: 1
```

---

## 🔐 Banco de Dados

**Tabela:** `public.scale_scores`

Armazena avaliações de escalas com:
- `id` (UUID)
- `patient_id` (FK → patients)
- `scale_name` (ex: "FSS", "CRS-R")
- `score` (pontuação numérica)
- `interpretation` (texto da interpretação)
- `date` (quando foi avaliado)
- `created_by` (usuário que criou)
- `notes` (observações)

---

**Versão:** 1.0 Final  
**Última atualização:** 18 de dezembro de 2025  
**Status:** ✅ Todas as escalas funcionando
