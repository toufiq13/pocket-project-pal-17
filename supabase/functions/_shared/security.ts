/**
 * Security Utilities for Edge Functions
 * 
 * Provides input validation, sanitization, and security checks
 */

/**
 * Sanitize user input to prevent XSS and injection attacks
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 10000); // Limit length
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Check if user has required role
 */
export async function checkUserRole(
  supabaseClient: any,
  userId: string,
  requiredRole: string
): Promise<boolean> {
  try {
    const { data, error } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', requiredRole)
      .maybeSingle();

    return !error && !!data;
  } catch {
    return false;
  }
}

/**
 * Validate and sanitize product data
 */
export function validateProductData(data: any): {
  valid: boolean;
  errors: string[];
  sanitized?: any;
} {
  const errors: string[] = [];
  
  if (!data.name || typeof data.name !== 'string') {
    errors.push('Invalid product name');
  }
  if (!data.price || typeof data.price !== 'number' || data.price <= 0) {
    errors.push('Invalid product price');
  }
  if (data.category_id && !isValidUUID(data.category_id)) {
    errors.push('Invalid category ID');
  }
  if (data.images && !Array.isArray(data.images)) {
    errors.push('Invalid images format');
  }
  
  if (errors.length > 0) {
    return { valid: false, errors };
  }
  
  return {
    valid: true,
    errors: [],
    sanitized: {
      name: sanitizeInput(data.name),
      slug: sanitizeInput(data.slug),
      description: data.description ? sanitizeInput(data.description) : null,
      price: data.price,
      category_id: data.category_id,
      images: data.images,
      material: data.material ? sanitizeInput(data.material) : null,
      style: data.style ? sanitizeInput(data.style) : null,
      color: data.color ? sanitizeInput(data.color) : null,
      dimensions: data.dimensions ? sanitizeInput(data.dimensions) : null,
      stock_quantity: data.stock_quantity || 0,
      is_featured: !!data.is_featured,
    },
  };
}

/**
 * Validate payment data
 */
export function validatePaymentData(data: any): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!data.orderId || !isValidUUID(data.orderId)) {
    errors.push('Invalid order ID');
  }
  if (!data.amount || typeof data.amount !== 'number' || data.amount <= 0) {
    errors.push('Invalid payment amount');
  }
  if (!data.paymentMethod || typeof data.paymentMethod !== 'string') {
    errors.push('Invalid payment method');
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Validate order data
 */
export function validateOrderData(data: any): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    errors.push('Order must contain at least one item');
  }
  if (!data.total_amount || typeof data.total_amount !== 'number' || data.total_amount <= 0) {
    errors.push('Invalid total amount');
  }
  if (!data.shipping_address || typeof data.shipping_address !== 'string') {
    errors.push('Invalid shipping address');
  }
  if (!data.billing_address || typeof data.billing_address !== 'string') {
    errors.push('Invalid billing address');
  }
  
  // Validate each item
  if (data.items && Array.isArray(data.items)) {
    data.items.forEach((item: any, index: number) => {
      if (!item.product_id || !isValidUUID(item.product_id)) {
        errors.push(`Invalid product ID at item ${index + 1}`);
      }
      if (!item.quantity || typeof item.quantity !== 'number' || item.quantity <= 0) {
        errors.push(`Invalid quantity at item ${index + 1}`);
      }
      if (!item.price || typeof item.price !== 'number' || item.price <= 0) {
        errors.push(`Invalid price at item ${index + 1}`);
      }
    });
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Create error response with proper CORS headers
 */
export function createErrorResponse(
  message: string,
  status: number = 400,
  corsHeaders: Record<string, string> = {}
): Response {
  return new Response(
    JSON.stringify({
      error: message,
      timestamp: new Date().toISOString(),
    }),
    {
      status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * Verify JWT token manually (if needed for custom validation)
 */
export async function verifyToken(token: string, secret: string): Promise<boolean> {
  try {
    // This is a placeholder - in production, use proper JWT library
    // For Supabase, the JWT verification is handled automatically
    return token.length > 20; // Basic check
  } catch {
    return false;
  }
}
