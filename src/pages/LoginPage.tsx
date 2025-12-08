import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, GraduationCap, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, instrutores, alunos } = useAuth();
  const [selectedType, setSelectedType] = useState<'instrutor' | 'aluno' | null>(null);

  const handleLogin = (id: string, tipo: 'instrutor' | 'aluno') => {
    login(id, tipo);
    if (tipo === 'instrutor') {
      navigate('/instrutor/home');
    } else {
      navigate('/home');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="gradient-hero px-6 pt-12 pb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Car className="w-8 h-8 text-primary-foreground" />
          <h1 className="text-2xl font-bold text-primary-foreground">
            Instrutor+
          </h1>
        </div>
        <p className="text-primary-foreground/80 text-sm">
          Encontre o instrutor ideal para você
        </p>
      </header>

      <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Como você quer entrar?
        </h2>

        {/* Type Selection */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setSelectedType('aluno')}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
              selectedType === 'aluno'
                ? "border-primary bg-accent"
                : "border-border bg-card hover:border-primary/50"
            )}
          >
            <GraduationCap className={cn(
              "w-8 h-8",
              selectedType === 'aluno' ? "text-primary" : "text-muted-foreground"
            )} />
            <span className={cn(
              "font-medium",
              selectedType === 'aluno' ? "text-primary" : "text-foreground"
            )}>
              Sou Aluno
            </span>
          </button>

          <button
            onClick={() => setSelectedType('instrutor')}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
              selectedType === 'instrutor'
                ? "border-primary bg-accent"
                : "border-border bg-card hover:border-primary/50"
            )}
          >
            <Car className={cn(
              "w-8 h-8",
              selectedType === 'instrutor' ? "text-primary" : "text-muted-foreground"
            )} />
            <span className={cn(
              "font-medium",
              selectedType === 'instrutor' ? "text-primary" : "text-foreground"
            )}>
              Sou Instrutor
            </span>
          </button>
        </div>

        {/* User List */}
        {selectedType && (
          <div className="animate-slide-up">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Selecione seu perfil:
            </h3>

            <div className="space-y-2">
              {(selectedType === 'aluno' ? alunos : instrutores).map((user, index) => (
                <button
                  key={user.id}
                  onClick={() => handleLogin(user.id, selectedType)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 bg-card rounded-xl border border-border hover:border-primary/50 hover:bg-accent transition-all duration-200",
                    `stagger-${index + 1}`
                  )}
                  style={{ animationFillMode: 'backwards' }}
                >
                  <img
                    src={user.foto}
                    alt={user.nome}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1 text-left">
                    <p className="font-medium text-foreground">{user.nome}</p>
                    <p className="text-sm text-muted-foreground">{user.cidade}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Link to Register */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Ainda não tem conta?
          </p>
          <Button
            variant="outline"
            onClick={() => navigate('/cadastro')}
            className="w-full"
          >
            Cadastre-se
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 py-4 text-center">
        <p className="text-xs text-muted-foreground">
          MVP Demo • Dados fictícios
        </p>
      </footer>
    </div>
  );
}
