'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Building2, Mail, Phone, Globe, Users, Briefcase, Loader2,
  MapPin, CheckCircle, XCircle, Trophy, DollarSign, Eye, Calendar,
  Shield, ExternalLink, Edit, Trash2, Plus, Clock, UserPlus, X, FileText
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shared/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Button } from '@/components/shared/ui/button';
import { Badge } from '@/components/shared/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/shared/ui/avatar';
import Link from 'next/link';
import { getSessionToken } from '@/lib/auth-helpers';
import { toast } from '@/components/shared/ui/toast';
import EditAgencyModal from '@/components/admin/EditAgencyModal';
import { AgencyWebhooksView } from '@/components/admin/AgencyWebhooksView';
import DocumentPreviewModal from '@/components/admin/DocumentPreviewModal';

interface AgencyDetail {
  id: string;
  name: string;
  slug: string;
  email?: string;
  phone?: string;
  logoUrl?: string;
  website?: string;
  isActive: boolean;
  isVerified: boolean;
  description?: string;
  address?: string;
  city?: string;
  country?: string;
  createdAt: string;
  // Profile fields (from agency_profiles)
  foundedYear?: number;
  employeeCount?: string;
  addressLine1?: string;
  addressLine2?: string;
  state?: string;
  postalCode?: string;
  linkedinUrl?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  settings?: any;
  branding?: any;
  // Document fields
  tinNumber?: string;
  dtiCertificateUrl?: string;
  businessPermitUrl?: string;
  secRegistrationUrl?: string;
  documentsUploadedAt?: string;
  documentsVerified?: boolean;
  documentsVerifiedAt?: string;
  documentsVerifiedBy?: string;
  verifiedByAdmin?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  // Stats
  totalJobs: number;
  activeJobs: number;
  totalPlacements: number;
  totalRevenue: number;
  // Related data
  recruiters: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
    role: string;
    createdAt: string;
  }[];
  clients: {
    id: string;
    status: string;
    companyName: string;
    companyLogo?: string;
    industry?: string;
    jobCount: number;
    createdAt: string;
  }[];
  recentJobs: {
    id: string;
    title: string;
    status: string;
    applicantsCount: number;
    createdAt: string;
  }[];
}

interface AvailableRecruiter {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  agencyId: string;
  agencyName: string;
}

