import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header required");
    }

    const { message, conversationHistory, userId } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user's browsing history and preferences
    const { data: userOrders } = await supabase
      .from("orders")
      .select("id")
      .eq("user_id", userId)
      .limit(5);

    const { data: userReviews } = await supabase
      .from("reviews")
      .select("product_id, rating")
      .eq("user_id", userId)
      .limit(10);

    const { data: wishlist } = await supabase
      .from("wishlist")
      .select("product_id")
      .eq("user_id", userId);

    // Get trending products (most reviewed in last 30 days)
    const { data: trendingProducts } = await supabase
      .from("reviews")
      .select("product_id, products(name, price, category_id)")
      .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .limit(10);

    // Get featured products
    const { data: products } = await supabase
      .from("products")
      .select("name, description, price, material, color, category_id, categories(name)")
      .eq("is_featured", true)
      .limit(20);

    const { data: categories } = await supabase
      .from("categories")
      .select("name, description");

    const systemPrompt = `You are a luxury interior design and furniture shopping assistant for LuxInnovate Interiors. 

Your role:
- Help customers find the perfect furniture and decor
- Provide personalized product recommendations based on user preferences
- Answer product queries with specific price ranges and styles
- Provide interior design suggestions for different room types
- Assist with order tracking and support
- Be knowledgeable, elegant, and helpful

User Context:
${userOrders?.length ? `- Customer has ${userOrders.length} previous orders` : "- New customer"}
${userReviews?.length ? `- Has reviewed ${userReviews.length} products` : ""}
${wishlist?.length ? `- Has ${wishlist.length} items in wishlist` : ""}

Available products: ${JSON.stringify(products)}
Available categories: ${JSON.stringify(categories)}
Trending products: ${JSON.stringify(trendingProducts)}

Capabilities:
1. Product Search: When user asks for products (e.g., "modern sofas under ₹50,000"), suggest specific items from available products
2. Interior Design: Provide design suggestions for different room types (minimal office, cozy bedroom, etc.)
3. Order Support: Guide users on order tracking and delivery (note: you don't have access to real-time order data, direct them to their dashboard)
4. Personalization: Use user's history to provide relevant recommendations

Guidelines:
- Be specific and reference actual products when possible
- For price queries, filter products within the budget
- For style queries (modern, minimal, traditional), match with product descriptions
- Always maintain a warm, professional, luxury brand tone
- If you can't find exact matches, suggest similar alternatives
- For order tracking, direct users to their account dashboard`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.slice(-10),
      { role: "user", content: message },
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        temperature: 0.8,
        max_tokens: 800,
      }),
    });

    if (response.status === 429) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (response.status === 402) {
      return new Response(
        JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error("Failed to get AI response");
    }

    const data = await response.json();
    const assistantResponse = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ response: assistantResponse }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in ai-assistant function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
