/**
 * Rate Limiting Utility for Edge Functions
 * 
 * Implements a simple in-memory rate limiter to prevent abuse.
 * For production, consider using Redis or Supabase's rate limiting features.
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  constructor(private config: RateLimitConfig) {}

  /**
   * Check if a request should be allowed based on rate limiting
   * @param identifier Unique identifier (e.g., IP address, user ID, API key)
   * @returns true if request is allowed, false if rate limit exceeded
   */
  isAllowed(identifier: string): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];

    // Remove requests outside the time window
    const validRequests = userRequests.filter(
      (timestamp) => now - timestamp < this.config.windowMs
    );

    if (validRequests.length >= this.config.maxRequests) {
      const oldestRequest = Math.min(...validRequests);
      const resetAt = oldestRequest + this.config.windowMs;
      
      return {
        allowed: false,
        remaining: 0,
        resetAt,
      };
    }

    // Add current request
    validRequests.push(now);
    this.requests.set(identifier, validRequests);

    return {
      allowed: true,
      remaining: this.config.maxRequests - validRequests.length,
      resetAt: now + this.config.windowMs,
    };
  }

  /**
   * Reset rate limit for a specific identifier
   */
  reset(identifier: string): void {
    this.requests.delete(identifier);
  }

  /**
   * Clear all rate limit data (useful for testing)
   */
  clearAll(): void {
    this.requests.clear();
  }
}

// Predefined rate limiters for different use cases
export const authRateLimiter = new RateLimiter({
  maxRequests: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
});

export const apiRateLimiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 60 * 1000, // 1 minute
});

export const chatbotRateLimiter = new RateLimiter({
  maxRequests: 20,
  windowMs: 60 * 1000, // 1 minute
});

export const paymentRateLimiter = new RateLimiter({
  maxRequests: 10,
  windowMs: 60 * 1000, // 1 minute
});

/**
 * Helper to extract identifier from request
 * Priority: user ID > IP address > random UUID
 */
export function getIdentifier(req: Request, userId?: string): string {
  if (userId) return userId;
  
  // Try to get IP from headers
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp;
  
  // Fallback to user agent hash (not ideal but better than nothing)
  const userAgent = req.headers.get('user-agent') || 'unknown';
  return `ua-${hashString(userAgent)}`;
}

/**
 * Simple string hash function
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Create a rate limit response
 */
export function createRateLimitResponse(resetAt: number, corsHeaders: Record<string, string>) {
  const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
  
  return new Response(
    JSON.stringify({
      error: 'Rate limit exceeded',
      message: `Too many requests. Please try again in ${retryAfter} seconds.`,
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Remaining': '0',
      },
    }
  );
}
