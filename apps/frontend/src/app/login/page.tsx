'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Mail, Lock } from 'lucide-react';
import { apiClient } from '@/lib/api';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showWelcomeCard, setShowWelcomeCard] = useState(false);
  const [showBackground, setShowBackground] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await apiClient.login(email, password);
      
      // Show welcome card animation
      setShowWelcomeCard(true);
      setShowBackground(true);
      
      // After 4 seconds, slide background down and navigate
      setTimeout(() => {
        setShowBackground(false);
        setTimeout(() => {
          router.push('/dashboard/overview');
        }, 800); // Wait for slide animation
      }, 4000);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Dark Green Background Overlay */}
      <AnimatePresence>
        {showBackground && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ 
              opacity: { duration: 0.3 },
              y: { duration: 0.8, ease: "easeInOut" }
            }}
            className="fixed inset-0 bg-green-900 z-50"
          />
        )}
      </AnimatePresence>

      {/* Welcome Card Animation */}
      <AnimatePresence>
        {showWelcomeCard && (
          <motion.div
            initial={{ rotateY: 0 }}
            animate={{ rotateY: 180 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="fixed inset-0 flex items-center justify-center z-60"
            style={{ perspective: "1000px" }}
          >
            <motion.div
              className="w-80 h-48 relative"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Front of card */}
              <div className="absolute inset-0 bg-green-600 rounded-xl flex items-center justify-center backface-hidden">
                <div className="text-center text-white">
                  <div className="w-16 h-16 mx-auto mb-4 relative">
                    <Image
                      src={process.env.NEXT_PUBLIC_BRAND_LOGO || '/logo.png'}
                      alt="Targetime Partners"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <h2 className="text-2xl font-bold">Welcome!</h2>
                </div>
              </div>
              
              {/* Back of card */}
              <div 
                className="absolute inset-0 bg-green-600 rounded-xl flex items-center justify-center backface-hidden"
                style={{ transform: "rotateY(180deg)" }}
              >
                <div className="text-center text-white">
                  <h2 className="text-2xl font-bold mb-2">Loading Dashboard...</h2>
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showWelcomeCard ? 0 : 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="glass-panel p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 relative">
                <Image
                  src={process.env.NEXT_PUBLIC_BRAND_LOGO || '/logo.png'}
                  alt="Targetime Partners"
                  fill
                  className="object-contain"
                />
              </div>
              <h1 className="text-2xl font-bold bg-neon-gradient bg-clip-text text-transparent">
                Targetime Partners
              </h1>
              <p className="text-text-secondary mt-2">
                Sign in to your account
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm"
                >
                  {error}
                </motion.div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-5 h-5" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg 
                               text-text-primary placeholder-text-secondary
                               focus:outline-none focus:ring-2 focus:ring-neon-primary/50 focus:border-neon-primary/50
                               transition-all duration-300 disabled:opacity-50"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-5 h-5" />
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg 
                               text-text-primary placeholder-text-secondary
                               focus:outline-none focus:ring-2 focus:ring-neon-primary/50 focus:border-neon-primary/50
                               transition-all duration-300 disabled:opacity-50"
                      placeholder="Enter your password"
                    />
                  </div>
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                className="w-full neon-button flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-background-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>Sign In</span>
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </>
  );
}
