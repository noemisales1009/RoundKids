# 🚀 Função: GET_BALANCO_CUMULATIVO

## O que é?

Uma função parametrizada SQL que calcula o **BH Cumulativo** para **qualquer período de horas** (24h, 18h, 6h, 4h, 2h, ou qualquer valor).

---

## 📋 Passo a Passo

### 1️⃣ Criar a função no Supabase

**Arquivo:** `CREATE_FUNCTION_GET_BALANCO_CUMULATIVO.sql`

1. Vá para **Supabase Console** → **SQL Editor**
2. Copie **todo o conteúdo** de `CREATE_FUNCTION_GET_BALANCO_CUMULATIVO.sql`
3. Cole na aba SQL
4. Clique em **"Run"**

✅ Pronto! A função está criada.

---

### 2️⃣ Testar a função

**Arquivo:** `TESTES_FUNCTION_GET_BALANCO_CUMULATIVO.sql`

Descomente os testes e execute no Supabase para validar.

---

## 💻 Como usar no React

### Chamar a função para um período específico:

```typescript
import { supabase } from '../supabaseClient';

// Buscar dados de 24 horas
const { data: dados24h, error } = await supabase.rpc(
  'get_balanco_cumulativo',
  {
    p_patient_id: patientId,
    p_hours: 24
  }
);

if (dados24h && dados24h.length > 0) {
  const result = dados24h[0];
  console.log(`BH Cumulativo (24h): ${result.bh_cumulativo}%`);
}
```

### Ou especificar o período:

```typescript
// 18 horas
const { data: dados18h } = await supabase.rpc('get_balanco_cumulativo', {
  p_patient_id: patientId,
  p_hours: 18
});

// 6 horas
const { data: dados6h } = await supabase.rpc('get_balanco_cumulativo', {
  p_patient_id: patientId,
  p_hours: 6
});

// 4 horas
const { data: dados4h } = await supabase.rpc('get_balanco_cumulativo', {
  p_patient_id: patientId,
  p_hours: 4
});

// 2 horas
const { data: dados2h } = await supabase.rpc('get_balanco_cumulativo', {
  p_patient_id: patientId,
  p_hours: 2
});
```

---

## 📊 Resultado retornado

```typescript
{
  patient_id: "uuid-123",
  patient_name: "João Silva",
  period_hours: 24,
  periodo_label: "24 horas",
  data_calculo: "2026-02-24T10:30:45-03:00",
  bh_periodo_anterior: 200.00,      // BH das 24h ANTES
  bh_periodo_atual: -50.00,         // BH das últimas 24h
  bh_cumulativo: 150.00,            // Total: 200 + (-50)
  registros_periodo_atual: 5        // 5 medições nas últimas 24h
}
```

---

## 🎯 Lógica da função

Para período de **24 horas**:

```
AGORA: 10:30 de hoje

Período Anterior: 10:30 de ontem até 10:30 de hoje -24h
  └─ Soma de todos os BH desse período
  
Período Atual: 10:30 de hoje -24h até AGORA
  └─ Soma de todos os BH do período
  
BH Cumulativo = Período Anterior + Período Atual
```

---

## ⚙️ Parâmetros

| Parâmetro | Tipo | Default | Descrição |
|-----------|------|---------|-----------|
| `p_patient_id` | UUID | - | ID do paciente (obrigatório) |
| `p_hours` | INTEGER | 24 | Número de horas (2, 4, 6, 18, 24) |

---

## 🔔 Notas importantes

- **Timezone**: usa `'America/Sao_Paulo'` (GMT-3/GMT-2) para todos os cálculos
- **Query eficiente**: calcula APENAS o período solicitado (não traz tudo)
- **Sem cache**: retorna sempre dados atualizados da última execução
- **Flexível**: trabalha com qualquer número de horas (não só 2, 4, 6, 18, 24)

---

## 🧪 Exemplo de teste SQL

```sql
-- Teste de 24h
SELECT 
  patient_name,
  periodo_label,
  bh_cumulativo,
  registros_periodo_atual
FROM get_balanco_cumulativo(
  'seu-uuid-aqui'::uuid,
  24
);

-- Resultado esperado:
-- patient_name | periodo_label | bh_cumulativo | registros_periodo_atual
-- --------------|---------------|---------------|------------------------
-- João Silva    | 24 horas      | +150.00       | 5
```

---

## ✅ Status

Função criada e pronta para usar no React! 🚀
