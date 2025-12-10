import { useAuth } from '@/contexts/AuthContext';
import { useBusiness } from '@/contexts/BusinessContext';
import { TAXA_PLATAFORMA } from '@/types';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, TrendingUp, Users, Star, Percent } from 'lucide-react';

export default function AssinaturaPage() {
  const { currentUser, instrutores } = useAuth();
  const { getPacotesInstrutor } = useBusiness();

  const instrutor = instrutores.find(i => i.id === currentUser?.id);
  const pacotes = getPacotesInstrutor();

  // Estatísticas
  const pacotesConcluidos = pacotes.filter(p => p.status === 'concluido');
  const totalGanho = pacotesConcluidos.reduce((acc, p) => acc + (p.precoTotal - p.valorPlataforma), 0);
  const totalComissao = pacotesConcluidos.reduce((acc, p) => acc + p.valorPlataforma, 0);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Como Funciona" showBack />

      <main className="p-4 space-y-6">
        {/* Badge Cadastro Grátis */}
        <div className="text-center">
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-sm px-4 py-1">
            Cadastro 100% Gratuito
          </Badge>
        </div>

        {/* Como funciona */}
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Percent className="w-5 h-5 text-primary" />
            Modelo de Comissão
          </h2>
          
          <p className="text-muted-foreground mb-4">
            Na Drive UP, você não paga nada para se cadastrar ou manter seu perfil ativo. 
            Cobramos apenas uma pequena comissão quando você fecha um pacote de aulas.
          </p>

          <div className="bg-primary/5 rounded-xl p-4 text-center mb-4">
            <p className="text-4xl font-bold text-primary">{TAXA_PLATAFORMA}%</p>
            <p className="text-sm text-muted-foreground mt-1">de comissão por pacote fechado</p>
          </div>

          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-foreground">
                Cadastro e perfil na plataforma <strong>grátis</strong>
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-foreground">
                Apareça na busca de alunos <strong>sem custo</strong>
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-foreground">
                Receba avaliações e construa sua reputação
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-foreground">
                Pague apenas quando fechar negócio
              </span>
            </li>
          </ul>
        </Card>

        {/* Exemplo prático */}
        <Card className="p-5">
          <h3 className="font-semibold text-foreground mb-3">Exemplo prático</h3>
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Pacote de 10 horas × R$100/hora</span>
              <span className="text-foreground font-medium">R$ 1.000,00</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Comissão da plataforma ({TAXA_PLATAFORMA}%)</span>
              <span className="text-destructive">- R$ 100,00</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between">
              <span className="font-semibold text-foreground">Você recebe</span>
              <span className="font-bold text-green-600">R$ 900,00</span>
            </div>
          </div>
        </Card>

        {/* Estatísticas do instrutor */}
        {instrutor && (
          <Card className="p-5">
            <h3 className="font-semibold text-foreground mb-4">Suas estatísticas</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <Users className="w-5 h-5 mx-auto text-primary mb-1" />
                <p className="text-2xl font-bold text-foreground">{pacotesConcluidos.length}</p>
                <p className="text-xs text-muted-foreground">Pacotes concluídos</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <Star className="w-5 h-5 mx-auto text-yellow-500 mb-1" />
                <p className="text-2xl font-bold text-foreground">{instrutor.avaliacaoMedia.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Avaliação média</p>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <TrendingUp className="w-5 h-5 mx-auto text-green-600 mb-1" />
                <p className="text-2xl font-bold text-green-600">
                  R$ {totalGanho.toFixed(2).replace('.', ',')}
                </p>
                <p className="text-xs text-muted-foreground">Total recebido</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <Percent className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
                <p className="text-2xl font-bold text-foreground">
                  R$ {totalComissao.toFixed(2).replace('.', ',')}
                </p>
                <p className="text-xs text-muted-foreground">Comissão paga</p>
              </div>
            </div>
          </Card>
        )}

        {/* FAQ */}
        <Card className="p-4">
          <h3 className="font-semibold text-foreground mb-3">Perguntas frequentes</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium text-foreground">Preciso pagar algo para me cadastrar?</p>
              <p className="text-muted-foreground">Não! O cadastro é 100% gratuito.</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Quando a comissão é cobrada?</p>
              <p className="text-muted-foreground">Apenas quando um pacote de aulas é fechado entre você e um aluno.</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Como recebo meu pagamento?</p>
              <p className="text-muted-foreground">O valor é repassado após a conclusão do pacote, já descontada a comissão.</p>
            </div>
          </div>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}