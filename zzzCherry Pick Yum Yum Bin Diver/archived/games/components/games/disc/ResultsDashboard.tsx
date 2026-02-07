import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/shared/ui/card';
import { Button } from '@/components/shared/ui/button';
import { DiscResult } from '@/types/disc';
import { ANIMAL_PERSONALITIES } from '@/data/discConstants';
import { Share2, RotateCcw, Brain, Briefcase, ChevronDown, ChevronUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ResultsDashboardProps {
  results: DiscResult;
  aiAssessment: string | null;
  aiBpoRoles: any[] | null;
  isGeneratingAIAssessment?: boolean;
  isGeneratingBpoRoles?: boolean;
  onReset: () => void;
  onShare: () => void;
  user?: any;
}

export function ResultsDashboard({ 
  results, 
  aiAssessment, 
  aiBpoRoles, 
  isGeneratingAIAssessment = false,
  isGeneratingBpoRoles = false,
  onReset, 
  onShare,
  user
}: ResultsDashboardProps) {
  const router = useRouter();
  const primaryAnimal = ANIMAL_PERSONALITIES[results.primaryType];
  const secondaryAnimal = ANIMAL_PERSONALITIES[results.secondaryType];
  
  // Collapse state for both cards
  const [isAiAnalysisExpanded, setIsAiAnalysisExpanded] = useState(true);
  const [isCareerMatchExpanded, setIsCareerMatchExpanded] = useState(true);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">ANALYSIS COMPLETE</h1>
        <p className="text-gray-400 font-mono">SUBJECT_ID: AUTHORIZED // ACCESS_LEVEL: 1</p>
        
        {/* Anonymous User Signup Prompt */}
        {!user && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 max-w-xl mx-auto p-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 rounded-xl"
          >
            <p className="text-white text-lg mb-3">
              🎯 <strong>Sign up to save your results!</strong>
            </p>
            <p className="text-gray-300 text-sm mb-4">
              Your personality analysis is saved temporarily. Create an account to keep your results and unlock career matching features.
            </p>
            <Button 
              onClick={() => router.push('/signup')}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500"
            >
              Create Free Account
            </Button>
          </motion.div>
        )}
      </motion.div>

      {/* Main Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Primary Animal Card - Large */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="md:col-span-8"
        >
          <div className={`h-full relative group overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br ${primaryAnimal.color} p-1 transition-all duration-300 hover:border-white/20 hover:shadow-2xl hover:shadow-cyber-blue/20`}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <div className="relative z-10 p-8 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-mono text-white/80 border border-white/20 px-2 py-1 rounded">PRIMARY ARCHETYPE</span>
                  <span className="text-4xl">{primaryAnimal.animal.split(' ')[0]}</span>
                </div>
                <h2 className="text-5xl md:text-7xl font-black text-white mb-2 tracking-tighter">
                  {primaryAnimal.animal.split(' ').slice(1).join(' ')}
                </h2>
                <h3 className="text-2xl text-white/90 font-light mb-6">
                  {primaryAnimal.title}
                </h3>
                <p className="text-lg text-white/80 leading-relaxed max-w-2xl">
                  {primaryAnimal.description}
                </p>
              </div>
              
              <div className="mt-8 grid grid-cols-2 gap-4">
                {primaryAnimal.traits.map((trait, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur-md rounded-lg p-3 text-white border border-white/10">
                    {trait}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Column */}
        <div className="md:col-span-4 grid grid-cols-1 gap-6">
            {/* Secondary Type */}
            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
            >
                <div className="relative group overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:shadow-2xl hover:shadow-cyber-blue/20 p-6 h-full flex flex-col justify-center">
                  {/* Inner Glow Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-cyber-blue/10 via-transparent to-electric-purple/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative z-10">
                    <span className="text-xs font-mono text-gray-400 mb-2">SECONDARY INFLUENCE</span>
                    <div className="flex items-center gap-4">
                        <span className="text-4xl">{secondaryAnimal.animal.split(' ')[0]}</span>
                        <div>
                            <h4 className="text-xl font-bold text-white">{secondaryAnimal.animal.split(' ').slice(1).join(' ')}</h4>
                            <p className="text-sm text-gray-400">The supporting force</p>
                        </div>
                    </div>
                  </div>
                </div>
            </motion.div>

            {/* Score Bars */}
            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
            >
                <div className="relative group overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:shadow-2xl hover:shadow-cyber-blue/20 p-6">
                  {/* Inner Glow Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-cyber-blue/10 via-transparent to-electric-purple/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative z-10">
                    <h4 className="text-sm font-mono text-gray-400 mb-4">DISTRIBUTION</h4>
                    <div className="space-y-4">
                        {Object.entries(results.scores).map(([key, value]) => (
                            <div key={key} className="space-y-1">
                                <div className="flex justify-between text-xs text-gray-300">
                                    <span>{key}</span>
                                    <span>{value}%</span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${value}%` }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                        className={`h-full bg-gradient-to-r ${ANIMAL_PERSONALITIES[key as 'D'|'I'|'S'|'C'].color}`} 
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                  </div>
                </div>
            </motion.div>
        </div>

        {/* AI Assessment - Full Width */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="md:col-span-8"
        >
            <div className="relative group overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:shadow-2xl hover:shadow-electric-purple/20 p-8 h-full">
              {/* Inner Glow Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-electric-purple/10 via-transparent to-cyber-blue/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Brain className="w-6 h-6 text-electric-purple" />
                        <h3 className="text-xl font-bold text-white">AI Neural Analysis</h3>
                    </div>
                    <div className="flex items-center gap-3">
                        {isGeneratingAIAssessment && (
                            <div className="flex items-center gap-2 text-electric-purple text-sm">
                                <div className="w-2 h-2 bg-electric-purple rounded-full animate-pulse" />
                                <span>Analyzing...</span>
                            </div>
                        )}
                        <button
                            onClick={() => setIsAiAnalysisExpanded(!isAiAnalysisExpanded)}
                            className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-200 text-white/80 hover:text-white"
                            aria-label={isAiAnalysisExpanded ? "Collapse" : "Expand"}
                        >
                            {isAiAnalysisExpanded ? (
                                <ChevronUp className="w-5 h-5" />
                            ) : (
                                <ChevronDown className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </div>
                <AnimatePresence>
                    {isAiAnalysisExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                        >
                            {isGeneratingAIAssessment && !aiAssessment ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-electric-purple">
                                        <div className="w-2 h-2 bg-electric-purple rounded-full animate-pulse" />
                                        <span className="text-gray-300">Processing assessment data...</span>
                                    </div>
                                    <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                                        <motion.div 
                                            className="h-full bg-gradient-to-r from-electric-purple to-cyber-blue"
                                            initial={{ width: 0 }}
                                            animate={{ width: "100%" }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 font-mono">This may take 15-30 seconds...</p>
                                </div>
                            ) : aiAssessment ? (
                                <div className="prose prose-invert max-w-none">
                                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{aiAssessment}</p>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 text-electric-purple animate-pulse">
                                    <div className="w-2 h-2 bg-electric-purple rounded-full" />
                                    <span className="text-gray-300">Waiting for AI analysis...</span>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
              </div>
            </div>
        </motion.div>

        {/* Recommended Roles */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="md:col-span-4"
        >
             <div className="relative group overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:shadow-2xl hover:shadow-cyber-blue/20 p-6 h-full">
               {/* Inner Glow Gradient */}
               <div className="absolute inset-0 bg-gradient-to-br from-cyber-blue/10 via-transparent to-neon-green/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
               
               <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Briefcase className="w-6 h-6 text-cyber-blue" />
                        <h3 className="text-xl font-bold text-white">Career Match</h3>
                    </div>
                    <div className="flex items-center gap-3">
                        {isGeneratingBpoRoles && (
                            <div className="flex items-center gap-2 text-cyber-blue text-sm">
                                <div className="w-2 h-2 bg-cyber-blue rounded-full animate-pulse" />
                                <span>Analyzing...</span>
                            </div>
                        )}
                        <button
                            onClick={() => setIsCareerMatchExpanded(!isCareerMatchExpanded)}
                            className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-200 text-white/80 hover:text-white"
                            aria-label={isCareerMatchExpanded ? "Collapse" : "Expand"}
                        >
                            {isCareerMatchExpanded ? (
                                <ChevronUp className="w-5 h-5" />
                            ) : (
                                <ChevronDown className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </div>
                <AnimatePresence>
                    {isCareerMatchExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                        >
                            <div className="space-y-4">
                                {isGeneratingBpoRoles && !aiBpoRoles ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-cyber-blue">
                                            <div className="w-2 h-2 bg-cyber-blue rounded-full animate-pulse" />
                                            <span className="text-gray-300 text-sm">Finding perfect roles for you...</span>
                                        </div>
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-16 bg-white/5 animate-pulse rounded-lg" />
                                        ))}
                                    </div>
                                ) : aiBpoRoles && aiBpoRoles.length > 0 ? (
                                    aiBpoRoles.slice(0, 3).map((role, i) => (
                                        <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/10">
                                            <h4 className="font-bold text-cyan-300">{role.title}</h4>
                                            <p className="text-xs text-gray-400 mt-1 line-clamp-2">{role.explanation}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="space-y-3">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-16 bg-white/5 animate-pulse rounded-lg" />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
               </div>
            </div>
        </motion.div>
      </div>

      {/* Action Bar */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="flex justify-center gap-4 mt-12"
      >
        <Button 
          onClick={onShare} 
          variant="outline" 
          className="border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20 backdrop-blur-md gap-2"
        >
            <Share2 className="w-4 h-4" /> Share Results
        </Button>
        <Button 
          onClick={onReset} 
          className="relative overflow-hidden rounded-lg bg-gradient-to-r from-cyber-blue to-blue-600 text-white shadow-lg shadow-cyber-blue/25 transition-all hover:scale-105 hover:shadow-cyber-blue/40 gap-2 group/btn"
        >
            <span className="relative z-10 flex items-center gap-2">
              <RotateCcw className="w-4 h-4" /> Retake Analysis
            </span>
            <div className="absolute inset-0 -translate-x-full group-hover/btn:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        </Button>
      </motion.div>
    </div>
  );
}











