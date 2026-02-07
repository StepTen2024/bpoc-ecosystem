#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://ayrdnsiaylomcemfdisr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5cmRuc2lheWxvbWNlbWZkaXNyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzE2MTg5NiwiZXhwIjoyMDY4NzM3ODk2fQ.QZDdX7RJQoDJFy3L1_-8xlXIBBrirtlgMwfQZPnFU3A'
)

async function checkRecent() {
  console.log('🔍 Checking recent recruiter signups...\n')

  // Check agency_recruiters created in last 10 minutes
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()

  const { data: recruiters, error } = await supabase
    .from('agency_recruiters')
    .select('*, agencies(id, name)')
    .gte('joined_at', tenMinutesAgo)
    .order('joined_at', { ascending: false })

  if (error) {
    console.error('Error:', error)
    return
  }

  if (!recruiters || recruiters.length === 0) {
    console.log('❌ No recent recruiter signups found')
    return
  }

  console.log(`✅ Found ${recruiters.length} recent signup(s):\n`)

  for (const rec of recruiters) {
    console.log(`Recruiter: ${rec.first_name} ${rec.last_name}`)
    console.log(`   User ID: ${rec.user_id}`)
    console.log(`   Email: ${rec.email}`)
    console.log(`   Agency: ${rec.agencies?.name}`)
    console.log(`   Agency ID: ${rec.agency_id}`)
    console.log(`   Role: ${rec.role}`)
    console.log(`   Joined: ${rec.joined_at}`)
    console.log('')
  }
}

checkRecent()
