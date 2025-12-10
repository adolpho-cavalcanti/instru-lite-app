import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, GraduationCap, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { z } from 'zod';

const emailSchema = z.string().email('Email inválido');
const passwordSchema = z.string().min(6, 'Senha deve ter pelo menos 6 caracteres');
const nomeSchema = z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo');
const cidadeSchema = z.string().min(2, 'Cidade deve ter pelo menos 2 caracteres').max(100, 'Cidade muito longa');
const precoHoraSchema = z.number().min(30, 'Mínimo R$30/hora').max(500, 'Máximo R$500/hora');
const credenciamentoSchema = z.string().min(3, 'Informe o credenciamento DETRAN').max(50, 'Credenciamento muito longo');
const anosExperienciaSchema = z.number().min(0, 'Mínimo 0 anos').max(50, 'Máximo 50 anos');

const CATEGORIAS_HABILITACAO = ['A', 'B', 'AB', 'C', 'D', 'E'] as const;
type CategoriaHabilitacao = typeof CATEGORIAS_HABILITACAO[number];

type AuthMode = 'login' | 'signup';
type UserType = 'aluno' | 'instrutor';

export default function AuthPage() {
  const navigate = useNavigate();
  const { 
    signIn, 
    signUp, 
    signInWithGoogle, 
    currentUser, 
    user, 
    needsProfileCompletion, 
    completeProfile,
    loading 
  } = useAuth();
  
  const [mode, setMode] = useState<AuthMode>('login');
  const [userType, setUserType] = useState<UserType>('aluno');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [cidade, setCidade] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Instructor-specific fields
  const [categoria, setCategoria] = useState<CategoriaHabilitacao>('B');
  const [precoHora, setPrecoHora] = useState(80);
  const [credenciamentoDetran, setCredenciamentoDetran] = useState('');
  const [temVeiculo, setTemVeiculo] = useState(false);
  const [anosExperiencia, setAnosExperiencia] = useState(0);

  // Pre-fill name from Google if available
  useEffect(() => {
    if (needsProfileCompletion && user?.user_metadata?.full_name) {
      setNome(user.user_metadata.full_name);
    }
  }, [needsProfileCompletion, user]);

  // Redirect if already logged in and has complete profile
  useEffect(() => {
    if (currentUser && !needsProfileCompletion) {
      navigate(currentUser.tipo === 'instrutor' ? '/instrutor/home' : '/home', { replace: true });
    }
  }, [currentUser, needsProfileCompletion, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!needsProfileCompletion) {
      const emailResult = emailSchema.safeParse(email);
      if (!emailResult.success) {
        newErrors.email = emailResult.error.errors[0].message;
      }

      const passwordResult = passwordSchema.safeParse(password);
      if (!passwordResult.success) {
        newErrors.password = passwordResult.error.errors[0].message;
      }
    }

    if (mode === 'signup' || needsProfileCompletion) {
      const nomeResult = nomeSchema.safeParse(nome);
      if (!nomeResult.success) {
        newErrors.nome = nomeResult.error.errors[0].message;
      }

      const cidadeResult = cidadeSchema.safeParse(cidade);
      if (!cidadeResult.success) {
        newErrors.cidade = cidadeResult.error.errors[0].message;
      }

      // Instructor-specific validation
      if (userType === 'instrutor') {
        const precoResult = precoHoraSchema.safeParse(precoHora);
        if (!precoResult.success) {
          newErrors.precoHora = precoResult.error.errors[0].message;
        }

        const credResult = credenciamentoSchema.safeParse(credenciamentoDetran);
        if (!credResult.success) {
          newErrors.credenciamentoDetran = credResult.error.errors[0].message;
        }

        const expResult = anosExperienciaSchema.safeParse(anosExperiencia);
        if (!expResult.success) {
          newErrors.anosExperiencia = expResult.error.errors[0].message;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      if (needsProfileCompletion) {
        // Complete profile for OAuth users
        const instrutorData = userType === 'instrutor' ? {
          categoria,
          precoHora,
          credenciamentoDetran,
          temVeiculo,
          anosExperiencia,
        } : undefined;
        
        const { error } = await completeProfile(userType, nome, cidade, instrutorData);
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success('Perfil completo! Bem-vindo ao Drive UP');
      } else if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Email ou senha incorretos');
          } else if (error.message.includes('Email not confirmed')) {
            toast.error('Por favor, confirme seu email antes de fazer login');
          } else {
            toast.error(error.message);
          }
          return;
        }
        toast.success('Login realizado com sucesso!');
      } else {
        const instrutorData = userType === 'instrutor' ? {
          categoria,
          precoHora,
          credenciamentoDetran,
          temVeiculo,
          anosExperiencia,
        } : undefined;

        const { error } = await signUp(email, password, userType, nome, cidade, instrutorData);
        if (error) {
          if (error.message.includes('User already registered')) {
            toast.error('Este email já está cadastrado');
          } else {
            toast.error(error.message);
          }
          return;
        }
        toast.success('Conta criada com sucesso!');
      }
    } catch (err) {
      toast.error('Ocorreu um erro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast.error('Erro ao fazer login com Google');
      }
    } catch (err) {
      toast.error('Ocorreu um erro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Profile completion screen for OAuth users
  if (needsProfileCompletion) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="gradient-hero px-6 pt-12 pb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Car className="w-8 h-8 text-primary-foreground" />
            <h1 className="text-2xl font-bold text-primary-foreground">
              Drive UP
            </h1>
          </div>
          <p className="text-primary-foreground/80 text-sm">
            Complete seu perfil para continuar
          </p>
        </header>

        <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full">
          <div className="bg-card rounded-xl p-4 border border-border mb-6">
            <p className="text-sm text-muted-foreground text-center">
              Olá! Para continuar, precisamos de mais algumas informações.
            </p>
          </div>

          {/* User Type Selection */}
          <div className="mb-6">
            <Label className="text-sm font-medium mb-3 block">Eu sou:</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUserType('aluno')}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                  userType === 'aluno'
                    ? "border-primary bg-accent"
                    : "border-border bg-card hover:border-primary/50"
                )}
              >
                <GraduationCap className={cn(
                  "w-8 h-8",
                  userType === 'aluno' ? "text-primary" : "text-muted-foreground"
                )} />
                <span className={cn(
                  "font-medium",
                  userType === 'aluno' ? "text-primary" : "text-foreground"
                )}>
                  Aluno
                </span>
              </button>

              <button
                type="button"
                onClick={() => setUserType('instrutor')}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                  userType === 'instrutor'
                    ? "border-primary bg-accent"
                    : "border-border bg-card hover:border-primary/50"
                )}
              >
                <Car className={cn(
                  "w-8 h-8",
                  userType === 'instrutor' ? "text-primary" : "text-muted-foreground"
                )} />
                <span className={cn(
                  "font-medium",
                  userType === 'instrutor' ? "text-primary" : "text-foreground"
                )}>
                  Instrutor
                </span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome completo</Label>
              <Input
                id="nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome"
                className={errors.nome ? "border-destructive" : ""}
              />
              {errors.nome && (
                <p className="text-sm text-destructive mt-1">{errors.nome}</p>
              )}
            </div>

            <div>
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                type="text"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                placeholder="Sua cidade"
                className={errors.cidade ? "border-destructive" : ""}
              />
              {errors.cidade && (
                <p className="text-sm text-destructive mt-1">{errors.cidade}</p>
              )}
            </div>

            {/* Instructor-specific fields */}
            {userType === 'instrutor' && (
              <div className="pt-4 border-t border-border">
                <h3 className="text-sm font-medium text-foreground mb-4">
                  Informações profissionais
                </h3>
                <div className="space-y-4">
                  {/* Categoria */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Categoria da habilitação
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIAS_HABILITACAO.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCategoria(cat)}
                          className={cn(
                            "px-4 py-2 rounded-lg border-2 font-medium transition-all",
                            categoria === cat
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-card text-foreground hover:border-primary/50"
                          )}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Credenciamento DETRAN */}
                  <div>
                    <Label htmlFor="credenciamento">Credenciamento DETRAN</Label>
                    <Input
                      id="credenciamento"
                      type="text"
                      value={credenciamentoDetran}
                      onChange={(e) => setCredenciamentoDetran(e.target.value)}
                      placeholder="Ex: DETRAN-SP 123456"
                      className={errors.credenciamentoDetran ? "border-destructive" : ""}
                    />
                    {errors.credenciamentoDetran && (
                      <p className="text-sm text-destructive mt-1">{errors.credenciamentoDetran}</p>
                    )}
                  </div>

                  {/* Anos de experiência */}
                  <div>
                    <Label htmlFor="experiencia">Anos de experiência</Label>
                    <Input
                      id="experiencia"
                      type="number"
                      min="0"
                      max="50"
                      value={anosExperiencia}
                      onChange={(e) => setAnosExperiencia(Number(e.target.value))}
                      placeholder="0"
                      className={errors.anosExperiencia ? "border-destructive" : ""}
                    />
                    {errors.anosExperiencia && (
                      <p className="text-sm text-destructive mt-1">{errors.anosExperiencia}</p>
                    )}
                  </div>

                  {/* Preço hora */}
                  <div>
                    <Label htmlFor="preco">Valor por hora (R$)</Label>
                    <Input
                      id="preco"
                      type="number"
                      min="30"
                      max="500"
                      value={precoHora}
                      onChange={(e) => setPrecoHora(Number(e.target.value))}
                      placeholder="80"
                      className={errors.precoHora ? "border-destructive" : ""}
                    />
                    {errors.precoHora && (
                      <p className="text-sm text-destructive mt-1">{errors.precoHora}</p>
                    )}
                  </div>

                  {/* Tem veículo */}
                  <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
                    <div>
                      <Label htmlFor="veiculo" className="cursor-pointer">Possui veículo próprio?</Label>
                      <p className="text-xs text-muted-foreground">Para aulas práticas</p>
                    </div>
                    <Switch
                      id="veiculo"
                      checked={temVeiculo}
                      onCheckedChange={setTemVeiculo}
                    />
                  </div>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Aguarde...
                </>
              ) : (
                'Continuar'
              )}
            </Button>
          </form>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="gradient-hero px-6 pt-12 pb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Car className="w-8 h-8 text-primary-foreground" />
          <h1 className="text-2xl font-bold text-primary-foreground">
            Drive UP
          </h1>
        </div>
        <p className="text-primary-foreground/80 text-sm">
          Encontre o instrutor ideal para você
        </p>
      </header>

      <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full">
        {/* Mode Toggle */}
        <div className="flex bg-muted rounded-lg p-1 mb-6">
          <button
            onClick={() => setMode('login')}
            className={cn(
              "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors",
              mode === 'login'
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Entrar
          </button>
          <button
            onClick={() => setMode('signup')}
            className={cn(
              "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors",
              mode === 'signup'
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Cadastrar
          </button>
        </div>

        {/* Google Sign In Button */}
        <Button
          type="button"
          variant="outline"
          className="w-full mb-4 gap-2"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continuar com Google
        </Button>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              ou
            </span>
          </div>
        </div>

        {/* User Type Selection (signup only) */}
        {mode === 'signup' && (
          <div className="mb-6">
            <Label className="text-sm font-medium mb-3 block">Eu sou:</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUserType('aluno')}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                  userType === 'aluno'
                    ? "border-primary bg-accent"
                    : "border-border bg-card hover:border-primary/50"
                )}
              >
                <GraduationCap className={cn(
                  "w-8 h-8",
                  userType === 'aluno' ? "text-primary" : "text-muted-foreground"
                )} />
                <span className={cn(
                  "font-medium",
                  userType === 'aluno' ? "text-primary" : "text-foreground"
                )}>
                  Aluno
                </span>
              </button>

              <button
                type="button"
                onClick={() => setUserType('instrutor')}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                  userType === 'instrutor'
                    ? "border-primary bg-accent"
                    : "border-border bg-card hover:border-primary/50"
                )}
              >
                <Car className={cn(
                  "w-8 h-8",
                  userType === 'instrutor' ? "text-primary" : "text-muted-foreground"
                )} />
                <span className={cn(
                  "font-medium",
                  userType === 'instrutor' ? "text-primary" : "text-foreground"
                )}>
                  Instrutor
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div>
                <Label htmlFor="nome">Nome completo</Label>
                <Input
                  id="nome"
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome"
                  className={errors.nome ? "border-destructive" : ""}
                />
                {errors.nome && (
                  <p className="text-sm text-destructive mt-1">{errors.nome}</p>
                )}
              </div>

              <div>
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  type="text"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  placeholder="Sua cidade"
                  className={errors.cidade ? "border-destructive" : ""}
                />
                {errors.cidade && (
                  <p className="text-sm text-destructive mt-1">{errors.cidade}</p>
                )}
              </div>

              {/* Instructor-specific fields */}
              {userType === 'instrutor' && (
                <div className="pt-4 border-t border-border">
                  <h3 className="text-sm font-medium text-foreground mb-4">
                    Informações profissionais
                  </h3>
                  <div className="space-y-4">
                    {/* Categoria */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        Categoria da habilitação
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {CATEGORIAS_HABILITACAO.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setCategoria(cat)}
                            className={cn(
                              "px-4 py-2 rounded-lg border-2 font-medium transition-all",
                              categoria === cat
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-card text-foreground hover:border-primary/50"
                            )}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Credenciamento DETRAN */}
                    <div>
                      <Label htmlFor="credenciamento">Credenciamento DETRAN</Label>
                      <Input
                        id="credenciamento"
                        type="text"
                        value={credenciamentoDetran}
                        onChange={(e) => setCredenciamentoDetran(e.target.value)}
                        placeholder="Ex: DETRAN-SP 123456"
                        className={errors.credenciamentoDetran ? "border-destructive" : ""}
                      />
                      {errors.credenciamentoDetran && (
                        <p className="text-sm text-destructive mt-1">{errors.credenciamentoDetran}</p>
                      )}
                    </div>

                    {/* Anos de experiência */}
                    <div>
                      <Label htmlFor="experiencia">Anos de experiência</Label>
                      <Input
                        id="experiencia"
                        type="number"
                        min="0"
                        max="50"
                        value={anosExperiencia}
                        onChange={(e) => setAnosExperiencia(Number(e.target.value))}
                        placeholder="0"
                        className={errors.anosExperiencia ? "border-destructive" : ""}
                      />
                      {errors.anosExperiencia && (
                        <p className="text-sm text-destructive mt-1">{errors.anosExperiencia}</p>
                      )}
                    </div>

                    {/* Preço hora */}
                    <div>
                      <Label htmlFor="preco">Valor por hora (R$)</Label>
                      <Input
                        id="preco"
                        type="number"
                        min="30"
                        max="500"
                        value={precoHora}
                        onChange={(e) => setPrecoHora(Number(e.target.value))}
                        placeholder="80"
                        className={errors.precoHora ? "border-destructive" : ""}
                      />
                      {errors.precoHora && (
                        <p className="text-sm text-destructive mt-1">{errors.precoHora}</p>
                      )}
                    </div>

                    {/* Tem veículo */}
                    <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
                      <div>
                        <Label htmlFor="veiculo" className="cursor-pointer">Possui veículo próprio?</Label>
                        <p className="text-xs text-muted-foreground">Para aulas práticas</p>
                      </div>
                      <Switch
                        id="veiculo"
                        checked={temVeiculo}
                        onCheckedChange={setTemVeiculo}
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={cn("pr-10", errors.password ? "border-destructive" : "")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive mt-1">{errors.password}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Aguarde...
              </>
            ) : mode === 'login' ? (
              'Entrar'
            ) : (
              'Criar conta'
            )}
          </Button>
        </form>

        {/* Mode switch hint */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          {mode === 'login' ? (
            <>
              Não tem conta?{' '}
              <button
                onClick={() => setMode('signup')}
                className="text-primary hover:underline font-medium"
              >
                Cadastre-se
              </button>
            </>
          ) : (
            <>
              Já tem conta?{' '}
              <button
                onClick={() => setMode('login')}
                className="text-primary hover:underline font-medium"
              >
                Entrar
              </button>
            </>
          )}
        </p>
      </main>

      {/* Footer */}
      <footer className="px-4 py-4 text-center">
        <p className="text-xs text-muted-foreground">
          © 2024 Drive UP • Todos os direitos reservados
        </p>
      </footer>
    </div>
  );
}
