## 📋 ALTERAÇÕES NA FEATURE DE DIETAS

### 🗄️ Mudanças no Banco de Dados

Arquivo SQL: `ALTER_DIETAS_ADD_COLUMNS.sql`

**Alterações na tabela `dietas_pacientes`:**

1. ✅ **Renomeação de Coluna:**
   - `data` → `data_inicio` (Mantém dados existentes)

2. ✅ **Novas Colunas Adicionadas:**
   - `data_remocao` (TIMESTAMP WITH TIME ZONE) - Data de fim/retirada da dieta
   - `observacao` (TEXT) - Campo de observações livres

---

### 📱 Mudanças no Frontend

#### **Arquivo: types.ts**

Interface `Diet` atualizada com novos campos:

```typescript
export interface Diet {
  id: number | string;
  type: string; // "Oral", "Enteral", "Parenteral"
  data_inicio: string; // Data de início
  data_remocao?: string; // Data de fim/retirada (opcional)
  volume?: string; // Volume em ml
  vet?: string; // Valor Energético Total [kcal/dia]
  pt?: string; // Proteína [g/dia]
  th?: string; // Taxa Hídrica [ml/m²/dia]
  observacao?: string; // Observações adicionais
  isArchived?: boolean;
}
```

---

#### **Arquivo: App.tsx**

##### **1. AddDietModal Component**
- ✅ Adicionado campo "Data de Início" (obrigatório)
- ✅ Adicionado campo "Data de Retirada" (opcional)
- ✅ Adicionado campo "Observação" (textarea - opcional)
- ✅ Atualizado estado para: `dataInicio`, `dataRemocao`, `observacao`

##### **2. EditDietModal Component**
- ✅ Mesmo conjunto de campos do AddDietModal
- ✅ Carrega valores existentes da dieta
- ✅ Permite editar data de retirada e observações

##### **3. Funções do PatientsProvider**

**addDietToPatient():**
```typescript
- Usa: data_inicio, data_remocao, observacao
- Envia para banco: paciente_id, tipo, data_inicio, data_remocao, volume, vet, pt, th, observacao
```

**updateDietInPatient():**
```typescript
- Atualiza todos os campos incluindo data_remocao e observacao
```

##### **4. fetchPatients() - dietsMap Reducer**
- ✅ Mapeia `d.data_inicio` → `data_inicio`
- ✅ Mapeia `d.data_remocao` → `data_remocao`
- ✅ Mapeia `d.observacao` → `observacao`

##### **5. Exibição de Dietas (PatientDetailScreen)**
- ✅ Mostra "Início:" com data formatada
- ✅ Mostra "Retirada:" (se existir)
- ✅ Mostra "Observação:" (se existir)
- ✅ Unidades corretas nos rótulos:
  - VET: `[kcal/dia]`
  - PT: `[g/dia]`
  - TH: `[ml/m²/dia]`

---

### 📊 Tabela de Campos da Dieta

| Campo | Tipo | Obrigatório | Exemplo |
|-------|------|------------|---------|
| **Tipo** | Dropdown | ✅ | Oral / Enteral / Parenteral |
| **Data de Início** | Date | ✅ | 2026-01-04 |
| **Data de Retirada** | Date | ❌ | 2026-01-10 |
| **Volume** | Numeric | ❌ | 1000 |
| **VET** | Numeric | ❌ | 1800 |
| **PT** | Numeric | ❌ | 60 |
| **TH** | Numeric | ❌ | 150 |
| **Observação** | Textarea | ❌ | Paciente com tolerância... |

---

### 🔄 Fluxo de Dados

```
Usuário preenche Modal (Add/Edit)
    ↓
AddDietModal/EditDietModal valida dados
    ↓
addDietToPatient() / updateDietInPatient()
    ↓
Supabase insere/atualiza em dietas_pacientes
    ↓
fetchPatients() recarrega dados
    ↓
dietsMap mapeia dados do banco
    ↓
Exibição atualizada na PatientDetailScreen
```

---

### ✅ Próximos Passos

1. **Execute o SQL no Supabase:**
   ```sql
   -- Execute: ALTER_DIETAS_ADD_COLUMNS.sql
   ```

2. **Teste a Feature:**
   - Abra um paciente
   - Clique na aba "Dietas"
   - Clique em "Cadastrar Dieta"
   - Preencha os campos
   - Verifique a exibição
   - Teste edição e exclusão

3. **Commit e Push:**
   ```bash
   git add -A
   git commit -m "feat: Expandir sistema de dietas com data_remocao e observacoes"
   git push
   ```

---

### 🎯 Status da Implementação

✅ **TypeScript** - Sem erros
✅ **Interfaces** - Atualizadas
✅ **Componentes** - Implementados
✅ **Banco de Dados** - Scripts prontos
✅ **Exibição** - Completa com novas informações
