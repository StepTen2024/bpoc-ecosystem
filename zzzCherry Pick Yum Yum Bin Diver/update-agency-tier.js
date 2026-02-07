#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://ayrdnsiaylomcemfdisr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5cmRuc2lheWxvbWNlbWZkaXNyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzE2MTg5NiwiZXhwIjoyMDY4NzM3ODk2fQ.QZDdX7RJQoDJFy3L1_-8xlXIBBrirtlgMwfQZPnFU3A'
)

async function updateAgency() {
  const agencyId = '8dc7ed68-5e76-4d23-8863-6ba190b91039'

  console.log('🔧 Updating ShoreAgents agency settings...\n')

  const { error } = await supabase
    .from('agencies')
    .update({
      api_tier: 'enterprise',
    })
    .eq('id', agencyId)

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  console.log('✅ Agency updated to enterprise tier!')
  console.log('')
  console.log('📋 Your API credentials:')
  console.log('   API Key: bpoc_d1e04a4c83cef0444783880f050b7581debc29465ab08c30')
  console.log('   Agency ID: 8dc7ed68-5e76-4d23-8863-6ba190b91039')
  console.log('   Tier: Enterprise (unlimited API calls)')
}

updateAgency()
