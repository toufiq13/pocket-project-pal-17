import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../authService';
import { supabase } from '@/integrations/supabase/client';

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: mockUser, session: { access_token: 'token' } },
        error: null,
      } as any);

      const result = await authService.login('test@example.com', 'password123');

      expect(result.data?.user).toEqual(mockUser);
      expect(result.error).toBeNull();
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should return error for invalid credentials', async () => {
      const mockError = { message: 'Invalid credentials' };
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      } as any);

      const result = await authService.login('test@example.com', 'wrongpassword');

      expect(result.error).toEqual(mockError);
      expect(result.data?.user).toBeNull();
    });
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const mockUser = { id: '123', email: 'new@example.com' };
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null,
      } as any);

      const result = await authService.register(
        'new@example.com',
        'password123',
        'Test User'
      );

      expect(result.data?.user).toEqual(mockUser);
      expect(result.error).toBeNull();
    });

    it('should validate email format', async () => {
      const result = await authService.register(
        'invalid-email',
        'password123',
        'Test User'
      );

      expect(result.error).toBeTruthy();
    });
  });

  describe('getProfile', () => {
    it('should return current user profile', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      const mockProfile = { id: '123', full_name: 'Test User', email: 'test@example.com' };
      
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      } as any);

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom as any);

      const result = await authService.getProfile();

      expect(result.data).toEqual(mockProfile);
    });
  });
});
