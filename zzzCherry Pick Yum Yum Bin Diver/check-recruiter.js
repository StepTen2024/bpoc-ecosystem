#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://ayrdnsiaylomcemfdisr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5cmRuc2lheWxvbWNlbWZkaXNyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzE2MTg5NiwiZXhwIjoyMDY4NzM3ODk2fQ.QZDdX7RJQoDJFy3L1_-8xlXIBBrirtlgMwfQZPnFU3A'
)

async function checkRecruiter() {
  const userId = 'fee0662c-3b07-4109-8a71-e110edea3b5d'

  console.log('🔍 Checking recruiter account...\n')

  // Check auth user
  const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId)

  if (authError) {
    console.error('❌ Auth user not found:', authError)
    return
  }

  console.log('✅ Auth User Found:')
  console.log('   Email:', authUser.user.email)
  console.log('   Email Confirmed:', authUser.user.email_confirmed_at ? 'Yes' : 'No')
  console.log('   Role:', authUser.user.user_metadata?.role)
  console.log('   Admin Level:', authUser.user.user_metadata?.admin_level)
  console.log('')

  // Check agency_recruiters
  const { data: recruiter, error: recError } = await supabase
    .from('agency_recruiters')
    .select('*, agencies(id, name, email)')
    .eq('user_id', userId)
    .single()

  if (recError) {
    console.error('❌ Recruiter record not found:', recError)
    return
  }

  console.log('✅ Recruiter Record Found:')
  console.log('   ID:', recruiter.id)
  console.log('   Email:', recruiter.email)
  console.log('   Name:', `${recruiter.first_name} ${recruiter.last_name}`)
  console.log('   Role:', recruiter.role)
  console.log('   Agency ID:', recruiter.agency_id)
  console.log('   Agency Name:', recruiter.agencies?.name)
  console.log('   Is Active:', recruiter.is_active)
  console.log('')

  console.log('✅ Account is properly set up!')
  console.log('')
  console.log('📋 Agency Details for API Testing:')
  console.log('   Agency ID:', recruiter.agency_id)
  console.log('   Agency Name:', recruiter.agencies?.name)
  console.log('')
}

checkRecruiter()
