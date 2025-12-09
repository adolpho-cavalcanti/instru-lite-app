# Guia de Migração - Instrutor+

Este documento descreve como migrar o app de providers locais (JSON + localStorage) para serviços reais.

## Estrutura Atual

```
src/services/
├── index.ts              # Exportações centrais
├── auth/
│   ├── types.ts          # Interfaces de autenticação
│   ├── localAuthProvider.ts
│   └── index.ts
├── database/
│   ├── types.ts          # Interfaces de banco de dados
│   ├── localDatabaseProvider.ts
│   └── index.ts
└── payments/
    ├── types.ts          # Interfaces de pagamento
    ├── localPaymentProvider.ts
    └── index.ts
```

---

## 🔐 Migração para Google Auth

### Opção 1: Firebase

1. Instale as dependências:
```bash
npm install firebase
```

2. Crie `src/services/auth/firebaseConfig.ts`:
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  // ... outras configs
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

3. Crie `src/services/auth/firebaseAuthProvider.ts`:
```typescript
import { auth } from './firebaseConfig';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged as firebaseOnAuthStateChanged
} from 'firebase/auth';
import { AuthProvider, AuthResult, AuthUser } from './types';

const googleProvider = new GoogleAuthProvider();

export const firebaseAuthProvider: AuthProvider = {
  signInWithGoogle: async (): Promise<AuthResult> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return {
        success: true,
        user: {
          id: result.user.uid,
          email: result.user.email || undefined,
          displayName: result.user.displayName || undefined,
          photoURL: result.user.photoURL || undefined,
          provider: 'google'
        }
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  signInWithEmail: async (email, password): Promise<AuthResult> => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return {
        success: true,
        user: {
          id: result.user.uid,
          email: result.user.email || undefined,
          displayName: result.user.displayName || undefined,
          provider: 'firebase'
        }
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  signUp: async (email, password, displayName): Promise<AuthResult> => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      return {
        success: true,
        user: {
          id: result.user.uid,
          email: result.user.email || undefined,
          displayName: displayName,
          provider: 'firebase'
        }
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  signOut: async () => {
    await auth.signOut();
  },

  getCurrentUser: () => {
    const user = auth.currentUser;
    if (!user) return null;
    return {
      id: user.uid,
      email: user.email || undefined,
      displayName: user.displayName || undefined,
      photoURL: user.photoURL || undefined,
      provider: 'firebase'
    };
  },

  onAuthStateChanged: (callback) => {
    return firebaseOnAuthStateChanged(auth, (user) => {
      if (user) {
        callback({
          id: user.uid,
          email: user.email || undefined,
          displayName: user.displayName || undefined,
          photoURL: user.photoURL || undefined,
          provider: 'firebase'
        });
      } else {
        callback(null);
      }
    });
  }
};
```

4. Atualize `src/services/auth/index.ts`:
```typescript
// Troque esta linha:
import { localAuthProvider } from './localAuthProvider';
export const authProvider = localAuthProvider;

// Por:
import { firebaseAuthProvider } from './firebaseAuthProvider';
export const authProvider = firebaseAuthProvider;
```

### Opção 2: Supabase

Similar ao Firebase, mas usando `@supabase/supabase-js`.

---

## 🗄️ Migração para Firebase Database

1. Crie `src/services/database/firebaseDatabaseProvider.ts` implementando `DatabaseProvider`
2. Use Firestore ou Realtime Database
3. Troque a exportação no index.ts

---

## 💳 Migração para Stripe

1. Instale as dependências:
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

2. Crie `src/services/payments/stripePaymentProvider.ts`:
```typescript
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { PaymentProvider, PaymentResult, CreatePaymentParams } from './types';

let stripePromise: Promise<Stripe | null>;

const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

export const stripePaymentProvider: PaymentProvider = {
  createPaymentIntent: async (params: CreatePaymentParams): Promise<PaymentResult> => {
    // Chame sua API backend para criar o PaymentIntent
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    
    const data = await response.json();
    
    if (data.error) {
      return { success: false, error: data.error };
    }
    
    return {
      success: true,
      paymentIntent: data.paymentIntent
    };
  },

  confirmPayment: async (paymentIntentId: string): Promise<PaymentResult> => {
    const stripe = await getStripe();
    if (!stripe) {
      return { success: false, error: 'Stripe não carregado' };
    }
    
    // Implementar confirmação
    // ...
    
    return { success: true };
  },

  cancelPayment: async (paymentIntentId: string): Promise<PaymentResult> => {
    // Chame sua API backend para cancelar
    return { success: true };
  },

  getPaymentIntent: async (paymentIntentId: string): Promise<PaymentResult> => {
    // Chame sua API backend
    return { success: true };
  }
};
```

3. Configure as variáveis de ambiente:
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

4. No backend (Edge Function), configure a secret key:
```typescript
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
```

---

## ✅ Checklist de Migração

### Autenticação
- [ ] Criar conta no Firebase/Supabase
- [ ] Configurar Google OAuth no Console
- [ ] Criar provider file
- [ ] Atualizar exports
- [ ] Testar login/logout/signup

### Banco de Dados
- [ ] Configurar Firestore/Supabase Database
- [ ] Criar coleções/tabelas
- [ ] Criar provider file
- [ ] Migrar dados do JSON
- [ ] Atualizar exports

### Pagamentos
- [ ] Criar conta Stripe
- [ ] Configurar API Keys
- [ ] Criar provider file
- [ ] Criar Edge Functions para operações seguras
- [ ] Atualizar exports
- [ ] Testar fluxo de pagamento

---

## 🔒 Notas de Segurança

- **NUNCA** coloque secret keys no frontend
- Use Edge Functions ou Cloud Functions para operações sensíveis
- Configure CORS corretamente
- Valide inputs no backend
- Use RLS (Row Level Security) no Supabase
