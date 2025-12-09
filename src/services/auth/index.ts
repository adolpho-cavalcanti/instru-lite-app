// Ponto de entrada para serviços de autenticação
// Troque o provider aqui quando migrar para Firebase/Supabase

import { localAuthProvider } from './localAuthProvider';
import type { AuthProvider, AuthUser, AuthResult } from './types';

// ============================================
// CONFIGURAÇÃO DO PROVIDER
// ============================================
// Para migrar para Firebase:
// 1. Crie firebaseAuthProvider.ts
// 2. Troque a linha abaixo para: export const authProvider = firebaseAuthProvider;
//
// Para migrar para Supabase:
// 1. Crie supabaseAuthProvider.ts
// 2. Troque a linha abaixo para: export const authProvider = supabaseAuthProvider;
// ============================================

export const authProvider: AuthProvider = localAuthProvider;

export type { AuthProvider, AuthUser, AuthResult };
