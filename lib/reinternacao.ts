import { supabase } from '../supabaseClient';

// Reinternação: acha, entre os pacientes arquivados, quem pode ser o mesmo
// paciente de um cadastro novo. A comparação é toda feita aqui, em código
// (nenhum nome de paciente é enviado para a IA), e serve só para AVISAR: quem
// decide se é a mesma criança é uma pessoa, conferindo os três identificadores.

export type Semelhanca = 'igual' | 'parecido' | 'diferente' | 'sem_dado';

export interface CadastroAnterior {
    id: string;
    name: string;
    dob: string;
    motherName: string;
    prontuario: string;
    sexo: string;
    dtInternacao: string | null;
    arquivadoEm: string | null;
    motivo: string;
    nome: Semelhanca;
    mae: Semelhanca;
}

export interface InternacaoAnterior {
    id: string;
    dtInternacao: string | null;
    dtSaida: string | null;
    motivoSaida: string | null;
}

const PARTICULAS = new Set(['DE', 'DA', 'DO', 'DAS', 'DOS', 'E']);

export const normalizarNome = (texto?: string | null) =>
    (texto || '')
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toUpperCase()
        .replace(/[^A-Z ]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

const palavras = (nome: string) => nome.split(' ').filter(p => p && !PARTICULAS.has(p));

// "Parecido" = mesmo primeiro nome e a maior parte dos sobrenomes em comum.
// Cobre nome abreviado, sobrenome faltando ou letra trocada em um sobrenome.
export const compararNomes = (a?: string | null, b?: string | null): Semelhanca => {
    const na = normalizarNome(a);
    const nb = normalizarNome(b);
    if (!na || !nb) return 'sem_dado';
    if (na === nb) return 'igual';

    const pa = palavras(na);
    const pb = palavras(nb);
    if (pa.length === 0 || pb.length === 0 || pa[0] !== pb[0]) return 'diferente';

    const emComum = pa.filter(p => pb.includes(p)).length;
    const menor = Math.min(pa.length, pb.length);
    return emComum >= 2 && emComum / menor >= 0.6 ? 'parecido' : 'diferente';
};

/** Cadastros arquivados com a mesma data de nascimento e nome igual ou parecido. */
export const buscarCadastrosAnteriores = async (
    paciente: { id: string | number; name: string; dob: string; motherName?: string },
): Promise<CadastroAnterior[]> => {
    if (!paciente.dob || !normalizarNome(paciente.name)) return [];

    const { data, error } = await supabase
        .from('patients')
        .select('id, name, dob, mother_name, prontuario, sexo, dt_internacao, archived_at, motivo_arquivamento')
        .eq('dob', paciente.dob)
        .not('archived_at', 'is', null)
        .order('archived_at', { ascending: false });
    if (error || !data) return [];

    // Pares que um administrador já marcou como "não é o mesmo paciente".
    // Se a tabela ainda não existir, segue sem esse filtro.
    const { data: vinculos } = await supabase
        .from('paciente_vinculos')
        .select('anterior_ref')
        .eq('novo_ref', String(paciente.id))
        .eq('decisao', 'diferente');
    const descartados = new Set((vinculos || []).map((v: any) => String(v.anterior_ref)));

    return data
        .filter((p: any) => String(p.id) !== String(paciente.id))
        .filter((p: any) => !descartados.has(String(p.id)))
        // Cadastro arquivado por ser duplicado não é uma internação anterior
        .filter((p: any) => !(p.motivo_arquivamento || '').toLowerCase().startsWith('duplicado'))
        .map((p: any): CadastroAnterior => ({
            id: String(p.id),
            name: p.name || '',
            dob: p.dob || '',
            motherName: p.mother_name || '',
            prontuario: p.prontuario || '',
            sexo: p.sexo || '',
            dtInternacao: p.dt_internacao || null,
            arquivadoEm: p.archived_at || null,
            motivo: p.motivo_arquivamento || '',
            nome: compararNomes(paciente.name, p.name),
            mae: compararNomes(limparMae(paciente.motherName), limparMae(p.mother_name)),
        }))
        .filter(c => c.nome === 'igual' || c.nome === 'parecido');
};

// O app mostra "-" quando não há nome da mãe
const limparMae = (nome?: string | null) => (nome && nome.trim() !== '-' ? nome : '');

/** Une o cadastro novo ao anterior. Só administrador; roda inteiro ou não roda. */
export const unirReinternacao = async (novoId: string | number, anteriorId: string) => {
    const { error } = await supabase.rpc('unir_reinternacao', {
        p_novo: String(novoId),
        p_anterior: anteriorId,
    });
    return error ? error.message : null;
};

/** Registra que os dois cadastros NÃO são do mesmo paciente (o aviso some). */
export const marcarComoDiferente = async (novoId: string | number, anteriorId: string) => {
    const { error } = await supabase
        .from('paciente_vinculos')
        .insert({ novo_ref: String(novoId), anterior_ref: anteriorId, decisao: 'diferente' });
    return error ? error.message : null;
};

/** Internações anteriores já confirmadas deste paciente (mais recente primeiro). */
export const buscarInternacoesAnteriores = async (pacienteId: string | number): Promise<InternacaoAnterior[]> => {
    const { data, error } = await supabase
        .from('internacoes_anteriores')
        .select('id, dt_internacao, dt_saida, motivo_saida')
        .eq('patient_ref', String(pacienteId))
        .order('dt_saida', { ascending: false });
    if (error || !data) return [];
    return data.map((i: any) => ({
        id: i.id,
        dtInternacao: i.dt_internacao,
        dtSaida: i.dt_saida,
        motivoSaida: i.motivo_saida,
    }));
};

export type MarcaReinternacao = 'possivel' | 'confirmada';

/**
 * Etiqueta de reinternação de cada paciente da lista de leitos, em três
 * consultas para a lista inteira. "confirmada" tem prioridade sobre "possivel".
 */
export const buscarMarcasDeReinternacao = async (
    pacientes: { id: string | number; name: string; dob: string }[],
): Promise<Record<string, MarcaReinternacao>> => {
    const marcas: Record<string, MarcaReinternacao> = {};
    const ids = pacientes.map(p => String(p.id));
    const datas = [...new Set(pacientes.map(p => p.dob).filter(Boolean))];
    if (ids.length === 0) return marcas;

    const [arquivados, vinculos, confirmadas] = await Promise.all([
        datas.length > 0
            ? supabase
                .from('patients')
                .select('id, name, dob, motivo_arquivamento')
                .in('dob', datas)
                .not('archived_at', 'is', null)
            : Promise.resolve({ data: [] as any[] }),
        supabase.from('paciente_vinculos').select('novo_ref, anterior_ref').in('novo_ref', ids).eq('decisao', 'diferente'),
        supabase.from('internacoes_anteriores').select('patient_ref').in('patient_ref', ids),
    ]);

    const descartados = new Set((vinculos.data || []).map((v: any) => `${v.novo_ref}|${v.anterior_ref}`));
    const candidatos = (arquivados.data || []).filter(
        (a: any) => !(a.motivo_arquivamento || '').toLowerCase().startsWith('duplicado'),
    );

    for (const p of pacientes) {
        const id = String(p.id);
        const achou = candidatos.some((a: any) => {
            if (a.dob !== p.dob || String(a.id) === id || descartados.has(`${id}|${a.id}`)) return false;
            const nome = compararNomes(p.name, a.name);
            return nome === 'igual' || nome === 'parecido';
        });
        if (achou) marcas[id] = 'possivel';
    }
    for (const c of confirmadas.data || []) marcas[String((c as any).patient_ref)] = 'confirmada';

    return marcas;
};
