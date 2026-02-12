# 🔗 Integração Completa: Sistema de Balanço Hídrico

## 📦 Os 3 Componentes

| Componente | Função | Arquivo |
|-----------|--------|---------|
| **FluidBalanceCalc** | Registra entrada/saída de líquidos | `components/FluidBalanceCalc.tsx` |
| **DiuresisCalc** | Calcula diurese (mL/kg/hora) | `components/DiuresisCalc.tsx` |
| **BalanceCumulativeCalc** | Calcula BH Cumulativo | `components/BalanceCumulativeCalc.tsx` ✨ NOVO |

---

## 🎯 Fluxo de Dados

```
Usuário Registra Dados
       ↓
[FluidBalanceCalc] Entrada: 500mL, Tipo: Positivo
       ↓
Salva em: public.balanco_hidrico
       ↓
Views Calculam:
├─ vw_balanco_diario (BH do dia)
├─ vw_resumo_balanco (com cumulativo)
└─ vw_balanco_historico_com_usuario (histórico)
       ↓
[BalanceCumulativeCalc] Lê vw_resumo_balanco
       ↓
Calcula: BH Anterior + BH Hoje = Cumulativo
       ↓
Exibe com alertas
       ↓
[BalanceHydricResume] Exibe resumo visual
```

---

## 🚀 Implementação Recomendada

### Opção 1: Layout em Colunas (Recomendado)

```tsx
// PatientDashboard.tsx ou App.tsx

import React, { useState } from 'react';
import FluidBalanceCalc from './components/FluidBalanceCalc';
import DiuresisCalc from './components/DiuresisCalc';
import BalanceCumulativeCalc from './components/BalanceCumulativeCalc';
import BalanceHydricResume from './components/BalanceHydricResume';

export function PatientDashboard({ patientId }) {
  const [lastUpdate, setLastUpdate] = useState(0);

  const handleCalculationSaved = () => {
    // Força atualização dos componentes dependentes
    setLastUpdate(Date.now());
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-6">
        Paciente #{patientId}
      </h1>

      {/* Grid 2 colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ========== COLUNA ESQUERDA: ENTRADA DE DADOS ========== */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            📝 Registrar Dados
          </h2>
          
          {/* Registrar Balanço Hídrico */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-300 dark:border-blue-700">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">
              💧 Balanço Hídrico
            </h3>
            <FluidBalanceCalc 
              patientId={patientId}
              onCalculationSaved={handleCalculationSaved}
            />
          </div>

          {/* Calcular Diurese */}
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-300 dark:border-green-700">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">
              🚽 Diurese
            </h3>
            <DiuresisCalc 
              patientId={patientId}
              onCalculationSaved={handleCalculationSaved}
            />
          </div>
        </div>

        {/* ========== COLUNA DIREITA: ANÁLISE E CÁLCULOS ========== */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            📊 Análise e Cálculos
          </h2>

          {/* Calculadora de BH Cumulativo */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-300 dark:border-indigo-700">
            <BalanceCumulativeCalc 
              key={lastUpdate}
              patientId={patientId}
              onCalculationComplete={(data) => {
                console.log('BH Cumulativo atualizado:', data);
              }}
            />
          </div>

          {/* Resumo Visual */}
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-300 dark:border-purple-700">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">
              📈 Resumo Completo
            </h3>
            <BalanceHydricResume 
              key={lastUpdate}
              patientId={patientId} 
            />
          </div>
        </div>
      </div>

      {/* === SEÇÃO INFERIOR: INSTRUÇÕES === */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <InstructionCard
          icon="💧"
          title="Passo 1: Registrar"
          steps={[
            "Preencha volume de entrada/saída",
            "Clique em 'Salvar'",
            "Dados aparecem no banco"
          ]}
        />
        <InstructionCard
          icon="🧮"
          title="Passo 2: Calcular"
          steps={[
            "BalanceCumulativeCalc lê dados",
            "Calcula automaticamente",
            "Mostra alertas se necessário"
          ]}
        />
        <InstructionCard
          icon="📊"
          title="Passo 3: Analisar"
          steps={[
            "Verifique tendência de 7 dias",
            "Compare com dia anterior",
            "Tome decisões clínicas"
          ]}
        />
      </div>
    </div>
  );
}

// Componente auxiliar para instruções
function InstructionCard({ icon, title, steps }) {
  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow border border-slate-200 dark:border-slate-700">
      <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">
        {icon} {title}
      </h3>
      <ol className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-2">
            <span className="font-bold text-blue-600 dark:text-blue-400">{i + 1}.</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
```

