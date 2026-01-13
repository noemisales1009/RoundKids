# CÓDIGO PARA SALVAR DADOS CALCULADOS (VET AT E PT AT)

## 📋 O QUE FOI IMPLEMENTADO:

### 1. **Script SQL** - [ALTER_ADD_VET_AT_PT_AT.sql](ALTER_ADD_VET_AT_PT_AT.sql)

Execute este script no Supabase SQL Editor para adicionar as colunas:
- `vet_at` - Armazena VET AT calculado em porcentagem
- `pt_at` - Armazena PT AT calculado em porcentagem

```sql
ALTER TABLE public.dietas_pacientes
ADD COLUMN IF NOT EXISTS vet_at NUMERIC(5,2) NULL;

ALTER TABLE public.dietas_pacientes
ADD COLUMN IF NOT EXISTS pt_at NUMERIC(5,2) NULL;
```

### 2. **TypeScript** - Interface Diet atualizada

A interface `Diet` em [types.ts](types.ts) agora inclui:
```typescript
vet_at?: number; // VET AT - Porcentagem calculada
pt_at?: number; // PT AT - Porcentagem calculada
```

### 3. **Funções de Banco de Dados** - [App.tsx](App.tsx)

#### `addDietToPatient` - Calcula e salva ao INSERIR:
```typescript
const vetAt = (diet.vet && diet.vet_pleno) 
    ? (parseFloat(diet.vet) * 100) / parseFloat(diet.vet_pleno) 
    : null;

const ptAt = (diet.pt && diet.pt_g_dia) 
    ? (parseFloat(diet.pt) * 100) / parseFloat(diet.pt_g_dia) 
    : null;
```

#### `updateDietInPatient` - Calcula e salva ao ATUALIZAR:
- Mesma lógica de cálculo
- Atualiza automaticamente os valores no banco

## 🎯 COMO FUNCIONA:

1. **Usuário preenche o formulário** com:
   - VET e VET Pleno → Calcula VET AT
   - PT e PT Plena → Calcula PT AT

2. **Ao clicar em "Cadastrar" ou "Salvar"**:
   - Os cálculos são feitos automaticamente
   - Valores são salvos no banco de dados
   - `vet_at` e `pt_at` ficam disponíveis para consultas

3. **Visualização**:
   - Card mostra os cálculos em tempo real (frontend)
   - Valores ficam salvos no banco (backend)

## 📊 FÓRMULAS:

- **VET AT** = (VET ÷ VET Pleno) × 100
- **PT AT** = (PT ÷ PT Plena) × 100

## ✅ PASSOS PARA ATIVAR:

1. Execute o script SQL: [ALTER_ADD_VET_AT_PT_AT.sql](ALTER_ADD_VET_AT_PT_AT.sql)
2. Recarregue a aplicação
3. Cadastre/edite uma dieta preenchendo os campos
4. Os valores calculados serão salvos automaticamente!

## 🔍 VERIFICAR SE SALVOU:

No Supabase SQL Editor, execute:
```sql
SELECT 
    id, 
    tipo,
    vet, 
    vet_pleno, 
    vet_at,
    pt, 
    pt_g_dia, 
    pt_at
FROM public.dietas_pacientes
WHERE vet_at IS NOT NULL OR pt_at IS NOT NULL
ORDER BY created_at DESC;
```

---

**Pronto!** Agora todos os cálculos de VET AT e PT AT são salvos automaticamente no banco de dados. 🎉
