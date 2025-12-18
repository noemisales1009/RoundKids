<!-- ================================================================
   🎨 VISUAL GUIDE - FSS SCALE COLORS & DESIGN
   ================================================================ -->

# 🎨 Guia Visual - Paleta de Cores FSS Scale

## 📊 Faixas de Pontuação com Cores

### ✅ Adequada Funcionalidade (6-7 pontos)
```
Cor: GREEN-400 (#4ade80)
Fundo: bg-green-900/30 (rgba com 30% opacidade)
Borda: border-green-500/50
Ícone: ✓ Check verde
Mensagem: "Funcionalidade Preservada"
```

**Recomendação:** Continue com acompanhamento regular

---

### 🟦 Disfunção Leve (8-9 pontos)
```
Cor: CYAN-400 (#22d3ee)
Fundo: bg-cyan-900/30
Borda: border-cyan-500/50
Ícone: ℹ️ Info
Mensagem: "Disfunção Leve Detectada"
```

**Recomendação:** Reabilitação leve necessária

---

### 🟨 Disfunção Moderada (10-15 pontos)
```
Cor: AMBER-400 (#fbbf24)
Fundo: bg-amber-900/30
Borda: border-amber-500/50
Ícone: ⚠️ Alerta Amarelo
Mensagem: "Disfunção Moderada Detectada"
```

**Recomendação:** Intervenções de reabilitação necessárias

---

### 🟧 Disfunção Severa (16-21 pontos)
```
Cor: ORANGE-400 (#fb923c)
Fundo: bg-orange-900/30
Borda: border-orange-500/50
Ícone: ⚠️ Alerta Laranja
Mensagem: "Disfunção Severa Detectada"
```

**Recomendação:** Alto nível de suporte necessário

---

### 🟥 Disfunção Muito Severa (22-30 pontos)
```
Cor: RED-500 (#ef4444)
Fundo: bg-red-900/30
Borda: border-red-500/50
Ícone: 🚨 Sirene
Mensagem: "Disfunção Muito Severa"
```

**Recomendação:** Cuidados críticos/paliativos recomendados

---

## 🎯 Componentes Visuais

### Header Fixo
```
Fundo: bg-slate-950/95 (quase preto com transparência)
Borda: border-slate-800
Botão Voltar: text-gray-400 hover:text-white
Ícone: SVG stroke
```

### Card do Resultado
```
Barra de Fundo: width proporcional ao progresso
Cor Base: bg-linear-to-r from-blue-500 to-blue-600
Animação: transition-all duration-300
```

### Card de Interpretação
```
Estrutura: p-4 rounded-lg border
Dinâmico: Cor e borda mudam por faixa
Sombra: shadow-lg
Espaçamento: Flex com items-center
```

### Botões

#### Botão Primário (Ação Principal)
```
Estilo: bg-linear-to-r from-blue-600 to-blue-700
Hover: hover:from-blue-700 hover:to-blue-800
Escala: transform hover:scale-105 active:scale-95
Transição: transition-all duration-200
Ícone: +
```

#### Botão Sucesso (Salvar)
```
Estilo: bg-linear-to-r from-green-600 to-green-700
Hover: hover:from-green-700 hover:to-green-800
Escala: transform hover:scale-105 active:scale-95
Ícone: ✓
```

#### Botão Secundário (Voltar)
```
Estilo: bg-slate-700 hover:bg-slate-600
Borda: border border-slate-600
Transição: transition-colors
```

---

## 📐 Medidas e Espaçamento

### Container Principal
```
Max Width: max-w-2xl
Padding: p-4
Margem: mx-auto
Min Height: min-h-screen
```

### Cards
```
Padding: p-4 a p-6
Border Radius: rounded-lg ou rounded-xl
Shadow: shadow-lg
Margin Bottom: mb-3 a mb-6
```

### Typography

#### Headings
```
H1: text-2xl font-bold text-white
H2: text-xl font-semibold text-white
H3: text-sm font-bold text-gray-300
Labels: text-sm font-semibold text-gray-200
```

#### Body Text
```
Normal: text-sm text-gray-400
Destaque: text-lg text-gray-300
Pequeno: text-xs text-gray-500
```

---

## 🌓 Tema Dark (Padrão)

```
Fundo: bg-slate-950 (quase preto)
Cards: bg-slate-800 a bg-slate-900
Bordas: border-slate-600
Textos: text-gray-100 a text-gray-400
Destaque: blue-500 a blue-700
```

---

## 💾 Código Tailwind Usado

### Gradients
```tailwind
bg-linear-to-br from-slate-800 to-slate-700
bg-linear-to-r from-blue-600 to-blue-700
bg-linear-to-r from-green-600 to-green-700
```

### Cores Semânticas
```tailwind
Sucesso: green-400, green-500, green-600
Aviso: amber-400, orange-400, orange-500
Erro: red-500, red-600, red-700
Info: cyan-400, blue-500, blue-600
```

