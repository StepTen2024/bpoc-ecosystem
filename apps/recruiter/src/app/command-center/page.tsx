'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Users,
  FileCheck,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Eye,
  TrendingUp,
  Bot,
  Cpu,
  Radio,
} from 'lucide-react';

interface ActivityItem {
  id: string;
  timestamp: Date;
  type: 'extract' | 'validate' | 'approve' | 'flag' | 'upload' | 'complete';
  message: string;
  candidate?: string;
  docType?: string;
  confidence?: number;
}

interface Stats {
  processing: number;
  todayProcessed: number;
  autoApproved: number;
  flagged: number;
  activeOnboarding: number;
  completedToday: number;
}

// Simulated real-time data - in production this would be websocket/polling
const generateActivity = (): ActivityItem => {
  const candidates = ['Pinky Rodriguez', 'John Santos', 'Maria Cruz', 'Pedro Reyes', 'Ana Garcia', 'Luis Mendoza'];
  const docTypes = ['SSS', 'TIN', 'PhilHealth', 'PagIBIG', 'Medical', 'Education', 'Resume'];
  const types: ActivityItem['type'][] = ['extract', 'validate', 'approve', 'upload'];
  
  const type = types[Math.floor(Math.random() * types.length)];
  const candidate = candidates[Math.floor(Math.random() * candidates.length)];
  const docType = docTypes[Math.floor(Math.random() * docTypes.length)];
  const confidence = 85 + Math.floor(Math.random() * 15);

  const messages: Record<string, string> = {
    extract: `${docType} extracted → ${docType === 'SSS' ? '34-1234567-8' : docType === 'TIN' ? '123-456-789' : 'data captured'}`,
    validate: `${docType} validated → ${confidence}% confidence`,
    approve: `${docType} auto-approved ✓`,
    upload: `New upload: ${candidate.toLowerCase().replace(' ', '_')}_${docType.toLowerCase()}.jpg`,
    flag: `${docType} flagged → needs review`,
    complete: `${candidate} onboarding complete!`,
  };

  return {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date(),
    type,
    message: messages[type],
    candidate,
    docType,
    confidence: type === 'validate' ? confidence : undefined,
  };
};

