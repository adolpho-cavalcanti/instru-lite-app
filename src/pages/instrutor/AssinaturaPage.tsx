import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBusiness } from '@/contexts/BusinessContext';
import { PLANOS_ASSINATURA, Instrutor } from '@/types';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Check, Crown, Zap, Shield, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AssinaturaPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { assinarPlano, cancelarAssinatura, verificarAssinaturaAtiva } = useBusiness();
  const [loading, setLoading] = useState<string | null>(null);

  const instrutor = currentUser?.data as Instrutor;
  const assinaturaAtiva = instrutor ? verificarAssinaturaAtiva(instrutor.id) : false;

  const handleAssinar = async (planoId: 'basico' | 'profissional' | 'premium') => {
    setLoading(planoId);
    
    // Simular processamento de pagamento
    await new Promise(resolve => setTimeout(resolve, 1500));

    assinarPlano(planoId);
    
    toast.success('Assinatura realizada com sucesso!', {
      description: 'Seu perfil agora está ativo na plataforma.',
    });
    
    setLoading(null);
  };

  const handleCancelar = async () => {
    setLoading('cancelar');
    
    await new Promise(resolve => setTimeout(resolve, 500));

    cancelarAssinatura();
    
    toast.info('Assinatura cancelada', {
      description: 'Seu perfil não será mais exibido na busca.',
    });
    
    setLoading(null);
  };

  const getPlanoIcon = (planoId: string) => {
    switch (planoId) {
      case 'basico': return <Shield className="w-6 h-6" />;
      case 'profissional': return <Zap className="w-6 h-6" />;
      case 'premium': return <Crown className="w-6 h-6" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Assinatura" showBack />

      <main className="p-4 space-y-6">
        {/* Status atual */}
        {assinaturaAtiva && instrutor.assinaturaPlano && (
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-full text-primary">
                {getPlanoIcon(instrutor.assinaturaPlano)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">
                    Plano {PLANOS_ASSINATURA.find(p => p.id === instrutor.assinaturaPlano)?.nome}
                  </h3>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    Ativo
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Renova em {instrutor.assinaturaExpira 
                    ? format(new Date(instrutor.assinaturaExpira), "dd 'de' MMMM", { locale: ptBR })
                    : '-'}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-destructive hover:text-destructive"
                  onClick={handleCancelar}
                  disabled={loading === 'cancelar'}
                >
                  {loading === 'cancelar' ? 'Cancelando...' : 'Cancelar assinatura'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Aviso se não tem assinatura */}
        {!assinaturaAtiva && (
          <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                  Seu perfil não está ativo
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  Assine um plano para aparecer na busca, receber avaliações e 
                  conquistar novos alunos.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Planos */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            {assinaturaAtiva ? 'Alterar plano' : 'Escolha seu plano'}
          </h2>
          <div className="space-y-4">
            {PLANOS_ASSINATURA.map((plano) => {
              const isCurrentPlan = instrutor?.assinaturaPlano === plano.id && assinaturaAtiva;

              return (
                <Card
                  key={plano.id}
                  className={`p-4 relative overflow-hidden ${
                    plano.destaque 
                      ? 'ring-2 ring-primary' 
                      : ''
                  } ${isCurrentPlan ? 'bg-primary/5' : ''}`}
                >
                  {plano.destaque && (
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-bl-lg font-medium">
                      Recomendado
                    </div>
                  )}

                  <div className="flex items-start gap-3 mb-4">
                    <div className={`p-2 rounded-full ${
                      plano.id === 'premium' 
                        ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : plano.id === 'profissional'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-accent text-accent-foreground'
                    }`}>
                      {getPlanoIcon(plano.id)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        {plano.nome}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {plano.descricao}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-foreground">
                        R${plano.preco.toFixed(2).replace('.', ',')}
                      </p>
                      <p className="text-xs text-muted-foreground">/mês</p>
                    </div>
                  </div>

                  <ul className="space-y-2 mb-4">
                    {plano.beneficios.map((beneficio, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {beneficio}
                      </li>
                    ))}
                    {plano.taxaAula > 0 && (
                      <li className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="w-4 h-4 flex items-center justify-center text-xs">💸</span>
                        {plano.taxaAula}% de taxa por aula
                      </li>
                    )}
                    {plano.taxaAula === 0 && (
                      <li className="flex items-center gap-2 text-sm text-green-600 font-medium">
                        <Check className="w-4 h-4 flex-shrink-0" />
                        Sem taxa por aula!
                      </li>
                    )}
                  </ul>

                  {isCurrentPlan ? (
                    <Button className="w-full" variant="secondary" disabled>
                      Plano atual
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      variant={plano.destaque ? 'default' : 'outline'}
                      onClick={() => handleAssinar(plano.id)}
                      disabled={loading === plano.id}
                    >
                      {loading === plano.id ? 'Processando...' : 'Assinar'}
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        {/* FAQ */}
        <Card className="p-4">
          <h3 className="font-semibold text-foreground mb-3">Perguntas frequentes</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium text-foreground">Posso cancelar a qualquer momento?</p>
              <p className="text-muted-foreground">Sim! Você pode cancelar quando quiser, sem multa.</p>
            </div>
            <div>
              <p className="font-medium text-foreground">O que acontece se eu não renovar?</p>
              <p className="text-muted-foreground">Seu perfil deixa de aparecer na busca, mas seus dados são mantidos.</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Como funciona a taxa por aula?</p>
              <p className="text-muted-foreground">É um percentual descontado do valor de cada pacote vendido.</p>
            </div>
          </div>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
