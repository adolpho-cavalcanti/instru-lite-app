import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBusiness } from '@/contexts/BusinessContext';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Send } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ChatPage() {
  const { conversaId } = useParams();
  const navigate = useNavigate();
  const { currentUser, instrutores, alunos } = useAuth();
  const { getConversa, enviarMensagem, marcarComoLida } = useBusiness();
  
  const [mensagem, setMensagem] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversa = conversaId ? getConversa(conversaId) : undefined;

  const outroUsuario = conversa ? (
    currentUser?.tipo === 'aluno'
      ? instrutores.find(i => i.id === conversa.instrutorId)
      : alunos.find(a => a.id === conversa.alunoId)
  ) : undefined;

  useEffect(() => {
    if (conversaId) {
      marcarComoLida(conversaId);
    }
  }, [conversaId, conversa?.mensagens.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversa?.mensagens.length]);

  if (!conversa || !outroUsuario) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Conversa não encontrada</p>
      </div>
    );
  }

  const handleSend = () => {
    if (!mensagem.trim() || !conversaId) return;
    enviarMensagem(conversaId, mensagem);
    setMensagem('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday) {
      return format(date, 'HH:mm', { locale: ptBR });
    }
    return format(date, "dd/MM 'às' HH:mm", { locale: ptBR });
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header com info do usuário */}
      <div className="border-b border-border bg-card">
        <div className="flex items-center gap-3 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="mr-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </Button>
          <Avatar className="w-10 h-10">
            <AvatarImage src={outroUsuario.foto} alt={outroUsuario.nome} />
            <AvatarFallback>{outroUsuario.nome.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-foreground truncate">
              {outroUsuario.nome}
            </h2>
            <p className="text-xs text-muted-foreground">
              {currentUser?.tipo === 'aluno' ? 'Instrutor' : 'Aluno'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversa.mensagens.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              Nenhuma mensagem ainda. Comece a conversa!
            </p>
          </div>
        ) : (
          conversa.mensagens.map((msg) => {
            const isOwn = msg.remetenteId === currentUser?.id;
            
            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    isOwn
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-accent text-accent-foreground rounded-bl-md'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {msg.conteudo}
                  </p>
                  <p className={`text-xs mt-1 ${
                    isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}>
                    {formatMessageDate(msg.dataEnvio)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card p-4">
        <div className="flex gap-2">
          <Input
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            className="flex-1"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!mensagem.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
