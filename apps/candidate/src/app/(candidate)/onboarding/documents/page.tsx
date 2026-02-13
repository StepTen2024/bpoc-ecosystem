'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  CreditCard,
  Heart,
  Home,
  Building2,
  Loader2,
  ChevronDown,
  ChevronUp,
  Eye,
  RefreshCw,
  AlertTriangle,
  Sparkles,
  Camera,
  X,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';

interface Document {
  id: string;
  document_type: string;
  file_name: string;
  file_url: string;
  status: 'pending' | 'processing' | 'verified' | 'rejected' | 'needs_review';
  points_awarded: number;
  rejection_reason?: string;
  extracted_data?: Record<string, any>;
  ai_confidence?: number;
  uploaded_at: string;
}

interface OnboardingData {
  id: string;
  status: string;
  total_points: number;
  identity_points: number;
  tax_points: number;
  sss_points: number;
  philhealth_points: number;
  pagibig_points: number;
  photo_points: number;
  is_complete: boolean;
}

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  minPoints: number;
  currentPoints: number;
  documents: Document[];
}

const DOCUMENT_TYPE_NAMES: Record<string, string> = {
  philid: 'Philippine National ID',
  sss_umid: 'SSS UMID Card',
  drivers_license: "Driver's License",
  passport: 'Passport',
  voters_id: "Voter's ID",
  prc_id: 'PRC ID',
  postal_id: 'Postal ID',
  nbi_clearance: 'NBI Clearance',
  police_clearance: 'Police Clearance',
  tin_id: 'TIN ID / TIN Card',
  bir_2316: 'BIR Form 2316',
  bir_1902: 'BIR Form 1902',
  sss_id_old: 'SSS ID (Old)',
  sss_e1: 'SSS E-1 Form',
  philhealth_id: 'PhilHealth ID',
  philhealth_mdr: 'PhilHealth MDR',
  pagibig_id: 'Pag-IBIG ID',
  pagibig_mdf: 'Pag-IBIG MDF',
  birth_certificate: 'Birth Certificate',
  marriage_certificate: 'Marriage Certificate',
  barangay_clearance: 'Barangay Clearance',
  resume: 'Resume / CV',
  diploma: 'Diploma / TOR',
  certificate_of_employment: 'Certificate of Employment',
  medical_certificate: 'Medical Certificate',
  drug_test: 'Drug Test Result',
  id_photo: '2x2 / ID Photo',
  signature: 'Signature',
};

const MINIMUM_POINTS = 155;

