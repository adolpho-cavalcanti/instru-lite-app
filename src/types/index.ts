export interface Review {
  id: string;
  author: string;
  studentId: string;
  rating: number;
  comment: string;
  date: string;
  packageId?: string;
}

// Legacy Portuguese aliases
export type Avaliacao = Review;

export interface Instructor {
  id: string;
  name: string;
  photo: string;
  detranCredential: string;
  category: string;
  yearsExperience: number;
  hourlyRate: number;
  city: string;
  serviceAreas: string[];
  hasVehicle: boolean;
  bio: string;
  averageRating: number;
  reviews: Review[];
  rankingPosition?: number;
}

// Legacy Portuguese alias
export type Instrutor = Instructor;

export interface Student {
  id: string;
  name: string;
  photo: string;
  city: string;
  favorites: string[];
}

// Legacy Portuguese alias
export type Aluno = Student;

export type UserType = 'instrutor' | 'aluno';

export interface CurrentUser {
  id: string;
  tipo: UserType;
  data: Instructor | Student;
}

export type PackageStatus = 'pendente' | 'confirmado' | 'em_andamento' | 'concluido' | 'cancelado';
export type StatusPacote = PackageStatus;

export interface Lesson {
  id: string;
  date: string;
  time: string;
  duration: number;
  status: 'agendada' | 'realizada' | 'cancelada';
  notes?: string;
}

export type Aula = Lesson;

export interface LessonPackage {
  id: string;
  studentId: string;
  instructorId: string;
  totalHours: number;
  usedHours: number;
  totalPrice: number;
  platformFee: number;
  platformAmount: number;
  status: PackageStatus;
  createdAt: string;
  confirmedAt?: string;
  completedAt?: string;
  lessons: Lesson[];
  reviewEnabled: boolean;
  reviewCompleted: boolean;
  // Legacy aliases
  alunoId?: string;
  instrutorId?: string;
  quantidadeHoras?: number;
  horasUtilizadas?: number;
  precoTotal?: number;
  taxaPlataforma?: number;
  valorPlataforma?: number;
  dataCriacao?: string;
  dataConfirmacao?: string;
  dataConclusao?: string;
  aulas?: Lesson[];
  avaliacaoLiberada?: boolean;
  avaliacaoRealizada?: boolean;
}

export type PacoteAulas = LessonPackage;

export const PLATFORM_FEE = 10;
export const TAXA_PLATAFORMA = PLATFORM_FEE;

export interface PackageOption {
  id: string;
  hours: number;
  discount: number;
  popular: boolean;
  // Legacy aliases
  horas?: number;
  desconto?: number;
}

export type OpcaoPacote = PackageOption;

export const PACKAGE_OPTIONS: PackageOption[] = [
  { id: 'package-5', hours: 5, discount: 0, popular: false, horas: 5, desconto: 0 },
  { id: 'package-10', hours: 10, discount: 5, popular: true, horas: 10, desconto: 5 },
  { id: 'package-20', hours: 20, discount: 10, popular: false, horas: 20, desconto: 10 },
  { id: 'package-30', hours: 30, discount: 15, popular: false, horas: 30, desconto: 15 },
];

export const OPCOES_PACOTE = PACKAGE_OPTIONS;
