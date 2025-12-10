import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Aula } from '@/types';

interface AulaCardProps {
  aula: Aula;
  nomeOutraParte?: string;
  fotoOutraParte?: string;
  isInstrutor: boolean;
  onConfirmar?: () => void;
  onRecusar?: () => void;
  onMarcarRealizada?: () => void;
  onCancelar?: () => void;
}

const STATUS_CONFIG = {
  proposta: {
    label: 'Proposta',
    color: 'bg-warning/20 text-warning-foreground border-warning',
    icon: HelpCircle,
  },
  confirmada: {
    label: 'Confirmada',
    color: 'bg-primary/20 text-primary border-primary',
    icon: CheckCircle,
  },
  realizada: {
    label: 'Realizada',
    color: 'bg-success/20 text-success border-success',
    icon: CheckCircle,
  },
  cancelada: {
    label: 'Cancelada',
    color: 'bg-destructive/20 text-destructive border-destructive',
    icon: XCircle,
  },
} as const;

export function AulaCard({
  aula,
  nomeOutraParte,
  fotoOutraParte,
  isInstrutor,
  onConfirmar,
  onRecusar,
  onMarcarRealizada,
  onCancelar,
}: AulaCardProps) {
  const statusConfig = STATUS_CONFIG[aula.status] || STATUS_CONFIG.proposta;
  const StatusIcon = statusConfig.icon;

  const formattedDate = format(new Date(aula.data), "EEEE, dd 'de' MMMM", { locale: ptBR });
  const isProposta = aula.status === 'proposta';
  const isConfirmada = aula.status === 'confirmada';
  const canConfirm = isProposta && isInstrutor && aula.propostaPor === 'aluno';
  const canMarkDone = isConfirmada && isInstrutor;

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      isProposta && "border-warning/50"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            {/* Header with status */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={cn("gap-1", statusConfig.color)}>
                <StatusIcon className="h-3 w-3" />
                {statusConfig.label}
              </Badge>
              {aula.propostaPor && isProposta && (
                <span className="text-xs text-muted-foreground">
                  Proposta por {aula.propostaPor === 'aluno' ? 'aluno' : 'instrutor'}
                </span>
              )}
            </div>

            {/* Date and time */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="capitalize">{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-primary" />
                <span>{aula.horario} ({aula.duracao}h)</span>
              </div>
            </div>

            {/* Other party info */}
            {nomeOutraParte && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{nomeOutraParte}</span>
              </div>
            )}

            {/* Notes */}
            {aula.observacoes && (
              <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                {aula.observacoes}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            {canConfirm && (
              <>
                <Button size="sm" onClick={onConfirmar}>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Confirmar
                </Button>
                <Button size="sm" variant="outline" onClick={onRecusar}>
                  <XCircle className="h-4 w-4 mr-1" />
                  Recusar
                </Button>
              </>
            )}
            
            {canMarkDone && (
              <Button size="sm" onClick={onMarcarRealizada}>
                <CheckCircle className="h-4 w-4 mr-1" />
                Realizada
              </Button>
            )}

            {(isProposta || isConfirmada) && onCancelar && (
              <Button size="sm" variant="ghost" className="text-destructive" onClick={onCancelar}>
                Cancelar
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
