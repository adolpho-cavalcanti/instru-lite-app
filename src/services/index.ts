// Ponto de entrada central para todos os serviços
// Facilita imports e migração futura

export { authProvider } from './auth';
export type { AuthProvider, AuthUser, AuthResult } from './auth';

export { databaseProvider } from './database';
export type { DatabaseProvider, QueryResult } from './database';

export { paymentProvider, stripeConfig } from './payments';
export type { PaymentProvider, PaymentIntent, PaymentResult, CreatePaymentParams, StripeConfig } from './payments';

// ============================================
// GUIA DE MIGRAÇÃO
// ============================================
// 
// Este projeto está estruturado com providers abstratos para facilitar
// a migração futura para Firebase, Supabase ou outros serviços.
//
// ESTRUTURA:
// - src/services/auth/       → Autenticação (Google, Email, etc)
// - src/services/database/   → Banco de dados
// - src/services/payments/   → Pagamentos (Stripe)
//
// PARA MIGRAR:
// 1. Crie um novo provider implementando a interface correspondente
// 2. Troque a exportação no index.ts do serviço
// 3. Nenhuma mudança necessária nos componentes!
//
// EXEMPLOS DE ARQUIVOS A CRIAR:
// - src/services/auth/firebaseAuthProvider.ts
// - src/services/auth/supabaseAuthProvider.ts
// - src/services/database/firebaseDatabaseProvider.ts
// - src/services/database/supabaseDatabaseProvider.ts
// - src/services/payments/stripePaymentProvider.ts
// ============================================
