import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePacote } from '@/hooks/usePacotes';
import { useAulas } from '@/hooks/useAulas';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AulaCard } from '@/components/AulaCard';
import { ProporAulaModal } from '@/components/ProporAulaModal';
import { ChatPacote } from '@/components/ChatPacote';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, CheckCircle, Star, Plus, Clock, Loader2, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pendente: { label: 'Aguardando confirmação', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  confirmado: { label: 'Confirmado', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  em_andamento: { label: 'Em andamento', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  concluido: { label: 'Concluído', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300' },
  cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
};

export default function PacoteDetalhesPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, instrutores, alunos } = useAuth();
  const { pacote, loading: pacoteLoading, confirmarPacote, cancelarPacote, podeAvaliar, refetch: refetchPacote } = usePacote(id);
  const { aulas, loading: aulasLoading, proporAula, confirmarAula, marcarRealizada, cancelarAula } = useAulas(id, refetchPacote);

  const [showProporModal, setShowProporModal] = useState(false);
  const [showChat, setShowChat] = useState(false);

  if (pacoteLoading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <Header title="Detalhes do Pacote" showBack />
        <main className="p-4 space-y-4">
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <Skeleton className="w-14 h-14 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-32" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <Skeleton className="h-4 w-40 mb-3" />
            <Skeleton className="h-3 w-full" />
          </Card>
        </main>
        <BottomNav />
      </div>
    );
  }

  if (!pacote) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Calendar className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold text-foreground mb-2">Pacote não encontrado</h2>
        <p className="text-sm text-muted-foreground mb-4">O pacote que você procura não existe.</p>
        <Button onClick={() => navigate(-1)}>Voltar</Button>
      </div>
    );
  }

  const isAluno = currentUser?.tipo === 'aluno';
  const isInstrutor = currentUser?.tipo === 'instrutor';
  const instrutor = instrutores.find(i => i.id === pacote.instrutorId);
  const aluno = alunos.find(a => a.id === pacote.alunoId);
  const outroUsuario = isAluno ? instrutor : aluno;
  const statusInfo = STATUS_LABELS[pacote.status] || STATUS_LABELS.pendente;
  const progresso = (pacote.horasUtilizadas / pacote.quantidadeHoras) * 100;
  const canRate = podeAvaliar();
  const horasRestantes = pacote.quantidadeHoras - pacote.horasUtilizadas;

  // Separate lessons by status
  const aulasPendentes = aulas.filter(a => a.status === 'proposta');
  const aulasConfirmadas = aulas.filter(a => a.status === 'confirmada');
  const aulasRealizadas = aulas.filter(a => a.status === 'realizada');

  const handleConfirmar = async () => {
    await confirmarPacote();
  };

  const handleCancelar = async () => {
    await cancelarPacote();
    navigate(-1);
  };

  const handleProporAula = async (data: { data: string; horario: string; duracao: number; observacoes?: string }) => {
    await proporAula(data);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Detalhes do Pacote" showBack />

      <main className="p-4 space-y-4">
        {/* Header com usuário */}
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-14 h-14">
              <AvatarImage src={outroUsuario?.foto} alt={outroUsuario?.nome} />
              <AvatarFallback>{outroUsuario?.nome?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                {isAluno ? 'Instrutor' : 'Aluno'}
              </p>
              <h2 className="font-semibold text-foreground">{outroUsuario?.nome}</h2>
              <Badge className={`mt-1 ${statusInfo.color}`}>
                {statusInfo.label}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Progresso */}
        <Card className="p-4">
          <h3 className="font-medium text-foreground mb-3">Progresso do pacote</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Horas realizadas</span>
              <span className="font-medium text-foreground">
                {pacote.horasUtilizadas}h de {pacote.quantidadeHoras}h
              </span>
            </div>
            <Progress value={progresso} className="h-3" />
            {pacote.status !== 'concluido' && (
              <p className="text-xs text-muted-foreground text-right">
                {horasRestantes}h restantes
              </p>
            )}
          </div>
        </Card>

        {/* Aulas Pendentes (propostas) */}
        {aulasPendentes.length > 0 && (
          <Card className="p-4 border-warning/30 bg-warning/5">
            <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-warning" />
              Propostas de Aula ({aulasPendentes.length})
            </h3>
            <div className="space-y-3">
              {aulasPendentes.map(aula => (
                <AulaCard
                  key={aula.id}
                  aula={aula}
                  nomeOutraParte={outroUsuario?.nome}
                  isInstrutor={isInstrutor}
                  onConfirmar={() => confirmarAula(aula.id)}
                  onRecusar={() => cancelarAula(aula.id)}
                  onCancelar={() => cancelarAula(aula.id)}
                />
              ))}
            </div>
          </Card>
        )}

        {/* Aulas Confirmadas */}
        {aulasConfirmadas.length > 0 && (
          <Card className="p-4 border-primary/30 bg-primary/5">
            <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Aulas Agendadas ({aulasConfirmadas.length})
            </h3>
            <div className="space-y-3">
              {aulasConfirmadas.map(aula => (
                <AulaCard
                  key={aula.id}
                  aula={aula}
                  nomeOutraParte={outroUsuario?.nome}
                  isInstrutor={isInstrutor}
                  onMarcarRealizada={() => marcarRealizada(aula.id)}
                  onCancelar={() => cancelarAula(aula.id)}
                />
              ))}
            </div>
          </Card>
        )}

        {/* Aulas Realizadas */}
        {aulasRealizadas.length > 0 && (
          <Card className="p-4">
            <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              Aulas Realizadas ({aulasRealizadas.length})
            </h3>
            <div className="space-y-3">
              {aulasRealizadas.map(aula => (
                <AulaCard
                  key={aula.id}
                  aula={aula}
                  nomeOutraParte={outroUsuario?.nome}
                  isInstrutor={isInstrutor}
                />
              ))}
            </div>
          </Card>
        )}

        {/* Chat com participante */}
        {['confirmado', 'em_andamento', 'concluido'].includes(pacote.status) && (
          <Card className="p-4">
            <Button
              variant="outline"
              className="w-full mb-3"
              onClick={() => setShowChat(!showChat)}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {showChat ? 'Ocultar Chat' : 'Abrir Chat'}
            </Button>
            {showChat && (
              <ChatPacote pacoteId={pacote.id} nomeOutraParte={outroUsuario?.nome} />
            )}
          </Card>
        )}

        {/* Botão para propor nova aula */}
        {['confirmado', 'em_andamento'].includes(pacote.status) && horasRestantes > 0 && (
          <Button 
            className="w-full" 
            variant="outline"
            onClick={() => setShowProporModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Propor Nova Aula
          </Button>
        )}

        {/* Ação do Instrutor - Confirmar pacote pendente */}
        {isInstrutor && pacote.status === 'pendente' && (
          <Card className="p-4 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/30">
            <h3 className="font-medium text-foreground mb-2">Solicitação pendente</h3>
            <p className="text-sm text-muted-foreground mb-4">
              O aluno {aluno?.nome} quer contratar {pacote.quantidadeHoras}h de aulas com você.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={handleCancelar}>
                Recusar
              </Button>
              <Button className="flex-1" onClick={handleConfirmar}>
                Confirmar
              </Button>
            </div>
          </Card>
        )}

        {/* Pacote concluído - mensagem para instrutor */}
        {isInstrutor && pacote.status === 'concluido' && (
          <Card className="p-4 bg-green-50 dark:bg-green-950/30">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <h3 className="font-medium text-foreground">Pacote concluído!</h3>
                <p className="text-sm text-muted-foreground">
                  {pacote.avaliacaoRealizada 
                    ? 'O aluno já avaliou suas aulas.' 
                    : 'Aguardando avaliação do aluno.'}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Informações do pacote */}
        <Card className="p-4">
          <h3 className="font-medium text-foreground mb-3">Informações</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor total</span>
              <span className="font-medium text-foreground">R$ {pacote.precoTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Data de contratação</span>
              <span className="text-foreground">
                {format(new Date(pacote.dataCriacao), "dd/MM/yyyy", { locale: ptBR })}
              </span>
            </div>
            {pacote.dataConfirmacao && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Confirmado em</span>
                <span className="text-foreground">
                  {format(new Date(pacote.dataConfirmacao), "dd/MM/yyyy", { locale: ptBR })}
                </span>
              </div>
            )}
            {pacote.dataConclusao && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Concluído em</span>
                <span className="text-foreground">
                  {format(new Date(pacote.dataConclusao), "dd/MM/yyyy", { locale: ptBR })}
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Ações do Aluno */}
        <div className="space-y-3">
          {canRate && (
            <Button
              className="w-full"
              onClick={() => navigate(`/avaliar/${pacote.id}`)}
            >
              <Star className="w-4 h-4 mr-2" />
              Avaliar instrutor
            </Button>
          )}

          {pacote.avaliacaoRealizada && isAluno && (
            <Card className="p-4 bg-green-50 dark:bg-green-950/30">
              <div className="flex items-center gap-3">
                <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                <p className="text-sm text-foreground">
                  Você já avaliou este instrutor. Obrigado!
                </p>
              </div>
            </Card>
          )}

          {['pendente', 'confirmado'].includes(pacote.status) && isAluno && (
            <Button
              variant="outline"
              className="w-full text-destructive hover:text-destructive"
              onClick={handleCancelar}
            >
              Cancelar pacote
            </Button>
          )}
        </div>
      </main>

      <BottomNav />

      {/* Modal para propor aula */}
      <ProporAulaModal
        isOpen={showProporModal}
        onClose={() => setShowProporModal(false)}
        onSubmit={handleProporAula}
        titulo={isInstrutor ? "Propor Aula para o Aluno" : "Propor Horário de Aula"}
      />
    </div>
  );
}
