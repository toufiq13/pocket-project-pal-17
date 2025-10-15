import { supabase } from "@/integrations/supabase/client";

export const productService = {
  // Get all products with filters
  getProducts: async (filters?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    material?: string;
    style?: string;
    search?: string;
    sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
    limit?: number;
    offset?: number;
  }) => {
    let query = supabase.from("products").select("*, categories(name)", { count: 'exact' });

    if (filters?.category) {
      query = query.eq("category_id", filters.category);
    }
    if (filters?.minPrice) {
      query = query.gte("price", filters.minPrice);
    }
    if (filters?.maxPrice) {
      query = query.lte("price", filters.maxPrice);
    }
    if (filters?.material) {
      query = query.eq("material", filters.material);
    }
    if (filters?.style) {
      query = query.eq("style", filters.style);
    }
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    // Sorting
    switch (filters?.sortBy) {
      case 'price_asc':
        query = query.order("price", { ascending: true });
        break;
      case 'price_desc':
        query = query.order("price", { ascending: false });
        break;
      case 'newest':
        query = query.order("created_at", { ascending: false });
        break;
      default:
        query = query.order("created_at", { ascending: false });
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error, count } = await query;
    return { data, error, count };
  },

  // Get single product by ID
  getProductById: async (id: string) => {
    const { data, error } = await supabase
      .from("products")
      .select("*, categories(name)")
      .eq("id", id)
      .single();
    
    return { data, error };
  },

  // Get product by slug
  getProductBySlug: async (slug: string) => {
    const { data, error } = await supabase
      .from("products")
      .select("*, categories(name)")
      .eq("slug", slug)
      .single();
    
    return { data, error };
  },

  // Add product (Admin only)
  addProduct: async (product: {
    name: string;
    slug: string;
    description?: string;
    price: number;
    category_id?: string;
    images?: string[];
    material?: string;
    style?: string;
    color?: string;
    dimensions?: string;
    stock_quantity?: number;
    is_featured?: boolean;
    model_3d_url?: string;
    ar_model_url?: string;
  }) => {
    const { data, error } = await supabase
      .from("products")
      .insert(product)
      .select()
      .single();
    
    return { data, error };
  },

  // Update product
  updateProduct: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    
    return { data, error };
  },

  // Delete product
  deleteProduct: async (id: string) => {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);
    
    return { error };
  }
};
