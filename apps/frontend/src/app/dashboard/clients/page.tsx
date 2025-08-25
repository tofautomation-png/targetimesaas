'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Mail, 
  Phone, 
  Clock, 
  AlertTriangle,
  Send,
  Plus,
  Filter
} from 'lucide-react';
import { apiClient, Client } from '@/lib/api';
import { formatDate, cn } from '@/lib/utils';

export default function ClientsPage() {
  const [welcomeClients, setWelcomeClients] = useState<Client[]>([]);
  const [retargetingClients, setRetargetingClients] = useState<Client[]>([]);
  const [followupClients, setFollowupClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'welcome' | 'retargeting' | 'followups'>('welcome');

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const [welcome, retargeting, followups] = await Promise.all([
          apiClient.getWelcomeClients(),
          apiClient.getRetargetingClients(),
          apiClient.getFollowupClients()
        ]);
        
        setWelcomeClients(welcome);
        setRetargetingClients(retargeting);
        setFollowupClients(followups);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load clients');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, []);

  const handleSendNudge = async (clientId: number, type: 'retargeting' | 'followup') => {
    try {
      const subject = type === 'retargeting' 
        ? 'We miss you! Come back and see what\'s new'
        : 'Following up on your recent inquiry';
      
      if (type === 'retargeting') {
        await apiClient.sendRetargetingEmail(clientId, subject);
      } else {
        await apiClient.sendFollowupEmail(clientId, subject);
      }
      
      // Show success feedback (you could add a toast notification here)
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  };

  const tabs = [
    { id: 'welcome', label: 'Welcome Clients', count: welcomeClients.length },
    { id: 'retargeting', label: 'Retargeting', count: retargetingClients.length },
    { id: 'followups', label: 'Follow-ups', count: followupClients.length },
  ];

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
              <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const renderClientTable = (clients: Client[], type: 'welcome' | 'retargeting' | 'followups') => {
    if (clients.length === 0) {
      return (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-text-secondary mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            {type === 'welcome' && 'No welcome clients yet'}
            {type === 'retargeting' && 'No clients to retarget right now'}
            {type === 'followups' && 'No pending follow-ups'}
          </h3>
          <p className="text-text-secondary">
            {type === 'welcome' && 'New clients will appear here when they sign up'}
            {type === 'retargeting' && 'Clients who need attention will show up here'}
            {type === 'followups' && 'Follow-up tasks will be listed here'}
          </p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-4 px-4 text-text-secondary font-medium">Name</th>
              <th className="text-left py-4 px-4 text-text-secondary font-medium">Email</th>
              <th className="text-left py-4 px-4 text-text-secondary font-medium">Phone</th>
              <th className="text-left py-4 px-4 text-text-secondary font-medium">Status</th>
              <th className="text-left py-4 px-4 text-text-secondary font-medium">Created</th>
              {type !== 'welcome' && (
                <th className="text-left py-4 px-4 text-text-secondary font-medium">
                  {type === 'retargeting' ? 'Last Visit' : 'Due Date'}
                </th>
              )}
              <th className="text-left py-4 px-4 text-text-secondary font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client, index) => (
              <motion.tr
                key={client.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      defaultValue={client.client_name}
                      className="bg-transparent border-none text-text-primary font-medium focus:outline-none focus:bg-white/5 rounded px-2 py-1"
                      onBlur={(e) => {
                        // Handle name update
                        console.log('Update name:', e.target.value);
                      }}
                    />
                    {client.needs_attention && (
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    )}
                    {client.is_overdue && (
                      <Clock className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <input
                    type="email"
                    defaultValue={client.email}
                    className="bg-transparent border-none text-text-primary focus:outline-none focus:bg-white/5 rounded px-2 py-1 w-full"
                    onBlur={(e) => {
                      // Handle email update
                      console.log('Update email:', e.target.value);
                    }}
                  />
                </td>
                <td className="py-4 px-4">
                  <input
                    type="tel"
                    defaultValue={client.phone || ''}
                    placeholder="Add phone"
                    className="bg-transparent border-none text-text-primary focus:outline-none focus:bg-white/5 rounded px-2 py-1 w-full placeholder-text-secondary"
                    onBlur={(e) => {
                      // Handle phone update
                      console.log('Update phone:', e.target.value);
                    }}
                  />
                </td>
                <td className="py-4 px-4">
                  <select
                    defaultValue={client.status || 'pending'}
                    className="bg-white/5 border border-white/10 rounded px-2 py-1 text-text-primary text-sm focus:outline-none focus:ring-1 focus:ring-neon-primary/50"
                    onChange={(e) => {
                      // Handle status update
                      console.log('Update status:', e.target.value);
                    }}
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </td>
                <td className="py-4 px-4 text-text-secondary text-sm">
                  {client.created_at ? formatDate(client.created_at) : 'N/A'}
                </td>
                {type !== 'welcome' && (
                  <td className="py-4 px-4 text-text-secondary text-sm">
                    {type === 'retargeting' 
                      ? (client.last_visit_date ? formatDate(client.last_visit_date) : 'N/A')
                      : (client.due_date ? formatDate(client.due_date) : 'N/A')
                    }
                  </td>
                )}
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-2">
                    {type === 'retargeting' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSendNudge(client.id, 'retargeting')}
                        className="px-3 py-1 bg-neon-primary/20 text-neon-primary rounded text-sm hover:bg-neon-primary/30 transition-colors flex items-center space-x-1"
                      >
                        <Send className="w-3 h-3" />
                        <span>Nudge</span>
                      </motion.button>
                    )}
                    
                    {type === 'followups' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSendNudge(client.id, 'followup')}
                        className="px-3 py-1 bg-neon-primary/20 text-neon-primary rounded text-sm hover:bg-neon-primary/30 transition-colors flex items-center space-x-1"
                      >
                        <Send className="w-3 h-3" />
                        <span>Follow-up</span>
                      </motion.button>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          Client Management
        </h1>
        <p className="text-text-secondary">
          Manage your clients across different stages
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-white/5 p-1 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-300",
              activeTab === tab.id
                ? "bg-neon-gradient text-background-primary shadow-neon"
                : "text-text-secondary hover:text-text-primary hover:bg-white/5"
            )}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="glass-panel p-6">
        {error ? (
          <div className="text-center py-12">
            <div className="text-red-400 mb-4">
              <AlertTriangle className="w-12 h-12 mx-auto mb-2" />
              <p className="text-lg font-semibold">Failed to load clients</p>
            </div>
            <p className="text-text-secondary">{error}</p>
          </div>
        ) : (
          <>
            {activeTab === 'welcome' && renderClientTable(welcomeClients, 'welcome')}
            {activeTab === 'retargeting' && renderClientTable(retargetingClients, 'retargeting')}
            {activeTab === 'followups' && renderClientTable(followupClients, 'followups')}
          </>
        )}
      </div>
    </div>
  );
}
