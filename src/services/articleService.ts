
import { Article, ArticleCategory } from '@/types/article';
import { supabase } from "@/integrations/supabase/client";

// Função para buscar todos os artigos
export const getArticles = async (category?: ArticleCategory): Promise<Article[]> => {
  try {
    let query = supabase
      .from('articles')
      .select('*');
    
    // Filtra por categoria se fornecida
    if (category) {
      query = query.eq('category', category);
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
