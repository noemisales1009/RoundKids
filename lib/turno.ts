export type Turno = 'manha' | 'tarde' | 'noite';

// Turno atual no horário de Brasília: manhã 7h-13h, tarde 13h-19h, noite 19h-7h
export const turnoAtualSP = (): Turno => {
    const h = new Date(Date.now() - 3 * 60 * 60 * 1000).getUTCHours();
    if (h >= 7 && h < 13) return 'manha';
    if (h >= 13 && h < 19) return 'tarde';
    return 'noite';
};

// Turno e "dia da evolução" de um instante (ISO), em Brasília. A noite antes das 7h pertence ao dia anterior.
export const turnoEDiaDe = (iso: string): { turno: Turno; dia: string } => {
    const sp = new Date(new Date(iso).getTime() - 3 * 60 * 60 * 1000);
    const h = sp.getUTCHours();
    const turno: Turno = h >= 7 && h < 13 ? 'manha' : h >= 13 && h < 19 ? 'tarde' : 'noite';
    const ref = new Date(sp.getTime() - (h < 7 ? 24 * 60 * 60 * 1000 : 0));
    return { turno, dia: ref.toISOString().split('T')[0] };
};

// Turno de um registro (Diurese/BH): o escolhido no cadastro; registros antigos usam a hora em que foram salvos.
export const turnoDoRegistro = (r: { created_at: string; turno?: string | null }): Turno =>
    r.turno === 'manha' || r.turno === 'tarde' || r.turno === 'noite' ? r.turno : turnoEDiaDe(r.created_at).turno;
