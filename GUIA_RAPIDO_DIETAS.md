# ⚡ Guia Rápido: Rastreamento de Dietas

## 🚀 Passos para Implementar

### 1️⃣ Execute o SQL no Supabase

**Arquivo:** `CREATE_DIETAS_PACIENTES_WITH_CREATORS.sql`

1. Abra [Supabase Dashboard](https://app.supabase.com)
2. Vá para **SQL Editor**
3. Cole todo o conteúdo do arquivo
4. Clique em **Run**

✅ Pronto! A tabela está atualizada com os novos campos.

---

### 2️⃣ As mudanças no código já estão implementadas

Os seguintes arquivos já foram modificados:

- ✅ `App.tsx` - Funções atualizadas
- ✅ `components/modals/diets/AddDietModal.tsx` - Modal atualizado
- ✅ `components/modals/diets/ArchiveDietModal.tsx` - Já estava correto

**Não é necessário fazer mais nada no código!**

---

## 📊 Como Funciona Agora

### Ao Cadastrar uma Dieta

```
1. Usuário clica em "Cadastrar Dieta"
2. Modal se abre com formulário
3. Usuário preenche os dados
4. Clica em "Cadastrar"
   ↓
   Sistema captura user.id automaticamente
   ↓
   Supabase salva criado_por_id = [seu ID]
   ↓
5. ✅ Dieta está registrada com rastreamento
```

### Ao Arquivar uma Dieta

```
1. Usuário clica no ícone de "X" (Arquivar)
2. Modal pede o motivo
3. Usuário escreve o motivo
4. Clica em "Arquivar"
   ↓
   Sistema captura user.id automaticamente
   ↓
   Supabase salva:
   - is_archived = true
   - arquivado_por_id = [seu ID]
   - motivo_arquivamento = [o que você digitou]
   ↓
5. ✅ Dieta está arquivada com rastreamento completo
```

---

## 🔍 Como Verificar

### 1. No Supabase SQL Editor

**Ver todas as dietas com quem as criou:**
```sql
SELECT 
    d.tipo,
    d.data_inicio,
    u.name AS criado_por,
    d.created_at
FROM dietas_pacientes d
LEFT JOIN users u ON d.criado_por_id = u.id
ORDER BY d.created_at DESC;
```

**Ver dietas arquivadas com razão:**
```sql
SELECT 
    d.tipo,
    u_criador.name AS criado_por,
    u_arquivador.name AS arquivado_por,
    d.motivo_arquivamento,
    d.updated_at
FROM dietas_pacientes d
LEFT JOIN users u_criador ON d.criado_por_id = u_criador.id
LEFT JOIN users u_arquivador ON d.arquivado_por_id = u_arquivador.id
WHERE d.is_archived = true
ORDER BY d.updated_at DESC;
```

### 2. No Console do Navegador (DevTools)

Ao cadastrar uma dieta, você verá:
```
🔍 addDietToPatient - userId recebido: [UUID]
📦 Payload para Supabase (dieta): {...}
✅ Dieta inserida com sucesso
```

---

## 📈 Campos Salvos

### Quando cria uma dieta:
- `criado_por_id` ← Seu ID (UUID)
- `created_at` ← Data/hora de criação

### Quando arquiva uma dieta:
- `arquivado_por_id` ← Seu ID (UUID)
- `motivo_arquivamento` ← Razão que você digitou
- `updated_at` ← Data/hora do arquivamento
- `is_archived` ← true

---

## 🎯 Tabela de Referência

| Campo | Tipo | Quando é Preenchido | Preenchido Por |
|-------|------|---|---|
| `criado_por_id` | UUID | Ao criar dieta | Sistema (user.id) |
| `arquivado_por_id` | UUID | Ao arquivar dieta | Sistema (user.id) |
| `motivo_arquivamento` | TEXT | Ao arquivar dieta | Você (manual) |
| `created_at` | TIMESTAMP | Ao criar dieta | Banco de dados |
| `updated_at` | TIMESTAMP | Ao arquivar dieta | Banco de dados |

---

## 🐛 Troubleshooting

### Problema: criado_por_id é NULL
**Solução:** Verifique se você está logado e se o UserContext está funcionando. Veja o console do navegador para os logs de debug.

### Problema: Erro ao executar SQL
**Solução:** Certifique-se de que:
1. A tabela `users` existe
2. Você tem permissões para criar/modificar tabelas
3. Não há erros de sintaxe SQL

### Problema: Não vejo os campos novos
**Solução:** 
1. Recarregue a página (Ctrl+R ou Cmd+R)
2. Limpe o cache do navegador
3. Verifique no Supabase se a tabela foi realmente atualizada

---

## ✨ Exemplo Prático

### Cenário: Você cadastra uma dieta para o paciente João

1. Acessa o paciente João
2. Clica em "Cadastrar Dieta"
3. Preenche:
   - Tipo: Enteral
   - Data: 06/02/2026
   - Volume: 1500ml
   - VET: 1800 kcal/dia
4. Clica em "Cadastrar"

**O que é salvo no banco:**
```
{
  id: "abc123...",
  paciente_id: "paciente_uuid",
  tipo: "Enteral",
  data_inicio: "2026-02-06",
  volume: 1500,
  vet: 1800,
  criado_por_id: "seu_uuid",              ← Seu ID!
  created_at: "2026-02-06 14:30:00"
}
```

---

## 📋 Checklist de Validação

Após implementar, verifique:

- [ ] Você consegue criar uma dieta
- [ ] Ao criar, o `criado_por_id` é salvo (verifique no SQL)
- [ ] Você consegue arquivar uma dieta
- [ ] Ao arquivar, pediu um motivo
- [ ] Ao arquivar, `arquivado_por_id` é salvo
- [ ] Ao arquivar, `motivo_arquivamento` é salvo
- [ ] Os queries SQL retornam os dados corretos

---

## 📞 Precisa de Ajuda?

Verifique os outros arquivos de documentação:

1. **IMPLEMENTACAO_CRIADO_POR_DIETAS.md** - Documentação detalhada
2. **MUDANCAS_CODIGO_DIETAS.md** - Antes e depois do código
3. **TESTES_RASTREAMENTO_DIETAS.sql** - Queries para testar

---

**Status:** ✅ Pronto para usar!
