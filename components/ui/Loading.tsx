import React from 'react';

export interface LoadingProps {
  /** spinner (padrão) | dots | skeleton */
  variant?: 'spinner' | 'dots' | 'skeleton';
  size?: 'sm' | 'md' | 'lg';
  /** Texto visível abaixo do indicador. Se ausente, um rótulo sr-only é usado. */
  message?: string;
  className?: string;
}

const sizeMap = { sm: 'w-6 h-6', md: 'w-10 h-10', lg: 'w-14 h-14' } as const;

/**
 * Indicador de carregamento único do app. Substitui LoadingIndicator,
 * LoadingSpinner e os spinners `animate-spin` avulsos. Usa o token `primary`.
 */
export const Loading: React.FC<LoadingProps> = ({
  variant = 'spinner',
  size = 'md',
  message,
  className = '',
}) => (
  <div role="status" aria-live="polite" className={`flex flex-col items-center justify-center gap-3 ${className}`}>
    {variant === 'spinner' && (
      <div className={`relative ${sizeMap[size]}`}>
        <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-700" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-500 border-r-primary-500 animate-spin" />
      </div>
    )}

    {variant === 'dots' && (
      <div className="flex gap-2" aria-hidden="true">
        {[0, 0.15, 0.3].map((d, i) => (
          <span key={i} className="w-2.5 h-2.5 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: `${d}s` }} />
        ))}
      </div>
    )}

    {variant === 'skeleton' && (
      <div className="w-full space-y-2" aria-hidden="true">
        <div className="h-4 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
        <div className="h-4 rounded bg-slate-200 dark:bg-slate-700 animate-pulse w-5/6" />
        <div className="h-4 rounded bg-slate-200 dark:bg-slate-700 animate-pulse w-4/6" />
      </div>
    )}

    {message ? (
      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 text-center">{message}</p>
    ) : (
      <span className="sr-only">Carregando…</span>
    )}
  </div>
);
