import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { OPCOES_PACOTE, TAXA_PLATAFORMA } from '@/types';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Check, Clock, Star, MessageCircle, Percent, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SeloVerificado } from '@/components/SeloVerificado';
import { GarantiaInfo } from '@/components/GarantiaInfo';

export default function ComprarPacotePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { instrutores, currentUser } = useAuth();
  const [selectedPacote, setSelectedPacote] = useState<number | null>(10);
  const [loading, setLoading] = useState(false);

  const instrutor = instrutores.find(i => i.id === id);

  if (!instrutor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Instrutor não encontrado</p>
      </div>
    );
  }

  const calcularPreco = (horas: number) => {
    const opcao = OPCOES_PACOTE.find(o => o.horas === horas);
    const desconto = opcao?.desconto || 0;
    const precoBase = instrutor.precoHora * horas;
    return precoBase * (1 - desconto / 100);
  };

  const handleComprar = async () => {
    if (!selectedPacote) {
      toast.error('Selecione um pacote de aulas');
      return;
    }

    if (!currentUser) {
      toast.error('Você precisa estar logado para comprar');
      navigate('/auth');
      return;
    }

    setLoading(true);

    try {
      // currentUser.id is already the aluno_id
      const alunoId = currentUser.id;

      // Calculate prices
      const precoTotal = calcularPreco(selectedPacote);
      const valorPlataforma = precoTotal * (TAXA_PLATAFORMA / 100);

      // Create pacote in Supabase with UUID
      const { data: pacote, error: pacoteError } = await supabase
        .from('pacotes')
        .insert({
          aluno_id: alunoId,
          instrutor_id: instrutor.id,
          quantidade_horas: selectedPacote,
          preco_total: precoTotal,
          valor_plataforma: valorPlataforma,
          taxa_plataforma: TAXA_PLATAFORMA,
          status: 'pendente',
        })
        .select()
        .single();

      if (pacoteError || !pacote) {
        throw new Error('Erro ao criar pacote');
      }

      // Calculate price in cents for Stripe
      const precoEmCentavos = Math.round(precoTotal * 100);

      // Call Stripe checkout edge function
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          pacoteId: pacote.id,
          instrutorNome: instrutor.nome,
          quantidadeHoras: selectedPacote,
          precoTotal: precoEmCentavos,
        },
      });

      if (error) {
        console.error('Checkout error:', error);
        throw new Error('Erro ao processar pagamento');
      }

      if (data?.url) {
        // Open Stripe Checkout in new tab
        window.open(data.url, '_blank');
        toast.success('Redirecionando para pagamento...', {
          description: 'Complete o pagamento na nova aba.',
        });
      } else {
        throw new Error('URL de checkout não recebida');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao processar pagamento', {
        description: 'Tente novamente mais tarde.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Contratar Aulas" showBack />

      <main className="p-4 space-y-6">
        {/* Instrutor Info */}
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={instrutor.foto} alt={instrutor.nome} />
              <AvatarFallback>{instrutor.nome.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-foreground">{instrutor.nome}</h2>
                <SeloVerificado
                  verificado={instrutor.verificado || false}
                  antecedentesDeclarados={instrutor.antecedentesDeclarados}
                  size="sm"
                />
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{instrutor.avaliacaoMedia}</span>
                <span className="text-sm text-muted-foreground">
                  ({instrutor.avaliacoes.length} avaliações)
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                R$ {instrutor.precoHora}/hora
              </p>
            </div>
          </div>
        </Card>

        {/* Pacotes */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">
            Escolha seu pacote
          </h3>
          <div className="space-y-3">
            {OPCOES_PACOTE.map((opcao) => {
              const preco = calcularPreco(opcao.horas);
              const precoOriginal = instrutor.precoHora * opcao.horas;
              const economia = precoOriginal - preco;

              return (
                <Card
                  key={opcao.id}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedPacote === opcao.horas
                      ? 'ring-2 ring-primary bg-primary/5'
                      : 'hover:bg-accent/50'
                  }`}
                  onClick={() => setSelectedPacote(opcao.horas)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedPacote === opcao.horas
                          ? 'border-primary bg-primary'
                          : 'border-muted-foreground'
                      }`}>
                        {selectedPacote === opcao.horas && (
                          <Check className="w-3 h-3 text-primary-foreground" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">
                            {opcao.horas} horas
                          </span>
                          {opcao.popular && (
                            <Badge className="bg-primary text-primary-foreground text-xs">
                              Popular
                            </Badge>
                          )}
                        </div>
                        {opcao.desconto > 0 && (
                          <p className="text-xs text-green-600">
                            Economia de R$ {economia.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">
                        R$ {preco.toFixed(2)}
                      </p>
                      {opcao.desconto > 0 && (
                        <p className="text-xs text-muted-foreground line-through">
                          R$ {precoOriginal.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Benefícios */}
        <Card className="p-4 bg-accent/30">
          <h4 className="font-medium text-foreground mb-3">O que está incluso:</h4>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="w-4 h-4 text-green-500" />
              Aulas práticas com instrutor credenciado
            </li>
            <li className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="w-4 h-4 text-green-500" />
              Agendamento flexível pelo app
            </li>
            <li className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageCircle className="w-4 h-4 text-green-500" />
              Chat direto com o instrutor
            </li>
            <li className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4 text-green-500" />
              Validade de 6 meses
            </li>
            <li className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="w-4 h-4 text-green-500" />
              Avalie o instrutor após concluir
            </li>
          </ul>
        </Card>

        {/* Garantia de satisfação */}
        <GarantiaInfo variant="compact" />

        {/* Info taxa */}
        <div className="bg-muted/50 rounded-lg p-3 flex items-center gap-2">
          <Percent className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            Taxa de {TAXA_PLATAFORMA}% da plataforma já inclusa no valor
          </p>
        </div>

        {/* Botão de compra */}
        <Button
          className="w-full h-12 text-base"
          onClick={handleComprar}
          disabled={!selectedPacote || loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processando...
            </>
          ) : (
            `Pagar R$ ${selectedPacote ? calcularPreco(selectedPacote).toFixed(2) : '0,00'}`
          )}
        </Button>
      </main>

      <BottomNav />
    </div>
  );
}
