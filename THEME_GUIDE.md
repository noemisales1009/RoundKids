# Guia de Estilo - Tema Claro/Escuro

## Padrão de Cores Consistentes

Para garantir que todos os componentes respeitem o modo claro e escuro, use a seguinte paleta:

### Backgrounds

#### Backgrounds Primários
- **Claro**: `bg-slate-50`
- **Escuro**: `bg-slate-900`

Uso: Container principal, tela base

```tsx
<div className={isDark ? 'bg-slate-900' : 'bg-slate-50'}>
```

#### Backgrounds Secundários (cards, containers)
- **Claro**: `bg-white`
- **Escuro**: `bg-slate-800`

Uso: Cards, modal, overlays

```tsx
<div className={isDark ? 'bg-slate-800' : 'bg-white'}>
```

#### Backgrounds Terciários (inputs, grouped items)
- **Claro**: `bg-slate-100`
- **Escuro**: `bg-slate-700`

Uso: Input backgrounds, group containers

```tsx
<input className={isDark ? 'bg-slate-700' : 'bg-slate-100'}>
```

### Texto

#### Texto Primário (títulos, labels importantes)
- **Claro**: `text-slate-900`
- **Escuro**: `text-white`

```tsx
<h1 className={isDark ? 'text-white' : 'text-slate-900'}>
```

#### Texto Secundário (conteúdo normal)
- **Claro**: `text-slate-800`
- **Escuro**: `text-slate-100`

```tsx
<p className={isDark ? 'text-slate-100' : 'text-slate-800'}>
```

#### Texto Terciário (subtítulos, informação adicional)
- **Claro**: `text-slate-700`
- **Escuro**: `text-slate-200`

```tsx
<span className={isDark ? 'text-slate-200' : 'text-slate-700'}>
```

#### Texto Muted (desabilitado, secundário)
- **Claro**: `text-slate-600`
- **Escuro**: `text-slate-400`

```tsx
<p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
```

### Borders

#### Borders Primários
- **Claro**: `border-slate-300`
- **Escuro**: `border-slate-700`

```tsx
<div className={isDark ? 'border-slate-700' : 'border-slate-300'}>
```

#### Borders Secundários
- **Claro**: `border-slate-200`
- **Escuro**: `border-slate-600`

```tsx
<div className={isDark ? 'border-slate-600' : 'border-slate-200'}>
```

## Padrões Comuns

### Input/Form Element
```tsx
<input
  className={`px-3 py-2 rounded border ${
    isDark
      ? 'bg-slate-700 border-slate-600 text-slate-200'
      : 'bg-white border-slate-300 text-slate-900'
  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
/>
```

### Card Container
```tsx
<div
  className={`p-4 rounded-lg border ${
    isDark
      ? 'bg-slate-800 border-slate-700'
      : 'bg-white border-slate-200'
  }`}
>
```

### Disabled State
```tsx
<button
  disabled={isLoading}
  className={`px-4 py-2 rounded ${
    isLoading
      ? isDark
        ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
        : 'bg-slate-300 text-slate-600 cursor-not-allowed'
      : 'bg-blue-600 hover:bg-blue-700 text-white'
  }`}
/>
```

## Checklist de Implementação

Ao criar/modificar componentes:

- [ ] **Backgrounds**: Use `bg-slate-50` (luz) / `bg-slate-900` (escuro) para base
- [ ] **Cards/Containers**: Use `bg-white` (luz) / `bg-slate-800` (escuro)
- [ ] **Inputs**: Use `bg-slate-100` (luz) / `bg-slate-700` (escuro)
- [ ] **Texto principal**: Use `text-slate-900` (luz) / `text-white` (escuro)
- [ ] **Texto normal**: Use `text-slate-800` (luz) / `text-slate-100` (escuro)
- [ ] **Texto muted**: Use `text-slate-600` (luz) / `text-slate-400` (escuro)
- [ ] **Borders**: Use `border-slate-300` (luz) / `border-slate-700` (escuro)
- [ ] **Hover states**: Sempre inverter para cor mais escura (luz) / mais clara (escuro)
- [ ] **Focus states**: Manter `focus:ring-blue-500` em ambos os modos

## Exemplo Completo

```tsx
import { useContext } from 'react';
import { ThemeContext } from '../contexts';

export const MyComponent = () => {
  const { isDark } = useContext(ThemeContext) || { isDark: false };

  return (
    <div className={isDark ? 'bg-slate-900' : 'bg-slate-50'}>
      {/* Card Container */}
      <div
        className={`p-4 rounded-lg border ${
          isDark
            ? 'bg-slate-800 border-slate-700'
            : 'bg-white border-slate-200'
        }`}
      >
        {/* Título */}
        <h2
          className={`font-bold text-lg ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}
        >
          Título
        </h2>

        {/* Descrição */}
        <p
          className={`mt-2 ${
            isDark ? 'text-slate-300' : 'text-slate-700'
          }`}
        >
          Descrição do conteúdo
        </p>

        {/* Input */}
        <input
          className={`w-full mt-4 px-3 py-2 rounded border ${
            isDark
              ? 'bg-slate-700 border-slate-600 text-slate-200'
              : 'bg-white border-slate-300 text-slate-900'
          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          placeholder="Digite algo..."
        />

        {/* Button */}
        <button
          className={`mt-4 w-full py-2 rounded font-semibold transition ${
            isDark
              ? 'bg-blue-700 hover:bg-blue-600 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          Salvar
        </button>
      </div>
    </div>
  );
};
```

## Dicas Importantes

1. **Sempre teste em ambos os modos** - Use o toggle de tema para verificar
2. **Contraste é crítico** - Texto deve ter contraste mínimo de 4.5:1
3. **Hover states** - Sempre inverter para direção oposta (mais escuro em claro, mais claro em escuro)
4. **Inputs**: Usar fundo secundário (`slate-100` claro / `slate-700` escuro)
5. **Focus rings**: Manter sempre `focus:ring-blue-500` para visibility

## Referências

- Palette Tailwind Slate: https://tailwindcss.com/docs/customizing-colors
- WCAG Contrast Requirements: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
