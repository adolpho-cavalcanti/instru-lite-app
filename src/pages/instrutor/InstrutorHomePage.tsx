import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { StarRating } from '@/components/StarRating';
import { MapPin, Car, Clock, Shield, Star, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Instrutor } from '@/types';

export default function InstrutorHomePage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const instrutor = currentUser?.data as Instrutor;

  if (!instrutor) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Drive UP" showLogout />

      <main className="px-4 py-4 max-w-md mx-auto">
        {/* Welcome Card */}
        <div className="gradient-hero rounded-2xl p-5 mb-6 text-primary-foreground">
          <div className="flex items-start gap-4">
            <img
              src={instrutor.foto}
              alt={instrutor.nome}
              className="w-16 h-16 rounded-xl object-cover border-2 border-primary-foreground/30"
            />
            <div className="flex-1">
              <p className="text-primary-foreground/80 text-sm">Bem-vindo(a),</p>
              <h1 className="text-xl font-bold mb-1">{instrutor.nome}</h1>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-warning text-warning" />
                <span className="font-medium">{instrutor.avaliacaoMedia.toFixed(1)}</span>
                <span className="text-primary-foreground/70 text-sm">
                  ({instrutor.avaliacoes.length} avaliações)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button
            variant="outline"
            className="h-auto py-4 flex-col gap-2"
            onClick={() => navigate('/instrutor/perfil')}
          >
            <Edit className="w-5 h-5 text-primary" />
            <span>Editar Perfil</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 flex-col gap-2"
            onClick={() => navigate('/instrutor/avaliacoes')}
          >
            <Star className="w-5 h-5 text-warning" />
            <span>Avaliações</span>
          </Button>
        </div>

        {/* Stats */}
        <h2 className="font-semibold text-foreground mb-3">Seu perfil</h2>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-1">Credenciamento</p>
            <p className="font-semibold text-foreground">{instrutor.credenciamentoDetran}</p>
          </div>

          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                <Car className="w-4 h-4 text-primary" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-1">Categoria</p>
            <p className="font-semibold text-foreground">{instrutor.categoria}</p>
          </div>

          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                <Clock className="w-4 h-4 text-primary" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-1">Experiência</p>
            <p className="font-semibold text-foreground">{instrutor.anosExperiencia} anos</p>
          </div>

          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
                <span className="text-secondary font-bold text-sm">R$</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-1">Valor/hora</p>
            <p className="font-semibold text-foreground">R${instrutor.precoHora}</p>
          </div>
        </div>

        {/* Location */}
        <div className="bg-card rounded-xl p-4 border border-border mb-4">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-5 h-5 text-primary" />
            <span className="font-medium text-foreground">{instrutor.cidade}</span>
          </div>
          <p className="text-sm text-muted-foreground mb-2">Bairros de atendimento:</p>
          <div className="flex flex-wrap gap-2">
            {instrutor.bairrosAtendimento.map(bairro => (
              <span
                key={bairro}
                className="px-2 py-1 bg-muted rounded-md text-xs text-muted-foreground"
              >
                {bairro}
              </span>
            ))}
          </div>
        </div>

        {/* Bio Preview */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <h3 className="font-medium text-foreground mb-2">Sua bio</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {instrutor.bio}
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
