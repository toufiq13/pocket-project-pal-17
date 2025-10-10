-- Create room_designs table for saving user room layouts
CREATE TABLE IF NOT EXISTS public.room_designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  design_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.room_designs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own designs"
  ON public.room_designs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own designs"
  ON public.room_designs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own designs"
  ON public.room_designs
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own designs"
  ON public.room_designs
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_room_designs_updated_at
  BEFORE UPDATE ON public.room_designs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();