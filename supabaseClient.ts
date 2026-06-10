
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local');
}

// Distingue logout intencional (botão "Sair") de sessão expirada,
// para a tela de "Sessão expirada" não aparecer em logout manual.
let manualSignOutRequested = false;
export const markManualSignOut = () => { manualSignOutRequested = true; };
export const consumeManualSignOut = () => {
    const wasManual = manualSignOutRequested;
    manualSignOutRequested = false;
    return wasManual;
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
        headers: {
            'X-Client-Info': 'roundkids-web',
            'X-Requested-With': 'XMLHttpRequest',
        },
    },
    auth: {
        flowType: 'pkce',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
    },
});
