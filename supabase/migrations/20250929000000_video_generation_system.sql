-- Comprehensive video generation system for Wan 2.5 API integration
-- This migration adds all necessary tables for tracking video generation, file management, and user preferences

-- =====================================================
-- 1. VIDEO GENERATION TABLES
-- =====================================================

-- Main video generation jobs table
CREATE TABLE public.video_generations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    customer_id uuid REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,

    -- Generation details
    generation_type text NOT NULL CHECK (generation_type IN ('text-to-video', 'image-to-video')),
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    fal_request_id text, -- Fal.ai request ID for tracking

    -- Input parameters
    prompt text, -- For text-to-video
    aspect_ratio text NOT NULL DEFAULT '16:9' CHECK (aspect_ratio IN ('16:9', '9:16', '1:1')),
    resolution text NOT NULL DEFAULT '720p' CHECK (resolution IN ('480p', '720p', '1080p')),
    duration integer NOT NULL DEFAULT 5 CHECK (duration IN (5, 10)),
    expand_prompt boolean DEFAULT true,
    first_frame_image_url text, -- For image-to-video

    -- Audio settings
    enable_audio boolean DEFAULT true,
    audio_url text, -- Custom audio file URL

    -- Advanced settings
    motion_scale integer DEFAULT 127 CHECK (motion_scale >= 0 AND motion_scale <= 255),
    enable_camera_motion boolean DEFAULT true,

    -- Output
    output_video_url text, -- Final generated video URL
    output_thumbnail_url text, -- Video thumbnail URL
    output_metadata jsonb DEFAULT '{}'::jsonb, -- Additional metadata from Fal.ai

    -- Billing and credits
    credits_cost integer NOT NULL DEFAULT 1,
    credits_deducted boolean DEFAULT false,

    -- Processing info
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    error_message text,
    processing_logs jsonb DEFAULT '[]'::jsonb,

    -- Timestamps
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- File uploads table for managing user uploaded files
CREATE TABLE public.file_uploads (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

    -- File details
    file_name text NOT NULL,
    file_type text NOT NULL CHECK (file_type IN ('image', 'audio', 'video')),
    file_size bigint NOT NULL, -- File size in bytes
    mime_type text NOT NULL,
    file_url text NOT NULL, -- Storage URL (Supabase Storage or external)
    storage_path text, -- Internal storage path

    -- File metadata
    dimensions jsonb, -- For images/videos: {"width": 1920, "height": 1080}
    duration_seconds numeric, -- For audio/video files
    file_hash text, -- For deduplication

    -- Usage tracking
    used_in_generations uuid[], -- Array of video_generation IDs that used this file
    is_deleted boolean DEFAULT false,

    -- Timestamps
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User preferences for video generation
CREATE TABLE public.user_video_preferences (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

    -- Default settings
    default_resolution text DEFAULT '720p' CHECK (default_resolution IN ('480p', '720p', '1080p')),
    default_duration integer DEFAULT 5 CHECK (default_duration IN (5, 10)),
    default_aspect_ratio text DEFAULT '16:9' CHECK (default_aspect_ratio IN ('16:9', '9:16', '1:1')),
    default_enable_audio boolean DEFAULT true,
    default_expand_prompt boolean DEFAULT true,
    default_motion_scale integer DEFAULT 127,
    default_enable_camera_motion boolean DEFAULT true,

    -- UI preferences
    preferred_generation_mode text DEFAULT 'text-to-video' CHECK (preferred_generation_mode IN ('text-to-video', 'image-to-video')),
    show_advanced_settings boolean DEFAULT false,
    auto_save_generations boolean DEFAULT true,

    -- Notification preferences
    email_on_completion boolean DEFAULT true,
    email_on_failure boolean DEFAULT true,

    -- Timestamps
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,

    UNIQUE(user_id)
);

-- Generation templates for saving and reusing settings
CREATE TABLE public.generation_templates (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

    -- Template details
    template_name text NOT NULL,
    description text,
    is_public boolean DEFAULT false,

    -- Template settings
    generation_type text NOT NULL CHECK (generation_type IN ('text-to-video', 'image-to-video')),
    settings jsonb NOT NULL, -- Store all generation settings as JSON

    -- Usage tracking
    times_used integer DEFAULT 0,
    last_used_at timestamp with time zone,

    -- Timestamps
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================
-- 2. INDEXES FOR PERFORMANCE
-- =====================================================

-- Video generations indexes
CREATE INDEX video_generations_user_id_idx ON public.video_generations(user_id);
CREATE INDEX video_generations_customer_id_idx ON public.video_generations(customer_id);
CREATE INDEX video_generations_status_idx ON public.video_generations(status);
CREATE INDEX video_generations_type_idx ON public.video_generations(generation_type);
CREATE INDEX video_generations_created_at_idx ON public.video_generations(created_at DESC);
CREATE INDEX video_generations_fal_request_id_idx ON public.video_generations(fal_request_id) WHERE fal_request_id IS NOT NULL;
CREATE INDEX video_generations_processing_idx ON public.video_generations(status, created_at) WHERE status IN ('pending', 'processing');

-- File uploads indexes
CREATE INDEX file_uploads_user_id_idx ON public.file_uploads(user_id);
CREATE INDEX file_uploads_file_type_idx ON public.file_uploads(file_type);
CREATE INDEX file_uploads_file_hash_idx ON public.file_uploads(file_hash) WHERE file_hash IS NOT NULL;
CREATE INDEX file_uploads_created_at_idx ON public.file_uploads(created_at DESC);
CREATE INDEX file_uploads_active_idx ON public.file_uploads(user_id, created_at DESC) WHERE is_deleted = false;

-- Generation templates indexes
CREATE INDEX generation_templates_user_id_idx ON public.generation_templates(user_id);
CREATE INDEX generation_templates_public_idx ON public.generation_templates(is_public, times_used DESC) WHERE is_public = true;
CREATE INDEX generation_templates_type_idx ON public.generation_templates(generation_type);

-- =====================================================
-- 3. TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE TRIGGER handle_video_generations_updated_at
    BEFORE UPDATE ON public.video_generations
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_file_uploads_updated_at
    BEFORE UPDATE ON public.file_uploads
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_user_video_preferences_updated_at
    BEFORE UPDATE ON public.user_video_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_generation_templates_updated_at
    BEFORE UPDATE ON public.generation_templates
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 4. ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.video_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_video_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_templates ENABLE ROW LEVEL SECURITY;

-- Video generations policies
CREATE POLICY "Users can view their own video generations"
    ON public.video_generations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own video generations"
    ON public.video_generations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own video generations"
    ON public.video_generations FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all video generations"
    ON public.video_generations FOR ALL
    USING (auth.role() = 'service_role');

-- File uploads policies
CREATE POLICY "Users can view their own file uploads"
    ON public.file_uploads FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own file uploads"
    ON public.file_uploads FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own file uploads"
    ON public.file_uploads FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own file uploads"
    ON public.file_uploads FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all file uploads"
    ON public.file_uploads FOR ALL
    USING (auth.role() = 'service_role');

-- User video preferences policies
CREATE POLICY "Users can view their own video preferences"
    ON public.user_video_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own video preferences"
    ON public.user_video_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own video preferences"
    ON public.user_video_preferences FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all video preferences"
    ON public.user_video_preferences FOR ALL
    USING (auth.role() = 'service_role');

-- Generation templates policies
CREATE POLICY "Users can view their own and public templates"
    ON public.generation_templates FOR SELECT
    USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert their own templates"
    ON public.generation_templates FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates"
    ON public.generation_templates FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates"
    ON public.generation_templates FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all templates"
    ON public.generation_templates FOR ALL
    USING (auth.role() = 'service_role');

-- =====================================================
-- 5. GRANTS AND PERMISSIONS
-- =====================================================

-- Grant permissions to service role
GRANT ALL ON public.video_generations TO service_role;
GRANT ALL ON public.file_uploads TO service_role;
GRANT ALL ON public.user_video_preferences TO service_role;
GRANT ALL ON public.generation_templates TO service_role;

-- =====================================================
-- 6. UTILITY FUNCTIONS
-- =====================================================

-- Function to calculate video generation cost
CREATE OR REPLACE FUNCTION public.calculate_video_generation_cost(
    resolution text,
    duration integer,
    generation_type text DEFAULT 'text-to-video'
)
RETURNS integer AS $$
DECLARE
    base_credits integer;
    resolution_multiplier numeric;
    total_credits integer;
BEGIN
    -- Base credits based on duration
    base_credits := CASE
        WHEN duration = 5 THEN 1
        WHEN duration = 10 THEN 2
        ELSE 1
    END;

    -- Resolution multiplier
    resolution_multiplier := CASE resolution
        WHEN '480p' THEN 1.0
        WHEN '720p' THEN 1.5
        WHEN '1080p' THEN 2.0
        ELSE 1.0
    END;

    -- Calculate total credits (rounded up)
    total_credits := CEIL(base_credits * resolution_multiplier);

    RETURN total_credits;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update generation status
CREATE OR REPLACE FUNCTION public.update_video_generation_status(
    generation_id uuid,
    new_status text,
    error_msg text DEFAULT NULL,
    output_url text DEFAULT NULL,
    thumbnail_url text DEFAULT NULL,
    metadata_json jsonb DEFAULT NULL
)
RETURNS boolean AS $$
DECLARE
    generation_record public.video_generations%rowtype;
BEGIN
    -- Get the generation record
    SELECT * INTO generation_record
    FROM public.video_generations
    WHERE id = generation_id;

    IF NOT FOUND THEN
        RETURN false;
    END IF;

    -- Update the record
    UPDATE public.video_generations
    SET
        status = new_status,
        error_message = COALESCE(error_msg, error_message),
        output_video_url = COALESCE(output_url, output_video_url),
        output_thumbnail_url = COALESCE(thumbnail_url, output_thumbnail_url),
        output_metadata = COALESCE(metadata_json, output_metadata),
        started_at = CASE WHEN new_status = 'processing' AND started_at IS NULL THEN timezone('utc'::text, now()) ELSE started_at END,
        completed_at = CASE WHEN new_status IN ('completed', 'failed', 'cancelled') AND completed_at IS NULL THEN timezone('utc'::text, now()) ELSE completed_at END,
        updated_at = timezone('utc'::text, now())
    WHERE id = generation_id;

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create user video preferences on user creation
CREATE OR REPLACE FUNCTION public.create_default_video_preferences()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.user_video_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default preferences for new users
CREATE TRIGGER on_user_created_video_preferences
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.create_default_video_preferences();

-- Function to clean up old file uploads
CREATE OR REPLACE FUNCTION public.cleanup_old_file_uploads()
RETURNS void AS $$
BEGIN
    -- Mark files as deleted if they haven't been used in 30 days
    UPDATE public.file_uploads
    SET is_deleted = true
    WHERE created_at < (timezone('utc'::text, now()) - interval '30 days')
    AND array_length(used_in_generations, 1) IS NULL
    AND is_deleted = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.calculate_video_generation_cost(text, integer, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.update_video_generation_status(uuid, text, text, text, text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.cleanup_old_file_uploads() TO service_role;

-- =====================================================
-- 7. COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE public.video_generations IS 'Main table for tracking video generation jobs using Wan 2.5 API';
COMMENT ON TABLE public.file_uploads IS 'Table for managing user uploaded files (images, audio, videos)';
COMMENT ON TABLE public.user_video_preferences IS 'User-specific preferences and default settings for video generation';
COMMENT ON TABLE public.generation_templates IS 'Saved templates for reusing generation settings';

COMMENT ON COLUMN public.video_generations.fal_request_id IS 'Fal.ai request ID for tracking job status';
COMMENT ON COLUMN public.video_generations.credits_cost IS 'Number of credits required for this generation';
COMMENT ON COLUMN public.video_generations.motion_scale IS 'Motion intensity scale (0-255, default 127)';
COMMENT ON COLUMN public.file_uploads.file_hash IS 'SHA256 hash for file deduplication';
COMMENT ON COLUMN public.file_uploads.used_in_generations IS 'Array of video generation IDs that used this file';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Video generation system migration completed successfully!';
    RAISE NOTICE 'Created tables: video_generations, file_uploads, user_video_preferences, generation_templates';
    RAISE NOTICE 'Added indexes, RLS policies, triggers, and utility functions';
    RAISE NOTICE 'System is ready for Wan 2.5 API integration';
END $$;