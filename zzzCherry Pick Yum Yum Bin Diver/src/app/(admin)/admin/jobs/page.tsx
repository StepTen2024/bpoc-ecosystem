'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Search,
  Building2,
  MapPin,
  DollarSign,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  Pause,
  Eye,
  Loader2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent } from '@/components/shared/ui/card';
import { Button } from '@/components/shared/ui/button';
import { Input } from '@/components/shared/ui/input';
import { Badge } from '@/components/shared/ui/badge';
import { toast } from '@/components/shared/ui/toast';
import { Checkbox } from '@/components/shared/ui/checkbox';
import BatchActionsBar from '@/components/admin/BatchActionsBar';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/shared/ui/dialog';
import { Textarea } from '@/components/shared/ui/textarea';

interface Job {
  id: string;
  title: string;
  slug?: string;
  company: string;
  agencyId: string;
  agencyName: string;
  location: string;
  salary: string;
  type: string;
  status: 'active' | 'paused' | 'closed' | 'pending_approval' | 'rejected';
  rejection_reason?: string | null;
  applicantsCount: number;
  createdAt: string;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());
  const [batchLoading, setBatchLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingJobId, setRejectingJobId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/jobs?search=${searchQuery}&status=${statusFilter}`);
      const data = await response.json();
      
      if (response.ok) {
        setJobs(data.jobs.map((j: Record<string, unknown>) => ({
          id: j.id,
          title: j.title,
          slug: j.slug,
          company: j.company || 'Unknown',
          agencyId: j.agencyId,
          agencyName: j.agencyName || 'Direct',
          location: j.location || 'Remote',
          salary: j.salary || 'Not specified',
          type: j.type || 'full_time',
          status: j.status || 'active',
          rejection_reason: j.rejection_reason || null,
          applicantsCount: j.applicantsCount || 0,
          createdAt: j.createdAt,
        })));
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [searchQuery, statusFilter]);

  // Admin can only approve or reject pending jobs
  const handleJobAction = async (jobId: string, action: 'approve' | 'reject', reason?: string) => {
    setActionLoading(jobId);
    try {
      const body: { jobId: string; action: string; rejection_reason?: string } = { jobId, action };
      if (action === 'reject' && reason) {
        body.rejection_reason = reason;
      }

      const response = await fetch('/api/admin/jobs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Job ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
        // Update local state
        setJobs(prev => prev.map(job =>
          job.id === jobId
            ? {
                ...job,
                status: action === 'approve' ? 'active' : 'rejected',
                rejection_reason: action === 'reject' ? reason : null
              }
            : job
        ));
        // Close modal and reset state
        if (action === 'reject') {
          setShowRejectModal(false);
          setRejectingJobId(null);
          setRejectionReason('');
        }
      } else {
        toast.error(data.error || `Failed to ${action} job`);
      }
    } catch (error) {
      console.error(`Failed to ${action} job:`, error);
      toast.error(`Failed to ${action} job`);
    } finally {
      setActionLoading(null);
    }
  };

  const openRejectModal = (jobId: string) => {
    setRejectingJobId(jobId);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleRejectSubmit = () => {
    if (!rejectingJobId) return;
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    handleJobAction(rejectingJobId, 'reject', rejectionReason);
  };

  const getStatusBadge = (status: Job['status']) => {
    const styles: Record<string, { bg: string; text: string; border: string; icon: typeof CheckCircle }> = {
      active: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', icon: CheckCircle },
      paused: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30', icon: Pause },
      closed: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30', icon: XCircle },
      pending_approval: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30', icon: Clock },
      rejected: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', icon: XCircle },
    };
    const style = styles[status] || styles.closed;
    const Icon = style.icon;
    const label = status === 'pending_approval' ? 'Pending Approval' : status;
    return (
      <Badge variant="outline" className={`${style.bg} ${style.text} ${style.border} capitalize`}>
        <Icon className="h-3 w-3 mr-1" />
        {label}
      </Badge>
    );
  };

  const getTypeBadge = (type: Job['type']) => {
    return (
      <Badge variant="outline" className="bg-white/5 text-gray-300 border-white/20 capitalize">
        {String(type).replace(/[_-]/g, ' ')}
      </Badge>
    );
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = (job.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.company || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = jobs.filter(j => j.status === 'pending_approval').length;

  const toggleJobSelection = (jobId: string) => {
    const newSelected = new Set(selectedJobs);
    if (newSelected.has(jobId)) {
      newSelected.delete(jobId);
    } else {
      newSelected.add(jobId);
    }
    setSelectedJobs(newSelected);
  };

  const toggleSelectAll = () => {
    const pendingJobs = filteredJobs.filter(j => j.status === 'pending_approval');
    if (selectedJobs.size === pendingJobs.length) {
      setSelectedJobs(new Set());
    } else {
      setSelectedJobs(new Set(pendingJobs.map(j => j.id)));
    }
  };

  const handleBatchAction = async (action: 'approve' | 'reject') => {
    if (selectedJobs.size === 0) return;

    setBatchLoading(true);
    try {
      const response = await fetch('/api/admin/jobs/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobIds: Array.from(selectedJobs), action }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setSelectedJobs(new Set());
        fetchJobs();
      } else {
        toast.error(data.error || 'Batch action failed');
      }
    } catch (error) {
      toast.error('Failed to perform batch action');
    } finally {
      setBatchLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Jobs</h1>
          <p className="text-gray-400 mt-1">Monitor job postings and approve pending submissions</p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg">
            <AlertCircle className="h-5 w-5 text-purple-400" />
            <span className="text-purple-300 font-medium">{pendingCount} pending approval</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-white">{jobs.length}</p>
            <p className="text-gray-400 text-sm">Total Jobs</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-emerald-400">{jobs.filter(j => j.status === 'active').length}</p>
            <p className="text-gray-400 text-sm">Active</p>
          </CardContent>
        </Card>
        <Card className={`border-white/10 ${pendingCount > 0 ? 'bg-purple-500/10 border-purple-500/30' : 'bg-white/5'}`}>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-purple-400">{pendingCount}</p>
            <p className="text-gray-400 text-sm">Pending Approval</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-orange-400">{jobs.filter(j => j.status === 'paused').length}</p>
            <p className="text-gray-400 text-sm">Paused</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-cyan-400">{jobs.reduce((sum, j) => sum + j.applicantsCount, 0)}</p>
            <p className="text-gray-400 text-sm">Total Applicants</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
        >
          <option value="all">All Status</option>
          <option value="pending_approval">Pending Approval</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="closed">Closed</option>
          <option value="rejected">Rejected</option>
        </select>
        {pendingCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSelectAll}
            className="border-cyan-500/30 text-cyan-400"
          >
            {selectedJobs.size === filteredJobs.filter(j => j.status === 'pending_approval').length ? 'Deselect All' : 'Select All Pending'}
          </Button>
        )}
      </div>

      {/* Jobs List */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 text-gray-400 animate-spin mx-auto" />
          <p className="text-gray-400 mt-2">Loading jobs...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-12 text-center">
            <Briefcase className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Jobs Found</h3>
            <p className="text-gray-400">Jobs will appear here when agencies create them.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Card className={`border-white/10 hover:border-cyan-500/30 transition-all ${
                job.status === 'pending_approval' ? 'bg-purple-500/5 border-purple-500/20' : 'bg-white/5'
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {job.status === 'pending_approval' && (
                      <Checkbox
                        checked={selectedJobs.has(job.id)}
                        onCheckedChange={() => toggleJobSelection(job.id)}
                        className="mt-1"
                      />
                    )}
                    <div className="flex items-start justify-between flex-1">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{job.title}</h3>
                        {getStatusBadge(job.status)}
                        {getTypeBadge(job.type)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          {job.company}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {job.salary}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-sm">
                        <span className="text-gray-500">
                          Agency: <span className="text-cyan-400">{job.agencyName}</span>
                        </span>
                        <span className="flex items-center gap-1 text-gray-400">
                          <Users className="h-4 w-4" />
                          {job.applicantsCount} applicants
                        </span>
                        <span className="flex items-center gap-1 text-gray-500">
                          <Clock className="h-4 w-4" />
                          {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    {/* Actions - Only for pending approval jobs */}
                    <div className="flex items-center gap-2">
                      {/* View on site link */}
                      {job.slug && job.status === 'active' && (
                        <Link 
                          href={`/jobs/${job.slug}`}
                          target="_blank"
                          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      )}
                      
                      {/* Approve/Reject for pending jobs ONLY */}
                      {job.status === 'pending_approval' && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                            onClick={() => handleJobAction(job.id, 'approve')}
                            disabled={actionLoading === job.id}
                          >
                            {actionLoading === job.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                            onClick={() => openRejectModal(job.id)}
                            disabled={actionLoading === job.id}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      
                      {/* View only indicator for other statuses */}
                      {job.status !== 'pending_approval' && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          View Only
                        </span>
                      )}
                    </div>
                  </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Batch Actions Bar */}
      <BatchActionsBar
        selectedCount={selectedJobs.size}
        onClear={() => setSelectedJobs(new Set())}
        onApprove={() => handleBatchAction('approve')}
        onReject={() => handleBatchAction('reject')}
        loading={batchLoading}
      />

      {/* Reject Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent className="bg-[#1a1a1f] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Reject Job Posting</DialogTitle>
            <DialogDescription className="text-gray-400">
              Please provide a reason for rejecting this job posting. This will be shared with the recruiter.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., Job description is incomplete, salary range is not competitive, missing required information..."
              className="min-h-[120px] bg-white/5 border-white/10 text-white placeholder-gray-500"
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setShowRejectModal(false);
                setRejectingJobId(null);
                setRejectionReason('');
              }}
              className="text-gray-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRejectSubmit}
              disabled={!rejectionReason.trim() || actionLoading !== null}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Job
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
