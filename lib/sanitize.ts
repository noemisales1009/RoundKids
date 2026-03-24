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
