import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Aplica padding interno padrão (default true). */
  padded?: boolean;
}

/** Superfície padrão do app: fundo, borda, raio e sombra consistentes (claro/escuro). */
export const Card: React.FC<CardProps> = ({ padded = true, className = '', children, ...rest }) => (
  <div
    className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm ${padded ? 'p-4 sm:p-6' : ''} ${className}`}
    {...rest}
  >
    {children}
  </div>
);
