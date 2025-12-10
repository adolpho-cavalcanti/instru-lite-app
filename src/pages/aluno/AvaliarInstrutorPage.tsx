import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBusiness } from '@/contexts/BusinessContext';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Star, Check } from 'lucide-react';
import { z } from 'zod';

const reviewSchema = z.object({
  nota: z.number().min(1, 'Selecione uma nota').max(5),
  comentario: z.string()
    .min(10, 'Comentário deve ter pelo menos 10 caracteres')
    .max(1000, 'Comentário deve ter no máximo 1000 caracteres')
});

export default function AvaliarInstrutorPage() {
  const { pacoteId } = useParams();
  const navigate = useNavigate();
  const { instrutores } = useAuth();
  const { getPacoteById, podeAvaliar, enviarAvaliacao } = useBusiness();
  
  const [nota, setNota] = useState(0);
  const [hoverNota, setHoverNota] = useState(0);
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const pacote = pacoteId ? getPacoteById(pacoteId) : undefined;
  const instrutor = pacote ? instrutores.find(i => i.id === pacote.instrutorId) : undefined;
  const canRate = pacoteId ? podeAvaliar(pacoteId) : false;

  if (!pacote || !instrutor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Pacote não encontrado</p>
      </div>
    );
  }

  if (!canRate) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Avaliar Instrutor" showBack />
        <div className="p-4 text-center py-12">
          <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">
            Avaliação já realizada
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Você já avaliou este instrutor para este pacote.
          </p>
          <Button onClick={() => navigate('/minhas-aulas')}>
            Voltar para Minhas Aulas
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    const result = reviewSchema.safeParse({ nota, comentario: comentario.trim() });
    
    if (!result.success) {
      const firstError = result.error.errors[0]?.message || 'Dados inválidos';
      setError(firstError);
      toast.error(firstError);
      return;
    }

    setError('');
    setLoading(true);
    
    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 500));

    enviarAvaliacao(pacote.id, nota, comentario.trim());
    
    toast.success('Avaliação enviada com sucesso!', {
      description: 'Obrigado por avaliar seu instrutor.',
    });
    
    navigate('/minhas-aulas');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Avaliar Instrutor" showBack />

      <main className="p-4 space-y-6">
        {/* Instrutor Info */}
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={instrutor.foto} alt={instrutor.nome} />
              <AvatarFallback>{instrutor.nome.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-foreground">{instrutor.nome}</h2>
              <p className="text-sm text-muted-foreground">
                Pacote de {pacote.quantidadeHoras}h concluído
              </p>
            </div>
          </div>
        </Card>

        {/* Nota */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">
            Como foi sua experiência?
          </h3>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                className="p-2 transition-transform hover:scale-110"
                onMouseEnter={() => setHoverNota(value)}
                onMouseLeave={() => setHoverNota(0)}
                onClick={() => setNota(value)}
              >
                <Star
                  className={`w-10 h-10 ${
                    (hoverNota || nota) >= value
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted-foreground'
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-2">
            {nota === 0 && 'Toque para avaliar'}
            {nota === 1 && 'Muito ruim'}
            {nota === 2 && 'Ruim'}
            {nota === 3 && 'Regular'}
            {nota === 4 && 'Bom'}
            {nota === 5 && 'Excelente'}
          </p>
        </div>

        {/* Comentário */}
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Conte como foi sua experiência
          </label>
          <Textarea
            value={comentario}
            onChange={(e) => {
              if (e.target.value.length <= 1000) {
                setComentario(e.target.value);
                setError('');
              }
            }}
            placeholder="Escreva aqui sua avaliação sobre o instrutor, as aulas, o veículo, a didática..."
            rows={5}
            maxLength={1000}
            className={`resize-none ${error ? 'border-destructive' : ''}`}
          />
          <div className="flex justify-between mt-1">
            <p className="text-xs text-muted-foreground">
              Mínimo de 10 caracteres
            </p>
            <p className="text-xs text-muted-foreground">{comentario.length}/1000</p>
          </div>
          {error && <p className="text-xs text-destructive mt-1">{error}</p>}
        </div>

        {/* Aviso */}
        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Dica:</strong> Sua avaliação ajuda outros alunos a escolherem 
            o instrutor ideal. Seja honesto e construtivo!
          </p>
        </div>

        {/* Botão */}
        <Button
          className="w-full h-12"
          onClick={handleSubmit}
          disabled={loading || nota === 0}
        >
          {loading ? 'Enviando...' : 'Enviar avaliação'}
        </Button>
      </main>
    </div>
  );
}
