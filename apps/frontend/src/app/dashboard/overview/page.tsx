'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  DollarSign, 
  UserPlus, 
  UserX,
  TrendingUp,
  Activity
} from 'lucide-react';
import { apiClient, KPIData } from '@/lib/api';
import MetricCard from '@/components/MetricCard';
import { formatCurrency } from '@/lib/utils';

export default function OverviewPage() {
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        const data = await apiClient.getKPIs();
        setKpis(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load KPIs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchKPIs();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-white/10 rounded-lg w-48 mb-2"></div>
          <div className="h-4 bg-white/5 rounded w-96"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-panel p-6 animate-pulse">
              <div className="h-12 bg-white/10 rounded-lg mb-4"></div>
              <div className="h-8 bg-white/10 rounded w-16 mb-2"></div>
              <div className="h-4 bg-white/5 rounded w-24"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel p-8 text-center">
        <div className="text-red-400 mb-4">
          <Activity className="w-12 h-12 mx-auto mb-2" />
          <p className="text-lg font-semibold">Failed to load dashboard</p>
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
          Dashboard Overview
        </h1>
        <p className="text-text-secondary">
          Your business metrics at a glance
        </p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Bookings Today"
          value={kpis?.bookingsToday || 0}
          icon={Calendar}
          delay={0.1}
          trend={{
            value: 12,
            isPositive: true
          }}
        />
        
        <MetricCard
          title="Revenue (30d)"
          value={formatCurrency(kpis?.revenue30d || 0)}
          icon={DollarSign}
          delay={0.2}
          trend={{
            value: 8,
            isPositive: true
          }}
        />
        
        <MetricCard
          title="New Clients (7d)"
          value={kpis?.newClients7d || 0}
          icon={UserPlus}
          delay={0.3}
          trend={{
            value: 15,
            isPositive: true
          }}
        />
        
        <MetricCard
          title="No Shows (7d)"
          value={kpis?.noShows7d || 0}
          icon={UserX}
          delay={0.4}
          trend={{
            value: -5,
            isPositive: false
          }}
        />
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="glass-panel p-6"
      >
        <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-neon-primary" />
          Quick Actions
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.a
            href="/dashboard/clients"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10 hover:border-neon-primary/30"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-neon-primary/10">
                <UserPlus className="w-5 h-5 text-neon-primary" />
              </div>
              <div>
                <div className="font-medium text-text-primary">Manage Clients</div>
                <div className="text-sm text-text-secondary">View and update client information</div>
              </div>
            </div>
          </motion.a>

          <motion.a
            href="/dashboard/appointments"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10 hover:border-neon-primary/30"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-neon-primary/10">
                <Calendar className="w-5 h-5 text-neon-primary" />
              </div>
              <div>
                <div className="font-medium text-text-primary">Schedule Appointments</div>
                <div className="text-sm text-text-secondary">Book and manage appointments</div>
              </div>
            </div>
          </motion.a>

          <motion.a
            href="/dashboard/reports"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10 hover:border-neon-primary/30"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-neon-primary/10">
                <TrendingUp className="w-5 h-5 text-neon-primary" />
              </div>
              <div>
                <div className="font-medium text-text-primary">View Reports</div>
                <div className="text-sm text-text-secondary">Export and analyze data</div>
              </div>
            </div>
          </motion.a>
        </div>
      </motion.div>
    </div>
  );
}
