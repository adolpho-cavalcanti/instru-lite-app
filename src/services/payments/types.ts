// Tipos abstratos para pagamentos - prontos para migração futura (Stripe)
export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  clientSecret?: string;
}

export interface CreatePaymentParams {
  amount: number;
  currency?: string;
  description?: string;
  metadata?: Record<string, string>;
}

export interface PaymentResult {
  success: boolean;
  paymentIntent?: PaymentIntent;
  error?: string;
}

export interface PaymentProvider {
  createPaymentIntent: (params: CreatePaymentParams) => Promise<PaymentResult>;
  confirmPayment: (paymentIntentId: string) => Promise<PaymentResult>;
  cancelPayment: (paymentIntentId: string) => Promise<PaymentResult>;
  getPaymentIntent: (paymentIntentId: string) => Promise<PaymentResult>;
}

// Tipos para Stripe (quando integrar)
export interface StripeConfig {
  publishableKey: string;
  // secretKey é usado apenas no backend
}
