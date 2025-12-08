import { useParams, Link } from 'react-router-dom';
import { Heart, Star, MapPin, Car, Clock, Shield, MessageCircle, Phone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { StarRating } from '@/components/StarRating';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function InstrutorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { instrutores, toggleFavorito, isFavorito, currentUser } = useAuth();
  
  const instrutor = instrutores.find(i => i.id === id);

  if (!instrutor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Instrutor não encontrado</p>
      </div>
    );
  }

  const favorito = isFavorito(instrutor.id);

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="" showBack />

      <main className="px-4 max-w-md mx-auto">
        {/* Profile Header */}
        <div className="relative -mt-2 mb-6">
          <div className="flex gap-4">
            <img
              src={instrutor.foto}
              alt={instrutor.nome}
              className="w-24 h-24 rounded-2xl object-cover shadow-card"
            />
            <div className="flex-1 pt-1">
              <h1 className="text-xl font-bold text-foreground mb-1">
                {instrutor.nome}
              </h1>
              <div className="flex items-center gap-2 mb-2">
                <StarRating rating={instrutor.avaliacaoMedia} size="sm" />
                <span className="text-sm font-medium">{instrutor.avaliacaoMedia.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">
                  ({instrutor.avaliacoes.length} avaliações)
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                {instrutor.cidade}
              </div>
            </div>
          </div>

          {/* Favorite Button */}
          {currentUser?.tipo === 'aluno' && (
            <button
              onClick={() => toggleFavorito(instrutor.id)}
              className="absolute top-0 right-0 p-2 rounded-xl bg-card border border-border shadow-sm"
            >
              <Heart
                className={cn(
                  "w-5 h-5 transition-colors",
                  favorito ? "fill-destructive text-destructive" : "text-muted-foreground"
                )}
              />
            </button>
          )}
        </div>

        {/* Price Card */}
        <div className="bg-accent rounded-2xl p-4 mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Valor da aula</p>
            <p className="text-2xl font-bold text-primary">
              R${instrutor.precoHora}<span className="text-sm font-normal text-muted-foreground">/hora</span>
            </p>
          </div>
          <Button variant="hero" size="lg">
            <Phone className="w-4 h-4 mr-2" />
            Contatar
          </Button>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-card rounded-xl p-3 border border-border">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Credenciamento</span>
            </div>
            <p className="font-semibold text-foreground">{instrutor.credenciamentoDetran}</p>
          </div>

          <div className="bg-card rounded-xl p-3 border border-border">
            <div className="flex items-center gap-2 mb-1">
              <Car className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Categoria</span>
            </div>
            <p className="font-semibold text-foreground">{instrutor.categoria}</p>
          </div>

          <div className="bg-card rounded-xl p-3 border border-border">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Experiência</span>
            </div>
            <p className="font-semibold text-foreground">{instrutor.anosExperiencia} anos</p>
          </div>

          <div className="bg-card rounded-xl p-3 border border-border">
            <div className="flex items-center gap-2 mb-1">
              <Car className="w-4 h-4 text-success" />
              <span className="text-xs text-muted-foreground">Veículo</span>
            </div>
            <p className="font-semibold text-foreground">
              {instrutor.temVeiculo ? 'Próprio' : 'Não possui'}
            </p>
          </div>
        </div>

        {/* Bio */}
        <div className="mb-6">
          <h2 className="font-semibold text-foreground mb-2">Sobre</h2>
          <p className="text-muted-foreground leading-relaxed">{instrutor.bio}</p>
        </div>

        {/* Bairros */}
        <div className="mb-6">
          <h2 className="font-semibold text-foreground mb-2">Bairros de atendimento</h2>
          <div className="flex flex-wrap gap-2">
            {instrutor.bairrosAtendimento.map(bairro => (
              <span
                key={bairro}
                className="px-3 py-1.5 bg-muted rounded-lg text-sm text-muted-foreground"
              >
                {bairro}
              </span>
            ))}
          </div>
        </div>

        {/* Reviews Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground">Avaliações</h2>
            <Link
              to={`/instrutor/${instrutor.id}/avaliacoes`}
              className="text-sm text-primary hover:underline"
            >
              Ver todas
            </Link>
          </div>

          <div className="space-y-3">
            {instrutor.avaliacoes.slice(0, 2).map(avaliacao => (
              <div
                key={avaliacao.id}
                className="bg-card rounded-xl p-4 border border-border"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-foreground">{avaliacao.autor}</span>
                  <StarRating rating={avaliacao.nota} size="sm" />
                </div>
                <p className="text-sm text-muted-foreground">{avaliacao.comentario}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(avaliacao.data).toLocaleDateString('pt-BR')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
