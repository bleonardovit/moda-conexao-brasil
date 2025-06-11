
-- Primeiro, vamos identificar o usuário admin para não deletá-lo
-- Delete todos os perfis que não são admin
DELETE FROM public.profiles 
WHERE role != 'admin';

-- Delete registros relacionados dos usuários não-admin
-- Favoritos
DELETE FROM public.favorites 
WHERE user_id NOT IN (
  SELECT id FROM public.profiles WHERE role = 'admin'
);

-- Reviews
DELETE FROM public.reviews 
WHERE user_id NOT IN (
  SELECT id FROM public.profiles WHERE role = 'admin'
);

-- User notifications
DELETE FROM public.user_notifications 
WHERE user_id NOT IN (
  SELECT id FROM public.profiles WHERE role = 'admin'
);

-- Login logs (manter apenas dos admins)
DELETE FROM public.login_logs 
WHERE user_id NOT IN (
  SELECT id FROM public.profiles WHERE role = 'admin'
);

-- Active sessions (manter apenas dos admins)
DELETE FROM public.active_sessions 
WHERE user_id NOT IN (
  SELECT id FROM public.profiles WHERE role = 'admin'
);

-- Review bans
DELETE FROM public.review_bans 
WHERE user_id NOT IN (
  SELECT id FROM public.profiles WHERE role = 'admin'
);

-- Free trial config
DELETE FROM public.free_trial_config 
WHERE user_id NOT IN (
  SELECT id FROM public.profiles WHERE role = 'admin'
);

-- IMPORTANTE: Os usuários de auth.users precisam ser deletados manualmente 
-- através do painel do Supabase em Authentication > Users
-- pois não temos permissão para deletar diretamente da tabela auth.users via SQL
