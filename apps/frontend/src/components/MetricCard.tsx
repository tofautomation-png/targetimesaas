'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  delay?: number;
  className?: string;
}

export default function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  delay = 0,
  className 
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ 
        scale: 1.02, 
        y: -4,
        transition: { duration: 0.2 }
      }}
      className={cn(
        "glass-panel p-6 relative overflow-hidden group cursor-pointer",
        className
      )}
    >
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-neon-gradient opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-xl bg-neon-primary/10 group-hover:bg-neon-primary/20 transition-colors duration-300">
            <Icon className="w-6 h-6 text-neon-primary" />
          </div>
          {trend && (
            <div className={cn(
              "text-sm font-medium",
              trend.isPositive ? "text-green-400" : "text-red-400"
            )}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </div>
          )}
        </div>
        
        <div>
          <motion.div 
            className="text-2xl font-bold text-text-primary mb-1"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: delay + 0.2 }}
          >
            {value}
          </motion.div>
          <div className="text-text-secondary text-sm font-medium">
            {title}
          </div>
        </div>
      </div>

      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
    </motion.div>
  );
}
