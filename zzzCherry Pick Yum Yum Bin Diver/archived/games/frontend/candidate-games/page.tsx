'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Button } from '@/components/shared/ui/button';
import { Badge } from '@/components/shared/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/shared/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/shared/ui/alert-dialog';
import { 
  Keyboard,
  Target,
  Clock,
  Play,
  Trophy,
  Zap,
  BarChart3,
  Guitar,
  Globe,
  Brain,
  Eye,
  Monitor,
  HelpCircle,
  Music,
  Crosshair,
  Heart,
  Users,
  MessageSquare,
  Crown,
  Sparkles,
  Flame
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function CandidateGamesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ completed: number; totalSessions: number; achievementPoints: number } | null>(null);
  const [activeTab, setActiveTab] = useState<'interactive' | 'skill' | 'achievements'>('interactive');
  
  // Demo modal state
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [currentTypingIndex, setCurrentTypingIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);
  
  const demoWords = ['create', 'assist', 'design', 'manage'];
  
  // DISC Demo state
  const [showDiscDemoModal, setShowDiscDemoModal] = useState(false);
  const [discDemoStep, setDiscDemoStep] = useState(0);
  const [discDemoScores, setDiscDemoScores] = useState({ D: 0, I: 0, S: 0, C: 0 });
  const [discDemoSelected, setDiscDemoSelected] = useState<string | null>(null);
  const [discDemoReaction, setDiscDemoReaction] = useState<string | null>(null);
  const [discDemoAutoMode, setDiscDemoAutoMode] = useState(false);
  const [discDemoCurrentChoice, setDiscDemoCurrentChoice] = useState(0);
  
  // DISC Demo scenarios (sample from actual game)
  const discDemoScenarios = [
    {
      id: 1,
      context: "FAMILY",
      title: "💰 OFW Money Drama",
      scenario: "Your sister in Dubai sends ₱80,000 for mom's surgery. Your uncle 'borrows' ₱15,000 for tricycle repair. Your cousin needs ₱10,000 for enrollment. Mom is crying because money is disappearing...",
      options: [
        { id: 'A', disc: 'D', text: "STOP! Sister's money is for MOM ONLY! Pay it back NOW!", reaction: "A fierce spirit stirs within..." },
        { id: 'B', disc: 'I', text: "Let's call ate together and explain the situation honestly", reaction: "A vibrant energy awakens..." },
        { id: 'C', disc: 'S', text: "Use my own ₱20,000 savings to cover what they took", reaction: "A steady presence grows..." },
        { id: 'D', disc: 'C', text: "Calculate exact surgery costs, track spending, create repayment plan", reaction: "Ancient wisdom gathers..." }
      ]
    },
    {
      id: 2,
      context: "WORK",
      title: "📞 Angry Customer Crisis",
      scenario: "Customer screaming about billing error, threatening to cancel account worth ₱50,000 monthly. Your manager is in a meeting. You have 2 minutes to resolve this...",
      options: [
        { id: 'A', disc: 'D', text: "I'll fix this immediately! Give me your account number and I'll override the system!", reaction: "A fierce spirit stirs within..." },
        { id: 'B', disc: 'I', text: "I completely understand your frustration! Let me personally handle this for you!", reaction: "A vibrant energy awakens..." },
        { id: 'C', disc: 'S', text: "I hear you. Let me carefully check every detail of your account", reaction: "A steady presence grows..." },
        { id: 'D', disc: 'C', text: "Let me trace the exact billing sequence and identify the root cause", reaction: "Ancient wisdom gathers..." }
      ]
    }
  ];

  // Typing animation effect for demo
  useEffect(() => {
    if (!showDemoModal) return;
    
    const currentText = demoWords[currentTypingIndex];
    
    const timer = setTimeout(() => {
      if (!isDeleting) {
        if (displayText.length < currentText.length) {
          setDisplayText(currentText.slice(0, displayText.length + 1));
          setTypingSpeed(Math.random() * 100 + 50);
        } else {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(currentText.slice(0, displayText.length - 1));
          setTypingSpeed(25);
        } else {
          setIsDeleting(false);
          setCurrentTypingIndex((prev) => (prev + 1) % demoWords.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [displayText, currentTypingIndex, isDeleting, typingSpeed, showDemoModal, demoWords]);

  // Reset DISC demo when modal opens
  useEffect(() => {
    if (showDiscDemoModal) {
      setDiscDemoStep(0);
      setDiscDemoScores({ D: 0, I: 0, S: 0, C: 0 });
      setDiscDemoSelected(null);
      setDiscDemoReaction(null);
      setDiscDemoAutoMode(true);
      setDiscDemoCurrentChoice(0);
    }
  }, [showDiscDemoModal]);

  // Auto-advancing DISC demo
  useEffect(() => {
    if (!showDiscDemoModal || !discDemoAutoMode) return;
    
    const timer = setTimeout(() => {
      if (discDemoStep < discDemoScenarios.length) {
        const currentScenario = discDemoScenarios[discDemoStep];
        const options = currentScenario.options;
        const choiceIndex = discDemoCurrentChoice % options.length;
        const selectedOption = options[choiceIndex];
        
        // Auto-select choice
        setDiscDemoSelected(selectedOption.id);
        setDiscDemoReaction(selectedOption.reaction);
        
        // Update scores
        setDiscDemoScores(prev => ({
          ...prev,
          [selectedOption.disc]: prev[selectedOption.disc as keyof typeof prev] + 1
        }));
        
        // Move to next choice or next scenario
        setTimeout(() => {
          if (discDemoCurrentChoice < options.length - 1) {
            setDiscDemoCurrentChoice(prev => prev + 1);
            setDiscDemoSelected(null);
            setDiscDemoReaction(null);
          } else {
            setDiscDemoStep(prev => prev + 1);
            setDiscDemoCurrentChoice(0);
            setDiscDemoSelected(null);
            setDiscDemoReaction(null);
          }
        }, 2000);
      }
    }, discDemoStep === 0 ? 1000 : 3000);

    return () => clearTimeout(timer);
  }, [showDiscDemoModal, discDemoAutoMode, discDemoStep, discDemoCurrentChoice, discDemoScenarios]);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        if (!user?.id) return
        const res = await fetch(`/api/candidate/games/progress?userId=${user.id}`)
        if (!res.ok) throw new Error(`Failed to load games progress: ${res.status}`)
        const data = await res.json()
        
        setProgress({ 
          completed: data.completed || 0, 
          totalSessions: data.totalSessions || 0, 
          achievementPoints: data.achievementPoints || 0 
        })
      } catch (e) {
        console.error('❌ Failed fetching games progress:', e)
        setProgress({ completed: 0, totalSessions: 0, achievementPoints: 0 })
      }
    }
    if (user?.id) {
      fetchProgress()
    }
  }, [user?.id])

  // Games available in candidate dashboard
  const games = [
    {
      id: 'typing-hero',
      title: 'Typing Hero',
      description: '🎵 Experience the ultimate typing challenge! Master BPO vocabulary while jamming to the rhythm. Race against time, hit the perfect notes, and become a typing legend!',
      icon: Guitar,
      category: 'Speed',
      duration: '2-3 minutes',
      content: 'WPM Challenge',
      categoryColor: 'bg-cyber-blue/20 text-cyber-blue border-cyber-blue/30',
      skillsDeveloped: ['⚡ Lightning Speed', '🎯 Precision', '🎵 Rhythm Mastery', '💼 BPO Vocabulary', '🧠 Focus'],
      participants: 2847,
      rating: 4.9,
      gameInfo: '🔥 Most Popular Game! Master the art of fast, accurate typing while grooving to the beat. Perfect for call center agents who need lightning-fast keyboard skills!',
      specialBadge: '🔥 HOT',
      specialBadgeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    },
    {
      id: 'disc',
      title: 'BPOC DISC',
      description: '🎯 Discover your BPO animal spirit! Navigate authentic scenarios and unlock your communication style. Get AI-powered personalized questions, earn XP and badges, and receive BPO career insights.',
      icon: Brain,
      category: 'Personality',
      duration: '3-5 minutes',
      content: 'DISC Analysis',
      categoryColor: 'bg-electric-purple/20 text-electric-purple border-electric-purple/30',
      skillsDeveloped: ['🎭 Self Discovery', '🤝 Team Harmony', '💬 Communication Style', '👑 Leadership DNA', '🎯 Emotional Intelligence'],
      participants: 156,
      rating: 4.9,
      gameInfo: '🐅 Meet your BPO animal! Discover which role fits your personality - from Eagle leaders to Turtle supporters. Perfect for understanding team dynamics in the workplace!',
      specialBadge: '🌟 INSIGHT',
      specialBadgeColor: 'bg-electric-purple/20 text-electric-purple border-electric-purple/30'
    },
  ];

  const handleStartGame = (gameId: string) => {
    setSelectedGame(gameId);
    
    // Navigate to candidate game pages
    if (gameId === 'typing-hero') {
      router.push('/candidate/games/typing-hero');
    } else if (gameId === 'disc') {
      router.push('/candidate/games/disc');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0D] cyber-grid overflow-hidden text-white selection:bg-cyber-blue/30">
      {/* Background Ambience - Style Guide Orbs */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyber-blue/20 rounded-full blur-[120px] opacity-20 animate-pulse-slow" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-electric-purple/20 rounded-full blur-[120px] opacity-20 animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-neon-green/20 rounded-full blur-[120px] opacity-20 animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>
      
      <div className="pt-16 relative z-10">
        <div className="container mx-auto px-4 py-8">
          {/* Enhanced Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-12"
          >
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="relative">
                  <Trophy className="h-16 w-16 text-neon-green mr-6 animate-pulse-slow" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-neon-green rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">⚡</span>
                  </div>
                </div>
                <div>
                  <h1 className="text-5xl md:text-6xl font-extrabold tracking-[-0.02em] bg-gradient-to-r from-cyan-400 via-purple-400 to-green-400 bg-clip-text text-transparent mb-2">
                    Career Games
                  </h1>
                  <p className="text-gray-300 text-lg">🎮 Level up your BPO skills through interactive challenges</p>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-2 bg-neon-green/20 rounded-full px-3 py-1 border border-neon-green/30">
                      <Zap className="w-4 h-4 text-neon-green" />
                      <span className="text-gray-300 text-sm font-semibold">Interactive Learning</span>
                    </div>
                    <div className="flex items-center gap-2 bg-electric-purple/20 rounded-full px-3 py-1 border border-electric-purple/30">
                      <Target className="w-4 h-4 text-electric-purple" />
                      <span className="text-gray-300 text-sm font-semibold">Skill Building</span>
                    </div>
                    <div className="flex items-center gap-2 bg-cyber-blue/20 rounded-full px-3 py-1 border border-cyber-blue/30">
                      <Trophy className="w-4 h-4 text-cyber-blue" />
                      <span className="text-gray-300 text-sm font-semibold">Achievements</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Games Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto mb-8">
            {games.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + (index * 0.1) }}
                className="group"
              >
                <Card className="relative group overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:shadow-2xl hover:shadow-cyber-blue/20 h-full">
                  {/* Inner Glow Gradient - Style Guide */}
                  <div className="absolute inset-0 bg-gradient-to-br from-cyber-blue/10 via-transparent to-electric-purple/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Enhanced Icon with Glow Effect */}
                  <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-cyber-blue/20 to-electric-purple/20 rounded-xl flex items-center justify-center shadow-lg shadow-cyber-blue/25 group-hover:shadow-cyber-blue/40 transition-all duration-300">
                    <game.icon className="w-6 h-6 text-cyber-blue group-hover:text-electric-purple transition-colors duration-300" />
                  </div>

                  <CardHeader className="pb-4 relative z-10">
                    <CardTitle className="text-2xl font-bold text-white pr-16 mb-3 flex items-center gap-2">
                      {game.title}
                      {game.id === 'typing-hero' && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="cursor-help opacity-70 hover:opacity-100 transition-opacity">
                                <HelpCircle className="h-5 w-5 text-gray-400" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="bg-[#0B0B0D]/95 border border-cyber-blue/30 text-gray-300 backdrop-blur-md max-w-xs">
                              <div className="flex items-center gap-2 p-1">
                                <Monitor className="w-4 h-4 text-cyber-blue" />
                                <div>
                                  <p className="font-semibold text-cyber-blue">Desktop Optimized</p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    Best experience on larger screens.
                                  </p>
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </CardTitle>
                    <CardDescription className="text-gray-300 text-sm leading-relaxed mb-4">
                      {game.description}
                    </CardDescription>

                    {/* Enhanced Game Info with Glow - Style Guide */}
                    {game.gameInfo && (
                      <div className="bg-gradient-to-r from-cyber-blue/15 to-electric-purple/15 border border-cyber-blue/30 rounded-xl p-4 mb-4 shadow-lg shadow-cyber-blue/10">
                        <p className="text-sm text-gray-300 font-medium">{game.gameInfo}</p>
                      </div>
                    )}

                    {/* Enhanced Badges with Better Styling */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge className={`${game.categoryColor} font-semibold shadow-lg`}>
                        {game.category}
                      </Badge>
                      <Badge className="bg-gradient-to-r from-cyber-blue/20 to-cyber-blue/30 text-gray-300 border-cyber-blue/40 flex items-center gap-1 shadow-lg">
                        <Clock className="w-3 h-3" />
                        {game.duration}
                      </Badge>
                      <Badge className="bg-gradient-to-r from-electric-purple/20 to-electric-purple/30 text-gray-300 border-electric-purple/40 flex items-center gap-1 shadow-lg">
                        <BarChart3 className="w-3 h-3" />
                        {game.content}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-5 relative z-10">
                    {/* Enhanced Skills Section - Style Guide */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4 text-cyber-blue" />
                        <span className="bg-gradient-to-r from-cyber-blue to-electric-purple bg-clip-text text-transparent">Skills You'll Master:</span>
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {game.skillsDeveloped.map((skill, skillIndex) => (
                          <Badge 
                            key={skillIndex}
                            variant="secondary"
                            className="bg-gradient-to-r from-cyber-blue/25 to-electric-purple/25 text-gray-300 border-cyber-blue/40 text-xs font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Enhanced CTA Buttons - Style Guide */}
                    {game.id === 'typing-hero' ? (
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          className="flex-1 border-cyber-blue/50 text-cyber-blue hover:bg-cyber-blue/10 hover:border-cyber-blue/70 font-bold py-4 transition-all duration-300 hover:scale-[1.02] relative overflow-hidden group backdrop-blur-md"
                          onClick={() => setShowDemoModal(true)}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyber-blue/10 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                          <div className="relative z-10 flex items-center justify-center gap-2">
                            <Eye className="h-4 w-4" />
                            <span>👁️ Live Demo</span>
                          </div>
                        </Button>
                        <Button 
                          className="flex-1 relative overflow-hidden rounded-lg bg-gradient-to-r from-cyber-blue to-blue-600 text-white shadow-lg shadow-cyber-blue/25 transition-all hover:scale-105 hover:shadow-cyber-blue/40 font-bold text-base py-4"
                          onClick={() => handleStartGame(game.id)}
                        >
                          <span className="relative z-10 flex items-center justify-center gap-2">
                            <Play className="w-4 h-4" />
                            <span>🚀 Start</span>
                          </span>
                          <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                        </Button>
                      </div>
                    ) : game.id === 'disc' ? (
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          className="flex-1 border-electric-purple/50 text-electric-purple hover:bg-electric-purple/10 hover:border-electric-purple/70 font-bold py-4 transition-all duration-300 hover:scale-[1.02] relative overflow-hidden group backdrop-blur-md"
                          onClick={() => setShowDiscDemoModal(true)}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-electric-purple/10 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                          <div className="relative z-10 flex items-center justify-center gap-2">
                            <Eye className="h-4 w-4" />
                            <span>👁️ Live Demo</span>
                          </div>
                        </Button>
                        <Button 
                          className="flex-1 relative overflow-hidden rounded-lg bg-gradient-to-r from-neon-green to-cyber-blue text-white shadow-lg shadow-neon-green/25 transition-all hover:scale-105 hover:shadow-neon-green/40 font-bold text-base py-4"
                          onClick={() => handleStartGame(game.id)}
                        >
                          <span className="relative z-10 flex items-center justify-center gap-2">
                            <Play className="w-4 h-4" />
                            <span>🚀 Start</span>
                          </span>
                          <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        className="w-full relative overflow-hidden rounded-lg bg-gradient-to-r from-cyber-blue to-blue-600 text-white shadow-lg shadow-cyber-blue/25 transition-all hover:scale-105 hover:shadow-cyber-blue/40 font-bold text-base py-4"
                        onClick={() => handleStartGame(game.id)}
                      >
                        <span className="relative z-10 flex items-center justify-center gap-3">
                          <Play className="w-5 h-5" />
                          <span>🚀 Start Your Journey</span>
                          <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                        </span>
                        <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Progress Section */}
          <div className="w-full max-w-4xl mx-auto">
            {/* Your Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <div className="relative group overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:shadow-2xl hover:shadow-cyber-blue/20">
                {/* Inner Glow Gradient - Style Guide */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyber-blue/10 via-transparent to-electric-purple/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <CardHeader className="pb-4 relative z-10">
                  <CardTitle className="flex items-center gap-2 text-gray-300 text-center justify-center">
                    <BarChart3 className="w-5 h-5 text-cyber-blue" />
                    Your Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="max-w-md mx-auto">
                    <table className="w-full text-sm font-mono">
                      <tbody>
                        <tr className="border-b border-white/10">
                          <td className="py-3 text-gray-300">Games Completed</td>
                          <td className="py-3 text-right text-gray-300 font-medium">
                            {!user ? 'Please log in' : progress ? `${progress.completed} / 2` : 'Loading...'}
                          </td>
                        </tr>
                        <tr className="border-b border-white/10">
                          <td className="py-3 text-gray-300">Total Sessions</td>
                          <td className="py-3 text-right text-gray-300 font-medium">
                            {!user ? '—' : progress ? progress.totalSessions : 'Loading...'}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 text-gray-300">Achievement Points</td>
                          <td className="py-3 text-right text-cyber-blue font-medium">
                            {!user ? '—' : progress ? progress.achievementPoints : 'Loading...'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    {user && !progress && (
                      <div className="text-center py-4">
                        <div className="w-8 h-8 border-2 border-cyber-blue border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-gray-400 text-sm">Loading your progress...</p>
                      </div>
                    )}
                    {!user && (
                      <p className="text-center text-gray-400 text-sm mt-3">Please log in to view your progress</p>
                    )}
                  </div>
                </CardContent>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Demo Modal - Typing Hero */}
      <AlertDialog open={showDemoModal} onOpenChange={setShowDemoModal}>
        <AlertDialogContent className="bg-[#0B0B0D]/95 backdrop-blur-xl border-white/10 max-w-4xl shadow-2xl shadow-cyber-blue/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white text-2xl flex items-center gap-3">
              <Guitar className="w-6 h-6 text-cyber-blue" />
              Typing Hero - Interactive Demo
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Experience the gameplay mechanics in this live demo
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="rounded-2xl border border-white/10 bg-black/40 relative overflow-hidden min-h-[400px] my-6">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-neon-green via-cyber-blue to-electric-purple"></div>
            
            <div className="p-6">
              {/* Demo Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-white text-lg">Gameplay Preview</h3>
                  <p className="text-sm text-gray-400">Test your typing speed</p>
                </div>
                <Badge className="bg-neon-green/10 text-neon-green border-neon-green/20 animate-pulse-slow">
                  <Play className="w-3 h-3 mr-1" />
                  Live Demo
                </Badge>
              </div>

              {/* Demo Game Area */}
              <div className="relative h-64 bg-slate-900/50 rounded-xl border border-white/10 overflow-hidden shadow-inner">
                {/* Lane Dividers */}
                {Array.from({ length: 6 }, (_, i) => (
                  <div
                    key={i}
                    className="absolute top-0 bottom-0 w-px bg-white/5"
                    style={{ left: `${(i / 5) * 100}%` }}
                  />
                ))}

                {/* Danger Zone */}
                <div
                  className="absolute left-0 right-0 border-t border-bpoc-red/30 bg-bpoc-red/5"
                  style={{
                    top: '85%',
                    height: '15%'
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-bpoc-red font-bold text-[10px] tracking-widest opacity-60">DANGER ZONE</span>
                  </div>
                </div>

                {/* Animated Falling Words */}
                <AnimatePresence>
                  {Array.from({ length: 8 }, (_, i) => (
                    <motion.div
                      key={i}
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ 
                        y: [0, 100, 200, 300, 400],
                        opacity: [0, 1, 1, 1, 0]
                      }}
                      transition={{ 
                        duration: 6,
                        delay: i * 0.8,
                        repeat: Infinity,
                        repeatDelay: 3
                      }}
                      className={`absolute text-white font-bold text-xs px-3 py-1.5 rounded-full bg-cyber-blue/80 shadow-lg shadow-cyber-blue/20 backdrop-blur-sm border border-white/20`}
                      style={{
                        left: `${((i % 5) / 5) * 100 + (1 / 5) * 50}%`,
                        top: '0%',
                        transform: 'translateX(-50%)'
                      }}
                    >
                      {['assist', 'create', 'design', 'develop', 'manage', 'support', 'service', 'project'][i % 8]}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Demo Stats */}
              <div className="grid grid-cols-4 gap-4 mt-6">
                <div className="bg-white/5 rounded-lg p-3 text-center border border-white/10">
                  <Trophy className="h-4 w-4 text-yellow-400 mx-auto mb-1" />
                  <div className="text-lg font-bold text-white">2,450</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider">Score</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center border border-white/10">
                  <span className="text-lg block mb-1">🔥</span>
                  <div className="text-lg font-bold text-neon-green">12</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider">Streak</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center border border-white/10">
                  <Zap className="h-4 w-4 text-electric-purple mx-auto mb-1" />
                  <div className="text-lg font-bold text-electric-purple">5x</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider">Multiplier</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center border border-white/10">
                  <div className="text-lg font-bold text-cyber-blue">45</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider">WPM</div>
                </div>
              </div>

              {/* Demo Input Area */}
              <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <div className="bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-base font-mono text-white relative flex items-center shadow-inner">
                      <span className="text-white">{displayText}</span>
                      <span className="text-cyber-blue animate-pulse ml-0.5">|</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 hidden sm:block">
                    <div className="mb-1">Timing bonus: <span className="text-neon-green font-bold">+50</span></div>
                    <div>Accuracy bonus: <span className="text-cyber-blue font-bold">x1.5</span></div>
                  </div>
                </div>
                
                <div className="mt-3 text-xs text-gray-500 text-center flex items-center justify-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyber-blue animate-pulse"></span>
                  Type the words in the input box as they fall
                </div>
              </div>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={() => setShowDemoModal(false)}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/10"
            >
              Close Demo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* DISC Demo Modal - Same as original but simplified */}
      <AlertDialog open={showDiscDemoModal} onOpenChange={setShowDiscDemoModal}>
        <AlertDialogContent className="bg-[#0B0B0D]/95 backdrop-blur-xl border-white/10 max-w-5xl shadow-2xl shadow-electric-purple/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white text-2xl flex items-center gap-3">
              <Brain className="w-6 h-6 text-electric-purple" />
              BPOC DISC - Interactive Demo
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Experience authentic Filipino scenarios and discover your BPO animal spirit!
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="rounded-2xl border border-white/10 bg-black/40 relative overflow-hidden min-h-[500px] my-6">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-electric-purple via-pink-500 to-cyber-blue"></div>
            
            <div className="p-6">
              {/* Demo Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-white text-lg">Scenario Simulator</h3>
                  <p className="text-sm text-gray-400">Analyze your response style</p>
                </div>
                <Badge className="bg-electric-purple/10 text-electric-purple border-electric-purple/20 animate-pulse-slow">
                  <Play className="w-3 h-3 mr-1" />
                  Live Demo
                </Badge>
              </div>

              {/* Demo Content - Simplified version */}
              {discDemoStep < discDemoScenarios.length ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-center gap-2 text-electric-purple text-sm font-medium">
                    <div className="w-2 h-2 bg-electric-purple rounded-full animate-pulse"></div>
                    <span>Auto Demo in Progress</span>
                    <div className="w-2 h-2 bg-electric-purple rounded-full animate-pulse"></div>
                  </div>

                  <motion.div 
                    key={discDemoStep}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-gradient-to-br from-electric-purple/10 to-pink-500/10 rounded-xl p-6 border border-electric-purple/20"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl p-2 bg-white/5 rounded-lg">
                        {discDemoScenarios[discDemoStep].context === 'FAMILY' ? '👨‍👩‍👧‍👦' : '💼'}
                      </span>
                      <span className="text-electric-purple font-bold tracking-wide text-xs uppercase bg-electric-purple/10 px-2 py-1 rounded">
                        {discDemoScenarios[discDemoStep].context} Context
                      </span>
                    </div>
                    <h4 className="text-xl font-bold text-white mb-3">
                      {discDemoScenarios[discDemoStep].title}
                    </h4>
                    <p className="text-gray-300 text-base leading-relaxed">
                      {discDemoScenarios[discDemoStep].scenario}
                    </p>
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {discDemoScenarios[discDemoStep].options.map((option, index) => {
                      const isSelected = discDemoSelected === option.id;
                      return (
                        <motion.div
                          key={option.id}
                          className={`text-left transition-all rounded-xl border ${
                            isSelected 
                              ? 'border-electric-purple bg-electric-purple/20 shadow-lg shadow-electric-purple/20' 
                              : 'border-white/10 bg-white/5'
                          } backdrop-blur-sm p-5 relative overflow-hidden cursor-default`}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0, scale: isSelected ? 1.02 : 1 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-3 right-3 w-6 h-6 bg-neon-green rounded-full flex items-center justify-center shadow-lg shadow-neon-green/30"
                            >
                              <span className="text-black text-xs font-bold">✓</span>
                            </motion.div>
                          )}
                          <div className="flex items-start gap-3">
                            <div className="text-xl mt-0.5 opacity-80">🔮</div>
                            <div className="flex-1">
                              <div className="text-white font-medium leading-snug text-sm">
                                {option.text}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {discDemoReaction && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0, y: 10 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.9, opacity: 0, y: -10 }}
                      className="text-center p-4 bg-gradient-to-r from-electric-purple/20 to-pink-500/20 rounded-xl border border-electric-purple/30 relative overflow-hidden"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="text-2xl mb-2 inline-block"
                      >
                        ✨
                      </motion.div>
                      <p className="text-pink-200 font-semibold">{discDemoReaction}</p>
                    </motion.div>
                  )}

                  <div className="space-y-3 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div>Progress</div>
                      <div>
                        {discDemoStep + 1} / {discDemoScenarios.length}
                      </div>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        className="bg-gradient-to-r from-electric-purple to-pink-500 h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${((discDemoStep + 1) / discDemoScenarios.length) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center space-y-8 py-8"
                >
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                    className="text-7xl mb-4 inline-block drop-shadow-2xl"
                  >
                    🔮
                  </motion.div>
                  <div>
                    <motion.h3 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-3xl font-bold text-white mb-4"
                    >
                      Your Filipino BPO Animal Spirit!
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="text-gray-400 max-w-lg mx-auto leading-relaxed"
                    >
                      This is just a demo! Take the full assessment to get your complete personality analysis with AI-powered insights and personalized BPO career recommendations.
                    </motion.p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={() => setShowDiscDemoModal(false)}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/10"
            >
              Close Demo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
