import { supabase } from "@/integrations/supabase/client";

export const wishlistService = {
  // Get user wishlist
  getWishlist: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error("Not authenticated") };

    const { data, error } = await supabase
      .from("wishlist")
      .select("*, products(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    
    return { data, error };
  },

  // Add to wishlist
  addToWishlist: async (productId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error("Not authenticated") };

    // Check if already in wishlist
    const { data: existing } = await supabase
      .from("wishlist")
      .select("*")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .maybeSingle();

    if (existing) {
      return { data: existing, error: null };
    }

    const { data, error } = await supabase
      .from("wishlist")
      .insert({ user_id: user.id, product_id: productId })
      .select("*, products(*)")
      .single();
    
    return { data, error };
  },

  // Remove from wishlist
  removeFromWishlist: async (wishlistItemId: string) => {
    const { error } = await supabase
      .from("wishlist")
      .delete()
      .eq("id", wishlistItemId);
    
    return { error };
  },

  // Check if product is in wishlist
  isInWishlist: async (productId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: false, error: null };

    const { data, error } = await supabase
      .from("wishlist")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .maybeSingle();
    
    return { data: !!data, error };
  }
};
