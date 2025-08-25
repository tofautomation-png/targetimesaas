'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  User, 
  DollarSign,
  Plus,
  Filter,
  Search
} from 'lucide-react';
import { apiClient, Appointment } from '@/lib/api';
import { formatDateTime, formatCurrency, cn } from '@/lib/utils';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await apiClient.getAppointments();
        setAppointments(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load appointments');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const filteredAppointments = appointments.filter(appointment => {
    if (!statusFilter) return true;
    return appointment.status.toLowerCase() === statusFilter.toLowerCase();
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'bg-blue-500/20 text-blue-400';
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400';
      case 'no_show':
      case 'no-show':
        return 'bg-orange-500/20 text-orange-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
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
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-white/5 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
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
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Appointments
          </h1>
          <p className="text-text-secondary">
            Manage your scheduled appointments
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="neon-button flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>New Appointment</span>
        </motion.button>
      </motion.div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-text-secondary" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-primary/50"
          >
            <option value="">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No Show</option>
          </select>
        </div>
      </div>

      {/* Appointments List */}
      <div className="glass-panel p-6">
        {error ? (
          <div className="text-center py-12">
            <div className="text-red-400 mb-4">
              <Calendar className="w-12 h-12 mx-auto mb-2" />
              <p className="text-lg font-semibold">Failed to load appointments</p>
            </div>
            <p className="text-text-secondary">{error}</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              No appointments found
            </h3>
            <p className="text-text-secondary">
              {statusFilter ? `No ${statusFilter} appointments` : 'No appointments scheduled yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment, index) => (
              <motion.div
                key={appointment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-6 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="p-2 rounded-lg bg-neon-primary/10">
                        <Calendar className="w-5 h-5 text-neon-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-primary">
                          {appointment.client_name}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-text-secondary">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatDateTime(appointment.starts_at)}
                          </div>
                          {appointment.value > 0 && (
                            <div className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-1" />
                              {formatCurrency(appointment.value)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium",
                        getStatusColor(appointment.status)
                      )}>
                        {appointment.status.replace('_', ' ').toUpperCase()}
                      </span>
                      
                      {appointment.client_id && (
                        <span className="text-xs text-text-secondary">
                          Client ID: {appointment.client_id}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-white/5 text-text-primary rounded-lg hover:bg-white/10 transition-colors"
                    >
                      Edit
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
