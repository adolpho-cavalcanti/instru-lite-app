import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PacoteAulas, StatusPacote, OPCOES_PACOTE, TAXA_PLATAFORMA } from '@/types';
import { useAuthNew } from './AuthContextNew';
import { supabase } from '@/integrations/supabase/client';

interface BusinessContextType {
  // Pacotes
  pacotes: PacoteAulas[];
  criarPacote: (instrutorId: string, horas: number) => Promise<PacoteAulas | null>;
  confirmarPacote: (pacoteId: string) => Promise<void>;
  cancelarPacote: (pacoteId: string) => Promise<void>;
  registrarHorasRealizadas: (pacoteId: string, horas: number) => Promise<void>;
  getPacotesAluno: () => PacoteAulas[];
  getPacotesInstrutor: () => PacoteAulas[];
  getPacoteById: (pacoteId: string) => PacoteAulas | undefined;
  
  // Avaliações
  podeAvaliar: (pacoteId: string) => boolean;
  enviarAvaliacao: (pacoteId: string, nota: number, comentario: string) => Promise<void>;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const { user, userType, alunoData, instrutorData, instrutores } = useAuthNew();
  const [pacotes, setPacotes] = useState<PacoteAulas[]>([]);

  // Load pacotes from Supabase
  useEffect(() => {
    const loadPacotes = async () => {
      if (!user) {
        setPacotes([]);
        return;
      }

      const { data, error } = await supabase
        .from('pacotes')
        .select('*');

      if (!error && data) {
        const mappedPacotes: PacoteAulas[] = data.map(p => ({
          id: p.id,
          alunoId: p.aluno_id,
          instrutorId: p.instrutor_id,
          quantidadeHoras: p.quantidade_horas,
          horasUtilizadas: p.horas_utilizadas,
          precoTotal: p.preco_total,
          taxaPlataforma: p.taxa_plataforma,
          valorPlataforma: p.valor_plataforma,
          status: p.status as StatusPacote,
          dataCriacao: p.created_at,
          dataConfirmacao: p.data_confirmacao || undefined,
          dataConclusao: p.data_conclusao || undefined,
          aulas: [],
          avaliacaoLiberada: p.avaliacao_liberada,
          avaliacaoRealizada: p.avaliacao_realizada,
        }));
        setPacotes(mappedPacotes);
      }
    };

    loadPacotes();
  }, [user]);

  // ========== PACOTES ==========
  const criarPacote = async (instrutorId: string, horas: number): Promise<PacoteAulas | null> => {
    if (!user || userType !== 'aluno' || !alunoData) return null;
    
    const instrutor = instrutores.find(i => i.id === instrutorId);
    if (!instrutor) return null;

    const opcao = OPCOES_PACOTE.find(o => o.horas === horas);
    const desconto = opcao?.desconto || 0;
    const precoBase = instrutor.preco_hora * horas;
    const precoComDesconto = precoBase * (1 - desconto / 100);
    
    // Taxa fixa de 10%
    const valorPlataforma = precoComDesconto * (TAXA_PLATAFORMA / 100);

    const { data, error } = await supabase
      .from('pacotes')
      .insert({
        aluno_id: alunoData.id,
        instrutor_id: instrutorId,
        quantidade_horas: horas,
        horas_utilizadas: 0,
        preco_total: precoComDesconto,
        taxa_plataforma: TAXA_PLATAFORMA,
        valor_plataforma: valorPlataforma,
        status: 'pendente',
      })
      .select()
      .single();

    if (error || !data) return null;

    const novoPacote: PacoteAulas = {
      id: data.id,
      alunoId: data.aluno_id,
      instrutorId: data.instrutor_id,
      quantidadeHoras: data.quantidade_horas,
      horasUtilizadas: data.horas_utilizadas,
      precoTotal: data.preco_total,
      taxaPlataforma: data.taxa_plataforma,
      valorPlataforma: data.valor_plataforma,
      status: data.status as StatusPacote,
      dataCriacao: data.created_at,
      aulas: [],
      avaliacaoLiberada: data.avaliacao_liberada,
      avaliacaoRealizada: data.avaliacao_realizada,
    };

    setPacotes(prev => [...prev, novoPacote]);
    return novoPacote;
  };

