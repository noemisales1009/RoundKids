import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardIcon } from '../components/icons';
import { UserContext } from '../contexts';
import { supabase } from '../supabaseClient';

const ALLOWED_EMAIL_DOMAINS = ['roundikids.com', 'hospital.com.br'];

export const LoginScreen: React.FC = () => {
    const navigate = useNavigate();
    const userContext = useContext(UserContext);
    const { loadUser } = userContext || { loadUser: async () => {} };
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [loginAttempts, setLoginAttempts] = useState(0);
    const [isLockedOut, setIsLockedOut] = useState(false);

    const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePassword = (password: string) => password.length >= 6;

    const isAllowedDomain = (email: string) => {
        const domain = email.split('@')[1]?.toLowerCase();
        return ALLOWED_EMAIL_DOMAINS.includes(domain);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (isLockedOut) {
            alert('Muitas tentativas de login. Tente novamente em alguns minutos.');
            setLoading(false);
            return;
        }

        if (!validateEmail(email)) {
            alert('Por favor, insira um email válido');
            setLoading(false);
            return;
        }

        if (!validatePassword(password)) {
            alert('A senha deve ter pelo menos 6 caracteres');
            setLoading(false);
            return;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password,
        });

        if (error) {
            const newAttempts = loginAttempts + 1;
            setLoginAttempts(newAttempts);

            if (newAttempts >= 5) {
                setIsLockedOut(true);
                setTimeout(() => {
                    setIsLockedOut(false);
                    setLoginAttempts(0);
                }, 15 * 60 * 1000);
            }

            alert('Email ou senha incorretos');
            setLoading(false);
        } else {
            setLoginAttempts(0);
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user) {
                    const userId = session.user.id;
                    const userEmail = session.user.email || '';

                    const { data: existingUser } = await supabase
                        .from('users')
                        .select('*')
                        .eq('id', userId)
                        .maybeSingle();

                    if (!existingUser) {
                        if (!isAllowedDomain(userEmail)) {
                            await supabase.auth.signOut();
                            alert('Seu domínio de email não está autorizado. Contate o administrador.');
                            setLoading(false);
                            return;
                        }

                        const userName = session.user.user_metadata?.name || userEmail.split('@')[0];

                        await supabase.from('users').insert({
                            id: userId,
                            email: userEmail,
                            name: userName,
                            role: 'pendente',
                            access_level: 'restrito'
                        });
                    }
                }

                await loadUser();
            } catch (err) {
                console.error('Erro ao processar login:', err);
            }
            navigate('/dashboard');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-50 dark:bg-slate-950">
            <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-xl shadow-lg max-w-sm w-full m-4">
                <div className="text-center mb-8">
                    <img src="/logo.png" alt="Round Kids" className="w-48 h-48 sm:w-64 sm:h-64 object-contain mx-auto -mb-8 sm:-mb-12" />
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200">Bem-vindo de volta!</h1>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Faça login para continuar.</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu@email.com"
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm sm:text-base text-slate-800 dark:text-slate-200"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="********"
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm sm:text-base text-slate-800 dark:text-slate-200"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || isLockedOut}
                        className={`w-full font-bold py-2 sm:py-3 px-4 rounded-lg transition text-base sm:text-lg flex items-center justify-center gap-2 ${
                            loading || isLockedOut
                                ? 'bg-slate-400 text-white cursor-not-allowed opacity-75'
                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Autenticando...</span>
                            </>
                        ) : isLockedOut ? (
                            'Aguarde antes de tentar novamente'
                        ) : (
                            'Entrar'
                        )}
                    </button>
                </form>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-4 text-center px-4">
                Acesso restrito a profissionais autorizados
            </p>
        </div>
    );
};
