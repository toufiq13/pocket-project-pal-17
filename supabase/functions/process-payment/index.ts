import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    );

    const { action, orderId, amount, paymentMethod, transactionId } = await req.json();

    console.log('Payment processing request:', { action, orderId, amount, paymentMethod });

    if (action === 'create') {
      // Create payment record
      const { data: payment, error: paymentError } = await supabaseClient
        .from('payments')
        .insert({
          order_id: orderId,
          amount,
          payment_method: paymentMethod,
          status: 'pending',
          transaction_id: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        })
        .select()
        .single();

      if (paymentError) {
        throw paymentError;
      }

      // In a real implementation, you would integrate with payment gateways here:
      // - Razorpay: https://razorpay.com/docs/api/
      // - Stripe: https://stripe.com/docs/api
      
      // For now, return mock payment intent
      return new Response(
        JSON.stringify({
          success: true,
          payment,
          message: 'Payment initiated. Integrate with Razorpay/Stripe for real payments.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (action === 'verify') {
      // Verify payment
      const { data: payment, error: paymentError } = await supabaseClient
        .from('payments')
        .select('*')
        .eq('transaction_id', transactionId)
        .eq('order_id', orderId)
        .single();

      if (paymentError || !payment) {
        throw new Error('Payment not found');
      }

      // Update payment status
      const { error: updateError } = await supabaseClient
        .from('payments')
        .update({ status: 'completed' })
        .eq('id', payment.id);

      if (updateError) {
        throw updateError;
      }

      // Update order status
      const { error: orderUpdateError } = await supabaseClient
        .from('orders')
        .update({ status: 'confirmed' })
        .eq('id', orderId);

      if (orderUpdateError) {
        throw orderUpdateError;
      }

      return new Response(
        JSON.stringify({
          success: true,
          verified: true,
          message: 'Payment verified successfully'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else {
      throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Error in process-payment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage, success: false }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