---

### Opção 2: Layout em Abas (Alternativo)

```tsx
import React, { useState } from 'react';
import FluidBalanceCalc from './components/FluidBalanceCalc';
import DiuresisCalc from './components/DiuresisCalc';
import BalanceCumulativeCalc from './components/BalanceCumulativeCalc';
import BalanceHydricResume from './components/BalanceHydricResume';

export function PatientTabbedView({ patientId }) {
  const [activeTab, setActiveTab] = useState('register');
  const [lastUpdate, setLastUpdate] = useState(0);

  const handleSave = () => setLastUpdate(Date.now());

  return (
    <div className="w-full">
      {/* Abas */}
      <div className="flex border-b border-gray-300 dark:border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab('register')}
          className={`px-4 py-3 font-medium ${
            activeTab === 'register'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          📝 Registrar
        </button>
        <button
          onClick={() => setActiveTab('calculate')}
          className={`px-4 py-3 font-medium ${
            activeTab === 'calculate'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          🧮 Calcular
        </button>
        <button
          onClick={() => setActiveTab('analyze')}
          className={`px-4 py-3 font-medium ${
            activeTab === 'analyze'
              ? 'border-b-2 border-purple-600 text-purple-600'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          📊 Analisar
        </button>
      </div>

      {/* Conteúdo das Abas */}
      {activeTab === 'register' && (
        <div className="space-y-4">
          <FluidBalanceCalc patientId={patientId} onCalculationSaved={handleSave} />
          <DiuresisCalc patientId={patientId} onCalculationSaved={handleSave} />
        </div>
      )}

      {activeTab === 'calculate' && (
        <div>
          <BalanceCumulativeCalc key={lastUpdate} patientId={patientId} />
        </div>
      )}

      {activeTab === 'analyze' && (
        <div>
          <BalanceHydricResume key={lastUpdate} patientId={patientId} />
        </div>
      )}
    </div>
  );
}
```

---

### Opção 3: Layout Vertical (Mobile-First)

```tsx
export function PatientVerticalLayout({ patientId }) {
  const [lastUpdate, setLastUpdate] = useState(0);

  return (
    <div className="space-y-6 p-4">
      {/* Seção 1: Registrar */}
      <Section title="📝 Registrar Dados" color="blue">
        <FluidBalanceCalc 
          patientId={patientId}
          onCalculationSaved={() => setLastUpdate(Date.now())}
        />
      </Section>

      {/* Seção 2: Diurese */}
      <Section title="🚽 Calcular Diurese" color="green">
        <DiuresisCalc 
          patientId={patientId}
          onCalculationSaved={() => setLastUpdate(Date.now())}
        />
      </Section>

      {/* Seção 3: BH Cumulativo */}
      <Section title="🧮 BH Cumulativo" color="indigo">
        <BalanceCumulativeCalc 
          key={lastUpdate}
          patientId={patientId}
        />
      </Section>

      {/* Seção 4: Análise */}
      <Section title="📊 Análise Completa" color="purple">
        <BalanceHydricResume 
          key={lastUpdate}
          patientId={patientId}
        />
      </Section>
    </div>
  );
}

function Section({ title, color, children }) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700',
    green: 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700',
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700',
  };

  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color]}`}>
      <h2 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">
        {title}
      </h2>
      {children}
    </div>
  );
}
```

