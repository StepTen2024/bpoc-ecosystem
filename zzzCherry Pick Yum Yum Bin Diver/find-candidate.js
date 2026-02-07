#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://ayrdnsiaylomcemfdisr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5cmRuc2lheWxvbWNlbWZkaXNyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzE2MTg5NiwiZXhwIjoyMDY4NzM3ODk2fQ.QZDdX7RJQoDJFy3L1_-8xlXIBBrirtlgMwfQZPnFU3A'
)

async function findCandidate() {
  const { data, error } = await supabase
    .from('candidates')
    .select('id, email, username')
    .limit(5)

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log('Found candidates:')
  data.forEach(c => console.log(`  ${c.id} - ${c.email} - ${c.username}`))
}

findCandidate()
