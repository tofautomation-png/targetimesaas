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

  const renderClientList = (clients: Client[], type: 'welcome' | 'retargeting' | 'followups') => {
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
      <div className="space-y-4">
        {clients.map((client, index) => (
          <motion.div
            key={client.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="glass-panel p-6 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-4">
                  <div>
                    <h3 className="font-semibold text-text-primary flex items-center">
                      {client.client_name}
                      {client.needs_attention && (
                        <AlertTriangle className="w-4 h-4 text-yellow-400 ml-2" />
                      )}
                      {client.is_overdue && (
                        <Clock className="w-4 h-4 text-red-400 ml-2" />
                      )}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-text-secondary mt-1">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        {client.email}
                      </div>
                      {client.phone && (
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          {client.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 flex items-center space-x-6 text-sm">
                  {client.status && (
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      client.status === 'active' ? "bg-green-500/20 text-green-400" :
                      client.status === 'pending' ? "bg-yellow-500/20 text-yellow-400" :
                      "bg-gray-500/20 text-gray-400"
                    )}>
                      {client.status}
                    </span>
                  )}
                  
                  {client.created_at && (
                    <span className="text-text-secondary">
                      Created: {formatDate(client.created_at)}
                    </span>
                  )}
                  
                  {client.last_visit_date && (
                    <span className="text-text-secondary">
                      Last visit: {formatDate(client.last_visit_date)}
                    </span>
                  )}
                  
                  {client.due_date && (
                    <span className={cn(
                      "text-sm",
                      client.is_overdue ? "text-red-400" : "text-text-secondary"
                    )}>
                      Due: {formatDate(client.due_date)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {type === 'retargeting' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSendNudge(client.id, 'retargeting')}
                    className="px-4 py-2 bg-neon-primary/20 text-neon-primary rounded-lg hover:bg-neon-primary/30 transition-colors flex items-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Nudge</span>
                  </motion.button>
                )}
                
                {type === 'followups' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSendNudge(client.id, 'followup')}
                    className="px-4 py-2 bg-neon-primary/20 text-neon-primary rounded-lg hover:bg-neon-primary/30 transition-colors flex items-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Log Follow-up Email</span>
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
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
            {activeTab === 'welcome' && renderClientList(welcomeClients, 'welcome')}
            {activeTab === 'retargeting' && renderClientList(retargetingClients, 'retargeting')}
            {activeTab === 'followups' && renderClientList(followupClients, 'followups')}
          </>
        )}
      </div>
    </div>
  );
}
