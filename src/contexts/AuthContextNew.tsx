import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Types
export type UserType = 'instrutor' | 'aluno';

export interface Profile {
  id: string;
  user_id: string;
  tipo: UserType;
  nome: string;
  foto: string | null;
  cidade: string;
  created_at: string;
  updated_at: string;
}

export interface Instrutor {
  id: string;
  profile_id: string;
  credenciamento_detran: string;
  categoria: string;
  anos_experiencia: number;
  preco_hora: number;
  bairros_atendimento: string[];
  tem_veiculo: boolean;
  bio: string | null;
  avaliacao_media: number;
  ranking_posicao: number | null;
  stripe_customer_id: string | null;
  stripe_account_id: string | null;
  profile?: Profile;
}

export interface Aluno {
  id: string;
  profile_id: string;
  stripe_customer_id: string | null;
  profile?: Profile;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  instrutorData: Instrutor | null;
  alunoData: Aluno | null;
  isLoading: boolean;
  userType: UserType | null;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  // Instrutor helpers
  instrutores: Instrutor[];
  getInstrutorById: (id: string) => Instrutor | undefined;
  // Favoritos
  favoritos: string[];
  toggleFavorito: (instrutorId: string) => Promise<void>;
  isFavorito: (instrutorId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProviderNew({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [instrutorData, setInstrutorData] = useState<Instrutor | null>(null);
  const [alunoData, setAlunoData] = useState<Aluno | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [instrutores, setInstrutores] = useState<Instrutor[]>([]);
  const [favoritos, setFavoritos] = useState<string[]>([]);

  const userType = profile?.tipo || null;

  // Fetch profile data
  const fetchProfileData = async (userId: string) => {
    try {
      // Get profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return;
      }

      if (!profileData) {
        console.log('No profile found for user');
        return;
      }

      setProfile(profileData);

      // Get type-specific data
      if (profileData.tipo === 'instrutor') {
        const { data: instData } = await supabase
          .from('instrutores')
          .select('*')
          .eq('profile_id', profileData.id)
          .maybeSingle();

        if (instData) {
          setInstrutorData(instData);
        }
      } else {
        const { data: alunoDataResult } = await supabase
          .from('alunos')
          .select('*')
          .eq('profile_id', profileData.id)
          .maybeSingle();

        if (alunoDataResult) {
          setAlunoData(alunoDataResult);
          
          // Fetch favoritos for alunos
          const { data: favData } = await supabase
            .from('favoritos')
            .select('instrutor_id')
            .eq('aluno_id', alunoDataResult.id);

          if (favData) {
            setFavoritos(favData.map(f => f.instrutor_id));
          }
        }
      }
    } catch (error) {
      console.error('Error in fetchProfileData:', error);
    }
  };

  // Fetch all instrutores
  const fetchInstrutores = async () => {
    try {
      const { data, error } = await supabase
        .from('instrutores')
        .select(`
          *,
          profile:profiles(*)
        `)
        .order('avaliacao_media', { ascending: false });

      if (error) {
        console.error('Error fetching instrutores:', error);
        return;
      }

      setInstrutores(data || []);
    } catch (error) {
      console.error('Error in fetchInstrutores:', error);
    }
  };

  // Initialize auth
  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          // Defer profile fetch to avoid deadlock
          setTimeout(() => {
            fetchProfileData(newSession.user.id);
          }, 0);
        } else {
          // Clear all data on logout
          setProfile(null);
          setInstrutorData(null);
          setAlunoData(null);
          setFavoritos([]);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);

      if (existingSession?.user) {
        fetchProfileData(existingSession.user.id);
      }
      setIsLoading(false);
    });

    // Fetch instrutores for all users
    fetchInstrutores();

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logout realizado com sucesso');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfileData(user.id);
    }
    await fetchInstrutores();
  };

  const getInstrutorById = (id: string) => {
    return instrutores.find(i => i.id === id);
  };

  const toggleFavorito = async (instrutorId: string) => {
    if (!alunoData) {
      toast.error('Você precisa estar logado como aluno');
      return;
    }

    const isFav = favoritos.includes(instrutorId);

    try {
      if (isFav) {
        // Remove from favoritos
        const { error } = await supabase
          .from('favoritos')
          .delete()
          .eq('aluno_id', alunoData.id)
          .eq('instrutor_id', instrutorId);

        if (error) throw error;

        setFavoritos(prev => prev.filter(id => id !== instrutorId));
        toast.success('Removido dos favoritos');
      } else {
        // Add to favoritos
        const { error } = await supabase
          .from('favoritos')
          .insert({
            aluno_id: alunoData.id,
            instrutor_id: instrutorId
          });

        if (error) throw error;

        setFavoritos(prev => [...prev, instrutorId]);
        toast.success('Adicionado aos favoritos');
      }
    } catch (error) {
      console.error('Error toggling favorito:', error);
      toast.error('Erro ao atualizar favoritos');
    }
  };

  const isFavorito = (instrutorId: string) => {
    return favoritos.includes(instrutorId);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      instrutorData,
      alunoData,
      isLoading,
      userType,
      signOut,
      refreshProfile,
      instrutores,
      getInstrutorById,
      favoritos,
      toggleFavorito,
      isFavorito
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthNew() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthNew must be used within an AuthProviderNew');
  }
  return context;
}
