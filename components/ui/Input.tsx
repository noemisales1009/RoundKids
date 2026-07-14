import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  /** Mensagem de erro inline; deixa a borda vermelha e marca aria-invalid. */
  error?: string;
}

/** Campo de texto padrão: rótulo, erro inline, foco acessível e alvo de toque. */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = '', ...rest }, ref) => {
    const inputId = id || rest.name;
    const errorId = error && inputId ? `${inputId}-error` : undefined;
    return (
      <div>
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={errorId}
          className={
            'block w-full min-h-[44px] rounded-lg border bg-white dark:bg-slate-800 px-3 py-2 ' +
            'text-slate-800 dark:text-slate-200 shadow-sm transition ' +
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ' +
            (error ? 'border-danger-500 ' : 'border-slate-300 dark:border-slate-700 ') +
            className
          }
          {...rest}
        />
        {error && (
          <p id={errorId} className="mt-1 text-xs text-danger-600">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
