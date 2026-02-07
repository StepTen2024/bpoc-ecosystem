#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://ayrdnsiaylomcemfdisr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5cmRuc2lheWxvbWNlbWZkaXNyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzE2MTg5NiwiZXhwIjoyMDY4NzM3ODk2fQ.QZDdX7RJQoDJFy3L1_-8xlXIBBrirtlgMwfQZPnFU3A'
)

async function findAgencies() {
  console.log('🔍 Searching for ALL agencies...\n')

  const { data, error, count } = await supabase
    .from('agencies')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log(`Found ${count} agencies:\n`)

  if (!data || data.length === 0) {
    console.log('❌ No agencies found in database')
    console.log('\n💡 We need to create Shore Agents agency first')
    return
  }

  data.forEach((agency, index) => {
    console.log(`${index + 1}. ${agency.name}`)
    console.log(`   ID: ${agency.id}`)
    console.log(`   Email: ${agency.email}`)
    console.log(`   API Key: ${agency.api_key || '❌ Not set'}`)
    console.log(`   API Enabled: ${agency.api_enabled ? '✅' : '❌'}`)
    console.log(`   Status: ${agency.status}`)
    console.log('')
  })
}

findAgencies()
