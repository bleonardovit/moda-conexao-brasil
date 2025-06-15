
-- Adiciona campo para armazenar o access token do Meta Conversions API
ALTER TABLE tracking_settings
ADD COLUMN meta_access_token TEXT;
