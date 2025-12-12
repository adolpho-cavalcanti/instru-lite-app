import { Shield, RefreshCcw, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface GarantiaInfoProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export function GarantiaInfo({ variant = 'compact', className }: GarantiaInfoProps) {
  if (variant === 'compact') {
    return (
      <div className={cn(
        'bg-green-50 dark:bg-green-950/30 rounded-lg p-3 flex items-center gap-3',
        className
      )}>
        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center flex-shrink-0">
          <RefreshCcw className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-green-900 dark:text-green-100">
            Garantia de Satisfação
          </p>
          <p className="text-xs text-green-700 dark:text-green-300">
            Reembolso automático via Stripe em caso de problemas
          </p>
        </div>
      </div>
    );
  }

  return (
    <Card className={cn('p-4 border-green-200 dark:border-green-800', className)}>
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center flex-shrink-0">
          <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Garantia de Satisfação</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Sua compra está protegida pela nossa política de reembolso
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Reembolso automático</strong> - Processado diretamente pelo Stripe
          </p>
        </div>
        <div className="flex items-start gap-2">
          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Disputa de cobrança</strong> - Abra uma disputa se houver problema
          </p>
        </div>
        <div className="flex items-start gap-2">
          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Suporte por chat</strong> - Converse diretamente com o instrutor
          </p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
        <p className="text-xs text-green-700 dark:text-green-400">
          💡 Para solicitar reembolso, use o botão "Solicitar Reembolso" na página do pacote ou abra uma disputa diretamente no Stripe.
        </p>
      </div>
    </Card>
  );
}
