const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

class VideoGenerationDebugger {
  constructor() {
    this.logs = []
    this.startTime = Date.now()
  }

  log(step, status, message, data = null) {
    const timestamp = Date.now() - this.startTime
    const logEntry = {
      timestamp: `${timestamp}ms`,
      step,
      status, // 'start', 'success', 'error', 'info'
      message,
      data,
      time: new Date().toISOString()
    }
    this.logs.push(logEntry)

    const emoji = {
      'start': '🚀',
      'success': '✅',
      'error': '❌',
      'info': 'ℹ️',
      'warning': '⚠️'
    }[status] || '📝'

    console.log(`${emoji} [${timestamp}ms] ${step}: ${message}`)
    if (data) {
      console.log('   Data:', JSON.stringify(data, null, 2))
    }
  }

  async checkUserCredits(userEmail = 'shiqier472@gmail.com') {
    this.log('USER_CHECK', 'start', 'Checking user credits and authentication')

    try {
      const { data: users, error } = await supabase
        .from('customers')
        .select('*')
        .eq('email', userEmail)

      if (error) throw error

      if (!users || users.length === 0) {
        this.log('USER_CHECK', 'error', 'User not found')
        return null
      }

      const user = users[0]
      this.log('USER_CHECK', 'success', `User found: ${user.name}`, {
        credits: user.credits,
        userId: user.user_id
      })

      return user
    } catch (error) {
      this.log('USER_CHECK', 'error', 'Failed to check user', { error: error.message })
      return null
    }
  }

  async checkDatabaseTables() {
    this.log('DB_CHECK', 'start', 'Checking database table availability')

    const tables = ['animations', 'video_generations', 'customers', 'credits_history']
    const results = {}

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1)

