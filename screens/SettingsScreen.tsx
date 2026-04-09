import React, { useState, useEffect, useRef, useContext } from 'react';
import { CameraIcon } from '../components/icons';
import { UserContext, ThemeContext, NotificationContext } from '../contexts';
import { supabase } from '../supabaseClient';
import { useHeader } from '../hooks';

export const SettingsScreen: React.FC = () => {
    useHeader('Ajustes');
    const { user, updateUser } = useContext(UserContext)!;
    const { theme, toggleTheme } = useContext(ThemeContext)!;
    const { showNotification } = useContext(NotificationContext)!;

    const [name, setName] = useState(user.name);
    const [title, setTitle] = useState(user.title);
    const [sector, setSector] = useState(user.sector || '');
    const [avatarPreview, setAvatarPreview] = useState(user.avatarUrl);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setName(user.name || '');
        setTitle(user.title || '');
        setSector(user.sector || '');
        setAvatarPreview(user.avatarUrl || '');
    }, [user.id, user.name, user.title, user.sector, user.avatarUrl]);

    const handleSave = () => {
        const isDataUrl = /^data:image\//i.test(avatarPreview || '');
        const avatarToSave = isDataUrl ? (user.avatarUrl || '') : avatarPreview;

        updateUser({ name, title, avatarUrl: avatarToSave, sector });
        showNotification({ message: 'Perfil salvo com sucesso!', type: 'success' });
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const configuredBucket = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET;
            const bucketCandidates = [configuredBucket, 'avatars', 'roundfoto'].filter(
                (bucket, index, array): bucket is string => !!bucket && array.indexOf(bucket) === index
            );

            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);

            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session?.user) {
                    throw new Error('Sessão expirada. Faça login novamente para enviar a foto.');
                }

                const fileExt = file.name.split('.').pop();
                const fileName = `avatars/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

                let selectedBucket: string | null = null;
                let lastUploadError: any = null;

                for (const bucket of bucketCandidates) {
                    const { error: uploadError } = await supabase.storage
                        .from(bucket)
                        .upload(fileName, file, {
                            cacheControl: '3600',
                            upsert: false
                        });

                    if (!uploadError) {
                        selectedBucket = bucket;
                        break;
                    }

                    lastUploadError = uploadError;
                    const uploadErrorMessage = (uploadError?.message || '').toLowerCase();
                    if (!uploadErrorMessage.includes('bucket not found')) {
                        throw uploadError;
                    }
                }

                if (!selectedBucket) {
                    throw lastUploadError || new Error('Nenhum bucket válido encontrado para upload.');
                }

                const { data } = supabase.storage
                    .from(selectedBucket)
                    .getPublicUrl(fileName);

                if (data.publicUrl) {
                    setAvatarPreview(data.publicUrl);
                    showNotification({ message: 'Foto enviada com sucesso!', type: 'success' });
                }
            } catch (error: any) {
                const errorMessage = (error?.message || '').toLowerCase();
                if (errorMessage.includes('bucket not found')) {
                    showNotification({
                        message: 'Nenhum bucket encontrado para upload. Crie o bucket "avatars" ou configure VITE_SUPABASE_STORAGE_BUCKET corretamente.',
                        type: 'error'
                    });
                    return;
                }

                const message =
                    error?.message ||
                    error?.error_description ||
                    error?.details ||
                    'Falha ao enviar foto.';

                showNotification({ message: `Erro ao enviar foto: ${message}`, type: 'error' });
            }
        }
    };

    return (
        <div className="space-y-8 max-w-lg mx-auto">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-6">Perfil</h2>
                <div className="space-y-6">
                    <div className="flex justify-center">
                        <div className="relative group">
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="User avatar" className="w-24 h-24 rounded-full object-cover bg-slate-200" />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                                    {(name || 'U').charAt(0).toUpperCase()}
                                </div>
                            )}
                            <button
                                onClick={handleAvatarClick}
                                className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100"
                                aria-label="Mudar foto de perfil"
                            >
                                <CameraIcon className="w-8 h-8 text-white" />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nome</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                            className="mt-1 w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-slate-800 dark:text-slate-200" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Setor</label>
                        <input type="text" value={sector} onChange={(e) => setSector(e.target.value)}
                            className="mt-1 w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-slate-800 dark:text-slate-200" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Cargo</label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                            className="mt-1 w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-slate-800 dark:text-slate-200" />
                    </div>
                    <button onClick={handleSave} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 px-4 rounded-lg transition">
                        Salvar Perfil
                    </button>
                </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">Aparência</h2>
                <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Modo Escuro</span>
                    <button
                        onClick={toggleTheme}
                        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${theme === 'dark' ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
            </div>
        </div>
    );
};
