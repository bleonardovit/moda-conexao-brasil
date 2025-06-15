
/**
 * Serviço para chamada da Edge Function responsável por enviar eventos à Meta Conversions API.
 */
import { supabase } from '@/integrations/supabase/client';

interface MetaConversionEvent {
  eventName: string;
  eventId?: string;
  eventData: Record<string, any>;
}

export async function sendMetaConversionEvent({ eventName, eventId, eventData }: MetaConversionEvent) {
  try {
    const { data, error } = await supabase.functions.invoke('meta-conversions-api', {
      body: {
        eventName,
        eventId,
        eventData,
      },
    });

    if (error) {
      console.error('Erro ao enviar evento para Meta Conversions API:', error);
      return false;
    }

    return data?.success === true;
  } catch (err) {
    console.error('Erro ao chamar meta-conversions-api:', err);
    return false;
  }
}
