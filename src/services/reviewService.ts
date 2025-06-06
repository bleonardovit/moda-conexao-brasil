
import { supabase } from "@/integrations/supabase/client";
import type { Review, ReviewBan } from '@/types/review';
import { userCanReviewSupplier, getCurrentUserId } from './optimizedDbFunctions';

// Tipagem para os dados necessários para criar uma review
export interface CreateReviewData {
  supplier_id: string;
  rating: number;
  comment?: string;
}

/**
 * Busca todas as reviews para um fornecedor específico (filtra reviews ocultas para usuários normais).
 */
export const getReviewsBySupplierId = async (supplierId: string): Promise<Review[]> => {
  if (!supplierId) {
    console.error('Supplier ID is required to fetch reviews.');
    return [];
  }
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('supplier_id', supplierId)
      .eq('hidden', false) // Sempre filtrar reviews ocultas para usuários normais
      .order('created_at', { ascending: false });

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
 * Busca todas as reviews para moderação (apenas admins).
 */
export const getAllReviewsForModeration = async (): Promise<(Review & { supplier_name?: string })[]> => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        suppliers(name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all reviews for moderation:', error);
      throw error;
    }

    return (data || []).map(review => ({
      ...review,
      supplier_name: review.suppliers?.name
    }));
  } catch (err) {
    console.error('Exception in getAllReviewsForModeration:', err);
    throw err;
  }
};

/**
 * Oculta uma review (marca como hidden = true).
 */
export const hideReview = async (reviewId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('reviews')
      .update({ hidden: true })
      .eq('id', reviewId);

    if (error) {
      console.error('Error hiding review:', error);
      throw error;
    }
  } catch (err) {
    console.error('Exception in hideReview:', err);
    throw err;
  }
};

/**
 * Verifica se um usuário está banido de fazer reviews.
 */
export const isUserBannedFromReviews = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('review_bans')
      .select('user_id')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Error checking user ban status:', error);
      throw error;
    }

    return !!data;
  } catch (err) {
    console.error('Exception in isUserBannedFromReviews:', err);
    return false;
  }
};

/**
 * Bane um usuário de fazer reviews.
 */
export const banUserFromReviews = async (userId: string, reason?: string): Promise<void> => {
  try {
    const currentUserId = await getCurrentUserId();
    
    const { error } = await supabase
      .from('review_bans')
      .insert({
        user_id: userId,
        blocked_by: currentUserId,
        reason: reason
      });

    if (error) {
      console.error('Error banning user from reviews:', error);
      if (error.code === '23505') {
        throw new Error('Usuário já está banido de fazer avaliações.');
      }
      throw error;
    }
  } catch (err) {
    console.error('Exception in banUserFromReviews:', err);
    throw err;
  }
};

/**
 * Cria uma nova review no banco de dados.
 */
export const createReview = async (reviewData: CreateReviewData, userId: string): Promise<Review> => {
  if (!userId) {
    throw new Error('User ID is required to create a review.');
  }

  // Usa a função otimizada do banco para verificar se pode fazer review
  const canReview = await userCanReviewSupplier(reviewData.supplier_id);
  if (!canReview) {
    throw new Error('Você está temporariamente impedido de fazer avaliações.');
  }

  let userName = 'Usuário Anônimo';
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      userName = user.email.split('@')[0];
    }
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
    .in('supplier_id', supplierIds)
    .eq('hidden', false); // Apenas reviews não ocultas

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
