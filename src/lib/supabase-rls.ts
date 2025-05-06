
import { supabase } from "@/integrations/supabase/client";

// Este arquivo define as permissões do banco de dados necessárias para o aplicativo funcionar corretamente.
// Você precisa configurar essas políticas no console do Supabase.

/*
Abaixo estão as políticas de segurança Row Level Security (RLS) que devem ser configuradas:

Para a tabela 'suppliers':
-------------------------
-- Permite a todos os usuários lerem fornecedores que não estão ocultos
CREATE POLICY "Fornecedores visíveis para todos" 
ON public.suppliers 
FOR SELECT 
USING (hidden = false);

-- Permite administradores gerenciarem todos os fornecedores
CREATE POLICY "Admins podem gerenciar fornecedores" 
ON public.suppliers 
USING (
  auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
);

Para a tabela 'categories':
-------------------------
-- Permite a todos os usuários lerem categorias
CREATE POLICY "Categorias visíveis para todos" 
ON public.categories 
FOR SELECT 
USING (true);

-- Permite administradores gerenciarem categorias
CREATE POLICY "Admins podem gerenciar categorias" 
ON public.categories 
FOR ALL USING (
  auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
);

Para a tabela 'suppliers_categories':
-------------------------
-- Permite a todos os usuários lerem relações entre fornecedores e categorias
CREATE POLICY "Relações de categorias visíveis para todos" 
ON public.suppliers_categories 
FOR SELECT 
USING (true);

-- Permite administradores gerenciarem relações entre fornecedores e categorias
CREATE POLICY "Admins podem gerenciar categorias" 
ON public.suppliers_categories 
FOR ALL USING (
  auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
);
*/

/**
 * Esta função verifica se o usuário atual é um administrador
 * Usada internamente no aplicativo para controle de acesso
 */
export const isUserAdmin = async (): Promise<boolean> => {
  try {
    // Obter o usuário atual
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return false;
    
    // Verificar se o usuário tem a role 'admin' no app_metadata
    const appMetadata = user.app_metadata;
    return appMetadata && appMetadata.role === 'admin';
  } catch (error) {
    console.error('Erro ao verificar permissões de administrador:', error);
    return false;
  }
};
