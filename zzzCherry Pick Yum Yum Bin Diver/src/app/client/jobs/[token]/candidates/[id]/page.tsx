'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import VideoPlayer from '@/components/client/VideoPlayer';

interface PreScreen {
  id: string;
  title: string;
  type: string;
  date: string;
  endedAt: string | null;
  durationSeconds: number | null;
  recordingUrl: string | null;
  recordingDuration: number | null;
  transcription: string | null;
  summary: string | null;
  notes: string | null;
}

interface CandidateProfile {
  candidate: {
    id: string;
    slug: string;
    fullName: string;
    firstName: string;
    lastName: string;
    headline: string | null;
    email: string;
    phone: string | null;
    avatar: string | null;
    bio: string | null;
    location: string | null;
  };
  profile: {
    workStatus: string | null;
    expectedSalary: {
      min: number | null;
      max: number | null;
    };
    preferredShift: string | null;
    yearsExperience: number | null;
    skills: Array<{
      name: string;
      proficiency: string;
      yearsExperience: number | null;
    }>;
    experience: Array<{
      company: string;
      title: string;
      startDate: string;
      endDate: string | null;
      isCurrent: boolean;
      description: string | null;
    }>;
    education: Array<{
      institution: string;
      degree: string;
      fieldOfStudy: string | null;
      startDate: string;
      endDate: string | null;
    }>;
  };
  resume: {
    url: string;
    filename: string;
    atsScore: number | null;
    contentScore: number | null;
  } | null;
  application: {
    id: string;
    status: string;
    appliedAt: string;
    releasedAt: string;
    timeline: Array<{
      action: string;
      at: string;
      description: string;
    }>;
  };
  upcomingInterview: {
    id: string;
    scheduledAt: string;
    duration: number;
    timezone: string;
    status: string;
  } | null;
  preScreens: PreScreen[];
}

