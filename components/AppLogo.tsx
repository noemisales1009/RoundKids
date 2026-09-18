import React from 'react';

export const AppLogo: React.FC<{ className?: string }> = ({ className = '' }) => (
    <img
        src="/branding/round-braga-solucoes-logo-vector.svg"
        alt="Round Braga Soluções"
        width={1110}
        height={550}
        className={`block h-auto shrink-0 object-contain ${className}`}
    />
);
