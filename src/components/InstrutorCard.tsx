import { Heart, Star, MapPin, Car, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Instrutor } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface InstrutorCardProps {
  instrutor: Instrutor;
  className?: string;
}

export function InstrutorCard({ instrutor, className }: InstrutorCardProps) {
  const { toggleFavorito, isFavorito, currentUser } = useAuth();
  const favorito = isFavorito(instrutor.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorito(instrutor.id);
  };

  return (
    <Link
      to={`/instrutor/${instrutor.id}`}
      className={cn(
        "block bg-card rounded-2xl p-4 shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in",
        className
      )}
    >
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <img
            src={instrutor.foto}
            alt={instrutor.nome}
            className="w-20 h-20 rounded-xl object-cover"
          />
          {instrutor.temVeiculo && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full flex items-center justify-center">
              <Car className="w-3.5 h-3.5 text-success-foreground" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-foreground truncate">
                {instrutor.nome}
              </h3>
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="w-4 h-4 fill-warning text-warning" />
                <span className="text-sm font-medium text-foreground">
                  {instrutor.avaliacaoMedia.toFixed(1)}
                </span>
                <span className="text-sm text-muted-foreground">
                  ({instrutor.avaliacoes.length})
                </span>
              </div>
            </div>

            {currentUser?.tipo === 'aluno' && (
              <button
                onClick={handleFavoriteClick}
                className="p-2 -m-2 rounded-full hover:bg-accent transition-colors"
              >
                <Heart
                  className={cn(
                    "w-5 h-5 transition-colors",
                    favorito
                      ? "fill-destructive text-destructive"
                      : "text-muted-foreground"
                  )}
                />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{instrutor.cidade}</span>
          </div>

          <div className="flex items-center gap-3 mt-3">
            <span className="inline-flex items-center px-2 py-1 bg-accent rounded-md text-xs font-medium text-accent-foreground">
              Cat. {instrutor.categoria}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              {instrutor.anosExperiencia} anos
            </span>
          </div>
        </div>

        {/* Price */}
        <div className="flex-shrink-0 text-right">
          <p className="text-lg font-bold text-primary">
            R${instrutor.precoHora}
          </p>
          <p className="text-xs text-muted-foreground">/hora</p>
        </div>
      </div>
    </Link>
  );
}
