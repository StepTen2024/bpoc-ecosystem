'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Upload,
  CheckCircle,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Shield,
  FileText,
  X,
  Scan,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/shared/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface ScanResult {
  documentType: string;
  confidence: string;
  isExpired: boolean;
  issues: string[];
}

interface DocSlot {
  file: File | null;
  existingUrl?: string;
  existingType?: string;
  scanning: boolean;
  scanResult: ScanResult | null;
  scanError: string | null;
  updated: boolean;
}

const DOC_LABELS = [
  { key: 'doc1', label: 'SEC or DTI Registration', description: 'Securities & Exchange Commission or Dept of Trade & Industry certificate' },
  { key: 'doc2', label: 'BIR Certificate (Form 2303)', description: 'Bureau of Internal Revenue Certificate of Registration' },
  { key: 'doc3', label: 'Business Permit / Authority to Operate', description: "Mayor's permit or authority to operate from your LGU" },
];

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
const MAX_SIZE = 10 * 1024 * 1024;

export default function AgencyDocumentsPage() {
  const router = useRouter();
  const { session } = useAuth();
  const fileInputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  const [loading, setLoading] = useState(true);
  const [docs, setDocs] = useState<DocSlot[]>([
    { file: null, scanning: false, scanResult: null, scanError: null, updated: false },
    { file: null, scanning: false, scanResult: null, scanError: null, updated: false },
    { file: null, scanning: false, scanResult: null, scanError: null, updated: false },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Load existing documents
  useEffect(() => {
    async function loadDocs() {
      try {
        const res = await fetch('/api/recruiter/agency');
        if (res.ok) {
          const data = await res.json();
          const agency = data.agency;
          
          // Map existing docs to slots
          const newDocs = [...docs];
          if (agency?.sec_registration_url) {
            newDocs[0].existingUrl = agency.sec_registration_url;
            newDocs[0].existingType = 'SEC Certificate';
          }
          if (agency?.dti_certificate_url) {
            newDocs[1].existingUrl = agency.dti_certificate_url;
            newDocs[1].existingType = 'BIR Certificate';
          }
          if (agency?.business_permit_url) {
            newDocs[2].existingUrl = agency.business_permit_url;
            newDocs[2].existingType = agency.business_permit_expiry 
              ? `Authority to Operate (Expires: ${new Date(agency.business_permit_expiry).toLocaleDateString()})`
              : 'Authority to Operate';
          }
          setDocs(newDocs);
        }
      } catch (err) {
        console.error('Failed to load agency docs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDocs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateSlot = (idx: number, patch: Partial<DocSlot>) =>
    setDocs((prev) => prev.map((d, i) => (i === idx ? { ...d, ...patch } : d)));

  const handleFile = useCallback((file: File, idx: number) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Only PDF, PNG, or JPG files are accepted.');
      return;
    }
    if (file.size > MAX_SIZE) {
      setError('File must be under 10 MB.');
      return;
    }
    setError('');
    updateSlot(idx, { file, scanResult: null, scanError: null, updated: true });
  }, []);

  const removeFile = (idx: number) => {
    updateSlot(idx, { file: null, scanning: false, scanResult: null, scanError: null, updated: false });
    if (fileInputRefs[idx].current) {
      fileInputRefs[idx].current!.value = '';
    }
  };

  const handleSubmit = async () => {
    const toUpload = docs.filter((d) => d.file !== null);
    if (toUpload.length === 0) {
      setError('Please select at least one document to update.');
      return;
    }
    if (!session) {
      setError('Session expired — please log in again.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const form = new FormData();
      docs.forEach((d, i) => {
        if (d.file) form.append(`doc${i + 1}`, d.file);
      });

      const res = await fetch('/api/recruiter/documents/update', {
        method: 'POST',
        body: form,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      // Update scan results
      if (data.results) {
        data.results.forEach((r: { slot: number; documentType: string; confidence: string; isExpired: boolean; issues: string[] }) => {
          updateSlot(r.slot - 1, {
            scanning: false,
            scanResult: {
              documentType: r.documentType,
              confidence: r.confidence,
              isExpired: r.isExpired,
              issues: r.issues,
            },
          });
        });
      }

      setSuccess(true);
      setTimeout(() => router.push('/agency'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update documents');
    } finally {
      setSubmitting(false);
    }
  };

  const hasChanges = docs.some((d) => d.file !== null);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/agency')}
            className="mb-4 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Agency Settings
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-orange-500/20">
              <RefreshCw className="h-6 w-6 text-orange-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Update Documents</h1>
          </div>
          <p className="text-gray-400">
            Update one or more documents. Only changed documents will be re-verified.
          </p>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-3"
          >
            <AlertCircle className="h-5 w-5 text-red-400" />
            <span className="text-red-300">{error}</span>
          </motion.div>
        )}

        {/* Success */}
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center"
          >
            <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-emerald-300">Documents Updated!</h3>
            <p className="text-emerald-400/80">Redirecting to agency settings...</p>
          </motion.div>
        )}

        {/* Document Slots */}
        {!success && (
          <div className="space-y-4">
            {DOC_LABELS.map((docLabel, idx) => (
              <motion.div
                key={docLabel.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="rounded-xl bg-white/5 border border-white/10 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 text-sm flex items-center justify-center font-medium">
                        {idx + 1}
                      </span>
                      <h3 className="font-medium text-white">{docLabel.label}</h3>
                    </div>
                    <p className="text-sm text-gray-500">{docLabel.description}</p>
                  </div>
                  
                  {docs[idx].existingUrl && !docs[idx].file && (
                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400">
                      Current: {docs[idx].existingType}
                    </span>
                  )}
                </div>

                {/* File Input Area */}
                <input
                  ref={fileInputRefs[idx]}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file, idx);
                  }}
                  className="hidden"
                />

                {docs[idx].file ? (
                  <div className="flex items-center justify-between p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-orange-400" />
                      <div>
                        <p className="text-sm font-medium text-white">{docs[idx].file!.name}</p>
                        <p className="text-xs text-gray-400">
                          {(docs[idx].file!.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {docs[idx].scanResult && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          docs[idx].scanResult!.confidence === 'HIGH' 
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : docs[idx].scanResult!.confidence === 'MEDIUM'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {docs[idx].scanResult!.documentType}
                        </span>
                      )}
                      <button
                        onClick={() => removeFile(idx)}
                        className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRefs[idx].current?.click()}
                    className="w-full p-6 rounded-lg border-2 border-dashed border-white/20 hover:border-orange-500/50 transition-colors flex flex-col items-center gap-2 text-gray-400 hover:text-orange-400"
                  >
                    <Upload className="h-6 w-6" />
                    <span className="text-sm">
                      {docs[idx].existingUrl ? 'Click to replace' : 'Click to upload'}
                    </span>
                  </button>
                )}

                {/* Scan Error */}
                {docs[idx].scanError && (
                  <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {docs[idx].scanError}
                  </p>
                )}
              </motion.div>
            ))}

            {/* Info */}
            <div className="flex items-center gap-2 text-sm text-gray-500 justify-center">
              <Scan className="h-4 w-4" />
              <span>Documents are verified automatically using AI</span>
            </div>

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={!hasChanges || submitting}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white py-6 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading & Verifying...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Update Selected Documents
                </>
              )}
            </Button>

            {/* Security Note */}
            <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
              <Shield className="h-3 w-3" />
              <span>Documents are encrypted and stored securely</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
