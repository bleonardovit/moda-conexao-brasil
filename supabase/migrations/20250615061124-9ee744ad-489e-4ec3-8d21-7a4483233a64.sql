
-- Inserir regra de acesso para favoritos
INSERT INTO public.feature_access_rules (
  feature_key,
  trial_access_level,
  trial_limit_value,
  trial_message_locked,
  non_subscriber_access_level,
  non_subscriber_message_locked
) VALUES (
  'favorites',
  'full',
  NULL,
  NULL,
  'limited_count',
  'Você atingiu o limite de 5 favoritos. Assine para favoritos ilimitados e acesse todos os recursos.'
)
ON CONFLICT (feature_key) DO UPDATE SET
  trial_access_level = EXCLUDED.trial_access_level,
  trial_limit_value = EXCLUDED.trial_limit_value,
  trial_message_locked = EXCLUDED.trial_message_locked,
  non_subscriber_access_level = EXCLUDED.non_subscriber_access_level,
  non_subscriber_message_locked = EXCLUDED.non_subscriber_message_locked,
  updated_at = now();

-- Adicionar um valor de limite para não-assinantes (precisa adicionar coluna se não existir)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'feature_access_rules' 
                   AND column_name = 'non_subscriber_limit_value') THEN
        ALTER TABLE public.feature_access_rules 
        ADD COLUMN non_subscriber_limit_value integer;
    END IF;
END $$;

-- Atualizar a regra com o limite para não-assinantes
UPDATE public.feature_access_rules 
SET non_subscriber_limit_value = 5,
    trial_limit_value = 5  -- Definir limite também para trial como backup
WHERE feature_key = 'favorites';
