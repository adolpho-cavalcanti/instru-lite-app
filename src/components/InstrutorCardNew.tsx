import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Car, Heart } from 'lucide-react';
import { useAuthNew, Instrutor } from '@/contexts/AuthContextNew';
import { cn } from '@/lib/utils';

interface InstrutorCardNewProps {
  instrutor: Instrutor;
  className?: string;
}

export function InstrutorCardNew({ instrutor, className }: InstrutorCardNewProps) {
  const navigate = useNavigate();
  const { toggleFavorito, isFavorito } = useAuthNew();

  const nome = instrutor.profile?.nome || 'Instrutor';
  const cidade = instrutor.profile?.cidade || '';
  const foto = instrutor.profile?.foto || '/placeholder.svg';
  const favorito = isFavorito(instrutor.id);

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorito(instrutor.id);
  };

  return (
    <div
      onClick={() => navigate(`/instrutor/${instrutor.id}`)}
      className={cn(
        "bg-card rounded-xl p-4 shadow-card border border-border cursor-pointer",
        "hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5",
        "animate-fade-in",
        className
      )}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <img
            src={foto}
            alt={nome}
            className="w-16 h-16 rounded-xl object-cover"
          />
          {instrutor.tem_veiculo && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <Car className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground truncate">{nome}</h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" />
                <span className="truncate">{cidade}</span>
              </div>
            </div>
            <button
              onClick={handleFavorite}
              className={cn(
                "p-1.5 rounded-full transition-colors flex-shrink-0",
                favorito
                  ? "bg-destructive/10 text-destructive"
                  : "bg-muted text-muted-foreground hover:text-destructive"
              )}
            >
              <Heart className={cn("w-4 h-4", favorito && "fill-current")} />
            </button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-warning text-warning" />
              <span className="text-sm font-medium text-foreground">
                {Number(instrutor.avaliacao_media || 5).toFixed(1)}
              </span>
            </div>
            <span className="text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">
              Cat. {instrutor.categoria}
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">
              {instrutor.anos_experiencia} anos
            </span>
          </div>

          {/* Price */}
          <div className="mt-2 flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {instrutor.bairros_atendimento?.slice(0, 2).map(bairro => (
                <span
                  key={bairro}
                  className="px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground"
                >
                  {bairro}
                </span>
              ))}
              {(instrutor.bairros_atendimento?.length || 0) > 2 && (
                <span className="px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground">
                  +{instrutor.bairros_atendimento!.length - 2}
                </span>
              )}
            </div>
            <span className="font-bold text-primary">
              R${Number(instrutor.preco_hora).toFixed(0)}/h
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
