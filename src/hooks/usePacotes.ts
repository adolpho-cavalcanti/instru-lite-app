import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface PacoteDB {
  id: string;
  aluno_id: string;
  instrutor_id: string;
  quantidade_horas: number;
  horas_utilizadas: number;
  preco_total: number;
  taxa_plataforma: number;
  valor_plataforma: number;
  status: 'pendente' | 'confirmado' | 'em_andamento' | 'concluido' | 'cancelado';
  data_confirmacao: string | null;
  data_conclusao: string | null;
  avaliacao_liberada: boolean;
  avaliacao_realizada: boolean;
  created_at: string;
  updated_at: string;
}

export interface Pacote {
  id: string;
  alunoId: string;
  instrutorId: string;
  quantidadeHoras: number;
  horasUtilizadas: number;
  precoTotal: number;
  taxaPlataforma: number;
  valorPlataforma: number;
  status: 'pendente' | 'confirmado' | 'em_andamento' | 'concluido' | 'cancelado';
  dataConfirmacao?: string;
  dataConclusao?: string;
  avaliacaoLiberada: boolean;
  avaliacaoRealizada: boolean;
  dataCriacao: string;
}

function mapPacoteFromDB(p: PacoteDB): Pacote {
  return {
    id: p.id,
    alunoId: p.aluno_id,
    instrutorId: p.instrutor_id,
    quantidadeHoras: p.quantidade_horas,
    horasUtilizadas: p.horas_utilizadas,
    precoTotal: Number(p.preco_total),
    taxaPlataforma: Number(p.taxa_plataforma),
    valorPlataforma: Number(p.valor_plataforma),
    status: p.status,
    dataConfirmacao: p.data_confirmacao || undefined,
    dataConclusao: p.data_conclusao || undefined,
    avaliacaoLiberada: p.avaliacao_liberada,
    avaliacaoRealizada: p.avaliacao_realizada,
    dataCriacao: p.created_at,
  };
}

export function usePacote(pacoteId?: string) {
  const { toast } = useToast();
  const [pacote, setPacote] = useState<Pacote | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPacote = useCallback(async () => {
    if (!pacoteId) {
      setPacote(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('pacotes')
        .select('*')
        .eq('id', pacoteId)
        .maybeSingle();

      if (error) throw error;

      setPacote(data ? mapPacoteFromDB(data) : null);
    } catch (error) {
      console.error('Erro ao buscar pacote:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o pacote.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [pacoteId, toast]);

  useEffect(() => {
    fetchPacote();
  }, [fetchPacote]);

  const confirmarPacote = async () => {
    if (!pacoteId) return;

    try {
      const { error } = await supabase
        .from('pacotes')
        .update({ 
          status: 'confirmado',
          data_confirmacao: new Date().toISOString(),
        })
        .eq('id', pacoteId);

      if (error) throw error;

      await fetchPacote();
      toast({
        title: 'Pacote Confirmado',
        description: 'O pacote foi confirmado com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao confirmar pacote:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível confirmar o pacote.',
        variant: 'destructive',
      });
    }
  };

  const cancelarPacote = async () => {
    if (!pacoteId) return;

    try {
      const { error } = await supabase
        .from('pacotes')
        .update({ status: 'cancelado' })
        .eq('id', pacoteId);

      if (error) throw error;

      await fetchPacote();
      toast({
        title: 'Pacote Cancelado',
        description: 'O pacote foi cancelado.',
      });
    } catch (error) {
      console.error('Erro ao cancelar pacote:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível cancelar o pacote.',
        variant: 'destructive',
      });
    }
  };

  const podeAvaliar = () => {
    if (!pacote) return false;
    return pacote.avaliacaoLiberada && !pacote.avaliacaoRealizada;
  };

  return {
    pacote,
    loading,
    confirmarPacote,
    cancelarPacote,
    podeAvaliar,
    refetch: fetchPacote,
  };
}

export function usePacotesAluno() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [pacotes, setPacotes] = useState<Pacote[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPacotes = useCallback(async () => {
    if (!currentUser || currentUser.tipo !== 'aluno') {
      setPacotes([]);
      setLoading(false);
      return;
    }

    try {
      // currentUser.id is already the aluno_id
      const { data, error } = await supabase
        .from('pacotes')
        .select('*')
        .eq('aluno_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPacotes((data || []).map(mapPacoteFromDB));
    } catch (error) {
      console.error('Erro ao buscar pacotes:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os pacotes.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [currentUser, toast]);

  useEffect(() => {
    fetchPacotes();
  }, [fetchPacotes]);

  return { pacotes, loading, refetch: fetchPacotes };
}

export function usePacotesInstrutor() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [pacotes, setPacotes] = useState<Pacote[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPacotes = useCallback(async () => {
    if (!currentUser || currentUser.tipo !== 'instrutor') {
      setPacotes([]);
      setLoading(false);
      return;
    }

    try {
      // currentUser.id is already the instrutor_id
      const { data, error } = await supabase
        .from('pacotes')
        .select('*')
        .eq('instrutor_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPacotes((data || []).map(mapPacoteFromDB));
    } catch (error) {
      console.error('Erro ao buscar pacotes:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os pacotes.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [currentUser, toast]);

  useEffect(() => {
    fetchPacotes();
  }, [fetchPacotes]);

  return { pacotes, loading, refetch: fetchPacotes };
}
