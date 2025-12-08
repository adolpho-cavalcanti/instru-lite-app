import { useState } from 'react';
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
import { toast } from 'sonner';
import { Calendar, CheckCircle, Star, Plus, Minus } from 'lucide-react';
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
  const { getPacoteById, podeAvaliar, cancelarPacote, confirmarPacote, registrarHorasRealizadas } = useBusiness();

  const [horasParaRegistrar, setHorasParaRegistrar] = useState(1);

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
  const isInstrutor = currentUser?.tipo === 'instrutor';
  const instrutor = instrutores.find(i => i.id === pacote.instrutorId);
  const aluno = alunos.find(a => a.id === pacote.alunoId);
  const outroUsuario = isAluno ? instrutor : aluno;
  const statusInfo = STATUS_LABELS[pacote.status];
  const progresso = (pacote.horasUtilizadas / pacote.quantidadeHoras) * 100;
  const canRate = podeAvaliar(pacote.id);
  const horasRestantes = pacote.quantidadeHoras - pacote.horasUtilizadas;

  const handleConfirmar = () => {
    confirmarPacote(pacote.id);
    toast.success('Pacote confirmado!');
  };

  const handleCancelar = () => {
    cancelarPacote(pacote.id);
    toast.info('Pacote cancelado');
    navigate(-1);
  };

  const handleRegistrarHoras = () => {
    if (horasParaRegistrar <= 0 || horasParaRegistrar > horasRestantes) return;
    
    registrarHorasRealizadas(pacote.id, horasParaRegistrar);
    
    if (horasParaRegistrar >= horasRestantes) {
      toast.success('Pacote concluído!', {
        description: 'O aluno agora pode avaliar suas aulas.',
      });
    } else {
      toast.success(`${horasParaRegistrar}h registrada(s) com sucesso!`);
    }
    setHorasParaRegistrar(1);
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

        {/* Ação do Instrutor - Registrar horas */}
        {isInstrutor && ['confirmado', 'em_andamento'].includes(pacote.status) && horasRestantes > 0 && (
          <Card className="p-4 border-primary/20 bg-primary/5">
            <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              Registrar aulas realizadas
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Confirme as horas de aula que você realizou com este aluno.
            </p>
            
            <div className="flex items-center justify-center gap-4 mb-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setHorasParaRegistrar(Math.max(1, horasParaRegistrar - 1))}
                disabled={horasParaRegistrar <= 1}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">{horasParaRegistrar}h</p>
                <p className="text-xs text-muted-foreground">horas</p>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setHorasParaRegistrar(Math.min(horasRestantes, horasParaRegistrar + 1))}
                disabled={horasParaRegistrar >= horasRestantes}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <Button className="w-full" onClick={handleRegistrarHoras}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirmar {horasParaRegistrar}h realizada{horasParaRegistrar > 1 ? 's' : ''}
            </Button>
          </Card>
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
    </div>
  );
}
