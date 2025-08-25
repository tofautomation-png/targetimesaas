'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  User,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Overview', href: '/dashboard/overview', icon: LayoutDashboard },
  { name: 'Clients', href: '/dashboard/clients', icon: Users },
  { name: 'Appointments', href: '/dashboard/appointments', icon: Calendar },
  { name: 'Reports', href: '/dashboard/reports', icon: FileText },
  { name: 'Profile', href: '/profile', icon: User },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await apiClient.logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "fixed left-0 top-0 h-full glass-panel border-r border-white/10 z-50 transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 relative">
                  <Image
                    src={process.env.NEXT_PUBLIC_BRAND_LOGO || '/logo.png'}
                    alt="Targetime"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-lg font-bold bg-neon-gradient bg-clip-text text-transparent">
                  Targetime
                </span>
              </div>
            )}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              {isCollapsed ? (
                <ChevronRight className="w-5 h-5 text-text-secondary" />
              ) : (
                <ChevronLeft className="w-5 h-5 text-text-secondary" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <motion.a
                  href={item.href}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group",
                    isActive
                      ? "bg-neon-gradient text-background-primary shadow-neon"
                      : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                  )}
                >
                  <item.icon 
                    className={cn(
                      "w-5 h-5 transition-colors",
                      isActive ? "text-background-primary" : "group-hover:text-neon-primary"
                    )} 
                  />
                  {!isCollapsed && (
                    <span className="font-medium">{item.name}</span>
                  )}
                </motion.a>
              </motion.div>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className={cn(
              "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 w-full",
              "text-text-secondary hover:text-red-400 hover:bg-red-500/10"
            )}
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && (
              <span className="font-medium">Sign Out</span>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
