'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Upload, 
  Sparkles, 
  Edit3, 
  ArrowRight,
  Mic,
  PenLine,
  FileUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getSessionToken } from '@/lib/auth-helpers';

/**
 * Resume Builder Entry Page
 * Two paths: Upload existing OR Create from scratch
 */
export default function ResumeEntryPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [hasExistingResume, setHasExistingResume] = useState(false);
  const [resumeSlug, setResumeSlug] = useState<string | null>(null);

  useEffect(() => {
    const checkResumeStatus = async () => {
      try {
        const sessionToken = await getSessionToken();
        if (!sessionToken || !user?.id) {
          setIsLoading(false);
          return;
        }

        const response = await fetch('/api/user/resume-status', {
          headers: {
            'Authorization': `Bearer ${sessionToken}`,
            'x-user-id': String(user.id)
          }
        });

        if (response.ok) {
          const data = await response.json();
          setHasExistingResume(data.hasSavedResume || false);
          setResumeSlug(data.resumeSlug || null);
        }
      } catch (error) {
        console.error('Error checking resume status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkResumeStatus();
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0B0D] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-400 animate-spin" />
          </div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0D] relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-12 lg:py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-cyan-400">AI-Powered Resume Builder</span>
          </div>

          <h1 className="text-4xl lg:text-6xl font-black mb-4">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Build Your
            </span>{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Perfect Resume
            </span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Let AI help you create a professional resume that gets noticed
          </p>
        </motion.div>

        {/* If they already have a resume, show option to edit */}
        {hasExistingResume && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center">
              <p className="text-emerald-400 mb-3">✅ You already have a saved resume!</p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Button 
                  onClick={() => router.push('/resume/build')}
                  className="bg-emerald-500 hover:bg-emerald-600"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit My Resume
                </Button>
                {resumeSlug && (
                  <Button 
                    onClick={() => window.open(`/resume/${resumeSlug}`, '_blank')}
                    variant="outline"
                    className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                  >
                    View Public Resume
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Two Path Cards */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {/* Path 1: I Have a Resume */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => router.push('/resume/upload')}
            className="group cursor-pointer"
          >
            <div className="relative h-full bg-gradient-to-br from-cyan-500/5 to-blue-500/5 border border-cyan-500/20 rounded-3xl p-8 lg:p-10 transition-all duration-300 hover:border-cyan-400/50 hover:shadow-[0_0_50px_-12px_rgba(6,182,212,0.3)]">
              {/* Icon */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileUp className="w-10 h-10 text-cyan-400" />
              </div>

              {/* Content */}
              <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3">
                I Have a Resume
              </h2>
              <p className="text-gray-400 mb-6 text-lg">
                Upload your existing resume (PDF, Word, or image) and let AI enhance it with better formatting, keywords, and suggestions.
              </p>

              {/* Features */}
              <ul className="space-y-2 mb-8 text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="text-cyan-400">✓</span> Extract data automatically
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-cyan-400">✓</span> AI analysis & scoring
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-cyan-400">✓</span> Get improvement suggestions
                </li>
              </ul>

              {/* CTA */}
              <div className="flex items-center text-cyan-400 font-semibold group-hover:text-cyan-300">
                Upload & Enhance
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.div>

          {/* Path 2: Create From Scratch */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => router.push('/resume/create')}
            className="group cursor-pointer"
          >
            <div className="relative h-full bg-gradient-to-br from-purple-500/5 to-pink-500/5 border border-purple-500/20 rounded-3xl p-8 lg:p-10 transition-all duration-300 hover:border-purple-400/50 hover:shadow-[0_0_50px_-12px_rgba(168,85,247,0.3)]">
              {/* Icon */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <PenLine className="w-10 h-10 text-purple-400" />
              </div>

              {/* Content */}
              <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3">
                Create From Scratch
              </h2>
              <p className="text-gray-400 mb-6 text-lg">
                No resume? No problem! Describe yourself or paste your work history, and AI will build a professional resume for you.
              </p>

              {/* Features */}
              <ul className="space-y-2 mb-8 text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">✓</span> Voice-to-text or paste info
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">✓</span> AI organizes your content
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">✓</span> Suggests what to include
                </li>
              </ul>

              {/* CTA */}
              <div className="flex items-center text-purple-400 font-semibold group-hover:text-purple-300">
                Start Building
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>

              {/* "No Resume? Perfect!" badge */}
              <div className="absolute top-4 right-4 bg-purple-500/20 text-purple-300 text-xs font-bold px-3 py-1 rounded-full">
                No Resume? Perfect!
              </div>
            </div>
          </motion.div>
        </div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-500 text-sm">
            🔒 Your data is secure • 🤖 Powered by Claude AI • ⚡ Takes just 5 minutes
          </p>
        </motion.div>
      </div>
    </div>
  );
}
