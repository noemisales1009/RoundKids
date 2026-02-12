# 🧮 Calculadora de BH Cumulativo

## O Que É?

Componente React interativo que **calcula e visualiza** o Balanço Hídrico Cumulativo usando a fórmula:

$$BH\ Cumulativo = BH\ Dia\ Anterior + BH\ Dia\ Atual$$

---

## 📊 Como Funciona

### Fórmula Matemática

```
BH Cumulativo(n) = BH Dia(n-1) + BH Dia(n)

Exemplo:
├─ Dia 1: BH = +200 mL
│  └─ Cumulativo = +200 mL (primeiro dia)
│
├─ Dia 2: BH = +150 mL
│  └─ Cumulativo = 200 + 150 = +350 mL
│
├─ Dia 3: BH = -100 mL
│  └─ Cumulativo = 350 + (-100) = +250 mL
│
└─ Dia 4: BH = +200 mL
   └─ Cumulativo = 250 + 200 = +450 mL
```

---

## 🚀 Como Usar

### 1. Importar no Seu App

```tsx
import BalanceCumulativeCalc from './components/BalanceCumulativeCalc';
```

### 2. Adicionar ao Componente

```tsx
// Na página do paciente:

export function PatientDashboard({ patientId }) {
  return (
    <div className="space-y-4">
      {/* Entrada de dados */}
      <FluidBalanceCalc patientId={patientId} />
      
      {/* 👇 ADICIONE ISTO: */}
      <BalanceCumulativeCalc patientId={patientId} />
      
      {/* Resumo geral */}
      <BalanceHydricResume patientId={patientId} />
    </div>
  );
}
```

### 3. Props Disponível

```tsx
interface BalanceCumulativeCalcProps {
  patientId: string | number;  // ✅ Obrigatório
  onCalculationComplete?: (data) => void;  // ⭕ Opcional
}
```

**Exemplo com callback:**
```tsx
<BalanceCumulativeCalc 
  patientId={patientId}
  onCalculationComplete={(data) => {
    console.log('BH Cumulativo agora é:', data.bh_cumulativo);
    // Fazer algo com o resultado
  }}
/>
```

---

## 🎨 Visual do Componente

### Estado Contraído (Padrão)

```
┌─────────────────────────────────────────────────┐
│ ∑ Calculadora BH Cumulativo                   ▶ │
│   BH Cumulativo = BH Dia Anterior + BH Dia Atual│
├─────────────────────────────────────────────────┤
│ BH Anterior    +    BH Hoje    =    RESULTADO   │
│   -180 mL           +250 mL              +70 mL  │
│                                                  │
│ ┌──────────────────────────────────────────┐   │
│ │ = BH CUMULATIVO: +70 mL | Superávit     │   │
│ └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

### Estado Expandido (Ao clicar)

```
[Header contraído acima]
├─────────────────────────────────────────────────┤
│ 📐 FÓRMULA DE CÁLCULO                           │
│ ┌─────────────────────────────────────────┐   │
│ │ BH Cumulativo                           │   │
│ │ = BH Dia Anterior + BH Dia Atual       │   │
│ │                                         │   │
│ │ Seu cálculo:                            │   │
│ │ +250 + (-180) = +70 mL                 │   │
│ └─────────────────────────────────────────┘   │
│                                                │
│ 📅 BH Dia Anterior      📊 BH Dia Atual       │
│ Valor: -180 mL         Valor: +250 mL        │
│ Paciente eliminou       Retenção líquida      │
│                                                │
│ 🎯 Seu BH Cumulativo                          │
│ ┌──────────────────────────────────────────┐ │
│ │ Valor: +70 mL                            │ │
│ │ Status: Superávit                        │ │
│ │ ✓ OK: Balanço equilibrado                │ │
│ └──────────────────────────────────────────┘ │
│                                                │
│ [Atualizar Cálculo]  [Legenda]               │
└─────────────────────────────────────────────────┘
```

---

## 📈 Ciclo de Dados

```
1. Componente monta
   ↓
