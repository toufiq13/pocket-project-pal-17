import { describe, it, expect, vi, beforeEach } from 'vitest';
import { recommendationService } from '../recommendationService';
import { supabase } from '@/integrations/supabase/client';

describe('RecommendationService - ML Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getRecommendations', () => {
    it('should get ML-based recommendations for user', async () => {
      const mockRecommendations = [
        { id: '1', name: 'Product 1', score: 0.95 },
        { id: '2', name: 'Product 2', score: 0.87 },
      ];

      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: mockRecommendations,
        error: null,
      } as any);

      const result = await recommendationService.getRecommendations('user_123');

      expect(result.data).toEqual(mockRecommendations);
      expect(supabase.functions.invoke).toHaveBeenCalledWith('get-recommendations', {
        body: {
          userId: 'user_123',
          productId: undefined,
          limit: 6,
        },
      });
    });

    it('should get similar products for a product', async () => {
      const mockRecommendations = [
        { id: '2', name: 'Similar Product', score: 0.92 },
      ];

      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: mockRecommendations,
        error: null,
      } as any);

      const result = await recommendationService.getRecommendations(
        undefined,
        'product_123',
        4
      );

      expect(result.data).toEqual(mockRecommendations);
      expect(supabase.functions.invoke).toHaveBeenCalledWith('get-recommendations', {
        body: {
          userId: undefined,
          productId: 'product_123',
          limit: 4,
        },
      });
    });

    it('should handle recommendation service errors', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: null,
        error: { message: 'ML service unavailable' },
      } as any);

      const result = await recommendationService.getRecommendations('user_123');

      expect(result.error).toBeTruthy();
    });
  });

  describe('trackInteraction', () => {
    it('should track user interaction for ML training', async () => {
      const mockUser = { id: 'user_123' };
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      } as any);

      const mockFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: null }),
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom as any);

      const result = await recommendationService.trackInteraction(
        'product_123',
        'view',
        { page: 'detail' }
      );

      expect(result.error).toBeNull();
      expect(mockFrom).toHaveBeenCalledWith('user_interactions');
    });

    it('should require authentication to track interaction', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null,
      } as any);

      const result = await recommendationService.trackInteraction(
        'product_123',
        'view'
      );

      expect(result.error).toBeTruthy();
      expect(result.error?.message).toContain('Not authenticated');
    });
  });

  describe('getTrendingProducts', () => {
    it('should retrieve trending products from interactions', async () => {
      const mockTrending = [
        { product_id: '1', products: { name: 'Trending Product 1' } },
      ];

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: mockTrending, error: null }),
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom as any);

      const result = await recommendationService.getTrendingProducts(5);

      expect(result.data).toEqual(mockTrending);
      expect(mockFrom).toHaveBeenCalledWith('user_interactions');
    });
  });
});
