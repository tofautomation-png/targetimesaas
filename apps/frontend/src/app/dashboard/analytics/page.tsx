'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign,
  Clock,
  Target,
  Mail,
  Phone
} from 'lucide-react';
import { apiClient } from '@/lib/api';

interface AnalyticsData {
  totalClients: number;
  totalAppointments: number;
  totalRevenue: number;
  clientsByStatus: { [key: string]: number };
  appointmentsByStatus: { [key: string]: number };
  revenueByMonth: { month: string; revenue: number }[];
  clientsByType: { welcome: number; retargeting: number; followup: number };
  avgAppointmentValue: number;
  conversionRate: number;
  responseRate: number;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all data in parallel
      const [welcomeClients, retargetingClients, followupClients, appointments] = await Promise.all([
        apiClient.getWelcomeClients(),
        apiClient.getRetargetingClients(),
        apiClient.getFollowupClients(),
        apiClient.getAppointments()
      ]);

      // Process data for analytics
      const allClients = [...welcomeClients, ...retargetingClients, ...followupClients];
      
      const clientsByStatus = allClients.reduce((acc, client) => {
        const status = client.status || 'pending';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });

      const appointmentsByStatus = appointments.reduce((acc, appointment) => {
        const status = appointment.status || 'scheduled';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });

      const totalRevenue = appointments
        .filter(apt => apt.status === 'completed' && apt.value)
        .reduce((sum, apt) => sum + (apt.value || 0), 0);

      const avgAppointmentValue = appointments.length > 0 
        ? totalRevenue / appointments.filter(apt => apt.value).length 
        : 0;

      const completedClients = allClients.filter(client => client.status === 'completed').length;
      const conversionRate = allClients.length > 0 ? (completedClients / allClients.length) * 100 : 0;

      // Mock response rate calculation
      const responseRate = 75; // This would come from email/phone logs in real implementation

      // Generate monthly revenue data (mock for now)
      const revenueByMonth = [
        { month: 'Jan', revenue: totalRevenue * 0.15 },
        { month: 'Feb', revenue: totalRevenue * 0.18 },
        { month: 'Mar', revenue: totalRevenue * 0.22 },
        { month: 'Apr', revenue: totalRevenue * 0.20 },
        { month: 'May', revenue: totalRevenue * 0.25 }
      ];

      setData({
        totalClients: allClients.length,
        totalAppointments: appointments.length,
        totalRevenue,
        clientsByStatus,
        appointmentsByStatus,
        revenueByMonth,
        clientsByType: {
          welcome: welcomeClients.length,
          retargeting: retargetingClients.length,
          followup: followupClients.length
        },
        avgAppointmentValue,
        conversionRate,
        responseRate
      });
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-gradient p-6 flex items-center justify-center">
        <div className="text-neon-primary">Loading analytics...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-dark-gradient p-6 flex items-center justify-center">
        <div className="text-red-400">Failed to load analytics data</div>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "neon-primary" }: {
    icon: React.ComponentType<any>;
    title: string;
    value: string;
    subtitle: string;
    color?: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <Icon className={`w-8 h-8 text-${color}`} />
        <div className="text-right">
          <div className="text-2xl font-bold text-text-primary">{value}</div>
          <div className="text-text-secondary text-sm">{subtitle}</div>
        </div>
      </div>
      <h3 className="text-text-primary font-medium">{title}</h3>
    </motion.div>
  );

  const PieChartComponent = ({ data: chartData, title }: {
    data: Record<string, number>;
    title: string;
  }) => {
    const total = Object.values(chartData).reduce((sum: number, val: number) => sum + val, 0);
    const colors = ['#00FF85', '#00FFC5', '#4EF0A8', '#FF6B6B', '#4ECDC4'];
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-6"
      >
        <h3 className="text-text-primary font-semibold mb-4 flex items-center">
          <PieChart className="w-5 h-5 mr-2 text-neon-primary" />
          {title}
        </h3>
        <div className="space-y-3">
          {Object.entries(chartData).map(([key, value], index) => {
            const percentage = total > 0 ? ((value as number) / total * 100).toFixed(1) : '0';
            return (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-3"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <span className="text-text-primary capitalize">{key.replace('_', ' ')}</span>
                </div>
                <div className="text-text-secondary">
                  {value} ({percentage}%)
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    );
  };

  const BarChartComponent = ({ data: chartData, title }: {
    data: Array<{ month: string; revenue: number }>;
    title: string;
  }) => {
    const maxValue = Math.max(...chartData.map(item => item.revenue));
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-6"
      >
        <h3 className="text-text-primary font-semibold mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-neon-primary" />
          {title}
        </h3>
        <div className="space-y-3">
          {chartData.map((item, index) => {
            const percentage = maxValue > 0 ? (item.revenue / maxValue) * 100 : 0;
            return (
              <div key={item.month} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-text-primary">{item.month}</span>
                  <span className="text-text-secondary">${item.revenue.toFixed(0)}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="bg-neon-gradient h-2 rounded-full"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-dark-gradient p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-text-primary mb-2">Analytics Dashboard</h1>
          <p className="text-text-secondary">Comprehensive insights into your business performance</p>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Users}
            title="Total Clients"
            value={data.totalClients.toString()}
            subtitle="All client types"
          />
          <StatCard
            icon={Calendar}
            title="Appointments"
            value={data.totalAppointments.toString()}
            subtitle="All time"
          />
          <StatCard
            icon={DollarSign}
            title="Total Revenue"
            value={`$${data.totalRevenue.toFixed(0)}`}
            subtitle="From completed appointments"
          />
          <StatCard
            icon={TrendingUp}
            title="Conversion Rate"
            value={`${data.conversionRate.toFixed(1)}%`}
            subtitle="Clients to completed"
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Target}
            title="Avg Appointment Value"
            value={`$${data.avgAppointmentValue.toFixed(0)}`}
            subtitle="Per completed appointment"
          />
          <StatCard
            icon={Mail}
            title="Response Rate"
            value={`${data.responseRate}%`}
            subtitle="Email/SMS responses"
          />
          <StatCard
            icon={Clock}
            title="Welcome Clients"
            value={data.clientsByType.welcome}
            subtitle="New prospects"
          />
          <StatCard
            icon={Phone}
            title="Follow-ups Due"
            value={data.clientsByType.followup}
            subtitle="Require attention"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <PieChartComponent
            data={data.clientsByStatus}
            title="Clients by Status"
          />
          <PieChartComponent
            data={data.appointmentsByStatus}
            title="Appointments by Status"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BarChartComponent
            data={data.revenueByMonth}
            title="Revenue by Month"
          />
          <PieChartComponent
            data={data.clientsByType}
            title="Clients by Type"
          />
        </div>
      </div>
    </div>
  );
}
