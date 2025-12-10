# Guia de Migração: Vite + React → Next.js 16

## 📋 Visão Geral

Este guia detalha como converter esta aplicação de Vite + React para Next.js 16 com App Router.

---

## 1. Criar Novo Projeto Next.js

```bash
npx create-next-app@latest instrutor-plus --typescript --tailwind --eslint --app --src-dir
cd instrutor-plus
```

Opções recomendadas:
- ✅ TypeScript
- ✅ ESLint
- ✅ Tailwind CSS
- ✅ `src/` directory
- ✅ App Router
- ❌ Turbopack (opcional)

---

## 2. Estrutura de Pastas

### Vite (Atual)
```
src/
├── components/
├── contexts/
├── data/
├── hooks/
├── lib/
├── pages/           # Componentes de página
├── services/
├── types/
├── App.tsx
├── main.tsx
└── index.css
```

### Next.js 16 (Nova)
```
src/
├── app/                    # App Router
│   ├── layout.tsx          # Layout raiz
│   ├── page.tsx            # Página inicial (/)
│   ├── login/
│   │   └── page.tsx
│   ├── cadastro/
│   │   └── page.tsx
│   ├── aluno/
│   │   ├── layout.tsx      # Layout específico aluno
│   │   ├── page.tsx        # Home aluno
│   │   ├── favoritos/
│   │   │   └── page.tsx
│   │   ├── minhas-aulas/
│   │   │   └── page.tsx
│   │   ├── avaliacoes/
│   │   │   └── page.tsx
│   │   ├── perfil/
│   │   │   └── page.tsx
│   │   └── instrutor/
│   │       └── [id]/
│   │           └── page.tsx
│   ├── instrutor/
│   │   ├── layout.tsx
│   │   ├── page.tsx        # Home instrutor
│   │   ├── meus-alunos/
│   │   │   └── page.tsx
│   │   ├── avaliacoes/
│   │   │   └── page.tsx
│   │   ├── perfil/
│   │   │   └── page.tsx
│   │   └── assinatura/
│   │       └── page.tsx
│   ├── pacote/
│   │   └── [id]/
│   │       └── page.tsx
│   └── api/                # API Routes
│       ├── auth/
│       │   ├── login/
│       │   │   └── route.ts
│       │   ├── register/
│       │   │   └── route.ts
│       │   └── google/
│       │       └── route.ts
│       ├── payments/
│       │   └── create-intent/
│       │       └── route.ts
│       └── webhooks/
│           └── stripe/
│               └── route.ts
├── components/             # Copiar diretamente
├── contexts/               # Adaptar para Next.js
├── data/                   # Copiar diretamente
├── hooks/                  # Copiar diretamente
├── lib/                    # Copiar diretamente
├── services/               # Copiar diretamente
├── types/                  # Copiar diretamente
└── styles/
    └── globals.css         # Renomear de index.css
```

---

## 3. Arquivos de Configuração

### next.config.ts
```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

export default nextConfig
```

### tailwind.config.ts
```typescript
// Copiar o conteúdo atual e adicionar:
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // ... resto do config atual
}

export default config
```

### .env.local
```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 4. Layout Raiz (src/app/layout.tsx)

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/contexts/AuthContext'
import { BusinessProvider } from '@/contexts/BusinessContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Instrutor+ | Encontre seu instrutor de direção',
  description: 'Marketplace de instrutores de direção autônomos',
}

// Para usar React Query no App Router
function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BusinessProvider>
          {children}
        </BusinessProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
```

---

## 5. Conversão de Páginas

### Exemplo: Página Inicial (src/app/page.tsx)

```tsx
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export default async function Home() {
  // Server-side: verificar auth via cookies/session
  const cookieStore = await cookies()
  const userType = cookieStore.get('userType')?.value

  if (userType === 'aluno') {
    redirect('/aluno')
  } else if (userType === 'instrutor') {
    redirect('/instrutor')
  }

  redirect('/login')
}
```

### Exemplo: Página de Login (src/app/login/page.tsx)

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await login(email, password)
    if (result.success && result.user) {
      router.push(result.user.tipo === 'aluno' ? '/aluno' : '/instrutor')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleLogin} className="space-y-4 w-full max-w-sm">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha"
        />
        <Button type="submit" className="w-full">
          Entrar
        </Button>
      </form>
    </div>
  )
}
```

### Exemplo: Página com Parâmetro Dinâmico (src/app/aluno/instrutor/[id]/page.tsx)

```tsx
import { notFound } from 'next/navigation'
import InstrutorProfileClient from './InstrutorProfileClient'

interface Props {
  params: Promise<{ id: string }>
}

