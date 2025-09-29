const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

class RealtimeVideoMonitor {
  constructor(userEmail = 'shiqier472@gmail.com') {
    this.userEmail = userEmail
    this.userId = null
    this.monitoring = false
    this.lastCreditCount = null
    this.lastAnimationCount = null
    this.lastVideoGenCount = null
    this.startTime = Date.now()
  }

  async initialize() {
    console.log('🔧 Initializing Real-time Video Generation Monitor...')

    // Get user ID
    const { data: users, error } = await supabase
      .from('customers')
      .select('user_id, credits, name')
      .eq('email', this.userEmail)
      .limit(1)

    if (error || !users || users.length === 0) {
      console.error('❌ Cannot find user:', this.userEmail)
      return false
    }

    this.userId = users[0].user_id
    this.lastCreditCount = users[0].credits
    console.log(`✅ Monitoring user: ${users[0].name} (${users[0].credits} credits)`)

    // Get initial counts
    await this.updateCounts()
    return true
  }

  async updateCounts() {
    try {
      // Check current credits
      const { data: userData } = await supabase
        .from('customers')
        .select('credits')
        .eq('user_id', this.userId)
        .single()

      // Count animations
      const { data: animations, count: animCount } = await supabase
        .from('animations')
        .select('id', { count: 'exact' })
        .eq('user_id', this.userId)

      // Count video generations
      const { data: videoGens, count: videoCount } = await supabase
        .from('video_generations')
        .select('id', { count: 'exact' })
        .eq('user_id', this.userId)

      // Detect changes
      const currentCredits = userData?.credits || 0
      if (this.lastCreditCount !== null && currentCredits !== this.lastCreditCount) {
        const change = currentCredits - this.lastCreditCount
        const emoji = change > 0 ? '💰' : '💸'
        console.log(`${emoji} Credits changed: ${this.lastCreditCount} → ${currentCredits} (${change >= 0 ? '+' : ''}${change})`)

        if (change < 0) {
          console.log('⚡ Video generation started! Monitoring for completion...')
          setTimeout(() => this.checkForNewVideo(), 2000) // Check for new video after 2 seconds
        }
      }

      if (this.lastAnimationCount !== null && animCount !== this.lastAnimationCount) {
        console.log(`📊 Animations count: ${this.lastAnimationCount} → ${animCount}`)
        if (animCount > this.lastAnimationCount) {
          await this.showLatestAnimation()
        }
      }

      if (this.lastVideoGenCount !== null && videoCount !== this.lastVideoGenCount) {
        console.log(`🎬 Video generations count: ${this.lastVideoGenCount} → ${videoCount}`)
        if (videoCount > this.lastVideoGenCount) {
          await this.showLatestVideoGeneration()
        }
      }

      this.lastCreditCount = currentCredits
      this.lastAnimationCount = animCount
      this.lastVideoGenCount = videoCount

    } catch (error) {
      console.error('❌ Error updating counts:', error.message)
    }
  }

  async showLatestAnimation() {
    try {
      const { data: animation } = await supabase
        .from('animations')
        .select('*')
        .eq('user_id', this.userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (animation) {
        console.log('🎉 NEW ANIMATION SAVED TO ANIMATIONS TABLE:')
        console.log(`   📝 Prompt: ${animation.prompt}`)
        console.log(`   🎥 Video URL: ${animation.video_url || 'Not available'}`)
        console.log(`   📊 Status: ${animation.status}`)
        console.log(`   💰 Credits: ${animation.credits_used}`)
        console.log(`   🕐 Created: ${new Date(animation.created_at).toLocaleString()}`)
        console.log('   ---')
      }
    } catch (error) {
      console.error('❌ Error fetching latest animation:', error.message)
    }
  }

  async showLatestVideoGeneration() {
    try {
      const { data: video } = await supabase
        .from('video_generations')
        .select('*')
        .eq('user_id', this.userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (video) {
        console.log('🎉 NEW VIDEO SAVED TO VIDEO_GENERATIONS TABLE:')
        console.log(`   📝 Prompt: ${video.prompt}`)
        console.log(`   🎥 Video URL: ${video.video_url || 'Not available'}`)
        console.log(`   📊 Status: ${video.status}`)
        console.log(`   💰 Credits: ${video.credits_used}`)
        console.log(`   🕐 Created: ${new Date(video.created_at).toLocaleString()}`)
        console.log('   ---')
      }
    } catch (error) {
      console.error('❌ Error fetching latest video generation:', error.message)
    }
  }

  async checkForNewVideo() {
    console.log('🔍 Checking for newly saved video...')
    await this.updateCounts()
  }

  async startMonitoring(intervalMs = 3000) {
    if (!this.userId) {
      console.error('❌ Not initialized. Call initialize() first.')
      return
    }

    this.monitoring = true
    console.log(`👁️  Starting real-time monitoring (checking every ${intervalMs}ms)`)
    console.log('💡 Generate a video now to see real-time updates!')
    console.log('🛑 Press Ctrl+C to stop monitoring\n')

    const interval = setInterval(async () => {
      if (!this.monitoring) {
        clearInterval(interval)
        return
      }

      await this.updateCounts()
    }, intervalMs)

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Stopping monitor...')
      this.monitoring = false
      clearInterval(interval)
      process.exit(0)
    })
  }

