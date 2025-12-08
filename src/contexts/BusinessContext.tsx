import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PacoteAulas, Aula, StatusPacote, PLANOS_ASSINATURA, OPCOES_PACOTE } from '@/types';
import { useAuth } from './AuthContext';

interface BusinessContextType {
  // Pacotes
  pacotes: PacoteAulas[];
  criarPacote: (instrutorId: string, horas: number) => PacoteAulas | null;
  confirmarPacote: (pacoteId: string) => void;
  cancelarPacote: (pacoteId: string) => void;
  agendarAula: (pacoteId: string, data: string, horario: string, duracao: number) => void;
  concluirAula: (pacoteId: string, aulaId: string) => void;
  getPacotesAluno: () => PacoteAulas[];
  getPacotesInstrutor: () => PacoteAulas[];
  getPacoteById: (pacoteId: string) => PacoteAulas | undefined;
  
  // Assinatura Instrutor
  assinarPlano: (plano: 'basico' | 'profissional' | 'premium') => void;
  cancelarAssinatura: () => void;
  verificarAssinaturaAtiva: (instrutorId: string) => boolean;
  
  // Avaliações
  podeAvaliar: (pacoteId: string) => boolean;
  enviarAvaliacao: (pacoteId: string, nota: number, comentario: string) => void;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

const PACOTES_KEY = 'instrutor_plus_pacotes';
const TAXA_PLATAFORMA = 10; // 10% padrão

export function BusinessProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const { currentUser, instrutores, updateInstrutor } = auth || { currentUser: null, instrutores: [], updateInstrutor: () => {} };
  const [pacotes, setPacotes] = useState<PacoteAulas[]>([]);

  // Load initial data
  useEffect(() => {
    const storedPacotes = localStorage.getItem(PACOTES_KEY);
    if (storedPacotes) {
      setPacotes(JSON.parse(storedPacotes));
    }
  }, []);

  // Persist pacotes
  const savePacotes = (newPacotes: PacoteAulas[]) => {
    setPacotes(newPacotes);
    localStorage.setItem(PACOTES_KEY, JSON.stringify(newPacotes));
  };

  // ========== PACOTES ==========
  const criarPacote = (instrutorId: string, horas: number): PacoteAulas | null => {
    if (!currentUser || currentUser.tipo !== 'aluno') return null;
    
    const instrutor = instrutores.find(i => i.id === instrutorId);
    if (!instrutor) return null;

    const opcao = OPCOES_PACOTE.find(o => o.horas === horas);
    const desconto = opcao?.desconto || 0;
    const precoBase = instrutor.precoHora * horas;
    const precoComDesconto = precoBase * (1 - desconto / 100);
    
    // Buscar taxa do plano do instrutor
    const plano = PLANOS_ASSINATURA.find(p => p.id === instrutor.assinaturaPlano);
    const taxaAula = plano?.taxaAula || TAXA_PLATAFORMA;

    const novoPacote: PacoteAulas = {
      id: `pacote-${Date.now()}`,
      alunoId: currentUser.id,
      instrutorId,
      quantidadeHoras: horas,
      horasUtilizadas: 0,
      precoTotal: precoComDesconto,
      taxaPlataforma: taxaAula,
      status: 'pendente',
      dataCriacao: new Date().toISOString(),
      aulas: [],
      avaliacaoLiberada: false,
      avaliacaoRealizada: false,
    };

    const newPacotes = [...pacotes, novoPacote];
    savePacotes(newPacotes);

    return novoPacote;
  };

  const confirmarPacote = (pacoteId: string) => {
    const updated = pacotes.map(p => {
      if (p.id === pacoteId && p.status === 'pendente') {
        return {
          ...p,
          status: 'confirmado' as StatusPacote,
          dataConfirmacao: new Date().toISOString(),
        };
      }
      return p;
    });
    savePacotes(updated);
  };

  const cancelarPacote = (pacoteId: string) => {
    const updated = pacotes.map(p => {
      if (p.id === pacoteId && ['pendente', 'confirmado'].includes(p.status)) {
        return { ...p, status: 'cancelado' as StatusPacote };
      }
      return p;
    });
    savePacotes(updated);
  };

  const agendarAula = (pacoteId: string, data: string, horario: string, duracao: number) => {
    const updated = pacotes.map(p => {
      if (p.id === pacoteId) {
        const novaAula: Aula = {
          id: `aula-${Date.now()}`,
          data,
          horario,
          duracao,
          status: 'agendada',
        };
        return {
          ...p,
          status: 'em_andamento' as StatusPacote,
          aulas: [...p.aulas, novaAula],
        };
      }
      return p;
    });
    savePacotes(updated);
  };