export default function CommandCenterPage() {
  const [isLive, setIsLive] = useState(true);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [stats, setStats] = useState<Stats>({
    processing: 3,
    todayProcessed: 47,
    autoApproved: 44,
    flagged: 3,
    activeOnboarding: 12,
    completedToday: 5,
  });
  const activityRef = useRef<HTMLDivElement>(null);

  // Simulate real-time activity feed
  useEffect(() => {
    if (!isLive) return;

    // Initial activities
    const initial: ActivityItem[] = [];
    for (let i = 0; i < 8; i++) {
      const activity = generateActivity();
      activity.timestamp = new Date(Date.now() - (i * 3000));
      initial.push(activity);
    }
    setActivities(initial);

    // Add new activities periodically
    const interval = setInterval(() => {
      const newActivity = generateActivity();
      setActivities(prev => [newActivity, ...prev.slice(0, 19)]);
      
      // Update stats randomly
      setStats(prev => ({
        ...prev,
        todayProcessed: prev.todayProcessed + (Math.random() > 0.7 ? 1 : 0),
        autoApproved: prev.autoApproved + (Math.random() > 0.8 ? 1 : 0),
        processing: Math.max(1, prev.processing + (Math.random() > 0.5 ? 1 : -1)),
      }));
    }, 2000 + Math.random() * 2000);

    return () => clearInterval(interval);
  }, [isLive]);

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'extract': return <Cpu className="h-4 w-4 text-purple-400" />;
      case 'validate': return <CheckCircle className="h-4 w-4 text-blue-400" />;
      case 'approve': return <CheckCircle className="h-4 w-4 text-emerald-400" />;
      case 'flag': return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'upload': return <FileCheck className="h-4 w-4 text-cyan-400" />;
      case 'complete': return <Zap className="h-4 w-4 text-orange-400" />;
      default: return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'extract': return 'border-l-purple-500';
      case 'validate': return 'border-l-blue-500';
      case 'approve': return 'border-l-emerald-500';
      case 'flag': return 'border-l-yellow-500';
      case 'upload': return 'border-l-cyan-500';
      case 'complete': return 'border-l-orange-500';
      default: return 'border-l-gray-500';
    }
  };

  const autoApproveRate = Math.round((stats.autoApproved / stats.todayProcessed) * 100);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30">
            <Radio className="h-8 w-8 text-red-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              COMMAND CENTER
            </h1>
            <p className="text-gray-500 text-sm">AI-Powered Onboarding Pipeline</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${isLive ? 'bg-emerald-500/20 border border-emerald-500/50' : 'bg-gray-500/20 border border-gray-500/50'}`}>
            <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-500'}`} />
            <span className={isLive ? 'text-emerald-400' : 'text-gray-400'}>
              {isLive ? 'LIVE' : 'PAUSED'}
            </span>
          </div>
          <button
            onClick={() => setIsLive(!isLive)}
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            {isLive ? 'Pause' : 'Resume'}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard
          icon={<Cpu className="h-6 w-6" />}
          label="Processing"
          value={stats.processing}
          color="purple"
          pulse
        />
        <StatCard
          icon={<FileCheck className="h-6 w-6" />}
          label="Today Processed"
          value={stats.todayProcessed}
          color="cyan"
        />
        <StatCard
          icon={<Bot className="h-6 w-6" />}
          label="Auto-Approved"
          value={stats.autoApproved}
          color="emerald"
          subtitle={`${autoApproveRate}% rate`}
        />
        <StatCard
          icon={<AlertTriangle className="h-6 w-6" />}
          label="Flagged"
          value={stats.flagged}
          color="yellow"
        />
        <StatCard
          icon={<Users className="h-6 w-6" />}
          label="Active Onboarding"
          value={stats.activeOnboarding}
          color="blue"
        />
        <StatCard
          icon={<CheckCircle className="h-6 w-6" />}
          label="Completed Today"
          value={stats.completedToday}
          color="orange"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Activity Feed */}
        <div className="lg:col-span-2 bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-cyan-400" />
              <h2 className="text-lg font-semibold">Live Activity</h2>
            </div>
            <span className="text-sm text-gray-500">{activities.length} events</span>
          </div>
          
          <div ref={activityRef} className="h-[500px] overflow-y-auto p-4 space-y-2">
            <AnimatePresence initial={false}>
              {activities.map((activity) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className={`flex items-center gap-3 p-3 rounded-lg bg-black/30 border-l-4 ${getActivityColor(activity.type)}`}
                >
                  <div className="shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-white">
                        {activity.message}
                      </span>
                      {activity.confidence && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          activity.confidence >= 95 ? 'bg-emerald-500/20 text-emerald-400' :
                          activity.confidence >= 90 ? 'bg-blue-500/20 text-blue-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {activity.confidence}%
                        </span>
                      )}
                    </div>
                    {activity.candidate && (
                      <p className="text-xs text-gray-500">{activity.candidate}</p>
                    )}
                  </div>
                  <div className="shrink-0 text-xs text-gray-600 font-mono">
                    {activity.timestamp.toLocaleTimeString()}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-6">
          {/* Auto-Approve Rate */}
          <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bot className="h-5 w-5 text-emerald-400" />
              <h2 className="text-lg font-semibold">AI Performance</h2>
            </div>
            
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-4xl font-bold text-emerald-400">{autoApproveRate}%</span>
                  <span className="text-gray-500 ml-2">auto-approved</span>
                </div>
              </div>
              <div className="overflow-hidden h-3 text-xs flex rounded-full bg-black/50">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${autoApproveRate}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-emerald-500 to-cyan-500"
                />
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Avg. Processing Time</span>
                <span className="text-white font-mono">2.3s</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Accuracy Rate</span>
                <span className="text-white font-mono">98.5%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Human Intervention</span>
                <span className="text-white font-mono">{100 - autoApproveRate}%</span>
              </div>
            </div>
          </div>

          {/* Exceptions */}
          <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <h2 className="text-lg font-semibold">Exceptions</h2>
              <span className="ml-auto px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-sm">
                {stats.flagged}
              </span>
            </div>
            
            <div className="space-y-3">
              <ExceptionItem
                candidate="Maria Cruz"
                issue="Education doc blurry"
                status="Re-upload requested"
                time="2m ago"
              />
              <ExceptionItem
                candidate="Pedro Reyes"
                issue="Name mismatch on TIN"
                status="AI checking variations"
                time="5m ago"
              />
              <ExceptionItem
                candidate="Luis Mendoza"
                issue="Expired medical cert"
                status="Candidate notified"
                time="12m ago"
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl border border-orange-500/20 p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-orange-400" />
              <h2 className="text-lg font-semibold">Today vs Yesterday</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Docs Processed</span>
                <span className="text-emerald-400 font-mono">+23%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Auto-Approve Rate</span>
                <span className="text-emerald-400 font-mono">+5%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Avg. Time</span>
                <span className="text-emerald-400 font-mono">-0.4s</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  icon, 
  label, 
  value, 
  color, 
  pulse,
  subtitle 
}: { 
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'purple' | 'cyan' | 'emerald' | 'yellow' | 'blue' | 'orange';
  pulse?: boolean;
  subtitle?: string;
}) {
  const colors = {
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400',
    cyan: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 text-cyan-400',
    emerald: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400',
    yellow: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30 text-yellow-400',
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400',
    orange: 'from-orange-500/20 to-orange-600/10 border-orange-500/30 text-orange-400',
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-xl border p-4`}>
      <div className={`${colors[color].split(' ').pop()} mb-2 ${pulse ? 'animate-pulse' : ''}`}>
        {icon}
      </div>
      <div className="text-3xl font-bold font-mono text-white">{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
      {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
    </div>
  );
}

function ExceptionItem({
  candidate,
  issue,
  status,
  time,
}: {
  candidate: string;
  issue: string;
  status: string;
  time: string;
}) {
  return (
    <div className="p-3 rounded-lg bg-black/30 border border-yellow-500/20">
      <div className="flex justify-between items-start mb-1">
        <span className="font-medium text-white text-sm">{candidate}</span>
        <span className="text-xs text-gray-500">{time}</span>
      </div>
      <p className="text-sm text-yellow-400">{issue}</p>
      <p className="text-xs text-gray-500 mt-1">
        <Eye className="h-3 w-3 inline mr-1" />
        {status}
      </p>
    </div>
  );
}
