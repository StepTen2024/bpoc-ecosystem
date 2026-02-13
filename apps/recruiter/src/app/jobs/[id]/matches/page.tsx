'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Users,
  Sparkles,
  Loader2,
  RefreshCw,
  Star,
  Briefcase,
  MapPin,
  CheckCircle,
  XCircle,
  Brain,
  Clock,
  Zap,
  ChevronRight,
  Target,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Button } from '@/components/shared/ui/button';
import { Badge } from '@/components/shared/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/shared/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { getSessionToken } from '@/lib/auth-helpers';
import { toast } from '@/components/shared/ui/toast';

interface CandidateMatch {
  candidate_id: string;
  overall_score: number;
  breakdown: {
    skills_score: number;
    salary_score: number;
    experience_score: number;
    arrangement_score: number;
  };
  matching_skills: string[];
  missing_skills: string[];
  candidate: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
    headline?: string;
    current_position?: string;
    location_city?: string;
    experience_years?: number;
    skills?: any[];
    work_status?: string;
    ai_analysis?: any;
  };
}

function getScoreColor(score: number) {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 60) return 'text-orange-400';
  if (score >= 40) return 'text-yellow-400';
  return 'text-red-400';
}

function getScoreBg(score: number) {
  if (score >= 80) return 'bg-emerald-500/20 border-emerald-500/30';
  if (score >= 60) return 'bg-orange-500/20 border-orange-500/30';
  if (score >= 40) return 'bg-yellow-500/20 border-yellow-500/30';
  return 'bg-red-500/20 border-red-500/30';
}

export default function JobMatchesPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [matches, setMatches] = useState<CandidateMatch[]>([]);
  const [jobTitle, setJobTitle] = useState('');
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id && jobId) {
      fetchMatches();
      fetchJobTitle();
    }
  }, [user?.id, jobId]);

  const fetchJobTitle = async () => {
    try {
      const token = await getSessionToken();
      const response = await fetch(`/api/recruiter/jobs/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-user-id': user?.id || '',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setJobTitle(data.job?.title || 'Job');
      }
    } catch (err) {
      console.error('Failed to fetch job:', err);
    }
  };

  const fetchMatches = async () => {
    try {
      const token = await getSessionToken();
      const response = await fetch(`/api/recruiter/jobs/${jobId}/matches`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-user-id': user?.id || '',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMatches(data.matches || []);
        setGeneratedAt(data.generated_at);
      }
    } catch (err) {
      console.error('Failed to fetch matches:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateMatches = async () => {
    setGenerating(true);
    setError(null);

    try {
      const token = await getSessionToken();
      const response = await fetch(`/api/recruiter/jobs/${jobId}/matches`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-user-id': user?.id || '',
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.status === 429) {
        setError(`Rate limited. Next refresh: ${new Date(data.next_refresh_at).toLocaleString()}`);
        toast.error('Rate limit reached. Upgrade your plan for more frequent matching.');
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate');
      }

      toast.success(`Found ${data.matches?.length || 0} matching candidates!`);
      await fetchMatches();
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-orange-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href={`/jobs/${jobId}/edit`} className="inline-flex items-center text-gray-400 hover:text-white">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Job
        </Link>
      </div>

      {/* Title Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 border-purple-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/25">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">AI Candidate Matching</h1>
                  <p className="text-gray-400">{jobTitle}</p>
                </div>
              </div>
              <Button
                onClick={generateMatches}
                disabled={generating}
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
              >
                {generating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                {matches.length === 0 ? 'Generate Matches' : 'Refresh Matches'}
              </Button>
            </div>

            {generatedAt && (
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
                <Clock className="h-4 w-4" />
                Last generated: {new Date(generatedAt).toLocaleString()}
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* No Matches State */}
      {matches.length === 0 && !loading && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="py-16 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Matches Yet</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Click "Generate Matches" to let our AI find the best candidates for this position based on skills, experience, and preferences.
              </p>
              <Button
                onClick={generateMatches}
                disabled={generating}
                className="bg-gradient-to-r from-purple-500 to-pink-600"
              >
                {generating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4 mr-2" />
                )}
                Generate AI Matches
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Matches List */}
      {matches.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-400" />
              Top Matches ({matches.length})
            </h2>
          </div>

          {matches.map((match, index) => (
            <motion.div
              key={match.candidate_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={`/talent/${match.candidate_id}`}>
                <Card className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-purple-500/30 transition-all cursor-pointer group">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Score Badge */}
                      <div className={`flex-shrink-0 w-16 h-16 rounded-xl ${getScoreBg(match.overall_score)} flex flex-col items-center justify-center border`}>
                        <span className={`text-2xl font-bold ${getScoreColor(match.overall_score)}`}>
                          {match.overall_score}
                        </span>
                        <span className="text-[10px] text-gray-400 uppercase">Match</span>
                      </div>

                      {/* Candidate Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={match.candidate.avatar_url} />
                              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                                {match.candidate.first_name?.[0]}{match.candidate.last_name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="text-white font-semibold group-hover:text-purple-400 transition-colors">
                                {match.candidate.first_name} {match.candidate.last_name}
                              </h3>
                              <p className="text-gray-400 text-sm">
                                {match.candidate.headline || match.candidate.current_position || 'Candidate'}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-500 group-hover:text-purple-400 transition-colors" />
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mt-3 text-sm">
                          {match.candidate.location_city && (
                            <span className="flex items-center gap-1 text-gray-400">
                              <MapPin className="h-3 w-3" />
                              {match.candidate.location_city}
                            </span>
                          )}
                          {match.candidate.experience_years && (
                            <span className="flex items-center gap-1 text-gray-400">
                              <Briefcase className="h-3 w-3" />
                              {match.candidate.experience_years} years
                            </span>
                          )}
                          {match.candidate.work_status === 'actively_looking' && (
                            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                              <Target className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          )}
                          {match.candidate.ai_analysis && (
                            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                              <Brain className="h-3 w-3 mr-1" />
                              AI Analyzed
                            </Badge>
                          )}
                        </div>

                        {/* Score Breakdown */}
                        <div className="flex gap-4 mt-3 text-xs">
                          <span className="text-gray-500">
                            Skills: <span className={getScoreColor(match.breakdown.skills_score)}>{match.breakdown.skills_score}%</span>
                          </span>
                          <span className="text-gray-500">
                            Salary: <span className={getScoreColor(match.breakdown.salary_score)}>{match.breakdown.salary_score}%</span>
                          </span>
                          <span className="text-gray-500">
                            Exp: <span className={getScoreColor(match.breakdown.experience_score)}>{match.breakdown.experience_score}%</span>
                          </span>
                        </div>

                        {/* Matching Skills */}
                        {match.matching_skills && match.matching_skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {match.matching_skills.slice(0, 5).map((skill) => (
                              <Badge
                                key={skill}
                                className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs"
                              >
                                <CheckCircle className="h-2 w-2 mr-1" />
                                {skill}
                              </Badge>
                            ))}
                            {match.matching_skills.length > 5 && (
                              <Badge className="bg-white/5 text-gray-400 text-xs">
                                +{match.matching_skills.length - 5} more
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Missing Skills (subtle) */}
                        {match.missing_skills && match.missing_skills.length > 0 && match.missing_skills.length <= 3 && (
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            <span>Missing:</span>
                            {match.missing_skills.map((skill) => (
                              <span key={skill} className="text-orange-400/70">{skill}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
