// Provider local simulando pagamentos (implementação atual)
import { PaymentProvider, PaymentResult, CreatePaymentParams, PaymentIntent } from './types';

const PAYMENTS_KEY = 'instrutor_plus_payments';

const getStoredPayments = (): PaymentIntent[] => {
  const stored = localStorage.getItem(PAYMENTS_KEY);
  return stored ? JSON.parse(stored) : [];
};

const setStoredPayments = (payments: PaymentIntent[]): void => {
  localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
};

export const localPaymentProvider: PaymentProvider = {
  createPaymentIntent: async (params: CreatePaymentParams): Promise<PaymentResult> => {
    // Simula criação de payment intent
    console.warn('[Payments] Usando provider local - pagamentos são simulados');
    
    const paymentIntent: PaymentIntent = {
      id: `pi_local_${Date.now()}`,
      amount: params.amount,
      currency: params.currency || 'BRL',
      status: 'pending',
      clientSecret: `secret_${Date.now()}_local`
    };

    const payments = getStoredPayments();
    payments.push(paymentIntent);
    setStoredPayments(payments);

    return {
      success: true,
      paymentIntent
    };
  },

  confirmPayment: async (paymentIntentId: string): Promise<PaymentResult> => {
    // Simula confirmação de pagamento (sempre sucesso no modo local)
    console.warn('[Payments] Confirmação de pagamento simulada');
    
    const payments = getStoredPayments();
    const index = payments.findIndex(p => p.id === paymentIntentId);
    
    if (index === -1) {
      return { success: false, error: 'Payment intent não encontrado' };
    }

    payments[index].status = 'succeeded';
    setStoredPayments(payments);

    return {
      success: true,
      paymentIntent: payments[index]
    };
  },

  cancelPayment: async (paymentIntentId: string): Promise<PaymentResult> => {
    const payments = getStoredPayments();
    const index = payments.findIndex(p => p.id === paymentIntentId);
    
    if (index === -1) {
      return { success: false, error: 'Payment intent não encontrado' };
    }

    payments[index].status = 'canceled';
    setStoredPayments(payments);

    return {
      success: true,
      paymentIntent: payments[index]
    };
  },

  getPaymentIntent: async (paymentIntentId: string): Promise<PaymentResult> => {
    const payments = getStoredPayments();
    const payment = payments.find(p => p.id === paymentIntentId);
    
    if (!payment) {
      return { success: false, error: 'Payment intent não encontrado' };
    }

    return {
      success: true,
      paymentIntent: payment
    };
  }
};
