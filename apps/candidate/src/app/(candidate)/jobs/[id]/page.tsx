'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Briefcase,
  Clock,
  Building2,
  Loader2,
  DollarSign,
  Star,
  CheckCircle,
  AlertCircle,
  MapPin,
  Users,
  Calendar,
  Send,
  Heart,
  Share2,
  GraduationCap
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface Job {
  id: string
  title: string
  slug: string
  company: string
  company_logo?: string
  industry?: string
  description: string
  requirements: string[]
  responsibilities: string[]
  benefits: string[]
  salary_min?: number
  salary_max?: number
  currency: string
  work_arrangement: string
  work_type: string
  shift: string
  experience_level?: string
  skills: string[]
  posted_at: string
  match_score?: number
  match_reasons?: string[]
  match_concerns?: string[]
}

function getMatchColor(score: number): string {
  if (score >= 80) return 'text-green-400 bg-green-500/20 border-green-500/30'
  if (score >= 60) return 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30'
  if (score >= 40) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
  return 'text-gray-400 bg-gray-500/20 border-gray-500/30'
}

function formatWorkArrangement(value: string): string {
  const map: Record<string, string> = {
    'remote': 'Work From Home',
    'onsite': 'Office-Based',
    'hybrid': 'Hybrid (Office + WFH)',
  }
  return map[value] || value
}

function formatShift(value: string): string {
  const map: Record<string, string> = {
    'day': 'Day Shift',
    'night': 'Night Shift (US Hours)',
    'flexible': 'Flexible Hours',
    'both': 'Rotating Shifts',
  }
  return map[value] || value
}

function formatExperience(value: string): string {
  const map: Record<string, string> = {
    'entry_level': 'Entry Level (0-2 years)',
    'mid_level': 'Mid Level (2-5 years)',
    'senior_level': 'Senior Level (5+ years)',
  }
  return map[value] || value
}

function timeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return `${Math.floor(diffDays / 30)} months ago`
}

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, session } = useAuth()
  const jobId = params.id as string

  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [job, setJob] = useState<Job | null>(null)
  const [hasApplied, setHasApplied] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchJob()
    if (user) {
      checkApplication()
    }
  }, [jobId, user])

  const fetchJob = async () => {
    try {
      const res = await fetch(`/api/candidate/jobs/${jobId}`)
      if (!res.ok) throw new Error('Job not found')
      const data = await res.json()
      setJob(data.job)
    } catch (err) {
      console.error('Error fetching job:', err)
      toast.error('Failed to load job details')
    } finally {
      setLoading(false)
    }
  }

  const checkApplication = async () => {
    try {
      const res = await fetch(`/api/candidate/applications/check?jobId=${jobId}`)
      const data = await res.json()
      setHasApplied(data.hasApplied)
    } catch (err) {
      console.error('Error checking application:', err)
    }
  }

  const handleApply = async () => {
    if (!user || !session?.access_token) {
      router.push('/auth/login?redirect=/jobs/' + jobId)
      return
    }

    setApplying(true)
    try {
      const res = await fetch('/api/candidate/applications', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ jobId }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to apply')
      }

      setHasApplied(true)
      toast.success('🎉 Application submitted! You\'ll hear back soon.')
      
      // Redirect to applications page
      setTimeout(() => {
        router.push('/applications')
      }, 2000)

    } catch (err: any) {
      console.error('Error applying:', err)
      toast.error(err.message || 'Failed to submit application')
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
      </div>
    )
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Job Not Found</h2>
        <p className="text-gray-400 mb-4">This job may have been removed or is no longer available.</p>
        <Link href="/jobs">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Link href="/jobs" className="inline-flex items-center text-gray-400 hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Jobs
      </Link>

      {/* Header Card */}
      <Card className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border-cyan-500/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-4 rounded-xl bg-cyan-500/20 flex-shrink-0">
                {job.company_logo ? (
                  <img src={job.company_logo} alt="" className="h-10 w-10 object-contain" />
                ) : (
                  <Building2 className="h-10 w-10 text-cyan-400" />
                )}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">{job.title}</h1>
                <p className="text-lg text-gray-300 mt-1">{job.company}</p>
                {job.industry && (
                  <p className="text-sm text-gray-400 mt-1">{job.industry}</p>
                )}
                <p className="text-sm text-gray-500 mt-2">Posted {timeAgo(job.posted_at)}</p>
              </div>
            </div>

            {/* Match Score */}
            {job.match_score !== null && job.match_score !== undefined && (
              <div className={`px-4 py-3 rounded-xl border ${getMatchColor(job.match_score)} text-center`}>
                <div className="flex items-center gap-2 justify-center">
                  <Star className="h-5 w-5" />
                  <span className="text-2xl font-bold">{job.match_score}%</span>
                </div>
                <p className="text-sm opacity-80">Match Score</p>
              </div>
            )}
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="p-3 rounded-lg bg-white/5">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <DollarSign className="h-4 w-4" />
                Salary
              </div>
              <p className="text-white font-semibold">
                {job.salary_min && job.salary_max 
                  ? `₱${job.salary_min.toLocaleString()} - ₱${job.salary_max.toLocaleString()}`
                  : 'Competitive'
                }
              </p>
            </div>
            <div className="p-3 rounded-lg bg-white/5">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <MapPin className="h-4 w-4" />
                Setup
              </div>
              <p className="text-white font-semibold">{formatWorkArrangement(job.work_arrangement)}</p>
            </div>
            <div className="p-3 rounded-lg bg-white/5">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <Clock className="h-4 w-4" />
                Shift
              </div>
              <p className="text-white font-semibold">{formatShift(job.shift)}</p>
            </div>
            <div className="p-3 rounded-lg bg-white/5">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <GraduationCap className="h-4 w-4" />
                Level
              </div>
              <p className="text-white font-semibold">
                {job.experience_level ? formatExperience(job.experience_level) : 'All Levels'}
              </p>
            </div>
          </div>

          {/* Apply Button */}
          <div className="flex items-center gap-3 mt-6">
            {hasApplied ? (
              <div className="flex items-center gap-2 px-6 py-3 rounded-lg bg-green-500/20 text-green-400">
                <CheckCircle className="h-5 w-5" />
                <span className="font-semibold">Already Applied</span>
              </div>
            ) : (
              <Button 
                onClick={handleApply}
                disabled={applying}
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-8"
              >
                {applying ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Applying...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    Apply Now
                  </>
                )}
              </Button>
            )}
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => setSaved(!saved)}
              className={saved ? 'text-red-400 border-red-500/30' : 'border-white/20'}
            >
              <Heart className={`h-5 w-5 ${saved ? 'fill-current' : ''}`} />
            </Button>
            <Button variant="outline" size="lg" className="border-white/20">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Match Insights */}
      {job.match_score !== null && (job.match_reasons?.length || job.match_concerns?.length) && (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-cyan-400" />
              Why You're a Good Match
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {job.match_reasons && job.match_reasons.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-400 font-medium">Strengths</p>
                  {job.match_reasons.map((reason, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-green-400">
                      <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{reason}</span>
                    </div>
                  ))}
                </div>
              )}
              {job.match_concerns && job.match_concerns.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-400 font-medium">Areas to Highlight</p>
                  {job.match_concerns.map((concern, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-yellow-400">
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{concern}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Job Description */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">About This Role</h2>
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 whitespace-pre-wrap">{job.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Requirements */}
      {job.requirements && (Array.isArray(job.requirements) ? job.requirements.length > 0 : job.requirements) && (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Requirements</h2>
            {Array.isArray(job.requirements) ? (
              <ul className="space-y-2">
                {job.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-300">
                    <CheckCircle className="h-4 w-4 text-cyan-400 mt-1 flex-shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-300 whitespace-pre-wrap">{job.requirements}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Responsibilities */}
      {job.responsibilities && (Array.isArray(job.responsibilities) ? job.responsibilities.length > 0 : job.responsibilities) && (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">What You'll Do</h2>
            {Array.isArray(job.responsibilities) ? (
              <ul className="space-y-2">
                {job.responsibilities.map((resp, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-300">
                    <Briefcase className="h-4 w-4 text-purple-400 mt-1 flex-shrink-0" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-300 whitespace-pre-wrap">{job.responsibilities}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Benefits */}
      {job.benefits && job.benefits.length > 0 && (
        <Card className="bg-gradient-to-br from-green-500/10 to-cyan-500/10 border-green-500/20">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Benefits & Perks</h2>
            <div className="flex flex-wrap gap-2">
              {job.benefits.map((benefit, idx) => (
                <Badge key={idx} className="bg-green-500/20 text-green-400 border-green-500/30">
                  {benefit}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skills */}
      {job.skills && job.skills.length > 0 && (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill, idx) => (
                <Badge key={idx} variant="outline" className="border-cyan-500/30 text-cyan-400">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bottom Apply CTA */}
      <Card className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-cyan-500/30">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-semibold text-white mb-2">Ready to Apply?</h3>
          <p className="text-gray-400 mb-4">
            {hasApplied 
              ? "You've already applied! Track your application in the Applications page."
              : "Don't miss out on this opportunity. Apply now and take the next step in your career!"
            }
          </p>
          {hasApplied ? (
            <Link href="/applications">
              <Button size="lg" className="bg-white/10 hover:bg-white/20">
                View My Applications
              </Button>
            </Link>
          ) : (
            <Button 
              onClick={handleApply}
              disabled={applying}
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-12"
            >
              {applying ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Applying...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  Apply Now
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
