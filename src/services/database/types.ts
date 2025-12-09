// Tipos abstratos para banco de dados - prontos para migração futura
export interface QueryResult<T> {
  data: T | null;
  error?: string;
}

export interface DatabaseProvider {
  // Instrutores
  getInstrutores: () => Promise<QueryResult<any[]>>;
  getInstrutorById: (id: string) => Promise<QueryResult<any>>;
  updateInstrutor: (id: string, data: Partial<any>) => Promise<QueryResult<any>>;
  createInstrutor: (data: any) => Promise<QueryResult<any>>;
  
  // Alunos
  getAlunos: () => Promise<QueryResult<any[]>>;
  getAlunoById: (id: string) => Promise<QueryResult<any>>;
  updateAluno: (id: string, data: Partial<any>) => Promise<QueryResult<any>>;
  createAluno: (data: any) => Promise<QueryResult<any>>;
  
  // Favoritos
  getFavoritos: (alunoId: string) => Promise<QueryResult<string[]>>;
  toggleFavorito: (alunoId: string, instrutorId: string) => Promise<QueryResult<boolean>>;
  
  // Pacotes
  getPacotes: (userId: string, userType: 'aluno' | 'instrutor') => Promise<QueryResult<any[]>>;
  createPacote: (data: any) => Promise<QueryResult<any>>;
  updatePacote: (id: string, data: Partial<any>) => Promise<QueryResult<any>>;
}
