# ⚡ Solução Rápida: 3 Passos

## Passo 1️⃣: Desabilitar RLS Temporariamente

1. Vá para [Supabase Dashboard](https://supabase.com)
2. Clique em **SQL Editor**
3. Copie e cole isto:

```sql
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
```

4. Clique em **Run**

---

## Passo 2️⃣: Verificar Dados

Cola isto no SQL Editor:

```sql
SELECT id, email, name, role FROM public.users LIMIT 20;
```

Clique **Run** e veja o resultado

---

## Passo 3️⃣: Fazer Login Novamente

1. Volte para aplicação
2. Faça **Logout** (botão "Sair")
3. Feche o navegador **COMPLETAMENTE**
4. Abra novamente
5. Faça **Login**
6. **Verifique o nome** - deve ser correto agora

---

## ✅ Se Funcionou!

Volta e me avisa! Depois a gente reabilita RLS com as políticas corretas.

---

## ❌ Se Ainda Não Funciona

Abra o **Console** (F12) durante o login e compartilha comigo todos os **logs coloridos** que vir. Procura por linhas com 🔵, ✅, ❌, ⚠️.

