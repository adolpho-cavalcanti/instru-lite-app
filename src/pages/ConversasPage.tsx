import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBusiness } from '@/contexts/BusinessContext';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ConversasPage() {
  const navigate = useNavigate();
  const { currentUser, instrutores, alunos } = useAuth();
  const { getConversas } = useBusiness();

  const conversas = getConversas();

  const getOutroUsuario = (conversa: { alunoId: string; instrutorId: string }) => {
    if (currentUser?.tipo === 'aluno') {
      return instrutores.find(i => i.id === conversa.instrutorId);
    }
    return alunos.find(a => a.id === conversa.alunoId);
  };

  const hasUnread = (conversa: { mensagens: Array<{ remetenteId: string; lida: boolean }> }) => {
    return conversa.mensagens.some(m => 
      m.remetenteId !== currentUser?.id && !m.lida
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday) {
      return format(date, 'HH:mm', { locale: ptBR });
    }
    return format(date, 'dd/MM', { locale: ptBR });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Conversas" />

      <main className="p-4">
        {conversas.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">
              Nenhuma conversa ainda
            </h3>
            <p className="text-sm text-muted-foreground">
              {currentUser?.tipo === 'aluno'
                ? 'Contrate um pacote de aulas para iniciar uma conversa'
                : 'Aguarde alunos contratarem seus pacotes'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversas.map((conversa) => {
              const outroUsuario = getOutroUsuario(conversa);
              const unread = hasUnread(conversa);

              if (!outroUsuario) return null;

              return (
                <Card
                  key={conversa.id}
                  className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => navigate(`/chat/${conversa.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={outroUsuario.foto} alt={outroUsuario.nome} />
                        <AvatarFallback>{outroUsuario.nome.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {unread && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-xs text-primary-foreground font-bold">
                            {conversa.mensagens.filter(m => 
                              m.remetenteId !== currentUser?.id && !m.lida
                            ).length}
                          </span>
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className={`font-semibold truncate ${
                          unread ? 'text-foreground' : 'text-foreground'
                        }`}>
                          {outroUsuario.nome}
                        </h3>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {formatDate(conversa.dataUltimaMensagem)}
                        </span>
                      </div>
                      <p className={`text-sm truncate ${
                        unread ? 'text-foreground font-medium' : 'text-muted-foreground'
                      }`}>
                        {conversa.ultimaMensagem || 'Nenhuma mensagem'}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
