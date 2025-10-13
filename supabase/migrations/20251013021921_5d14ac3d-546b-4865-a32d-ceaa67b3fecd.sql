-- Add IoT compatibility and future-ready features to products

-- Add IoT compatibility column
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS iot_compatible BOOLEAN DEFAULT false;

-- Add smart home integration tags
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS smart_features JSONB DEFAULT '[]'::jsonb;

-- Add AR/VR metadata
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS ar_model_url TEXT;

-- Add 3D model URL for future AR/VR integration
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS model_3d_url TEXT;

-- Create index for IoT-compatible products
CREATE INDEX IF NOT EXISTS idx_products_iot_compatible 
ON public.products(iot_compatible) 
WHERE iot_compatible = true;

-- Add comments for documentation
COMMENT ON COLUMN public.products.iot_compatible IS 'Indicates if product is compatible with smart home systems';
COMMENT ON COLUMN public.products.smart_features IS 'JSON array of smart features like ["voice_control", "app_control", "automation"]';
COMMENT ON COLUMN public.products.ar_model_url IS 'URL to AR/VR 3D model file';
COMMENT ON COLUMN public.products.model_3d_url IS 'URL to high-quality 3D model for visualization';