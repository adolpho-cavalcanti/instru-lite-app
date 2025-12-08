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
import { toast } from 'sonner';
import { Users, MessageCircle, Check, X, Clock, ChevronRight } from 'lucide-react';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pendente: { label: 'Aguardando confirmação', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  confirmado: { label: 'Confirmado', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  em_andamento: { label: 'Em andamento', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  concluido: { label: 'Concluído', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300' },
  cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
};

export default function MeusAlunosPage() {
  const navigate = useNavigate();
  const { alunos } = useAuth();
  const { getPacotesInstrutor, confirmarPacote, cancelarPacote, getConversas } = useBusiness();

  const pacotes = getPacotesInstrutor();
  const conversas = getConversas();

  const getAluno = (alunoId: string) => {
    return alunos.find(a => a.id === alunoId);
  };

  const getConversa = (alunoId: string) => {
    return conversas.find(c => c.alunoId === alunoId);
  };

  const handleConfirmar = (pacoteId: string) => {
    confirmarPacote(pacoteId);
    toast.success('Pacote confirmado!');
  };

  const handleRecusar = (pacoteId: string) => {
    cancelarPacote(pacoteId);
    toast.info('Pacote recusado');
  };

  const pacotesPendentes = pacotes.filter(p => p.status === 'pendente');
  const pacotesAtivos = pacotes.filter(p => ['confirmado', 'em_andamento'].includes(p.status));
  const pacotesConcluidos = pacotes.filter(p => p.status === 'concluido');

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Meus Alunos" />

      <main className="p-4 space-y-6">
        {pacotes.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">
              Nenhum aluno ainda
            </h3>
            <p className="text-sm text-muted-foreground">
              Quando alunos contratarem seus pacotes, eles aparecerão aqui.
            </p>
          </div>
        ) : (
          <>
            {/* Solicitações Pendentes */}
            {pacotesPendentes.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-500" />
                  Solicitações pendentes
                  <Badge variant="secondary">{pacotesPendentes.length}</Badge>
                </h2>
                <div className="space-y-3">
                  {pacotesPendentes.map((pacote) => {
                    const aluno = getAluno(pacote.alunoId);
                    if (!aluno) return null;

                    return (
                      <Card key={pacote.id} className="p-4 border-yellow-200 dark:border-yellow-800">
                        <div className="flex items-start gap-3 mb-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={aluno.foto} alt={aluno.nome} />
                            <AvatarFallback>{aluno.nome.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground truncate">
                              {aluno.nome}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Pacote de {pacote.quantidadeHoras}h • R$ {pacote.precoTotal.toFixed(2)}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleRecusar(pacote.id)}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Recusar
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => handleConfirmar(pacote.id)}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Confirmar
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Alunos Ativos */}
            {pacotesAtivos.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  Alunos ativos
                </h2>
                <div className="space-y-3">
                  {pacotesAtivos.map((pacote) => {
                    const aluno = getAluno(pacote.alunoId);
                    const conversa = getConversa(pacote.alunoId);
                    const progresso = (pacote.horasUtilizadas / pacote.quantidadeHoras) * 100;
                    const statusInfo = STATUS_LABELS[pacote.status];

                    if (!aluno) return null;

                    return (
                      <Card key={pacote.id} className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={aluno.foto} alt={aluno.nome} />
                            <AvatarFallback>{aluno.nome.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground truncate">
                              {aluno.nome}
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

                          <div className="flex gap-2">
                            {conversa && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => navigate(`/chat/${conversa.id}`)}
                              >
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Chat
                              </Button>
                            )}
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={() => navigate(`/instrutor/pacote/${pacote.id}`)}
                            >
                              Gerenciar
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Histórico */}
            {pacotesConcluidos.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  Histórico
                </h2>
                <div className="space-y-2">
                  {pacotesConcluidos.map((pacote) => {
                    const aluno = getAluno(pacote.alunoId);
                    if (!aluno) return null;

                    return (
                      <Card key={pacote.id} className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={aluno.foto} alt={aluno.nome} />
                            <AvatarFallback>{aluno.nome.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-foreground truncate">
                              {aluno.nome}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {pacote.quantidadeHoras}h concluídas
                            </p>
                          </div>
                          <Badge variant="secondary">Concluído</Badge>
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
