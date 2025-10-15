import { supabase } from "@/integrations/supabase/client";

export const categoryService = {
  // Get all categories
  getCategories: async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");
    
    return { data, error };
  },

  // Get category by ID
  getCategoryById: async (id: string) => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();
    
    return { data, error };
  },

  // Get category by slug
  getCategoryBySlug: async (slug: string) => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .single();
    
    return { data, error };
  },

  // Add category (Admin only)
  addCategory: async (category: {
    name: string;
    slug: string;
    description?: string;
    image_url?: string;
    parent_id?: string;
  }) => {
    const { data, error } = await supabase
      .from("categories")
      .insert(category)
      .select()
      .single();
    
    return { data, error };
  },

  // Update category
  updateCategory: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from("categories")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    
    return { data, error };
  },

  // Delete category
  deleteCategory: async (id: string) => {
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);
    
    return { error };
  }
};
