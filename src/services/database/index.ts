// Ponto de entrada para serviços de banco de dados
// Troque o provider aqui quando migrar para Firebase/Supabase

import { localDatabaseProvider } from './localDatabaseProvider';
import type { DatabaseProvider, QueryResult } from './types';

// ============================================
// CONFIGURAÇÃO DO PROVIDER
// ============================================
// Para migrar para Firebase:
// 1. Crie firebaseDatabaseProvider.ts
// 2. Troque a linha abaixo para: export const databaseProvider = firebaseDatabaseProvider;
//
// Para migrar para Supabase:
// 1. Crie supabaseDatabaseProvider.ts
// 2. Troque a linha abaixo para: export const databaseProvider = supabaseDatabaseProvider;
// ============================================

export const databaseProvider: DatabaseProvider = localDatabaseProvider;

export type { DatabaseProvider, QueryResult };
