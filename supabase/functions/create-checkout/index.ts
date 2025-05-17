
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

// Stripe Product IDs
const MONTHLY_PLAN_ID = "price_1Pbdo4RvHwzH1TqS400LSxZd"; // Placeholder for R$ 9,70/mês (prod_SKDr4FhH8ZMx1z) - Actual Price ID
const YEARLY_PLAN_ID = "price_1PbdrLRvHwzH1TqSEgDxcLzI";   // Placeholder for R$ 87,00/ano (prod_SKDstDNOxG1OOV) - Actual Price ID
// IMPORTANT: Replace placeholder Price IDs above with actual Price IDs from your Stripe dashboard
// The product IDs provided (prod_SKD...) are for Products, not Prices. Stripe Checkout needs Price IDs.
// I will use placeholder Price IDs here. You'll need to create these prices in Stripe under your products.
// Monthly Product ID: prod_SKDr4FhH8ZMx1z
// Yearly Product ID: prod_SKDstDNOxG1OOV
// Based on these, create prices in Stripe and get their Price IDs (e.g., price_xxxxxxxxxxxxxx)

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!STRIPE_SECRET_KEY || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("Missing environment variables");
    return new Response(JSON.stringify({ error: "Internal server configuration error." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
  
  const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16", // Use a fixed API version
    httpClient: Stripe.createFetchHttpClient()
  });

  const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: req.headers.get("Authorization")! } },
  });

  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "User not authenticated." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    console.log("User authenticated:", user.id, user.email);

    const { planType } = await req.json(); // 'monthly' or 'yearly'
    console.log("Requested plan type:", planType);

    let priceId;
    if (planType === 'monthly') {
      priceId = MONTHLY_PLAN_ID;
    } else if (planType === 'yearly') {
      priceId = YEARLY_PLAN_ID;
    } else {
      return new Response(JSON.stringify({ error: "Invalid plan type specified." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    
    console.log("Selected Stripe Price ID:", priceId);

    // Check if customer exists in Stripe
    let customerId;
    const customers = await stripe.customers.list({ email: user.email!, limit: 1 });
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log("Existing Stripe customer found:", customerId);
    } else {
      // Create a new customer in Stripe
      const newCustomer = await stripe.customers.create({
        email: user.email!,
        metadata: { supabase_user_id: user.id }
      });
      customerId = newCustomer.id;
      console.log("New Stripe customer created:", customerId);
    }

    const origin = req.headers.get("origin");
    if (!origin) {
        console.error("Origin header missing");
        return new Response(JSON.stringify({ error: "Origin header is required." }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "boleto"], // Added boleto
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${origin}/auth/payment?payment_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/auth/payment?payment_cancelled=true`,
      metadata: {
          supabase_user_id: user.id,
          plan_type: planType
      },
      // Boleto specific configuration (optional, based on your Stripe settings)
      payment_method_options: {
        boleto: {
          expires_after_days: 3, // Example: Boleto expires in 3 days
        },
      },
    });
    console.log("Stripe Checkout Session created:", session.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(JSON.stringify({ error: error.message || "Failed to create checkout session." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
