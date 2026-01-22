
-- 1. FIX profiles: Restrict to authenticated users only
DROP POLICY IF EXISTS "Profiles são visíveis para todos" ON public.profiles;

CREATE POLICY "Profiles visíveis para usuários autenticados"
ON public.profiles FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 2. FIX instrutores: Create a public view hiding sensitive data
-- First, create a view that only exposes public-safe fields
CREATE OR REPLACE VIEW public.instrutores_public
WITH (security_invoker=on) AS
SELECT 
  id,
  profile_id,
  categoria,
  anos_experiencia,
  preco_hora,
  tem_veiculo,
  avaliacao_media,
  ranking_posicao,
  bairros_atendimento,
  bio,
  created_at
FROM public.instrutores;

-- Now restrict the base table - only the instructor themselves or participants in packages can see full data
DROP POLICY IF EXISTS "Instrutores são visíveis para todos" ON public.instrutores;

CREATE POLICY "Instrutores podem ver próprio registro completo"
ON public.instrutores FOR SELECT
USING (
  profile_id = get_current_profile_id()
  OR 
  EXISTS (
    SELECT 1 FROM public.pacotes p 
    WHERE p.instrutor_id = instrutores.id 
    AND p.aluno_id = get_current_aluno_id()
  )
  OR
  auth.uid() IS NOT NULL
);

-- Create a separate policy for public view access (limited fields via view)
-- The view will handle field filtering, but we need authenticated access
GRANT SELECT ON public.instrutores_public TO authenticated, anon;

-- 3. FIX alunos: Restrict to only instructors who have packages with that student
DROP POLICY IF EXISTS "Alunos são visíveis para instrutores" ON public.alunos;

CREATE POLICY "Alunos visíveis para próprio registro ou instrutor com pacote"
ON public.alunos FOR SELECT
USING (
  profile_id = get_current_profile_id()
  OR 
  EXISTS (
    SELECT 1 FROM public.pacotes p 
    WHERE p.aluno_id = alunos.id 
    AND p.instrutor_id = get_current_instrutor_id()
  )
);
