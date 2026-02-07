#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://ayrdnsiaylomcemfdisr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5cmRuc2lheWxvbWNlbWZkaXNyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzE2MTg5NiwiZXhwIjoyMDY4NzM3ODk2fQ.QZDdX7RJQoDJFy3L1_-8xlXIBBrirtlgMwfQZPnFU3A'
)

async function testFullFlow() {
  console.log('🧪 Testing Full Application Flow Manually...\n')
  
  const testEmail = `manual.test.${Date.now()}@bpoc.io`
  const jobId = '61338d64-e428-40ab-9754-7872986390c6' // From previous test
  
  // Step 1: Create auth user
  console.log('Step 1: Creating auth user...')
  const tempPassword = `Temp${Math.random().toString(36).substring(2, 15)}!${Date.now()}`;
  
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: testEmail,
    password: tempPassword,
    email_confirm: false,
    user_metadata: {
      first_name: 'Manual',
      last_name: 'Test'
    }
  })
  
  if (authError) {
    console.log('❌ Auth error:', authError.message)
    return
  }
  console.log('✅ Auth user:', authUser.user.id)
  
  // Step 2: Create candidate
  console.log('\nStep 2: Creating candidate...')
  const { data: candidate, error: candidateError } = await supabase
    .from('candidates')
    .insert({
      id: authUser.user.id,
      email: testEmail,
      first_name: 'Manual',
      last_name: 'Test',
    })
    .select()
    .single()
  
  if (candidateError) {
    console.log('❌ Candidate error:', candidateError.message)
    return
  }
  console.log('✅ Candidate:', candidate.id)
  
  // Step 3: Create application
  console.log('\nStep 3: Creating application...')
  const { data: application, error: appError } = await supabase
    .from('job_applications')
    .insert({
      job_id: jobId,
      candidate_id: candidate.id,
      status: 'applied',
      released_to_client: false
    })
    .select()
    .single()
  
  if (appError) {
    console.log('❌ Application error:', appError.message)
    console.log('Details:', appError.details)
    console.log('Hint:', appError.hint)
    return
  }
  
  console.log('✅ Application:', application.id)
  
  console.log('\n🎉 FULL FLOW SUCCESS!')
  console.log('\n📋 Created:')
  console.log('  Auth User ID:', authUser.user.id)
  console.log('  Candidate ID:', candidate.id)
  console.log('  Application ID:', application.id)
}

testFullFlow()
