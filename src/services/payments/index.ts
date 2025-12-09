// Ponto de entrada para serviços de pagamento
// Troque o provider aqui quando integrar Stripe

import { localPaymentProvider } from './localPaymentProvider';
import type { PaymentProvider, PaymentIntent, PaymentResult, CreatePaymentParams, StripeConfig } from './types';

// ============================================
// CONFIGURAÇÃO DO PROVIDER
// ============================================
// Para integrar Stripe:
// 1. Instale: npm install @stripe/stripe-js @stripe/react-stripe-js
// 2. Crie stripePaymentProvider.ts com a implementação real
// 3. Troque a linha abaixo para: export const paymentProvider = stripePaymentProvider;
// 4. Configure STRIPE_PUBLISHABLE_KEY no .env ou secrets
// ============================================

export const paymentProvider: PaymentProvider = localPaymentProvider;

// Configuração futura do Stripe (definir quando integrar)
export const stripeConfig: StripeConfig | null = null;
// Exemplo quando integrar:
// export const stripeConfig: StripeConfig = {
//   publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
// };

export type { PaymentProvider, PaymentIntent, PaymentResult, CreatePaymentParams, StripeConfig };