// Server Component - busca dados
export default async function InstrutorProfilePage({ params }: Props) {
  const { id } = await params
  
  // Aqui você pode buscar dados do servidor
  // const instrutor = await fetchInstrutor(id)
  // if (!instrutor) notFound()

  return <InstrutorProfileClient instrutorId={id} />
}

// Gerar páginas estáticas (opcional)
export async function generateStaticParams() {
  // Retornar lista de IDs para pré-renderizar
  return [
    { id: '1' },
    { id: '2' },
  ]
}
```

---

## 6. Navegação

### Substituir react-router-dom por next/navigation

```tsx
// ANTES (react-router-dom)
import { useNavigate, useParams, Link } from 'react-router-dom'

const navigate = useNavigate()
const { id } = useParams()
navigate('/aluno')
<Link to="/login">Login</Link>

// DEPOIS (next/navigation)
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

const router = useRouter()
const params = useParams()
const id = params.id
router.push('/aluno')
<Link href="/login">Login</Link>
```

### Mapeamento de Rotas

| Vite (react-router) | Next.js (App Router) |
|---------------------|----------------------|
| `/` | `src/app/page.tsx` |
| `/login` | `src/app/login/page.tsx` |
| `/cadastro` | `src/app/cadastro/page.tsx` |
| `/aluno` | `src/app/aluno/page.tsx` |
| `/aluno/favoritos` | `src/app/aluno/favoritos/page.tsx` |
| `/aluno/minhas-aulas` | `src/app/aluno/minhas-aulas/page.tsx` |
| `/aluno/avaliacoes` | `src/app/aluno/avaliacoes/page.tsx` |
| `/aluno/perfil` | `src/app/aluno/perfil/page.tsx` |
| `/aluno/instrutor/:id` | `src/app/aluno/instrutor/[id]/page.tsx` |
| `/instrutor` | `src/app/instrutor/page.tsx` |
| `/instrutor/meus-alunos` | `src/app/instrutor/meus-alunos/page.tsx` |
| `/instrutor/avaliacoes` | `src/app/instrutor/avaliacoes/page.tsx` |
| `/instrutor/perfil` | `src/app/instrutor/perfil/page.tsx` |
| `/instrutor/assinatura` | `src/app/instrutor/assinatura/page.tsx` |
| `/pacote/:id` | `src/app/pacote/[id]/page.tsx` |

---

## 7. API Routes

### Autenticação com Google (src/app/api/auth/google/route.ts)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

// Inicializar Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json()
    
    // Verificar token do Firebase
    const decodedToken = await getAuth().verifyIdToken(idToken)
    
    // Criar sessão customizada ou retornar dados do usuário
    return NextResponse.json({
      success: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 401 }
    )
  }
}
```

