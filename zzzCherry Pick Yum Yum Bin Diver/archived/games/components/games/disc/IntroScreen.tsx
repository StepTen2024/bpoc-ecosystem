import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/shared/ui/button';
import { Card } from '@/components/shared/ui/card';

interface IntroScreenProps {
  onStart: () => void;
  userProfile: any;
  musicLanguage: 'maledisc' | 'femaledisc';
  setMusicLanguage: (lang: 'maledisc' | 'femaledisc') => void;
  isPreviewing: boolean;
  previewingGender: 'maledisc' | 'femaledisc' | null;
  previewCountdown: number;
  previewMusic: (type: 'maledisc' | 'femaledisc') => void;
}

export function IntroScreen({ 
  onStart, 
  userProfile,
  musicLanguage,
  setMusicLanguage,
  isPreviewing,
  previewingGender,
  previewCountdown,
  previewMusic
}: IntroScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center w-full max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full"
      >
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-cyan-500/20 blur-[100px] rounded-full" />
          <h1 className="relative text-6xl md:text-8xl font-extrabold mb-6 tracking-[-0.02em] bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-green-400 text-glow">
            DISC
            <span className="block text-2xl md:text-4xl mt-2 text-white font-light tracking-[0.2em]">
              PERSONALITY MATRIX
            </span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="relative group overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:shadow-2xl hover:shadow-cyber-blue/20 p-8 md:p-12">
              {/* Inner Glow Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyber-blue/10 via-transparent to-electric-purple/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
                  Discover your <span className="text-cyber-blue font-bold">Cyber Archetype</span>.
                  <br />
                  Are you the <span className="text-red-400">Eagle</span>, <span className="text-yellow-400">Peacock</span>, <span className="text-neon-green">Turtle</span>, or <span className="text-cyber-blue">Owl</span>?
                </p>
              
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                  {[
                    { icon: '🦅', label: 'Dominance', color: 'text-red-400' },
                    { icon: '🦚', label: 'Influence', color: 'text-yellow-400' },
                    { icon: '🐢', label: 'Steadiness', color: 'text-green-400' },
                    { icon: '🦉', label: 'Compliance', color: 'text-blue-400' }
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-lg bg-white/5 border border-white/10 backdrop-blur-md hover:border-white/20 transition-all duration-300">
                      <span className="text-4xl">{item.icon}</span>
                      <span className={`font-mono text-sm ${item.color}`}>{item.label}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={onStart}
                  size="lg"
                  className="group relative overflow-hidden text-lg px-12 py-8 bg-gradient-to-r from-cyber-blue to-blue-600 text-white shadow-lg shadow-cyber-blue/25 transition-all hover:scale-105 hover:shadow-cyber-blue/40"
                >
                  <span className="relative z-10 font-bold tracking-widest">INITIALIZE SEQUENCE</span>
                  <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                </Button>
              </div>
            </div>
          </div>

          {/* Music Selection */}
          <div className="lg:col-span-1">
            <div className="relative group overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:shadow-2xl hover:shadow-electric-purple/20 p-6">
              {/* Inner Glow Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-electric-purple/10 via-transparent to-cyber-blue/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">🎵</span>
                  Music Style
                </h3>
                
                <div className="space-y-3">
                  {/* Male Vocals */}
                  <div className="space-y-2">
                    <Button
                      variant={musicLanguage === 'maledisc' ? 'default' : 'outline'}
                      onClick={() => setMusicLanguage('maledisc')}
                      className={`w-full h-16 transition-all duration-300 hover:scale-105 relative overflow-hidden group ${
                        musicLanguage === 'maledisc' 
                          ? 'bg-gradient-to-r from-cyber-blue to-electric-purple hover:from-cyber-blue/90 hover:to-electric-purple/90 text-white shadow-lg shadow-cyber-blue/30' 
                          : 'border-cyber-blue/50 text-cyber-blue hover:bg-cyber-blue/10 hover:border-cyber-blue/70'
                      }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                      <div className="text-center relative z-10">
                        <div className="text-lg font-bold flex items-center justify-center gap-2">
                          <span className="text-xl">♂️</span>
                          Male Vocals
                        </div>
                        <div className="text-xs opacity-80">Who Are You</div>
                      </div>
                    </Button>
                    <Button
                      onClick={() => previewMusic('maledisc')}
                      disabled={isPreviewing}
                      variant="outline"
                      size="sm"
                      className="w-full border-cyber-blue/30 text-cyber-blue hover:bg-cyber-blue/10 disabled:opacity-50"
                    >
                      {isPreviewing && previewingGender === 'maledisc' ? (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-cyber-blue rounded-full animate-pulse"></div>
                          <span>Previewing... {previewCountdown}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>🎵</span>
                          <span>Preview (10s)</span>
                        </div>
                      )}
                    </Button>
                  </div>

                  {/* Female Vocals */}
                  <div className="space-y-2">
                    <Button
                      variant={musicLanguage === 'femaledisc' ? 'default' : 'outline'}
                      onClick={() => setMusicLanguage('femaledisc')}
                      className={`w-full h-16 transition-all duration-300 hover:scale-105 relative overflow-hidden group ${
                        musicLanguage === 'femaledisc' 
                          ? 'bg-gradient-to-r from-electric-purple to-cyber-blue hover:from-electric-purple/90 hover:to-cyber-blue/90 text-white shadow-lg shadow-electric-purple/30' 
                          : 'border-electric-purple/50 text-electric-purple hover:bg-electric-purple/10 hover:border-electric-purple/70'
                      }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                      <div className="text-center relative z-10">
                        <div className="text-lg font-bold flex items-center justify-center gap-2">
                          <span className="text-xl">♀️</span>
                          Female Vocals
                        </div>
                        <div className="text-xs opacity-80">Sino Ka Ba</div>
                      </div>
                    </Button>
                    <Button
                      onClick={() => previewMusic('femaledisc')}
                      disabled={isPreviewing}
                      variant="outline"
                      size="sm"
                      className="w-full border-electric-purple/30 text-electric-purple hover:bg-electric-purple/10 disabled:opacity-50"
                    >
                      {isPreviewing && previewingGender === 'femaledisc' ? (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-electric-purple rounded-full animate-pulse"></div>
                          <span>Previewing... {previewCountdown}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>🎵</span>
                          <span>Preview (10s)</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-500 font-mono">
          SYSTEM_READY // WAITING_FOR_USER_INPUT...
        </p>
      </motion.div>
    </div>
  );
}











