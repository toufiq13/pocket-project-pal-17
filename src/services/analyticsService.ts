import { supabase } from "@/integrations/supabase/client";

export const analyticsService = {
  // Get sales trends (Admin only)
  getSalesTrends: async (startDate?: string, endDate?: string) => {
    let query = supabase
      .from("orders")
      .select("created_at, total_amount, status");

    if (startDate) {
      query = query.gte("created_at", startDate);
    }
    if (endDate) {
      query = query.lte("created_at", endDate);
    }

    const { data, error } = await query.order("created_at", { ascending: true });
    
    return { data, error };
  },

  // Get product analytics
  getProductAnalytics: async () => {
    const { data: interactions, error: interactionsError } = await supabase
      .from("user_interactions")
      .select("product_id, interaction_type, created_at");

    const { data: orders, error: ordersError } = await supabase
      .from("order_items")
      .select("product_id, quantity, price");

    return {
      data: { interactions, orders },
      error: interactionsError || ordersError
    };
  },

  // Get user analytics (Admin only)
  getUserAnalytics: async () => {
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("created_at, user_type");

    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("user_id, total_amount, created_at");

    return {
      data: { profiles, orders },
      error: profilesError || ordersError
    };
  },

  // Get revenue analytics
  getRevenueAnalytics: async (startDate?: string, endDate?: string) => {
    let query = supabase
      .from("payments")
      .select("amount, status, created_at")
      .eq("status", "completed");

    if (startDate) {
      query = query.gte("created_at", startDate);
    }
    if (endDate) {
      query = query.lte("created_at", endDate);
    }

    const { data, error } = await query;
    
    return { data, error };
  },

  // Get inventory analytics
  getInventoryAnalytics: async () => {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, stock_quantity, price")
      .order("stock_quantity", { ascending: true });
    
    return { data, error };
  }
};
