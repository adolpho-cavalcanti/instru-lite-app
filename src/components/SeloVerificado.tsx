import { Shield, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface SeloVerificadoProps {
  verificado: boolean;
  antecedentesDeclarados?: boolean;
  className?: string;
  showTooltip?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function SeloVerificado({
  verificado,
  antecedentesDeclarados,
  className,
  showTooltip = true,
  size = 'md',
}: SeloVerificadoProps) {
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const badgeSizes = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  if (!verificado && !antecedentesDeclarados) {
    return null;
  }

  const content = (
    <Badge
      variant="secondary"
      className={cn(
        'gap-1',
        verificado
          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800'
          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        badgeSizes[size],
        className
      )}
    >
      {verificado ? (
        <ShieldCheck className={iconSizes[size]} />
      ) : (
        <Shield className={iconSizes[size]} />
      )}
      {verificado ? 'Verificado' : 'Antecedentes OK'}
    </Badge>
  );

  if (!showTooltip) {
    return content;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent>
          <p className="text-xs max-w-[200px]">
            {verificado
              ? 'Instrutor verificado pela plataforma Drive UP'
              : 'Instrutor declarou não possuir antecedentes criminais'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
