# 📋 Como Integrar BalanceCumulativeCalc no Seu App

## Visual do Layout Recomendado

```
┌─────────────────────────────────────────────────────────────────┐
│  BALANÇO HÍDRICO (Input Form)                                    │
│  Peso: 656 kg               Volume: 6453543 mL                   │
│  Tipo: Positivo ✓           [SALVAR]                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  ÚLTIMOS CÁLCULOS                                                │
│  ┌─────────────────────┐ ┌────────────────────────┐            │
│  │ DIURESE             │ │ BALANÇO HÍDRICO       │            │
│  │ Nenhum registro     │ │ +983.77%              │            │
│  │                     │ │ Ganho • Peso: 656kg   │            │
│  │                     │ │ Volume: +6453543mL    │            │
│  └─────────────────────┘ │ Data: 11/02/26        │            │
│                          └────────────────────────┘            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  💧 DIURESE                                          ▶           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  💧 BALANÇO HÍDRICO                                ▶            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  💧 BH CUMULATIVO                    ✨ NOVO        ▶           │
│     +70 mL • Superávit                                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Código para Integrar

### Opção 1: Adicionar na Página Existente

```tsx
// Seu componente de paciente (ex: PatientPage.tsx)

import DiuresisCalc from './components/DiuresisCalc';
import BalanceHydricResume from './components/BalanceHydricResume';
import BalanceCumulativeCalc from './components/BalanceCumulativeCalc'; // ← NOVO

export function PatientPage({ patientId }) {
  return (
    <div className="space-y-4">
      {/* Seção de Diurese */}
      <div className="rounded-lg shadow-sm border border-slate-200 bg-white">
        <DiuresisCalc patientId={patientId} />
      </div>

      {/* Seção de Balanço Hídrico */}
      <div className="rounded-lg shadow-sm border border-slate-200 bg-white">
        <BalanceHydricResume patientId={patientId} />
      </div>

      {/* ← ADICIONE ISTO: Seção de BH Cumulativo */}
      <div className="rounded-lg shadow-sm border border-slate-200 bg-white">
        <BalanceCumulativeCalc patientId={patientId} />
      </div>
    </div>
  );
}
```

### Opção 2: Com Refresh State

```tsx
// Seu componente (ex: PatientDashboard.tsx)

import { useState } from 'react';
import BalanceCumulativeCalc from './components/BalanceCumulativeCalc';

export function PatientDashboard({ patientId }) {
  const [lastUpdate, setLastUpdate] = useState(0);

  const handleRefresh = () => {
    setLastUpdate(Date.now());
  };

  return (
    <div className="space-y-4">
      {/* Após registrar novo BH via FluidBalanceCalc */}
      <FluidBalanceCalc 
        patientId={patientId}
        onCalculationSaved={handleRefresh} // ← Dispara refresh
      />

      {/* BH Cumulativo com key para forçar re-render */}
      <BalanceCumulativeCalc 
        key={lastUpdate}
        patientId={patientId}
      />
    </div>
  );
}
```

---

## 🎨 Se Precisar Customizar o Estilo

### Cores do Componente

```tsx
// No arquivo BalanceCumulativeCalc.tsx, procure por:

// Header
className="w-full px-4 py-3 flex items-center justify-between 
  hover:bg-slate-50 transition"

// Mudar para:
className="w-full px-4 py-3 flex items-center justify-between 
  hover:bg-blue-50 transition" // ← Mude para cor desejada
```

### Remover Alguns Elementos

Se quiser remover os detalhes (deixar mais simples):

```tsx
// Comente ou remova essa seção para ocultar:

{/* Detalhes */}
{/* <div className="grid grid-cols-2 gap-3 text-xs">
  ...
</div> */}
```

---

## 📱 Tested em Seu Layout

O componente agora é **leve e simples**, similar a:
- ✅ "Diurese"
- ✅ "Balanço Hídrico"

**Ficará assim embaixo:**

```
┌─────────────────────────────────┐
│ 💧 Diurese              ▶       │  ← Expandível
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ 💧 Balanço Hídrico      ▶       │  ← Expandível
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ 💧 BH Cumulativo        ▶       │  ← NOVO - Expandível
│    +70 mL • Superávit          │
└─────────────────────────────────┘
```

Quando expandir:
```
┌─────────────────────────────────┐
│ 💧 BH Cumulativo        ▼       │
├─────────────────────────────────┤
│                                 │
│ Cálculo: BH Anterior + BH Hoje  │
│                                 │
│ [BH Anterior] + [BH Hoje] =     │
│    -180 mL      +250 mL         │
│              +70 mL             │
│                                 │
│ 🟢 Status: Superávit            │
│ ✓ OK                            │
│                                 │
│ 📅 Se anterior: Eliminação      │
│ 📊 Se hoje: Retenção            │
│                                 │
└─────────────────────────────────┘
```

---

## ✅ Pronto!

Basta adicionar em seu App e usar como qualquer outro card expandível.

**Tudo integrado e matching seu design! ✓**
