
-- Drop and recreate the instrutores_public view WITHOUT security_invoker
-- This allows the view to bypass RLS and show marketplace data
DROP VIEW IF EXISTS public.instrutores_public;

CREATE VIEW public.instrutores_public AS
SELECT 
  i.id,
  i.profile_id,
  i.categoria,
  i.anos_experiencia,
  i.preco_hora,
  i.tem_veiculo,
  i.avaliacao_media,
  i.ranking_posicao,
  i.bairros_atendimento,
  i.bio,
  i.verificado,
  i.created_at,
  -- Include profile data directly in the view
  p.nome,
  p.foto,
  p.cidade
FROM public.instrutores i
JOIN public.profiles p ON i.profile_id = p.id;

-- Grant access to authenticated users
GRANT SELECT ON public.instrutores_public TO authenticated;
GRANT SELECT ON public.instrutores_public TO anon;
