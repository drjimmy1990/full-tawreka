-- Add is_delivery_available column to branches table
ALTER TABLE public.branches
ADD COLUMN IF NOT EXISTS is_delivery_available BOOLEAN DEFAULT TRUE;

-- Comment
COMMENT ON COLUMN public.branches.is_delivery_available IS 'If false, delivery service is suspended for this branch (Pickup only)';