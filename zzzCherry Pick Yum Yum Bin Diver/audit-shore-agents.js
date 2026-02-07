#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://ayrdnsiaylomcemfdisr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5cmRuc2lheWxvbWNlbWZkaXNyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzE2MTg5NiwiZXhwIjoyMDY4NzM3ODk2fQ.QZDdX7RJQoDJFy3L1_-8xlXIBBrirtlgMwfQZPnFU3A'
)

async function auditShoreAgents() {
  const agencyId = '8dc7ed68-5e76-4d23-8863-6ba190b91039'

  console.log('🔍 AUDITING SHORE AGENTS INC\n')
  console.log('='.repeat(60) + '\n')

  // Get current state
  const { data: agency, error } = await supabase
    .from('agencies')
    .select('*')
    .eq('id', agencyId)
    .single()

  if (error) {
    console.error('❌ Error fetching agency:', error)
    return
  }

  console.log('📊 CURRENT STATE:')
  console.log('   Name:', agency.name)
  console.log('   Email:', agency.email)
  console.log('   API Key:', agency.api_key)
  console.log('   API Enabled:', agency.api_enabled)
  console.log('   API Tier:', agency.api_tier)
  console.log('   Is Active:', agency.is_active)
  console.log('')

  // Determine what needs to be fixed
  const updates = {}
  const issues = []

  if (!agency.api_enabled) {
    updates.api_enabled = true
    issues.push('❌ API not enabled')
  } else {
    console.log('✅ API is enabled')
  }

  if (agency.api_tier !== 'enterprise') {
    updates.api_tier = 'enterprise'
    issues.push('❌ Not on enterprise tier')
  } else {
    console.log('✅ Enterprise tier active')
  }

  if (!agency.is_active) {
    updates.is_active = true
    issues.push('❌ Agency not active')
  } else {
    console.log('✅ Agency is active')
  }

  if (!agency.api_key) {
    issues.push('❌ No API key set')
  } else {
    console.log('✅ API key configured')
  }

  console.log('')

  // Apply fixes if needed
  if (Object.keys(updates).length > 0) {
    console.log('🔧 APPLYING FIXES...\n')

    const { error: updateError } = await supabase
      .from('agencies')
      .update(updates)
      .eq('id', agencyId)

    if (updateError) {
      console.error('❌ Error updating:', updateError)
      return
    }

    console.log('✅ Fixes applied!')
    console.log('   Updated fields:', Object.keys(updates).join(', '))
    console.log('')
  } else {
    console.log('✅ NO FIXES NEEDED - Everything configured correctly!\n')
  }

  console.log('='.repeat(60))
  console.log('\n📋 ENTERPRISE API CREDENTIALS:\n')
  console.log('   API Key: ' + agency.api_key)
  console.log('   Agency ID: ' + agencyId)
  console.log('   Tier: Enterprise (unlimited)')
  console.log('   Rate Limiting: Disabled')
  console.log('')
  console.log('✅ ShoreAgents Inc is ready for API testing!')
  console.log('')
}

auditShoreAgents()
