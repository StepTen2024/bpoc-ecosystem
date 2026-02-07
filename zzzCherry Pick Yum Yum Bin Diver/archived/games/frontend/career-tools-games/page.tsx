'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Header from '@/components/shared/layout/Header';
import Footer from '@/components/shared/layout/Footer';
import { Button } from '@/components/shared/ui/button';
import {
  Keyboard,
  Brain,
  Trophy,
  Target,
  Users,
  CheckCircle,
  ArrowRight,
  Lock,
  Sparkles,
  BarChart3,
  Zap,
  Award,
  TrendingUp,
  Star,
  Clock,
  Shield
} from 'lucide-react';

export default function CareerGamesPage() {
  const router = useRouter();
  const pathname = usePathname();

  const handleSignUp = () => {
    const url = `${pathname}?signup=true`;
    router.replace(url);
    window.dispatchEvent(new CustomEvent('openSignupModal'));
  };

  const games = [
    {
      id: 'typing-hero',
      icon: Keyboard,
      title: 'Typing Hero',
      subtitle: 'Master Your Keyboard Skills',
      description: 'Test your typing speed with BPO-specific vocabulary. Race against time, build accuracy, and prove you have what it takes for call center roles.',
      color: 'cyan',
      gradient: 'from-cyan-500 to-blue-600',
      glowColor: 'shadow-cyan-500/20',
      borderGlow: 'hover:border-cyan-500/30',
      features: [
        'Real-time WPM tracking',
        'BPO vocabulary words',
        'Accuracy scoring',
        'Personal best records'
      ],
      stats: { time: '2-3 min', difficulty: 'All Levels' }
    },
    {
      id: 'disc-personality',
      icon: Brain,
      title: 'DISC Personality',
      subtitle: 'Discover Your Work Style',
      description: 'Navigate real Filipino workplace scenarios and discover your personality type. Find out if you\'re an Eagle, Peacock, Turtle, or Owl!',
      color: 'purple',
      gradient: 'from-purple-500 to-pink-600',
      glowColor: 'shadow-purple-500/20',
      borderGlow: 'hover:border-purple-500/30',
      features: [
        'AI-powered questions',
        'Filipino scenarios',
        'BPO role matching',
        'Team compatibility insights'
      ],
      stats: { time: '3-5 min', difficulty: 'All Levels' }
    }
  ];

  const benefits = [
    { icon: Trophy, title: 'Prove Your Skills', description: 'Get certified scores that employers actually want to see', color: 'text-yellow-400' },
    { icon: Target, title: 'Know Your Strengths', description: 'Discover what makes you perfect for BPO roles', color: 'text-cyan-400' },
    { icon: BarChart3, title: 'Track Progress', description: 'See how you improve over time with detailed analytics', color: 'text-purple-400' },
    { icon: Users, title: 'Stand Out', description: 'Add game results to your profile and impress recruiters', color: 'text-green-400' }
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-white overflow-x-hidden">
      {/* Enhanced Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-[150px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-[150px] animate-pulse-slow delay-1000" />
        <div className="absolute top-[40%] right-[30%] w-[600px] h-[600px] bg-pink-500/5 rounded-full blur-[120px] animate-pulse-slow delay-2000" />

        {/* Cyber Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,217,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,217,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
      </div>

      <Header />

      <main className="relative z-10 pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">

          {/* Hero Section - Enhanced */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 mb-8 backdrop-blur-sm"
            >
              <Trophy className="w-5 h-5 text-yellow-400 animate-pulse" />
              <span className="text-cyan-400 text-sm font-bold uppercase tracking-wide">Skill Assessment Games</span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              Prove Your{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                BPO Skills
              </span>
            </h1>

            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
              Play interactive games that test real workplace skills. Get certified scores and
              show employers you've got what it takes.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  className="h-16 px-10 text-lg font-bold rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 shadow-[0_0_30px_rgba(0,217,255,0.3)] hover:shadow-[0_0_50px_rgba(0,217,255,0.5)] border-0"
                  onClick={handleSignUp}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Sign Up to Play Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
              <Link href="/how-it-works">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" variant="outline" className="h-16 px-10 text-lg font-bold rounded-2xl border-2 border-white/20 text-white hover:bg-white/10 hover:border-white/40">
                    How It Works
                  </Button>
                </motion.div>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>100% Free Forever</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span>Certified Scores</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <span>2-5 Minutes</span>
              </div>
            </div>
          </motion.div>

          {/* Games Grid - Enhanced */}
          <div className="grid md:grid-cols-2 gap-8 mb-24">
            {games.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative group"
              >
                {/* Glow effect on hover */}
                <div className={`absolute inset-0 bg-gradient-to-r ${game.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-3xl blur-2xl`} />

                <motion.div
                  whileHover={{ y: -5 }}
                  className={`relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 h-full ${game.borderGlow} hover:bg-white/[0.08] transition-all duration-300 shadow-2xl ${game.glowColor}`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${game.gradient} flex items-center justify-center shadow-lg ${game.glowColor}`}
                    >
                      <game.icon className="w-10 h-10 text-white" />
                    </motion.div>
                    <div className="flex gap-2">
                      <span className="px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-gray-300 text-sm font-medium">
                        {game.stats.time}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <h2 className="text-3xl font-black text-white mb-2">{game.title}</h2>
                  <p className={`text-${game.color}-400 text-base font-bold mb-4 uppercase tracking-wide`}>{game.subtitle}</p>
                  <p className="text-gray-300 mb-8 leading-relaxed text-lg">{game.description}</p>

                  {/* Features */}
                  <div className="space-y-3 mb-10">
                    {game.features.map((feature, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 + i * 0.1 }}
                        className="flex items-center gap-3 text-gray-200"
                      >
                        <CheckCircle className={`w-5 h-5 text-${game.color}-400 flex-shrink-0`} />
                        <span className="font-medium">{feature}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* CTA */}
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      className={`w-full h-14 text-base font-bold rounded-2xl bg-gradient-to-r ${game.gradient} hover:opacity-90 text-white shadow-lg ${game.glowColor} border-0`}
                      onClick={handleSignUp}
                    >
                      <Lock className="w-5 h-5 mr-2" />
                      Sign Up to Play
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Benefits Section - Enhanced */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mb-24"
          >
            <h2 className="text-3xl md:text-5xl font-black text-white text-center mb-4">
              Why Play Our{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Career Games
              </span>
              ?
            </h2>
            <p className="text-gray-400 text-center text-lg mb-12 max-w-2xl mx-auto">
              Stand out from the competition with verified skills that employers trust
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-16 h-16 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center mx-auto mb-4 group-hover:from-white/15 group-hover:to-white/10 transition-all"
                  >
                    <benefit.icon className={`w-8 h-8 ${benefit.color}`} />
                  </motion.div>
                  <h3 className="text-white font-bold text-lg mb-2">{benefit.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Social Proof / Final CTA - Enhanced */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="relative"
          >
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-2xl" />

            <div className="relative bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-pink-500/5 border border-cyan-500/20 rounded-3xl p-10 md:p-14 text-center backdrop-blur-xl">
              {/* Stats */}
              <div className="flex flex-wrap justify-center gap-12 md:gap-20 mb-12">
                {[
                  { value: '5,000+', label: 'Games Played', color: 'text-cyan-400' },
                  { value: '85%', label: 'Improved Scores', color: 'text-purple-400' },
                  { value: '4.8★', label: 'User Rating', color: 'text-yellow-400' }
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                  >
                    <div className={`text-5xl md:text-6xl font-black ${stat.color} mb-2`}>{stat.value}</div>
                    <div className="text-gray-400 text-sm font-medium uppercase tracking-wide">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              <h3 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
                Ready to Test Your Skills?
              </h3>
              <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
                Join thousands of candidates who've proven their abilities and landed their dream BPO jobs.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 px-10 h-16 text-lg font-bold rounded-2xl shadow-[0_0_30px_rgba(0,217,255,0.3)] hover:shadow-[0_0_50px_rgba(0,217,255,0.5)] border-0"
                    onClick={handleSignUp}
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Create Free Account
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </motion.div>
                <Link href="/try-resume-builder">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="lg" variant="outline" className="border-2 border-white/20 text-white hover:bg-white/10 hover:border-white/40 px-10 h-16 text-lg font-bold rounded-2xl">
                      Or Try Resume Analyzer First
                    </Button>
                  </motion.div>
                </Link>
              </div>

              <p className="text-gray-400 text-sm flex flex-wrap items-center justify-center gap-3">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  100% Free
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  No Credit Card
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-purple-400" />
                  Instant Access
                </span>
              </p>
            </div>
          </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
