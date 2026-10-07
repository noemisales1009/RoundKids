import { supabase } from '../supabaseClient';

// Imagens anexadas aos exames de imagem do paciente (foto do raio-X, print do laudo...).
// Ficam num bucket privado: só usuário logado envia e vê, sempre por link assinado.
// A linha do exame guarda os caminhos dos arquivos na coluna `imagens`.

export const BUCKET_EXAMES_IMAGEM = 'exames-imagem';
export const MAX_IMAGENS_POR_EXAME = 6;

const MAX_LADO_PX = 2000;        // foto de celular vem muito maior que o necessário para ler na tela
const QUALIDADE_JPEG = 0.85;
const MAX_ORIGINAL_BYTES = 10 * 1024 * 1024; // limite quando a imagem não pôde ser reduzida
const VALIDADE_LINK_S = 3600;

// Nome de arquivo que não se repete. Não usa crypto.randomUUID porque ele só existe em
// endereço seguro (https ou localhost); aberto pelo IP da rede em http, não funciona.
const nomeUnico = (): string => {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
};

// Reduz a imagem para caber em MAX_LADO_PX e converte para JPEG. Devolve null quando o
// navegador não consegue ler o arquivo (formato que ele não abre).
const reduzir = async (arquivo: File): Promise<Blob | null> => {
    try {
        const bitmap = await createImageBitmap(arquivo);
        const escala = Math.min(1, MAX_LADO_PX / Math.max(bitmap.width, bitmap.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(bitmap.width * escala);
        canvas.height = Math.round(bitmap.height * escala);
        const contexto = canvas.getContext('2d');
        if (!contexto) return null;
        contexto.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        bitmap.close();
        return await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', QUALIDADE_JPEG));
    } catch {
        return null;
    }
};

// Envia as imagens e devolve os caminhos gravados. Se uma falhar, desfaz as que já
// subiram e lança o erro: ou o exame fica com todas as imagens escolhidas, ou com nenhuma.
export const enviarImagensDoExame = async (patientId: number | string, arquivos: File[]): Promise<string[]> => {
    const enviados: string[] = [];
    try {
        for (const arquivo of arquivos) {
            const reduzida = await reduzir(arquivo);
            if (!reduzida && arquivo.size > MAX_ORIGINAL_BYTES) {
                throw new Error(`"${arquivo.name}" é grande demais (máximo de 10 MB).`);
            }
            const corpo = reduzida ?? arquivo;
            const extensao = reduzida ? 'jpg' : (arquivo.name.split('.').pop() || 'jpg').toLowerCase();
            const caminho = `${patientId}/${nomeUnico()}.${extensao}`;
            const { error } = await supabase.storage.from(BUCKET_EXAMES_IMAGEM).upload(caminho, corpo, {
                contentType: reduzida ? 'image/jpeg' : arquivo.type || 'image/jpeg',
            });
            if (error) throw new Error(`Não foi possível enviar "${arquivo.name}": ${error.message}`);
            enviados.push(caminho);
        }
        return enviados;
    } catch (err) {
        await apagarImagensDoExame(enviados);
        throw err;
    }
};

// Apaga arquivos do bucket. Falha aqui não trava nada: sobra só um arquivo sem uso.
export const apagarImagensDoExame = async (caminhos: string[]): Promise<void> => {
    if (caminhos.length === 0) return;
    const { error } = await supabase.storage.from(BUCKET_EXAMES_IMAGEM).remove(caminhos);
    if (error) console.error('[exames de imagem] arquivo não apagado', caminhos, error);
};

// Links temporários para exibir as imagens: caminho -> URL. Caminho que falhar fica de fora.
export const linksDasImagens = async (caminhos: string[]): Promise<Record<string, string>> => {
    if (caminhos.length === 0) return {};
    const { data, error } = await supabase.storage.from(BUCKET_EXAMES_IMAGEM).createSignedUrls(caminhos, VALIDADE_LINK_S);
    if (error || !data) {
        console.error('[exames de imagem] links não gerados', error);
        return {};
    }
    const links: Record<string, string> = {};
    data.forEach(d => { if (d.path && d.signedUrl) links[d.path] = d.signedUrl; });
    return links;
};
