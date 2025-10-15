import { z } from "zod";

// Authentication Validation Schemas
export const registerSchema = z.object({
  email: z.string().email("Invalid email address").max(255, "Email too long"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password too long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  fullName: z.string().trim().max(100, "Name too long").optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Profile Validation Schemas
export const updateProfileSchema = z.object({
  full_name: z.string().trim().max(100, "Name too long").optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number").optional(),
  avatar_url: z.string().url("Invalid URL").optional(),
  address: z.array(z.any()).optional(),
});

// Product Validation Schemas
export const createProductSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200, "Name too long"),
  slug: z.string().trim().min(1, "Slug is required").max(200, "Slug too long"),
  description: z.string().trim().max(5000, "Description too long").optional(),
  price: z.number().positive("Price must be positive").max(1000000, "Price too high"),
  category_id: z.string().uuid("Invalid category ID").optional(),
  images: z.array(z.string().url("Invalid image URL")).optional(),
  material: z.string().trim().max(100, "Material name too long").optional(),
  style: z.string().trim().max(100, "Style name too long").optional(),
  color: z.string().trim().max(50, "Color name too long").optional(),
  dimensions: z.string().trim().max(200, "Dimensions too long").optional(),
  stock_quantity: z.number().int().min(0, "Stock cannot be negative").optional(),
  is_featured: z.boolean().optional(),
  model_3d_url: z.string().url("Invalid model URL").optional(),
  ar_model_url: z.string().url("Invalid AR model URL").optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const productFiltersSchema = z.object({
  category: z.string().uuid().optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  material: z.string().max(100).optional(),
  style: z.string().max(100).optional(),
  search: z.string().max(200).optional(),
  sortBy: z.enum(['price_asc', 'price_desc', 'newest', 'popular']).optional(),
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().min(0).optional(),
});

// Category Validation Schemas
export const createCategorySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name too long"),
  slug: z.string().trim().min(1, "Slug is required").max(100, "Slug too long"),
  description: z.string().trim().max(1000, "Description too long").optional(),
  image_url: z.string().url("Invalid image URL").optional(),
  parent_id: z.string().uuid("Invalid parent ID").optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

// Cart Validation Schemas
export const addToCartSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  quantity: z.number().int().positive("Quantity must be positive").max(100, "Quantity too high"),
});

export const updateCartItemSchema = z.object({
  cartItemId: z.string().uuid("Invalid cart item ID"),
  quantity: z.number().int().positive("Quantity must be positive").max(100, "Quantity too high"),
});

// Order Validation Schemas
export const createOrderSchema = z.object({
  total_amount: z.number().positive("Total amount must be positive"),
  shipping_address: z.string().trim().min(10, "Shipping address too short").max(500, "Shipping address too long"),
  billing_address: z.string().trim().min(10, "Billing address too short").max(500, "Billing address too long"),
  items: z.array(
    z.object({
      product_id: z.string().uuid("Invalid product ID"),
      quantity: z.number().int().positive("Quantity must be positive"),
      price: z.number().positive("Price must be positive"),
    })
  ).min(1, "Order must contain at least one item"),
});

export const orderStatusSchema = z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']);

// Review Validation Schemas
export const createReviewSchema = z.object({
  product_id: z.string().uuid("Invalid product ID"),
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  comment: z.string().trim().max(1000, "Comment too long").optional(),
});

// Chatbot Validation Schemas
export const chatMessageSchema = z.object({
  message: z.string().trim().min(1, "Message cannot be empty").max(5000, "Message too long"),
  sessionId: z.string().uuid("Invalid session ID"),
  conversationHistory: z.array(z.any()).optional(),
});

// Payment Validation Schemas
export const createPaymentSchema = z.object({
  orderId: z.string().uuid("Invalid order ID"),
  amount: z.number().positive("Amount must be positive"),
  paymentMethod: z.string().trim().min(1, "Payment method is required").max(50, "Payment method name too long"),
});

export const verifyPaymentSchema = z.object({
  transactionId: z.string().trim().min(1, "Transaction ID is required"),
  orderId: z.string().uuid("Invalid order ID"),
});

// Generic ID Validation
export const uuidSchema = z.string().uuid("Invalid ID format");

// Sanitization Helpers
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .substring(0, 10000); // Limit length
}

export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase().substring(0, 255);
}

// Rate Limiting Helper (for client-side)
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  constructor(
    private maxAttempts: number,
    private windowMs: number
  ) {}
  
  isAllowed(key: string): boolean {
    const now = Date.now();
    const userAttempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const recentAttempts = userAttempts.filter(
      timestamp => now - timestamp < this.windowMs
    );
    
    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    
    return true;
  }
  
  getRemainingAttempts(key: string): number {
    const now = Date.now();
    const userAttempts = this.attempts.get(key) || [];
    const recentAttempts = userAttempts.filter(
      timestamp => now - timestamp < this.windowMs
    );
    
    return Math.max(0, this.maxAttempts - recentAttempts.length);
  }
  
  reset(key: string): void {
    this.attempts.delete(key);
  }
}
