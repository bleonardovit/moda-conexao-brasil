
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const META_API_URL = "https://graph.facebook.com/v19.0/"; // v19.0 atual, atualizar se necessário

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const { eventName, eventId, eventData } = await req.json();

    // Buscar o access token do Meta salvo em settings:
    // NOTA: esse exemplo busca só o primeiro token ativo cadastrado!
    // Você pode customizar para buscar o correto conforme o pixel/conta se necessário.
    const supabaseAdminKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const settingsResp = await fetch(
      `${supabaseUrl}/rest/v1/tracking_settings?select=meta_access_token,key,is_active`,
      {
        headers: {
          apikey: supabaseAdminKey!,
          Authorization: `Bearer ${supabaseAdminKey}`,
        },
      }
    );
    const settings = await settingsResp.json();
    const activeMetaSetting = settings.find((s: any) => s.key === 'meta_conversions_api' && s.is_active && s.meta_access_token);

    if (!activeMetaSetting?.meta_access_token) {
      return new Response(JSON.stringify({ error: "Access Token não configurado/ativo" }), { status: 400, headers: corsHeaders });
    }
    const accessToken = activeMetaSetting.meta_access_token;

    // Exemplo: buscar pixel_id caso precise para integração de eventos (opcional)
    // TODO: você pode buscar do tracking_settings também, se desejar/precisar!

    // Monta o corpo do evento conforme docs do Meta
    const fbData = {
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      action_source: 'website',
      ...eventData,
    };

    // Envie para endpoint do pixel (exemplo, você pode parametrizar qual pixel utilizar)
    // TODO: troque {PIXEL_ID} pelo valor configurado
    const PIXEL_ID = eventData.pixel_id || "COLOQUE_SEU_PIXELID"; // ajuste!

    const response = await fetch(
      `${META_API_URL}${PIXEL_ID}/events?access_token=${accessToken}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: [fbData] }),
      }
    );
    const fbResult = await response.json();

    if (response.ok && fbResult?.events_received) {
      return new Response(JSON.stringify({ success: true, result: fbResult }), { headers: corsHeaders });
    } else {
      return new Response(JSON.stringify({ success: false, error: fbResult.error || "Erro desconhecido" }), { status: 500, headers: corsHeaders });
    }
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers: corsHeaders });
  }
});
