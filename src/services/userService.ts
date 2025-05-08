
import { supabase } from '@/integrations/supabase/client';
import { User, Payment, SubscriptionEvent } from '@/types';

// Buscar todos os usuários
export const getAllUsers = async (): Promise<User[]> => {
  try {
    console.log("Buscando todos os usuários do Supabase...");
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name');
    
    if (error) {
      console.error("Erro ao buscar usuários:", error);
      throw error;
    }

    if (!data) {
      console.log("Nenhum usuário encontrado");
      return [];
    }

    console.log(`Encontrados ${data.length} usuários`);
    
    // Mapear os dados do perfil para o formato de User
    return data.map(profile => ({
      id: profile.id,
      email: profile.email || '',
      full_name: profile.full_name || 'Sem nome',
      phone: profile.phone || undefined,
      subscription_status: profile.subscription_status as 'active' | 'inactive' | 'pending' || 'inactive',
      subscription_type: profile.subscription_type as 'monthly' | 'yearly' | undefined,
      subscription_start_date: profile.subscription_start_date || undefined,
      last_login: profile.last_login || undefined,
      role: profile.role as 'user' | 'admin' || 'user',
    }));
  } catch (error) {
    console.error("Erro não tratado ao buscar usuários:", error);
    throw error;
  }
};

// Buscar pagamentos por ID do usuário
export const getUserPayments = async (userId: string): Promise<Payment[]> => {
  // Aqui seria uma chamada real à API para buscar pagamentos do usuário
  // Por enquanto, retornamos os dados mockados
  const MOCK_PAYMENTS = [
    { id: 'pay1', user_id: 'user1', amount: 'R$ 29,90', date: '2023-07-10', status: 'success', method: 'card' },
    { id: 'pay2', user_id: 'user1', amount: 'R$ 29,90', date: '2023-06-10', status: 'success', method: 'card' },
    { id: 'pay3', user_id: 'user1', amount: 'R$ 29,90', date: '2023-05-10', status: 'success', method: 'card' },
    { id: 'pay4', user_id: 'user2', amount: 'R$ 299,00', date: '2023-04-15', status: 'success', method: 'pix' },
    { id: 'pay5', user_id: 'user3', amount: 'R$ 29,90', date: '2023-03-20', status: 'success', method: 'card' },
    { id: 'pay6', user_id: 'user3', amount: 'R$ 29,90', date: '2023-04-20', status: 'failed', method: 'card' },
  ] as Payment[];

  return MOCK_PAYMENTS.filter(payment => payment.user_id === userId);
};

// Atualizar usuário
export const updateUser = async (user: User): Promise<User> => {
  try {
    console.log("Atualizando usuário:", user.id);
    
    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();
    
    if (error) {
      console.error("Erro ao atualizar usuário:", error);
      throw error;
    }

    console.log("Usuário atualizado com sucesso:", data);
    
    // Retornar os dados atualizados
    return user;
  } catch (error) {
    console.error("Erro não tratado ao atualizar usuário:", error);
    throw error;
  }
};

// Atualizar assinatura
export const updateSubscription = async (userId: string, subscriptionType: string, subscriptionStatus: string): Promise<void> => {
  try {
    console.log("Atualizando assinatura para o usuário:", userId);
    
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_type: subscriptionType,
        subscription_status: subscriptionStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (error) {
      console.error("Erro ao atualizar assinatura:", error);
      throw error;
    }

    console.log("Assinatura atualizada com sucesso");
  } catch (error) {
    console.error("Erro não tratado ao atualizar assinatura:", error);
    throw error;
  }
};

// Desativar usuário
export const deactivateUser = async (userId: string): Promise<void> => {
  try {
    console.log("Desativando usuário:", userId);
    
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'inactive',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (error) {
      console.error("Erro ao desativar usuário:", error);
      throw error;
    }

    console.log("Usuário desativado com sucesso");
  } catch (error) {
    console.error("Erro não tratado ao desativar usuário:", error);
    throw error;
  }
};
