import React from 'react';

export interface LoadingIndicatorProps {
  type?: 'spinner' | 'dots' | 'skeleton' | 'pulse' | 'progress';
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
  type = 'spinner', 
  message = 'Carregando...',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      {type === 'spinner' && (
        <div className={`relative ${sizeClasses[size]}`}>
          <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-700"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-500 animate-spin"></div>
        </div>
      )}

      {type === 'dots' && (
        <div className="flex space-x-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0.3s' }}></div>
        </div>
      )}

      {type === 'skeleton' && (
        <div className="space-y-2 w-full px-4">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-5/6"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-4/6"></div>
        </div>
      )}

      {type === 'pulse' && (
        <div className={`${sizeClasses[size]} rounded-full bg-linear-to-r from-blue-400 to-purple-500 animate-pulse`}></div>
      )}

      {type === 'progress' && (
        <div className="w-32 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-linear-to-r from-blue-500 to-purple-500 animate-pulse" style={{
            width: '70%',
            animation: 'progress 1.5s ease-in-out infinite'
          }}></div>
        </div>
      )}

      {message && (
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 text-center">
          {message}
        </p>
      )}

      <style>{`
        @keyframes progress {
          0% { width: 10%; }
          50% { width: 80%; }
          100% { width: 10%; }
        }
      `}</style>
    </div>
  );
};
