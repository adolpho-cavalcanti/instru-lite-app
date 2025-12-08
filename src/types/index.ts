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
  categoria: string;
  anosExperiencia: number;
  precoHora: number;
  cidade: string;
  bairrosAtendimento: string[];
  temVeiculo: boolean;
  bio: string;
  avaliacaoMedia: number;
  avaliacoes: Avaliacao[];
  // Modelo de assinatura
  assinaturaAtiva: boolean;
  assinaturaPlano?: 'basico' | 'profissional' | 'premium';
  assinaturaExpira?: string;
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

export interface Aula {
  id: string;
  data: string;
  horario: string;
  duracao: number; // em horas
  status: 'agendada' | 'realizada' | 'cancelada';
  observacoes?: string;
}

export interface PacoteAulas {
  id: string;
  alunoId: string;
  instrutorId: string;
  quantidadeHoras: number;
  horasUtilizadas: number;
  precoTotal: number;
  taxaPlataforma: number; // Percentual da plataforma
  status: StatusPacote;
  dataCriacao: string;
  dataConfirmacao?: string;
  dataConclusao?: string;
  aulas: Aula[];
  avaliacaoLiberada: boolean;
  avaliacaoRealizada: boolean;
}

// Planos de Assinatura
export interface PlanoAssinatura {
  id: 'basico' | 'profissional' | 'premium';
  nome: string;
  preco: number;
  descricao: string;
  beneficios: string[];
  destaque: boolean;
  taxaAula: number; // Percentual cobrado por aula
}

export const PLANOS_ASSINATURA: PlanoAssinatura[] = [
  {
    id: 'basico',
    nome: 'Básico',
    preco: 49.90,
    descricao: 'Ideal para começar',
    beneficios: [
      'Perfil público na plataforma',
      'Receber até 5 avaliações/mês',
      'Aparecer na busca',
      'Receber solicitações de alunos',
    ],
    destaque: false,
    taxaAula: 15,
  },
  {
    id: 'profissional',
    nome: 'Profissional',
    preco: 99.90,
    descricao: 'Mais visibilidade',
    beneficios: [
      'Tudo do plano Básico',
      'Avaliações ilimitadas',
      'Destaque na busca',
      'Selo "Profissional"',
      'Relatórios de desempenho',
    ],
    destaque: true,
    taxaAula: 10,
  },
  {
    id: 'premium',
    nome: 'Premium',
    preco: 199.90,
    descricao: 'Máxima exposição',
    beneficios: [
      'Tudo do plano Profissional',
      'Topo do ranking',
      'Selo "Premium" dourado',
      'Suporte prioritário',
      'Sem taxa por aula',
    ],
    destaque: false,
    taxaAula: 0,
  },
];

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
