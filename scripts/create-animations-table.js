const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createAnimationsTable() {
  const sql = `
-- Create animations table to store video generation records
CREATE TABLE IF NOT EXISTS public.animations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

    -- Video generation details
    video_url text,
    seed bigint,
    actual_prompt text,
    request_id text,

    -- Input parameters
    prompt text NOT NULL,
    audio_url text,
    aspect_ratio text DEFAULT '16:9',
    resolution text DEFAULT '1080p',
    duration integer DEFAULT 5,
    negative_prompt text DEFAULT 'low resolution, error, worst quality, low quality, defects',
    enable_prompt_expansion boolean DEFAULT true,

    -- Type and mode
    generation_type text NOT NULL DEFAULT 'text-to-video', -- 'text-to-video' or 'image-to-video'
    character_image_url text, -- For image-to-video

    -- Status and metadata
    status text DEFAULT 'processing', -- 'processing', 'completed', 'failed'
    credits_used integer NOT NULL,
    error_message text,

    -- Timestamps
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at timestamp with time zone,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for user_id lookups
CREATE INDEX IF NOT EXISTS animations_user_id_idx ON public.animations(user_id);

-- Create index for status queries
CREATE INDEX IF NOT EXISTS animations_status_idx ON public.animations(status);

-- Create index for timestamp ordering
CREATE INDEX IF NOT EXISTS animations_created_at_idx ON public.animations(created_at DESC);

-- Enable RLS
ALTER TABLE public.animations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own animations" ON public.animations;
DROP POLICY IF EXISTS "Users can insert their own animations" ON public.animations;
DROP POLICY IF EXISTS "Users can update their own animations" ON public.animations;
DROP POLICY IF EXISTS "Users can delete their own animations" ON public.animations;

-- Create RLS policies
CREATE POLICY "Users can view their own animations" ON public.animations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own animations" ON public.animations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own animations" ON public.animations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own animations" ON public.animations
    FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_animations_updated_at ON public.animations;
CREATE TRIGGER update_animations_updated_at BEFORE UPDATE ON public.animations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  `;

  try {
    console.log('Creating animations table...');

    const { data, error } = await supabase.rpc('exec_sql', {
      sql: sql
    });

    if (error) {
      // Try executing with direct query if rpc fails
      console.log('RPC failed, trying direct query...');
      const { error: queryError } = await supabase
        .from('_sql_exec')
        .insert({ sql });

      if (queryError) {
        console.error('Error creating animations table:', queryError);
        return;
      }
    }

    console.log('✅ Animations table created successfully!');

    // Verify the table was created
    const { data: tables } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'animations');

    if (tables && tables.length > 0) {
      console.log('✅ Table verification: animations table exists');
    } else {
      console.log('⚠️  Table verification: could not confirm table creation');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

createAnimationsTable();