export default function OnboardingDocumentsPage() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [onboarding, setOnboarding] = useState<OnboardingData | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>('identity');
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);

  // Get onboarding ID from URL or fetch active one
  const [onboardingId, setOnboardingId] = useState<string | null>(null);

  useEffect(() => {
    if (session?.access_token) {
      fetchOnboarding();
    }
  }, [session]);

  const fetchOnboarding = async () => {
    try {
      // First, get or create onboarding session
      const initRes = await fetch('/api/candidate/onboarding', {
        headers: { 'Authorization': `Bearer ${session?.access_token}` },
      });
      
      if (!initRes.ok) {
        throw new Error('Failed to get onboarding');
      }

      const initData = await initRes.json();
      const oId = initData.onboarding?.id;
      
      if (!oId) {
        setLoading(false);
        return;
      }

      setOnboardingId(oId);

      // Fetch documents
      const docsRes = await fetch(`/api/candidate/onboarding/documents/upload?onboardingId=${oId}`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` },
      });

      if (docsRes.ok) {
        const docsData = await docsRes.json();
        setOnboarding(docsData.onboarding);
        setDocuments(docsData.documents || []);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load onboarding data');
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!onboardingId || !session?.access_token) return;

    setUploading(true);

    for (const file of acceptedFiles) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('onboardingId', onboardingId);

        const response = await fetch('/api/candidate/onboarding/documents/upload', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${session.access_token}` },
          body: formData,
        });

        const result = await response.json();

        if (response.ok) {
          toast.success(result.message || 'Document uploaded!');
          await fetchOnboarding(); // Refresh
        } else {
          toast.error(result.error || 'Upload failed');
        }
      } catch (error) {
        console.error('Upload error:', error);
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    setUploading(false);
  }, [onboardingId, session]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="h-4 w-4 text-emerald-400" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-400" />;
      case 'needs_review': return <Clock className="h-4 w-4 text-orange-400" />;
      case 'processing': return <Loader2 className="h-4 w-4 text-cyan-400 animate-spin" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      verified: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
      needs_review: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      processing: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      pending: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };
    return (
      <Badge variant="outline" className={`${styles[status] || styles.pending} capitalize text-xs`}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  // Group documents by category
  const categories: Category[] = [
    {
      id: 'identity',
      name: 'Identity',
      icon: <CreditCard className="h-5 w-5" />,
      color: 'orange',
      minPoints: 50,
      currentPoints: onboarding?.identity_points || 0,
      documents: documents.filter(d => ['philid', 'sss_umid', 'drivers_license', 'passport', 'voters_id', 'prc_id', 'postal_id', 'nbi_clearance', 'police_clearance'].includes(d.document_type)),
    },
    {
      id: 'tax',
      name: 'TIN / Tax',
      icon: <FileText className="h-5 w-5" />,
      color: 'cyan',
      minPoints: 25,
      currentPoints: onboarding?.tax_points || 0,
      documents: documents.filter(d => ['tin_id', 'bir_2316', 'bir_1902'].includes(d.document_type)),
    },
    {
      id: 'sss',
      name: 'SSS',
      icon: <Building2 className="h-5 w-5" />,
      color: 'blue',
      minPoints: 25,
      currentPoints: onboarding?.sss_points || 0,
      documents: documents.filter(d => ['sss_umid', 'sss_id_old', 'sss_e1'].includes(d.document_type)),
    },
    {
      id: 'philhealth',
      name: 'PhilHealth',
      icon: <Heart className="h-5 w-5" />,
      color: 'green',
      minPoints: 25,
      currentPoints: onboarding?.philhealth_points || 0,
      documents: documents.filter(d => ['philhealth_id', 'philhealth_mdr'].includes(d.document_type)),
    },
    {
      id: 'pagibig',
      name: 'Pag-IBIG',
      icon: <Home className="h-5 w-5" />,
      color: 'purple',
      minPoints: 25,
      currentPoints: onboarding?.pagibig_points || 0,
      documents: documents.filter(d => ['pagibig_id', 'pagibig_mdf'].includes(d.document_type)),
    },
    {
      id: 'photos',
      name: 'Photo',
      icon: <Camera className="h-5 w-5" />,
      color: 'pink',
      minPoints: 5,
      currentPoints: onboarding?.photo_points || 0,
      documents: documents.filter(d => ['id_photo', 'signature'].includes(d.document_type)),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!onboardingId) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <FileText className="h-16 w-16 mx-auto mb-4 text-gray-500" />
        <h2 className="text-2xl font-bold text-white mb-2">No Active Onboarding</h2>
        <p className="text-gray-400">Accept a job offer to start your onboarding documents.</p>
      </div>
    );
  }

  const progressPercent = Math.min(100, ((onboarding?.total_points || 0) / MINIMUM_POINTS) * 100);
  const isComplete = (onboarding?.total_points || 0) >= MINIMUM_POINTS;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Staff Onboarding</h1>
        <p className="text-gray-400 mt-1">Upload your documents to complete onboarding</p>
      </div>

      {/* Progress Card */}
      <Card className={`${isComplete ? 'bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border-emerald-500/30' : 'bg-gradient-to-r from-orange-500/10 to-cyan-500/10 border-orange-500/20'}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {isComplete ? (
                <Sparkles className="h-8 w-8 text-emerald-400" />
              ) : (
                <FileText className="h-8 w-8 text-orange-400" />
              )}
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {isComplete ? 'Onboarding Complete!' : 'Document Verification'}
                </h3>
                <p className="text-sm text-gray-400">
                  {onboarding?.total_points || 0} / {MINIMUM_POINTS} points
                </p>
              </div>
            </div>
            <div className="text-3xl font-bold font-mono text-orange-500">
              {Math.round(progressPercent)}%
            </div>
          </div>

          <Progress 
            value={progressPercent} 
            className="h-3 bg-black/20"
          />

          {!isComplete && (
            <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-cyan-400 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-300">
                  Upload your government IDs and documents below. AI will automatically verify and extract your information. Need {MINIMUM_POINTS - (onboarding?.total_points || 0)} more points.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Upload Zone */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
              ${isDragActive 
                ? 'border-orange-500 bg-orange-500/10' 
                : 'border-white/20 hover:border-orange-500/50 hover:bg-white/5'}
              ${uploading ? 'opacity-50 pointer-events-none' : ''}
            `}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <Loader2 className="h-12 w-12 mx-auto mb-4 text-orange-500 animate-spin" />
            ) : (
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            )}
            <h3 className="text-lg font-semibold text-white mb-2">
              {isDragActive ? 'Drop files here' : 'Upload Documents'}
            </h3>
            <p className="text-gray-400 text-sm">
              {uploading 
                ? 'Processing...' 
                : 'Drag & drop files or click to browse. AI will identify document types automatically.'}
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Supports: JPG, PNG, PDF (max 10MB each)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <div className="space-y-3">
        {categories.map((category) => {
          const isExpanded = expandedCategory === category.id;
          const isMet = category.currentPoints >= category.minPoints;
          
          return (
            <Card key={category.id} className="bg-white/5 border-white/10 overflow-hidden">
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isMet ? 'bg-emerald-500/20 text-emerald-400' : `bg-${category.color}-500/20 text-${category.color}-400`}`}>
                    {isMet ? <CheckCircle className="h-5 w-5" /> : category.icon}
                  </div>
                  <div className="text-left">
                    <h4 className="text-white font-medium">{category.name}</h4>
                    <p className="text-xs text-gray-400">
                      {category.currentPoints}/{category.minPoints} points • {category.documents.length} doc{category.documents.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {isMet && (
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                      ✓ Complete
                    </Badge>
                  )}
                  {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-white/10 p-4 space-y-3">
                  {category.documents.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">
                      No documents uploaded yet. Upload any {category.name.toLowerCase()} document above.
                    </p>
                  ) : (
                    category.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {getStatusIcon(doc.status)}
                          <div className="min-w-0">
                            <p className="text-white text-sm font-medium truncate">
                              {DOCUMENT_TYPE_NAMES[doc.document_type] || doc.document_type}
                            </p>
                            <p className="text-gray-500 text-xs truncate">{doc.file_name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {doc.points_awarded > 0 && (
                            <span className="text-emerald-400 text-xs font-mono">+{doc.points_awarded}</span>
                          )}
                          {getStatusBadge(doc.status)}
                          {doc.status === 'rejected' && doc.rejection_reason && (
                            <button
                              onClick={() => setPreviewDoc(doc)}
                              className="p-1 hover:bg-white/10 rounded"
                              title="View details"
                            >
                              <AlertTriangle className="h-4 w-4 text-red-400" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <Card className="bg-gray-900 border-white/10 max-w-md w-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">Document Details</CardTitle>
              <button onClick={() => setPreviewDoc(null)} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm">Document Type</p>
                <p className="text-white">{DOCUMENT_TYPE_NAMES[previewDoc.document_type]}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">File Name</p>
                <p className="text-white">{previewDoc.file_name}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Status</p>
                {getStatusBadge(previewDoc.status)}
              </div>
              {previewDoc.rejection_reason && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-red-400 text-sm font-medium">Rejection Reason:</p>
                  <p className="text-red-300 text-sm mt-1">{previewDoc.rejection_reason}</p>
                </div>
              )}
              {previewDoc.status === 'rejected' && (
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Upload Replacement
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
