// Provider local usando JSON + localStorage (implementação atual)
import { AuthProvider, AuthResult, AuthUser } from './types';

const STORAGE_KEY = 'instrutor_plus_auth_user';

export const localAuthProvider: AuthProvider = {
  signInWithGoogle: async (): Promise<AuthResult> => {
    // TODO: Implementar com Firebase/Supabase
    console.warn('[Auth] Google Sign-In não disponível no modo local');
    return {
      success: false,
      error: 'Google Sign-In requer configuração do Firebase ou Supabase'
    };
  },

  signInWithEmail: async (email: string, password: string): Promise<AuthResult> => {
    // TODO: Implementar com Firebase/Supabase
    console.warn('[Auth] Email Sign-In não disponível no modo local');
    return {
      success: false,
      error: 'Email Sign-In requer configuração do Firebase ou Supabase'
    };
  },

  signUp: async (email: string, password: string, displayName?: string): Promise<AuthResult> => {
    // TODO: Implementar com Firebase/Supabase
    console.warn('[Auth] Sign-Up não disponível no modo local');
    return {
      success: false,
      error: 'Sign-Up requer configuração do Firebase ou Supabase'
    };
  },

  signOut: async (): Promise<void> => {
    localStorage.removeItem(STORAGE_KEY);
  },

  getCurrentUser: (): AuthUser | null => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return null;
  },

  onAuthStateChanged: (callback: (user: AuthUser | null) => void): (() => void) => {
    // Simula listener de mudança de auth
    const user = localAuthProvider.getCurrentUser();
    callback(user);
    
    // Retorna função de cleanup
    return () => {};
  }
};
