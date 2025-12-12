import { useState } from 'react';
import { Shield, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface AntecedentesDeclaracaoProps {
  antecedentesDeclarados: boolean;
  onUpdate?: () => void;
}

export function AntecedentesDeclaracao({ antecedentesDeclarados, onUpdate }: AntecedentesDeclaracaoProps) {
  const { currentUser } = useAuth();
  const [aceito, setAceito] = useState(false);
  const [loading, setLoading] = useState(false);

  if (antecedentesDeclarados) {
    return (
      <Card className="p-4 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-green-900 dark:text-green-100">
              Autodeclaração realizada
            </p>
            <p className="text-sm text-green-700 dark:text-green-300">
              Você declarou não possuir antecedentes criminais
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const handleDeclarar = async () => {
    if (!aceito || !currentUser) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('instrutores')
        .update({
          antecedentes_declarados: true,
          antecedentes_declarados_em: new Date().toISOString(),
        })
        .eq('id', currentUser.id);

      if (error) throw error;

      toast.success('Autodeclaração realizada com sucesso!');
      onUpdate?.();
    } catch (error) {
      console.error('Erro ao salvar declaração:', error);
      toast.error('Erro ao salvar declaração');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-4 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/30">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/50 rounded-full flex items-center justify-center flex-shrink-0">
          <Shield className="w-5 h-5 text-yellow-600" />
        </div>
        <div>
          <h4 className="font-medium text-yellow-900 dark:text-yellow-100">
            Autodeclaração de Antecedentes
          </h4>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
            Para aumentar a confiança dos alunos, declare que você não possui antecedentes criminais.
          </p>
        </div>
      </div>

      <div className="flex items-start space-x-3 mb-4 pl-1">
        <Checkbox
          id="antecedentes"
          checked={aceito}
          onCheckedChange={(checked) => setAceito(checked === true)}
        />
        <Label htmlFor="antecedentes" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
          Declaro, sob as penas da lei, que não possuo antecedentes criminais que me impeçam de exercer a função de instrutor de trânsito, e que todas as informações fornecidas são verdadeiras.
        </Label>
      </div>

      <Button
        onClick={handleDeclarar}
        disabled={!aceito || loading}
        className="w-full"
        variant="outline"
      >
        {loading ? 'Salvando...' : 'Confirmar Declaração'}
      </Button>
    </Card>
  );
}
