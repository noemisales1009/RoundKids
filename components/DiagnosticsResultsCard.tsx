import React from 'react';
import { CheckCircleIcon, ClipboardIcon, CloseIcon } from '../components/icons';

interface DiagnosticResult {
    id: string;
    opcao_label: string;
    texto_digitado?: string;
    status: 'resolvido' | 'nao_resolvido' | 'arquivado';
    nome_criador?: string;
    nome_arquivador?: string;
    data_criacao?: string;
    data_arquivamento?: string;
    motivo_arquivamento?: string;
    arquivado?: boolean;
}

interface DiagnosticsResultsCardProps {
    diagnostics: DiagnosticResult[];
    resolvedDiagnostics?: DiagnosticResult[];
    archivedDiagnostics?: DiagnosticResult[];
    isDarkMode?: boolean;
}

const DiagnosticsResultsCard: React.FC<DiagnosticsResultsCardProps> = ({
    diagnostics,
    resolvedDiagnostics = [],
    archivedDiagnostics = [],
    isDarkMode = false,
}) => {
    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            }).format(date);
        } catch {
            return dateString;
        }
    };

    const cardBg = isDarkMode ? 'bg-gray-800' : 'bg-white';
    const textColor = isDarkMode ? 'text-gray-100' : 'text-gray-900';
    const borderColor = isDarkMode ? 'border-gray-700' : 'border-gray-200';
    const subtleText = isDarkMode ? 'text-gray-400' : 'text-gray-600';
    const activeBg = isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50';
    const resolvedBg = isDarkMode ? 'bg-green-900/30' : 'bg-green-50';
    const archivedBg = isDarkMode ? 'bg-gray-900/50' : 'bg-gray-100';

    return (
        <div className="space-y-4">
            {/* Diagnósticos Ativos */}
            {diagnostics.length > 0 && (
                <div className={`${cardBg} rounded-lg border ${borderColor} p-4`}>
                    <h3 className={`${textColor} font-semibold mb-3 flex items-center gap-2`}>
                        <ClipboardIcon className="w-5 h-5 text-blue-500" />
                        Diagnósticos Ativos
                    </h3>
                    <div className="space-y-2">
                        {diagnostics.map((diagnostic) => (
                            <div
                                key={diagnostic.id}
                                className={`${activeBg} rounded-lg p-3 border ${borderColor}`}
                            >
                                <p className={`${textColor} font-medium`}>
                                    {diagnostic.opcao_label || 'Diagnóstico sem título'}
                                </p>
                                {diagnostic.texto_digitado && (
                                    <p className={`${subtleText} text-sm mt-1`}>
                                        Observação: {diagnostic.texto_digitado}
                                    </p>
                                )}
                                <div className={`${subtleText} text-xs mt-2 space-y-1`}>
                                    <p>👤 Criado por: {diagnostic.nome_criador || 'Desconhecido'}</p>
                                    <p>📅 Data: {formatDate(diagnostic.data_criacao)}</p>
                                    <p className="inline-block mt-1 px-2 py-1 bg-yellow-600/20 rounded text-yellow-500">
                                        Status: {diagnostic.status === 'nao_resolvido' ? 'Não Resolvido' : diagnostic.status}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Diagnósticos Resolvidos */}
            {resolvedDiagnostics.length > 0 && (
                <div className={`${cardBg} rounded-lg border ${borderColor} p-4`}>
                    <h3 className={`${textColor} font-semibold mb-3 flex items-center gap-2`}>
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        Diagnósticos Resolvidos
                    </h3>
                    <div className="space-y-2">
                        {resolvedDiagnostics.map((diagnostic) => (
                            <div
                                key={diagnostic.id}
                                className={`${resolvedBg} rounded-lg p-3 border ${borderColor}`}
                            >
                                <p className={`${textColor} font-medium line-through opacity-75`}>
                                    {diagnostic.opcao_label || 'Diagnóstico sem título'}
                                </p>
                                {diagnostic.texto_digitado && (
                                    <p className={`${subtleText} text-sm mt-1`}>
                                        Observação: {diagnostic.texto_digitado}
                                    </p>
                                )}
                                <div className={`${subtleText} text-xs mt-2 space-y-1`}>
                                    <p>👤 Criado por: {diagnostic.nome_criador || 'Desconhecido'}</p>
                                    <p>📅 Data: {formatDate(diagnostic.data_criacao)}</p>
                                    <p className="inline-block mt-1 px-2 py-1 bg-green-600/20 rounded text-green-500">
                                        ✓ Resolvido
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Diagnósticos Arquivados */}
            {archivedDiagnostics.length > 0 && (
                <div className={`${cardBg} rounded-lg border ${borderColor} p-4`}>
                    <h3 className={`${textColor} font-semibold mb-3 flex items-center gap-2`}>
                        <CloseIcon className="w-5 h-5 text-red-500" />
                        Diagnósticos Arquivados
                    </h3>
                    <div className="space-y-2">
                        {archivedDiagnostics.map((diagnostic) => (
                            <div
                                key={diagnostic.id}
                                className={`${archivedBg} rounded-lg p-3 border ${borderColor}`}
                            >
                                <p className={`${textColor} font-medium opacity-50`}>
                                    {diagnostic.opcao_label || 'Diagnóstico sem título'}
                                </p>
                                {diagnostic.texto_digitado && (
                                    <p className={`${subtleText} text-sm mt-1`}>
                                        Observação: {diagnostic.texto_digitado}
                                    </p>
                                )}
                                <div className={`${subtleText} text-xs mt-2 space-y-1`}>
                                    <p>👤 Criado por: {diagnostic.nome_criador || 'Desconhecido'}</p>
                                    <p>📅 Criação: {formatDate(diagnostic.data_criacao)}</p>
                                    <p>📅 Arquivado: {formatDate(diagnostic.data_arquivamento)}</p>
                                    <p>👤 Arquivado por: {diagnostic.nome_arquivador || 'Desconhecido'}</p>
                                    {diagnostic.motivo_arquivamento && (
                                        <p className="mt-2 italic">
                                            Motivo: {diagnostic.motivo_arquivamento}
                                        </p>
                                    )}
                                    <p className="inline-block mt-1 px-2 py-1 bg-red-600/20 rounded text-red-500">
                                        Arquivado
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Vazio */}
            {diagnostics.length === 0 &&
                resolvedDiagnostics.length === 0 &&
                archivedDiagnostics.length === 0 && (
                    <div
                        className={`${cardBg} rounded-lg border-2 border-dashed ${borderColor} p-8 text-center`}
                    >
                        <ClipboardIcon className={`w-12 h-12 ${subtleText} mx-auto mb-2 opacity-50`} />
                        <p className={`${subtleText}`}>Nenhum diagnóstico encontrado</p>
                    </div>
                )}
        </div>
    );
};

export default DiagnosticsResultsCard;
