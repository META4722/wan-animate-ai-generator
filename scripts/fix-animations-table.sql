-- Fix animations table to match API insertion fields
-- Add missing columns that the API is trying to insert

ALTER TABLE public.animations
ADD COLUMN IF NOT EXISTS request_id TEXT,
ADD COLUMN IF NOT EXISTS audio_url TEXT,
ADD COLUMN IF NOT EXISTS negative_prompt TEXT,
ADD COLUMN IF NOT EXISTS enable_prompt_expansion BOOLEAN DEFAULT true;

-- Create index for request_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_animations_request_id ON public.animations(request_id);

-- Also fix credits_history table structure (it was failing earlier)
-- Check if user_id column exists, if not rename from another column
DO $$
BEGIN
    -- Check if user_id column exists in credits_history
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'credits_history' AND column_name = 'user_id') THEN
        -- If it doesn't exist, check for other possible column names and rename
        IF EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'credits_history' AND column_name = 'customer_id') THEN
            ALTER TABLE public.credits_history RENAME COLUMN customer_id TO user_id;
        ELSIF EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name = 'credits_history' AND column_name = 'userid') THEN
            ALTER TABLE public.credits_history RENAME COLUMN userid TO user_id;
        END IF;
    END IF;
END $$;