import { supabase } from "@/integrations/supabase/client";

export const chatbotService = {
  // Send message to AI chatbot
  sendMessage: async (message: string, sessionId: string, conversationHistory?: any[]) => {
    const { data, error } = await supabase.functions.invoke("ai-assistant", {
      body: {
        message,
        sessionId,
        conversationHistory
      }
    });

    return { data, error };
  },

  // Get chat history
  getChatHistory: async (sessionId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error("Not authenticated") };

    const { data, error } = await supabase
      .from("chatbot_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });
    
    return { data, error };
  },

  // Save chat message
  saveChatMessage: async (sessionId: string, role: 'user' | 'assistant' | 'system', message: string, metadata?: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error("Not authenticated") };

    const { data, error } = await supabase
      .from("chatbot_logs")
      .insert({
        user_id: user.id,
        session_id: sessionId,
        role,
        message,
        metadata
      })
      .select()
      .single();
    
    return { data, error };
  },

  // Get all user sessions
  getUserSessions: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error("Not authenticated") };

    const { data, error } = await supabase
      .from("chatbot_logs")
      .select("session_id, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    
    // Group by session_id
    const sessions = data?.reduce((acc: Array<{ session_id: string; created_at: string }>, log) => {
      if (!acc.find(s => s.session_id === log.session_id)) {
        acc.push({ session_id: log.session_id, created_at: log.created_at });
      }
      return acc;
    }, [] as Array<{ session_id: string; created_at: string }>);

    return { data: sessions, error };
  }
};
