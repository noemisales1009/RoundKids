import React, { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { UserContext } from '../contexts';
import { User } from '../types';
import { INITIAL_USER } from '../constants';
import { supabase } from '../supabaseClient';
import { sanitizeText } from '../lib/sanitize';

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User>(INITIAL_USER);
    const [isLoading, setIsLoading] = useState(true);

    const getAvatarUrl = (foto?: string | null) => {
        if (!foto) return '';
        if (/^data:image\//i.test(foto)) return foto;
        if (/^https?:\/\//i.test(foto)) return foto;

        const bucketName = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'avatars';
        const { data } = supabase.storage.from(bucketName).getPublicUrl(foto);
        return data?.publicUrl || '';
    };

    const mapDbUserToAppUser = (data: any): User => ({
        id: data.id,
        name: data.name || '',
        title: data.role || '',
        avatarUrl: getAvatarUrl(data.foto),
        sector: data.sector || '',
        access_level: (data.access_level || 'geral') as 'adm' | 'geral',
    });

    const loadUser = async (sessionOverride?: Session | null) => {
        try {
            setIsLoading(true);

            // 1. Check for Supabase Auth Session
            let session = sessionOverride;
            let sessionError: any = null;

            if (sessionOverride === undefined) {
                const sessionResult = await supabase.auth.getSession();
                session = sessionResult.data.session;
                sessionError = sessionResult.error;
            }


            if (sessionError) {
                const message = String(sessionError?.message || '');
                const isInvalidRefreshToken =
                    /Invalid Refresh Token/i.test(message) || /Refresh Token Not Found/i.test(message);

                if (isInvalidRefreshToken) {
                    await supabase.auth.signOut({ scope: 'local' });
                    setUser(INITIAL_USER);
                } else {
                    console.error('[LOADUSER] Erro ao obter sessão:', sessionError);
                }
                setIsLoading(false);
                return;
            }

            if (session?.user) {

                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', session.user.id)
                    .maybeSingle();


                if (data) {

                    const dbUser = mapDbUserToAppUser(data);
                    setUser(dbUser);
                } else if (error) {
                    console.error('[LOADUSER] Erro ao carregar usuário:', error);
                } else {

                    const fallbackName =
                        session.user.user_metadata?.name ||
                        session.user.email?.split('@')[0] ||
                        'Usuário';

                    const { data: upsertedUser, error: upsertError } = await supabase
                        .from('users')
                        .upsert({
                            id: session.user.id,
                            email: session.user.email,
                            name: fallbackName,
                            role: 'Médica',
                            access_level: 'geral',
                            updated_at: new Date().toISOString()
                        }, { onConflict: 'id' })
                        .select('*')
                        .maybeSingle();

                    if (upsertError) {
                        console.error('[LOADUSER] Erro ao auto-criar usuário em public.users:', upsertError);
                        setUser({
                            id: session.user.id,
                            name: fallbackName,
                            title: 'Médica',
                            avatarUrl: '',
                            sector: '',
                            access_level: 'geral'
                        });
                    } else if (upsertedUser) {
                        setUser(mapDbUserToAppUser(upsertedUser));
                    }
                }
            } else {
                setUser(INITIAL_USER);
            }
        } catch (error) {
            console.error('[LOADUSER] Erro geral:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadUser();
    }, []);

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                loadUser(session);
            }

            if (event === 'SIGNED_OUT') {
                setUser(INITIAL_USER);
                setIsLoading(false);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const updateUser = async (userData: Partial<User>): Promise<{ success: boolean; error?: string }> => {
        const newUser = { ...user, ...userData };
        setUser(newUser);

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            const { error } = await supabase.from('users').upsert({
                id: session.user.id,
                name: sanitizeText(newUser.name, 100),
                role: sanitizeText(newUser.title, 100),
                foto: newUser.avatarUrl,
                sector: sanitizeText(newUser.sector || '', 100),
                email: session.user.email,
                updated_at: new Date().toISOString()
            });
            if (error) {
                console.error('[updateUser] Erro ao salvar no Supabase:', error);
                return { success: false, error: error.message };
            }
        }
        return { success: true };
    };

    return (
        <UserContext.Provider value={{ user, isLoading, updateUser, loadUser }}>
            {children}
        </UserContext.Provider>
    );
};
