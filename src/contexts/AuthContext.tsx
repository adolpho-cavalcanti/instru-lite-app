import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { Instrutor, Aluno, CurrentUser, UserType } from '@/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type DbInstrutor = Database['public']['Tables']['instrutores']['Row'];
type DbAluno = Database['public']['Tables']['alunos']['Row'];

// Instructor data for signup/profile completion
export interface InstrutorSignupData {
  categorias: string[];
  precoHora: number;
  credenciamentoDetran: string;
  temVeiculo: boolean;
  anosExperiencia: number;
}

interface AuthContextType {
  // Supabase auth state
  user: User | null;
  session: Session | null;
  loading: boolean;
  
  // Legacy compatibility
  currentUser: CurrentUser | null;
  instrutores: Instrutor[];
  alunos: Aluno[];
  
  // Auth methods
  signUp: (email: string, password: string, tipo: UserType, nome: string, cidade: string, instrutorData?: InstrutorSignupData) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>; // Alias for signOut
  
  // Profile completion (for OAuth users)
  needsProfileCompletion: boolean;
  completeProfile: (tipo: UserType, nome: string, cidade: string, instrutorData?: InstrutorSignupData) => Promise<{ error: Error | null }>;
  
  // Legacy methods
  updateInstrutor: (instrutor: Instrutor) => void;
  toggleFavorito: (instrutorId: string) => void;
  isFavorito: (instrutorId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Convert DB instructor to legacy format
function toInstrutor(dbInstrutor: DbInstrutor, profile: Profile, avaliacoes: any[] = []): Instrutor {
  // Handle both single categoria and multiple categorias from DB
  const categorias = dbInstrutor.categoria ? [dbInstrutor.categoria] : [];
  
  return {
    id: dbInstrutor.id,
    nome: profile.nome,
    foto: profile.foto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    cidade: profile.cidade,
    credenciamentoDetran: dbInstrutor.credenciamento_detran,
    categorias,
    anosExperiencia: dbInstrutor.anos_experiencia,
    precoHora: Number(dbInstrutor.preco_hora),
    bairrosAtendimento: dbInstrutor.bairros_atendimento || [],
    temVeiculo: dbInstrutor.tem_veiculo,
    bio: dbInstrutor.bio || '',
    avaliacaoMedia: Number(dbInstrutor.avaliacao_media) || 5.0,
    avaliacoes,
    rankingPosicao: dbInstrutor.ranking_posicao || undefined,
  };
}

// Convert DB aluno to legacy format
function toAluno(dbAluno: DbAluno, profile: Profile, favoritos: string[] = []): Aluno {
  return {
    id: dbAluno.id,
    nome: profile.nome,
    foto: profile.foto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    cidade: profile.cidade,
    favoritos,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [instrutores, setInstrutores] = useState<Instrutor[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [userFavoritos, setUserFavoritos] = useState<string[]>([]);
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);

  // Fetch all instructors
  const fetchInstrutores = async () => {
    try {
      const { data: dbInstrutores, error } = await supabase
        .from('instrutores')
        .select(`
          *,
          profiles!instrutores_profile_id_fkey (*)
        `);

      if (error) {
        console.error('Error fetching instrutores:', error);
        return;
      }

      if (dbInstrutores) {
        const mapped = dbInstrutores.map((inst: any) => 
          toInstrutor(inst, inst.profiles, [])
        );
        setInstrutores(mapped);
      }
    } catch (err) {
      console.error('Error fetching instrutores:', err);
    }
  };

  // Fetch all students (for instructor view)
  const fetchAlunos = async () => {
    try {
      const { data: dbAlunos, error } = await supabase
        .from('alunos')
        .select(`
          *,
          profiles!alunos_profile_id_fkey (*)
        `);

      if (error) {
        console.error('Error fetching alunos:', error);
        return;
      }

      if (dbAlunos) {
        const mapped = dbAlunos.map((al: any) => 
          toAluno(al, al.profiles, [])
        );
        setAlunos(mapped);
      }
    } catch (err) {
      console.error('Error fetching alunos:', err);
    }
  };

  // Fetch user's favorites
  const fetchFavoritos = async (alunoId: string) => {
    try {
      const { data, error } = await supabase
        .from('favoritos')
        .select('instrutor_id')
        .eq('aluno_id', alunoId);

      if (error) {
        console.error('Error fetching favoritos:', error);
        return [];
      }

      return data?.map(f => f.instrutor_id) || [];
    } catch (err) {
      console.error('Error fetching favoritos:', err);
      return [];
    }
  };

  // Fetch user profile and role-specific data
  const fetchUserData = async (userId: string): Promise<CurrentUser | null> => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError || !profile) {
        // Profile doesn't exist - user needs to complete profile (OAuth flow)
        setNeedsProfileCompletion(true);
        return null;
      }

      setNeedsProfileCompletion(false);

      if (profile.tipo === 'instrutor') {
        const { data: instrutor } = await supabase
          .from('instrutores')
          .select('*')
          .eq('profile_id', profile.id)
          .single();

        if (instrutor) {
          const legacyInstrutor = toInstrutor(instrutor, profile, []);
          return {
            id: instrutor.id,
            tipo: 'instrutor' as UserType,
            data: legacyInstrutor,
          };
        }
      } else if (profile.tipo === 'aluno') {
        const { data: aluno } = await supabase
          .from('alunos')
          .select('*')
          .eq('profile_id', profile.id)
          .single();

        if (aluno) {
          const favs = await fetchFavoritos(aluno.id);
          setUserFavoritos(favs);
          const legacyAluno = toAluno(aluno, profile, favs);
          return {
            id: aluno.id,
            tipo: 'aluno' as UserType,
            data: legacyAluno,
          };
        }
      }

      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  // Load initial data
  useEffect(() => {
    fetchInstrutores();
    fetchAlunos();
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Defer fetching user data to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchUserData(session.user.id).then(setCurrentUser);
          }, 0);
        } else {
          setCurrentUser(null);
          setUserFavoritos([]);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserData(session.user.id).then((userData) => {
          setCurrentUser(userData);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string, 
    password: string, 
    tipo: UserType, 
    nome: string, 
    cidade: string,
    instrutorData?: InstrutorSignupData
  ): Promise<{ error: Error | null }> => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
        }
      });

