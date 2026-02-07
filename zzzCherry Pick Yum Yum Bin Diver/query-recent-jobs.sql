-- Query to get the 6 most recent jobs with company and recruiter info
SELECT 
  j.id as job_id,
  j.title as job_title,
  j.status as job_status,
  j.created_at as posted_date,
  c.name as company_name,
  c.industry as company_industry,
  ac.primary_contact_name as client_contact_name,
  ac.primary_contact_email as client_contact_email,
  CASE 
    WHEN ar.id IS NOT NULL THEN 
      COALESCE(ar.first_name || ' ' || ar.last_name, 'Unknown Recruiter')
    ELSE 'API/System'
  END as posted_by_recruiter_name,
  ar.email as recruiter_email,
  u.email as recruiter_user_email
FROM jobs j
LEFT JOIN agency_clients ac ON j.agency_client_id = ac.id
LEFT JOIN companies c ON ac.company_id = c.id
LEFT JOIN agency_recruiters ar ON j.posted_by = ar.id
LEFT JOIN auth.users u ON ar.user_id = u.id
ORDER BY j.created_at DESC
LIMIT 6;






