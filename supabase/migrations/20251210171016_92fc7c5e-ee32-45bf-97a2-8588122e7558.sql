-- Create function to increment hours used in a package
CREATE OR REPLACE FUNCTION public.increment_horas_utilizadas(p_pacote_id uuid, p_horas integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_quantidade_horas integer;
  v_horas_utilizadas integer;
  v_new_horas integer;
BEGIN
  -- Get current package info
  SELECT quantidade_horas, horas_utilizadas INTO v_quantidade_horas, v_horas_utilizadas
  FROM public.pacotes
  WHERE id = p_pacote_id;
  
  -- Calculate new hours
  v_new_horas := v_horas_utilizadas + p_horas;
  
  -- Update the package
  UPDATE public.pacotes
  SET 
    horas_utilizadas = LEAST(v_new_horas, v_quantidade_horas),
    status = CASE 
      WHEN LEAST(v_new_horas, v_quantidade_horas) >= v_quantidade_horas THEN 'concluido'::status_pacote
      WHEN v_horas_utilizadas = 0 THEN 'em_andamento'::status_pacote
      ELSE status
    END,
    avaliacao_liberada = CASE 
      WHEN LEAST(v_new_horas, v_quantidade_horas) >= v_quantidade_horas THEN true
      ELSE avaliacao_liberada
    END,
    data_conclusao = CASE 
      WHEN LEAST(v_new_horas, v_quantidade_horas) >= v_quantidade_horas THEN now()
      ELSE data_conclusao
    END
  WHERE id = p_pacote_id;
END;
$$;