      if (error) {
        return { error };
      }

      if (data.user) {
        // Create profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: data.user.id,
            nome,
            cidade,
            tipo,
          })
          .select()
          .single();

        if (profileError) {
          return { error: new Error(profileError.message) };
        }

        // Create role-specific record
        if (tipo === 'instrutor' && instrutorData) {
          const { error: instrutorError } = await supabase
            .from('instrutores')
            .insert({
              profile_id: profile.id,
              categoria: instrutorData.categorias?.[0] as any || 'B',
              preco_hora: instrutorData.precoHora,
              credenciamento_detran: instrutorData.credenciamentoDetran,
              tem_veiculo: instrutorData.temVeiculo,
              anos_experiencia: instrutorData.anosExperiencia,
            });
          
          if (instrutorError) {
            return { error: new Error(instrutorError.message) };
          }
        } else if (tipo === 'instrutor') {
          // Fallback for instrutor without data (shouldn't happen)
          const { error: instrutorError } = await supabase
            .from('instrutores')
            .insert({
              profile_id: profile.id,
              categoria: 'B',
              preco_hora: 80,
              credenciamento_detran: '',
            });
          
          if (instrutorError) {
            return { error: new Error(instrutorError.message) };
          }
        } else {
          const { error: alunoError } = await supabase
            .from('alunos')
            .insert({
              profile_id: profile.id,
            });
          
          if (alunoError) {
            return { error: new Error(alunoError.message) };
          }
        }

        // Refetch data
        await fetchInstrutores();
        await fetchAlunos();
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signIn = async (email: string, password: string): Promise<{ error: Error | null }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signInWithGoogle = async (): Promise<{ error: Error | null }> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        }
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  // Complete profile for OAuth users
  // Complete profile for OAuth users
  const completeProfile = async (
    tipo: UserType,
    nome: string,
    cidade: string,
    instrutorData?: InstrutorSignupData
  ): Promise<{ error: Error | null }> => {
    if (!user) {
      return { error: new Error('User not authenticated') };
    }

    try {
      // Create profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          nome,
          cidade,
          tipo,
          foto: user.user_metadata?.avatar_url || null,
        })
        .select()
        .single();

      if (profileError) {
        return { error: new Error(profileError.message) };
      }

      // Create role-specific record
      if (tipo === 'instrutor' && instrutorData) {
        const { error: instrutorError } = await supabase
          .from('instrutores')
          .insert({
            profile_id: profile.id,
            categoria: instrutorData.categorias?.[0] as any || 'B',
            preco_hora: instrutorData.precoHora,
            credenciamento_detran: instrutorData.credenciamentoDetran,
            tem_veiculo: instrutorData.temVeiculo,
            anos_experiencia: instrutorData.anosExperiencia,
          });

        if (instrutorError) {
          return { error: new Error(instrutorError.message) };
        }
      } else if (tipo === 'instrutor') {
        // Fallback
        const { error: instrutorError } = await supabase
          .from('instrutores')
          .insert({
            profile_id: profile.id,
            categoria: 'B',
            preco_hora: 80,
            credenciamento_detran: '',
          });

        if (instrutorError) {
          return { error: new Error(instrutorError.message) };
        }
      } else {
        const { error: alunoError } = await supabase
          .from('alunos')
          .insert({
            profile_id: profile.id,
          });

        if (alunoError) {
          return { error: new Error(alunoError.message) };
        }
      }

      // Refetch data
      setNeedsProfileCompletion(false);
      await fetchInstrutores();
      await fetchAlunos();
      const userData = await fetchUserData(user.id);
      setCurrentUser(userData);

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setUserFavoritos([]);
    setNeedsProfileCompletion(false);
  };

  // Legacy method alias
  const logout = signOut;

  // Update instructor (legacy)
  const updateInstrutor = async (instrutor: Instrutor) => {
    // Update local state immediately
    setInstrutores(prev => prev.map(i => i.id === instrutor.id ? instrutor : i));
    
    // Update in database
    try {
      await supabase
        .from('instrutores')
        .update({
          bio: instrutor.bio,
          preco_hora: instrutor.precoHora,
          categoria: instrutor.categorias?.[0] as any || 'B',
          anos_experiencia: instrutor.anosExperiencia,
          bairros_atendimento: instrutor.bairrosAtendimento,
          tem_veiculo: instrutor.temVeiculo,
          avaliacao_media: instrutor.avaliacaoMedia,
        })
        .eq('id', instrutor.id);
    } catch (err) {
      console.error('Error updating instrutor:', err);
    }

    // Update current user if it's the same instructor
    if (currentUser?.id === instrutor.id) {
      setCurrentUser({
        ...currentUser,
        data: instrutor,
      });
    }
  };

  // Toggle favorite
  const toggleFavorito = async (instrutorId: string) => {
    if (!currentUser || currentUser.tipo !== 'aluno') return;

    const alunoId = currentUser.id;
    const isFav = userFavoritos.includes(instrutorId);

    if (isFav) {
      // Remove favorite
      setUserFavoritos(prev => prev.filter(id => id !== instrutorId));
      await supabase
        .from('favoritos')
        .delete()
        .eq('aluno_id', alunoId)
        .eq('instrutor_id', instrutorId);
    } else {
      // Add favorite
      setUserFavoritos(prev => [...prev, instrutorId]);
      await supabase
        .from('favoritos')
        .insert({
          aluno_id: alunoId,
          instrutor_id: instrutorId,
        });
    }
  };

  // Check if instructor is favorite
  const isFavorito = (instrutorId: string): boolean => {
    return userFavoritos.includes(instrutorId);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      currentUser,
      instrutores,
      alunos,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      logout,
      needsProfileCompletion,
      completeProfile,
      updateInstrutor,
      toggleFavorito,
      isFavorito,
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
