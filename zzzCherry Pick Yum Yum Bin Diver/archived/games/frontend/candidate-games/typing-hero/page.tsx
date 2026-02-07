'use client';

// Force dynamic rendering to avoid Next.js 15 params serialization bug
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Badge } from '@/components/shared/ui/badge';
import { Progress } from '@/components/shared/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Play,
  Volume2,
  VolumeX,
  Guitar,
  Trophy,
  Zap,
  Target,
  Lock,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import { storyGenerator, UserStoryProfile, GameProgressData } from '@/lib/story-generator';
import { createGame, GameConfig, GameStats } from '@/lib/games/typing-hero-game';
import * as Phaser from 'phaser';

type DifficultyLevel = 'rookie' | 'rockstar' | 'virtuoso' | 'legend';
type GameState = 'menu' | 'loading' | 'playing' | 'complete';

// Difficulty configurations
const DIFFICULTY_CONFIG = {
  rookie: {
    displayName: '🎵 Rookie',
    description: 'Perfect for beginners',
    speed: '0.8x',
    spawnRate: '3.5s',
    color: 'emerald',
  },
  rockstar: {
    displayName: '🎸 Rockstar',
    description: 'Balanced challenge',
    speed: '1.0x',
    spawnRate: '2.5s',
    color: 'sky',
  },
  virtuoso: {
    displayName: '🎹 Virtuoso',
    description: 'For experienced typists',
    speed: '1.5x',
    spawnRate: '1.8s',
    color: 'purple',
  },
  legend: {
    displayName: '🔥 Legend',
    description: 'Ultimate challenge',
    speed: '2.0x',
    spawnRate: '1.2s',
    color: 'red',
  },
};

