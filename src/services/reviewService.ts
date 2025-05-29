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