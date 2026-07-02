/**
 * Formata um número para exibição no padrão brasileiro (vírgula como separador decimal).
 * Aceita string ("1.5") ou number (1.5) e retorna "1,5".
 * Valores vazios/nulos retornam string vazia.
 */
export function formatDecimalBR(value: string | number | null | undefined): string {
    if (value === null || value === undefined || value === '') return '';
    return String(value).replace('.', ',');
}
