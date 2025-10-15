import { supabase } from "@/integrations/supabase/client";

export const cartService = {
  // Get user cart
  getCart: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error("Not authenticated") };

    const { data, error } = await supabase
      .from("cart")
      .select("*, products(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    
    return { data, error };
  },

  // Add item to cart
  addToCart: async (productId: string, quantity: number = 1) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error("Not authenticated") };

    // Check if item already exists
    const { data: existing } = await supabase
      .from("cart")
      .select("*")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .maybeSingle();

    if (existing) {
      // Update quantity
      const { data, error } = await supabase
        .from("cart")
        .update({ quantity: existing.quantity + quantity })
        .eq("id", existing.id)
        .select("*, products(*)")
        .single();
      
      return { data, error };
    }

    // Add new item
    const { data, error } = await supabase
      .from("cart")
      .insert({ user_id: user.id, product_id: productId, quantity })
      .select("*, products(*)")
      .single();
    
    return { data, error };
  },

  // Update cart item quantity
  updateCartItem: async (cartItemId: string, quantity: number) => {
    const { data, error } = await supabase
      .from("cart")
      .update({ quantity })
      .eq("id", cartItemId)
      .select("*, products(*)")
      .single();
    
    return { data, error };
  },

  // Remove item from cart
  removeFromCart: async (cartItemId: string) => {
    const { error } = await supabase
      .from("cart")
      .delete()
      .eq("id", cartItemId);
    
    return { error };
  },

  // Clear entire cart
  clearCart: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: new Error("Not authenticated") };

    const { error } = await supabase
      .from("cart")
      .delete()
      .eq("user_id", user.id);
    
    return { error };
  }
};
