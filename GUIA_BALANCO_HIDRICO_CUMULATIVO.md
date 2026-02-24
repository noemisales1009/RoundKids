# 📊 BH Cumulativo - Guia de Implementação

## O que é?
Uma **VIEW do Supabase** que calcula o balanço hídrico cumulativo de cada paciente, combinando:
- ✅ **BH do dia anterior** (último valor registrado antes de hoje)
- ✅ **BH de hoje** (soma de todos os valores registrados a partir de 00:00)
- ✅ **BH Cumulativo** (dia anterior + dia atual)

## Exemplo Prático

### Dados na tabela `balanco_hidrico`:

| data_registro          | patient_id | resultado |
|------------------------|-----------|-----------|
| 2026-02-22 14:30:00   | UUID-001  | +100.00   |
| 2026-02-22 20:15:00   | UUID-001  | +150.00   |
| 2026-02-23 08:00:00   | UUID-001  | -50.00    |
| 2026-02-23 14:30:00   | UUID-001  | +25.00    |

### O que a VIEW calcula:

```
BH Dia Anterior (22/fev):
  → Último registro: +150.00 ml

BH Dia Atual (23/fev):
  → Soma dos registros: (-50.00) + (+25.00) = -25.00 ml

BH CUMULATIVO:
  → +150.00 + (-25.00) = +125.00 ml
```

## 📋 Passo a Passo para Executar

### 1️⃣ Copie e execute no Supabase Console
Arquivo: `CREATE_VIEW_BALANCO_HIDRICO_CUMULATIVO.sql`

```sql
CREATE OR REPLACE VIEW balanco_hidrico_cumulativo AS
SELECT 
  -- ... (conteúdo completo do arquivo)
FROM patients p;
```

### 2️⃣ Teste a VIEW
Arquivo: `TESTES_BALANCO_HIDRICO_CUMULATIVO.sql`

Execute os testes para validar:
```sql
SELECT * FROM balanco_hidrico_cumulativo;
```

### 3️⃣ Integre no React (Optional)
Crie um componente que consulte a VIEW:

```typescript
const { data } = await supabase
  .from('balanco_hidrico_cumulativo')
  .select('*')
  .eq('patient_id', patientId)
  .single();

// Resultado:
// {
//   bh_dia_anterior: +200.00,
//   bh_dia_atual: -50.00,
//   bh_cumulativo: +150.00
// }
```

## 🎨 Campos Retornados

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `patient_id` | UUID | ID do paciente |
| `patient_name` | TEXT | Nome do paciente |
| `data_calculo` | TIMESTAMP | Data de hoje (atualiza com GMT-3) |
| `bh_dia_anterior` | NUMERIC | BH final do dia anterior |
| `bh_dia_atual` | NUMERIC | Soma de todos os BH de hoje |
| `bh_cumulativo` | NUMERIC | **Valor final: dia anterior + dia atual** |
| `registros_hoje` | INTEGER | Quantidade de medições de hoje |

## ⚠️ Interpretação dos Resultados

```
BH Cumulativo > +200  → ⚠️ Geralmente indica retenção excessiva de líquido
BH Cumulativo > 0     → ✓ Paciente retendo líquido (positivo)
BH Cumulativo < 0     → ✓ Paciente eliminando líquido (negativo)
BH Cumulativo < -200  → ⚠️ Geralmente indica perda excessiva de líquido
```

## 🔧 Notas Técnicas

- **Timezone**: Usa `'America/Sao_Paulo'` (GMT-3)
- **Data**: Considera os registros a partir de 00:00 (meia-noite em São Paulo)
- **Cache**: Views são calculadas em tempo real, sem cache
- **Performance**: Índices em `data_registro` otimizam as queries

## 📝 Documentos Relacionados

- `CREATE_VIEW_BALANCO_HIDRICO_CUMULATIVO.sql` - Script de criação
- `TESTES_BALANCO_HIDRICO_CUMULATIVO.sql` - Scripts de teste
- `CREATE_BALANCO_HIDRICO_TABLES.sql` - Tabela base

---

**Status**: ✅ Pronto para executar no Supabase
