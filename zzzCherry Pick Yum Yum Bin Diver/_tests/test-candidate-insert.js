#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://ayrdnsiaylomcemfdisr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5cmRuc2lheWxvbWNlbWZkaXNyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzE2MTg5NiwiZXhwIjoyMDY4NzM3ODk2fQ.QZDdX7RJQoDJFy3L1_-8xlXIBBrirtlgMwfQZPnFU3A'
)

async function testInsert() {
  console.log('🧪 Testing candidate insert with minimal fields...\n')
  
  const testEmail = `api.test.${Date.now()}@bpoc.io`
  
  // Try with just required fields
  const { data, error } = await supabase
    .from('candidates')
    .insert({
      email: testEmail,
      first_name: 'API',
      last_name: 'Test',
    })
    .select()
  
  if (error) {
    console.log('❌ Error:', error.message)
    console.log('Code:', error.code)
    console.log('Details:', error.details)
    console.log('Hint:', error.hint)
  } else {
    console.log('✅ SUCCESS! Candidate created:')
    console.log(data)
  }
}

testInsert()
