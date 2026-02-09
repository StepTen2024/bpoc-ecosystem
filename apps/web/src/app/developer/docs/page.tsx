'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Code, BookOpen, FileText, ChevronDown, ChevronRight,
  Building2, Briefcase, Calendar, Gift, Users, ArrowRight,
  Zap, Shield, Globe, FileCheck, Activity, Video, Bell,
  CheckCircle, Send, UserCheck
} from 'lucide-react';
import { Card, CardContent } from '@/components/shared/ui/card';
import { Button } from '@/components/shared/ui/button';
import { Badge } from '@/components/shared/ui/badge';
import Header from '@/components/shared/layout/Header';

export default function PublicApiDocsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'endpoints' | 'webhooks' | 'examples'>('overview');
  const baseUrl = 'https://bpoc.io/api/v1';

  return (
    <div className="min-h-screen bg-[#0B0B0D] selection:bg-blue-500/20 selection:text-blue-200">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-[0.03] bg-center" />
      </div>

      <Header />

      <div className="pt-24 pb-20 relative z-10">
        <div className="container mx-auto px-6">
          
          {/* Hero Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
              <Code className="w-4 h-4" />
              <span>Developer Documentation</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Build with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">BPOC API</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
              Integrate our powerful recruitment engine directly into your own platforms. 
              White-label the entire hiring experience for your clients.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/recruiter/signup">
                <Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-8">
                  Get API Key <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="#docs">
                <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 rounded-full px-8">
                  View Reference
                </Button>
              </Link>
            </div>
          </div>

          <div id="docs" className="max-w-5xl mx-auto">
            
            {/* Tabs */}
            <div className="flex gap-1 bg-white/5 p-1 rounded-lg w-fit mb-8 mx-auto md:mx-0 flex-wrap">
              {[
                { id: 'overview', label: 'Overview', icon: BookOpen },
                { id: 'endpoints', label: 'Endpoints', icon: Code },
                { id: 'webhooks', label: 'Webhooks', icon: Bell },
                { id: 'examples', label: 'Examples', icon: FileText },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                    activeTab === tab.id ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-6">
                      <Zap className="w-8 h-8 text-yellow-400 mb-4" />
                      <h3 className="text-lg font-bold text-white mb-2">Real-time Webhooks</h3>
                      <p className="text-gray-400 text-sm">Get instant notifications when candidates apply, interviews complete, or offers are accepted.</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-6">
                      <Shield className="w-8 h-8 text-green-400 mb-4" />
                      <h3 className="text-lg font-bold text-white mb-2">Data Isolation</h3>
                      <p className="text-gray-400 text-sm">Client-scoped data ensures strict privacy between your different agency clients.</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-6">
                      <Globe className="w-8 h-8 text-blue-400 mb-4" />
                      <h3 className="text-lg font-bold text-white mb-2">White Label</h3>
                      <p className="text-gray-400 text-sm">Your branding, your domain. Our engine runs invisibly in the background.</p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Quick Start</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-gray-400 mb-2">Base URL:</p>
                        <code className="block p-3 bg-black/40 rounded-lg text-blue-400 font-mono">{baseUrl}</code>
                      </div>

                      <div>
                        <p className="text-gray-400 mb-2">Authentication:</p>
                        <code className="block p-3 bg-black/40 rounded-lg text-gray-300 font-mono">
                          X-API-Key: bpoc_sk_live_...
                        </code>
                        <p className="text-gray-500 text-sm mt-2">Get your API key from the Recruiter Dashboard → Settings → API Keys</p>
                      </div>

                      <div>
                        <p className="text-gray-400 mb-2">Test your connection:</p>
                        <pre className="p-3 bg-black/40 rounded-lg text-gray-300 font-mono text-sm overflow-x-auto">
{`curl -X GET "${baseUrl}/jobs" \\
  -H "X-API-Key: bpoc_sk_live_..."`}
                        </pre>
                      </div>

                      <div>
                        <p className="text-gray-400 mb-2">Rate Limits:</p>
                        <ul className="text-gray-300 text-sm list-disc list-inside">
                          <li>Standard: 100 requests/minute</li>
                          <li>Enterprise: 1000 requests/minute</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Recruitment Flow</h3>
                    <div className="flex flex-wrap gap-2 items-center text-sm">
                      <Badge className="bg-blue-500/20 text-blue-400">1. Create Client</Badge>
                      <ArrowRight className="w-4 h-4 text-gray-500" />
                      <Badge className="bg-blue-500/20 text-blue-400">2. Post Job</Badge>
                      <ArrowRight className="w-4 h-4 text-gray-500" />
                      <Badge className="bg-blue-500/20 text-blue-400">3. Receive Applications</Badge>
                      <ArrowRight className="w-4 h-4 text-gray-500" />
                      <Badge className="bg-blue-500/20 text-blue-400">4. Schedule Interviews</Badge>
                      <ArrowRight className="w-4 h-4 text-gray-500" />
                      <Badge className="bg-blue-500/20 text-blue-400">5. Send Offer</Badge>
                      <ArrowRight className="w-4 h-4 text-gray-500" />
                      <Badge className="bg-emerald-500/20 text-emerald-400">6. Placement</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Endpoints Tab */}
            {activeTab === 'endpoints' && (
              <div className="space-y-4">
                <EndpointSection icon={<Building2 />} title="Clients" description="Link your portal clients to BPOC">
                  <Endpoint method="GET" path="/clients" description="List all your agency's clients" />
                  <Endpoint method="POST" path="/clients/get-or-create" description="Find existing client or create new one"
                    body={`{ "name": "StepTen Inc", "email": "contact@stepten.com" }`}
                    response={`{ "clientId": "uuid", "created": true }`}
                  />
                </EndpointSection>

                <EndpointSection icon={<Briefcase />} title="Jobs" description="Manage job listings">
                  <Endpoint method="GET" path="/jobs" description="List all jobs"
                    params={[{ name: 'clientId', type: 'string', desc: 'Filter by client' }, { name: 'status', type: 'string', desc: 'active, paused, closed' }]}
                  />
                  <Endpoint method="GET" path="/jobs/:id" description="Get job details" />
                  <Endpoint method="POST" path="/jobs/create" description="Create a new job listing"
                    body={`{ "title": "Senior Developer", "description": "...", "clientId": "uuid", "salary_min": 50000, "salary_max": 80000, "employment_type": "full_time" }`}
                  />
                  <Endpoint method="POST" path="/jobs/:id/approve" description="Approve a job for publishing" />
                  <Endpoint method="GET" path="/embed/jobs" description="Get embeddable job board HTML for client portal" />
                </EndpointSection>

                <EndpointSection icon={<FileCheck />} title="Applications" description="Full application lifecycle management">
                  <Endpoint method="GET" path="/applications" description="List all applications"
                    params={[
                      { name: 'clientId', type: 'string', desc: 'Filter by client' },
                      { name: 'jobId', type: 'string', desc: 'Filter by job' },
                      { name: 'status', type: 'string', desc: 'submitted, shortlisted, interview, offer, hired, rejected' },
                    ]}
                  />
                  <Endpoint method="POST" path="/applications" description="Submit new application"
                    body={`{ "jobId": "uuid", "candidate": { "firstName": "John", "lastName": "Doe", "email": "john@example.com", "phone": "+63..." } }`}
                  />
                  <Endpoint method="POST" path="/applications/invite" description="Invite a candidate to apply"
                    body={`{ "jobId": "uuid", "candidateEmail": "john@example.com", "message": "We think you'd be a great fit!" }`}
                  />
                  <Endpoint method="GET" path="/applications/:id" description="Get application details" />
                  <Endpoint method="GET" path="/applications/:id/card" description="Get complete application card with prescreens, timeline, interviews, offers" />
                  <Endpoint method="GET" path="/applications/:id/card/timeline" description="Get activity timeline for application" />
                  <Endpoint method="GET" path="/applications/:id/card/prescreen" description="Get prescreen video and responses" />
                  <Endpoint method="POST" path="/applications/:id/card/prescreen" description="Submit prescreen score/notes"
                    body={`{ "score": 4, "notes": "Strong communication skills", "recommend": true }`}
                  />
                  <Endpoint method="PATCH" path="/applications/:id/card/client-feedback" description="Update client notes and rating"
                    body={`{ "notes": "Client loved the candidate", "rating": 5 }`}
                  />
                  <Endpoint method="POST" path="/applications/:id/card/reject" description="Reject application"
                    body={`{ "reason": "Not enough experience", "rejected_by": "client" }`}
                  />
                  <Endpoint method="PATCH" path="/applications/:id/card/hired" description="Mark as hired"
                    body={`{ "contract_signed": true, "first_day_date": "2025-03-01", "started_status": "started" }`}
                  />
                  <Endpoint method="POST" path="/applications/:id/release" description="Release application to client portal" />
                  <Endpoint method="POST" path="/applications/:id/send-back" description="Return application from client for more screening" />
                </EndpointSection>

                <EndpointSection icon={<Users />} title="Candidates" description="Search and manage talent pool">
                  <Endpoint method="GET" path="/candidates" description="Search the talent pool"
                    params={[
                      { name: 'skills', type: 'string', desc: 'Comma-separated skills' },
                      { name: 'location', type: 'string', desc: 'City or region' },
                      { name: 'experience_min', type: 'number', desc: 'Minimum years experience' },
                    ]}
                  />
                  <Endpoint method="GET" path="/candidates/:id" description="Get candidate profile" />
                  <Endpoint method="POST" path="/candidates/:id/complete" description="Mark candidate profile as complete" />
                </EndpointSection>

                <EndpointSection icon={<Calendar />} title="Interviews" description="Schedule and manage interviews">
                  <Endpoint method="GET" path="/interviews" description="List scheduled interviews"
                    params={[{ name: 'applicationId', type: 'string', desc: 'Filter by application' }]}
                  />
                  <Endpoint method="POST" path="/interviews" description="Schedule an interview"
                    body={`{ "applicationId": "uuid", "scheduledAt": "2025-02-15T10:00:00Z", "type": "video", "interviewers": ["interviewer@company.com"] }`}
                  />
                  <Endpoint method="GET" path="/interviews/availability" description="Get interviewer availability slots" />
                </EndpointSection>

                <EndpointSection icon={<Gift />} title="Offers" description="Create and manage job offers">
                  <Endpoint method="GET" path="/offers" description="List all offers"
                    params={[{ name: 'applicationId', type: 'string', desc: 'Filter by application' }]}
                  />
                  <Endpoint method="POST" path="/offers" description="Send a job offer"
                    body={`{ "applicationId": "uuid", "salary": 75000, "currency": "PHP", "startDate": "2025-03-01", "benefits": ["HMO", "13th month"] }`}
                  />
                  <Endpoint method="GET" path="/offers/:id/counter" description="Get counter-offer details" />
                  <Endpoint method="POST" path="/offers/:id/counter/accept" description="Accept counter-offer" />
                  <Endpoint method="POST" path="/offers/:id/counter/reject" description="Reject counter-offer"
                    body={`{ "reason": "Budget constraints" }`}
                  />
                  <Endpoint method="POST" path="/offers/:id/sign" description="Record offer acceptance/signature" />
                </EndpointSection>

                <EndpointSection icon={<UserCheck />} title="Onboarding" description="Track onboarding progress">
                  <Endpoint method="GET" path="/onboarding" description="List candidates in onboarding" />
                  <Endpoint method="GET" path="/onboarding/:id" description="Get onboarding checklist status"
                    response={`{ "id": "uuid", "candidateName": "John Doe", "progress": 75, "checklist": { "personalInfo": "approved", "govId": "pending", ... } }`}
                  />
                </EndpointSection>

                <EndpointSection icon={<Video />} title="Video" description="Video interviews and recordings">
                  <Endpoint method="POST" path="/video/rooms" description="Create a video room for interview"
                    body={`{ "applicationId": "uuid", "scheduledAt": "2025-02-15T10:00:00Z" }`}
                    response={`{ "roomId": "uuid", "joinUrl": "https://...", "hostToken": "..." }`}
                  />
                  <Endpoint method="GET" path="/video/rooms/:id" description="Get room details and status" />
                  <Endpoint method="GET" path="/video/recordings" description="List all recordings" />
                  <Endpoint method="GET" path="/video/recordings/:id" description="Get recording with playback URL" />
                  <Endpoint method="GET" path="/video/transcripts/:id" description="Get AI transcript and summary" />
                  <Endpoint method="POST" path="/video/invitations/:id/accept" description="Accept video call invitation" />
                  <Endpoint method="POST" path="/video/invitations/:id/decline" description="Decline video call invitation" />
                </EndpointSection>
              </div>
            )}

            {/* Webhooks Tab */}
            {activeTab === 'webhooks' && (
              <div className="space-y-6">
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Webhook Setup</h3>
                    <p className="text-gray-400 mb-4">Configure your webhook URL in the Recruiter Dashboard → Settings → Webhooks</p>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-gray-400 mb-2">Webhook Payload Format:</p>
                        <pre className="p-3 bg-black/40 rounded-lg text-gray-300 font-mono text-sm overflow-x-auto">
{`POST https://your-server.com/webhooks/bpoc
Content-Type: application/json
X-BPOC-Signature: sha256=...

{
  "event": "application.created",
  "timestamp": "2025-02-09T10:30:00Z",
  "data": { ... }
}`}
                        </pre>
                      </div>

                      <div>
                        <p className="text-gray-400 mb-2">Verify Signature (Node.js):</p>
                        <pre className="p-3 bg-black/40 rounded-lg text-gray-300 font-mono text-sm overflow-x-auto">
{`const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const expected = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}`}
                        </pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Available Events</h3>
                    <div className="space-y-4">
                      <WebhookEvent event="application.created" description="New application submitted"
                        payload={`{ "applicationId": "uuid", "jobId": "uuid", "candidateId": "uuid", "candidateName": "John Doe", "candidateEmail": "john@example.com", "jobTitle": "Senior Developer" }`}
                      />
                      <WebhookEvent event="application.status_changed" description="Application status updated"
                        payload={`{ "applicationId": "uuid", "oldStatus": "submitted", "newStatus": "shortlisted", "changedBy": "recruiter" }`}
                      />
                      <WebhookEvent event="interview.scheduled" description="Interview scheduled"
                        payload={`{ "interviewId": "uuid", "applicationId": "uuid", "scheduledAt": "2025-02-15T10:00:00Z", "interviewType": "video", "meetingLink": "https://..." }`}
                      />
                      <WebhookEvent event="interview.completed" description="Interview finished"
                        payload={`{ "interviewId": "uuid", "applicationId": "uuid", "duration": 1800, "outcome": "positive", "rating": 4 }`}
                      />
                      <WebhookEvent event="offer.sent" description="Job offer sent to candidate"
                        payload={`{ "offerId": "uuid", "applicationId": "uuid", "salaryOffered": 75000, "currency": "PHP", "startDate": "2025-03-01" }`}
                      />
                      <WebhookEvent event="offer.accepted" description="Candidate accepted offer"
                        payload={`{ "offerId": "uuid", "applicationId": "uuid", "acceptedAt": "2025-02-10T14:00:00Z" }`}
                      />
                      <WebhookEvent event="offer.rejected" description="Candidate rejected offer"
                        payload={`{ "offerId": "uuid", "applicationId": "uuid", "rejectedAt": "2025-02-10T14:00:00Z", "reason": "Accepted another offer" }`}
                      />
                      <WebhookEvent event="placement.created" description="Candidate hired and placed"
                        payload={`{ "placementId": "uuid", "applicationId": "uuid", "candidateId": "uuid", "jobId": "uuid", "startDate": "2025-03-01", "salary": 75000 }`}
                      />
                      <WebhookEvent event="video.recording.ready" description="Video recording processed"
                        payload={`{ "recordingId": "uuid", "roomId": "uuid", "applicationId": "uuid", "playbackUrl": "https://...", "duration": 1800 }`}
                      />
                      <WebhookEvent event="video.transcript.completed" description="AI transcript ready"
                        payload={`{ "transcriptId": "uuid", "recordingId": "uuid", "applicationId": "uuid", "summary": "Candidate demonstrated strong..." }`}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Examples Tab */}
            {activeTab === 'examples' && (
              <div className="space-y-6">
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Complete Integration Flow (JavaScript)</h3>
                    <pre className="p-4 bg-black/40 rounded-lg overflow-x-auto text-sm">
                      <code className="text-gray-300">{`const API_KEY = 'bpoc_sk_live_...';
const BASE_URL = '${baseUrl}';

const api = (path, options = {}) => fetch(\`\${BASE_URL}\${path}\`, {
  ...options,
  headers: { 'X-API-Key': API_KEY, 'Content-Type': 'application/json', ...options.headers }
}).then(r => r.json());

// 1. Create/Link Client
const { clientId } = await api('/clients/get-or-create', {
  method: 'POST',
  body: JSON.stringify({ name: 'TechCorp', email: 'hr@techcorp.com' })
});

// 2. Create Job
const { job } = await api('/jobs/create', {
  method: 'POST',
  body: JSON.stringify({
    clientId,
    title: 'Senior React Developer',
    description: 'We are looking for...',
    salary_min: 60000,
    salary_max: 90000,
    employment_type: 'full_time'
  })
});

// 3. Submit Application
const { applicationId } = await api('/applications', {
  method: 'POST',
  body: JSON.stringify({
    jobId: job.id,
    candidate: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+63 912 345 6789'
    }
  })
});

// 4. Schedule Interview
await api('/interviews', {
  method: 'POST',
  body: JSON.stringify({
    applicationId,
    scheduledAt: '2025-02-20T10:00:00Z',
    type: 'video'
  })
});

// 5. Send Offer
await api('/offers', {
  method: 'POST',
  body: JSON.stringify({
    applicationId,
    salary: 75000,
    currency: 'PHP',
    startDate: '2025-03-01',
    benefits: ['HMO', '13th Month', 'Paid Leave']
  })
});

console.log('Full recruitment flow complete!');`}
                      </code>
                    </pre>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Webhook Handler (Express.js)</h3>
                    <pre className="p-4 bg-black/40 rounded-lg overflow-x-auto text-sm">
                      <code className="text-gray-300">{`const express = require('express');
const crypto = require('crypto');

const app = express();
const WEBHOOK_SECRET = process.env.BPOC_WEBHOOK_SECRET;

app.post('/webhooks/bpoc', express.json(), (req, res) => {
  // Verify signature
  const signature = req.headers['x-bpoc-signature'];
  const expected = 'sha256=' + crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex');
  
  if (signature !== expected) {
    return res.status(401).send('Invalid signature');
  }

  const { event, data } = req.body;

  switch (event) {
    case 'application.created':
      console.log('New application:', data.candidateName);
      // Update your CRM, send notification, etc.
      break;
    
    case 'offer.accepted':
      console.log('Offer accepted!', data.offerId);
      // Trigger onboarding workflow
      break;
    
    case 'placement.created':
      console.log('New placement:', data.placementId);
      // Update billing, create employee record
      break;
  }

  res.sendStatus(200);
});

app.listen(3000);`}
                      </code>
                    </pre>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Embed Job Board</h3>
                    <pre className="p-4 bg-black/40 rounded-lg overflow-x-auto text-sm">
                      <code className="text-gray-300">{`<!-- Add to your client's career page -->
<div id="bpoc-jobs"></div>

<script>
  (function() {
    const API_KEY = 'bpoc_pk_live_...'; // Public key (safe for frontend)
    const CLIENT_ID = 'your-client-uuid';
    
    fetch('https://bpoc.io/api/v1/embed/jobs?clientId=' + CLIENT_ID, {
      headers: { 'X-API-Key': API_KEY }
    })
    .then(r => r.text())
    .then(html => {
      document.getElementById('bpoc-jobs').innerHTML = html;
    });
  })();
</script>`}
                      </code>
                    </pre>
                  </CardContent>
                </Card>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

// Endpoint Section Component
function EndpointSection({ icon, title, description, children }: { icon: any, title: string, description: string, children: any }) {
  const [expanded, setExpanded] = useState(true);
  return (
    <Card className="bg-white/5 border-white/10">
      <button onClick={() => setExpanded(!expanded)} className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5">
        <div className="flex items-center gap-3">
          <div className="text-blue-400">{icon}</div>
          <div>
            <h3 className="text-white font-semibold">{title}</h3>
            <p className="text-gray-500 text-sm">{description}</p>
          </div>
        </div>
        {expanded ? <ChevronDown className="text-gray-400" /> : <ChevronRight className="text-gray-400" />}
      </button>
      {expanded && <CardContent className="pt-0 space-y-4 border-t border-white/10">{children}</CardContent>}
    </Card>
  );
}

// Endpoint Component
function Endpoint({ method, path, description, params, body, response }: any) {
  const methodColors: any = {
    GET: 'bg-emerald-500/20 text-emerald-400',
    POST: 'bg-cyan-500/20 text-cyan-400',
    PATCH: 'bg-amber-500/20 text-amber-400',
    DELETE: 'bg-red-500/20 text-red-400',
  };
  return (
    <div className="p-4 bg-black/20 rounded-lg border border-white/10">
      <div className="flex items-center gap-3 mb-2">
        <Badge className={methodColors[method]}>{method}</Badge>
        <code className="text-white font-mono text-sm">{path}</code>
      </div>
      <p className="text-gray-400 text-sm mb-3">{description}</p>
      {params && (
        <div className="mb-3 text-sm">
          <p className="text-gray-500 text-xs uppercase mb-1">Query Params</p>
          {params.map((p: any) => (
            <div key={p.name} className="text-gray-300">
              <code className="text-blue-400">{p.name}</code>
              <span className="text-gray-500 mx-1">({p.type})</span>
              <span className="text-gray-400">{p.desc}</span>
            </div>
          ))}
        </div>
      )}
      {body && (
        <div className="mb-3">
          <p className="text-gray-500 text-xs uppercase mb-1">Request Body</p>
          <pre className="p-2 bg-black/40 rounded text-xs overflow-x-auto text-cyan-300">{body}</pre>
        </div>
      )}
      {response && (
        <div>
          <p className="text-gray-500 text-xs uppercase mb-1">Response</p>
          <pre className="p-2 bg-black/40 rounded text-xs overflow-x-auto text-gray-300">{response}</pre>
        </div>
      )}
    </div>
  );
}

// Webhook Event Component
function WebhookEvent({ event, description, payload }: { event: string, description: string, payload: string }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="p-4 bg-black/20 rounded-lg border border-white/10">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between text-left">
        <div>
          <code className="text-yellow-400 font-mono">{event}</code>
          <p className="text-gray-400 text-sm mt-1">{description}</p>
        </div>
        {expanded ? <ChevronDown className="text-gray-400" /> : <ChevronRight className="text-gray-400" />}
      </button>
      {expanded && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <p className="text-gray-500 text-xs uppercase mb-1">Payload</p>
          <pre className="p-2 bg-black/40 rounded text-xs overflow-x-auto text-gray-300">{payload}</pre>
        </div>
      )}
    </div>
  );
}
