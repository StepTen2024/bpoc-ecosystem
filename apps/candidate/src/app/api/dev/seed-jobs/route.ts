import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { v4 as uuidv4 } from 'uuid';

/**
 * POST /api/dev/seed-jobs
 * Seed 10 BPO jobs for testing - properly creates agency/client if needed
 * DEV ONLY - remove in production
 */
export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  const bpoJobs = [
    {
      title: 'Customer Service Representative - Voice',
      description: 'Handle inbound customer inquiries via phone for a major US telecommunications company.\n\nLocation: Makati City, Metro Manila',
      requirements: ['At least 6 months call center experience', 'Excellent English communication skills'],
      responsibilities: ['Handle customer calls', 'Resolve billing issues', 'Process orders'],
      benefits: ['HMO', 'Night differential', 'Performance bonus'],
      salary_min: 22000, salary_max: 28000, currency: 'PHP',
      work_arrangement: 'onsite', work_type: 'full_time', shift: 'night', experience_level: 'entry_level',
      skills: ['Customer Service', 'English Communication', 'Phone Support', 'Problem Solving', 'Zendesk']
    },
    {
      title: 'Technical Support Specialist - IT Helpdesk',
      description: 'Provide Level 1-2 technical support for software and hardware issues.\n\nLocation: BGC, Taguig',
      requirements: ['1+ year IT support experience', 'Knowledge of Windows, Office 365, networking'],
      responsibilities: ['Troubleshoot VPN and email', 'Desktop support', 'Ticket management'],
      benefits: ['HMO', 'Training allowance', 'Career growth'],
      salary_min: 30000, salary_max: 45000, currency: 'PHP',
      work_arrangement: 'hybrid', work_type: 'full_time', shift: 'night', experience_level: 'mid_level',
      skills: ['Technical Support', 'Windows', 'Office 365', 'Troubleshooting', 'Active Directory', 'VPN']
    },
    {
      title: 'Virtual Assistant - General Admin',
      description: 'Support busy entrepreneurs with calendar management, email handling, travel booking.\n\nLocation: Remote / Work From Home',
      requirements: ['Excellent written and verbal English', 'Proficient in Google Workspace'],
      responsibilities: ['Calendar management', 'Email handling', 'Travel booking', 'Data entry'],
      benefits: ['WFH setup', 'Flexible hours', 'Equipment provided'],
      salary_min: 25000, salary_max: 35000, currency: 'PHP',
      work_arrangement: 'remote', work_type: 'full_time', shift: 'day', experience_level: 'entry_level',
      skills: ['Virtual Assistance', 'Calendar Management', 'Email Management', 'Google Workspace', 'Data Entry']
    },
    {
      title: 'Medical Virtual Assistant',
      description: 'Support US healthcare providers with patient scheduling, insurance verification.\n\nLocation: Remote',
      requirements: ['1+ year healthcare/medical experience', 'Knowledge of medical terminology'],
      responsibilities: ['Patient scheduling', 'Insurance verification', 'Medical records management'],
      benefits: ['WFH', 'US hours', 'Medical training'],
      salary_min: 35000, salary_max: 50000, currency: 'PHP',
      work_arrangement: 'remote', work_type: 'full_time', shift: 'day', experience_level: 'mid_level',
      skills: ['Medical Terminology', 'HIPAA', 'Patient Scheduling', 'Insurance Verification', 'EMR Systems']
    },
    {
      title: 'Real Estate Virtual Assistant',
      description: 'Assist real estate agents with lead management, property listings, CRM updates.\n\nLocation: Remote',
      requirements: ['Experience in real estate or related field', 'Excellent communication skills'],
      responsibilities: ['Lead management', 'Property listing updates', 'CRM maintenance'],
      benefits: ['Flexible schedule', 'Commission opportunities', 'Training'],
      salary_min: 28000, salary_max: 40000, currency: 'PHP',
      work_arrangement: 'remote', work_type: 'full_time', shift: 'day', experience_level: 'entry_level',
      skills: ['Real Estate', 'CRM', 'Lead Management', 'Property Listings', 'Customer Service']
    },
    {
      title: 'Full Stack Web Developer',
      description: 'Build and maintain web applications using React, Node.js, PostgreSQL.\n\nLocation: Makati City (Hybrid)',
      requirements: ['2+ years full stack development', 'Proficient in React, Node.js, TypeScript'],
      responsibilities: ['Build web applications', 'Code reviews', 'Technical documentation'],
      benefits: ['Above market salary', 'Latest tech stack', 'Remote Fridays'],
      salary_min: 60000, salary_max: 100000, currency: 'PHP',
      work_arrangement: 'hybrid', work_type: 'full_time', shift: 'day', experience_level: 'mid_level',
      skills: ['React', 'Node.js', 'TypeScript', 'JavaScript', 'PostgreSQL', 'MongoDB', 'Git', 'REST API']
    },
    {
      title: 'Chat Support Agent - E-commerce',
      description: 'Handle customer inquiries via live chat and email for online retail clients.\n\nLocation: Cebu City',
      requirements: ['Excellent written English', 'Fast typing speed (40+ WPM)'],
      responsibilities: ['Live chat support', 'Email responses', 'Order tracking'],
      benefits: ['Free meals', 'Transportation allowance', 'HMO'],
      salary_min: 20000, salary_max: 26000, currency: 'PHP',
      work_arrangement: 'onsite', work_type: 'full_time', shift: 'night', experience_level: 'entry_level',
      skills: ['Chat Support', 'Email Support', 'E-commerce', 'Customer Service', 'Typing', 'Zendesk']
    },
    {
      title: 'Quality Assurance Analyst - Contact Center',
      description: 'Monitor and evaluate customer service calls for quality.\n\nLocation: Quezon City (Hybrid)',
      requirements: ['2+ years call center experience', 'Previous QA or team lead experience'],
      responsibilities: ['Call monitoring', 'Quality scoring', 'Agent coaching'],
      benefits: ['Day shift available', 'Leadership training', 'HMO'],
      salary_min: 35000, salary_max: 48000, currency: 'PHP',
      work_arrangement: 'hybrid', work_type: 'full_time', shift: 'day', experience_level: 'mid_level',
      skills: ['Quality Assurance', 'Call Monitoring', 'Coaching', 'Reporting', 'Excel']
    },
    {
      title: 'Social Media Manager',
      description: 'Manage social media accounts for multiple brand clients.\n\nLocation: Remote',
      requirements: ['Experience managing business social media', 'Knowledge of Meta Business Suite'],
      responsibilities: ['Content creation', 'Post scheduling', 'Community management'],
      benefits: ['Fully remote', 'Creative freedom', 'Performance bonus'],
      salary_min: 30000, salary_max: 45000, currency: 'PHP',
      work_arrangement: 'remote', work_type: 'full_time', shift: 'day', experience_level: 'mid_level',
      skills: ['Social Media Management', 'Content Creation', 'Facebook', 'Instagram', 'Canva', 'Analytics']
    },
    {
      title: 'Accounts Payable Specialist',
      description: 'Process vendor invoices, manage payment schedules, reconcile accounts.\n\nLocation: Clark, Pampanga',
      requirements: ['Accounting or Finance degree', '1+ year AP experience'],
      responsibilities: ['Invoice processing', 'Payment scheduling', 'Account reconciliation'],
      benefits: ['Day shift', 'CPA support', 'Year-end bonus'],
      salary_min: 32000, salary_max: 42000, currency: 'PHP',
      work_arrangement: 'onsite', work_type: 'full_time', shift: 'day', experience_level: 'mid_level',
      skills: ['Accounts Payable', 'QuickBooks', 'Excel', 'Invoice Processing', 'Reconciliation', 'Accounting']
    }
  ];

  const results = [];
  
  try {
    // Step 1: Get or create an agency
    let agencyId: string;
    const { data: existingAgency } = await supabaseAdmin
      .from('agencies')
      .select('id')
      .limit(1)
      .single();
      
    if (existingAgency) {
      agencyId = existingAgency.id;
      console.log('Using existing agency:', agencyId);
    } else {
      const { data: newAgency, error: agencyError } = await supabaseAdmin
        .from('agencies')
        .insert({
          name: 'Test BPO Agency',
          slug: 'test-bpo-agency',
          email: 'test@testbpo.com',
          api_tier: 'enterprise',
        })
        .select('id')
        .single();
        
      if (agencyError || !newAgency) {
        return NextResponse.json({ 
          error: 'Could not create agency',
          details: agencyError?.message 
        }, { status: 500 });
      }
      agencyId = newAgency.id;
      console.log('Created new agency:', agencyId);
    }

    // Step 2: Get or create an agency_client
    let agencyClientId: string;
    const { data: existingClient } = await supabaseAdmin
      .from('agency_clients')
      .select('id')
      .eq('agency_id', agencyId)
      .limit(1)
      .single();
      
    if (existingClient) {
      agencyClientId = existingClient.id;
      console.log('Using existing agency_client:', agencyClientId);
    } else {
      // First create a company
      const { data: company, error: companyError } = await supabaseAdmin
        .from('companies')
        .insert({
          name: 'Test Client Company',
          industry: 'BPO',
        })
        .select('id')
        .single();
        
      if (companyError || !company) {
        return NextResponse.json({ 
          error: 'Could not create company',
          details: companyError?.message 
        }, { status: 500 });
      }
      
      // Then create agency_client linking agency and company
      const { data: newClient, error: clientError } = await supabaseAdmin
        .from('agency_clients')
        .insert({
          agency_id: agencyId,
          company_id: company.id,
          status: 'active',
        })
        .select('id')
        .single();
        
      if (clientError || !newClient) {
        return NextResponse.json({ 
          error: 'Could not create agency_client',
          details: clientError?.message 
        }, { status: 500 });
      }
      agencyClientId = newClient.id;
      console.log('Created new agency_client:', agencyClientId);
    }

    // Step 3: Create jobs
    for (const job of bpoJobs) {
      // Check if job with same title already exists
      const { data: existing } = await supabaseAdmin
        .from('jobs')
        .select('id')
        .eq('title', job.title)
        .single();
      
      if (existing) {
        results.push({ title: job.title, status: 'skipped', reason: 'already exists' });
        continue;
      }

      const slug = `${job.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.random().toString(36).substring(2, 10)}`;

      const { data: newJob, error: jobError } = await supabaseAdmin
        .from('jobs')
        .insert({
          agency_client_id: agencyClientId,
          title: job.title,
          slug,
          description: job.description,
          requirements: job.requirements,
          responsibilities: job.responsibilities,
          benefits: job.benefits,
          salary_min: job.salary_min,
          salary_max: job.salary_max,
          currency: job.currency,
          work_arrangement: job.work_arrangement,
          work_type: job.work_type,
          shift: job.shift,
          experience_level: job.experience_level,
          status: 'active',
        })
        .select('id')
        .single();

      if (jobError || !newJob) {
        results.push({ title: job.title, status: 'error', error: jobError?.message });
        continue;
      }

      // Insert job skills
      if (job.skills.length > 0) {
        const skillsToInsert = job.skills.map(skill => ({
          job_id: newJob.id,
          name: skill,
          is_required: true,
        }));

        await supabaseAdmin.from('job_skills').insert(skillsToInsert);
      }

      results.push({ 
        title: job.title, 
        status: 'created', 
        id: newJob.id,
        salary: `${job.salary_min}-${job.salary_max} PHP`,
        type: job.work_arrangement,
        shift: job.shift
      });
    }

    const created = results.filter(r => r.status === 'created').length;
    const skipped = results.filter(r => r.status === 'skipped').length;
    const errors = results.filter(r => r.status === 'error').length;

    return NextResponse.json({
      success: true,
      message: `Seeded ${created} jobs, skipped ${skipped}, errors ${errors}`,
      agencyId,
      agencyClientId,
      results
    });

  } catch (error: any) {
    console.error('Seed jobs error:', error);
    return NextResponse.json({ 
      error: 'Failed to seed jobs',
      details: error?.message 
    }, { status: 500 });
  }
}

export async function GET() {
  // List existing jobs with details
  const { data: jobs, error } = await supabaseAdmin
    .from('jobs')
    .select(`
      id, 
      title, 
      salary_min, 
      salary_max, 
      work_arrangement, 
      shift, 
      status,
      agency_clients (
        id,
        companies (name)
      )
    `)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ jobs, count: jobs?.length || 0 });
}
