'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Building, 
  Calendar,
  LogOut,
  Settings
} from 'lucide-react';
import { apiClient, SessionResponse } from '@/lib/api';
import Image from 'next/image';

export default function ProfilePage() {
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const sessionData = await apiClient.getSession();
        setSession(sessionData);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load profile');
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();
  }, [router]);

  const handleLogout = async () => {
    try {
      await apiClient.logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-white/10 rounded-lg w-48 mb-2"></div>
          <div className="h-4 bg-white/5 rounded w-96"></div>
        </div>
        <div className="glass-panel p-8">
          <div className="space-y-4">
            <div className="h-20 bg-white/5 rounded-lg animate-pulse"></div>
            <div className="h-16 bg-white/5 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="glass-panel p-8 text-center">
        <div className="text-red-400 mb-4">
          <User className="w-12 h-12 mx-auto mb-2" />
          <p className="text-lg font-semibold">Failed to load profile</p>
        </div>
        <p className="text-text-secondary">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          Profile
        </h1>
        <p className="text-text-secondary">
          Manage your account information
        </p>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass-panel p-8"
      >
        <div className="flex items-start space-x-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-neon-gradient p-0.5">
              <div className="w-full h-full rounded-2xl bg-background-primary flex items-center justify-center">
                <User className="w-12 h-12 text-neon-primary" />
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-background-primary"></div>
          </div>

          {/* User Info */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              {session.user.name}
            </h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-text-secondary">
                <Mail className="w-5 h-5" />
                <span>{session.user.email}</span>
              </div>
              <div className="flex items-center space-x-3 text-text-secondary">
                <Building className="w-5 h-5" />
                <span>Agency: {session.agency_code}</span>
              </div>
              <div className="flex items-center space-x-3 text-text-secondary">
                <Calendar className="w-5 h-5" />
                <span>Last login: {new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col space-y-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-white/5 text-text-primary rounded-lg hover:bg-white/10 transition-colors flex items-center space-x-2"
            >
              <Settings className="w-4 h-4" />
              <span>Edit Profile</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Account Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="glass-panel p-6"
      >
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Account Details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              User ID
            </label>
            <div className="p-3 bg-white/5 rounded-lg text-text-primary">
              {session.user.id}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Agency Code
            </label>
            <div className="p-3 bg-white/5 rounded-lg text-text-primary">
              {session.agency_code}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Account Status
            </label>
            <div className="p-3 bg-green-500/20 text-green-400 rounded-lg flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Active</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Member Since
            </label>
            <div className="p-3 bg-white/5 rounded-lg text-text-primary">
              {new Date().getFullYear()}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Sign Out */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="glass-panel p-6"
      >
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Account Actions
        </h3>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="px-6 py-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center space-x-2"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </motion.button>
      </motion.div>
    </div>
  );
}
