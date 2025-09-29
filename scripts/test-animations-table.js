const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testAnimationsTable() {
  console.log('🧪 Testing animations table access...')

  // Test if animations table is accessible
  const { data: animationsTest, error: animationsError } = await supabase
    .from('animations')
    .select('id')
    .limit(1)

  if (animationsError) {
    console.error('❌ Animations table error:', animationsError.message)
  } else {
    console.log('✅ Animations table is accessible!')
    console.log(`Found ${animationsTest?.length || 0} records`)
  }

  // Test if video_generations table is accessible
  const { data: videoGenTest, error: videoGenError } = await supabase
    .from('video_generations')
    .select('id')
    .limit(1)

  if (videoGenError) {
    console.error('❌ Video_generations table error:', videoGenError.message)
  } else {
    console.log('✅ Video_generations table is accessible!')
    console.log(`Found ${videoGenTest?.length || 0} records`)
  }

  console.log('\n🎯 Both tables should now work properly with the APIs!')
}

testAnimationsTable().catch(console.error)