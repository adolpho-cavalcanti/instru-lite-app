import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBusiness } from '@/contexts/BusinessContext';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Star, Clock, ChevronRight } from 'lucide-react';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pendente: { label: 'Aguardando confirmação', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  confirmado: { label: 'Confirmado', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  em_andamento: { label: 'Em andamento', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  concluido: { label: 'Concluído', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300' },
  cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
};

export default function MinhasAulasPage() {
  const navigate = useNavigate();
  const { instrutores } = useAuth();
  const { getPacotesAluno, podeAvaliar } = useBusiness();

  const pacotes = getPacotesAluno();

  const getInstrutor = (instrutorId: string) => {
    return instrutores.find(i => i.id === instrutorId);
  };

  const pacotesAtivos = pacotes.filter(p => !['concluido', 'cancelado'].includes(p.status));
  const pacotesConcluidos = pacotes.filter(p => p.status === 'concluido');

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Minhas Aulas" />

      <main className="p-4 space-y-6">
        {pacotes.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">
              Nenhuma aula contratada
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Encontre um instrutor e contrate seu pacote de aulas
            </p>
            <Button onClick={() => navigate('/home')}>
              Buscar instrutores
            </Button>
          </div>
        ) : (
          <>
            {/* Pacotes Ativos */}
            {pacotesAtivos.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  Pacotes ativos
                </h2>
                <div className="space-y-3">
                  {pacotesAtivos.map((pacote) => {
                    const instrutor = getInstrutor(pacote.instrutorId);
                    const progresso = (pacote.horasUtilizadas / pacote.quantidadeHoras) * 100;
                    const statusInfo = STATUS_LABELS[pacote.status];

                    if (!instrutor) return null;

                    return (
                      <Card key={pacote.id} className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={instrutor.foto} alt={instrutor.nome} />
                            <AvatarFallback>{instrutor.nome.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground truncate">
                              {instrutor.nome}
                            </h3>
                            <Badge className={`mt-1 ${statusInfo.color}`}>
                              {statusInfo.label}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-muted-foreground">Progresso</span>
                              <span className="font-medium text-foreground">
                                {pacote.horasUtilizadas}h de {pacote.quantidadeHoras}h
                              </span>
                            </div>
                            <Progress value={progresso} className="h-2" />
                          </div>

                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>
                              {pacote.aulas.filter(a => a.status === 'agendada').length} aulas agendadas
                            </span>
                          </div>

                          <Button
                            size="sm"
                            className="w-full"
                            onClick={() => navigate(`/pacote/${pacote.id}`)}
                          >
                            Ver detalhes
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Pacotes Concluídos */}
            {pacotesConcluidos.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  Histórico
                </h2>
                <div className="space-y-3">
                  {pacotesConcluidos.map((pacote) => {
                    const instrutor = getInstrutor(pacote.instrutorId);
                    const canRate = podeAvaliar(pacote.id);

                    if (!instrutor) return null;

                    return (
                      <Card key={pacote.id} className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={instrutor.foto} alt={instrutor.nome} />
                            <AvatarFallback>{instrutor.nome.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-foreground truncate">
                              {instrutor.nome}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {pacote.quantidadeHoras}h concluídas
                            </p>
                          </div>
                          {canRate ? (
                            <Button
                              size="sm"
                              onClick={() => navigate(`/avaliar/${pacote.id}`)}
                            >
                              <Star className="w-4 h-4 mr-1" />
                              Avaliar
                            </Button>
                          ) : pacote.avaliacaoRealizada ? (
                            <Badge variant="secondary">
                              <Star className="w-3 h-3 mr-1 fill-current" />
                              Avaliado
                            </Badge>
                          ) : null}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
