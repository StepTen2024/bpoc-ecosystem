import React from 'react';
import { motion } from 'framer-motion';

export function SpiritReveal({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl">
      <div className="relative text-center">
        {/* Animated Rings */}
        <div className="absolute inset-0 flex items-center justify-center">
            <motion.div 
                className="w-64 h-64 border-4 border-cyber-blue/30 rounded-full"
                animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
                className="absolute w-48 h-48 border-4 border-electric-purple/30 rounded-full"
                animate={{ rotate: -360, scale: [1, 0.9, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10"
        >
          <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 mb-4">
            COMPILING
          </h2>
          <p className="font-mono text-cyber-blue animate-pulse">
            ANALYZING_NEURAL_PATTERNS...
          </p>
        </motion.div>
      </div>
    </div>
  );
}











