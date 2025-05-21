import { supabase } from "@/integrations/supabase/client";
import type { User, UserProfileUpdate, UserRole, SubscriptionStatus, SubscriptionType } from "@/types";

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
      email: profile.email || profile.id, // Usar o email da tabela profiles, com fallback para ID se não existir (para usuários antigos)
      full_name: profile.full_name || 'Sem nome',
      phone: profile.phone || undefined,
      subscription_status: profile.subscription_status as 'active' | 'inactive' | 'pending' || 'inactive',
      subscription_type: profile.subscription_type as 'monthly' | 'yearly' | undefined,
      subscription_start_date: profile.subscription_start_date || undefined,
      last_login: profile.last_login || undefined,
      role: profile.role as 'user' | 'admin' || 'user',
      // City e state já são parte do tipo User, mas não são explicitamente mapeados aqui
      // se eles estiverem na tabela profiles, o select '*' os trará e podem ser usados diretamente no componente se necessário
      // Se city e state não estiverem na tabela profiles, este mapeamento não os adicionará ao objeto User.
      // O tipo User já tem city e state opcionais: city?: string; state?: string;
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
        phone: user.phone,
        // O email não deve ser atualizado por aqui, pois é gerenciado pelo auth.users
        // Se precisar atualizar o email do perfil, deve ser feito junto com a atualização do email de autenticação
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
    
    // Retornar os dados atualizados (o user que foi passado como argumento)
    // Idealmente, o 'data' retornado pelo Supabase seria usado, mas precisamos garantir que o tipo User seja consistente.
    // E o 'data' pode não conter todos os campos do tipo User se não forem selecionados.
    // Para este caso, o user passado já contém os campos atualizados exceto o 'email' se o email em profiles fosse diferente.
    // Como não estamos atualizando email aqui, user já reflete o estado desejado.
    const updatedProfile = data as any; // Cast para any para acessar campos dinamicamente
    return {
      ...user, // Mantém os dados originais do usuário
      full_name: updatedProfile.full_name || user.full_name,
      phone: updatedProfile.phone || user.phone,
      // Não atualize o email aqui, ele deve vir do profile.email ou ser gerenciado via auth
    };
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

// Buscar perfil do usuário
export const getUserProfile = async (userId: string): Promise<User | null> => {
  try {
    console.log("Buscando perfil do usuário:", userId);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId);
    
    if (error) {
      console.error("Erro ao buscar perfil do usuário:", error);
      throw error;
    }

    if (!data) {
      console.log("Perfil do usuário não encontrado");
      return null;
    }

    console.log("Perfil do usuário encontrado:", data[0]);
    
    // Mapear os dados do perfil para o formato de User
    return {
      id: data[0].id,
      email: data[0].email || data[0].id, // Usar o email da tabela profiles, com fallback para ID se não existir (para usuários antigos)
      full_name: data[0].full_name || 'Sem nome',
      phone: data[0].phone || undefined,
      subscription_status: data[0].subscription_status as 'active' | 'inactive' | 'pending' || 'inactive',
      subscription_type: data[0].subscription_type as 'monthly' | 'yearly' | undefined,
      subscription_start_date: data[0].subscription_start_date || undefined,
      last_login: data[0].last_login || undefined,
      role: data[0].role as 'user' | 'admin' || 'user',
      // City e state já são parte do tipo User, mas não são explicitamente mapeados aqui
      // se eles estiverem na tabela profiles, o select '*' os trará e podem ser usados diretamente no componente se necessário
      // Se city e state não estiverem na tabela profiles, este mapeamento não os adicionará ao objeto User.
      // O tipo User já tem city e state opcionais: city?: string; state?: string;
    };
  } catch (error) {
    console.error("Erro não tratado ao buscar perfil do usuário:", error);
    throw error;
  }
};

// Atualizar perfil do usuário
export const updateUserProfile = async (userId: string, updates: UserProfileUpdate): Promise<User | null> => {
  try {
    console.log("Atualizando perfil do usuário:", userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error("Erro ao atualizar perfil do usuário:", error);
      throw error;
    }

    console.log("Perfil do usuário atualizado com sucesso:", data);
    
    // Retornar os dados atualizados (o user que foi passado como argumento)
    // Idealmente, o 'data' retornado pelo Supabase seria usado, mas precisamos garantir que o tipo User seja consistente.
    // E o 'data' pode não conter todos os campos do tipo User se não forem selecionados.
    // Para este caso, o user passado já contém os campos atualizados exceto o 'email' se o email em profiles fosse diferente.
    // Como não estamos atualizando email aqui, user já reflete o estado desejado.
    const updatedProfile = data as any; // Cast para any para acessar campos dinamicamente
    return {
      ...user, // Mantém os dados originais do usuário
      full_name: updatedProfile.full_name || user.full_name,
      phone: updatedProfile.phone || user.phone,
      // Não atualize o email aqui, ele deve vir do profile.email ou ser gerenciado via auth
    };
  } catch (error) {
    console.error("Erro não tratado ao atualizar perfil do usuário:", error);
    throw error;
  }
};

