
import { supabase } from "@/integrations/supabase/client";
import type { Review } from '@/types'; // Assumindo que Review está em @/types
// import { getUser } from './userService'; // REMOVIDO - userService não encontrado no momento

// Tipagem para os dados necessários para criar uma review
// O user_id será obtido da sessão, user_name pode ser obtido do perfil
export interface CreateReviewData {
  supplier_id: string;
  rating: number;
  comment?: string;
}

/**
 * Busca todas as reviews para um fornecedor específico.
 */
export const getReviewsBySupplierId = async (supplierId: string): Promise<Review[]> => {
  if (!supplierId) {
    console.error('Supplier ID is required to fetch reviews.');
    return [];
  }
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*') // Seleciona todas as colunas da tabela reviews
      .eq('supplier_id', supplierId)
      .order('created_at', { ascending: false }); // Mais recentes primeiro

    if (error) {
      console.error(`Error fetching reviews for supplier ${supplierId}:`, error);
      throw error;
    }
    return data || [];
  } catch (err) {
    console.error('Exception in getReviewsBySupplierId:', err);
    throw err;
  }
};

/**
 * Busca todas as reviews para um fornecedor específico.
 * Alias para getReviewsBySupplierId para manter compatibilidade.
 */
export const getSupplierReviews = getReviewsBySupplierId;

/**
 * Calcula e retorna a média de avaliação para um fornecedor específico.
 */
export const getSupplierAverageRating = async (supplierId: string): Promise<number | null> => {
  if (!supplierId) {
    console.error('Supplier ID is required to fetch average rating.');
    return null;
  }

  try {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('supplier_id', supplierId);

    if (error) {
      console.error(`Error fetching reviews for average rating calculation for supplier ${supplierId}:`, error);
      return null;
    }

    if (!reviews || reviews.length === 0) {
      return null;
    }

    const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    const averageRating = totalRating / reviews.length;
    
    console.log(`reviewService: Calculated average rating for supplier ${supplierId}:`, averageRating);
    return averageRating;
  } catch (err) {
    console.error('Exception in getSupplierAverageRating:', err);
    return null;
  }
};

/**
 * Cria uma nova review no banco de dados.
 */
export const createReview = async (reviewData: CreateReviewData, userId: string): Promise<Review> => {
  if (!userId) {
    throw new Error('User ID is required to create a review.');
  }

  let userName = 'Usuário Anônimo'; // Fallback inicial
  try {
    // Tenta obter o nome do usuário a partir do email se o perfil não for encontrado/usado
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      userName = user.email.split('@')[0]; // Usa a parte local do email como nome de usuário
    }
    // Se você tiver uma tabela de perfis (ex: 'profiles') com um campo como 'full_name' ou 'username'
    // e uma forma de buscar esse perfil pelo userId, você poderia fazer:
    // const { data: userProfile, error: profileError } = await supabase
    //   .from('profiles') 
    //   .select('full_name') // ou 'username'
    //   .eq('id', userId)
    //   .single();
    // if (profileError) console.warn('Could not fetch user profile name for review:', profileError);
    // if (userProfile && userProfile.full_name) {
    //   userName = userProfile.full_name;
    // } else if (userProfile && userProfile.username) { // Exemplo se tiver username
    //   userName = userProfile.username;
    // }

  } catch (authError) {
    console.warn("Could not fetch user email for review user_name fallback:", authError);
  }

  const reviewToInsert = {
    supplier_id: reviewData.supplier_id,
    user_id: userId,
    user_name: userName,
    rating: reviewData.rating,
    comment: reviewData.comment || null,
  };

  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert(reviewToInsert)
      .select()
      .single();

    if (error) {
      console.error('Error creating review:', error);
      if (error.code === '23505') {
        throw new Error('Você já avaliou este fornecedor.');
      }
      throw error;
    }
    if (!data) {
      throw new Error('Review creation did not return data.');
    }
    return data;
  } catch (err) {
    console.error('Exception in createReview:', err);
    throw err;
  }
}; 

/**
 * Calcula e retorna as médias de avaliação para uma lista de IDs de fornecedores.
 */
export const getAverageRatingsForSupplierIds = async (supplierIds: string[]): Promise<Map<string, number>> => {
  if (!supplierIds || supplierIds.length === 0) {
    return new Map();
  }

  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('supplier_id, rating')
    .in('supplier_id', supplierIds);

  if (error) {
    console.error('Error fetching reviews for average rating calculation:', error);
    return new Map();
  }

  if (!reviews) {
    return new Map();
  }

  const ratingSums = new Map<string, number>();
  const reviewCounts = new Map<string, number>();

  for (const review of reviews) {
    if (review.supplier_id && typeof review.rating === 'number') {
      ratingSums.set(review.supplier_id, (ratingSums.get(review.supplier_id) || 0) + review.rating);
      reviewCounts.set(review.supplier_id, (reviewCounts.get(review.supplier_id) || 0) + 1);
    }
  }

  const averageRatings = new Map<string, number>();
  for (const [supplierId, totalRating] of ratingSums) {
    const count = reviewCounts.get(supplierId) || 0;
    if (count > 0) {
      averageRatings.set(supplierId, totalRating / count);
    }
  }
  
  console.log("reviewService: Calculated average ratings for suppliers:", averageRatings);
  return averageRatings;
};