  const concluirAula = (pacoteId: string, aulaId: string) => {
    const updated = pacotes.map(p => {
      if (p.id === pacoteId) {
        const aulasAtualizadas = p.aulas.map(a => {
          if (a.id === aulaId) {
            return { ...a, status: 'realizada' as const };
          }
          return a;
        });
        
        const aula = p.aulas.find(a => a.id === aulaId);
        const novasHorasUtilizadas = p.horasUtilizadas + (aula?.duracao || 0);
        const concluido = novasHorasUtilizadas >= p.quantidadeHoras;

        return {
          ...p,
          aulas: aulasAtualizadas,
          horasUtilizadas: novasHorasUtilizadas,
          status: concluido ? 'concluido' as StatusPacote : p.status,
          dataConclusao: concluido ? new Date().toISOString() : undefined,
          avaliacaoLiberada: concluido,
        };
      }
      return p;
    });
    savePacotes(updated);
  };

  const getPacotesAluno = () => {
    if (!currentUser || currentUser.tipo !== 'aluno') return [];
    return pacotes.filter(p => p.alunoId === currentUser.id);
  };

  const getPacotesInstrutor = () => {
    if (!currentUser || currentUser.tipo !== 'instrutor') return [];
    return pacotes.filter(p => p.instrutorId === currentUser.id);
  };

  const getPacoteById = (pacoteId: string) => {
    return pacotes.find(p => p.id === pacoteId);
  };

  // ========== ASSINATURA ==========
  const assinarPlano = (plano: 'basico' | 'profissional' | 'premium') => {
    if (!currentUser || currentUser.tipo !== 'instrutor') return;

    const instrutor = instrutores.find(i => i.id === currentUser.id);
    if (!instrutor) return;

    const expiraEm = new Date();
    expiraEm.setMonth(expiraEm.getMonth() + 1);

    updateInstrutor({
      ...instrutor,
      assinaturaAtiva: true,
      assinaturaPlano: plano,
      assinaturaExpira: expiraEm.toISOString(),
    });
  };

  const cancelarAssinatura = () => {
    if (!currentUser || currentUser.tipo !== 'instrutor') return;

    const instrutor = instrutores.find(i => i.id === currentUser.id);
    if (!instrutor) return;

    updateInstrutor({
      ...instrutor,
      assinaturaAtiva: false,
      assinaturaPlano: undefined,
      assinaturaExpira: undefined,
    });
  };

  const verificarAssinaturaAtiva = (instrutorId: string) => {
    const instrutor = instrutores.find(i => i.id === instrutorId);
    if (!instrutor) return false;
    
    if (!instrutor.assinaturaAtiva || !instrutor.assinaturaExpira) return false;
    
    return new Date(instrutor.assinaturaExpira) > new Date();
  };

  // ========== AVALIAÇÕES ==========
  const podeAvaliar = (pacoteId: string): boolean => {
    const pacote = pacotes.find(p => p.id === pacoteId);
    if (!pacote) return false;
    return pacote.avaliacaoLiberada && !pacote.avaliacaoRealizada;
  };

  const enviarAvaliacao = (pacoteId: string, nota: number, comentario: string) => {
    if (!currentUser || currentUser.tipo !== 'aluno') return;
    
    const pacote = pacotes.find(p => p.id === pacoteId);
    if (!pacote || !podeAvaliar(pacoteId)) return;

    const instrutor = instrutores.find(i => i.id === pacote.instrutorId);
    if (!instrutor) return;

    // Criar avaliação
    const novaAvaliacao = {
      id: `av-${Date.now()}`,
      autor: (currentUser.data as { nome: string }).nome,
      alunoId: currentUser.id,
      nota,
      comentario,
      data: new Date().toISOString().split('T')[0],
      pacoteId,
    };

    // Atualizar instrutor com nova avaliação
    const novasAvaliacoes = [...instrutor.avaliacoes, novaAvaliacao];
    const novaMedia = novasAvaliacoes.reduce((acc, av) => acc + av.nota, 0) / novasAvaliacoes.length;

    updateInstrutor({
      ...instrutor,
      avaliacoes: novasAvaliacoes,
      avaliacaoMedia: Math.round(novaMedia * 10) / 10,
    });

    // Marcar pacote como avaliado
    const updatedPacotes = pacotes.map(p => {
      if (p.id === pacoteId) {
        return { ...p, avaliacaoRealizada: true };
      }
      return p;
    });
    savePacotes(updatedPacotes);
  };

  return (
    <BusinessContext.Provider value={{
      pacotes,
      criarPacote,
      confirmarPacote,
      cancelarPacote,
      agendarAula,
      concluirAula,
      getPacotesAluno,
      getPacotesInstrutor,
      getPacoteById,
      assinarPlano,
      cancelarAssinatura,
      verificarAssinaturaAtiva,
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
