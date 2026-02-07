#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://ayrdnsiaylomcemfdisr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5cmRuc2lheWxvbWNlbWZkaXNyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzE2MTg5NiwiZXhwIjoyMDY4NzM3ODk2fQ.QZDdX7RJQoDJFy3L1_-8xlXIBBrirtlgMwfQZPnFU3A'
)

async function findShoreAgents() {
  console.log('🔍 Searching for Shore Agents agency...\n')

  const { data, error } = await supabase
    .from('agencies')
    .select('*')
    .or('name.ilike.%shore%,email.ilike.%shore%')

  if (error) {
    console.error('Error:', error)
    return
  }

  if (!data || data.length === 0) {
    console.log('❌ Shore Agents not found. Searching for all agencies...\n')

    const { data: allAgencies } = await supabase
      .from('agencies')
      .select('id, name, email, api_key, api_enabled, status')
      .limit(10)

    console.log('Found agencies:')
    allAgencies?.forEach(a => {
      console.log(`\n  ${a.name}`)
      console.log(`  ID: ${a.id}`)
      console.log(`  Email: ${a.email}`)
      console.log(`  API Key: ${a.api_key || 'Not set'}`)
      console.log(`  API Enabled: ${a.api_enabled}`)
      console.log(`  Status: ${a.status}`)
    })
    return
  }

  console.log('✅ Found Shore Agents!\n')
  data.forEach(agency => {
    console.log('Agency Details:')
    console.log('  ID:', agency.id)
    console.log('  Name:', agency.name)
    console.log('  Email:', agency.email)
    console.log('  API Key:', agency.api_key || 'Not set')
    console.log('  API Enabled:', agency.api_enabled)
    console.log('  API Tier:', agency.api_tier)
    console.log('  Status:', agency.status)
    console.log('  Created:', agency.created_at)
    console.log('\n')
  })
}

findShoreAgents()
