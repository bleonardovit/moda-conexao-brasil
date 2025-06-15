
-- Criar função otimizada para buscar fornecedores com paginação
CREATE OR REPLACE FUNCTION public.get_suppliers_paginated(
  p_user_id UUID DEFAULT NULL,
  p_offset INTEGER DEFAULT 0,
  p_limit INTEGER DEFAULT 20,
  p_search_term TEXT DEFAULT NULL,
  p_category_id UUID DEFAULT NULL,
  p_state TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_price TEXT DEFAULT NULL,
  p_requires_cnpj BOOLEAN DEFAULT NULL,
  p_favorites UUID[] DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  code TEXT,
  name TEXT,
  description TEXT,
  images TEXT[],
  instagram TEXT,
  whatsapp TEXT,
  website TEXT,
  min_order TEXT,
  payment_methods TEXT[],
  requires_cnpj BOOLEAN,
  avg_price TEXT,
  shipping_methods TEXT[],
  custom_shipping_method TEXT,
  city TEXT,
  state TEXT,
  categories UUID[],
  featured BOOLEAN,
  hidden BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  average_rating NUMERIC,
  is_locked_for_trial BOOLEAN,
  total_count BIGINT,
  has_more BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin BOOLEAN;
  is_in_trial BOOLEAN := FALSE;
  has_expired_trial BOOLEAN := FALSE;
  allowed_supplier_ids UUID[] := '{}';
  total_suppliers BIGINT;
BEGIN
  -- Verificar se usuário é admin
  is_admin := public.is_current_user_admin();
  
  -- Se não é admin, verificar status do trial
  IF p_user_id IS NOT NULL AND NOT is_admin THEN
    SELECT 
      CASE WHEN trial_status = 'active' THEN TRUE ELSE FALSE END,
      CASE WHEN trial_status = 'expired' THEN TRUE ELSE FALSE END
    INTO is_in_trial, has_expired_trial
    FROM profiles 
    WHERE id = p_user_id;
    
    -- Se está em trial ativo, buscar fornecedores permitidos
    IF is_in_trial THEN
      SELECT COALESCE(allowed_supplier_ids, '{}')
      INTO allowed_supplier_ids
      FROM free_trial_config
      WHERE user_id = p_user_id;
    END IF;
  END IF;
  
  -- Contar total de fornecedores que atendem aos filtros
  SELECT COUNT(DISTINCT s.id)
  INTO total_suppliers
  FROM suppliers s
  LEFT JOIN suppliers_categories sc ON s.id = sc.supplier_id
  WHERE 
    (NOT is_admin AND s.hidden = FALSE OR is_admin) AND
    (p_search_term IS NULL OR s.name ILIKE '%' || p_search_term || '%' OR s.description ILIKE '%' || p_search_term || '%' OR s.code ILIKE '%' || p_search_term || '%') AND
    (p_category_id IS NULL OR sc.category_id = p_category_id) AND
    (p_state IS NULL OR s.state = p_state) AND
    (p_city IS NULL OR s.city = p_city) AND
    (p_price IS NULL OR s.avg_price = p_price) AND
    (p_requires_cnpj IS NULL OR s.requires_cnpj = p_requires_cnpj) AND
    (p_favorites IS NULL OR s.id = ANY(p_favorites));
  
  -- Retornar resultados paginados
  RETURN QUERY
  SELECT DISTINCT
    s.id,
    s.code,
    s.name,
    s.description,
    s.images,
    s.instagram,
    s.whatsapp,
    s.website,
    s.min_order,
    s.payment_methods,
    s.requires_cnpj,
    s.avg_price,
    s.shipping_methods,
    s.custom_shipping_method,
    s.city,
    s.state,
    ARRAY_AGG(DISTINCT sc.category_id) FILTER (WHERE sc.category_id IS NOT NULL) AS categories,
    s.featured,
    s.hidden,
    s.created_at,
    s.updated_at,
    COALESCE(AVG(r.rating), 0) AS average_rating,
    CASE 
      WHEN p_user_id IS NULL OR is_admin THEN FALSE
      WHEN has_expired_trial THEN TRUE
      WHEN is_in_trial AND NOT (s.id = ANY(allowed_supplier_ids)) THEN TRUE
      ELSE FALSE
    END AS is_locked_for_trial,
    total_suppliers AS total_count,
    (p_offset + p_limit < total_suppliers) AS has_more
  FROM suppliers s
  LEFT JOIN suppliers_categories sc ON s.id = sc.supplier_id
  LEFT JOIN reviews r ON s.id = r.supplier_id AND r.hidden = FALSE
  WHERE 
    (NOT is_admin AND s.hidden = FALSE OR is_admin) AND
    (p_search_term IS NULL OR s.name ILIKE '%' || p_search_term || '%' OR s.description ILIKE '%' || p_search_term || '%' OR s.code ILIKE '%' || p_search_term || '%') AND
    (p_category_id IS NULL OR sc.category_id = p_category_id) AND
    (p_state IS NULL OR s.state = p_state) AND
    (p_city IS NULL OR s.city = p_city) AND
    (p_price IS NULL OR s.avg_price = p_price) AND
    (p_requires_cnpj IS NULL OR s.requires_cnpj = p_requires_cnpj) AND
    (p_favorites IS NULL OR s.id = ANY(p_favorites))
  GROUP BY s.id, s.code, s.name, s.description, s.images, s.instagram, s.whatsapp, s.website, s.min_order, s.payment_methods, s.requires_cnpj, s.avg_price, s.shipping_methods, s.custom_shipping_method, s.city, s.state, s.featured, s.hidden, s.created_at, s.updated_at
  ORDER BY 
    CASE WHEN p_user_id IS NULL OR is_admin THEN 0
         WHEN has_expired_trial THEN 1
         WHEN is_in_trial AND NOT (s.id = ANY(allowed_supplier_ids)) THEN 1
         ELSE 0
    END,
    s.featured DESC,
    s.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;