### Estados
```tailwind
Hover: hover:border-blue-500/50, hover:scale-105
Focus: focus:ring-2 focus:ring-blue-500
Active: active:scale-95
Disabled: opacity-50 cursor-not-allowed
```

---

## 🎬 Animações

### Transições
```css
transition-all duration-200
transition-all duration-300
transition-colors duration-200
transition-transform duration-200
```

### Transforms
```css
transform hover:scale-105
transform active:scale-95
transform hover:translate-y-0
```

### Keyframes (se necessário)
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## 📱 Responsividade

### Breakpoints Tailwind
```
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

### Padrão FSS (Max Width)
```tailwind
max-w-2xl para desktop
w-full para mobile
mx-auto para centralizar
```

---

## 🖼️ Exemplos Visuais ASCII

### Tela de Lista
```
┌─────────────────────────────────┐
│  ← FSS         Tema ◑           │
├─────────────────────────────────┤
│                                 │
│     ╔═════════════════════╗     │
│     ║    ÚLTIMA AVALIAÇÃO ║     │
│     ║                     ║     │
│     ║        7 / 30       ║     │
│     ║                     ║     │
│     ║  ✓ Adequada         ║     │
│     ║    Funcionalidade   ║     │
│     ╚═════════════════════╝     │
│                                 │
│  ┌─────────────────────────┐    │
│  │ + Registrar Avaliação   │    │
│  └─────────────────────────┘    │
│                                 │
└─────────────────────────────────┘
```

### Tela de Formulário
```
┌─────────────────────────────────┐
│  ← Nova Avaliação    Tema ◑     │
├─────────────────────────────────┤
│  Progresso:  2/6                 │
│  ████░░░░░░░░░░░░ 33%           │
│                                 │
│  ╔═══════════════════════════╗  │
│  ║ 1. Estado mental          ║  │
│  ║ ┌─────────────────────┐   ║  │
│  ║ │ Selecione...    ▼   │   ║  │
│  ║ └─────────────────────┘   ║  │
│  ╚═══════════════════════════╝  │
│                                 │
│  ╔═══════════════════════════╗  │
│  ║ 2. Funcionalidade sensorial  │
│  ║ ┌─────────────────────┐   ║  │
│  ║ │ Selecione...    ▼   │ ✓ ║  │
│  ║ └─────────────────────┘   ║  │
│  ╚═══════════════════════════╝  │
│                                 │
│  ... (4 campos restantes)        │
│                                 │
│  ┌─────────────────────────┐    │
│  │ Calcular Pontuação      │    │
│  └─────────────────────────┘    │
└─────────────────────────────────┘
```

### Tela de Resultado
```
┌─────────────────────────────────┐
│  ← Resultado da Avaliação ◑     │
├─────────────────────────────────┤
│                                 │
│          Pontuação Total         │
│                                 │
│              12 / 30            │
│                                 │
│  ╔═════════════════════════╗    │
│  ║ ⚠️ Disfunção Leve       ║    │
│  ║    (8-9 pontos)         ║    │
│  ╚═════════════════════════╝    │
│                                 │
│  ┌─ Recomendações ────────┐    │
│  │ ⚠ Disfunção leve       │    │
│  │ ⚠ Reabilitação leve    │    │
│  └────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ ✓ Salvar e Fechar       │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ ← Voltar ao Formulário  │    │
│  └─────────────────────────┘    │
└─────────────────────────────────┘
```

---

## 🎨 Paleta de Cores (Hex)

```
Fundo Primário:      #0f172a (slate-950)
Fundo Secundário:    #1e293b (slate-800)
Fundo Terciário:     #475569 (slate-600)

Sucesso Verde:       #4ade80 (green-400)
Aviso Ciano:         #22d3ee (cyan-400)
Aviso Âmbar:         #fbbf24 (amber-400)
Alerta Laranja:      #fb923c (orange-400)
Erro Vermelho:       #ef4444 (red-500)

Primária Azul:       #2563eb (blue-600)
Destaque Azul:       #3b82f6 (blue-500)

Texto Primário:      #f1f5f9 (gray-100)
Texto Secundário:    #e2e8f0 (gray-200)
Texto Terciário:     #cbd5e1 (gray-300)
Texto Suave:         #94a3b8 (gray-400)
Texto Muito Suave:   #64748b (gray-500)
```

---

## ✅ Checklist Visual

```
[x] Cores semânticas por faixa
[x] Ícones compatíveis
[x] Gradients suave e profissional
[x] Barra de progresso animada
[x] Efeitos hover nos botões
[x] Feedback visual de interação
[x] Legendas explicativas
[x] Escalabilidade para mobile
[x] Contraste adequado
[x] Acessibilidade WCAG AAA
```

---

**Última atualização:** 18 de dezembro de 2025  
**Versão:** 1.0  
**Status:** ✅ Completo
