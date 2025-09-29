const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function createSimpleAnimationsTable() {
  console.log('🏗️ Creating animations table step by step...')

  // Try creating a very basic table first
  const { data: createData, error: createError } = await supabase
    .from('animations')
    .select('id')
    .limit(1)

  if (createError) {
    console.log('Table does not exist, error:', createError.message)

    // Try to create using a simpler approach - just test if we can call database functions
    console.log('🧪 Testing database access...')
    const { data: testData, error: testError } = await supabase
      .from('customers')
      .select('count')
      .limit(1)

    if (testError) {
      console.error('❌ Cannot access database:', testError)
    } else {
      console.log('✅ Database access working')
    }
  } else {
    console.log('✅ Animations table already exists!')
  }

  // Let's also check what tables exist
  console.log('\n📋 Let me check what tables are available by checking video_generations schema...')
  const { error: schemaError } = await supabase
    .from('video_generations')
    .select('*')
    .limit(0)

  if (schemaError) {
    console.error('video_generations table issue:', schemaError.message)
  } else {
    console.log('✅ video_generations table exists')
  }
}

createSimpleAnimationsTable().catch(console.error)