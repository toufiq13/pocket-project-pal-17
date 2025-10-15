import { supabase } from "@/integrations/supabase/client";

export const recommendationService = {
  // Get ML-based product recommendations
  getRecommendations: async (userId?: string, productId?: string, limit: number = 6) => {
    const { data, error } = await supabase.functions.invoke("get-recommendations", {
      body: {
        userId,
        productId,
        limit
      }
    });

    return { data, error };
  },

  // Track user interaction for ML
  trackInteraction: async (productId: string, interactionType: string, metadata?: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: new Error("Not authenticated") };

    const { error } = await supabase
      .from("user_interactions")
      .insert({
        user_id: user.id,
        product_id: productId,
        interaction_type: interactionType,
        metadata
      });
    
    return { error };
  },

  // Get trending products
  getTrendingProducts: async (limit: number = 10) => {
    const { data, error } = await supabase
      .from("user_interactions")
      .select("product_id, products(*)")
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .limit(limit);
    
    return { data, error };
  }
};
