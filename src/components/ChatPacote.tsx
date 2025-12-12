import { useState, useRef, useEffect } from 'react';
import { useMensagens } from '@/hooks/useMensagens';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Send, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ChatPacoteProps {
  pacoteId: string;
  nomeOutraParte?: string;
}

export function ChatPacote({ pacoteId, nomeOutraParte }: ChatPacoteProps) {
  const { currentUser } = useAuth();
  const { mensagens, loading, sending, enviarMensagem, marcarComoLida } = useMensagens(pacoteId);
  const [novaMensagem, setNovaMensagem] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll para o fim quando novas mensagens chegam
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mensagens]);

  // Marcar mensagens como lidas
  useEffect(() => {
    mensagens
      .filter(m => !m.lida && m.remetenteTipo !== currentUser?.tipo)
      .forEach(m => marcarComoLida(m.id));
  }, [mensagens, currentUser?.tipo, marcarComoLida]);

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaMensagem.trim()) return;
    
    await enviarMensagem(novaMensagem);
    setNovaMensagem('');
  };

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-10 w-2/3 ml-auto" />
        <Skeleton className="h-10 w-3/4" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[400px] border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-3 bg-muted/50 border-b flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-primary" />
        <span className="font-medium text-sm">Chat com {nomeOutraParte || 'participante'}</span>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3" ref={scrollRef}>
        {mensagens.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <MessageCircle className="w-10 h-10 mb-2 opacity-30" />
            <p className="text-sm">Nenhuma mensagem ainda</p>
            <p className="text-xs">Comece a conversa!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {mensagens.map((msg) => {
              const isOwn = msg.remetenteTipo === currentUser?.tipo;
              return (
                <div
                  key={msg.id}
                  className={cn(
                    'flex flex-col max-w-[80%]',
                    isOwn ? 'ml-auto items-end' : 'mr-auto items-start'
                  )}
                >
                  <div
                    className={cn(
                      'px-3 py-2 rounded-2xl text-sm',
                      isOwn
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-muted rounded-bl-sm'
                    )}
                  >
                    {msg.conteudo}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 px-1">
                    {format(new Date(msg.createdAt), "HH:mm", { locale: ptBR })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleEnviar} className="p-3 border-t flex gap-2">
        <Input
          value={novaMensagem}
          onChange={(e) => setNovaMensagem(e.target.value)}
          placeholder="Digite sua mensagem..."
          className="flex-1"
          disabled={sending}
        />
        <Button type="submit" size="icon" disabled={sending || !novaMensagem.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
