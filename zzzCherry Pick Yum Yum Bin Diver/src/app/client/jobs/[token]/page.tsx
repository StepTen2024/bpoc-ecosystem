'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface JobDashboardData {
  job: {
    id: string;
    title: string;
    description: string;
    requirements: string[];
    responsibilities: string[];
    benefits: string[];
    status: string;
    postedAt: string;
    salaryRange: {
      min: number | null;
      max: number | null;
      currency: string;
      type: string;
    };
    workType: string;
    workArrangement: string;
    shift: string;
    experienceLevel: string;
  };
  client: {
    name: string;
  };
  statistics: {
    totalApplicants: number;
    shortlisted: number;
    releasedToClient: number;
    interviewed: number;
    offered: number;
    hired: number;
  };
  releasedCandidates: Array<{
    applicationId: string;
    candidateId: string;
    candidateSlug: string;
    fullName: string;
    headline: string;
    avatar: string | null;
    status: string;
    releasedAt: string;
    profileUrl: string;
  }>;
  upcomingInterviews: Array<{
    id: string;
    candidateName: string;
    scheduledAt: string;
    duration: number;
    status: string;
    canJoin: boolean;
    joinUrl: string;
  }>;
}

export default function ClientJobDashboard() {
  const params = useParams();
  const token = params.token as string;
  const [data, setData] = useState<JobDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch(`/api/client/jobs/${token}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to load dashboard');
        }
        const dashboardData = await res.json();
        setData(dashboardData);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      fetchDashboard();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading job dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            If you believe this is an error, please contact your recruiter.
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{data.job.title}</h1>
              <p className="text-sm text-gray-600 mt-1">{data.client.name}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                data.job.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {data.job.status === 'active' ? 'Active' : 'Closed'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 Your Job Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{data.statistics.totalApplicants}</div>
              <div className="text-sm text-gray-600 mt-1">Total Applicants</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{data.statistics.shortlisted}</div>
              <div className="text-sm text-gray-600 mt-1">Shortlisted</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{data.statistics.releasedToClient}</div>
              <div className="text-sm text-gray-600 mt-1">Released to You</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{data.statistics.interviewed}</div>
              <div className="text-sm text-gray-600 mt-1">Interviewed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{data.statistics.offered}</div>
              <div className="text-sm text-gray-600 mt-1">Offered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">{data.statistics.hired}</div>
              <div className="text-sm text-gray-600 mt-1">Hired</div>
            </div>
          </div>
        </div>

        {/* Upcoming Interviews */}
        {data.upcomingInterviews.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">📅 Upcoming Interviews</h2>
            <div className="space-y-4">
              {data.upcomingInterviews.map((interview) => (
                <div key={interview.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{interview.candidateName}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(interview.scheduledAt).toLocaleString()} ({interview.duration} minutes)
                      </p>
                    </div>
                    <Link
                      href={interview.joinUrl}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Join Interview
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Released Candidates */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            👥 Candidates Released to You ({data.releasedCandidates.length})
          </h2>
          {data.releasedCandidates.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-5xl mb-4">📭</div>
              <p className="text-gray-600">No candidates have been released yet.</p>
              <p className="text-sm text-gray-500 mt-2">
                Your recruiter is reviewing applications and will share the best matches with you soon.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.releasedCandidates.map((candidate) => (
                <Link
                  key={candidate.applicationId}
                  href={candidate.profileUrl}
                  className="border rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {candidate.avatar ? (
                        <img
                          src={candidate.avatar}
                          alt={candidate.fullName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                          {candidate.fullName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{candidate.fullName}</p>
                      <p className="text-sm text-gray-600 truncate">{candidate.headline}</p>
                      <div className="mt-2 flex items-center space-x-2">
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                          {candidate.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          Released {new Date(candidate.releasedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
