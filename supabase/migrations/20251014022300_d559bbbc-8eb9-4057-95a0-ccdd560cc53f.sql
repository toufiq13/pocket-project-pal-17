-- Add style field to products table
ALTER TABLE public.products 
ADD COLUMN style TEXT;

-- Add address field to profiles table (JSONB to support multiple addresses)
ALTER TABLE public.profiles 
ADD COLUMN address JSONB DEFAULT '[]'::jsonb;

-- Create enum for chatbot message roles
CREATE TYPE public.chat_role AS ENUM ('user', 'assistant', 'system');

-- Create chatbot_logs table for AI conversation tracking
CREATE TABLE public.chatbot_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  message TEXT NOT NULL,
  role chat_role NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for faster queries
CREATE INDEX idx_chatbot_logs_user_id ON public.chatbot_logs(user_id);
CREATE INDEX idx_chatbot_logs_session_id ON public.chatbot_logs(session_id);
CREATE INDEX idx_chatbot_logs_created_at ON public.chatbot_logs(created_at DESC);

-- Enable RLS on chatbot_logs
ALTER TABLE public.chatbot_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chatbot_logs

-- Users can view their own chat logs
CREATE POLICY "Users can view their own chat logs"
ON public.chatbot_logs
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own chat logs
CREATE POLICY "Users can create their own chat logs"
ON public.chatbot_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all chat logs
CREATE POLICY "Admins can view all chat logs"
ON public.chatbot_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add comments for documentation
COMMENT ON TABLE public.chatbot_logs IS 'Stores AI chatbot conversation history';
COMMENT ON COLUMN public.products.style IS 'Product aesthetic style (Luxury, Modern, Vintage, Contemporary, etc.)';
COMMENT ON COLUMN public.profiles.address IS 'User addresses stored as JSONB array for multiple addresses';