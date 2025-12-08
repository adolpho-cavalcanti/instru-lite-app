export interface Avaliacao {
  id: string;
  autor: string;
  nota: number;
  comentario: string;
  data: string;
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
