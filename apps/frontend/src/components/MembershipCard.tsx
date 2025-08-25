'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '@/lib/api';

interface MembershipCardProps {
  user: User;
  agencyCode: string;
  onComplete: () => void;
}

const titles = ['Closing Machine', 'Sales Master', 'Money Maker'];

export default function MembershipCard({ user, agencyCode, onComplete }: MembershipCardProps) {
  const [currentTitleIndex, setCurrentTitleIndex] = useState(0);
  const [showCard, setShowCard] = useState(true);

  useEffect(() => {
    // Rotate titles every 1.3 seconds
    const titleInterval = setInterval(() => {
      setCurrentTitleIndex((prev) => (prev + 1) % titles.length);
    }, 1300);

    // Hide card after 4 seconds
    const hideTimer = setTimeout(() => {
      setShowCard(false);
      setTimeout(onComplete, 600); // Wait for animation to complete
    }, 4000);

    return () => {
      clearInterval(titleInterval);
      clearTimeout(hideTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {showCard && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ 
              opacity: 0, 
              rotateY: -90, 
              scale: 0.8,
              z: -100
            }}
            animate={{ 
              opacity: 1, 
              rotateY: 0, 
              scale: 1,
              z: 0
            }}
            exit={{ 
              opacity: 0, 
              rotateY: 90, 
              scale: 0.8,
              z: -100
            }}
            transition={{ 
              duration: 0.6, 
              ease: "easeOut",
              type: "spring",
              stiffness: 100
            }}
            style={{ 
              perspective: 1000,
              transformStyle: 'preserve-3d'
            }}
            className="relative"
          >
            {/* Card */}
            <div className="w-80 h-48 glass-panel p-6 relative overflow-hidden group">
              {/* Background glow */}
              <div className="absolute inset-0 bg-neon-gradient opacity-10 blur-xl"></div>
              
              {/* Content */}
              <div className="relative z-10 h-full flex flex-col justify-between">
                {/* Header */}
                <div className="text-center">
                  <motion.h2 
                    className="text-xl font-bold text-text-primary mb-2"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    Welcome Back
                  </motion.h2>
                  <motion.p 
                    className="text-text-secondary text-sm"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {user.name || user.email}
                  </motion.p>
                </div>

                {/* Rotating Title */}
                <div className="text-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentTitleIndex}
                      initial={{ y: 20, opacity: 0, rotateX: -90 }}
                      animate={{ y: 0, opacity: 1, rotateX: 0 }}
                      exit={{ y: -20, opacity: 0, rotateX: 90 }}
                      transition={{ duration: 0.4 }}
                      className="text-2xl font-bold bg-neon-gradient bg-clip-text text-transparent"
                    >
                      {titles[currentTitleIndex]}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="text-center">
                  <motion.p 
                    className="text-text-secondary text-xs"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    Agency: {agencyCode}
                  </motion.p>
                </div>
              </div>

              {/* Animated border */}
              <div className="absolute inset-0 rounded-2xl border border-neon-accent/30 animate-pulse-neon"></div>
            </div>

            {/* Floating particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-neon-primary rounded-full"
                initial={{ 
                  opacity: 0,
                  x: Math.random() * 400 - 200,
                  y: Math.random() * 300 - 150
                }}
                animate={{ 
                  opacity: [0, 1, 0],
                  y: [0, -50, -100],
                  x: [0, Math.random() * 40 - 20, Math.random() * 80 - 40]
                }}
                transition={{ 
                  duration: 2,
                  delay: i * 0.2,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