---

## 📋 Fluxo de Usuário

```
USUÁRIO ENTRA NA PÁGINA DO PACIENTE
           ↓
    [Vê a Seção de Dados]
           ↓
FluidBalanceCalc: "Digite volume entrada/saída"
    ├─ 500 mL entrada
    ├─ 70 kg peso
    └─ Clica "Salvar"
           ↓
   Dados salvos em DB
           ↓
DiuresisCalc: "Volume de urina por hora"
    ├─ 1000 mL em 24h
    └─ Clica "Salvar"
           ↓
   Dados salvos em DB
           ↓
    [Página atualiza com lastUpdate]
           ↓
BalanceCumulativeCalc: Busca dados
    ├─ Query: vw_resumo_balanco
    ├─ Calcula: BH_Anterior + BH_Hoje
    └─ Mostra resultado com alerta
           ↓
BalanceHydricResume: Exibe resumo visual
    ├─ Timeline 7 dias
    ├─ Status do paciente
    └─ Recomendações
           ↓
MÉDICO TOMA DECISÃO CLÍNICA
```

---

## 🔄 Sistema de Atualização

```tsx
// Uso de key para forçar re-render
const [lastUpdate, setLastUpdate] = useState(0);

const handleSave = () => {
  setLastUpdate(Date.now());
  // Componentes com key={lastUpdate} vão re-montar
};

// Componentes dependentes:
<BalanceCumulativeCalc 
  key={lastUpdate}  {/* ← Re-renderiza quando lastUpdate muda */}
  patientId={patientId}
/>
```

---

## 📊 Estrutura Recomendada

```
App.tsx ou PatientPage.tsx
├── PatientDashboard (componente principal)
│   ├── FluidBalanceCalc
│   │   ├── useState hook para dados
│   │   ├── useEffect para carregar paciente
│   │   └── handleSave callback
│   │
│   ├── DiuresisCalc
│   │   ├── useState para volume/horas
│   │   └── useEffect para cálulos
│   │
│   ├── BalanceCumulativeCalc ✨ NOVO
│   │   ├── useState para dados
│   │   ├── useEffect para buscar vw_resumo_balanco
│   │   ├── getAlertStatus para cores
│   │   └── calculateCumulative para cálculo
│   │
│   └── BalanceHydricResume
│       ├── useState para dados
│       ├── useState para expandido/fechado
│       └── useEffect para filtro timeline
```

---

## 🎨 Customização de Layout

### Cores por Seção

```tsx
const sectionConfig = {
  fluidBalance: {
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-300 dark:border-blue-700',
    textColor: 'text-blue-600 dark:text-blue-400',
  },
  diuresis: {
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-300 dark:border-green-700',
    textColor: 'text-green-600 dark:text-green-400',
  },
  cumulative: {
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    borderColor: 'border-indigo-300 dark:border-indigo-700',
    textColor: 'text-indigo-600 dark:text-indigo-400',
  },
  resume: {
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-300 dark:border-purple-700',
    textColor: 'text-purple-600 dark:text-purple-400',
  },
};
```

---

## ✅ Checklist de Implementação Completa

- [ ] Importar FluidBalanceCalc
- [ ] Importar DiuresisCalc
- [ ] **Importar BalanceCumulativeCalc** ← NOVO
- [ ] Importar BalanceHydricResume
- [ ] Criar useState para lastUpdate
- [ ] Adicionar handleCalculationSaved
- [ ] Estruturar layout escolhido
- [ ] Testar fluxo de dados
- [ ] Verificar alertas no console
- [ ] Testar Dark Mode
- [ ] Testar Responsividade Mobile
- [ ] Deploy

---

## 🚀 Pronto Para Usar!

**Copie o código acima** e adapte para seu App!

**Próximo passo:** Testar com um paciente real e validar cálculos.

---

**Versão:** 1.0  
**Criado:** 11 de Fevereiro de 2026  
**Status:** ✅ Pronto para Produção
