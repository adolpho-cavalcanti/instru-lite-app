import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Car, GraduationCap, Loader2 } from 'lucide-react';

type UserType = 'aluno' | 'instrutor';
type CategoriaHabilitacao = 'A' | 'B' | 'AB' | 'C' | 'D' | 'E';

interface InstrutorForm {
  credenciamentoDetran: string;
  categoria: CategoriaHabilitacao;
  anosExperiencia: number;
  precoHora: number;
  bairrosAtendimento: string;
  temVeiculo: boolean;
  bio: string;
}

export default function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup fields
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [nome, setNome] = useState('');
  const [cidade, setCidade] = useState('');
  const [userType, setUserType] = useState<UserType>('aluno');
  
  // Instrutor specific fields
  const [instrutorForm, setInstrutorForm] = useState<InstrutorForm>({
    credenciamentoDetran: '',
    categoria: 'B',
    anosExperiencia: 0,
    precoHora: 80,
    bairrosAtendimento: '',
    temVeiculo: true,
    bio: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error('Preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Email ou senha incorretos');
        } else {
          toast.error(error.message);
        }
        return;
      }

      toast.success('Login realizado com sucesso!');
      // Navigation will be handled by auth state change
    } catch (error: any) {
      toast.error('Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupEmail || !signupPassword || !nome || !cidade) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (signupPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (userType === 'instrutor') {
      if (!instrutorForm.credenciamentoDetran) {
        toast.error('Preencha o credenciamento DETRAN');
        return;
      }
    }

    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            nome,
            cidade,
            tipo: userType
          }
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          toast.error('Este email já está cadastrado');
        } else {
          toast.error(authError.message);
        }
        return;
      }

      if (!authData.user) {
        toast.error('Erro ao criar conta');
        return;
      }

      // Create profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          tipo: userType,
          nome,
          cidade
        })
        .select()
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
        toast.error('Erro ao criar perfil');
        return;
      }

      // Create type-specific record
      if (userType === 'instrutor') {
        const bairros = instrutorForm.bairrosAtendimento
          .split(',')
          .map(b => b.trim())
          .filter(b => b);

        const { error: instrutorError } = await supabase
          .from('instrutores')
          .insert({
            profile_id: profileData.id,
            credenciamento_detran: instrutorForm.credenciamentoDetran,
            categoria: instrutorForm.categoria,
            anos_experiencia: instrutorForm.anosExperiencia,
            preco_hora: instrutorForm.precoHora,
            bairros_atendimento: bairros,
            tem_veiculo: instrutorForm.temVeiculo,
            bio: instrutorForm.bio || null
          });

        if (instrutorError) {
          console.error('Instrutor error:', instrutorError);
          toast.error('Erro ao criar dados do instrutor');
          return;
        }
      } else {
        const { error: alunoError } = await supabase
          .from('alunos')
          .insert({
            profile_id: profileData.id
          });

        if (alunoError) {
          console.error('Aluno error:', alunoError);
          toast.error('Erro ao criar dados do aluno');
          return;
        }
      }

      toast.success('Conta criada com sucesso!');
      // Navigation will be handled by auth state change
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error('Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Car className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl font-bold">Instrutor+</CardTitle>
          </div>
          <CardDescription>
            Plataforma de instrutores de direção
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'signup')}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Cadastrar</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Senha</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    'Entrar'
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                {/* User Type Selection */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={userType === 'aluno' ? 'default' : 'outline'}
                    className="h-auto py-4 flex flex-col gap-2"
                    onClick={() => setUserType('aluno')}
                  >
                    <GraduationCap className="h-6 w-6" />
                    <span>Sou Aluno</span>
                  </Button>
                  <Button
                    type="button"
                    variant={userType === 'instrutor' ? 'default' : 'outline'}
                    className="h-auto py-4 flex flex-col gap-2"
                    onClick={() => setUserType('instrutor')}
                  >
                    <Car className="h-6 w-6" />
                    <span>Sou Instrutor</span>
                  </Button>
                </div>

                {/* Common Fields */}
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome completo</Label>
                  <Input
                    id="nome"
                    placeholder="Seu nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    placeholder="São Paulo"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Senha</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Instrutor Fields */}
                {userType === 'instrutor' && (
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-medium text-sm text-muted-foreground">
                      Dados do Instrutor
                    </h3>

                    <div className="space-y-2">
                      <Label htmlFor="credenciamento">Credenciamento DETRAN</Label>
                      <Input
                        id="credenciamento"
                        placeholder="ABC-123456"
                        value={instrutorForm.credenciamentoDetran}
                        onChange={(e) => setInstrutorForm(f => ({ ...f, credenciamentoDetran: e.target.value }))}
                        disabled={loading}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Categoria</Label>
                        <Select
                          value={instrutorForm.categoria}
                          onValueChange={(v) => setInstrutorForm(f => ({ ...f, categoria: v as CategoriaHabilitacao }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A">A (Moto)</SelectItem>
                            <SelectItem value="B">B (Carro)</SelectItem>
                            <SelectItem value="AB">AB (Moto + Carro)</SelectItem>
                            <SelectItem value="C">C (Caminhão)</SelectItem>
                            <SelectItem value="D">D (Ônibus)</SelectItem>
                            <SelectItem value="E">E (Carreta)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="experiencia">Anos de experiência</Label>
                        <Input
                          id="experiencia"
                          type="number"
                          min="0"
                          value={instrutorForm.anosExperiencia}
                          onChange={(e) => setInstrutorForm(f => ({ ...f, anosExperiencia: parseInt(e.target.value) || 0 }))}
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="preco">Preço por hora (R$)</Label>
                      <Input
                        id="preco"
                        type="number"
                        min="0"
                        step="5"
                        value={instrutorForm.precoHora}
                        onChange={(e) => setInstrutorForm(f => ({ ...f, precoHora: parseFloat(e.target.value) || 0 }))}
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bairros">Bairros de atendimento</Label>
                      <Input
                        id="bairros"
                        placeholder="Centro, Zona Sul, Zona Norte"
                        value={instrutorForm.bairrosAtendimento}
                        onChange={(e) => setInstrutorForm(f => ({ ...f, bairrosAtendimento: e.target.value }))}
                        disabled={loading}
                      />
                      <p className="text-xs text-muted-foreground">Separe por vírgulas</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="veiculo">Possui veículo próprio</Label>
                      <Switch
                        id="veiculo"
                        checked={instrutorForm.temVeiculo}
                        onCheckedChange={(v) => setInstrutorForm(f => ({ ...f, temVeiculo: v }))}
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio (opcional)</Label>
                      <Textarea
                        id="bio"
                        placeholder="Fale um pouco sobre você..."
                        value={instrutorForm.bio}
                        onChange={(e) => setInstrutorForm(f => ({ ...f, bio: e.target.value }))}
                        disabled={loading}
                        rows={3}
                      />
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cadastrando...
                    </>
                  ) : (
                    'Criar conta'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
