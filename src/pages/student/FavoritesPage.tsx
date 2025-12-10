import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { InstrutorCard } from '@/components/InstrutorCard';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function FavoritosPage() {
  const { instrutores, isFavorito } = useAuth();
  
  const favoritosInstrutores = instrutores.filter(i => isFavorito(i.id));

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Favoritos" showLogout />

      <main className="px-4 py-4 max-w-md mx-auto">
        {favoritosInstrutores.length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              {favoritosInstrutores.length} instrutor{favoritosInstrutores.length !== 1 ? 'es' : ''} favorito{favoritosInstrutores.length !== 1 ? 's' : ''}
            </p>

            <div className="space-y-3">
              {favoritosInstrutores.map((instrutor, index) => (
                <InstrutorCard
                  key={instrutor.id}
                  instrutor={instrutor}
                  className={`stagger-${Math.min(index + 1, 6)}`}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Heart className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Nenhum favorito ainda
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xs">
              Explore nossos instrutores e salve seus favoritos para acessá-los rapidamente.
            </p>
            <Button asChild>
              <Link to="/home">Explorar instrutores</Link>
            </Button>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