### Stripe Payment Intent (src/app/api/payments/create-intent/route.ts)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'brl', metadata } = await request.json()

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe usa centavos
      currency,
      automatic_payment_methods: { enabled: true },
      metadata,
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error) {
    console.error('Stripe error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
```

### Stripe Webhook (src/app/api/webhooks/stripe/route.ts)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        // Atualizar status do pacote no banco
        console.log('Payment succeeded:', paymentIntent.id)
        break
      case 'payment_intent.payment_failed':
        // Lidar com falha
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    )
  }
}
```

---

## 8. Firebase Integration

### Configuração (src/lib/firebase.ts)

```typescript
import { initializeApp, getApps } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Evitar inicialização duplicada
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0]

export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
export const db = getFirestore(app)
export const storage = getStorage(app)
```

### Firebase Auth Provider (src/services/auth/firebaseAuthProvider.ts)

```typescript
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, googleProvider, db } from '@/lib/firebase'
import type { AuthProvider, AuthUser, AuthResult } from './types'

export const firebaseAuthProvider: AuthProvider = {
  async login(email: string, password: string): Promise<AuthResult> {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      const userDoc = await getDoc(doc(db, 'users', result.user.uid))
      const userData = userDoc.data()

      return {
        success: true,
        user: {
          id: result.user.uid,
          email: result.user.email!,
          nome: userData?.nome || result.user.displayName || '',
          tipo: userData?.tipo || 'aluno',
          foto: result.user.photoURL || undefined,
        },
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  async loginWithGoogle(): Promise<AuthResult> {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      
      // Verificar se usuário já existe
      const userDoc = await getDoc(doc(db, 'users', result.user.uid))
      
      if (!userDoc.exists()) {
        // Primeiro login - precisa escolher tipo
        return {
          success: true,
          user: {
            id: result.user.uid,
            email: result.user.email!,
            nome: result.user.displayName || '',
            tipo: 'aluno', // Padrão, pode ser alterado depois
            foto: result.user.photoURL || undefined,
          },
          isNewUser: true,
        }
      }

      const userData = userDoc.data()
      return {
        success: true,
        user: {
          id: result.user.uid,
          email: result.user.email!,
          nome: userData.nome || result.user.displayName || '',
          tipo: userData.tipo,
          foto: result.user.photoURL || undefined,
        },
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  async register(email: string, password: string, userData: Partial<AuthUser>): Promise<AuthResult> {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      
      // Salvar dados adicionais no Firestore
      await setDoc(doc(db, 'users', result.user.uid), {
        email: result.user.email,
        nome: userData.nome,
        tipo: userData.tipo,
        foto: userData.foto || null,
        createdAt: new Date().toISOString(),
      })

      return {
        success: true,
        user: {
          id: result.user.uid,
          email: result.user.email!,
          nome: userData.nome || '',
          tipo: userData.tipo || 'aluno',
          foto: userData.foto,
        },
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  async logout(): Promise<void> {
    await signOut(auth)
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        unsubscribe()
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid))
          const userData = userDoc.data()
          resolve({
            id: user.uid,
            email: user.email!,
            nome: userData?.nome || user.displayName || '',
            tipo: userData?.tipo || 'aluno',
            foto: user.photoURL || undefined,
          })
        } else {
          resolve(null)
        }
      })
    })
  },

  onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        const userData = userDoc.data()
        callback({
          id: user.uid,
          email: user.email!,
          nome: userData?.nome || user.displayName || '',
          tipo: userData?.tipo || 'aluno',
          foto: user.photoURL || undefined,
        })
      } else {
        callback(null)
      }
    })
  },
}
```

---

## 9. Dependências

### Instalar no projeto Next.js

```bash
# Core
npm install next@latest react@latest react-dom@latest

# UI Components (copiar de shadcn)
npx shadcn@latest init
npx shadcn@latest add button card input label toast sonner

# Outras dependências existentes
npm install @tanstack/react-query lucide-react date-fns recharts zod react-hook-form @hookform/resolvers

# Firebase
npm install firebase firebase-admin

# Stripe
npm install stripe @stripe/stripe-js @stripe/react-stripe-js

# Utilitários
npm install class-variance-authority clsx tailwind-merge tailwindcss-animate
```

---

## 10. Middleware de Autenticação (src/middleware.ts)

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rotas que requerem autenticação
const protectedRoutes = ['/aluno', '/instrutor']
const publicRoutes = ['/login', '/cadastro']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Verificar token de sessão (implementar conforme sua auth)
  const sessionToken = request.cookies.get('session')?.value
  const isAuthenticated = !!sessionToken

  // Redirecionar usuários não autenticados
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Redirecionar usuários autenticados para fora das páginas públicas
  if (publicRoutes.includes(pathname)) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

---

## 11. Checklist de Migração

### Fase 1: Setup Inicial
- [ ] Criar projeto Next.js 16
- [ ] Copiar tailwind.config.ts e index.css
- [ ] Configurar variáveis de ambiente
- [ ] Instalar dependências

### Fase 2: Componentes
- [ ] Copiar pasta `components/` inteira
- [ ] Copiar pasta `ui/` (shadcn components)
- [ ] Atualizar imports de navegação (Link, useRouter)

### Fase 3: Páginas
- [ ] Criar estrutura de pastas App Router
- [ ] Converter cada página (adicionar 'use client' onde necessário)
- [ ] Implementar layouts compartilhados

### Fase 4: Contextos e Hooks
- [ ] Adaptar AuthContext para Next.js
- [ ] Adaptar BusinessContext
- [ ] Copiar hooks customizados

### Fase 5: Services
- [ ] Copiar pasta `services/`
- [ ] Criar firebaseAuthProvider.ts
- [ ] Criar stripePaymentProvider.ts
- [ ] Atualizar exports em index.ts

### Fase 6: API Routes
- [ ] Criar rotas de autenticação
- [ ] Criar rotas de pagamento Stripe
- [ ] Configurar webhooks

### Fase 7: Testes e Deploy
- [ ] Testar todas as rotas
- [ ] Testar fluxos de autenticação
- [ ] Testar pagamentos (modo teste Stripe)
- [ ] Deploy na Vercel

---

## 12. Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Verificar tipos
npx tsc --noEmit

# Lint
npm run lint

# Deploy Vercel
npx vercel
```

---

## 📚 Recursos Adicionais

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [App Router Migration Guide](https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration)
- [Firebase Web Setup](https://firebase.google.com/docs/web/setup)
- [Stripe Next.js Integration](https://stripe.com/docs/stripe-js/react)
- [NextAuth.js](https://next-auth.js.org/) (alternativa ao Firebase Auth)
