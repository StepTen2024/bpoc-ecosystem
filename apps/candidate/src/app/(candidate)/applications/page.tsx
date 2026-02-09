'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  MapPin,
  Building2,
  Loader2,
  FileText,
  DollarSign,
  Eye,
  MessageSquare,
  ChevronRight
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Application {
  id: string
  job_id: string
  job_title: string
  company: string
  status: string
  applied_at: string
  released_to_client: boolean
  released_at?: string
  rejection_reason?: string
  work_type?: string
  work_arrangement?: string
  salary?: {
    min: number
    max: number
    currency: string
  }
  interview_scheduled_at?: string
}

const statusConfig: Record<string, { label: string; color: string; icon: any; description: string }> = {
  submitted: { 
    label: 'Submitted', 
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', 
    icon: FileText,
    description: 'Your application has been received'
  },
  screening: { 
    label: 'Screening', 
    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', 
    icon: Eye,
    description: 'Recruiter is reviewing your profile'
  },
  under_review: { 
    label: 'Under Review', 
    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', 
    icon: Clock,
    description: 'Being reviewed by the hiring team'
  },
  shortlisted: { 
    label: 'Shortlisted', 
    color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30', 
    icon: CheckCircle,
    description: "You're on the shortlist! Interview coming soon"
  },
  interview_scheduled: { 
    label: 'Interview Scheduled', 
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', 
    icon: Calendar,
    description: 'Your interview has been scheduled'
  },
  interviewed: { 
    label: 'Interviewed', 
    color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30', 
    icon: CheckCircle,
    description: 'Interview completed, awaiting decision'
  },
  offered: { 
    label: 'Offer Received', 
    color: 'bg-green-500/20 text-green-400 border-green-500/30', 
    icon: CheckCircle,
    description: 'Congratulations! Check your offers page'
  },
  hired: { 
    label: 'Hired', 
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', 
    icon: CheckCircle,
    description: 'Welcome aboard! 🎉'
  },
  rejected: { 
    label: 'Not Selected', 
    color: 'bg-red-500/20 text-red-400 border-red-500/30', 
    icon: XCircle,
    description: "This one wasn't a match, keep applying!"
  },
  withdrawn: { 
    label: 'Withdrawn', 
    color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', 
    icon: XCircle,
    description: 'You withdrew this application'
  },
}

const activeStatuses = ['submitted', 'screening', 'under_review', 'shortlisted', 'interview_scheduled', 'interviewed', 'offered']
const completedStatuses = ['hired', 'rejected', 'withdrawn']

export default function ApplicationsPage() {
  const { user, session } = useAuth()
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState<Application[]>([])
  const [activeTab, setActiveTab] = useState('active')

  useEffect(() => {
    if (session?.access_token) {
      fetchApplications()
    }
  }, [session?.access_token])

  const fetchApplications = async () => {
    if (!session?.access_token) return
    try {
      const res = await fetch('/api/candidate/applications', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })
      const data = await res.json()
      if (data.applications) {
        setApplications(data.applications)
      }
    } catch (err) {
      console.error('Error fetching applications:', err)
    } finally {
      setLoading(false)
    }
  }

  const activeApps = applications.filter(app => activeStatuses.includes(app.status))
  const completedApps = applications.filter(app => completedStatuses.includes(app.status))

  const filteredApps = activeTab === 'active' ? activeApps : 
                       activeTab === 'completed' ? completedApps : 
                       applications

  const getStatusInfo = (status: string) => {
    return statusConfig[status] || statusConfig.submitted
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">My Applications</h1>
          <p className="text-gray-400 mt-1">Track your job applications in real-time</p>
        </div>
        <Link href="/jobs">
          <Button className="bg-cyan-500 hover:bg-cyan-600">
            <Briefcase className="h-4 w-4 mr-2" />
            Find More Jobs
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-cyan-400">{applications.length}</p>
            <p className="text-gray-400 text-sm">Total</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-400">{activeApps.length}</p>
            <p className="text-gray-400 text-sm">In Progress</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-400">
              {applications.filter(a => a.status === 'offered' || a.status === 'hired').length}
            </p>
            <p className="text-gray-400 text-sm">Offers</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-400">
              {applications.filter(a => a.status === 'interview_scheduled' || a.status === 'interviewed').length}
            </p>
            <p className="text-gray-400 text-sm">Interviews</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/5 border-white/10">
          <TabsTrigger value="active" className="data-[state=active]:bg-cyan-500/20">
            Active ({activeApps.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-cyan-500/20">
            Completed ({completedApps.length})
          </TabsTrigger>
          <TabsTrigger value="all" className="data-[state=active]:bg-cyan-500/20">
            All ({applications.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filteredApps.length === 0 ? (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-12 text-center">
                <Briefcase className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Applications Yet</h3>
                <p className="text-gray-400 mb-4">
                  {activeTab === 'active' 
                    ? "You don't have any active applications. Start applying to jobs!"
                    : "No completed applications yet."
                  }
                </p>
                <Link href="/jobs">
                  <Button className="bg-cyan-500 hover:bg-cyan-600">
                    Browse Jobs
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredApps.map((app) => {
                const statusInfo = getStatusInfo(app.status)
                const StatusIcon = statusInfo.icon

                return (
                  <Link key={app.id} href={`/applications/${app.id}`}>
                    <Card className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-cyan-500/30 transition-all cursor-pointer">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="p-3 rounded-lg bg-cyan-500/20 flex-shrink-0 hidden sm:block">
                              <Building2 className="h-6 w-6 text-cyan-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                <h3 className="text-lg font-semibold text-white truncate">
                                  {app.job_title}
                                </h3>
                                <Badge variant="outline" className={statusInfo.color}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {statusInfo.label}
                                </Badge>
                              </div>
                              
                              <p className="text-gray-400 text-sm mb-2">{app.company}</p>
                              
                              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                                <span>Applied {formatDistanceToNow(new Date(app.applied_at), { addSuffix: true })}</span>
                                {app.work_arrangement && (
                                  <>
                                    <span>•</span>
                                    <span className="capitalize">{app.work_arrangement}</span>
                                  </>
                                )}
                                {app.salary && (
                                  <>
                                    <span>•</span>
                                    <span>
                                      {app.salary.currency} {app.salary.min?.toLocaleString()}-{app.salary.max?.toLocaleString()}
                                    </span>
                                  </>
                                )}
                              </div>

                              {/* Status Description */}
                              <p className="text-sm text-gray-400 mt-2 italic">
                                {statusInfo.description}
                              </p>

                              {/* Released to Client Badge */}
                              {app.released_to_client && (
                                <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs">
                                  <Eye className="h-3 w-3" />
                                  Viewed by Client
                                </div>
                              )}

                              {/* Rejection Reason */}
                              {app.status === 'rejected' && app.rejection_reason && (
                                <div className="mt-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                                  <p className="text-sm text-red-300">
                                    <MessageSquare className="h-3 w-3 inline mr-1" />
                                    {app.rejection_reason}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <ChevronRight className="h-5 w-5 text-gray-500 flex-shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Application Tips */}
      {activeApps.length > 0 && (
        <Card className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/20">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-2">💡 Application Tips</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>• Keep your profile and resume updated for faster screening</li>
              <li>• Respond promptly to interview invitations</li>
              <li>• Check your email regularly for updates from recruiters</li>
              <li>• Apply to multiple jobs to increase your chances</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
