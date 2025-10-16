import { describe, it, expect, vi, beforeEach } from 'vitest';
import { paymentService } from '../paymentService';
import { supabase } from '@/integrations/supabase/client';

describe('PaymentService - Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createPayment', () => {
    it('should create payment successfully', async () => {
      const mockPayment = {
        id: 'pay_123',
        order_id: 'order_123',
        amount: 1000,
        status: 'pending',
        transaction_id: 'TXN-123',
      };

      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { success: true, payment: mockPayment },
        error: null,
      } as any);

      const result = await paymentService.createPayment('order_123', 1000, 'card');

      expect(result.data).toEqual({ success: true, payment: mockPayment });
      expect(supabase.functions.invoke).toHaveBeenCalledWith('process-payment', {
        body: {
          action: 'create',
          orderId: 'order_123',
          amount: 1000,
          paymentMethod: 'card',
        },
      });
    });

    it('should validate amount is positive', async () => {
      const result = await paymentService.createPayment('order_123', -100, 'card');
      
      expect(result.error).toBeTruthy();
    });

    it('should validate payment method', async () => {
      const result = await paymentService.createPayment('order_123', 1000, '');
      
      expect(result.error).toBeTruthy();
    });
  });

  describe('verifyPayment', () => {
    it('should verify payment successfully', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { success: true, verified: true },
        error: null,
      } as any);

      const result = await paymentService.verifyPayment('TXN-123', 'order_123');

      expect(result.data).toEqual({ success: true, verified: true });
      expect(supabase.functions.invoke).toHaveBeenCalledWith('process-payment', {
        body: {
          action: 'verify',
          transactionId: 'TXN-123',
          orderId: 'order_123',
        },
      });
    });

    it('should handle verification failure', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: null,
        error: { message: 'Payment not found' },
      } as any);

      const result = await paymentService.verifyPayment('invalid', 'order_123');

      expect(result.error).toBeTruthy();
    });
  });

  describe('getPaymentStatus', () => {
    it('should retrieve payment status', async () => {
      const mockPayment = { status: 'completed', amount: 1000 };
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: mockPayment, error: null }),
      });
      
      vi.mocked(supabase.from).mockImplementation(mockFrom as any);

      const result = await paymentService.getPaymentStatus('order_123');

      expect(result.data).toEqual(mockPayment);
    });
  });
});