2. useEffect busca dados de vw_resumo_balanco
   ↓ (SQL Query)
   └─ Últimos 2 dias para paciente
3. Extrai:
   - BH Dia Anterior (índice 1)
   - BH Dia Atual (índice 0)
   - BH Cumulativo (do banco)
   ↓
4. Calcula cumulativo local:
   cumulativo = anterior + hoje
   ↓
5. Exibe com cores e alertas
   ↓
6. Chama callback (se hovhouver)
```

---

## 🎯 Alertas Automáticos

#### ✅ **Equilibrado** (-500 a +500)
```
Status: ✓ OK: Balanço equilibrado
Cor: Verde
Ação: Continuar monitoramento regular
```

#### 🟠 **Superávit** (+500 a +1000)
```
Status: Superávit
Cor: Laranja
Alerta: ⚠️ Paciente retendo líquido
Monitorar: Edema, ganho de peso, falta de ar
```

#### 🔴 **Superávit Alto** (> +1000)
```
Status: Superávit Alto ⚠️
Cor: Vermelho
Alerta: ⚠️ CRÍTICO - Superávit de [X] mL
Risco: Edema pulmonar, insuficiência cardíaca
Ação: INTERVIR - Reduzir entrada de líquidos
```

#### 🔵 **Déficit** (-1000 a -500)
```
Status: Déficit
Cor: Azul
Alerta: ⚠️ Paciente desidratado
Monitorar: PA, FC, eletrólitos
```

#### 🟣 **Déficit Alto** (< -1000)
```
Status: Déficit Alto ⚠️
Cor: Roxo
Alerta: ⚠️ CRÍTICO - Déficit de [X] mL
Risco: Choque hipovolêmico, falha renal
Ação: INTERVIR - Aumentar hidratação IV
```

---

## 🔄 Atualizar Dados

### Automático
- Ao montar o componente
- Quando `patientId` muda

### Manual
- Clique no botão "Atualizar Cálculo"
- Útil após registrar novo BH

### Sob Demanda
```tsx
const calcRef = useRef<any>(null);

// Forçar atualização de fora do componente
const handleRefresh = async () => {
  calcRef.current?.fetchLatestBHData();
};
```

---

## 💡 Exemplos Práticos

### Exemplo 1: Paciente em Repouso

```
Dia 1: BH = +200 mL (Entrada > Saída)
  └─ Cumulativo = +200 mL

Resultado: 🟠 Superávit
Causa: Muita entrada (soro) e pouca saída (urina)
Ação: Monitorar paciente
```

### Exemplo 2: Paciente com Drenagem

```
Dia 1: BH = -150 mL (-Drenagem)
  └─ Cumulativo = -150 mL

Resultado: 🔵 Déficit
Causa: Perda de líquido via drenagem
Ação: Repor líquido conforme prescrição
```

### Exemplo 3: Traço Cumulativo

```
Dia 1: BH = +200    → Cum = +200
Dia 2: BH = +150    → Cum = +350
Dia 3: BH = +100    → Cum = +450
Dia 4: BH = +200    → Cum = +650 🔴 CRÍTICO!
Dia 5: BH = -300    → Cum = +350
Dia 6: BH = -200    → Cum = +150

Resultado: Redução bem-sucedida de cumulativo
Ação: Continuar diuréticos
```

---

## 🔧 Customização

### Mudar Cores dos Alertas

No arquivo `BalanceCumulativeCalc.tsx`, procure e edite:

```tsx
const getColorClass = (value: number) => {
  if (value === 0) return 'bg-green-100 text-green-800 border-green-300';
  if (value > 500) return 'bg-red-100 text-red-800 border-red-300';
  // ... editar cores aqui
};
```

### Mudar Limites de Alerta

```tsx
// Linha ~250: Mude esses valores
if (cumulativeValue > 500) { ... }  // ← Mudar 500
if (cumulativeValue < -500) { ... } // ← Ou isto
```

### Adicionar Novo Alerta Customizado

```tsx
{cumulativeValue > 1000 && (
  <div className="p-2 bg-red-900 text-white rounded">
    ⚠️ CRÍTICO DEMAIS! Chamar médico imediatamente!
  </div>
)}
```

---

## 🧪 Testando

### Teste 1: Componente Renderiza

```tsx
import BalanceCumulativeCalc from './BalanceCumulativeCalc';

