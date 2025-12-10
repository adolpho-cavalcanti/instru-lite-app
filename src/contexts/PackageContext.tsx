import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LessonPackage, PackageStatus, PACKAGE_OPTIONS, PLATFORM_FEE } from '@/types';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface PackageContextType {
  packages: LessonPackage[];
  createPackage: (instructorId: string, hours: number) => Promise<LessonPackage | null>;
  confirmPackage: (packageId: string) => Promise<void>;
  cancelPackage: (packageId: string) => Promise<void>;
  registerCompletedHours: (packageId: string, hours: number) => Promise<void>;
  getStudentPackages: () => LessonPackage[];
  getInstructorPackages: () => LessonPackage[];
  getPackageById: (packageId: string) => LessonPackage | undefined;
  canReview: (packageId: string) => boolean;
  submitReview: (packageId: string, rating: number, comment: string) => Promise<void>;
}

const PackageContext = createContext<PackageContextType | undefined>(undefined);

export function PackageProvider({ children }: { children: ReactNode }) {
  const { user, userType, studentData, instructorData, instructors } = useAuth();
  const [packages, setPackages] = useState<LessonPackage[]>([]);

  useEffect(() => {
    const loadPackages = async () => {
      if (!user) {
        setPackages([]);
        return;
      }

      const { data, error } = await supabase
        .from('pacotes')
        .select('*');

      if (!error && data) {
        const mappedPackages: LessonPackage[] = data.map(p => ({
          id: p.id,
          studentId: p.aluno_id,
          instructorId: p.instrutor_id,
          totalHours: p.quantidade_horas,
          usedHours: p.horas_utilizadas,
          totalPrice: p.preco_total,
          platformFee: p.taxa_plataforma,
          platformAmount: p.valor_plataforma,
          status: p.status as PackageStatus,
          createdAt: p.created_at,
          confirmedAt: p.data_confirmacao || undefined,
          completedAt: p.data_conclusao || undefined,
          lessons: [],
          reviewEnabled: p.avaliacao_liberada,
          reviewCompleted: p.avaliacao_realizada,
        }));
        setPackages(mappedPackages);
      }
    };

    loadPackages();
  }, [user]);

  const createPackage = async (instructorId: string, hours: number): Promise<LessonPackage | null> => {
    if (!user || userType !== 'aluno' || !studentData) return null;
    
    const instructor = instructors.find(i => i.id === instructorId);
    if (!instructor) return null;

    const option = PACKAGE_OPTIONS.find(o => o.hours === hours);
    const discount = option?.discount || 0;
    const basePrice = instructor.preco_hora * hours;
    const discountedPrice = basePrice * (1 - discount / 100);
    const platformAmount = discountedPrice * (PLATFORM_FEE / 100);

    const { data, error } = await supabase
      .from('pacotes')
      .insert({
        aluno_id: studentData.id,
        instrutor_id: instructorId,
        quantidade_horas: hours,
        horas_utilizadas: 0,
        preco_total: discountedPrice,
        taxa_plataforma: PLATFORM_FEE,
        valor_plataforma: platformAmount,
        status: 'pendente',
      })
      .select()
      .single();

    if (error || !data) return null;

    const newPackage: LessonPackage = {
      id: data.id,
      studentId: data.aluno_id,
      instructorId: data.instrutor_id,
      totalHours: data.quantidade_horas,
      usedHours: data.horas_utilizadas,
      totalPrice: data.preco_total,
      platformFee: data.taxa_plataforma,
      platformAmount: data.valor_plataforma,
      status: data.status as PackageStatus,
      createdAt: data.created_at,
      lessons: [],
      reviewEnabled: data.avaliacao_liberada,
      reviewCompleted: data.avaliacao_realizada,
    };

    setPackages(prev => [...prev, newPackage]);
    return newPackage;
  };

  const confirmPackage = async (packageId: string) => {
    const { error } = await supabase
      .from('pacotes')
      .update({
        status: 'confirmado',
        data_confirmacao: new Date().toISOString(),
      })
      .eq('id', packageId)
      .eq('status', 'pendente');

    if (!error) {
      setPackages(prev => prev.map(p => {
        if (p.id === packageId && p.status === 'pendente') {
          return { ...p, status: 'confirmado' as PackageStatus, confirmedAt: new Date().toISOString() };
        }
        return p;
      }));
    }
  };

  const cancelPackage = async (packageId: string) => {
    const { error } = await supabase
      .from('pacotes')
      .update({ status: 'cancelado' })
      .eq('id', packageId)
      .in('status', ['pendente', 'confirmado']);

    if (!error) {
      setPackages(prev => prev.map(p => {
        if (p.id === packageId && ['pendente', 'confirmado'].includes(p.status)) {
          return { ...p, status: 'cancelado' as PackageStatus };
        }
        return p;
      }));
    }
  };

  const registerCompletedHours = async (packageId: string, hours: number) => {
    if (!user || userType !== 'instrutor' || !instructorData) return;

    const pkg = packages.find(p => p.id === packageId);
    if (!pkg || pkg.instructorId !== instructorData.id) return;

    const newUsedHours = Math.min(pkg.usedHours + hours, pkg.totalHours);
    const completed = newUsedHours >= pkg.totalHours;

    const { error } = await supabase
      .from('pacotes')
      .update({
        horas_utilizadas: newUsedHours,
        status: completed ? 'concluido' : 'em_andamento',
        data_conclusao: completed ? new Date().toISOString() : null,
        avaliacao_liberada: completed,
      })
      .eq('id', packageId);

    if (!error) {
      setPackages(prev => prev.map(p => {
        if (p.id === packageId) {
          return {
            ...p,
            usedHours: newUsedHours,
            status: completed ? 'concluido' as PackageStatus : 'em_andamento' as PackageStatus,
            completedAt: completed ? new Date().toISOString() : undefined,
            reviewEnabled: completed,
          };
        }
        return p;
      }));
    }
  };

  const getStudentPackages = () => {
    if (!user || userType !== 'aluno' || !studentData) return [];
    return packages.filter(p => p.studentId === studentData.id);
  };

  const getInstructorPackages = () => {
    if (!user || userType !== 'instrutor' || !instructorData) return [];
    return packages.filter(p => p.instructorId === instructorData.id);
  };

  const getPackageById = (packageId: string) => {
    return packages.find(p => p.id === packageId);
  };

  const canReview = (packageId: string): boolean => {
    const pkg = packages.find(p => p.id === packageId);
    if (!pkg) return false;
    return pkg.reviewEnabled && !pkg.reviewCompleted;
  };

  const submitReview = async (packageId: string, rating: number, comment: string) => {
    if (!user || userType !== 'aluno' || !studentData) return;
    
    const pkg = packages.find(p => p.id === packageId);
    if (!pkg || !canReview(packageId)) return;

    const { error: reviewError } = await supabase
      .from('avaliacoes')
      .insert({
        aluno_id: studentData.id,
        instrutor_id: pkg.instructorId,
        pacote_id: packageId,
        nota: rating,
        comentario: comment,
      });

    if (reviewError) return;

    await supabase
      .from('pacotes')
      .update({ avaliacao_realizada: true })
      .eq('id', packageId);

    setPackages(prev => prev.map(p => {
      if (p.id === packageId) {
        return { ...p, reviewCompleted: true };
      }
      return p;
    }));
  };

  return (
    <PackageContext.Provider value={{
      packages,
      createPackage,
      confirmPackage,
      cancelPackage,
      registerCompletedHours,
      getStudentPackages,
      getInstructorPackages,
      getPackageById,
      canReview,
      submitReview,
    }}>
      {children}
    </PackageContext.Provider>
  );
}

export function usePackages() {
  const context = useContext(PackageContext);
  if (context === undefined) {
    throw new Error('usePackages must be used within a PackageProvider');
  }
  return context;
}
