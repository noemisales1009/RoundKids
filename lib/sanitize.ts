/**
 * Escapa um valor para interpolação segura em HTML (defesa contra XSS).
 * Use ao montar strings HTML manualmente (ex.: document.write de PDFs de
 * impressão), onde o React NÃO está protegendo a saída. Converte os
 * caracteres especiais em entidades para que nunca sejam interpretados
 * como marcação.
 */
export function escapeHtml(value: unknown): string {
    if (value === null || value === undefined) return '';
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Sanitiza texto de input do usuário antes de enviar ao banco.
 * Remove tags HTML, trim whitespace, e limita tamanho.
 */
export function sanitizeText(input: string | null | undefined, maxLength = 1000): string {
    if (!input) return '';
    return input
        .replace(/<[^>]*>/g, '')   // Remove tags HTML
        .replace(/[<>]/g, '')      // Remove < > soltos
        .trim()
        .slice(0, maxLength);
}

/**
 * Sanitiza texto, retornando null se vazio (para campos opcionais).
 */
export function sanitizeTextOrNull(input: string | null | undefined, maxLength = 1000): string | null {
    if (!input) return null;
    const cleaned = sanitizeText(input, maxLength);
    return cleaned.length > 0 ? cleaned : null;
}

/**
 * Sanitiza um objeto, aplicando sanitizeText em todos os campos string.
 * Campos não-string são mantidos como estão.
 */
export function sanitizePayload<T extends Record<string, unknown>>(payload: T, maxLength = 1000): T {
    const sanitized = { ...payload };
    for (const key in sanitized) {
        const value = sanitized[key];
        if (typeof value === 'string') {
            (sanitized as Record<string, unknown>)[key] = sanitizeText(value, maxLength);
        }
    }
    return sanitized;
}
