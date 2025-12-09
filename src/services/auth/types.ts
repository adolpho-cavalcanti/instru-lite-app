// Tipos abstratos para autenticação - prontos para migração futura
export interface AuthUser {
  id: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  provider: 'local' | 'google' | 'firebase';
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

export interface AuthProvider {
  signInWithGoogle: () => Promise<AuthResult>;
  signInWithEmail: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, displayName?: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  getCurrentUser: () => AuthUser | null;
  onAuthStateChanged: (callback: (user: AuthUser | null) => void) => () => void;
}
