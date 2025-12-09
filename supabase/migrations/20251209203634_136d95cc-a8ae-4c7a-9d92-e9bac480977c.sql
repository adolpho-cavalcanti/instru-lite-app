-- Enum para tipo de usuário
CREATE TYPE public.user_type AS ENUM ('instrutor', 'aluno');

-- Enum para categoria de habilitação
CREATE TYPE public.categoria_habilitacao AS ENUM ('A', 'B', 'AB', 'C', 'D', 'E');

-- Enum para status de pacote
CREATE TYPE public.status_pacote AS ENUM ('pendente', 'confirmado', 'em_andamento', 'concluido', 'cancelado');

-- Enum para status de aula
CREATE TYPE public.status_aula AS ENUM ('agendada', 'realizada', 'cancelada');

-- Tabela de perfis (para todos os usuários)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  tipo user_type NOT NULL,
  nome TEXT NOT NULL,
  foto TEXT,
  cidade TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de instrutores (dados específicos)
CREATE TABLE public.instrutores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  credenciamento_detran TEXT NOT NULL,
  categoria categoria_habilitacao NOT NULL,
  anos_experiencia INTEGER NOT NULL DEFAULT 0,
  preco_hora DECIMAL(10,2) NOT NULL,
  bairros_atendimento TEXT[] DEFAULT '{}',
  tem_veiculo BOOLEAN NOT NULL DEFAULT false,
  bio TEXT,
  avaliacao_media DECIMAL(2,1) DEFAULT 5.0,
  ranking_posicao INTEGER,
  stripe_customer_id TEXT,
  stripe_account_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de alunos (dados específicos)
CREATE TABLE public.alunos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de favoritos
CREATE TABLE public.favoritos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID REFERENCES public.alunos(id) ON DELETE CASCADE NOT NULL,
  instrutor_id UUID REFERENCES public.instrutores(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(aluno_id, instrutor_id)
);

-- Tabela de pacotes de aulas
CREATE TABLE public.pacotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID REFERENCES public.alunos(id) ON DELETE CASCADE NOT NULL,
  instrutor_id UUID REFERENCES public.instrutores(id) ON DELETE CASCADE NOT NULL,
  quantidade_horas INTEGER NOT NULL,
  horas_utilizadas INTEGER NOT NULL DEFAULT 0,
  preco_total DECIMAL(10,2) NOT NULL,
  taxa_plataforma DECIMAL(5,2) NOT NULL DEFAULT 10.00,
  valor_plataforma DECIMAL(10,2) NOT NULL,
  status status_pacote NOT NULL DEFAULT 'pendente',
  stripe_payment_intent_id TEXT,
  stripe_transfer_id TEXT,
  data_confirmacao TIMESTAMPTZ,
  data_conclusao TIMESTAMPTZ,
  avaliacao_liberada BOOLEAN NOT NULL DEFAULT false,
  avaliacao_realizada BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de aulas individuais
CREATE TABLE public.aulas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pacote_id UUID REFERENCES public.pacotes(id) ON DELETE CASCADE NOT NULL,
  data DATE NOT NULL,
  horario TIME NOT NULL,
  duracao INTEGER NOT NULL DEFAULT 1,
  status status_aula NOT NULL DEFAULT 'agendada',
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de avaliações
CREATE TABLE public.avaliacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instrutor_id UUID REFERENCES public.instrutores(id) ON DELETE CASCADE NOT NULL,
  aluno_id UUID REFERENCES public.alunos(id) ON DELETE CASCADE NOT NULL,
  pacote_id UUID REFERENCES public.pacotes(id) ON DELETE SET NULL,
  nota INTEGER NOT NULL CHECK (nota >= 1 AND nota <= 5),
  comentario TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instrutores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favoritos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pacotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;

-- Função para atualizar timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_instrutores_updated_at
  BEFORE UPDATE ON public.instrutores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_alunos_updated_at
  BEFORE UPDATE ON public.alunos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pacotes_updated_at
  BEFORE UPDATE ON public.pacotes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_aulas_updated_at
  BEFORE UPDATE ON public.aulas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Função helper para obter profile_id do usuário atual
CREATE OR REPLACE FUNCTION public.get_current_profile_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.profiles WHERE user_id = auth.uid()
$$;

-- Função helper para verificar se é instrutor
CREATE OR REPLACE FUNCTION public.is_instrutor()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND tipo = 'instrutor'
  )
$$;

-- Função helper para verificar se é aluno
CREATE OR REPLACE FUNCTION public.is_aluno()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND tipo = 'aluno'
  )
$$;

-- Função para obter aluno_id do usuário atual
CREATE OR REPLACE FUNCTION public.get_current_aluno_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT a.id FROM public.alunos a
  JOIN public.profiles p ON a.profile_id = p.id
  WHERE p.user_id = auth.uid()
$$;

-- Função para obter instrutor_id do usuário atual
CREATE OR REPLACE FUNCTION public.get_current_instrutor_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT i.id FROM public.instrutores i
  JOIN public.profiles p ON i.profile_id = p.id
  WHERE p.user_id = auth.uid()