export default function CandidateProfilePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const candidateId = params.id as string;

  const [data, setData] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInterviewRequest, setShowInterviewRequest] = useState(false);
  const [expandedPreScreen, setExpandedPreScreen] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`/api/client/jobs/${token}/candidates/${candidateId}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to load candidate profile');
        }
        const profileData = await res.json();
        setData(profileData);
      } catch (err: any) {
        setError(err.message || 'Failed to load candidate profile');
      } finally {
        setLoading(false);
      }
    }

    if (token && candidateId) {
      fetchProfile();
    }
  }, [token, candidateId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading candidate profile...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
          >
            ← Back to Dashboard
          </button>
          <div className="flex items-start space-x-4">
            {data.candidate.avatar ? (
              <img
                src={data.candidate.avatar}
                alt={data.candidate.fullName}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-semibold">
                {data.candidate.fullName.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{data.candidate.fullName}</h1>
              {data.candidate.headline && (
                <p className="text-lg text-gray-600 mt-1">{data.candidate.headline}</p>
              )}
              {data.candidate.location && (
                <p className="text-sm text-gray-500 mt-1">📍 {data.candidate.location}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            {data.candidate.bio && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{data.candidate.bio}</p>
              </div>
            )}

            {/* Work Experience */}
            {data.profile.experience.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Work Experience</h2>
                <div className="space-y-4">
                  {data.profile.experience.map((exp, index) => (
                    <div key={index} className="border-l-2 border-blue-600 pl-4">
                      <h3 className="font-semibold text-gray-900">{exp.title}</h3>
                      <p className="text-gray-600">{exp.company}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(exp.startDate).toLocaleDateString()} - {exp.isCurrent ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'N/A'}
                      </p>
                      {exp.description && (
                        <p className="text-gray-700 mt-2 text-sm">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {data.profile.education.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Education</h2>
                <div className="space-y-4">
                  {data.profile.education.map((edu, index) => (
                    <div key={index}>
                      <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                      <p className="text-gray-600">{edu.institution}</p>
                      {edu.fieldOfStudy && (
                        <p className="text-sm text-gray-600">{edu.fieldOfStudy}</p>
                      )}
                      <p className="text-sm text-gray-500">
                        {new Date(edu.startDate).getFullYear()} - {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {data.profile.skills.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {data.profile.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {skill.name} {skill.yearsExperience ? `(${skill.yearsExperience}y)` : ''}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Pre-Screen Notes & Interviews */}
            {data.preScreens && data.preScreens.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Pre-Screen Interviews</h2>
                <div className="space-y-4">
                  {data.preScreens.map((preScreen) => (
                    <div key={preScreen.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{preScreen.title}</h3>
                          <p className="text-sm text-gray-500">
                            {new Date(preScreen.date).toLocaleString()}
                            {preScreen.durationSeconds && (
                              <span className="ml-2">
                                ({Math.floor(preScreen.durationSeconds / 60)} min)
                              </span>
                            )}
                          </p>
                        </div>
                        <button
                          onClick={() => setExpandedPreScreen(
                            expandedPreScreen === preScreen.id ? null : preScreen.id
                          )}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          {expandedPreScreen === preScreen.id ? 'Hide Details' : 'View Details'}
                        </button>
                      </div>

                      {expandedPreScreen === preScreen.id && (
                        <div className="space-y-4 border-t border-gray-200 pt-4 mt-4">
                          {/* Recording */}
                          {preScreen.recordingUrl && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Recording</h4>
                              <VideoPlayer
                                src={preScreen.recordingUrl}
                                title={preScreen.title}
                              />
                            </div>
                          )}

                          {/* AI Summary */}
                          {preScreen.summary && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">AI Summary</h4>
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <p className="text-gray-700 text-sm whitespace-pre-wrap">{preScreen.summary}</p>
                              </div>
                            </div>
                          )}

                          {/* Notes */}
                          {preScreen.notes && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Recruiter Notes</h4>
                              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                <p className="text-gray-700 text-sm whitespace-pre-wrap">{preScreen.notes}</p>
                              </div>
                            </div>
                          )}

                          {/* Transcription */}
                          {preScreen.transcription && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Full Transcript</h4>
                              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 max-h-96 overflow-y-auto">
                                <p className="text-gray-700 text-sm whitespace-pre-wrap font-mono">
                                  {preScreen.transcription}
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(preScreen.transcription || '');
                                  alert('Transcript copied to clipboard!');
                                }}
                                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                              >
                                Copy Transcript
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-gray-900">{data.candidate.email}</p>
                </div>
                {data.candidate.phone && (
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="text-gray-900">{data.candidate.phone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Resume */}
            {data.resume && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Resume</h2>
                <a
                  href={data.resume.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition"
                >
                  📄 Download Resume
                </a>
                {(data.resume.atsScore || data.resume.contentScore) && (
                  <div className="mt-4 space-y-2">
                    {data.resume.atsScore && (
                      <div>
                        <p className="text-sm text-gray-600">ATS Score</p>
                        <p className="text-2xl font-bold text-green-600">{data.resume.atsScore}/100</p>
                      </div>
                    )}
                    {data.resume.contentScore && (
                      <div>
                        <p className="text-sm text-gray-600">Content Score</p>
                        <p className="text-2xl font-bold text-blue-600">{data.resume.contentScore}/100</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Upcoming Interview */}
            {data.upcomingInterview && (
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-green-900 mb-4">📅 Upcoming Interview</h2>
                <p className="text-sm text-green-700 mb-2">
                  {new Date(data.upcomingInterview.scheduledAt).toLocaleString()}
                </p>
                <p className="text-sm text-green-700 mb-4">
                  Duration: {data.upcomingInterview.duration} minutes
                </p>
                <button
                  onClick={() => router.push(`/client/jobs/${token}/interviews/${data.upcomingInterview?.id}`)}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  View Interview Details
                </button>
              </div>
            )}

            {/* Application Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Status</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className="text-sm font-medium text-blue-600">{data.application.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Applied</span>
                  <span className="text-sm text-gray-900">
                    {new Date(data.application.appliedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Released</span>
                  <span className="text-sm text-gray-900">
                    {new Date(data.application.releasedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Request Interview */}
            {!data.upcomingInterview && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Next Steps</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Interested in interviewing this candidate? Request an interview and propose time slots.
                </p>
                <button
                  onClick={() => setShowInterviewRequest(true)}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                >
                  Request Interview
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interview Request Modal */}
      {showInterviewRequest && (
        <InterviewRequestModal
          candidateName={data.candidate.fullName}
          applicationId={data.application.id}
          token={token}
          onClose={() => setShowInterviewRequest(false)}
        />
      )}
    </div>
  );
}

interface InterviewRequestModalProps {
  candidateName: string;
  applicationId: string;
  token: string;
  onClose: () => void;
}

function InterviewRequestModal({
  candidateName,
  applicationId,
  token,
  onClose,
}: InterviewRequestModalProps) {
  const [timeSlots, setTimeSlots] = useState<Array<{ date: string; time: string }>>([
    { date: '', time: '' },
    { date: '', time: '' },
  ]);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const addTimeSlot = () => {
    if (timeSlots.length < 5) {
      setTimeSlots([...timeSlots, { date: '', time: '' }]);
    }
  };

  const removeTimeSlot = (index: number) => {
    if (timeSlots.length > 1) {
      setTimeSlots(timeSlots.filter((_, i) => i !== index));
    }
  };

  const updateTimeSlot = (index: number, field: 'date' | 'time', value: string) => {
    const updated = [...timeSlots];
    updated[index][field] = value;
    setTimeSlots(updated);
  };

  const handleSubmit = async () => {
    const validSlots = timeSlots.filter(slot => slot.date && slot.time);

    if (validSlots.length < 2) {
      alert('Please provide at least 2 time slots');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/client/interviews/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          applicationId,
          proposedTimes: validSlots.map(slot => `${slot.date}T${slot.time}`),
          message,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit interview request');
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      alert('Failed to submit interview request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Request Interview</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              &times;
            </button>
          </div>

          {success ? (
            <div className="text-center py-8">
              <div className="text-green-500 text-6xl mb-4">✓</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Request Sent!</h3>
              <p className="text-gray-600">The recruiter will review your request and get back to you soon.</p>
            </div>
          ) : (
            <>
              <p className="text-gray-700 mb-6">
                Request an interview with <strong>{candidateName}</strong>. Propose 2-3 time slots that work for you.
              </p>

              <div className="space-y-4 mb-6">
                <h3 className="font-semibold text-gray-900">Proposed Time Slots</h3>
                {timeSlots.map((slot, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      type="date"
                      value={slot.date}
                      onChange={(e) => updateTimeSlot(index, 'date', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min={new Date().toISOString().split('T')[0]}
                    />
                    <input
                      type="time"
                      value={slot.time}
                      onChange={(e) => updateTimeSlot(index, 'time', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {timeSlots.length > 1 && (
                      <button
                        onClick={() => removeTimeSlot(index)}
                        className="text-red-500 hover:text-red-700 px-2"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                {timeSlots.length < 5 && (
                  <button
                    onClick={addTimeSlot}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    + Add Another Time Slot
                  </button>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Message (Optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any additional information or requirements..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Send Request'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
