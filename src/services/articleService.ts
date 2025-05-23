import { Article, ArticleCategory } from '@/types/article';
import { supabase } from "@/integrations/supabase/client";

// Função para buscar todos os artigos publicados
export const getArticles = async (categoryId?: string): Promise<Article[]> => {
  try {
    let query = supabase
      .from('articles')
      .select('*')
      .eq('published', true); // Adicionado filtro para artigos publicados
    
    // Filtra por categoria se fornecida
    if (categoryId) {
      query = query.eq('category', categoryId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar artigos:', error);
      return [];
    }
    
    return data as Article[];
  } catch (error) {
    console.error('Erro ao buscar artigos:', error);
    return [];
  }
};

// Função para buscar o ID do último artigo publicado de uma categoria
export const getLatestPublishedArticleIdForCategory = async (categoryId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('id')
      .eq('published', true)
      .eq('category', categoryId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // Não é necessariamente um erro se nenhum artigo for encontrado, pode ser uma categoria vazia
      if (error.code !== 'PGRST116') { // PGRST116: "Query result returned an empty array"
         console.warn('Aviso ao buscar último artigo da categoria:', categoryId, error);
      }
      return null;
    }
    return data ? data.id : null;
  } catch (error) {
    console.error('Erro ao buscar último artigo da categoria:', categoryId, error);
    return null;
  }
};

// Função para buscar os IDs dos últimos artigos publicados de cada categoria
export const getLatestPublishedArticleIdsPerCategory = async (allCategories: ArticleCategory[]): Promise<string[]> => {
  if (!allCategories || allCategories.length === 0) {
    return [];
  }
  
  const allowedIds: string[] = [];
  for (const category of allCategories) {
    const latestId = await getLatestPublishedArticleIdForCategory(category.id);
    if (latestId) {
      allowedIds.push(latestId);
    }
  }
  return allowedIds;
};

// Função para buscar um artigo específico
export const getArticleById = async (id: string): Promise<Article | undefined> => {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) {
      console.error('Erro ao buscar artigo por ID:', error);
      return undefined;
    }
    
    return data as Article;
  } catch (error) {
    console.error('Erro ao buscar artigo por ID:', error);
    return undefined;
  }
};

// Função para criar um novo artigo
export const createArticle = async (article: Omit<Article, 'id' | 'created_at'>): Promise<Article | undefined> => {
  try {
    const { data, error } = await supabase
      .from('articles')
      .insert([article])
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao criar artigo:', error);
      return undefined;
    }
    
    return data as Article;
  } catch (error) {
    console.error('Erro ao criar artigo:', error);
    return undefined;
  }
};

// Função para atualizar um artigo existente
export const updateArticle = async (id: string, articleData: Partial<Article>): Promise<Article | undefined> => {
  try {
    const { data, error } = await supabase
      .from('articles')
      .update(articleData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao atualizar artigo:', error);
      return undefined;
    }
    
    return data as Article;
  } catch (error) {
    console.error('Erro ao atualizar artigo:', error);
    return undefined;
  }
};

// Função para excluir um artigo
export const deleteArticle = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Erro ao excluir artigo:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao excluir artigo:', error);
    return false;
  }
};

// Função para publicar um artigo
export const publishArticle = async (id: string): Promise<Article | undefined> => {
  return updateArticle(id, { published: true });
};

// Função para despublicar um artigo
export const unpublishArticle = async (id: string): Promise<Article | undefined> => {
  return updateArticle(id, { published: false });
};

// Função para buscar categorias
export const getCategories = async (): Promise<ArticleCategory[]> => {
  try {
    const { data, error } = await supabase
      .from('article_categories')
      .select('*');
    
    if (error) {
      console.error('Erro ao buscar categorias:', error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return [];
  }
};

// Função para criar uma nova categoria
export const createCategory = async (category: { id: string, label: string, color: string }): Promise<ArticleCategory | undefined> => {
  try {
    const { data, error } = await supabase
      .from('article_categories')
      .insert([category])
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao criar categoria:', error);
      return undefined;
    }
    
    return data as ArticleCategory;
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    return undefined;
  }
};

// Função para atualizar uma categoria existente
export const updateCategory = async (id: string, categoryData: Partial<ArticleCategory>): Promise<ArticleCategory | undefined> => {
  try {
    const { data, error } = await supabase
      .from('article_categories')
      .update(categoryData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao atualizar categoria:', error);
      return undefined;
    }
    
    return data as ArticleCategory;
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    return undefined;
  }
};

// Função para excluir uma categoria
export const deleteCategory = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('article_categories')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Erro ao excluir categoria:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao excluir categoria:', error);
    return false;
  }
};
