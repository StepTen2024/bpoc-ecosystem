'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/shared/ui/card';
import { Pencil, Loader2, RefreshCw, Edit3, Check, X, ArrowLeft, ArrowRight, AlertTriangle } from 'lucide-react';
import { StageProps } from '../types';

interface WriteStageProps extends StageProps {
  setStage: (stage: number) => void;
  onEditArticle: (content: string, type: string) => void;
}

export default function WriteStage({
  state,
  updateState,
  loading,
  setLoading,
  toast,
  savePipelineProgress,
  saveProgress,
  setStage,
  onEditArticle
}: WriteStageProps) {
  const [writeProgress, setWriteProgress] = useState(0);
  const [writeStatus, setWriteStatus] = useState('');
  const [writeElapsed, setWriteElapsed] = useState(0);
  const [writeTimerActive, setWriteTimerActive] = useState(false);
  const writeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [wordCountWarning, setWordCountWarning] = useState<string | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [previousArticle, setPreviousArticle] = useState<{ content: string; wordCount: number } | null>(null);
  const [newArticle, setNewArticle] = useState<{ content: string; wordCount: number } | null>(null);

  const writeArticle = async (isRedo = false) => {
    // If redo, save current article for comparison
    if (isRedo && state.article) {
      setPreviousArticle({ content: state.article, wordCount: state.wordCount || 0 });
      setNewArticle(null);
    }

    setWriteProgress(5);
    setWriteStatus('Starting article writing...');
    setLoading(true);
    setIsComparing(false);
    setWordCountWarning(null);

    // Start elapsed time counter
    setWriteElapsed(0);
    setWriteTimerActive(true);
    const startTime = Date.now();
    writeTimerRef.current = setInterval(() => {
      setWriteElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    const progressSteps = [
      { progress: 10, status: 'Loading Ate Yna personality...' },
      { progress: 20, status: 'Analyzing article structure...' },
      { progress: 35, status: 'Writing introduction...' },
      { progress: 50, status: 'Writing main sections...' },
      { progress: 65, status: 'Adding Filipino context...' },
      { progress: 75, status: 'Creating FAQ section...' },
      { progress: 85, status: 'Writing conclusion...' },
    ];

    let currentStep = 0;
    const progressInterval = setInterval(() => {
      if (currentStep < progressSteps.length) {
        setWriteProgress(progressSteps[currentStep].progress);
        setWriteStatus(progressSteps[currentStep].status);
        currentStep++;
      }
    }, 2500);

    try {
      const res = await fetch('/api/admin/insights/pipeline/write-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: state.plan,
          research: state.researchData,
          idea: state.selectedIdea,
          originalBrief: state.transcript,
          insightId: state.insightId,
          pipelineId: state.pipelineId,
        })
      });

      clearInterval(progressInterval);
      if (writeTimerRef.current) { clearInterval(writeTimerRef.current); writeTimerRef.current = null; }
      setWriteTimerActive(false);
      setWriteProgress(95);
      setWriteStatus('Finalizing article...');

      const result = await res.json();

      // Capture word count warning from API response
      if (result.wordCountWarning) {
        setWordCountWarning(result.wordCountWarning);
      }

      if (result.success) {
        setWriteProgress(100);
        setWriteStatus('Article complete!');
        await new Promise(resolve => setTimeout(resolve, 400));

        // If redo, show comparison instead of directly updating
        if (isRedo && previousArticle) {
          setNewArticle({ content: result.article, wordCount: result.wordCount });
          setIsComparing(true);
        } else {
          // First time - directly update state
          updateState({ article: result.article, wordCount: result.wordCount });

          if (state.pipelineId) {
            savePipelineProgress(state.pipelineId, 5, {
              rawArticle: result.article,
              wordCount: result.wordCount,
            }, { action: 'article_written', model: 'claude-sonnet-4', wordCount: result.wordCount })
              .catch(err => console.error('Pipeline save error:', err));
          }

          if (state.insightId) {
            saveProgress(state.insightId, {
              content: result.article,
              generation_metadata: {
                ...state.plan,
                article_written_at: new Date().toISOString(),
                word_count: result.wordCount,
              }
            }, 'writing')
              .catch(err => console.error('Save error:', err));
          }
        }

        toast({ title: isRedo ? 'New version generated!' : 'Article written!', description: `${result.wordCount} words` });
      } else {
        toast({ title: 'Error', description: result.error || 'Writing failed', variant: 'destructive' });
      }
    } catch (err: any) {
      clearInterval(progressInterval);
      if (writeTimerRef.current) { clearInterval(writeTimerRef.current); writeTimerRef.current = null; }
      setWriteTimerActive(false);
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
      setWriteProgress(0);
      setWriteStatus('');
    }
  };

  const useNewVersion = () => {
    if (newArticle) {
      updateState({ article: newArticle.content, wordCount: newArticle.wordCount });

      if (state.pipelineId) {
        savePipelineProgress(state.pipelineId, 5, {
          rawArticle: newArticle.content,
          wordCount: newArticle.wordCount,
        }, { action: 'article_written', model: 'claude-sonnet-4', wordCount: newArticle.wordCount })
          .catch(err => console.error('Pipeline save error:', err));
      }

      toast({ title: 'New version selected!', description: `${newArticle.wordCount} words` });
    }
    setIsComparing(false);
    setPreviousArticle(null);
    setNewArticle(null);
  };

  const keepOriginal = () => {
    setIsComparing(false);
    setPreviousArticle(null);
    setNewArticle(null);
    toast({ title: 'Kept original version' });
  };

  // Comparison View
  if (isComparing && previousArticle && newArticle) {
    return (
      <Card className="bg-green-500/10 border-green-500/20">
        <CardHeader>
          <CardTitle className="text-green-400 flex items-center gap-2">
            <Pencil className="w-6 h-6" /> Stage 4: Compare Versions
          </CardTitle>
          <CardDescription>Choose which version to keep</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mb-4">
            <Button onClick={keepOriginal} variant="outline" className="border-gray-500 hover:bg-gray-500/20">
              <ArrowLeft className="w-4 h-4 mr-2" /> Keep Original
            </Button>
            <Button onClick={useNewVersion} className="bg-green-600 hover:bg-green-700">
              Use New Version <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Comparison Cards */}
          <div className="grid grid-cols-2 gap-4">
            {/* Original */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm font-semibold">Original</span>
                <span className="text-gray-500 text-xs">{previousArticle.wordCount} words</span>
              </div>
              <div className="bg-white/5 rounded-lg border border-gray-600 p-3 max-h-[500px] overflow-y-auto">
                <div className="text-gray-300 text-xs whitespace-pre-wrap leading-relaxed">
                  {previousArticle.content.slice(0, 3000)}
                  {previousArticle.content.length > 3000 && '...'}
                </div>
              </div>
            </div>

            {/* New */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-green-400 text-sm font-semibold">New Version</span>
                <span className="text-green-500 text-xs">{newArticle.wordCount} words</span>
              </div>
              <div className="bg-green-500/5 rounded-lg border border-green-500/30 p-3 max-h-[500px] overflow-y-auto">
                <div className="text-gray-300 text-xs whitespace-pre-wrap leading-relaxed">
                  {newArticle.content.slice(0, 3000)}
                  {newArticle.content.length > 3000 && '...'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-green-500/10 border-green-500/20">
      <CardHeader>
        <CardTitle className="text-green-400 flex items-center gap-2">
          <Pencil className="w-6 h-6" /> Stage 4: Write Article
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          Claude writes with Ate Yna&apos;s warm, Filipino personality
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            state.isPillar
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              : 'bg-green-500/20 text-green-300 border border-green-500/30'
          }`}>
            Target: {state.isPillar ? '3000-4000' : '1800-2200'} words
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!state.article ? (
          (loading && writeProgress > 0) || writeStatus ? (
            <div className="space-y-3">
              <div className="bg-white/5 rounded-xl p-4 border border-green-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold text-sm">{writeStatus}</span>
                  <span className="text-green-400 font-bold text-sm">{writeProgress}%</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 rounded-full transition-all duration-500 ease-out relative"
                    style={{ width: `${writeProgress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                  </div>
                </div>
                {/* Elapsed time counter */}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <Pencil className="w-5 h-5 text-green-400 animate-pulse" />
                    <span className="text-gray-400 text-xs">Writing article with Ate Yna&apos;s voice...</span>
                  </div>
                  {writeTimerActive && (
                    <span className="text-2xl font-mono font-bold text-green-400">
                      {Math.floor(writeElapsed / 60)}:{String(writeElapsed % 60).padStart(2, '0')}
                    </span>
                  )}
                </div>

                {/* Expected duration + don't close warning */}
                <div className="mt-3 space-y-2">
                  <p className="text-gray-500 text-xs text-center">
                    ✍️ {state.isPillar ? 'Pillar articles' : 'Articles'} typically take 2-5 minutes to write
                  </p>
                  <div className="flex items-center justify-center gap-2 text-yellow-400/80 text-xs">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Please don&apos;t close this window while writing is in progress.</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Button onClick={() => writeArticle(false)} disabled={loading} className="w-full h-14 bg-green-600 hover:bg-green-700 text-lg">
              <Pencil className="w-5 h-5 mr-2" /> Write Article
            </Button>
          )
        ) : (
          // Show loading state when redoing
          (loading && writeProgress > 0) ? (
            <div className="space-y-3">
              <div className="bg-white/5 rounded-xl p-4 border border-green-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold text-sm">{writeStatus}</span>
                  <span className="text-green-400 font-bold text-sm">{writeProgress}%</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 rounded-full transition-all duration-500 ease-out relative"
                    style={{ width: `${writeProgress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-green-400 animate-spin" />
                    <span className="text-gray-400 text-xs">Regenerating article...</span>
                  </div>
                  {writeTimerActive && (
                    <span className="text-2xl font-mono font-bold text-green-400">
                      {Math.floor(writeElapsed / 60)}:{String(writeElapsed % 60).padStart(2, '0')}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-center mt-2 gap-2 text-yellow-400/80 text-xs">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Please don&apos;t close this window while writing is in progress.</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Word count warning from API */}
              {wordCountWarning && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                  <p className="text-yellow-400 text-sm">{wordCountWarning}</p>
                </div>
              )}

              {/* Write Complete Header */}
              {(() => {
                const minWords = state.isPillar ? 3000 : 1800;
                const maxWords = state.isPillar ? 4000 : 2200;
                const isWithinRange = state.wordCount >= minWords && state.wordCount <= maxWords;
                const isBelowMin = state.wordCount < minWords;

                return (
                  <div className={`rounded-lg p-3 flex items-center justify-between ${
                    isWithinRange
                      ? 'bg-green-500/10 border border-green-500/30'
                      : isBelowMin
                        ? 'bg-yellow-500/10 border border-yellow-500/30'
                        : 'bg-orange-500/10 border border-orange-500/30'
                  }`}>
                    <div>
                      <p className={`font-semibold ${
                        isWithinRange ? 'text-green-400' : isBelowMin ? 'text-yellow-400' : 'text-orange-400'
                      }`}>
                        Article Written {isWithinRange ? '✓' : isBelowMin ? '(Below target)' : '(Above target)'}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {state.wordCount} words
                        <span className="text-gray-500 ml-1">
                          (target: {minWords}-{maxWords})
                        </span>
                        {' '}- Ate Yna voice
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => onEditArticle(state.article, 'article')}
                        size="sm"
                        className="h-8 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/10"
                      >
                        <Edit3 className="w-3 h-3 mr-1" /> Edit
                      </Button>
                      <Button onClick={() => writeArticle(true)} variant="outline" disabled={loading} size="sm" className="h-8">
                        <RefreshCw className="w-3 h-3 mr-1" /> Redo
                      </Button>
                    </div>
                  </div>
                );
              })()}

              {/* Article Preview */}
              <div className="bg-white/5 rounded-lg border border-white/10 p-4 max-h-[400px] overflow-y-auto">
                <div className="prose prose-invert prose-sm max-w-none">
                  <div className="text-white text-sm whitespace-pre-wrap leading-relaxed">
                    {state.article}
                  </div>
                </div>
              </div>
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
}
