
import { supabase } from '@/integrations/supabase/client';

export interface OrphanedUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
}

export interface SecurityCleanupReport {
  orphanedUsersFound: number;
  orphanedUsersProcessed: number;
  errors: string[];
  timestamp: string;
}

/**
 * SECURITY SERVICE: Identifica e trata usuários órfãos no sistema
 * Usuários órfãos são aqueles que existem na tabela auth.users mas não têm perfil correspondente
 */
export class SecurityCleanupService {
  
  /**
   * Identifica usuários órfãos que precisam ser removidos
   * Retorna uma lista de usuários do auth que não têm perfil correspondente
   */
  static async identifyOrphanedUsers(): Promise<OrphanedUser[]> {
    try {
      // Note: Esta consulta requer privilégios especiais para acessar auth.users
      // Em produção, isso deve ser implementado como uma Edge Function com service role
      console.warn('SECURITY: identifyOrphanedUsers requires service role access to auth.users');
      
      // Por enquanto, retornamos uma lista vazia
      // A implementação completa requer uma Edge Function
      return [];
      
    } catch (error) {
      console.error('Error identifying orphaned users:', error);
      throw new Error('Failed to identify orphaned users');
    }
  }

  /**
   * Executa limpeza de segurança completa
   * Remove usuários órfãos e gera relatório
   */
  static async performSecurityCleanup(): Promise<SecurityCleanupReport> {
    const report: SecurityCleanupReport = {
      orphanedUsersFound: 0,
      orphanedUsersProcessed: 0,
      errors: [],
      timestamp: new Date().toISOString()
    };

    try {
      console.log('SECURITY: Starting security cleanup process...');
      
      // Identificar usuários órfãos
      const orphanedUsers = await this.identifyOrphanedUsers();
      report.orphanedUsersFound = orphanedUsers.length;
      
      if (orphanedUsers.length === 0) {
        console.log('SECURITY: No orphaned users found');
        return report;
      }
      
      console.log(`SECURITY: Found ${orphanedUsers.length} orphaned users`);
      
      // Processar cada usuário órfão
      for (const user of orphanedUsers) {
        try {
          await this.processOrphanedUser(user);
          report.orphanedUsersProcessed++;
        } catch (error) {
          const errorMsg = `Failed to process orphaned user ${user.email}: ${error}`;
          console.error(errorMsg);
          report.errors.push(errorMsg);
        }
      }
      
      console.log(`SECURITY: Cleanup completed. Processed ${report.orphanedUsersProcessed}/${report.orphanedUsersFound} orphaned users`);
      
    } catch (error) {
      const errorMsg = `Security cleanup failed: ${error}`;
      console.error(errorMsg);
      report.errors.push(errorMsg);
    }

    return report;
  }

  /**
   * Processa um usuário órfão específico
   * Registra o evento e remove o usuário do auth
   */
  private static async processOrphanedUser(user: OrphanedUser): Promise<void> {
    try {
      console.log(`SECURITY: Processing orphaned user: ${user.email} (${user.id})`);
      
      // Registrar o evento de limpeza de segurança
      await this.logSecurityEvent('ORPHANED_USER_CLEANUP', {
        userId: user.id,
        userEmail: user.email,
        userCreatedAt: user.created_at,
        lastSignInAt: user.last_sign_in_at
      });
      
      // Note: A remoção real do usuário do auth.users requer service role
      // Isso deve ser implementado como uma Edge Function
      console.warn('SECURITY: Actual user deletion requires service role implementation');
      
    } catch (error) {
      console.error(`Error processing orphaned user ${user.email}:`, error);
      throw error;
    }
  }

  /**
   * Registra eventos de segurança importantes
   */
  private static async logSecurityEvent(eventType: string, metadata: any): Promise<void> {
    try {
      // Por enquanto, apenas log no console
      // Em produção, isso deve ser salvo em uma tabela de auditoria
      console.log('SECURITY_EVENT:', {
        type: eventType,
        timestamp: new Date().toISOString(),
        metadata
      });
      
      // TODO: Implementar tabela de auditoria de segurança
      // await supabase.from('security_audit_log').insert({
      //   event_type: eventType,
      //   metadata: metadata,
      //   created_at: new Date().toISOString()
      // });
      
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }

  /**
   * Valida se um usuário específico tem perfil válido
   */
  static async validateUserIntegrity(userId: string): Promise<{
    isValid: boolean;
    hasProfile: boolean;
    profileData?: any;
    issues: string[];
  }> {
    const result = {
      isValid: true,
      hasProfile: false,
      profileData: undefined,
      issues: [] as string[]
    };

    try {
      // Verificar se o perfil existe
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          result.hasProfile = false;
          result.isValid = false;
          result.issues.push('No profile found for user');
        } else {
          result.issues.push(`Profile query error: ${error.message}`);
          result.isValid = false;
        }
        return result;
      }

      if (!profile) {
        result.hasProfile = false;
        result.isValid = false;
        result.issues.push('Profile is null');
        return result;
      }

      result.hasProfile = true;
      result.profileData = profile;

      // Verificar integridade dos dados do perfil
      if (!profile.email) {
        result.issues.push('Profile missing email');
        result.isValid = false;
      }

      if (!profile.role) {
        result.issues.push('Profile missing role');
        result.isValid = false;
      }

      // Verificar se há sessões ativas órfãs
      const { data: sessions, error: sessionError } = await supabase
        .from('active_sessions')
        .select('*')
        .eq('user_id', userId);

      if (sessionError) {
        result.issues.push(`Session check error: ${sessionError.message}`);
      }

    } catch (error) {
      result.isValid = false;
      result.issues.push(`Validation error: ${error}`);
    }

    return result;
  }
}
