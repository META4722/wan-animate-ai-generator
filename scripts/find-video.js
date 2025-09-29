const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function findLatestVideos() {
  console.log('🔍 Looking for recent video generations...')

  // First check video_generations table
  const { data: videoGens, error: videoError } = await supabase
    .from('video_generations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  if (videoError) {
    console.error('❌ Error fetching video_generations:', videoError)
  } else {
    console.log(`✅ Found ${videoGens?.length || 0} records in video_generations`)
    videoGens?.forEach((video, i) => {
      console.log(`${i + 1}. ID: ${video.id}`)
      console.log(`   Prompt: ${video.prompt?.substring(0, 100)}...`)
      console.log(`   Status: ${video.status}`)
      console.log(`   Video URL: ${video.video_url || 'No URL'}`)
      console.log(`   Credits: ${video.credits_used}`)
      console.log(`   Created: ${video.created_at}`)
      console.log('   ---')
    })
  }

  // Try to create animations table
  console.log('\n🏗️ Creating animations table...')
  const { error: createError } = await supabase.rpc('exec_sql', {
    sql: `
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
      ALTER TABLE public.animations ENABLE ROW LEVEL SECURITY;
      CREATE POLICY IF NOT EXISTS "Users can view own animations" ON public.animations FOR SELECT USING (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "Users can insert own animations" ON public.animations FOR INSERT WITH CHECK (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "Users can update own animations" ON public.animations FOR UPDATE USING (auth.uid() = user_id);
    `
  })

  if (createError) {
    console.log('❌ Could not create animations table via RPC:', createError)
  } else {
    console.log('✅ Animations table creation attempted')
  }

  // Check users and credits
  const { data: users, error: userError } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })

  if (!userError && users) {
    console.log(`\n👥 Found ${users.length} users:`)
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}): ${user.credits} credits`)
    })
  }
}

findLatestVideos().catch(console.error)