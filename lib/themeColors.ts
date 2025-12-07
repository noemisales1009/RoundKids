/**
 * Paleta de cores padrão para tema claro/escuro
 * Garante consistência em todos os componentes
 */

export const themeColors = {
  // Backgrounds
  bg: {
    primary: {
      light: 'bg-slate-50',
      dark: 'bg-slate-900',
    },
    secondary: {
      light: 'bg-white',
      dark: 'bg-slate-800',
    },
    tertiary: {
      light: 'bg-slate-100',
      dark: 'bg-slate-700',
    },
    hover: {
      light: 'hover:bg-slate-100',
      dark: 'hover:bg-slate-700',
    },
    inputBackground: {
      light: 'bg-white',
      dark: 'bg-slate-700',
    },
  },

  // Text colors
  text: {
    primary: {
      light: 'text-slate-900',
      dark: 'text-white',
    },
    secondary: {
      light: 'text-slate-800',
      dark: 'text-slate-100',
    },
    tertiary: {
      light: 'text-slate-700',
      dark: 'text-slate-200',
    },
    muted: {
      light: 'text-slate-600',
      dark: 'text-slate-400',
    },
    disabled: {
      light: 'text-slate-400',
      dark: 'text-slate-600',
    },
  },

  // Borders
  border: {
    primary: {
      light: 'border-slate-300',
      dark: 'border-slate-700',
    },
    secondary: {
      light: 'border-slate-200',
      dark: 'border-slate-600',
    },
  },

  // Combined classes for common patterns
  input: {
    light: 'bg-white border-slate-300 text-slate-900',
    dark: 'bg-slate-700 border-slate-600 text-slate-200',
  },

  card: {
    light: 'bg-white border-slate-200',
    dark: 'bg-slate-800 border-slate-700',
  },

  button: {
    disabled: {
      light: 'bg-slate-300 text-slate-600 cursor-not-allowed',
      dark: 'bg-slate-700 text-slate-500 cursor-not-allowed',
    },
  },
};

/**
 * Helper para gerar classes condicionais baseadas no tema
 * Uso: getThemeClass(isDark, 'text.primary')
 */
export const getThemeClass = (
  isDark: boolean,
  path: string
): string => {
  const keys = path.split('.');
  let current: any = themeColors;

  for (const key of keys) {
    current = current[key];
    if (!current) return '';
  }

  return isDark ? current.dark : current.light;
};

/**
 * Gera string de classe com fallback
 * Uso: classNameWithTheme(isDark, 'bg.primary', 'extra classes')
 */
export const classNameWithTheme = (
  isDark: boolean,
  colorPath: string,
  extraClasses = ''
): string => {
  const baseClass = getThemeClass(isDark, colorPath);
  return `${baseClass} ${extraClasses}`.trim();
};
