import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MAX_IMAGENS_POR_EXAME, linksDasImagens } from '../lib/examesImagemArquivos';
import { CameraIcon, CloseIcon } from './icons';

// Links assinados das imagens já salvas, recarregados quando a lista de caminhos muda
const useLinks = (caminhos: string[]): Record<string, string> => {
    const [links, setLinks] = useState<Record<string, string>>({});
    const chave = caminhos.join('|');
    useEffect(() => {
        let ativo = true;
        linksDasImagens(caminhos).then(l => { if (ativo) setLinks(l); });
        return () => { ativo = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- `chave` resume a lista de caminhos
    }, [chave]);
    return links;
};

// Imagem em tela cheia, com setas para passar pelas outras imagens do mesmo exame
const Ampliada: React.FC<{ urls: string[]; inicial: number; onClose: () => void }> = ({ urls, inicial, onClose }) => {
    const [i, setI] = useState(inicial);
    const seta = 'absolute top-1/2 -translate-y-1/2 text-white text-2xl font-bold bg-white/20 hover:bg-white/30 w-10 h-10 rounded-full';
    const passar = (e: React.MouseEvent, passo: number) => {
        e.stopPropagation();
        setI(atual => (atual + passo + urls.length) % urls.length);
    };
    return (
        <div className="fixed inset-0 z-[70] bg-black bg-opacity-90 flex justify-center items-center p-2" onClick={onClose}>
            <button type="button" onClick={onClose} aria-label="Fechar" className="absolute top-3 right-3 text-white bg-white/20 hover:bg-white/30 p-2 rounded-full">
                <CloseIcon className="w-5 h-5" />
            </button>
            <img src={urls[i]} alt="Imagem do exame" className="max-w-full max-h-full object-contain" onClick={e => e.stopPropagation()} />
            {urls.length > 1 && (
                <>
                    <button type="button" onClick={e => passar(e, -1)} aria-label="Imagem anterior" className={`${seta} left-3`}>‹</button>
                    <button type="button" onClick={e => passar(e, 1)} aria-label="Próxima imagem" className={`${seta} right-3`}>›</button>
                    <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">{i + 1} de {urls.length}</span>
                </>
            )}
        </div>
    );
};

const miniatura = 'w-16 h-16 rounded-md object-cover border border-slate-300 dark:border-slate-600 bg-slate-200 dark:bg-slate-700';

// Imagens de um exame já salvo: botão "Ver imagens" e miniaturas; clicar em qualquer um amplia.
export const MiniaturasExame: React.FC<{ caminhos: string[] }> = ({ caminhos }) => {
    const links = useLinks(caminhos);
    const [aberta, setAberta] = useState<number | null>(null);
    if (caminhos.length === 0) return null;
    const urls = caminhos.map(c => links[c]).filter(Boolean);
    const abrir = (caminho: string) => setAberta(Math.max(0, urls.indexOf(links[caminho])));
    return (
        <>
            <button
                type="button"
                onClick={() => setAberta(0)}
                disabled={urls.length === 0}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white transition disabled:opacity-50"
            >
                <CameraIcon className="w-4 h-4" />
                {caminhos.length === 1 ? 'Ver imagem' : `Ver imagens (${caminhos.length})`}
            </button>
            <div className="flex flex-wrap gap-2 mt-2">
                {caminhos.map(c => links[c] ? (
                    <button key={c} type="button" onClick={() => abrir(c)} aria-label="Ampliar imagem do exame">
                        <img src={links[c]} alt="Imagem do exame" className={`${miniatura} hover:opacity-80 transition`} />
                    </button>
                ) : (
                    <div key={c} className={miniatura} />
                ))}
            </div>
            {aberta !== null && urls.length > 0 && <Ampliada urls={urls} inicial={aberta} onClose={() => setAberta(null)} />}
        </>
    );
};

interface SeletorProps {
    // Imagens já salvas no exame (só na edição) e o que fazer ao tirar uma delas
    existentes?: string[];
    onRemoverExistente?: (caminho: string) => void;
    // Imagens escolhidas agora, ainda não enviadas
    novas: File[];
    onNovasChange: (arquivos: File[]) => void;
    disabled?: boolean;
}

// Campo do formulário para anexar imagens ao exame. O envio acontece só ao salvar.
export const SeletorImagensExame: React.FC<SeletorProps> = ({ existentes = [], onRemoverExistente, novas, onNovasChange, disabled }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const links = useLinks(existentes);
    const previas = useMemo(() => novas.map(f => URL.createObjectURL(f)), [novas]);
    useEffect(() => () => previas.forEach(u => URL.revokeObjectURL(u)), [previas]);

    const total = existentes.length + novas.length;
    const cheio = total >= MAX_IMAGENS_POR_EXAME;

    const escolher = (e: React.ChangeEvent<HTMLInputElement>) => {
        const escolhidas = Array.from(e.target.files ?? []).filter(f => f.type.startsWith('image/'));
        onNovasChange([...novas, ...escolhidas].slice(0, MAX_IMAGENS_POR_EXAME - existentes.length));
        e.target.value = ''; // permite escolher o mesmo arquivo de novo
    };

    const botaoTirar = 'absolute -top-1.5 -right-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full p-0.5 shadow';

    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Imagens <span className="text-slate-400 font-normal">(opcional, até {MAX_IMAGENS_POR_EXAME})</span>
            </label>
            <div className="flex flex-wrap gap-3 mt-2">
                {existentes.map(c => (
                    <div key={c} className="relative">
                        {links[c] ? <img src={links[c]} alt="Imagem do exame" className={miniatura} /> : <div className={miniatura} />}
                        {onRemoverExistente && (
                            <button type="button" onClick={() => onRemoverExistente(c)} disabled={disabled} aria-label="Tirar imagem" className={botaoTirar}>
                                <CloseIcon className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                ))}
                {novas.map((f, i) => (
                    <div key={previas[i]} className="relative">
                        <img src={previas[i]} alt={f.name} className={miniatura} />
                        <button type="button" onClick={() => onNovasChange(novas.filter((_, j) => j !== i))} disabled={disabled} aria-label="Tirar imagem" className={botaoTirar}>
                            <CloseIcon className="w-3 h-3" />
                        </button>
                    </div>
                ))}
                {!cheio && (
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        disabled={disabled}
                        className="w-16 h-16 rounded-md border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-violet-500 hover:text-violet-500 flex flex-col items-center justify-center gap-0.5 transition disabled:opacity-50"
                    >
                        <CameraIcon className="w-5 h-5" />
                        <span className="text-[10px] font-semibold">Adicionar</span>
                    </button>
                )}
            </div>
            <input ref={inputRef} type="file" accept="image/*" multiple onChange={escolher} className="hidden" />
        </div>
    );
};
