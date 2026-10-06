import React, { useEffect, useRef, useState } from 'react';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import workerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';
import { supabase } from '../supabaseClient';
import { Protocolo } from '../lib/typesafe/protocolosRelevantes';
import { JanelaProtocolo, AvisoProtocolo } from './JanelaProtocolo';

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

interface Props {
    protocolo: Protocolo;
    // Página em que a leitura começa (trecho achado pela busca). Padrão: a primeira.
    paginaInicial?: number;
    onClose: () => void;
}

const BUCKET = 'protocolos';
const VALIDADE_LINK_S = 600;
const LARGURA_MAX = 900; // px

// Leitura do protocolo dentro do app. As páginas são desenhadas como imagem, sem a barra
// do leitor de PDF do navegador: não há botão de baixar nem de imprimir, e o endereço do
// arquivo não aparece para o usuário. Isso dificulta a cópia, mas não a impede: quem vê a
// tela ainda pode fotografar ou capturar a imagem.
export const LeitorProtocolo: React.FC<Props> = ({ protocolo, paginaInicial = 1, onClose }) => {
    const [paginas, setPaginas] = useState(0);
    const [estado, setEstado] = useState<'carregando' | 'pronto' | 'erro'>('carregando');
    const areaRef = useRef<HTMLDivElement>(null);
    const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
    const docRef = useRef<pdfjs.PDFDocumentProxy | null>(null);

    // Abre o documento
    useEffect(() => {
        let ativo = true;
        let tarefa: pdfjs.PDFDocumentLoadingTask | null = null;
        (async () => {
            const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(protocolo.arquivo_path, VALIDADE_LINK_S);
            if (!ativo) return;
            if (error || !data?.signedUrl) {
                console.error('[protocolos] não abriu', protocolo.arquivo_path, error);
                return setEstado('erro');
            }
            try {
                tarefa = pdfjs.getDocument({ url: data.signedUrl });
                const doc = await tarefa.promise;
                if (!ativo) return;
                docRef.current = doc;
                setPaginas(doc.numPages);
            } catch (err) {
                console.error('[protocolos] PDF inválido', protocolo.arquivo_path, err);
                if (ativo) setEstado('erro');
            }
        })();
        return () => {
            ativo = false;
            docRef.current = null;
            tarefa?.destroy();
        };
    }, [protocolo.arquivo_path]);

    // Desenha as páginas em ordem, uma de cada vez. A rolagem até a página inicial acontece
    // depois que as anteriores já têm tamanho, para a posição não sair do lugar.
    useEffect(() => {
        const doc = docRef.current;
        if (!doc || paginas === 0) return;
        let ativo = true;
        (async () => {
            const largura = Math.min((areaRef.current?.clientWidth ?? LARGURA_MAX) - 32, LARGURA_MAX);
            const densidade = window.devicePixelRatio || 1;
            try {
                for (let n = 1; n <= paginas && ativo; n++) {
                    const canvas = canvasRefs.current[n - 1];
                    const contexto = canvas?.getContext('2d');
                    if (!canvas || !contexto) continue;
                    const pagina = await doc.getPage(n);
                    const escala = largura / pagina.getViewport({ scale: 1 }).width;
                    const viewport = pagina.getViewport({ scale: escala * densidade });
                    canvas.width = Math.floor(viewport.width);
                    canvas.height = Math.floor(viewport.height);
                    canvas.style.width = `${Math.floor(viewport.width / densidade)}px`;
                    await pagina.render({ canvasContext: contexto, viewport }).promise;
                    if (!ativo) return;
                    if (n === 1) setEstado('pronto');
                    if (n === paginaInicial && n > 1) canvas.scrollIntoView({ block: 'start' });
                }
            } catch (err) {
                // Fechar o leitor no meio do desenho cancela a página em andamento: não é erro.
                if (ativo) {
                    console.error('[protocolos] falha ao desenhar', protocolo.arquivo_path, err);
                    setEstado('erro');
                }
            }
        })();
        return () => { ativo = false; };
    }, [paginas, paginaInicial, protocolo.arquivo_path]);

    return (
        <JanelaProtocolo titulo={protocolo.titulo} onClose={onClose} areaRef={areaRef}>
            {estado === 'carregando' && <AvisoProtocolo>Carregando protocolo…</AvisoProtocolo>}
            {estado === 'erro' && <AvisoProtocolo>Não foi possível abrir o protocolo.</AvisoProtocolo>}
            <div className="flex flex-col items-center gap-3">
                {Array.from({ length: paginas }, (_, i) => (
                    <canvas
                        key={i}
                        ref={el => { canvasRefs.current[i] = el; }}
                        className="max-w-full bg-white shadow-lg"
                    />
                ))}
            </div>
        </JanelaProtocolo>
    );
};
