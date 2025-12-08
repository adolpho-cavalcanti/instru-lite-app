import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { StarRating } from '@/components/StarRating';

export default function AvaliacoesPage() {
  const { id } = useParams<{ id: string }>();
  const { instrutores } = useAuth();
  
  const instrutor = instrutores.find(i => i.id === id);

  if (!instrutor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Instrutor não encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Avaliações" showBack />

      <main className="px-4 py-4 max-w-md mx-auto">
        {/* Summary */}
        <div className="bg-card rounded-2xl p-5 border border-border mb-6 text-center">
          <p className="text-4xl font-bold text-foreground mb-2">
            {instrutor.avaliacaoMedia.toFixed(1)}
          </p>
          <StarRating 
            rating={instrutor.avaliacaoMedia} 
            size="lg" 
            className="justify-center mb-2" 
          />
          <p className="text-sm text-muted-foreground">
            Baseado em {instrutor.avaliacoes.length} avaliações
          </p>
        </div>

        {/* Reviews List */}
        <div className="space-y-3">
          {instrutor.avaliacoes.map((avaliacao, index) => (
            <div
              key={avaliacao.id}
              className={`bg-card rounded-xl p-4 border border-border animate-fade-in stagger-${Math.min(index + 1, 6)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-foreground">{avaliacao.autor}</span>
                <StarRating rating={avaliacao.nota} size="sm" />
              </div>
              <p className="text-muted-foreground leading-relaxed">{avaliacao.comentario}</p>
              <p className="text-xs text-muted-foreground mt-3">
                {new Date(avaliacao.data).toLocaleDateString('pt-BR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
