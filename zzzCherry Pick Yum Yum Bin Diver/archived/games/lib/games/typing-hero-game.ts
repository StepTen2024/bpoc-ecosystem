/**
 * Typing Hero - Phaser.js Game Engine
 * Clean, performant, 60 FPS typing game
 */

import * as Phaser from 'phaser';

// Game configuration types
export interface GameConfig {
  difficulty: 'rookie' | 'rockstar' | 'virtuoso' | 'legend';
  sentences: string[];
  onComplete: (stats: GameStats) => void;
  onPause: () => void;
  onWordTyped: (word: string, correct: boolean) => void;
}

export interface GameStats {
  wpm: number;
  accuracy: number;
  score: number;
  correctWords: number;
  totalWords: number;
  longestStreak: number;
  elapsedTime: number;
  fires: number;
  poos: number;
  wordsCorrect: string[];
  wordsIncorrect: string[];
}

interface FallingWord extends Phaser.GameObjects.Container {
  word: string;
  wordText?: Phaser.GameObjects.Text;
  isTyped?: boolean;
  isMissed?: boolean;
}

// Difficulty settings
const DIFFICULTY_CONFIG = {
  rookie: { speed: 30, spawnRate: 3500, lanes: 3 },
  rockstar: { speed: 50, spawnRate: 2500, lanes: 4 },
  virtuoso: { speed: 80, spawnRate: 1800, lanes: 5 },
  legend: { speed: 120, spawnRate: 1200, lanes: 6 },
};

export class TypingHeroGame extends Phaser.Scene {
  // Game config
  private config!: GameConfig;
  private difficultyConfig!: typeof DIFFICULTY_CONFIG.rookie;

  // Game state
  private sentences: string[] = [];
  private currentSentenceIndex = 0;
  private currentWordInSentence = 0;
  private currentSentenceWords: string[] = [];
  private fallingWords: FallingWord[] = [];
  private currentInput = '';
  private canStartNextSentence = true;
  
  // Stats tracking
  private stats: GameStats = {
    wpm: 0,
    accuracy: 0,
    score: 0,
    correctWords: 0,
    totalWords: 0,
    longestStreak: 0,
    elapsedTime: 0,
    fires: 0,
    poos: 0,
    wordsCorrect: [],
    wordsIncorrect: [],
  };
  
  private currentStreak = 0;
  private startTime = 0;
  private totalCharsTyped = 0;
  
  // UI elements
  private inputDisplay!: Phaser.GameObjects.Text;
  private statsDisplay!: Phaser.GameObjects.Text;
  private backgroundGradient!: Phaser.GameObjects.Graphics;
  
  // Timers
  private spawnTimer?: Phaser.Time.TimerEvent;
  private gameTimer?: Phaser.Time.TimerEvent;

  constructor() {
    super({ key: 'TypingHeroGame' });
  }

  init(data: GameConfig) {
    this.config = data;
    this.difficultyConfig = DIFFICULTY_CONFIG[data.difficulty];
    
    // Store sentences (don't flatten into words yet)
    this.sentences = data.sentences.filter(s => s.trim().length > 0);
    this.currentSentenceIndex = 0;
    this.currentWordInSentence = 0;
    
    // Parse first sentence into words
    if (this.sentences.length > 0) {
      this.currentSentenceWords = this.sentences[0]
        .split(' ')
        .filter(w => w.trim().length > 0);
    }
    
    this.fallingWords = [];
    this.currentInput = '';
    this.currentStreak = 0;
    this.canStartNextSentence = true;
    this.startTime = Date.now();
    this.totalCharsTyped = 0;
    
    // Reset stats
    this.stats = {
      wpm: 0,
      accuracy: 0,
      score: 0,
      correctWords: 0,
      totalWords: 0,
      longestStreak: 0,
      elapsedTime: 0,
      fires: 0,
      poos: 0,
      wordsCorrect: [],
      wordsIncorrect: [],
    };
  }

  create() {
    const { width, height } = this.cameras.main;

    // Create gradient background
    this.createBackground();

    // Create UI
    this.createUI();

    // Start spawning words
    this.startWordSpawner();

    // Update game timer
    this.gameTimer = this.time.addEvent({
      delay: 100,
      callback: this.updateGameTime,
      callbackScope: this,
      loop: true,
    });

    // Listen for keyboard input
    this.input.keyboard?.on('keydown', this.handleKeyPress, this);
  }

  private createBackground() {
    const { width, height } = this.cameras.main;
    
    // Animated gradient background
    this.backgroundGradient = this.add.graphics();
    this.updateBackground();
    
    // Animate background
    this.tweens.addCounter({
      from: 0,
      to: 360,
      duration: 20000,
      repeat: -1,
      onUpdate: () => this.updateBackground(),
    });
  }

