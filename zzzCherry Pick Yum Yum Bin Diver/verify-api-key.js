#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://ayrdnsiaylomcemfdisr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5cmRuc2lheWxvbWNlbWZkaXNyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzE2MTg5NiwiZXhwIjoyMDY4NzM3ODk2fQ.QZDdX7RJQoDJFy3L1_-8xlXIBBrirtlgMwfQZPnFU3A'
)

async function verifyApiKey() {
  const apiKey = 'bpoc_d1e04a4c83cef0444783880f050b7581debc29465ab08c30'
  const agencyId = '8dc7ed68-5e76-4d23-8863-6ba190b91039'

  console.log('🔍 Verifying API key in database...\n')

  const { data: agency, error } = await supabase
    .from('agencies')
    .select('*')
    .eq('id', agencyId)
    .single()

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  console.log('Agency:', agency.name)
  console.log('API Key in DB:', agency.api_key)
  console.log('API Enabled:', agency.api_enabled)
  console.log('API Tier:', agency.api_tier)
  console.log('Status:', agency.status)
  console.log('')

  if (agency.api_key === apiKey) {
    console.log('✅ API key matches!')
  } else {
    console.log('❌ API key does NOT match!')
    console.log('Expected:', apiKey)
    console.log('Got:', agency.api_key)
  }
}

verifyApiKey()
