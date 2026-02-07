import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/shared/ui/card';
import { Button } from '@/components/shared/ui/button';
import { cn } from '@/lib/utils';
import { CONTEXT_ICONS, CONTEXT_COLORS, ANIMAL_PERSONALITIES } from '@/data/discConstants';

interface QuestionCardProps {
  scenario: any;
  onOptionSelect: (id: string, disc: string, reaction: string) => void;
  selectedOption: string | null;
  disabled: boolean;
}

export function QuestionCard({ scenario, onOptionSelect, selectedOption, disabled }: QuestionCardProps) {
  // Defensive checks
  if (!scenario || !scenario.context) {
    console.error('QuestionCard: Invalid scenario', scenario);
    return null;
  }

  // Get context styles with fallbacks
  const contextTheme = CONTEXT_COLORS[scenario.context as keyof typeof CONTEXT_COLORS] || CONTEXT_COLORS.WORK;
  const ContextIcon = (CONTEXT_ICONS && CONTEXT_ICONS[scenario.context as keyof typeof CONTEXT_ICONS]) || CONTEXT_ICONS?.WORK;

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Scenario Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Card className={cn(
          "modern-glass overflow-hidden border-t-4",
          contextTheme.border,
          `border-t-${contextTheme.primary}-500`
        )}>
          <div className={cn("p-6 backdrop-blur-xl", contextTheme.bg)}>
            <div className="flex items-center gap-3 mb-4">
              <div className={cn("p-2 rounded-lg", contextTheme.containerBg)}>
                {ContextIcon && <ContextIcon className={cn("w-6 h-6", contextTheme.text)} />}
              </div>
              <span className={cn("text-sm font-bold tracking-wider", contextTheme.text)}>
                {scenario.context} SCENARIO
              </span>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              {scenario.title}
            </h2>
            
            <p className="text-lg text-gray-200 leading-relaxed">
              {scenario.scenario}
            </p>
          </div>
        </Card>
      </motion.div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scenario.options?.map((option: any, index: number) => {
          const animal = ANIMAL_PERSONALITIES[option.disc as keyof typeof ANIMAL_PERSONALITIES];
          const isSelected = selectedOption === option.id;
          const isOtherSelected = selectedOption !== null && !isSelected;

          if (!animal) {
            console.error('QuestionCard: Invalid animal for disc type', option.disc);
            return null;
          }

          return (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <button
                onClick={() => onOptionSelect(option.id, option.disc, option.reaction)}
                disabled={disabled}
                className={cn(
                  "relative w-full h-full text-left p-6 rounded-xl transition-all duration-300 border",
                  "hover:scale-[1.02] active:scale-[0.98]",
                  isSelected 
                    ? `bg-gradient-to-r ${animal.color} border-transparent shadow-lg shadow-${animal.color}/20` 
                    : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20",
                  isOtherSelected && "opacity-50 blur-[1px]",
                  disabled && "cursor-not-allowed"
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border",
                    isSelected ? "bg-white text-black border-transparent" : "bg-white/10 border-white/20 text-white"
                  )}>
                    {option.id}
                  </div>
                  <div>
                    <p className={cn(
                      "text-lg font-medium mb-1",
                      isSelected ? "text-white" : "text-gray-200"
                    )}>
                      {option.text}
                    </p>
                  </div>
                </div>
                
                {isSelected && (
                  <motion.div
                    layoutId="selection-glow"
                    className="absolute inset-0 rounded-xl bg-white/20 blur-xl -z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  />
                )}
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}











