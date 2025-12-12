import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Mensagem {
  id: string;
  pacoteId: string;
  remetenteId: string;
  remetenteTipo: 'aluno' | 'instrutor';
  conteudo: string;
  lida: boolean;
  createdAt: string;
}

export function useMensagens(pacoteId?: string) {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchMensagens = useCallback(async () => {
    if (!pacoteId) return;

    try {
      const { data, error } = await supabase
        .from('mensagens')
        .select('*')
        .eq('pacote_id', pacoteId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const mapped: Mensagem[] = (data || []).map(m => ({
        id: m.id,
        pacoteId: m.pacote_id,
        remetenteId: m.remetente_id,
        remetenteTipo: m.remetente_tipo as 'aluno' | 'instrutor',
        conteudo: m.conteudo,
        lida: m.lida,
        createdAt: m.created_at,
      }));

      setMensagens(mapped);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    } finally {
      setLoading(false);
    }
  }, [pacoteId]);

  const enviarMensagem = async (conteudo: string) => {
    if (!pacoteId || !currentUser || !conteudo.trim()) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('mensagens')
        .insert({
          pacote_id: pacoteId,
          remetente_id: currentUser.id,
          remetente_tipo: currentUser.tipo,
          conteudo: conteudo.trim(),
        });

      if (error) throw error;

      // Mensagem será adicionada pelo realtime
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar a mensagem.',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const marcarComoLida = async (mensagemId: string) => {
    try {
      await supabase
        .from('mensagens')
        .update({ lida: true })
        .eq('id', mensagemId);
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  // Fetch inicial
  useEffect(() => {
    fetchMensagens();
  }, [fetchMensagens]);

  // Realtime subscription
  useEffect(() => {
    if (!pacoteId) return;

    const channel = supabase
      .channel(`mensagens-${pacoteId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensagens',
          filter: `pacote_id=eq.${pacoteId}`,
        },
        (payload) => {
          const m = payload.new as any;
          const novaMensagem: Mensagem = {
            id: m.id,
            pacoteId: m.pacote_id,
            remetenteId: m.remetente_id,
            remetenteTipo: m.remetente_tipo,
            conteudo: m.conteudo,
            lida: m.lida,
            createdAt: m.created_at,
          };
          setMensagens(prev => [...prev, novaMensagem]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pacoteId]);

  return {
    mensagens,
    loading,
    sending,
    enviarMensagem,
    marcarComoLida,
    refetch: fetchMensagens,
  };
}