  private updateBackground() {
    const { width, height } = this.cameras.main;
    this.backgroundGradient.clear();
    
    // Animated gradient (dark theme)
    this.backgroundGradient.fillGradientStyle(
      0x0f172a, 0x1e293b, 0x1e293b, 0x0f172a, 1
    );
    this.backgroundGradient.fillRect(0, 0, width, height);
  }

  private createUI() {
    const { width, height } = this.cameras.main;

    // Input display at bottom
    this.inputDisplay = this.add.text(width / 2, height - 80, '', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'monospace',
      backgroundColor: '#1e293b',
      padding: { x: 20, y: 10 },
    });
    this.inputDisplay.setOrigin(0.5);

    // Stats display at top
    this.statsDisplay = this.add.text(20, 20, '', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'Arial',
    });
    this.updateStatsDisplay();
  }

  private startWordSpawner() {
    this.spawnTimer = this.time.addEvent({
      delay: this.difficultyConfig.spawnRate,
      callback: this.spawnWord,
      callbackScope: this,
      loop: true,
    });

    // Spawn first word immediately
    this.spawnWord();
  }

  private spawnWord() {
    // Check if we can spawn from current sentence
    if (!this.canStartNextSentence) {
      console.log('⏳ Waiting for current sentence to complete...');
      return;
    }

    // Check if we've completed all sentences
    if (this.currentSentenceIndex >= this.sentences.length) {
      console.log('🎉 All sentences completed!');
      this.endGame();
      return;
    }

    // Check if current sentence is fully spawned
    if (this.currentWordInSentence >= this.currentSentenceWords.length) {
      console.log('📝 All words from sentence spawned, waiting for completion...');
      this.canStartNextSentence = false;
      return;
    }

    const { width, height } = this.cameras.main;
    const word = this.currentSentenceWords[this.currentWordInSentence];
    
    // LEFT TO RIGHT lane assignment based on word position in sentence
    const lane = this.currentWordInSentence % this.difficultyConfig.lanes;
    const x = (width / (this.difficultyConfig.lanes + 1)) * (lane + 1);
    
    console.log(`🎯 Spawning word "${word}" in lane ${lane} (word ${this.currentWordInSentence + 1}/${this.currentSentenceWords.length})`);
    
    // Create word container
    const wordContainer = this.add.container(x, 0) as FallingWord;
    wordContainer.word = word;
    
    // Word text with glow effect
    const wordText = this.add.text(0, 0, word, {
      fontSize: '28px',
      color: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#00ffff',
      strokeThickness: 2,
    });
    wordText.setOrigin(0.5);
    wordContainer.add(wordText);
    wordContainer.wordText = wordText;
    
    // Add to tracking
    this.fallingWords.push(wordContainer);
    
    // Advance to next word
    this.currentWordInSentence++;
    this.stats.totalWords++;
    
    // Animate word falling
    this.tweens.add({
      targets: wordContainer,
      y: height + 50,
      duration: (height / this.difficultyConfig.speed) * 1000,
      ease: 'Linear',
      onComplete: () => this.onWordMissed(wordContainer),
    });
  }

  private handleKeyPress(event: KeyboardEvent) {
    const key = event.key;

    // Handle backspace
    if (key === 'Backspace') {
      this.currentInput = this.currentInput.slice(0, -1);
      this.updateInputDisplay();
      return;
    }

    // Handle space (word complete)
    if (key === ' ') {
      this.checkWord();
      return;
    }

    // Handle letter keys
    if (key.length === 1 && /^[a-zA-Z0-9.,!?-]$/.test(key)) {
      this.currentInput += key.toLowerCase();
      this.totalCharsTyped++;
      this.updateInputDisplay();
    }
  }

  private checkWord() {
    if (this.currentInput.trim() === '') return;

    const typed = this.currentInput.trim().toLowerCase();
    this.currentInput = '';
    this.updateInputDisplay();

    // Find matching word
    const matchingWord = this.fallingWords.find(
      w => !w.isTyped && !w.isMissed && w.word.toLowerCase() === typed
    );

    if (matchingWord) {
      this.onWordTyped(matchingWord, true);
    } else {
      // Wrong word typed
      this.stats.wordsIncorrect.push(typed);
      this.stats.totalWords++;
      this.stats.poos++;
      this.currentStreak = 0;
      this.config.onWordTyped(typed, false);
      
      // Flash red
      this.cameras.main.flash(100, 255, 0, 0, false);
    }
    
    this.updateStats();
  }

  private onWordTyped(wordObj: FallingWord, correct: boolean) {
    wordObj.isTyped = true;
    
    // Update stats
    this.stats.correctWords++;
    this.stats.fires++;
    this.stats.wordsCorrect.push(wordObj.word);
    this.currentStreak++;
    
    if (this.currentStreak > this.stats.longestStreak) {
      this.stats.longestStreak = this.currentStreak;
    }

    // Calculate score bonus
    const bonus = Math.floor(this.currentStreak * 10);
    this.stats.score += 100 + bonus;

    // Notify React
    this.config.onWordTyped(wordObj.word, true);

    // Visual effects - explosion particles
    this.createWordExplosion(wordObj.x, wordObj.y);

    // Remove word
    this.tweens.killTweensOf(wordObj);
    wordObj.destroy();
    
    const index = this.fallingWords.indexOf(wordObj);
    if (index > -1) {
      this.fallingWords.splice(index, 1);
    }

    this.updateStats();
    this.checkSentenceComplete();
  }

  private checkSentenceComplete() {
    // Check if all words from current sentence are typed or missed
    if (!this.canStartNextSentence && this.fallingWords.length === 0) {
      console.log(`✅ Sentence ${this.currentSentenceIndex + 1} completed!`);
      
      // Move to next sentence
      this.currentSentenceIndex++;
      this.currentWordInSentence = 0;
      
      if (this.currentSentenceIndex < this.sentences.length) {
        // Parse next sentence into words
        this.currentSentenceWords = this.sentences[this.currentSentenceIndex]
          .split(' ')
          .filter(w => w.trim().length > 0);
        this.canStartNextSentence = true;
        console.log(`📖 Starting sentence ${this.currentSentenceIndex + 1}/${this.sentences.length}`);
      } else {
        console.log('🎉 All sentences complete!');
      }
    }
  }

  private onWordMissed(wordObj: FallingWord) {
    if (wordObj.isTyped || wordObj.isMissed) return;
    
    wordObj.isMissed = true;
    this.stats.poos++;
    this.stats.wordsIncorrect.push(wordObj.word);
    this.currentStreak = 0;
    
    // Flash screen
    this.cameras.main.shake(100, 0.005);
    
    // Remove word
    wordObj.destroy();
    const index = this.fallingWords.indexOf(wordObj);
    if (index > -1) {
      this.fallingWords.splice(index, 1);
    }
    
    this.updateStats();
    this.checkSentenceComplete();
  }

  private createWordExplosion(x: number, y: number) {
    // Create simple circle particles for explosion effect
    for (let i = 0; i < 15; i++) {
      const angle = (Math.PI * 2 * i) / 15;
      const speed = Phaser.Math.Between(100, 200);
      
      const particle = this.add.circle(x, y, 5, 0x00ffff);
      
      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed,
        alpha: 0,
        scale: 0,
        duration: 500,
        ease: 'Cubic.easeOut',
        onComplete: () => particle.destroy(),
      });
    }
  }

  private updateInputDisplay() {
    this.inputDisplay.setText(this.currentInput || '|');
  }

  private updateStatsDisplay() {
    const text = `WPM: ${this.stats.wpm.toFixed(0)} | Accuracy: ${this.stats.accuracy.toFixed(1)}% | Score: ${this.stats.score} | Streak: ${this.currentStreak} 🔥`;
    this.statsDisplay.setText(text);
  }

  private updateGameTime() {
    this.stats.elapsedTime = (Date.now() - this.startTime) / 1000;
    this.updateStats();
  }

  private updateStats() {
    // Calculate WPM
    const minutes = this.stats.elapsedTime / 60;
    this.stats.wpm = minutes > 0 ? this.stats.correctWords / minutes : 0;
    
    // Calculate accuracy
    this.stats.accuracy = this.stats.totalWords > 0
      ? (this.stats.correctWords / this.stats.totalWords) * 100
      : 100;
    
    this.updateStatsDisplay();
  }

  private endGame() {
    // Stop spawning
    this.spawnTimer?.destroy();
    this.gameTimer?.destroy();
    
    // Final stats update
    this.updateStats();
    
    // Notify React
    this.config.onComplete(this.stats);
    
    // Cleanup
    this.scene.pause();
  }

  public pauseGame() {
    this.scene.pause();
    this.config.onPause();
  }

  public resumeGame() {
    this.scene.resume();
  }

  public cleanup() {
    this.spawnTimer?.destroy();
    this.gameTimer?.destroy();
    this.input.keyboard?.off('keydown', this.handleKeyPress, this);
  }
}

// Phaser game configuration
export function createGame(containerId: string, config: GameConfig): Phaser.Game {
  // Create a scene class that holds the config via closure
  class ConfiguredTypingHeroGame extends TypingHeroGame {
    constructor() {
      super();
    }

    init(data?: any) {
      // Use config from closure
      super.init(config);
    }
  }

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: containerId,
    width: 1200,
    height: 800,
    backgroundColor: '#0f172a',
    physics: {
      default: 'arcade',
    },
    scene: ConfiguredTypingHeroGame,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
  });

  return game;
}
