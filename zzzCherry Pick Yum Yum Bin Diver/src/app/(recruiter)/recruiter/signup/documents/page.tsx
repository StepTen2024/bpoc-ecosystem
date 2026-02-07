'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Upload,
  CheckCircle,
  Loader2,
  AlertCircle,
  ArrowRight,
  Shield,
  Building2,
  X,
} from 'lucide-react';
import { Button } from '@/components/shared/ui/button';
import { Input } from '@/components/shared/ui/input';
import { AnimatedLogo } from '@/components/shared/ui/AnimatedLogo';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface UploadedFile {
  file: File;
  preview: string;
}

export default function DocumentUploadPage() {
  const router = useRouter();

  const [tinNumber, setTinNumber] = useState('');
  const [birnNumber, setBirnNumber] = useState('');
  const [dtiFile, setDtiFile] = useState<UploadedFile | null>(null);
  const [businessPermitFile, setBusinessPermitFile] = useState<UploadedFile | null>(null);
  const [secFile, setSecFile] = useState<UploadedFile | null>(null);
  const [nbiFile, setNbiFile] = useState<UploadedFile | null>(null);

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Check if user is authenticated and should be on this page
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/recruiter/login');
    }
  };

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<UploadedFile | null>>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload PDF or image files only');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setter({
      file,
      preview: URL.createObjectURL(file),
    });
    setError('');
  };

  const removeFile = (setter: React.Dispatch<React.SetStateAction<UploadedFile | null>>) => {
    setter(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setError('');

    try {
      // Validate all documents are uploaded
      if (!tinNumber || !birnNumber || !dtiFile || !businessPermitFile || !secFile || !nbiFile) {
        setError('Please upload all required documents');
        setUploading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Session expired. Please log in again.');
        setUploading(false);
        return;
      }

      // Create FormData for file uploads
      const formData = new FormData();
      formData.append('tinNumber', tinNumber);
      formData.append('birnNumber', birnNumber);
      formData.append('dtiFile', dtiFile.file);
      formData.append('businessPermitFile', businessPermitFile.file);
      formData.append('secFile', secFile.file);
      formData.append('nbiFile', nbiFile.file);

      // Upload documents via API
      const response = await fetch('/api/recruiter/documents/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload documents');
      }

      setSuccess(true);

      // Redirect to waiting for approval page
      setTimeout(() => {
        router.push('/recruiter/signup/pending-verification');
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setUploading(false);
    }
  };

  const progress = [tinNumber, birnNumber, dtiFile, businessPermitFile, secFile, nbiFile].filter(Boolean).length;
  const progressPercent = (progress / 6) * 100;

  return (
    <div className="min-h-screen bg-[#0B0B0D] selection:bg-orange-500/20 selection:text-orange-200">
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-orange-500/5 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-amber-500/5 rounded-full blur-[120px] animate-pulse-slow delay-1000" />
      </div>

      {/* Nav */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 border-b border-white/5 bg-[#0B0B0D]/80 backdrop-blur-md"
      >
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 relative flex items-center justify-center rounded-xl bg-white/5 border border-white/10 overflow-hidden group-hover:border-orange-500/50 transition-colors">
              <AnimatedLogo className="from-orange-400 via-amber-500 to-yellow-500" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight text-white group-hover:text-orange-400 transition-colors">BPOC.IO</span>
              <span className="text-[10px] tracking-wider text-orange-500 font-mono uppercase">Recruiter</span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">Step 2 of 2</span>
          </div>
        </div>
      </motion.nav>

      <main className="relative z-10 py-12">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-orange-500/20 flex items-center justify-center">
              <Shield className="h-10 w-10 text-orange-400" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Verify Your Agency
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Upload your company documents for verification. This ensures the integrity of our platform and protects both recruiters and candidates.
            </p>
          </motion.div>

          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Upload Progress</span>
              <span className="text-sm text-orange-400 font-medium">{progress} of 6</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.3 }}
                className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
              />
            </div>
          </motion.div>

          {/* Upload Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-[#121217] border border-white/10 rounded-3xl p-8 shadow-2xl">
              {success ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="h-10 w-10 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Documents Uploaded!</h3>
                  <p className="text-gray-400">Redirecting to verification status...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  {error && (
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* TIN Number */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-white flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-orange-400" />
                      Tax Identification Number (TIN)
                    </label>
                    <Input
                      type="text"
                      placeholder="XXX-XXX-XXX-XXX"
                      value={tinNumber}
                      onChange={(e) => setTinNumber(e.target.value)}
                      className="bg-white/5 border-white/10 text-white focus:border-orange-500/50 focus:ring-orange-500/20"
                      required
                    />
                    <p className="text-xs text-gray-500">Enter your 12-digit TIN with dashes</p>
                  </div>

                  {/* BIRN Number */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-white flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-orange-400" />
                      BIRN (Business Identification Registration Number)
                    </label>
                    <Input
                      type="text"
                      placeholder="XXX-XXX-XXX-XXX"
                      value={birnNumber}
                      onChange={(e) => setBirnNumber(e.target.value)}
                      className="bg-white/5 border-white/10 text-white focus:border-orange-500/50 focus:ring-orange-500/20"
                      required
                    />
                    <p className="text-xs text-gray-500">Enter your 12-digit BIRN with dashes</p>
                  </div>

                  {/* DTI Certificate */}
                  <FileUploadField
                    label="DTI Registration Certificate"
                    required
                    file={dtiFile}
                    onSelect={(e) => handleFileSelect(e, setDtiFile)}
                    onRemove={() => removeFile(setDtiFile)}
                  />

                  {/* Business Permit */}
                  <FileUploadField
                    label="Business Permit"
                    required
                    file={businessPermitFile}
                    onSelect={(e) => handleFileSelect(e, setBusinessPermitFile)}
                    onRemove={() => removeFile(setBusinessPermitFile)}
                  />

                  {/* SEC Registration */}
                  <FileUploadField
                    label="SEC Registration Certificate"
                    required
                    file={secFile}
                    onSelect={(e) => handleFileSelect(e, setSecFile)}
                    onRemove={() => removeFile(setSecFile)}
                  />

                  {/* NBI Clearance */}
                  <FileUploadField
                    label="NBI Clearance"
                    required
                    file={nbiFile}
                    onSelect={(e) => handleFileSelect(e, setNbiFile)}
                    onRemove={() => removeFile(setNbiFile)}
                  />

                  {/* Info Box */}
                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-400">
                      <p className="font-medium mb-1">Verification Timeline</p>
                      <p className="text-blue-300/80">Our team will review your documents within 24 hours. You'll receive an email once your account is verified.</p>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={uploading || progress < 6}
                    className="w-full h-14 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="animate-spin" />
                        Uploading Documents...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Submit for Verification
                        <ArrowRight className="w-5 h-5" />
                      </span>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>

          {/* Security Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
              <Shield className="w-4 h-4" />
              <span>Your documents are encrypted and stored securely</span>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

interface FileUploadFieldProps {
  label: string;
  required?: boolean;
  file: UploadedFile | null;
  onSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}

function FileUploadField({ label, required, file, onSelect, onRemove }: FileUploadFieldProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-white flex items-center gap-2">
        <FileText className="w-4 h-4 text-orange-400" />
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>

      {file ? (
        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">{file.file.name}</p>
              <p className="text-gray-400 text-xs">{(file.file.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400 hover:text-white" />
          </button>
        </div>
      ) : (
        <label className="block cursor-pointer">
          <div className="p-6 rounded-lg border-2 border-dashed border-white/10 hover:border-orange-500/30 transition-all bg-white/5 hover:bg-white/10">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-3">
                <Upload className="w-6 h-6 text-orange-400" />
              </div>
              <p className="text-white font-medium mb-1">Click to upload or drag and drop</p>
              <p className="text-gray-400 text-xs">PDF, PNG, JPG up to 5MB</p>
            </div>
          </div>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={onSelect}
            className="hidden"
            required={required}
          />
        </label>
      )}
    </div>
  );
}
