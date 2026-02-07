#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://ayrdnsiaylomcemfdisr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5cmRuc2lheWxvbWNlbWZkaXNyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzE2MTg5NiwiZXhwIjoyMDY4NzM3ODk2fQ.QZDdX7RJQoDJFy3L1_-8xlXIBBrirtlgMwfQZPnFU3A'
)

const crypto = require('crypto')

async function verify() {
  const userId = 'b7dabb63-e389-44c6-9fa1-6055e5c173b9'

  console.log('✅ Verifying user setup...\n')

  const { data: recruiter } = await supabase
    .from('agency_recruiters')
    .select('*, agencies(*)')
    .eq('user_id', userId)
    .single()

  if (!recruiter) {
    console.log('❌ Recruiter not found')
    return
  }

  console.log('✅ Recruiter Account:')
  console.log(`   Name: ${recruiter.first_name} ${recruiter.last_name}`)
  console.log(`   Email: ${recruiter.email}`)
  console.log(`   Agency: ${recruiter.agencies.name}`)
  console.log(`   Agency ID: ${recruiter.agency_id}`)
  console.log('')

  // Generate API key if not exists
  if (!recruiter.agencies.api_key) {
    const apiKey = 'bpoc_live_' + crypto.randomBytes(32).toString('hex')

    await supabase
      .from('agencies')
      .update({
        api_key: apiKey,
        api_enabled: true,
        api_tier: 'enterprise',
        status: 'active'
      })
      .eq('id', recruiter.agency_id)

    console.log('🔑 Generated API Key:', apiKey)
  } else {
    console.log('🔑 Existing API Key:', recruiter.agencies.api_key)
  }

  console.log('')
  console.log('🎉 Ready for API testing!')
}

verify()
