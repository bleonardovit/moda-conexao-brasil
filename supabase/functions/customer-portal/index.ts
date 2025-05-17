
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!STRIPE_SECRET_KEY || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("Missing environment variables for customer portal");
    return new Response(JSON.stringify({ error: "Internal server configuration error." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16",
    httpClient: Stripe.createFetchHttpClient()
  });
  
  const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: req.headers.get("Authorization")! } },
  });

  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user || !user.email) {
      return new Response(JSON.stringify({ error: "User not authenticated." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    console.log("Customer Portal: User authenticated:", user.id, user.email);

    // Find Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      console.log("Customer Portal: No Stripe customer found for email:", user.email);
      // Optionally, you could create a customer here if they somehow don't have one
      // but are trying to access the portal. For now, error out.
      return new Response(JSON.stringify({ error: "Stripe customer not found." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }
    const customerId = customers.data[0].id;
    console.log("Customer Portal: Found Stripe customer:", customerId);
    
    const origin = req.headers.get("origin");
    if (!origin) {
        console.error("Customer Portal: Origin header missing");
        return new Response(JSON.stringify({ error: "Origin header is required." }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/profile`, // Redirect to profile page after portal interaction
    });
    console.log("Customer Portal: Session created:", portalSession.id);

    return new Response(JSON.stringify({ url: portalSession.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Customer Portal: Error creating portal session:", error);
    return new Response(JSON.stringify({ error: error.message || "Failed to create customer portal session." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
