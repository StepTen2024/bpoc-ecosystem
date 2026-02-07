#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://ayrdnsiaylomcemfdisr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5cmRuc2lheWxvbWNlbWZkaXNyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzE2MTg5NiwiZXhwIjoyMDY4NzM3ODk2fQ.QZDdX7RJQoDJFy3L1_-8xlXIBBrirtlgMwfQZPnFU3A'
)

async function checkSchema() {
  console.log('🔍 Checking candidates table schema...\n')

  // Try to get one candidate to see what columns exist
  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .limit(1)

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  if (data && data.length > 0) {
    console.log('✅ Found candidate. Columns:')
    console.log(Object.keys(data[0]).sort())
    console.log('\n📋 Sample data:')
    console.log(data[0])
  } else {
    console.log('⚠️  No candidates found. Trying to insert minimal data...')
    
    // Try minimal insert to see what's required
    const { error: insertError } = await supabase
      .from('candidates')
      .insert({
        email: `test.schema.${Date.now()}@test.com`,
        first_name: 'Schema',
        last_name: 'Test'
      })
    
    if (insertError) {
      console.log('❌ Insert error:', insertError.message)
      console.log('Details:', insertError.details)
      console.log('Hint:', insertError.hint)
    }
  }
}

checkSchema()
