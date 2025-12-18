## DEBUG: Verificando erro de carregamento de perguntas do Supabase

### Passo 1: Abrir DevTools
1. Pressione **F12** ou clique com botão direito > "Inspecionar"
2. Vá para a aba **"Console"**

### Passo 2: Procure por mensagens de erro
Procure por um destes logs:
- ❌ "Erro ao carregar perguntas:" - Mostra o erro específico do Supabase
- ❌ "Erro ao carregar categorias:" - Mostra o erro das categorias
- ⚠️ "Usando perguntas estáticas (banco vazio ou erro)" - Significa que não conseguiu carregar

### Passo 3: Causas possíveis

**1️⃣ Tabelas não existem no Supabase**
   - Execute o SQL em `SQL_PERGUNTAS_TABLES.sql` no Supabase SQL Editor

**2️⃣ Tabelas estão vazias**
   - Insira dados nas tabelas `categorias` e `perguntas`

**3️⃣ RLS (Row Level Security) está bloqueando**
   - Verifique as políticas de RLS no Supabase
   - Deve ter "Categorias são públicas (leitura)" habilitada
   - Deve ter "Opções de perguntas são públicas (leitura)" habilitada

**4️⃣ Nomes de coluna estão errados**
   - Tabela: `categorias` → coluna `nome` (não `name`)
   - Tabela: `perguntas` → coluna `texto` (não `text`)
   - Tabela: `pergunta_opcoes` → coluna `codigo`, `label`, `has_input`, `input_placeholder`

### Passo 4: Solução rápida

Se apenas quer usar dados estáticos por agora, o app está funcionando com:
- Perguntas do constants.ts
- Categorias do constants.ts

Tudo já está funcionando! 🎉

### Passo 5: Migrar para banco de dados (quando tiver dados)

1. Execute SQL das tabelas
2. Insira os dados
3. App automaticamente carregará do banco
4. Verá nos logs: "📂 Categorias carregadas do banco" e "📚 Perguntas carregadas do banco"