export default function TypingHeroPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  // Game state
  const [gameState, setGameState] = useState<GameState>('menu');
  const [currentDifficulty, setCurrentDifficulty] = useState<DifficultyLevel>('rockstar');
  const [currentChapter, setCurrentChapter] = useState(1);
  
  // Story data
  const [completeStory, setCompleteStory] = useState<any>(null);
  const [isLoadingStory, setIsLoadingStory] = useState(false);
  const [currentAssessmentId, setCurrentAssessmentId] = useState<string | null>(null);
  
  // Music/audio
  const [isMuted, setIsMuted] = useState(false);
  const [musicGender, setMusicGender] = useState<'male' | 'female'>('male');
  const musicRef = useRef<HTMLAudioElement | null>(null);
  
  // Game results
  const [gameResults, setGameResults] = useState<GameStats | null>(null);
  
  // Phaser game instance
  const gameRef = useRef<Phaser.Game | null>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  // Load story on mount
  useEffect(() => {
    loadStoryFromDB();
  }, []);

  // Cleanup Phaser on unmount
  useEffect(() => {
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  // Initialize game when state becomes 'playing'
  useEffect(() => {
    if (gameState === 'playing' && !gameRef.current && completeStory) {
      // Wait for AnimatePresence animation + DOM to be ready
      const timer = setTimeout(() => {
        const container = document.getElementById('game-container');
        console.log('🎮 Checking for game container:', !!container);
        
        if (!container) {
          console.error('❌ Game container not found after delay!');
          alert('Failed to initialize game container');
          setGameState('menu');
          return;
        }

        // Get sentences from current chapter
        const chapter = completeStory.chapters[currentChapter - 1];
        const sentences = chapter.sentences?.map((s: any) => s.text) || [];

        if (sentences.length === 0) {
          console.error('❌ No sentences in chapter');
          alert('No sentences found in story chapter.');
          setGameState('menu');
          return;
        }

        const gameConfig: GameConfig = {
          difficulty: currentDifficulty,
          sentences,
          onComplete: handleGameComplete,
          onPause: handleGamePause,
          onWordTyped: handleWordTyped,
        };

        console.log('🎮 Initializing Phaser game with config:', {
          difficulty: gameConfig.difficulty,
          sentenceCount: gameConfig.sentences.length,
        });
        
        try {
          gameRef.current = createGame('game-container', gameConfig);
          console.log('✅ Phaser game created successfully');
        } catch (error) {
          console.error('❌ Failed to create Phaser game:', error);
          alert('Failed to start game: ' + (error instanceof Error ? error.message : 'Unknown error'));
          setGameState('menu');
        }
      }, 50); // Short delay for DOM to render (AnimatePresence no longer blocking)

      return () => clearTimeout(timer);
    }
  }, [gameState, completeStory, currentChapter, currentDifficulty]);

  // Load existing story from DB
  const loadStoryFromDB = async () => {
    if (!user?.id) {
      console.log('⚠️ Anonymous user, no story to load');
      return;
    }

    try {
      console.log('📖 Loading story from DB...');
      const loadResult = await storyGenerator.loadUserActiveStory(user.id);
      
      if (loadResult.hasStory && loadResult.story) {
        console.log('✅ Story loaded:', loadResult.story.title);
        setCompleteStory(loadResult.story);
        // Store the assessment ID so we can update it when the game completes
        if (loadResult.assessmentId) {
          setCurrentAssessmentId(loadResult.assessmentId);
        }
      } else {
        console.log('📝 No story found');
      }
    } catch (error) {
      console.error('❌ Failed to load story:', error);
    }
  };

  // Generate NEW story and save to DB
  const generateAndSaveStory = async () => {
    if (!user?.id) {
      alert('Please sign in to generate a story');
      return;
    }

    setIsLoadingStory(true);
    
    try {
      console.log('📝 Generating new 5-chapter story...');
      
      const userProfile: UserStoryProfile = {
        userId: user.id,
        name: (`${user?.user_metadata?.first_name || ''} ${user?.user_metadata?.last_name || ''}`.trim() || 'Professional'),
        position: user?.user_metadata?.position || 'Career Professional',
        skills: ['Communication', 'Problem Solving', 'Teamwork'],
        careerGoals: ['Professional Growth', 'Career Advancement'],
        currentEmployer: user?.user_metadata?.company || '',
        workStatus: user?.user_metadata?.work_status || 'professional',
        location: user?.user_metadata?.location || 'Global',
      };

      const gameProgress: GameProgressData = {
        currentChapter: 1,
        difficulty: currentDifficulty,
        currentWPM: 0,
        accuracy: 0,
        completedStories: 0,
        totalWordsTyped: 0,
        averageSessionTime: 0,
        strongWordTypes: [],
        weakWordTypes: [],
      };

      const story = await storyGenerator.generateCompleteStory(userProfile, gameProgress);
      
      // SAVE TO DB IMMEDIATELY
      console.log('💾 Saving story to database...');
      const saveResponse = await fetch('/api/games/typing-hero/save-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          story: story,
        }),
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        console.error('❌ API Error:', errorData);
        throw new Error(`Failed to save story: ${errorData.error || 'Unknown error'}`);
      }

      const saveResult = await saveResponse.json();
      console.log('✅ Story saved to DB');
      setCompleteStory(story);
      // Store the assessment ID so we can update it when the game completes
      if (saveResult.data?.id) {
        setCurrentAssessmentId(saveResult.data.id);
      }
      setIsLoadingStory(false);
      alert('✅ Story generated and saved! You can now play the game.');
      
    } catch (error) {
      console.error('❌ Story generation/save failed:', error);
      setIsLoadingStory(false);
      alert('Failed to generate story. Please try again.');
    }
  };

  // Start the game (story must already be loaded)
  const startGame = async () => {
    console.log('🎮 Starting game...');
    
    if (!completeStory || !completeStory.chapters || completeStory.chapters.length === 0) {
      alert('Please generate your story first!');
      return;
    }

    setGameState('loading');

    // Get sentences from current chapter
    const chapter = completeStory.chapters[currentChapter - 1];
    const sentences = chapter.sentences?.map((s: any) => s.text) || [];

    console.log('📖 Chapter loaded:', {
      chapter: currentChapter,
      sentenceCount: sentences.length,
    });

    if (sentences.length === 0) {
      console.error('❌ No sentences in chapter');
      alert('No sentences found in story chapter.');
      setGameState('menu');
      return;
    }

    // Start music
    playMusic();
    
    // Set state to 'playing' FIRST to render the game container
    setGameState('playing');
  };

  // Handle game complete
  const handleGameComplete = async (stats: GameStats) => {
    console.log('🎉 Game complete!', stats);
    setGameResults(stats);
    setGameState('complete');
    stopMusic();

    // Save session to database
    await saveSession(stats);
  };

  // Handle game pause
  const handleGamePause = () => {
    console.log('⏸️ Game paused');
  };

  // Handle word typed
  const handleWordTyped = (word: string, correct: boolean) => {
    // Could add sound effects here
  };

  // Save session to database
  const saveSession = async (stats: GameStats) => {
    if (!user?.id) {
      console.log('⚠️ Anonymous user, not saving session');
      return;
    }

    try {
      const response = await fetch('/api/games/typing-hero/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          assessment_id: currentAssessmentId, // Pass the ID to update existing record
          score: stats.score,
          wpm: stats.wpm,
          longest_streak: stats.longestStreak,
          correct_words: stats.correctWords,
          wrong_words: stats.totalWords - stats.correctWords,
          elapsed_time: stats.elapsedTime,
          overall_accuracy: stats.accuracy,
          words_correct: stats.wordsCorrect,
          words_incorrect: stats.wordsIncorrect,
          difficulty_level: currentDifficulty,
          generated_story: completeStory ? JSON.stringify(completeStory) : null,
        }),
      });

      if (response.ok) {
        console.log('✅ Session saved successfully');
      } else {
        console.error('❌ Failed to save session');
      }
    } catch (error) {
      console.error('❌ Error saving session:', error);
    }
  };

  // Music controls
  const playMusic = () => {
    if (!musicRef.current && !isMuted) {
      const audio = new Audio(`/typing hero songs/${musicGender}.mp3`);
      audio.loop = true;
      audio.volume = 0.6;
      audio.play().catch(err => console.log('Music autoplay blocked'));
      musicRef.current = audio;
    }
  };

  const stopMusic = () => {
    if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current = null;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (musicRef.current) {
      musicRef.current.volume = isMuted ? 0.6 : 0;
    }
  };

  // Play again
  const playAgain = () => {
    if (gameRef.current) {
      gameRef.current.destroy(true);
      gameRef.current = null;
    }
    setGameResults(null);
    setGameState('menu');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push('/candidate/dashboard')}
            className="text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <Button
            variant="ghost"
            onClick={toggleMute}
            className="text-white"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <AnimatePresence>
          {/* MENU STATE */}
          {gameState === 'menu' && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="text-center mb-8">
                <h1 className="text-6xl font-bold text-white mb-4">
                  🎮 Typing Hero
                </h1>
                <p className="text-xl text-gray-300">
                  Type your way to success with personalized career stories
                </p>
              </div>

              {/* Difficulty Selection */}
              <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-6">
                <CardHeader>
                  <CardTitle className="text-white">Choose Your Difficulty</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(Object.keys(DIFFICULTY_CONFIG) as DifficultyLevel[]).map((difficulty) => {
                    const config = DIFFICULTY_CONFIG[difficulty];
                    const isSelected = currentDifficulty === difficulty;
                    
                    return (
                      <Button
                        key={difficulty}
                        variant={isSelected ? 'default' : 'outline'}
                        onClick={() => setCurrentDifficulty(difficulty)}
                        className={`w-full h-20 ${
                          isSelected 
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' 
                            : 'bg-white/5 text-white border-white/20 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="text-left">
                            <div className="font-bold text-lg">{config.displayName}</div>
                            <div className="text-sm opacity-70">{config.description}</div>
                          </div>
                          <div className="text-xs opacity-80 bg-black/20 rounded px-2 py-1">
                            Speed: {config.speed} • {config.spawnRate}
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Music Selection */}
              <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-6">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Guitar className="w-5 h-5" />
                    Choose Your Vibe
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex gap-4">
                  <Button
                    variant={musicGender === 'male' ? 'default' : 'outline'}
                    onClick={() => setMusicGender('male')}
                    className={`flex-1 ${
                      musicGender === 'male' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white/5 text-white border-white/20'
                    }`}
                  >
                    🎤 Male Vocals
                  </Button>
                  <Button
                    variant={musicGender === 'female' ? 'default' : 'outline'}
                    onClick={() => setMusicGender('female')}
                    className={`flex-1 ${
                      musicGender === 'female' 
                        ? 'bg-pink-600 text-white' 
                        : 'bg-white/5 text-white border-white/20'
                    }`}
                  >
                    🎤 Female Vocals
                  </Button>
                </CardContent>
              </Card>

              {/* Story Status & Actions */}
              {!completeStory ? (
                /* NO STORY - Show Generate Button */
                <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-6">
                  <CardContent className="pt-6">
                    <div className="text-center mb-4">
                      <p className="text-gray-300 mb-2">🎯 First, generate your personalized typing story</p>
                      <p className="text-sm text-gray-400">This creates a unique 5-chapter adventure based on your profile</p>
                    </div>
                    <Button
                      size="lg"
                      onClick={generateAndSaveStory}
                      disabled={isLoadingStory}
                      className="w-full h-16 text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                    >
                      {isLoadingStory ? (
                        <>
                          <Sparkles className="w-6 h-6 mr-2 animate-spin" />
                          Generating Your Story...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-6 h-6 mr-2" />
                          Generate Your Story
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                /* HAS STORY - Show Play Button */
                <>
                  <Card className="bg-green-500/10 backdrop-blur-md border-green-500/30 mb-4">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-center gap-2 text-green-400">
                        <CheckCircle className="w-5 h-5" />
                        <p className="font-semibold">Story Ready: {completeStory.title}</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Button
                    size="lg"
                    onClick={startGame}
                    disabled={isLoadingStory}
                    className="w-full h-16 text-xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  >
                    <Play className="w-6 h-6 mr-2" />
                    Start Typing Challenge
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateAndSaveStory}
                    disabled={isLoadingStory}
                    className="w-full mt-3 text-sm text-gray-400 border-gray-600 hover:bg-white/5"
                  >
                    Regenerate Story
                  </Button>
                </>
              )}
            </motion.div>
          )}

          {/* LOADING STATE */}
          {gameState === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center h-96"
            >
              <div className="text-center">
                <Sparkles className="w-16 h-16 text-cyan-500 animate-spin mx-auto mb-4" />
                <p className="text-2xl text-white">Get Ready...</p>
              </div>
            </motion.div>
          )}

          {/* PLAYING STATE */}
          {gameState === 'playing' && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center"
            >
              <div 
                id="game-container" 
                ref={gameContainerRef}
                className="rounded-lg overflow-hidden shadow-2xl"
              />
            </motion.div>
          )}

          {/* COMPLETE STATE */}
          {gameState === 'complete' && gameResults && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white text-center text-4xl flex items-center justify-center gap-3">
                    <Trophy className="w-10 h-10 text-yellow-500" />
                    Chapter Complete!
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-lg p-4 text-center">
                      <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                      <div className="text-3xl font-bold text-white">{gameResults.wpm.toFixed(0)}</div>
                      <div className="text-sm text-gray-300">Words Per Minute</div>
                    </div>
                    
                    <div className="bg-white/5 rounded-lg p-4 text-center">
                      <Target className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <div className="text-3xl font-bold text-white">{gameResults.accuracy.toFixed(1)}%</div>
                      <div className="text-sm text-gray-300">Accuracy</div>
                    </div>
                    
                    <div className="bg-white/5 rounded-lg p-4 text-center">
                      <Trophy className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                      <div className="text-3xl font-bold text-white">{gameResults.score}</div>
                      <div className="text-sm text-gray-300">Score</div>
                    </div>
                    
                    <div className="bg-white/5 rounded-lg p-4 text-center">
                      <Sparkles className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                      <div className="text-3xl font-bold text-white">{gameResults.longestStreak}</div>
                      <div className="text-sm text-gray-300">Best Streak</div>
                    </div>
                  </div>

                  {/* Performance Badge */}
                  <div className="text-center">
                    <Badge className="text-lg px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600">
                      {gameResults.wpm >= 80 ? '🏆 Expert' : 
                       gameResults.wpm >= 60 ? '⭐ Advanced' : 
                       gameResults.wpm >= 40 ? '🎯 Intermediate' : 
                       '🌱 Developing'}
                    </Badge>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      onClick={playAgain}
                      className="flex-1 bg-white/5 text-white border-white/20"
                    >
                      Play Again
                    </Button>
                    <Button
                      onClick={() => router.push('/candidate/dashboard')}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600"
                    >
                      Back to Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
