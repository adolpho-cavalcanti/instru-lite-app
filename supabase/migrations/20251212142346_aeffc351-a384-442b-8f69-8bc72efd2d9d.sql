-- Tabela para mensagens de chat entre aluno e instrutor
CREATE TABLE public.mensagens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pacote_id uuid NOT NULL REFERENCES public.pacotes(id) ON DELETE CASCADE,
  remetente_id uuid NOT NULL,
  remetente_tipo text NOT NULL CHECK (remetente_tipo IN ('aluno', 'instrutor')),
  conteudo text NOT NULL,
  lida boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mensagens ENABLE ROW LEVEL SECURITY;

-- Participantes do pacote podem ver mensagens
CREATE POLICY "Participantes podem ver mensagens"
ON public.mensagens FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM pacotes p
    WHERE p.id = mensagens.pacote_id 
    AND (p.aluno_id = get_current_aluno_id() OR p.instrutor_id = get_current_instrutor_id())
  )
);

-- Participantes podem enviar mensagens
CREATE POLICY "Participantes podem enviar mensagens"
ON public.mensagens FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM pacotes p
    WHERE p.id = mensagens.pacote_id 
    AND (p.aluno_id = get_current_aluno_id() OR p.instrutor_id = get_current_instrutor_id())
  )
);

-- Participantes podem marcar mensagens como lidas
CREATE POLICY "Participantes podem atualizar mensagens"
ON public.mensagens FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM pacotes p
    WHERE p.id = mensagens.pacote_id 
    AND (p.aluno_id = get_current_aluno_id() OR p.instrutor_id = get_current_instrutor_id())
  )
);

-- Adicionar campo de verificação na tabela instrutores
ALTER TABLE public.instrutores 
ADD COLUMN verificado boolean NOT NULL DEFAULT false,
ADD COLUMN verificado_em timestamp with time zone,
ADD COLUMN antecedentes_declarados boolean NOT NULL DEFAULT false,
ADD COLUMN antecedentes_declarados_em timestamp with time zone;

-- Tabela para solicitações de reembolso
CREATE TABLE public.solicitacoes_reembolso (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pacote_id uuid NOT NULL REFERENCES public.pacotes(id) ON DELETE CASCADE,
  aluno_id uuid NOT NULL REFERENCES public.alunos(id),
  motivo text NOT NULL,
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
  stripe_refund_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  resolved_at timestamp with time zone
);

-- Enable RLS
ALTER TABLE public.solicitacoes_reembolso ENABLE ROW LEVEL SECURITY;

-- Alunos podem ver próprias solicitações
CREATE POLICY "Alunos podem ver próprias solicitações"
ON public.solicitacoes_reembolso FOR SELECT
USING (aluno_id = get_current_aluno_id());

-- Alunos podem criar solicitações
CREATE POLICY "Alunos podem criar solicitações"
ON public.solicitacoes_reembolso FOR INSERT
WITH CHECK (aluno_id = get_current_aluno_id());

-- Enable realtime for mensagens
ALTER PUBLICATION supabase_realtime ADD TABLE public.mensagens;