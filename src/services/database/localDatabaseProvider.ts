// Provider local usando JSON + localStorage (implementação atual)
import { DatabaseProvider, QueryResult } from './types';
import usersData from '@/data/users.json';
import { Instrutor, Aluno, PacoteAulas } from '@/types';

const INSTRUTORES_KEY = 'instrutor_plus_instrutores';
const ALUNOS_KEY = 'instrutor_plus_alunos';
const FAVORITES_KEY = 'instrutor_plus_favorites';
const PACOTES_KEY = 'instrutor_plus_pacotes';

// Helpers para localStorage
const getStoredData = <T>(key: string, defaultValue: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultValue;
};

const setStoredData = <T>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const localDatabaseProvider: DatabaseProvider = {
  // Instrutores
  getInstrutores: async (): Promise<QueryResult<Instrutor[]>> => {
    try {
      const stored = getStoredData<any[]>(INSTRUTORES_KEY, usersData.instrutores as any[]);
      // Convert old 'categoria' to 'categorias' array if needed
      const normalized = stored.map((inst: any) => ({
        ...inst,
        categorias: inst.categorias || (inst.categoria ? [inst.categoria] : ['B']),
      }));
      return { data: normalized as Instrutor[] };
    } catch (error) {
      return { data: null, error: 'Erro ao carregar instrutores' };
    }
  },

  getInstrutorById: async (id: string): Promise<QueryResult<Instrutor>> => {
    try {
      const instrutores = getStoredData<any[]>(INSTRUTORES_KEY, usersData.instrutores as any[]);
      const inst = instrutores.find(i => i.id === id);
      if (!inst) return { data: null };
      const instrutor = {
        ...inst,
        categorias: inst.categorias || (inst.categoria ? [inst.categoria] : ['B']),
      };
      return { data: instrutor as Instrutor };
    } catch (error) {
      return { data: null, error: 'Erro ao carregar instrutor' };
    }
  },

  updateInstrutor: async (id: string, data: Partial<Instrutor>): Promise<QueryResult<Instrutor>> => {
    try {
      const instrutores = getStoredData<any[]>(INSTRUTORES_KEY, usersData.instrutores as any[]);
      const index = instrutores.findIndex(i => i.id === id);
      if (index === -1) {
        return { data: null, error: 'Instrutor não encontrado' };
      }
      const normalized = {
        ...instrutores[index],
        categorias: instrutores[index].categorias || (instrutores[index].categoria ? [instrutores[index].categoria] : ['B']),
      };
      instrutores[index] = { ...normalized, ...data };
      setStoredData(INSTRUTORES_KEY, instrutores);
      return { data: instrutores[index] as Instrutor };
    } catch (error) {
      return { data: null, error: 'Erro ao atualizar instrutor' };
    }
  },

  createInstrutor: async (data: Instrutor): Promise<QueryResult<Instrutor>> => {
    try {
      const instrutores = getStoredData<any[]>(INSTRUTORES_KEY, usersData.instrutores as any[]);
      const newInstrutor = { ...data, id: `inst-${Date.now()}`, categorias: data.categorias || ['B'] };
      instrutores.push(newInstrutor);
      setStoredData(INSTRUTORES_KEY, instrutores);
      return { data: newInstrutor as Instrutor };
    } catch (error) {
      return { data: null, error: 'Erro ao criar instrutor' };
    }
  },

  // Alunos
  getAlunos: async (): Promise<QueryResult<Aluno[]>> => {
    try {
      const stored = getStoredData<Aluno[]>(ALUNOS_KEY, usersData.alunos as Aluno[]);
      return { data: stored };
    } catch (error) {
      return { data: null, error: 'Erro ao carregar alunos' };
    }
  },

  getAlunoById: async (id: string): Promise<QueryResult<Aluno>> => {
    try {
      const alunos = getStoredData<Aluno[]>(ALUNOS_KEY, usersData.alunos as Aluno[]);
      const aluno = alunos.find(a => a.id === id);
      return { data: aluno || null };
    } catch (error) {
      return { data: null, error: 'Erro ao carregar aluno' };
    }
  },

  updateAluno: async (id: string, data: Partial<Aluno>): Promise<QueryResult<Aluno>> => {
    try {
      const alunos = getStoredData<Aluno[]>(ALUNOS_KEY, usersData.alunos as Aluno[]);
      const index = alunos.findIndex(a => a.id === id);
      if (index === -1) {
        return { data: null, error: 'Aluno não encontrado' };
      }
      alunos[index] = { ...alunos[index], ...data };
      setStoredData(ALUNOS_KEY, alunos);
      return { data: alunos[index] };
    } catch (error) {
      return { data: null, error: 'Erro ao atualizar aluno' };
    }
  },

  createAluno: async (data: Aluno): Promise<QueryResult<Aluno>> => {
    try {
      const alunos = getStoredData<Aluno[]>(ALUNOS_KEY, usersData.alunos as Aluno[]);
      const newAluno = { ...data, id: `aluno-${Date.now()}` };
      alunos.push(newAluno);
      setStoredData(ALUNOS_KEY, alunos);
      return { data: newAluno };
    } catch (error) {
      return { data: null, error: 'Erro ao criar aluno' };
    }
  },

  // Favoritos
  getFavoritos: async (alunoId: string): Promise<QueryResult<string[]>> => {
    try {
      const favorites = getStoredData<string[]>(FAVORITES_KEY, []);
      return { data: favorites };
    } catch (error) {
      return { data: null, error: 'Erro ao carregar favoritos' };
    }
  },

  toggleFavorito: async (alunoId: string, instrutorId: string): Promise<QueryResult<boolean>> => {
    try {
      const favorites = getStoredData<string[]>(FAVORITES_KEY, []);
      const isFavorite = favorites.includes(instrutorId);
      const newFavorites = isFavorite
        ? favorites.filter(id => id !== instrutorId)
        : [...favorites, instrutorId];
      setStoredData(FAVORITES_KEY, newFavorites);
      return { data: !isFavorite };
    } catch (error) {
      return { data: null, error: 'Erro ao atualizar favorito' };
    }
  },

  // Pacotes
  getPacotes: async (userId: string, userType: 'aluno' | 'instrutor'): Promise<QueryResult<PacoteAulas[]>> => {
    try {
      const pacotes = getStoredData<PacoteAulas[]>(PACOTES_KEY, []);
      const filtered = pacotes.filter(p => 
        userType === 'aluno' ? p.alunoId === userId : p.instrutorId === userId
      );
      return { data: filtered };
    } catch (error) {
      return { data: null, error: 'Erro ao carregar pacotes' };
    }
  },

  createPacote: async (data: PacoteAulas): Promise<QueryResult<PacoteAulas>> => {
    try {
      const pacotes = getStoredData<PacoteAulas[]>(PACOTES_KEY, []);
      const newPacote = { ...data, id: `pacote-${Date.now()}` };
      pacotes.push(newPacote);
      setStoredData(PACOTES_KEY, pacotes);
      return { data: newPacote };
    } catch (error) {
      return { data: null, error: 'Erro ao criar pacote' };
    }
  },

  updatePacote: async (id: string, data: Partial<PacoteAulas>): Promise<QueryResult<PacoteAulas>> => {
    try {
      const pacotes = getStoredData<PacoteAulas[]>(PACOTES_KEY, []);
      const index = pacotes.findIndex(p => p.id === id);
      if (index === -1) {
        return { data: null, error: 'Pacote não encontrado' };
      }
      pacotes[index] = { ...pacotes[index], ...data };
      setStoredData(PACOTES_KEY, pacotes);
      return { data: pacotes[index] };
    } catch (error) {
      return { data: null, error: 'Erro ao atualizar pacote' };
    }
  }
};
