export interface Avaliacao {
  id: string;
  autor: string;
  alunoId: string;
  nota: number;
  comentario: string;
  data: string;
  pacoteId?: string; // Vinculado a um pacote de aulas
}

export interface Instrutor {
  id: string;
  nome: string;
  foto: string;
  credenciamentoDetran: string;
  categorias: string[]; // Múltiplas categorias (A, B, C, D, E)
  anosExperiencia: number;
  precoHora: number;
  cidade: string;
  bairrosAtendimento: string[];
  temVeiculo: boolean;
  bio: string;
  avaliacaoMedia: number;
  avaliacoes: Avaliacao[];
  rankingPosicao?: number;
}

export interface Aluno {
  id: string;
  nome: string;
  foto: string;
  cidade: string;
  favoritos: string[];
}

export type UserType = 'instrutor' | 'aluno';

export interface CurrentUser {
  id: string;
  tipo: UserType;
  data: Instrutor | Aluno;
}

// Sistema de Pacotes de Aulas
export type StatusPacote = 'pendente' | 'confirmado' | 'em_andamento' | 'concluido' | 'cancelado';

export type StatusAula = 'proposta' | 'confirmada' | 'realizada' | 'cancelada';

export interface Aula {
  id: string;
  data: string;
  horario: string;
  duracao: number; // em horas
  status: StatusAula;
  observacoes?: string;
  propostaPor: 'aluno' | 'instrutor'; // Quem propôs a aula
}

export interface PacoteAulas {
  id: string;
  alunoId: string;
  instrutorId: string;
  quantidadeHoras: number;
  horasUtilizadas: number;
  precoTotal: number;
  taxaPlataforma: number; // Percentual da plataforma (fixo em 10%)
  valorPlataforma: number; // Valor em reais que a plataforma recebe
  status: StatusPacote;
  dataCriacao: string;
  dataConfirmacao?: string;
  dataConclusao?: string;
  aulas: Aula[];
  avaliacaoLiberada: boolean;
  avaliacaoRealizada: boolean;
}

// Taxa fixa da plataforma
export const TAXA_PLATAFORMA = 10; // 10% de comissão

// Opções de pacotes para alunos
export interface OpcaoPacote {
  id: string;
  horas: number;
  desconto: number; // Percentual de desconto
  popular: boolean;
}

export const OPCOES_PACOTE: OpcaoPacote[] = [
  { id: 'pacote-5', horas: 5, desconto: 0, popular: false },
  { id: 'pacote-10', horas: 10, desconto: 5, popular: true },
  { id: 'pacote-20', horas: 20, desconto: 10, popular: false },
  { id: 'pacote-30', horas: 30, desconto: 15, popular: false },
];