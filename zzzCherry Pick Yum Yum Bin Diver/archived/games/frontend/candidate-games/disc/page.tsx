'use client';

import React, { useEffect } from 'react';
import { useDiscGame } from '@/hooks/useDiscGame';
import { IntroScreen } from '@/components/games/disc/IntroScreen';
import { QuestionCard } from '@/components/games/disc/QuestionCard';
import { ResultsDashboard } from '@/components/games/disc/ResultsDashboard';
import { SpiritReveal } from '@/components/games/disc/SpiritReveal';
import { FILIPINO_DISC_SCENARIOS } from '@/data/filipinoDiscScenarios';
import { AnimatePresence, motion } from 'framer-motion';
import { Volume2, VolumeX, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/shared/ui/button';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function DiscGamePage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    gameState,
    selectedOption,
    showResults,
    discResult,
    showSpiritReveal,
    aiAssessment,
    aiBpoRoles,
    isGeneratingAIAssessment,
    isGeneratingBpoRoles,
    startGame,
    handleOptionSelect,
    resetGame,
    isMuted,
    setIsMuted,
    musicLanguage,
    setMusicLanguage,
    isPreviewing,
    previewingGender,
    previewCountdown,
    previewMusic,
    stopPreview
  } = useDiscGame();

  // Stop preview when component unmounts (e.g., navigating away)
  useEffect(() => {
    return () => {
      stopPreview();
    };
  }, [stopPreview]);

  const handleShare = () => {
    if (navigator.share && discResult) {
      navigator.share({
        title: 'My BPOC DISC Archetype',
        text: `I am a ${discResult.primaryType} - Check out my personality analysis!`,
        url: window.location.href
      }).catch(console.error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0D] cyber-grid text-white overflow-x-hidden selection:bg-cyber-blue/30">
      {/* Background Ambience - Style Guide Orbs */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyber-blue/20 rounded-full blur-[120px] opacity-20 animate-pulse-slow" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-electric-purple/20 rounded-full blur-[120px] opacity-20 animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-neon-green/20 rounded-full blur-[120px] opacity-20 animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col">
        {/* Header / Nav */}
        <header className="flex justify-between items-center mb-8 relative z-50">
             <div className="flex items-center gap-4">
                 <Button 
                    variant="outline" 
                    size="icon" 
                    className="border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:border-white/20 hover:text-white backdrop-blur-md"
                    onClick={() => {
                      stopPreview();
                      router.back();
                    }}
                 >
                     <ArrowLeft className="w-5 h-5" />
                 </Button>
             </div>

             <div className="flex items-center gap-4">
                 {gameState.gameStarted && !gameState.gameCompleted && (() => {
                     // Calculate total questions including personalized
                     const totalQuestions = FILIPINO_DISC_SCENARIOS.length + 
                         (gameState.showPersonalized ? gameState.personalizedQuestions.length : 0);
                     const currentQuestionNum = gameState.currentQuestion + 1;
                     const progressPercent = (currentQuestionNum / totalQuestions) * 100;
                     
                     return (
                         <div className="hidden md:flex items-center gap-4">
                             <div className="text-sm font-mono text-cyber-blue">
                                 Q{currentQuestionNum}/{totalQuestions}
                             </div>
                             <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                                 <div 
                                    className="h-full bg-gradient-to-r from-cyber-blue to-electric-purple transition-all duration-300"
                                    style={{ width: `${progressPercent}%` }}
                                 />
                             </div>
                         </div>
                     );
                 })()}
                 
                 <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsMuted(!isMuted)}
                    className="border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:border-white/20 hover:text-white backdrop-blur-md"
                 >
                     {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                 </Button>
             </div>
        </header>

        <AnimatePresence mode="wait">
          {!gameState.gameStarted && (
            <motion.div
                key="intro"
                exit={{ opacity: 0, y: -20 }}
                className="flex-grow flex items-center justify-center"
            >
                <IntroScreen 
                    onStart={() => startGame(null)} 
                    userProfile={null}
                    musicLanguage={musicLanguage}
                    setMusicLanguage={setMusicLanguage}
                    isPreviewing={isPreviewing}
                    previewingGender={previewingGender}
                    previewCountdown={previewCountdown}
                    previewMusic={previewMusic}
                />
            </motion.div>
          )}

          {gameState.gameStarted && !gameState.gameCompleted && !showSpiritReveal && (
             <motion.div
                key="question"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-grow flex items-center justify-center"
             >
                {gameState.isGeneratingPersonalized ? (
                    <div className="flex flex-col items-center justify-center gap-4 p-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyber-blue"></div>
                        <p className="text-gray-300">Generating personalized questions...</p>
                    </div>
                ) : (
                    <QuestionCard 
                        scenario={
                            gameState.showPersonalized && gameState.currentQuestion >= FILIPINO_DISC_SCENARIOS.length
                                ? gameState.personalizedQuestions[gameState.currentQuestion - FILIPINO_DISC_SCENARIOS.length]
                                : FILIPINO_DISC_SCENARIOS[gameState.currentQuestion]
                        }
                        onOptionSelect={handleOptionSelect}
                        selectedOption={selectedOption}
                        disabled={selectedOption !== null}
                    />
                )}
             </motion.div>
          )}

          {showResults && discResult && (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-grow"
              >
                  <ResultsDashboard 
                    results={discResult}
                    aiAssessment={aiAssessment}
                    aiBpoRoles={aiBpoRoles}
                    isGeneratingAIAssessment={isGeneratingAIAssessment}
                    isGeneratingBpoRoles={isGeneratingBpoRoles}
                    onReset={resetGame}
                    onShare={handleShare}
                    user={user}
                  />
              </motion.div>
          )}
        </AnimatePresence>

        <SpiritReveal active={showSpiritReveal} />
      </div>
    </div>
  );
}
