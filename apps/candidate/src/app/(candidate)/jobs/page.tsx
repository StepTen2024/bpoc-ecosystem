'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Search,
  MapPin,
  Briefcase,
  Clock,
  Building2,
  Filter,
  Loader2,
  Heart,
  DollarSign,
  Star,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'

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
  if (score >= 80) return 'text-green-400 bg-green-500/20'
  if (score >= 60) return 'text-cyan-400 bg-cyan-500/20'
  if (score >= 40) return 'text-yellow-400 bg-yellow-500/20'
  return 'text-gray-400 bg-gray-500/20'
}

function formatWorkArrangement(value: string): string {
  const map: Record<string, string> = {
    'remote': 'Remote',
    'onsite': 'On-site',
    'hybrid': 'Hybrid',
  }
  return map[value] || value
}

function formatShift(value: string): string {
  const map: Record<string, string> = {
    'day': 'Day Shift',
    'night': 'Night Shift',
    'flexible': 'Flexible',
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

export default function JobsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [generatingMatches, setGeneratingMatches] = useState(false)
  const [jobs, setJobs] = useState<Job[]>([])
  const [hasMatches, setHasMatches] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set())

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/candidate/jobs')
      const data = await res.json()
      if (data.jobs) {
        setJobs(data.jobs)
        setHasMatches(data.has_matches)
      }
    } catch (err) {
      console.error('Error fetching jobs:', err)
    } finally {
      setLoading(false)
    }
  }

  const generateMatches = async () => {
    setGeneratingMatches(true)
    try {
      const res = await fetch('/api/candidate/matches/generate', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        // Refresh jobs to get match scores
        await fetchJobs()
      }
    } catch (err) {
      console.error('Error generating matches:', err)
    } finally {
      setGeneratingMatches(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const toggleSaveJob = (jobId: string) => {
    setSavedJobs(prev => {
      const newSet = new Set(prev)
      if (newSet.has(jobId)) {
        newSet.delete(jobId)
      } else {
        newSet.add(jobId)
      }
      return newSet
    })
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
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Find Jobs</h1>
          <p className="text-gray-400 mt-2">
            {hasMatches 
              ? 'Jobs sorted by match score based on your profile'
              : 'Discover BPO opportunities matching your skills'
            }
          </p>
        </div>
        
        {user && !hasMatches && (
          <Button 
            onClick={generateMatches}
            disabled={generatingMatches}
            className="bg-cyan-500 hover:bg-cyan-600"
          >
            {generatingMatches ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate Matches
              </>
            )}
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white"
            placeholder="Search jobs, companies, or skills..."
          />
        </div>
        <Button variant="outline" className="border-white/10">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Results Count */}
      <p className="text-gray-400 text-sm">
        {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found
      </p>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.map((job) => (
          <Card
            key={job.id}
            className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-cyan-500/30 transition-all"
          >
            <CardContent className="py-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    {/* Company Logo or Icon */}
                    <div className="p-3 rounded-lg bg-cyan-500/20 flex-shrink-0">
                      {job.company_logo ? (
                        <img src={job.company_logo} alt="" className="h-6 w-6 object-contain" />
                      ) : (
                        <Building2 className="h-6 w-6 text-cyan-400" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Link 
                          href={`/jobs/${job.id}`}
                          className="text-lg font-semibold text-white hover:text-cyan-400 transition-colors"
                        >
                          {job.title}
                        </Link>
                        
                        {/* Match Score Badge */}
                        {job.match_score !== null && job.match_score !== undefined && (
                          <Badge className={`${getMatchColor(job.match_score)} border-0`}>
                            <Star className="h-3 w-3 mr-1" />
                            {job.match_score}% Match
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-400">{job.company}</p>
                      
                      {/* Job Details */}
                      <div className="flex flex-wrap gap-3 mt-3">
                        <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                          <Briefcase className="h-4 w-4" />
                          {formatWorkArrangement(job.work_arrangement)}
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                          <Clock className="h-4 w-4" />
                          {formatShift(job.shift)}
                        </div>
                        {job.experience_level && (
                          <Badge variant="outline" className="text-gray-400 border-white/20">
                            {job.experience_level.replace('_', ' ')}
                          </Badge>
                        )}
                      </div>

                      {/* Salary */}
                      {(job.salary_min || job.salary_max) && (
                        <div className="flex items-center gap-1.5 text-cyan-400 text-sm mt-2">
                          <DollarSign className="h-4 w-4" />
                          ₱{job.salary_min?.toLocaleString()} - ₱{job.salary_max?.toLocaleString()}/month
                        </div>
                      )}

                      {/* Skills */}
                      {job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {job.skills.slice(0, 5).map((skill, idx) => (
                            <Badge key={idx} variant="secondary" className="bg-white/10 text-gray-300 text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {job.skills.length > 5 && (
                            <Badge variant="secondary" className="bg-white/10 text-gray-400 text-xs">
                              +{job.skills.length - 5} more
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Match Reasons & Concerns */}
                      {job.match_score !== null && (job.match_reasons?.length || job.match_concerns?.length) && (
                        <div className="mt-4 space-y-2">
                          {job.match_reasons?.slice(0, 2).map((reason, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-green-400 text-sm">
                              <CheckCircle className="h-4 w-4 flex-shrink-0" />
                              <span>{reason}</span>
                            </div>
                          ))}
                          {job.match_concerns?.slice(0, 1).map((concern, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-yellow-400 text-sm">
                              <AlertCircle className="h-4 w-4 flex-shrink-0" />
                              <span>{concern}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Posted Date */}
                      <p className="text-gray-500 text-xs mt-3">
                        Posted {timeAgo(job.posted_at)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col items-end gap-3">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleSaveJob(job.id)
                    }}
                    variant="ghost"
                    size="sm"
                    className={savedJobs.has(job.id) ? 'text-red-400' : 'text-gray-400'}
                  >
                    <Heart className={`h-5 w-5 ${savedJobs.has(job.id) ? 'fill-current' : ''}`} />
                  </Button>
                  <Link href={`/jobs/${job.id}`}>
                    <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">
                      View Job
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No Jobs Found</h2>
            <p className="text-gray-400">
              {jobs.length === 0 
                ? 'No active jobs available at the moment. Check back soon!'
                : 'Try adjusting your search to find more opportunities.'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
