# 🐛 Solução: Nome do Usuário Não Aparece Corretamente após Login

## Problema
Quando você faz login e aperta F5, o nome aparece como "Noemi" (padrão) em vez do nome real do usuário autenticado.

## Causa
1. A tabela `users` no Supabase pode não existir ou não estar configurada corretamente
2. O usuário não está sendo salvo na tabela `users` após fazer login
3. O `loadUser()` tenta carregar dados do banco, mas encontra a tabela vazia

## Solução - Passos para Corrigir

### 1️⃣ Criar a Tabela no Supabase
Execute o script SQL em `CREATE_USERS_TABLE.sql` no SQL Editor do Supabase:

1. Vá para [Supabase Dashboard](https://supabase.com)
2. Selecione seu projeto **RoundKids**
3. Clique em **SQL Editor** (painel esquerdo)
4. Clique em **New Query**
5. Cole o conteúdo do arquivo `CREATE_USERS_TABLE.sql`
6. Clique em **Run**

### 2️⃣ Verificar se Funcionou
Execute esta query no SQL Editor para verificar se a tabela foi criada:

```sql
SELECT * FROM public.users LIMIT 5;
```

Deve retornar uma tabela vazia (sem erro).

### 3️⃣ Testar o Login
1. Faça logout da aplicação
2. Faça login novamente com suas credenciais
3. O nome correto deve aparecer
4. Aperte F5 (refresh) - o nome deve permanecer igual

## 🔧 O Que Foi Corrigido no Código

### Antes ❌
```tsx
} else {
    setLoginAttempts(0);
    try {
        await loadUser();  // Tenta carregar um usuário que pode não existir no banco
    } catch (err) {
        console.error('Erro ao carregar usuário:', err);
    }
    navigate('/dashboard');
}
```

### Depois ✅
```tsx
} else {
    setLoginAttempts(0);
    try {
        // 1. Obter dados da sessão autenticada
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
            const userId = session.user.id;
            const userEmail = session.user.email || '';
            const userName = session.user.user_metadata?.name || userEmail.split('@')[0];
            
            // 2. **NOVO**: Inserir/atualizar usuário na tabela users
            await supabase.from('users').upsert({
                id: userId,
                email: userEmail,
                name: userName,
                role: 'Médica',
                access_level: 'geral'
            }, { onConflict: 'id' });
        }
        
        // 3. Carregar dados do usuário imediatamente após login
        await loadUser();
    } catch (err) {
        console.error('Erro ao carregar usuário:', err);
    }
    navigate('/dashboard');
}
```

## 📊 Estrutura da Tabela `users`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | ID do usuário (referencia auth.users) |
| `email` | TEXT | Email único |
| `name` | TEXT | Nome do usuário |
| `role` | TEXT | Cargo/Profissão (ex: "Médica") |
| `foto` | TEXT | URL da foto |
| `sector` | TEXT | Setor/Unidade |
| `access_level` | TEXT | Nível de acesso ('adm' ou 'geral') |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Data da última atualização |

## ✅ Checklist de Verificação

- [ ] Execute o SQL script `CREATE_USERS_TABLE.sql` no Supabase
- [ ] Verifique se a tabela `users` foi criada com sucesso
- [ ] Faça logout e login novamente
- [ ] Verifique se o nome correto aparece agora
- [ ] Aperte F5 e confirme que o nome permanece

## 🔗 Mapeamento de Campos Frontend ↔️ Banco de Dados

| Frontend (App.tsx) | Banco (users table) | Descrição |
|-------------------|------------------|-----------|
| `user.name` | `name` | Nome do usuário |
| `user.title` | `role` | Cargo/Profissão |
| `user.avatarUrl` | `foto` | URL da foto |
| `user.sector` | `sector` | Setor |
| `user.access_level` | `access_level` | Nível de acesso |

## 💡 Dicas Adicionais

Se após fazer login o nome ainda não aparacer corretamente:

1. **Abra o Console do Navegador** (F12) e verifique se há erros
2. **Verifique o banco de dados**: Execute em SQL Editor:
   ```sql
   SELECT id, email, name, role FROM public.users;
   ```
3. **Procure por Políticas de RLS**: Se houver políticas RLS bloqueando, execute:
   ```sql
   ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
   ```
