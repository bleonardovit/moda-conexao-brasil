
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0"; // Use a specific version
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

// ==========================================================================================
// !! IMPORTANTE !! ATENÇÃO !! IMPORTANTE !!
//
// OS IDs ABAIXO SÃO PLACEHOLDERS. VOCÊ PRECISA SUBSTITUÍ-LOS PELOS SEUS
// PRICE IDs REAIS CRIADOS NO SEU PAINEL DO STRIPE.
//
// Mensal (R$ 9,70/mês) - Produto ID: prod_SKDr4FhH8ZMx1z
// Anual (R$ 87,00/ano) - Produto ID: prod_SKDstDNOxG1OOV
//
// Para cada um desses PRODUTOS, você deve criar um PREÇO (Price) no Stripe
// e usar o ID do PREÇO (ex: price_xxxxxxxxxxxxxx) aqui.
//
// SE VOCÊ NÃO SUBSTITUIR ESTES IDs, O CHECKOUT DO STRIPE FALHARÁ.
// O erro "No such price" nos logs da função indica que este é o problema.
// ==========================================================================================
const MONTHLY_PLAN_ID = "price_1Pbdo4RvHwzH1TqS400LSxZd"; // SUBSTITUA PELO SEU PRICE ID MENSAL REAL
const YEARLY_PLAN_ID = "price_1PbdrLRvHwzH1TqSEgDxcLzI";   // SUBSTITUA PELO SEU PRICE ID ANUAL REAL


serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  console.log("Função create-checkout chamada");

  if (!STRIPE_SECRET_KEY || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("Variáveis de ambiente ausentes: STRIPE_SECRET_KEY, SUPABASE_URL, ou SUPABASE_ANON_KEY");
    return new Response(JSON.stringify({ error: "Erro de configuração interna do servidor." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
  console.log("Variáveis de ambiente verificadas.");

  const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16", // Use a fixed API version
    httpClient: Stripe.createFetchHttpClient()
  });
  console.log("Cliente Stripe inicializado.");

  const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: req.headers.get("Authorization")! } },
  });
  console.log("Cliente Supabase inicializado.");

  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      console.error("Usuário não autenticado.");
      return new Response(JSON.stringify({ error: "Usuário não autenticado." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    console.log("Usuário autenticado:", user.id, user.email);

    const body = await req.json();
    const { planType } = body; 
    console.log("Tipo de plano requisitado:", planType);

    let priceId;
    if (planType === 'monthly') {
      priceId = MONTHLY_PLAN_ID;
    } else if (planType === 'yearly') {
      priceId = YEARLY_PLAN_ID;
    } else {
      console.error("Tipo de plano inválido especificado:", planType);
      return new Response(JSON.stringify({ error: "Tipo de plano inválido especificado." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    
    console.log("ID de Preço Stripe selecionado:", priceId);
    if (priceId === "price_1Pbdo4RvHwzH1TqS400LSxZd" || priceId === "price_1PbdrLRvHwzH1TqSEgDxcLzI") {
        console.warn("!! ALERTA !! Você está usando IDs de Preço PLACEHOLDER. Substitua-os pelos seus IDs reais do Stripe para que o checkout funcione.");
    }


    // Check if customer exists in Stripe
    let customerId;
    const customers = await stripe.customers.list({ email: user.email!, limit: 1 });
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log("Cliente Stripe existente encontrado:", customerId);
    } else {
      // Create a new customer in Stripe
      const newCustomer = await stripe.customers.create({
        email: user.email!,
        metadata: { supabase_user_id: user.id }
      });
      customerId = newCustomer.id;
      console.log("Novo cliente Stripe criado:", customerId);
    }

    const origin = req.headers.get("origin");
    if (!origin) {
        console.error("Cabeçalho Origin ausente na requisição.");
        return new Response(JSON.stringify({ error: "Cabeçalho Origin é obrigatório." }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
    console.log("Origin da requisição:", origin);
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "boleto"], 
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${origin}/auth/payment?payment_success=true&session_id={CHECKOUT_SESSION_ID}&plan=${planType}`,
      cancel_url: `${origin}/auth/payment?payment_cancelled=true&plan=${planType}`,
      metadata: {
          supabase_user_id: user.id,
          plan_type: planType
      },
      payment_method_options: {
        boleto: {
          expires_after_days: 3, 
        },
      },
    });
    console.log("Sessão de Checkout Stripe criada:", session.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Erro ao criar sessão de checkout:", error);
    return new Response(JSON.stringify({ error: error.message || "Falha ao criar sessão de checkout." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

