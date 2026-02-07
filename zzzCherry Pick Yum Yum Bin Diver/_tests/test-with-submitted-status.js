#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://ayrdnsiaylomcemfdisr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5cmRuc2lheWxvbWNlbWZkaXNyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzE2MTg5NiwiZXhwIjoyMDY4NzM3ODk2fQ.QZDdX7RJQoDJFy3L1_-8xlXIBBrirtlgMwfQZPnFU3A'
)

async function test() {
  console.log('🧪 Testing with "submitted" status...\n')
  
  const { data: app, error } = await supabase
    .from('job_applications')
    .insert({
      job_id: '61338d64-e428-40ab-9754-7872986390c6',
      candidate_id: '4e117928-b748-422d-9393-ad84295fa0ff',
      status: 'submitted',
      released_to_client: false
    })
    .select()
    .single()
  
  if (error) {
    console.log('❌ Error:', error.message)
  } else {
    console.log('✅ SUCCESS! Application:', app.id)
  }
}

test()
