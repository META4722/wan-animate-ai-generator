const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkLatestVideo() {
  console.log('🔍 Checking for the latest video generation...')

  try {
    // Get Sarah's user ID
    const { data: users, error: userError } = await supabase
      .from('customers')
      .select('user_id, credits')
      .eq('email', 'shiqier472@gmail.com')

    if (userError || !users || users.length === 0) {
      console.error('❌ Cannot find user')
      return
    }

    const userId = users[0].user_id
    const credits = users[0].credits
    console.log(`👤 User ID: ${userId}`)
    console.log(`💰 Current credits: ${credits}`)

    // Check animations table
    console.log('\n📊 Checking animations table...')
    const { data: animations, error: animError } = await supabase
      .from('animations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (animError) {
      console.error('❌ Error querying animations:', animError)
    } else {
      console.log(`✅ Found ${animations?.length || 0} animations`)
      if (animations && animations.length > 0) {
        const latest = animations[0]
        console.log('🎬 Latest animation:')
        console.log(`   📝 Prompt: ${latest.prompt}`)
        console.log(`   🎥 Video URL: ${latest.video_url || 'No URL'}`)
        console.log(`   📊 Status: ${latest.status}`)
        console.log(`   💰 Credits used: ${latest.credits_used}`)
        console.log(`   🕐 Created: ${latest.created_at}`)
      }
    }

    // Check video_generations table
    console.log('\n🎥 Checking video_generations table...')
    const { data: videos, error: videoError } = await supabase
      .from('video_generations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (videoError) {
      console.error('❌ Error querying video_generations:', videoError)
    } else {
      console.log(`✅ Found ${videos?.length || 0} video generations`)
      if (videos && videos.length > 0) {
        const latest = videos[0]
        console.log('🎬 Latest video generation:')
        console.log(`   📝 Prompt: ${latest.prompt}`)
        console.log(`   🎥 Video URL: ${latest.video_url || 'No URL'}`)
        console.log(`   📊 Status: ${latest.status}`)
        console.log(`   💰 Credits used: ${latest.credits_used}`)
        console.log(`   🕐 Created: ${latest.created_at}`)
      }
    }

    // Check credits history
    console.log('\n💳 Checking credits history...')
    const { data: creditsHistory, error: creditsError } = await supabase
      .from('credits_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)

    if (creditsError) {
      console.error('❌ Error querying credits history:', creditsError)
    } else {
      console.log(`✅ Found ${creditsHistory?.length || 0} credit transactions`)
      creditsHistory?.forEach((transaction, i) => {
        console.log(`   ${i + 1}. ${transaction.amount > 0 ? '+' : ''}${transaction.amount} credits - ${transaction.description} (${new Date(transaction.created_at).toLocaleString()})`)
      })
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkLatestVideo()