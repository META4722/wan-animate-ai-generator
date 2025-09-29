-- Create animations table to store video generation records
CREATE TABLE IF NOT EXISTS public.animations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    video_url TEXT,
    resolution TEXT DEFAULT '720p',
    duration INTEGER DEFAULT 3,
    aspect_ratio TEXT DEFAULT '16:9',
    generation_type TEXT DEFAULT 'text-to-video',
    character_image_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    credits_used INTEGER DEFAULT 0,
    seed TEXT,
    actual_prompt TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.animations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own animations" ON public.animations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own animations" ON public.animations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own animations" ON public.animations
    FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_animations_user_id ON public.animations(user_id);
CREATE INDEX IF NOT EXISTS idx_animations_created_at ON public.animations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_animations_status ON public.animations(status);

-- Grant permissions
GRANT ALL ON public.animations TO authenticated;
GRANT ALL ON public.animations TO service_role;