// Atualizar role do usuário
export const updateUserRole = async (userId: string, role: UserRole): Promise<User | null> => {
  try {
    console.log("Atualizando role do usuário:", userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .update({
        role: role
      })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error("Erro ao atualizar role do usuário:", error);
      throw error;
    }

    console.log("Role do usuário atualizada com sucesso:", data);
    
    // Retornar os dados atualizados (o user que foi passado como argumento)
    // Idealmente, o 'data' retornado pelo Supabase seria usado, mas precisamos garantir que o tipo User seja consistente.
    // E o 'data' pode não conter todos os campos do tipo User se não forem selecionados.
    // Para este caso, o user passado já contém os campos atualizados exceto o 'email' se o email em profiles fosse diferente.
    // Como não estamos atualizando email aqui, user já reflete o estado desejado.
    const updatedProfile = data as any; // Cast para any para acessar campos dinamicamente
    return {
      ...user, // Mantém os dados originais do usuário
      role: updatedProfile.role || role,
      // Não atualize o email aqui, ele deve vir do profile.email ou ser gerenciado via auth
    };
  } catch (error) {
    console.error("Erro não tratado ao atualizar role do usuário:", error);
    throw error;
  }
};

// Deletar usuário como administrador
export const deleteUserAsAdmin = async (userId: string): Promise<void> => {
  try {
    console.log("Deletando usuário como administrador:", userId);
    
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    if (error) {
      console.error("Erro ao deletar usuário como administrador:", error);
      throw error;
    }

    console.log("Usuário deletado com sucesso");
  } catch (error) {
    console.error("Erro não tratado ao deletar usuário como administrador:", error);
    throw error;
  }
};

// Atualizar status de assinatura do usuário
export const updateUserSubscriptionStatus = async (
  userId: string,
  subscriptionStatus: SubscriptionStatus
): Promise<User | null> => {
  try {
    console.log("Atualizando status de assinatura do usuário:", userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .update({
        subscription_status: subscriptionStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error("Erro ao atualizar status de assinatura do usuário:", error);
      throw error;
    }

    console.log("Status de assinatura do usuário atualizado com sucesso:", data);
    
    // Retornar os dados atualizados (o user que foi passado como argumento)
    // Idealmente, o 'data' retornado pelo Supabase seria usado, mas precisamos garantir que o tipo User seja consistente.
    // E o 'data' pode não conter todos os campos do tipo User se não forem selecionados.
    // Para este caso, o user passado já contém os campos atualizados exceto o 'email' se o email em profiles fosse diferente.
    // Como não estamos atualizando email aqui, user já reflete o estado desejado.
    const updatedProfile = data as any; // Cast para any para acessar campos dinamicamente
    return {
      ...user, // Mantém os dados originais do usuário
      subscription_status: updatedProfile.subscription_status || subscriptionStatus,
      // Não atualize o email aqui, ele deve vir do profile.email ou ser gerenciado via auth
    };
  } catch (error) {
    console.error("Erro não tratado ao atualizar status de assinatura do usuário:", error);
    throw error;
  }
};

// Registrar evento de assinatura
export const recordSubscriptionEvent = async (
  userId: string,
  event: SubscriptionEvent
): Promise<void> => {
  try {
    console.log("Registrando evento de assinatura para o usuário:", userId);
    
    const { error } = await supabase
      .from('subscription_events')
      .insert({
        user_id: userId,
        event: event
      });
    
    if (error) {
      console.error("Erro ao registrar evento de assinatura:", error);
      throw error;
    }

    console.log("Evento de assinatura registrado com sucesso");
  } catch (error) {
    console.error("Erro não tratado ao registrar evento de assinatura:", error);
    throw error;
  }
};

// Buscar atividade recente dos usuários
export const getRecentUserActivity = async (limit: number = 10) => {
  try {
    console.log("Buscando atividade recente dos usuários...");
    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error("Erro ao buscar atividade recente dos usuários:", error);
      throw error;
    }

    if (!data) {
      console.log("Nenhuma atividade recente encontrada");
      return [];
    }

    console.log(`Encontradas ${data.length} atividades recentes`);
    
    return data;
  } catch (error) {
    console.error("Erro não tratado ao buscar atividade recente dos usuários:", error);
    throw error;
  }
};
