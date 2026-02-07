'use client';

import React from 'react';
import { useDiscGame } from '@/hooks/useDiscGame';
import { IntroScreen } from '@/components/games/disc/IntroScreen';
import { QuestionCard } from '@/components/games/disc/QuestionCard';
import { ResultsDashboard } from '@/components/games/disc/ResultsDashboard';
import { SpiritReveal } from '@/components/games/disc/SpiritReveal';
import { FILIPINO_DISC_SCENARIOS } from '@/data/filipinoDiscScenarios';
import { AnimatePresence, motion } from 'framer-motion';

export default function DiscGamePage() {
  const {
    gameState,
    selectedOption,
    showResults,
    discResult,
    showSpiritReveal,
    aiAssessment,
    aiBpoRoles,
    startGame,
    handleOptionSelect,
    isGeneratingAIAssessment, // Not used directly in UI but available
    // resetGame would be needed here, I need to expose it from hook
  } = useDiscGame();

  // I missed exposing resetGame from the hook. I will fix the hook in a moment.
  // For now let's assume it exists or I will reload the page as a brute force reset.
  const handleReset = () => {
    window.location.reload(); 
  };

  const handleShare = () => {
    // Basic share implementation
    if (navigator.share && discResult) {
      navigator.share({
        title: 'My BPOC DISC Archetype',
        text: `I am a ${discResult.primaryType} - Check out my personality analysis!`,
        url: window.location.href
      }).catch(console.error);
    } else {
        alert("Share feature coming soon!");
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-white overflow-x-hidden selection:bg-cyan-500/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 blur-[120px] rounded-full mix-blend-screen animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-900/20 blur-[120px] rounded-full mix-blend-screen animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] bg-green-900/10 blur-[100px] rounded-full mix-blend-screen animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-10" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col">
        {/* Header / Nav (Simplified) */}
        <header className="flex justify-between items-center mb-8">
             {/* Can add back button or logo here */}
             <div />
             {gameState.gameStarted && !gameState.gameCompleted && (
                 <div className="flex items-center gap-4">
                     <div className="text-sm font-mono text-cyan-400">
                         Q{gameState.currentQuestion + 1}/{FILIPINO_DISC_SCENARIOS.length}
                     </div>
                     <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                         <div 
                            className="h-full bg-cyan-500 transition-all duration-300"
                            style={{ width: `${((gameState.currentQuestion + 1) / FILIPINO_DISC_SCENARIOS.length) * 100}%` }}
                         />
                     </div>
                 </div>
             )}
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
                <QuestionCard 
                    scenario={FILIPINO_DISC_SCENARIOS[gameState.currentQuestion]}
                    onOptionSelect={handleOptionSelect}
                    selectedOption={selectedOption}
                    disabled={selectedOption !== null}
                />
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
                    onReset={handleReset}
                    onShare={handleShare}
                  />
              </motion.div>
          )}
        </AnimatePresence>

        <SpiritReveal active={showSpiritReveal} />
      </div>
    </div>
  );
}











