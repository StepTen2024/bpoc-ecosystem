#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js')
const crypto = require('crypto')

const supabase = createClient(
  'https://ayrdnsiaylomcemfdisr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5cmRuc2lheWxvbWNlbWZkaXNyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzE2MTg5NiwiZXhwIjoyMDY4NzM3ODk2fQ.QZDdX7RJQoDJFy3L1_-8xlXIBBrirtlgMwfQZPnFU3A'
)

function generateApiKey() {
  const prefix = 'bpoc_live_';
  const randomBytes = crypto.randomBytes(32).toString('hex');
  return `${prefix}${randomBytes}`;
}

async function createShoreAgents() {
  console.log('🏢 Creating Shore Agents agency...\n')

  // 1. Check if Shore Agents already exists
  const { data: existing } = await supabase
    .from('agencies')
    .select('*')
    .or('name.ilike.%shore%,email.ilike.%shore%')
    .single()

  if (existing) {
    console.log('✅ Shore Agents already exists!')
    console.log('   ID:', existing.id)
    console.log('   Name:', existing.name)
    console.log('   Email:', existing.email)
    console.log('   API Key:', existing.api_key)
    return existing
  }

  // 2. Create Shore Agents agency
  const apiKey = generateApiKey()

  const { data: agency, error } = await supabase
    .from('agencies')
    .insert({
      name: 'Shore Agents',
      email: 'api@shoreagents.com',
      api_key: apiKey,
      api_enabled: true,
      api_tier: 'enterprise',
      status: 'active',
      description: 'Internal Shore Agents agency for API testing and production use'
    })
    .select()
    .single()

  if (error) {
    console.error('❌ Error creating agency:', error)
    return null
  }

  console.log('✅ Shore Agents created successfully!\n')
  console.log('Agency Details:')
  console.log('   ID:', agency.id)
  console.log('   Name:', agency.name)
  console.log('   Email:', agency.email)
  console.log('   API Key:', agency.api_key)
  console.log('   API Enabled:', agency.api_enabled)
  console.log('   API Tier:', agency.api_tier)
  console.log('   Status:', agency.status)
  console.log('\n')

  // 3. Create a default client for Shore Agents
  const { data: client, error: clientError } = await supabase
    .from('agency_clients')
    .insert({
      agency_id: agency.id,
      name: 'Shore Agents - Test Client',
      email: 'client@shoreagents.com',
      status: 'active'
    })
    .select()
    .single()

  if (clientError) {
    console.error('⚠️  Warning: Could not create default client:', clientError)
  } else {
    console.log('✅ Default client created:')
    console.log('   Client ID:', client.id)
    console.log('   Client Name:', client.name)
    console.log('\n')
  }

  console.log('🎉 Setup complete! You can now use this API key in the simulator.')
  console.log('\n📋 API Key to use:')
  console.log(`   ${agency.api_key}`)
  console.log('\n')

  return agency
}

createShoreAgents()