  async showCurrentStatus() {
    console.log('\n📊 CURRENT STATUS:')
    console.log('==================')

    try {
      const { data: userData } = await supabase
        .from('customers')
        .select('credits')
        .eq('user_id', this.userId)
        .single()

      const { count: animCount } = await supabase
        .from('animations')
        .select('id', { count: 'exact' })
        .eq('user_id', this.userId)

      const { count: videoCount } = await supabase
        .from('video_generations')
        .select('id', { count: 'exact' })
        .eq('user_id', this.userId)

      console.log(`💰 Credits: ${userData?.credits || 0}`)
      console.log(`📊 Animations in DB: ${animCount || 0}`)
      console.log(`🎬 Video generations in DB: ${videoCount || 0}`)

      // Show latest records
      const { data: latestAnim } = await supabase
        .from('animations')
        .select('created_at, prompt, status')
        .eq('user_id', this.userId)
        .order('created_at', { ascending: false })
        .limit(1)

      const { data: latestVideo } = await supabase
        .from('video_generations')
        .select('created_at, prompt, status')
        .eq('user_id', this.userId)
        .order('created_at', { ascending: false })
        .limit(1)

      if (latestAnim && latestAnim.length > 0) {
        console.log(`📝 Latest animation: ${new Date(latestAnim[0].created_at).toLocaleString()}`)
      }

      if (latestVideo && latestVideo.length > 0) {
        console.log(`🎥 Latest video gen: ${new Date(latestVideo[0].created_at).toLocaleString()}`)
      }

    } catch (error) {
      console.error('❌ Error getting status:', error.message)
    }
  }
}

// Usage functions
async function runDiagnostic() {
  const VideoGenerationDebugger = require('./debug-video-generation.js')
  const videoDebugger = new VideoGenerationDebugger()
  return await videoDebugger.runFullDiagnostic()
}

async function startRealtimeMonitor() {
  const monitor = new RealtimeVideoMonitor()
  const initialized = await monitor.initialize()

  if (initialized) {
    await monitor.showCurrentStatus()
    await monitor.startMonitoring(3000) // Check every 3 seconds
  }
}

// Command line interface
if (require.main === module) {
  const command = process.argv[2]

  if (command === 'monitor') {
    startRealtimeMonitor()
  } else if (command === 'diagnostic') {
    runDiagnostic()
  } else {
    console.log('🔧 Video Generation Debug Tools')
    console.log('==============================')
    console.log('')
    console.log('Usage:')
    console.log('  node scripts/realtime-video-monitor.js monitor     - Start real-time monitoring')
    console.log('  node scripts/realtime-video-monitor.js diagnostic  - Run full diagnostic')
    console.log('')
    console.log('Examples:')
    console.log('  # Monitor video generation in real-time:')
    console.log('  npm run monitor')
    console.log('')
    console.log('  # Run full system diagnostic:')
    console.log('  npm run diagnostic')
  }
}

module.exports = { RealtimeVideoMonitor, runDiagnostic }