#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://ayrdnsiaylomcemfdisr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5cmRuc2lheWxvbWNlbWZkaXNyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzE2MTg5NiwiZXhwIjoyMDY4NzM3ODk2fQ.QZDdX7RJQoDJFy3L1_-8xlXIBBrirtlgMwfQZPnFU3A'
)

async function createCandidate() {
  console.log('🧪 Creating candidate via auth.users + candidates...\n')
  
  const testEmail = `api.candidate.${Date.now()}@bpoc.io`
  const testPassword = 'TempPassword123!' // Temporary password
  
  console.log('Step 1: Creating auth user...')
  
  // Create auth user using admin API
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true, // Auto-confirm email
    user_metadata: {
      first_name: 'API',
      last_name: 'Candidate'
    }
  })
  
  if (authError) {
    console.log('❌ Auth error:', authError.message)
    return
  }
  
  console.log('✅ Auth user created:', authData.user.id)
  
  // Now create candidate record
  console.log('\nStep 2: Creating candidate record...')
  
  const { data: candidateData, error: candidateError } = await supabase
    .from('candidates')
    .insert({
      id: authData.user.id, // Use auth user ID
      email: testEmail,
      first_name: 'API',
      last_name: 'Candidate',
    })
    .select()
  
  if (candidateError) {
    console.log('❌ Candidate error:', candidateError.message)
    return
  }
  
  console.log('✅ Candidate created successfully!')
  console.log('\n📋 Candidate Details:')
  console.log('ID:', candidateData[0].id)
  console.log('Email:', candidateData[0].email)
  console.log('Name:', candidateData[0].full_name)
  console.log('Username:', candidateData[0].username)
  console.log('Slug:', candidateData[0].slug)
  
  console.log('\n🎉 COMPLETE FLOW WORKING!')
}

createCandidate()
