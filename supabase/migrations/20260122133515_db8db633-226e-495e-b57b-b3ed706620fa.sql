-- 1. Fix instrutores table: remove "auth.uid() IS NOT NULL" condition that exposes all data
DROP POLICY IF EXISTS "Instrutores podem ver próprio registro completo" ON public.instrutores;

CREATE POLICY "Instrutores podem ver próprio registro completo" 
ON public.instrutores 
FOR SELECT 
USING (
  (profile_id = get_current_profile_id()) OR 
  (EXISTS ( 
    SELECT 1 FROM pacotes p 
    WHERE p.instrutor_id = instrutores.id 
    AND p.aluno_id = get_current_aluno_id()
  ))
);

-- 2. Fix profiles table: restrict visibility to own profile, instructors with packages, or public instructor profiles
DROP POLICY IF EXISTS "Profiles visíveis para usuários autenticados" ON public.profiles;

-- Own profile
CREATE POLICY "Usuários podem ver próprio perfil" 
ON public.profiles 
FOR SELECT 
USING (user_id = auth.uid());

-- Instructors can see student profiles for their packages
CREATE POLICY "Instrutores podem ver perfis de alunos com pacotes" 
ON public.profiles 
FOR SELECT 
USING (
  is_instrutor() AND
  EXISTS (
    SELECT 1 FROM alunos a
    JOIN pacotes p ON p.aluno_id = a.id
    WHERE a.profile_id = profiles.id
    AND p.instrutor_id = get_current_instrutor_id()
  )
);

-- Students can see instructor profiles (for marketplace browsing)
CREATE POLICY "Alunos podem ver perfis de instrutores" 
ON public.profiles 
FOR SELECT 
USING (
  is_aluno() AND
  EXISTS (
    SELECT 1 FROM instrutores i
    WHERE i.profile_id = profiles.id
  )
);

-- 3. Create a secure view for alunos that hides stripe_customer_id
CREATE OR REPLACE VIEW public.alunos_safe
WITH (security_invoker=on) AS
  SELECT 
    id,
    profile_id,
    created_at,
    updated_at
  FROM public.alunos;

-- Grant access to the view
GRANT SELECT ON public.alunos_safe TO authenticated;
GRANT SELECT ON public.alunos_safe TO anon;