-- Create table to track user interactions for ML feedback loop
CREATE TABLE IF NOT EXISTS public.user_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL, -- 'view', 'click', 'add_to_cart', 'purchase', 'review'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB -- Store additional context
);

-- Enable RLS
ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own interactions
CREATE POLICY "Users can insert their interactions"
ON public.user_interactions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own interactions
CREATE POLICY "Users can view their interactions"
ON public.user_interactions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow admins to view all interactions for analytics
CREATE POLICY "Admins can view all interactions"
ON public.user_interactions
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON public.user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_product_id ON public.user_interactions(product_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_created_at ON public.user_interactions(created_at DESC);