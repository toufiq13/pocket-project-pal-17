import { supabase } from "@/integrations/supabase/client";

export const orderService = {
  // Create new order
  createOrder: async (orderData: {
    total_amount: number;
    shipping_address: string;
    billing_address: string;
    items: Array<{
      product_id: string;
      quantity: number;
      price: number;
    }>;
  }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error("Not authenticated") };

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        total_amount: orderData.total_amount,
        shipping_address: orderData.shipping_address,
        billing_address: orderData.billing_address,
        status: "pending"
      })
      .select()
      .single();

    if (orderError || !order) {
      return { data: null, error: orderError };
    }

    // Create order items
    const orderItems = orderData.items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      // Rollback order creation if items fail
      await supabase.from("orders").delete().eq("id", order.id);
      return { data: null, error: itemsError };
    }

    return { data: order, error: null };
  },

  // Get user orders
  getOrders: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error("Not authenticated") };

    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*, products(*))")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    
    return { data, error };
  },

  // Get all orders (Admin only)
  getAllOrders: async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*, profiles(full_name, email), order_items(*, products(*))")
      .order("created_at", { ascending: false });
    
    return { data, error };
  },

  // Get order by ID
  getOrderById: async (orderId: string) => {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*, products(*))")
      .eq("id", orderId)
      .single();
    
    return { data, error };
  },

  // Update order status
  updateOrderStatus: async (orderId: string, status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled') => {
    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId)
      .select()
      .single();
    
    return { data, error };
  },

  // Cancel order
  cancelOrder: async (orderId: string) => {
    const { data, error } = await supabase
      .from("orders")
      .update({ status: 'cancelled' as const })
      .eq("id", orderId)
      .select()
      .single();
    
    return { data, error };
  }
};
