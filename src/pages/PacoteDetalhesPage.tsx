import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBusiness } from '@/contexts/BusinessContext';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, CheckCircle, XCircle, Star } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pendente: { label: 'Aguardando confirmação', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  confirmado: { label: 'Confirmado', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  em_andamento: { label: 'Em andamento', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  concluido: { label: 'Concluído', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300' },
  cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
};

const AULA_STATUS_ICONS: Record<string, { icon: typeof CheckCircle; color: string }> = {
  agendada: { icon: Clock, color: 'text-blue-500' },
  realizada: { icon: CheckCircle, color: 'text-green-500' },
  cancelada: { icon: XCircle, color: 'text-red-500' },
};

export default function PacoteDetalhesPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, instrutores, alunos } = useAuth();
  const { getPacoteById, podeAvaliar, cancelarPacote } = useBusiness();

  const pacote = id ? getPacoteById(id) : undefined;

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
  const instrutor = instrutores.find(i => i.id === pacote.instrutorId);
  const aluno = alunos.find(a => a.id === pacote.alunoId);
  const outroUsuario = isAluno ? instrutor : aluno;
  const statusInfo = STATUS_LABELS[pacote.status];
  const progresso = (pacote.horasUtilizadas / pacote.quantidadeHoras) * 100;
  const canRate = podeAvaliar(pacote.id);

  const handleCancelar = () => {
    cancelarPacote(pacote.id);
    navigate(-1);
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
              <span className="text-muted-foreground">Horas utilizadas</span>
              <span className="font-medium text-foreground">
                {pacote.horasUtilizadas}h de {pacote.quantidadeHoras}h
              </span>
            </div>
            <Progress value={progresso} className="h-3" />
            <p className="text-xs text-muted-foreground text-right">
              {pacote.quantidadeHoras - pacote.horasUtilizadas}h restantes
            </p>
          </div>
        </Card>

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

        {/* Lista de aulas */}
        <Card className="p-4">
          <h3 className="font-medium text-foreground mb-3">
            Aulas ({pacote.aulas.length})
          </h3>
          {pacote.aulas.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma aula agendada ainda
            </p>
          ) : (
            <div className="space-y-3">
              {pacote.aulas.map((aula, index) => {
                const StatusIcon = AULA_STATUS_ICONS[aula.status].icon;
                const statusColor = AULA_STATUS_ICONS[aula.status].color;

                return (
                  <div
                    key={aula.id}
                    className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg"
                  >
                    <div className={`p-2 rounded-full bg-background ${statusColor}`}>
                      <StatusIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        Aula {index + 1} - {aula.duracao}h
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(aula.data), "dd/MM/yyyy", { locale: ptBR })} às {aula.horario}
                      </p>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {aula.status}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Ações */}
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
    </div>
  );
}