        if (error) {
          results[table] = { status: 'error', message: error.message }
          this.log('DB_CHECK', 'error', `Table ${table} not accessible: ${error.message}`)
        } else {
          results[table] = { status: 'success', message: 'Accessible' }
          this.log('DB_CHECK', 'success', `Table ${table} is accessible`)
        }
      } catch (error) {
        results[table] = { status: 'error', message: error.message }
        this.log('DB_CHECK', 'error', `Table ${table} failed: ${error.message}`)
      }
    }

    return results
  }

  async checkAPIEndpoints() {
    this.log('API_CHECK', 'start', 'Testing API endpoints')

    const endpoints = [
      { name: 'Text-to-Video', url: 'http://localhost:3000/api/wan25/text-to-video', method: 'POST' },
      { name: 'Image-to-Video', url: 'http://localhost:3000/api/wan25/image-to-video', method: 'POST' },
      { name: 'Animations List', url: 'http://localhost:3000/api/animations', method: 'GET' },
      { name: 'Animation History', url: 'http://localhost:3000/api/animation-history', method: 'GET' }
    ]

    const results = {}

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint.url, {
          method: endpoint.method,
          headers: {
            'Content-Type': 'application/json'
          }
        })

        const status = response.status
        const text = await response.text()

        results[endpoint.name] = {
          status,
          response: text.substring(0, 200) + (text.length > 200 ? '...' : '')
        }

        if (status === 401) {
          this.log('API_CHECK', 'info', `${endpoint.name}: Authentication required (expected)`)
        } else if (status >= 400) {
          this.log('API_CHECK', 'error', `${endpoint.name}: HTTP ${status}`, { response: text })
        } else {
          this.log('API_CHECK', 'success', `${endpoint.name}: HTTP ${status}`)
        }
      } catch (error) {
        results[endpoint.name] = { error: error.message }
        this.log('API_CHECK', 'error', `${endpoint.name}: ${error.message}`)
      }
    }

    return results
  }

  async simulateVideoGeneration() {
    this.log('SIMULATION', 'start', 'Simulating video generation flow')

    // Check if we can write to database
    const testRecord = {
      user_id: '00000000-0000-0000-0000-000000000000', // Test UUID
      prompt: 'TEST: Debug simulation',
      video_url: 'https://example.com/test.mp4',
      resolution: '720p',
      duration: 3,
      generation_type: 'text-to-video',
      status: 'completed',
      credits_used: 0,
      completed_at: new Date().toISOString()
    }

    // Try animations table first
    try {
      const { error: animError } = await supabase
        .from('animations')
        .insert(testRecord)

      if (animError) {
        this.log('SIMULATION', 'warning', 'Cannot write to animations table', { error: animError.message })
      } else {
        this.log('SIMULATION', 'success', 'Successfully wrote to animations table')
        // Clean up test record
        await supabase.from('animations').delete().eq('prompt', 'TEST: Debug simulation')
      }
    } catch (error) {
      this.log('SIMULATION', 'error', 'Animations table test failed', { error: error.message })
    }

    // Try video_generations table
    try {
      const { error: videoError } = await supabase
        .from('video_generations')
        .insert({
          ...testRecord,
          created_at: new Date().toISOString()
        })

      if (videoError) {
        this.log('SIMULATION', 'warning', 'Cannot write to video_generations table', { error: videoError.message })
      } else {
        this.log('SIMULATION', 'success', 'Successfully wrote to video_generations table')
        // Clean up test record
        await supabase.from('video_generations').delete().eq('prompt', 'TEST: Debug simulation')
      }
    } catch (error) {
      this.log('SIMULATION', 'error', 'Video_generations table test failed', { error: error.message })
    }
  }

  async checkRecentActivity(userEmail = 'shiqier472@gmail.com') {
    this.log('RECENT_CHECK', 'start', 'Checking recent video generation activity')

    try {
      // Get user ID first
      const { data: users } = await supabase
        .from('customers')
        .select('user_id')
        .eq('email', userEmail)
        .limit(1)

      if (!users || users.length === 0) {
        this.log('RECENT_CHECK', 'error', 'User not found for recent activity check')
        return
      }

      const userId = users[0].user_id

      // Check animations table
      const { data: animations } = await supabase
        .from('animations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5)

      // Check video_generations table
      const { data: videoGens } = await supabase
        .from('video_generations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5)

      // Check credits_history
      const { data: credits } = await supabase
        .from('credits_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)

      this.log('RECENT_CHECK', 'info', `Found ${animations?.length || 0} animations, ${videoGens?.length || 0} video generations, ${credits?.length || 0} credit transactions`)

      if (animations && animations.length > 0) {
        this.log('RECENT_CHECK', 'success', 'Recent animations found', animations[0])
      }

      if (videoGens && videoGens.length > 0) {
        this.log('RECENT_CHECK', 'success', 'Recent video generations found', videoGens[0])
      }

      if (credits && credits.length > 0) {
        this.log('RECENT_CHECK', 'success', 'Recent credit activity found', credits.slice(0, 3))
      }

    } catch (error) {
      this.log('RECENT_CHECK', 'error', 'Failed to check recent activity', { error: error.message })
    }
  }

  async runFullDiagnostic(userEmail = 'shiqier472@gmail.com') {
    console.log('🔧 Starting Video Generation Full Diagnostic...\n')

    // Run all checks
    const user = await this.checkUserCredits(userEmail)
    const dbResults = await this.checkDatabaseTables()
    const apiResults = await this.checkAPIEndpoints()
    await this.simulateVideoGeneration()
    await this.checkRecentActivity(userEmail)

    // Generate summary
    this.log('SUMMARY', 'info', 'Diagnostic complete')
    console.log('\n📊 DIAGNOSTIC SUMMARY:')
    console.log('=====================')

    if (user) {
      console.log(`👤 User: ${user.name} (${user.credits} credits)`)
    }

    console.log('\n📦 Database Tables:')
    Object.entries(dbResults).forEach(([table, result]) => {
      const status = result.status === 'success' ? '✅' : '❌'
      console.log(`   ${status} ${table}: ${result.message}`)
    })

    console.log('\n🌐 API Endpoints:')
    Object.entries(apiResults).forEach(([name, result]) => {
      const status = result.status < 400 || result.status === 401 ? '✅' : '❌'
      console.log(`   ${status} ${name}: HTTP ${result.status || 'Error'}`)
    })

    console.log(`\n⏱️  Total diagnostic time: ${Date.now() - this.startTime}ms`)
    console.log('\n💡 Tips:')
    console.log('   - If APIs return 401, that\'s normal (need authentication)')
    console.log('   - If databases are accessible, video saving should work')
    console.log('   - Check recent activity to see if generations are being saved')

    return {
      user,
      database: dbResults,
      apis: apiResults,
      logs: this.logs
    }
  }
}

// Run diagnostic if called directly
if (require.main === module) {
  const videoDebugger = new VideoGenerationDebugger()
  videoDebugger.runFullDiagnostic().catch(console.error)
}

module.exports = VideoGenerationDebugger