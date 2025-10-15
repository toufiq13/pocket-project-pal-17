import { supabase } from "@/integrations/supabase/client";

export const paymentService = {
  // Create payment intent
  createPayment: async (orderId: string, amount: number, paymentMethod: string) => {
    const { data, error } = await supabase.functions.invoke("process-payment", {
      body: {
        action: "create",
        orderId,
        amount,
        paymentMethod
      }
    });

    return { data, error };
  },

  // Verify payment
  verifyPayment: async (transactionId: string, orderId: string) => {
    const { data, error } = await supabase.functions.invoke("process-payment", {
      body: {
        action: "verify",
        transactionId,
        orderId
      }
    });

    return { data, error };
  },

  // Get payment status
  getPaymentStatus: async (orderId: string) => {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("order_id", orderId)
      .maybeSingle();
    
    return { data, error };
  },

  // Get all payments (Admin only)
  getAllPayments: async () => {
    const { data, error } = await supabase
      .from("payments")
      .select("*, orders(*, profiles(full_name, email))")
      .order("created_at", { ascending: false });
    
    return { data, error };
  }
};
