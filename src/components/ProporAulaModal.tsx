import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, MessageSquare } from 'lucide-react';

interface ProporAulaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { data: string; horario: string; duracao: number; observacoes?: string }) => void;
  titulo?: string;
  submitLabel?: string;
}

export function ProporAulaModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  titulo = "Propor Horário de Aula",
  submitLabel = "Propor Aula"
}: ProporAulaModalProps) {
  const [data, setData] = useState('');
  const [horario, setHorario] = useState('');
  const [duracao, setDuracao] = useState(1);
  const [observacoes, setObservacoes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data || !horario) return;
    
    onSubmit({ data, horario, duracao, observacoes: observacoes || undefined });
    
    // Reset form
    setData('');
    setHorario('');
    setDuracao(1);
    setObservacoes('');
    onClose();
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            {titulo}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="data" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Data
            </Label>
            <Input
              id="data"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              min={today}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="horario" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Horário
            </Label>
            <Input
              id="horario"
              type="time"
              value={horario}
              onChange={(e) => setHorario(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duracao">Duração (horas)</Label>
            <Input
              id="duracao"
              type="number"
              min={1}
              max={4}
              value={duracao}
              onChange={(e) => setDuracao(Number(e.target.value))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Observações (opcional)
            </Label>
            <Textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Ponto de encontro, preferências..."
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
