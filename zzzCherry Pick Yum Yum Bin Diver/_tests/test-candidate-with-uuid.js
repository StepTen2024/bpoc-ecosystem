#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js')
const crypto = require('crypto')

const supabase = createClient(
  'https://ayrdnsiaylomcemfdisr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5cmRuc2lheWxvbWNlbWZkaXNyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzE2MTg5NiwiZXhwIjoyMDY4NzM3ODk2fQ.QZDdX7RJQoDJFy3L1_-8xlXIBBrirtlgMwfQZPnFU3A'
)

function generateUUID() {
  return crypto.randomUUID()
}

async function testInsert() {
  console.log('🧪 Testing candidate insert with UUID...\n')
  
  const testEmail = `api.test.${Date.now()}@bpoc.io`
  const candidateId = generateUUID()
  
  console.log('Generated UUID:', candidateId)
  
  const { data, error } = await supabase
    .from('candidates')
    .insert({
      id: candidateId,
      email: testEmail,
      first_name: 'API',
      last_name: 'Test',
    })
    .select()
  
  if (error) {
    console.log('❌ Error:', error.message)
    console.log('Details:', error.details)
  } else {
    console.log('✅ SUCCESS! Candidate created:')
    console.log('ID:', data[0].id)
    console.log('Email:', data[0].email)
    console.log('Name:', data[0].full_name)
    console.log('Username:', data[0].username)
    console.log('Slug:', data[0].slug)
  }
}

testInsert()