  const confirmarPacote = async (pacoteId: string) => {
    const { error } = await supabase
      .from('pacotes')
      .update({
        status: 'confirmado',
        data_confirmacao: new Date().toISOString(),
      })
      .eq('id', pacoteId)
      .eq('status', 'pendente');

    if (!error) {
      setPacotes(prev => prev.map(p => {
        if (p.id === pacoteId && p.status === 'pendente') {
          return {
            ...p,
            status: 'confirmado' as StatusPacote,
            dataConfirmacao: new Date().toISOString(),
          };
        }
        return p;
      }));
    }
  };

  const cancelarPacote = async (pacoteId: string) => {
    const { error } = await supabase
      .from('pacotes')
      .update({ status: 'cancelado' })
      .eq('id', pacoteId)
      .in('status', ['pendente', 'confirmado']);

    if (!error) {
      setPacotes(prev => prev.map(p => {
        if (p.id === pacoteId && ['pendente', 'confirmado'].includes(p.status)) {
          return { ...p, status: 'cancelado' as StatusPacote };
        }
        return p;
      }));
    }
  };

  // Instrutor registra horas realizadas
  const registrarHorasRealizadas = async (pacoteId: string, horas: number) => {
    if (!user || userType !== 'instrutor' || !instrutorData) return;

    const pacote = pacotes.find(p => p.id === pacoteId);
    if (!pacote || pacote.instrutorId !== instrutorData.id) return;

    const novasHorasUtilizadas = Math.min(pacote.horasUtilizadas + horas, pacote.quantidadeHoras);
    const concluido = novasHorasUtilizadas >= pacote.quantidadeHoras;

    const { error } = await supabase
      .from('pacotes')
      .update({
        horas_utilizadas: novasHorasUtilizadas,
        status: concluido ? 'concluido' : 'em_andamento',
        data_conclusao: concluido ? new Date().toISOString() : null,
        avaliacao_liberada: concluido,
      })
      .eq('id', pacoteId);

    if (!error) {
      setPacotes(prev => prev.map(p => {
        if (p.id === pacoteId) {
          return {
            ...p,
            horasUtilizadas: novasHorasUtilizadas,
            status: concluido ? 'concluido' as StatusPacote : 'em_andamento' as StatusPacote,
            dataConclusao: concluido ? new Date().toISOString() : undefined,
            avaliacaoLiberada: concluido,
          };
        }
        return p;
      }));
    }
  };

  const getPacotesAluno = () => {
    if (!user || userType !== 'aluno' || !alunoData) return [];
    return pacotes.filter(p => p.alunoId === alunoData.id);
  };

  const getPacotesInstrutor = () => {
    if (!user || userType !== 'instrutor' || !instrutorData) return [];
    return pacotes.filter(p => p.instrutorId === instrutorData.id);
  };

  const getPacoteById = (pacoteId: string) => {
    return pacotes.find(p => p.id === pacoteId);
  };

  // ========== AVALIAÇÕES ==========
  const podeAvaliar = (pacoteId: string): boolean => {
    const pacote = pacotes.find(p => p.id === pacoteId);
    if (!pacote) return false;
    return pacote.avaliacaoLiberada && !pacote.avaliacaoRealizada;
  };

  const enviarAvaliacao = async (pacoteId: string, nota: number, comentario: string) => {
    if (!user || userType !== 'aluno' || !alunoData) return;
    
    const pacote = pacotes.find(p => p.id === pacoteId);
    if (!pacote || !podeAvaliar(pacoteId)) return;

    // Create avaliacao in database
    const { error: avaliacaoError } = await supabase
      .from('avaliacoes')
      .insert({
        aluno_id: alunoData.id,
        instrutor_id: pacote.instrutorId,
        pacote_id: pacoteId,
        nota,
        comentario,
      });

    if (avaliacaoError) return;

    // Mark pacote as evaluated
    await supabase
      .from('pacotes')
      .update({ avaliacao_realizada: true })
      .eq('id', pacoteId);

    setPacotes(prev => prev.map(p => {
      if (p.id === pacoteId) {
        return { ...p, avaliacaoRealizada: true };
      }
      return p;
    }));
  };

  return (
    <BusinessContext.Provider value={{
      pacotes,
      criarPacote,
      confirmarPacote,
      cancelarPacote,
      registrarHorasRealizadas,
      getPacotesAluno,
      getPacotesInstrutor,
      getPacoteById,
      podeAvaliar,
      enviarAvaliacao,
    }}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
}
