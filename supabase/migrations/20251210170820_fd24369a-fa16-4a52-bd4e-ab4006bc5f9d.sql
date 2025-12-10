-- Add proposta_por column to aulas table
ALTER TABLE public.aulas ADD COLUMN IF NOT EXISTS proposta_por text DEFAULT 'aluno';

-- Update the status_aula enum to include new statuses
ALTER TYPE public.status_aula RENAME TO status_aula_old;

CREATE TYPE public.status_aula AS ENUM ('proposta', 'confirmada', 'agendada', 'realizada', 'cancelada');

ALTER TABLE public.aulas 
  ALTER COLUMN status DROP DEFAULT,
  ALTER COLUMN status TYPE public.status_aula USING status::text::public.status_aula,
  ALTER COLUMN status SET DEFAULT 'proposta';

DROP TYPE public.status_aula_old;

-- Add constraint to ensure proposta_por is valid
ALTER TABLE public.aulas ADD CONSTRAINT aulas_proposta_por_check 
  CHECK (proposta_por IN ('aluno', 'instrutor'));