export default function AdminAgencyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const agencyId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [agency, setAgency] = useState<AgencyDetail | null>(null);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [availableRecruiters, setAvailableRecruiters] = useState<AvailableRecruiter[]>([]);
  const [selectedRecruiterId, setSelectedRecruiterId] = useState<string>('');
  const [reassigning, setReassigning] = useState(false);
  const [showDocPreview, setShowDocPreview] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<{ url: string; name: string; type: string } | null>(null);

  useEffect(() => {
    if (agencyId) fetchAgency();
  }, [agencyId]);

  // Fetch available recruiters when modal opens
  useEffect(() => {
    if (showReassignModal) {
      fetchAvailableRecruiters();
    }
  }, [showReassignModal]);

  const fetchAvailableRecruiters = async () => {
    try {
      const token = await getSessionToken();
      const response = await fetch(`/api/admin/agencies/reassign-recruiter?excludeAgencyId=${agencyId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setAvailableRecruiters(data.recruiters || []);
      }
    } catch (error) {
      console.error('Error fetching recruiters:', error);
    }
  };

  const handleReassignRecruiter = async () => {
    if (!selectedRecruiterId) return;

    setReassigning(true);
    try {
      const token = await getSessionToken();
      const response = await fetch('/api/admin/agencies/reassign-recruiter', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recruiterId: selectedRecruiterId,
          newAgencyId: agencyId,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success(data.message || 'Recruiter reassigned successfully');
        setShowReassignModal(false);
        setSelectedRecruiterId('');
        fetchAgency(); // Refresh agency data
      } else {
        toast.error(data.error || 'Failed to reassign recruiter');
      }
    } catch (error) {
      console.error('Error reassigning recruiter:', error);
      toast.error('Failed to reassign recruiter');
    } finally {
      setReassigning(false);
    }
  };

  const handleRemoveRecruiter = async (recruiterId: string, recruiterName: string) => {
    if (!confirm(`Are you sure you want to remove ${recruiterName} from this agency?`)) return;

    try {
      const token = await getSessionToken();
      const response = await fetch('/api/admin/agencies/remove-recruiter', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ recruiterId })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'Recruiter removed successfully');
        fetchAgency(); // Refresh agency data
      } else {
        toast.error(data.error || 'Failed to remove recruiter');
        if (data.details) {
          toast.info(data.details);
        }
      }
    } catch (error) {
      console.error('Error removing recruiter:', error);
      toast.error('Failed to remove recruiter');
    }
  };

  const fetchAgency = async () => {
    try {
      const token = await getSessionToken();
      const response = await fetch(`/api/admin/agencies/${agencyId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (response.ok && data.agency) {
        setAgency(data.agency);
      } else {
        toast.error('Agency not found');
        router.push('/admin/agencies');
      }
    } catch (error) {
      console.error('Failed to fetch agency:', error);
      toast.error('Failed to load agency');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PHP',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const d = new Date(date);
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays}d ago`;
    return `${Math.floor(diffDays / 30)}mo ago`;
  };

  const openDocPreview = (url: string, name: string, type: string) => {
    setPreviewDoc({ url, name, type });
    setShowDocPreview(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!agency) return null;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/admin/agencies" className="inline-flex items-center text-gray-400 hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Agencies
      </Link>

      {/* Agency Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="relative overflow-hidden bg-gradient-to-br from-cyan-500/10 via-white/5 to-purple-500/10 border-cyan-500/30">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5" />
          <CardContent className="relative z-10 p-8">
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24 rounded-xl">
                <AvatarImage src={agency.logoUrl} />
                <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white text-2xl rounded-xl">
                  {agency.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-white">{agency.name}</h1>
                      {agency.isVerified && (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                          <Shield className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      <Badge className={agency.isActive 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                        : 'bg-red-500/20 text-red-400 border-red-500/30'
                      }>
                        {agency.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    {agency.description && (
                      <p className="text-gray-400 max-w-2xl">{agency.description}</p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowEditModal(true)}
                    className="border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Agency
                  </Button>
                </div>

                {/* Contact Info */}
                <div className="flex flex-wrap gap-6 mt-4">
                  {agency.email && (
                    <a href={`mailto:${agency.email}`} className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors">
                      <Mail className="h-4 w-4" />
                      {agency.email}
                    </a>
                  )}
                  {agency.phone && (
                    <span className="flex items-center gap-2 text-gray-400">
                      <Phone className="h-4 w-4" />
                      {agency.phone}
                    </span>
                  )}
                  {agency.website && (
                    <a href={agency.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300">
                      <Globe className="h-4 w-4" />
                      {agency.website.replace(/^https?:\/\//, '')}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {agency.city && (
                    <span className="flex items-center gap-2 text-gray-400">
                      <MapPin className="h-4 w-4" />
                      {agency.city}, {agency.country}
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div className="flex gap-8 mt-6 pt-6 border-t border-white/10">
                  <div>
                    <p className="text-3xl font-bold text-white">{agency.totalPlacements}</p>
                    <p className="text-gray-400 text-sm flex items-center gap-1">
                      <Trophy className="h-4 w-4 text-yellow-400" />
                      Placements
                    </p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-purple-400">{formatCurrency(agency.totalRevenue)}</p>
                    <p className="text-gray-400 text-sm flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-purple-400" />
                      Total Revenue
                    </p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-cyan-400">{agency.activeJobs}</p>
                    <p className="text-gray-400 text-sm flex items-center gap-1">
                      <Briefcase className="h-4 w-4 text-cyan-400" />
                      Active Jobs
                    </p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-emerald-400">{agency.clients?.length || 0}</p>
                    <p className="text-gray-400 text-sm flex items-center gap-1">
                      <Building2 className="h-4 w-4 text-emerald-400" />
                      Clients
                    </p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-orange-400">{agency.recruiters?.length || 0}</p>
                    <p className="text-gray-400 text-sm flex items-center gap-1">
                      <Users className="h-4 w-4 text-orange-400" />
                      Recruiters
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-3 gap-6">
        {/* Clients */}
        <div className="col-span-2 space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="border-b border-white/10 flex flex-row items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Building2 className="h-5 w-5 text-cyan-400" />
                Clients ({agency.clients?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {agency.clients && agency.clients.length > 0 ? (
                <div className="divide-y divide-white/10">
                  {agency.clients.map((client, i) => (
                    <motion.div
                      key={client.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-4 flex items-center justify-between hover:bg-white/5 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 rounded-lg">
                          <AvatarImage src={client.companyLogo} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-lg">
                            {client.companyName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-white font-medium">{client.companyName}</p>
                          <p className="text-gray-500 text-sm">{client.industry || 'No industry set'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-white font-medium">{client.jobCount}</p>
                          <p className="text-gray-500 text-xs">Jobs</p>
                        </div>
                        <Badge variant="outline" className={
                          client.status === 'active' 
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                            : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                        }>
                          {client.status}
                        </Badge>
                        <span className="text-gray-500 text-xs">
                          Added {getTimeAgo(client.createdAt)}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Building2 className="h-12 w-12 mx-auto mb-3 text-gray-600" />
                  <p className="text-gray-500">No clients yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Jobs */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="text-white flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-purple-400" />
                Recent Jobs
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {agency.recentJobs && agency.recentJobs.length > 0 ? (
                <div className="divide-y divide-white/10">
                  {agency.recentJobs.map((job, i) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-4 flex items-center justify-between hover:bg-white/5 transition-all"
                    >
                      <div>
                        <p className="text-white font-medium">{job.title}</p>
                        <p className="text-gray-500 text-sm">
                          {job.applicantsCount} applicants • Posted {getTimeAgo(job.createdAt)}
                        </p>
                      </div>
                      <Badge variant="outline" className={
                        job.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                        job.status === 'paused' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                        'bg-gray-500/20 text-gray-400 border-gray-500/30'
                      }>
                        {job.status}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Briefcase className="h-12 w-12 mx-auto mb-3 text-gray-600" />
                  <p className="text-gray-500">No jobs posted yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recruiters Sidebar */}
        <div className="space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="border-b border-white/10 flex flex-row items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-orange-400" />
                Team Members
              </CardTitle>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setShowReassignModal(true)}
                className="border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {agency.recruiters && agency.recruiters.length > 0 ? (
                <div className="divide-y divide-white/10">
                  {agency.recruiters.map((recruiter, i) => (
                    <motion.div
                      key={recruiter.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-4 hover:bg-white/5 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={recruiter.avatarUrl} />
                          <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-600 text-white">
                            {recruiter.firstName[0]}{recruiter.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-white font-medium text-sm">
                            {recruiter.firstName} {recruiter.lastName}
                          </p>
                          <p className="text-gray-500 text-xs">{recruiter.email}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveRecruiter(recruiter.id, `${recruiter.firstName} ${recruiter.lastName}`)}
                          className="opacity-0 group-hover:opacity-100 text-red-400 hover:bg-red-500/10 h-8 w-8 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="outline" className="bg-white/5 text-gray-400 border-white/10 text-xs capitalize">
                          {recruiter.role}
                        </Badge>
                        <span className="text-gray-600 text-xs">
                          Joined {getTimeAgo(recruiter.createdAt)}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <Users className="h-10 w-10 mx-auto mb-2 text-gray-600" />
                  <p className="text-gray-500 text-sm">No recruiters</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Agency Info */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="text-white text-sm">Agency Details</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div>
                <p className="text-gray-500 text-xs">Agency ID</p>
                <p className="text-white font-mono text-sm break-all">{agency.id}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Slug</p>
                <p className="text-gray-300 text-sm">{agency.slug}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Created</p>
                <p className="text-gray-300 text-sm">
                  {new Date(agency.createdAt).toLocaleDateString('en-US', {
                    month: 'long', day: 'numeric', year: 'numeric'
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Agency Documents */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="border-b border-white/10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4 text-purple-400" />
                  Agency Documents
                </CardTitle>
                {agency.documentsVerified && (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* TIN Number */}
              <div>
                <p className="text-gray-500 text-xs mb-1">TIN Number</p>
                {agency.tinNumber ? (
                  <p className="text-white font-mono text-sm">{agency.tinNumber}</p>
                ) : (
                  <p className="text-gray-600 text-sm">Not provided</p>
                )}
              </div>

              {/* DTI Certificate */}
              <div>
                <p className="text-gray-500 text-xs mb-1">DTI Certificate</p>
                {agency.dtiCertificateUrl ? (
                  <button
                    onClick={() => openDocPreview(agency.dtiCertificateUrl!, 'DTI Certificate', 'DTI Certificate')}
                    className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm"
                  >
                    <FileText className="w-4 h-4" />
                    View Document
                  </button>
                ) : (
                  <p className="text-gray-600 text-sm">Not uploaded</p>
                )}
              </div>

              {/* Business Permit */}
              <div>
                <p className="text-gray-500 text-xs mb-1">Business Permit</p>
                {agency.businessPermitUrl ? (
                  <button
                    onClick={() => openDocPreview(agency.businessPermitUrl!, 'Business Permit', 'Business Permit')}
                    className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm"
                  >
                    <FileText className="w-4 h-4" />
                    View Document
                  </button>
                ) : (
                  <p className="text-gray-600 text-sm">Not uploaded</p>
                )}
              </div>

              {/* SEC Registration */}
              <div>
                <p className="text-gray-500 text-xs mb-1">SEC Registration</p>
                {agency.secRegistrationUrl ? (
                  <button
                    onClick={() => openDocPreview(agency.secRegistrationUrl!, 'SEC Registration', 'SEC Registration Certificate')}
                    className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm"
                  >
                    <FileText className="w-4 h-4" />
                    View Document
                  </button>
                ) : (
                  <p className="text-gray-600 text-sm">Not uploaded</p>
                )}
              </div>

              {/* Upload Date */}
              {agency.documentsUploadedAt && (
                <div className="pt-3 border-t border-white/10">
                  <p className="text-gray-500 text-xs mb-1">Documents Uploaded</p>
                  <p className="text-gray-300 text-sm">
                    {new Date(agency.documentsUploadedAt).toLocaleDateString('en-US', {
                      month: 'long', day: 'numeric', year: 'numeric'
                    })}
                  </p>
                </div>
              )}

              {/* Verification Info */}
              {agency.documentsVerified && agency.documentsVerifiedAt && (
                <div className="pt-3 border-t border-white/10">
                  <p className="text-gray-500 text-xs mb-1">Verified By</p>
                  {agency.verifiedByAdmin ? (
                    <div>
                      <p className="text-white text-sm">
                        {agency.verifiedByAdmin.firstName} {agency.verifiedByAdmin.lastName}
                      </p>
                      <p className="text-gray-500 text-xs">{agency.verifiedByAdmin.email}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        {new Date(agency.documentsVerifiedAt).toLocaleDateString('en-US', {
                          month: 'long', day: 'numeric', year: 'numeric'
                        })}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-300 text-sm">
                      {new Date(agency.documentsVerifiedAt).toLocaleDateString('en-US', {
                        month: 'long', day: 'numeric', year: 'numeric'
                      })}
                    </p>
                  )}
                </div>
              )}

              {/* Not Verified Warning */}
              {!agency.documentsVerified && agency.tinNumber && (
                <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
                  <p className="text-orange-400 text-xs flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    Awaiting admin verification
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Webhooks */}
          <AgencyWebhooksView agencyId={agencyId} />
        </div>
      </div>

      {/* Document Preview Modal */}
      {previewDoc && (
        <DocumentPreviewModal
          isOpen={showDocPreview}
          onClose={() => {
            setShowDocPreview(false);
            setPreviewDoc(null);
          }}
          documentUrl={previewDoc.url}
          documentName={previewDoc.name}
          documentType={previewDoc.type}
        />
      )}

      {/* Edit Agency Modal */}
      {agency && (
        <EditAgencyModal
          agency={agency}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            fetchAgency(); // Refresh agency data
          }}
        />
      )}

      {/* Reassign Recruiter Modal */}
      {showReassignModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#121217] border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <UserPlus className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Add Recruiter to Agency</h3>
                  <p className="text-gray-500 text-sm">Reassign from another agency</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowReassignModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Select Recruiter</label>
                <Select value={selectedRecruiterId} onValueChange={setSelectedRecruiterId}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Choose a recruiter..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1f] border-white/10">
                    {availableRecruiters.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No recruiters available
                      </div>
                    ) : (
                      availableRecruiters.map((r) => (
                        <SelectItem 
                          key={r.id} 
                          value={r.id}
                          className="text-white hover:bg-white/10"
                        >
                          <div className="flex items-center gap-2">
                            <span>{r.firstName} {r.lastName}</span>
                            <span className="text-gray-500 text-xs">({r.agencyName})</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {selectedRecruiterId && (
                <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
                  <p className="text-orange-400 text-sm">
                    ⚠️ This recruiter will be moved from their current agency to <strong>{agency?.name}</strong>.
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowReassignModal(false)}
                  className="flex-1 border-white/10 text-gray-400"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleReassignRecruiter}
                  disabled={!selectedRecruiterId || reassigning}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600"
                >
                  {reassigning ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Reassign
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

