import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CurrentUser, Instrutor, Aluno, UserType } from '@/types';
import usersData from '@/data/users.json';

interface AuthContextType {
  currentUser: CurrentUser | null;
  login: (userId: string, tipo: UserType) => void;
  logout: () => void;
  instrutores: Instrutor[];
  alunos: Aluno[];
  updateInstrutor: (instrutor: Instrutor) => void;
  toggleFavorito: (instrutorId: string) => void;
  isFavorito: (instrutorId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'instrutor_plus_user';
const FAVORITES_KEY = 'instrutor_plus_favorites';
const INSTRUTORES_KEY = 'instrutor_plus_instrutores';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [instrutores, setInstrutores] = useState<Instrutor[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load initial data
  useEffect(() => {
    // Load instrutores from localStorage or JSON
    const storedInstrutores = localStorage.getItem(INSTRUTORES_KEY);
    if (storedInstrutores) {
      setInstrutores(JSON.parse(storedInstrutores));
    } else {
      setInstrutores(usersData.instrutores as Instrutor[]);
    }

    setAlunos(usersData.alunos as Aluno[]);

    // Load stored user
    const storedUser = localStorage.getItem(STORAGE_KEY);
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setCurrentUser(parsed);
    }

    // Load favorites
    const storedFavorites = localStorage.getItem(FAVORITES_KEY);
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, []);

  const login = (userId: string, tipo: UserType) => {
    let userData: Instrutor | Aluno | undefined;
    
    if (tipo === 'instrutor') {
      userData = instrutores.find(i => i.id === userId);
    } else {
      userData = alunos.find(a => a.id === userId);
    }

    if (userData) {
      const user: CurrentUser = {
        id: userId,
        tipo,
        data: userData
      };
      setCurrentUser(user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const updateInstrutor = (instrutor: Instrutor) => {
    const updated = instrutores.map(i => 
      i.id === instrutor.id ? instrutor : i
    );
    setInstrutores(updated);
    localStorage.setItem(INSTRUTORES_KEY, JSON.stringify(updated));

    // Update current user if it's the same instrutor
    if (currentUser?.id === instrutor.id) {
      const updatedUser: CurrentUser = {
        ...currentUser,
        data: instrutor
      };
      setCurrentUser(updatedUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    }
  };

  const toggleFavorito = (instrutorId: string) => {
    const newFavorites = favorites.includes(instrutorId)
      ? favorites.filter(id => id !== instrutorId)
      : [...favorites, instrutorId];
    
    setFavorites(newFavorites);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
  };

  const isFavorito = (instrutorId: string) => {
    return favorites.includes(instrutorId);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      login,
      logout,
      instrutores,
      alunos,
      updateInstrutor,
      toggleFavorito,
      isFavorito
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