export function TestPage() {
  return (
    <div>
      <h1>Teste Calculadora</h1>
      <BalanceCumulativeCalc patientId="550e8400-e29b-41d4-a716-000000000001" />
    </div>
  );
}
```

### Teste 2: Com Dados

1. Registre BH via FluidBalanceCalc
2. Veja se BalanceCumulativeCalc atualiza
3. Clique em "Atualizar Cálculo"
4. Verifique se valor muda

### Teste 3: Verificar Cálculo no Console

```
// DevTools → Console
const calc = 250 + (-180);
console.log(calc); // +70
```

---

## 📂 Onde Fica

```
RoundKids/
└── components/
    └── BalanceCumulativeCalc.tsx ✓ 550+ linhas
```

---

## 🎓 Integração Recomendada

### Layout Sugerido para Dashboard

```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
  {/* Esquerda: Entrada de Dados */}
  <div className="space-y-4">
    <FluidBalanceCalc patientId={patientId} />
    <DiuresisCalc patientId={patientId} />
  </div>

  {/* Direita: Análise e Cálculos */}
  <div className="space-y-4">
    <BalanceCumulativeCalc patientId={patientId} />
    <BalanceHydricResume patientId={patientId} />
  </div>
</div>
```

---

## 🚨 Troubleshooting

### "Nenhum cálculo registrado"

```
Cause: Sem dados para o paciente
Solução:
1. Registre um BH via FluidBalanceCalc
2. Aguarde 2-3 segundos
3. Clique "Atualizar Cálculo"
```

### "NaN na calculadora"

```
Causa: Dados inválidos no banco
Solução:
1. Verifique vw_resumo_balanco:
   SELECT * FROM vw_resumo_balanco 
   WHERE patient_id = 'seu-uuid'
2. Se vazio, insira dados via FluidBalanceCalc
```

### "Valores diferentes do esperado"

```
Causa: Cálculo pode ser feito de forma diferente
Solução:
1. Abra DevTools
2. Console → verifique valores
3. Execute query no Supabase para validar
```

---

## 📊 Dados Retornados

```tsx
interface BHCumulativoData {
  bh_dia_anterior: number | null;    // BH de ontem
  bh_do_dia: number;                  // BH de hoje
  bh_cumulativo: number | null;       // Soma total
}
```

---

## ✅ Checklist de Implementação

- [x] Componente criado
- [ ] Import adicionado ao App
- [ ] Adicionado ao JSX
- [ ] Testado no navegador
- [ ] Dados aparecem correto
- [ ] Sem erros no console

---

## 📞 FAQ

**P: Por que aparecem 2 valores diferentes de cumulativo?**
R: Um é calculado localmente, outro vem do banco. Ambos devem ser iguais.

**P: Posso trocar de paciente e mantém os dados?**
R: Sim! O componente recarrega automaticamente quando `patientId` muda.

**P: O que significa "BH Anterior nulo"?**
R: Significa que é o primeiro dia - não há dia anterior para comparar.

**P: Como altero o limite de alerta (500mL)?**
R: Edite a função `getColorClass()` e os condicionais de alerta no código.

---

## 🎯 Próximo Passo

Após implementar esta calculadora:
1. ✅ Teste com dados do banco
2. ✅ Verifique se cálculos estão corretos
3. ✅ Treine equipe de saúde
4. ✅ Monitore alertas em produção

---

**Pronto para usar! 🚀**
