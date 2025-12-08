import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { MapPin, Heart, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Aluno } from '@/types';

export default function AlunoPerfilPage() {
  const { currentUser, logout, instrutores, isFavorito } = useAuth();
  const navigate = useNavigate();

  const aluno = currentUser?.data as Aluno;
  const favoritosCount = instrutores.filter(i => isFavorito(i.id)).length;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!aluno) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Meu Perfil" showLogout />

      <main className="px-4 py-6 max-w-md mx-auto">
        {/* Profile Card */}
        <div className="bg-card rounded-2xl p-6 border border-border mb-6 text-center">
          <img
            src={aluno.foto}
            alt={aluno.nome}
            className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-accent"
          />
          <h1 className="text-xl font-bold text-foreground mb-1">
            {aluno.nome}
          </h1>
          <div className="flex items-center justify-center gap-1 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{aluno.cidade}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-card rounded-xl p-4 border border-border mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{favoritosCount}</p>
              <p className="text-sm text-muted-foreground">Instrutores favoritos</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => navigate('/favoritos')}
          >
            <Heart className="w-5 h-5 mr-3" />
            Ver meus favoritos
          </Button>

          <Button
            variant="destructive"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sair da conta
          </Button>
        </div>

        {/* Info */}
        <p className="text-xs text-muted-foreground text-center mt-8">
          Versão MVP • Dados armazenados localmente
        </p>
      </main>

      <BottomNav />
    </div>
  );
}
