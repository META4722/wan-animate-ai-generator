const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function restoreCredits() {
  console.log('💰 Restoring lost credits for Sarah Shi...')

  // Find Sarah's account
  const { data: users, error: findError } = await supabase
    .from('customers')
    .select('*')
    .eq('email', 'shiqier472@gmail.com')

  if (findError || !users || users.length === 0) {
    console.error('❌ Could not find Sarah\'s account:', findError)
    return
  }

  const user = users[0]
  console.log(`👤 Found user: ${user.name} (${user.email})`)
  console.log(`📊 Current credits: ${user.credits}`)

  // Restore 10 credits (the lost video generation)
  const newCredits = user.credits + 10
  const { data: updateData, error: updateError } = await supabase
    .from('customers')
    .update({ credits: newCredits })
    .eq('user_id', user.user_id)
    .select()

  if (updateError) {
    console.error('❌ Failed to update credits:', updateError)
    return
  }

  console.log(`✅ Credits restored! ${user.credits} → ${newCredits}`)

  // Add credit history record
  const { error: historyError } = await supabase
    .from('credits_history')
    .insert({
      user_id: user.user_id,
      amount: 10,
      type: 'refund',
      description: 'Refund for lost video generation due to database issue'
    })

  if (historyError) {
    console.warn('⚠️ Could not add credit history:', historyError)
  } else {
    console.log('📝 Credit history updated')
  }

  console.log('\n🎉 Credits successfully restored! You can now generate videos safely.')
}

restoreCredits().catch(console.error)