$$;

-- RLS Policies para profiles
CREATE POLICY "Profiles são visíveis para todos" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Usuários podem inserir próprio perfil" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar próprio perfil" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS Policies para instrutores
CREATE POLICY "Instrutores são visíveis para todos" 
  ON public.instrutores FOR SELECT 
  USING (true);

CREATE POLICY "Instrutores podem inserir próprio registro" 
  ON public.instrutores FOR INSERT 
  WITH CHECK (profile_id = public.get_current_profile_id());

CREATE POLICY "Instrutores podem atualizar próprio registro" 
  ON public.instrutores FOR UPDATE 
  USING (profile_id = public.get_current_profile_id());

-- RLS Policies para alunos
CREATE POLICY "Alunos são visíveis para instrutores" 
  ON public.alunos FOR SELECT 
  USING (
    profile_id = public.get_current_profile_id() 
    OR public.is_instrutor()
  );

CREATE POLICY "Alunos podem inserir próprio registro" 
  ON public.alunos FOR INSERT 
  WITH CHECK (profile_id = public.get_current_profile_id());

CREATE POLICY "Alunos podem atualizar próprio registro" 
  ON public.alunos FOR UPDATE 
  USING (profile_id = public.get_current_profile_id());

-- RLS Policies para favoritos
CREATE POLICY "Alunos podem ver próprios favoritos" 
  ON public.favoritos FOR SELECT 
  USING (aluno_id = public.get_current_aluno_id());

CREATE POLICY "Alunos podem adicionar favoritos" 
  ON public.favoritos FOR INSERT 
  WITH CHECK (aluno_id = public.get_current_aluno_id());

CREATE POLICY "Alunos podem remover favoritos" 
  ON public.favoritos FOR DELETE 
  USING (aluno_id = public.get_current_aluno_id());

-- RLS Policies para pacotes
CREATE POLICY "Participantes podem ver pacotes" 
  ON public.pacotes FOR SELECT 
  USING (
    aluno_id = public.get_current_aluno_id() 
    OR instrutor_id = public.get_current_instrutor_id()
  );

CREATE POLICY "Alunos podem criar pacotes" 
  ON public.pacotes FOR INSERT 
  WITH CHECK (aluno_id = public.get_current_aluno_id());

CREATE POLICY "Participantes podem atualizar pacotes" 
  ON public.pacotes FOR UPDATE 
  USING (
    aluno_id = public.get_current_aluno_id() 
    OR instrutor_id = public.get_current_instrutor_id()
  );

-- RLS Policies para aulas
CREATE POLICY "Participantes podem ver aulas" 
  ON public.aulas FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.pacotes p
      WHERE p.id = pacote_id 
      AND (p.aluno_id = public.get_current_aluno_id() 
           OR p.instrutor_id = public.get_current_instrutor_id())
    )
  );

CREATE POLICY "Participantes podem criar aulas" 
  ON public.aulas FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pacotes p
      WHERE p.id = pacote_id 
      AND (p.aluno_id = public.get_current_aluno_id() 
           OR p.instrutor_id = public.get_current_instrutor_id())
    )
  );

CREATE POLICY "Participantes podem atualizar aulas" 
  ON public.aulas FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.pacotes p
      WHERE p.id = pacote_id 
      AND (p.aluno_id = public.get_current_aluno_id() 
           OR p.instrutor_id = public.get_current_instrutor_id())
    )
  );

-- RLS Policies para avaliações
CREATE POLICY "Avaliações são visíveis para todos" 
  ON public.avaliacoes FOR SELECT 
  USING (true);

CREATE POLICY "Alunos podem criar avaliações" 
  ON public.avaliacoes FOR INSERT 
  WITH CHECK (aluno_id = public.get_current_aluno_id());

-- Função para atualizar média de avaliação do instrutor
CREATE OR REPLACE FUNCTION public.update_instrutor_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.instrutores
  SET avaliacao_media = (
    SELECT ROUND(AVG(nota)::numeric, 1)
    FROM public.avaliacoes
    WHERE instrutor_id = NEW.instrutor_id
  )
  WHERE id = NEW.instrutor_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_instrutor_rating_on_review
  AFTER INSERT ON public.avaliacoes
  FOR EACH ROW EXECUTE FUNCTION public.update_instrutor_rating();

-- Índices para performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_instrutores_profile_id ON public.instrutores(profile_id);
CREATE INDEX idx_instrutores_cidade ON public.instrutores(profile_id);
CREATE INDEX idx_alunos_profile_id ON public.alunos(profile_id);
CREATE INDEX idx_favoritos_aluno_id ON public.favoritos(aluno_id);
CREATE INDEX idx_pacotes_aluno_id ON public.pacotes(aluno_id);
CREATE INDEX idx_pacotes_instrutor_id ON public.pacotes(instrutor_id);
CREATE INDEX idx_aulas_pacote_id ON public.aulas(pacote_id);
CREATE INDEX idx_avaliacoes_instrutor_id ON public.avaliacoes(instrutor_id);