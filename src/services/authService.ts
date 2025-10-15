import { supabase } from "@/integrations/supabase/client";

export const authService = {
  // Register new user
  register: async (email: string, password: string, fullName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/`
      }
    });
    return { data, error };
  },

  // Login user
  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  // Logout user
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current user profile
  getProfile: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error("Not authenticated") };

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    
    return { data, error };
  },

  // Update profile
  updateProfile: async (updates: {
    full_name?: string;
    phone?: string;
    avatar_url?: string;
    address?: any[];
  }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error("Not authenticated") };

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();
    
    return { data, error };
  },

  // Get current session
  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    return { data, error };
  }
};
