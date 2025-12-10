import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Aula } from '@/types';

interface AulaDB {
  id: string;
  pacote_id: string;
  data: string;
  horario: string;
  duracao: number;
  status: 'proposta' | 'confirmada' | 'agendada' | 'realizada' | 'cancelada';
  proposta_por: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

function mapAulaFromDB(aula: AulaDB): Aula {
  return {
    id: aula.id,
    data: aula.data,
    horario: aula.horario,
    duracao: aula.duracao,
    status: aula.status === 'agendada' ? 'confirmada' : aula.status as Aula['status'],
    propostaPor: (aula.proposta_por as 'aluno' | 'instrutor') || 'aluno',
    observacoes: aula.observacoes || undefined,
  };
}

export function useAulas(pacoteId?: string) {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAulas = useCallback(async () => {
    if (!pacoteId) {
      setAulas([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('aulas')
        .select('*')
        .eq('pacote_id', pacoteId)
        .order('data', { ascending: true })
        .order('horario', { ascending: true });

      if (error) throw error;

      setAulas((data || []).map(mapAulaFromDB));
    } catch (error) {
      console.error('Erro ao buscar aulas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as aulas.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [pacoteId, toast]);

  useEffect(() => {
    fetchAulas();
  }, [fetchAulas]);

  const proporAula = async (data: { data: string; horario: string; duracao: number; observacoes?: string }) => {
    if (!pacoteId || !currentUser) return null;

    try {
      // Check for conflicts
      const hasConflict = await checkConflict(data.data, data.horario, data.duracao);
      if (hasConflict) {
        toast({
          title: 'Conflito de Horário',
          description: 'O instrutor já tem uma aula neste horário.',
          variant: 'destructive',
        });
        return null;
      }

      const { data: newAula, error } = await supabase
        .from('aulas')
        .insert({
          pacote_id: pacoteId,
          data: data.data,
          horario: data.horario,
          duracao: data.duracao,
          observacoes: data.observacoes,
          status: 'proposta',
          proposta_por: currentUser.tipo,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchAulas();
      toast({
        title: 'Aula Proposta',
        description: 'Aguardando confirmação do instrutor.',
      });

      return mapAulaFromDB(newAula);
    } catch (error) {
      console.error('Erro ao propor aula:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível propor a aula.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const confirmarAula = async (aulaId: string) => {
    try {
      const { error } = await supabase
        .from('aulas')
        .update({ status: 'confirmada' })
        .eq('id', aulaId);

      if (error) throw error;

      await fetchAulas();
      toast({
        title: 'Aula Confirmada',
        description: 'A aula foi confirmada com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao confirmar aula:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível confirmar a aula.',
        variant: 'destructive',
      });
    }
  };

  const marcarRealizada = async (aulaId: string) => {
    try {
      const aula = aulas.find(a => a.id === aulaId);
      if (!aula) return;

      const { error } = await supabase
        .from('aulas')
        .update({ status: 'realizada' })
        .eq('id', aulaId);

      if (error) throw error;

      // Update package hours
      await supabase.rpc('increment_horas_utilizadas', {
        p_pacote_id: pacoteId,
        p_horas: aula.duracao,
      }).then(() => {}).catch(() => {});

      await fetchAulas();
      toast({
        title: 'Aula Realizada',
        description: 'A aula foi marcada como realizada.',
      });
    } catch (error) {
      console.error('Erro ao marcar aula como realizada:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível marcar a aula como realizada.',
        variant: 'destructive',
      });
    }
  };

  const cancelarAula = async (aulaId: string) => {
    try {
      const { error } = await supabase
        .from('aulas')
        .update({ status: 'cancelada' })
        .eq('id', aulaId);

      if (error) throw error;

      await fetchAulas();
      toast({
        title: 'Aula Cancelada',
        description: 'A aula foi cancelada.',
      });
    } catch (error) {
      console.error('Erro ao cancelar aula:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível cancelar a aula.',
        variant: 'destructive',
      });
    }
  };

  const checkConflict = async (data: string, horario: string, duracao: number): Promise<boolean> => {
    if (!pacoteId) return false;

    try {
      // Get the instructor ID from the package
      const { data: pacote } = await supabase
        .from('pacotes')
        .select('instrutor_id')
        .eq('id', pacoteId)
        .single();

      if (!pacote) return false;

      // Get all confirmed/scheduled lessons for this instructor on this date
      const { data: aulasDoDia } = await supabase
        .from('aulas')
        .select('horario, duracao, pacotes!inner(instrutor_id)')
        .eq('data', data)
        .in('status', ['confirmada', 'agendada'])
        .eq('pacotes.instrutor_id', pacote.instrutor_id);

      if (!aulasDoDia || aulasDoDia.length === 0) return false;

      // Convert time strings to minutes for comparison
      const toMinutes = (time: string) => {
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m;
      };

      const newStart = toMinutes(horario);
      const newEnd = newStart + duracao * 60;

      // Check for overlaps
      return aulasDoDia.some((aula) => {
        const existingStart = toMinutes(aula.horario);
        const existingEnd = existingStart + aula.duracao * 60;
        return newStart < existingEnd && newEnd > existingStart;
      });
    } catch (error) {
      console.error('Erro ao verificar conflito:', error);
      return false;
    }
  };

  return {
    aulas,
    loading,
    proporAula,
    confirmarAula,
    marcarRealizada,
    cancelarAula,
    refetch: fetchAulas,
  };
}
