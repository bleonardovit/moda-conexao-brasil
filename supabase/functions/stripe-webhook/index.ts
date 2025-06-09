
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for enhanced debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook recebido");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey || !webhookSecret) {
      throw new Error("STRIPE_SECRET_KEY ou STRIPE_WEBHOOK_SECRET não configurados");
    }
    
    logStep("Chaves Stripe verificadas");

    // Use the service role key para bypass RLS
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    
    if (!signature) {
      throw new Error("Assinatura do webhook não encontrada");
    }

    logStep("Verificando assinatura do webhook");
    
    let event: Stripe.Event;
    try {
      // Usar a versão assíncrona para compatibilidade com Deno
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      logStep("Falha na verificação da assinatura", { error: err.message });
      return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 });
    }

    logStep("Evento recebido", { type: event.type, id: event.id });

    // Processar apenas eventos relevantes para assinaturas
    if (event.type === "customer.subscription.created" || 
        event.type === "customer.subscription.updated" ||
        event.type === "invoice.payment_succeeded") {
      
      const subscription = event.data.object as Stripe.Subscription;
      let customerId: string;
      
      if (event.type === "invoice.payment_succeeded") {
        const invoice = event.data.object as Stripe.Invoice;
        customerId = invoice.customer as string;
        
        // Buscar a assinatura ativa do cliente
        const subscriptions = await stripe.subscriptions.list({
          customer: customerId,
          status: "active",
          limit: 1,
        });
        
        if (subscriptions.data.length === 0) {
          logStep("Nenhuma assinatura ativa encontrada para o pagamento");
          return new Response("OK", { status: 200 });
        }
        
        // Usar a primeira assinatura ativa
        Object.assign(subscription, subscriptions.data[0]);
      } else {
        customerId = subscription.customer as string;
      }

      logStep("Processando assinatura", { customerId, subscriptionId: subscription.id, status: subscription.status });

      // Buscar o cliente no Stripe para obter o email
      const customer = await stripe.customers.retrieve(customerId);
      
      if (!customer || customer.deleted || !('email' in customer) || !customer.email) {
        logStep("Cliente não encontrado ou sem email", { customerId });
        return new Response("Cliente não encontrado", { status: 400 });
      }

      logStep("Cliente encontrado", { email: customer.email });

      // Determinar o tipo de assinatura baseado no price_id
      const priceId = subscription.items.data[0]?.price?.id;
      let subscriptionType: 'monthly' | 'yearly' = 'monthly';
      
      if (priceId) {
        const price = await stripe.prices.retrieve(priceId);
        if (price.recurring?.interval === 'year') {
          subscriptionType = 'yearly';
        }
      }

      logStep("Tipo de assinatura determinado", { priceId, subscriptionType });

      // Atualizar o perfil do usuário no Supabase
      if (subscription.status === 'active') {
        const { data, error } = await supabaseClient
          .from('profiles')
          .update({
            subscription_status: 'active',
            subscription_type: subscriptionType,
            subscription_start_date: new Date(subscription.current_period_start * 1000).toISOString(),
            trial_status: 'converted',
            updated_at: new Date().toISOString(),
          })
          .eq('email', customer.email);

        if (error) {
          logStep("Erro ao atualizar perfil", { error: error.message, email: customer.email });
          throw error;
        }

        logStep("Perfil atualizado com sucesso", { 
          email: customer.email, 
          subscriptionType, 
          startDate: new Date(subscription.current_period_start * 1000).toISOString() 
        });
      } else {
        logStep("Assinatura não está ativa", { status: subscription.status });
      }
    } else {
      logStep("Evento ignorado", { type: event.type });
    }

    return new Response("OK", { 
      status: 200,
      headers: corsHeaders 
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERRO no webhook", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
