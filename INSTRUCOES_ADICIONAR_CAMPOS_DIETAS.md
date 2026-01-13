# INSTRUÇÕES PARA ADICIONAR OS CAMPOS VET_PLENO E PT_G_DIA

## ✅ JÁ IMPLEMENTADO:

1. Interface `Diet` em types.ts atualizada com os novos campos
2. Estados no `AddDietModal` e `EditDietModal` criados (vetPleno, ptGDia)
3. Funções handleSubmit atualizadas para incluir os novos campos

## 🔧 AINDA FALTA FAZER:

### No arquivo App.tsx - AddDietModal (linha ~2090):

Localizar o campo VET e adicionar LOGO APÓS ele:

```tsx
<div>
    <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
        VET Pleno [kcal/dia] <span className="text-slate-500 dark:text-slate-400 font-normal">(opcional)</span>
    </label>
    <input
        type="text"
        value={vetPleno}
        onChange={(e) => setVetPleno(e.target.value)}
        placeholder="Ex: 2000"
        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base text-slate-800 dark:text-slate-200"
    />
</div>
```

Localizar o campo PT [g/dia] e adicionar LOGO APÓS ele:

```tsx
<div>
    <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
        PT (g/dia) <span className="text-slate-500 dark:text-slate-400 font-normal">(opcional)</span>
    </label>
    <input
        type="text"
        value={ptGDia}
        onChange={(e) => setPtGDia(e.target.value)}
        placeholder="Ex: 65"
        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base text-slate-800 dark:text-slate-200"
    />
</div>
```

### No arquivo App.tsx - EditDietModal (linha ~2180):

Fazer EXATAMENTE a mesma coisa, adicionar os mesmos dois campos nos mesmos lugares.

## 🎯 RESUMO DO QUE FOI FEITO:

✅ Tabela no banco atualizada (você fez)
✅ Script SQL criado: ALTER_ADD_VET_PLENO_PT_G_DIA.sql
✅ Interface TypeScript atualizada: types.ts
✅ Estados criados nos modais
✅ Lógica de submit atualizada

❌ FALTA APENAS: Adicionar os campos visuais nos formulários (copiar o código acima nos lugares indicados)

## 📍 LOCALIZAÇÃO EXATA:

- **AddDietModal**: Procure por "Cadastrar Dieta" no App.tsx, depois encontre os campos VET e PT
- **EditDietModal**: Procure por "EditDietModal" no App.tsx, depois encontre os campos VET e PT

Os campos devem aparecer nesta ordem:
1. Volume
2. VET
3. **VET Pleno** ← NOVO
4. PT
5. **PT (g/dia)** ← NOVO
6. TH
7. Observação
