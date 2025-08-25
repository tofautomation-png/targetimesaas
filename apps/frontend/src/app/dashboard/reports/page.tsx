'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Calendar, 
  Users, 
  UserCheck,
  UserPlus
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { downloadBlob } from '@/lib/utils';

export default function ReportsPage() {
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const handleExport = async (entity: string, format: 'csv' | 'json') => {
    setIsExporting(`${entity}-${format}`);
    try {
      const blob = await apiClient.exportData(entity, format);
      const filename = `${entity}_export_${new Date().toISOString().split('T')[0]}.${format}`;
      downloadBlob(blob, filename);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(null);
    }
  };

  const reports = [
    {
      id: 'appointments',
      title: 'Appointments Report',
      description: 'Export all appointment data including client information, dates, and status',
      icon: Calendar,
      color: 'text-blue-400'
    },
    {
      id: 'retargeting',
      title: 'Retargeting Clients',
      description: 'Export clients who need retargeting attention',
      icon: UserCheck,
      color: 'text-yellow-400'
    },
    {
      id: 'followups',
      title: 'Follow-up Clients',
      description: 'Export clients with pending follow-up tasks',
      icon: Users,
      color: 'text-green-400'
    },
    {
      id: 'welcome',
      title: 'Welcome Clients',
      description: 'Export new welcome clients and their information',
      icon: UserPlus,
      color: 'text-purple-400'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          Reports & Export
        </h1>
        <p className="text-text-secondary">
          Download your data in CSV or JSON format
        </p>
      </motion.div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report, index) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="glass-panel p-6 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-start space-x-4 mb-6">
              <div className="p-3 rounded-xl bg-white/5">
                <report.icon className={`w-6 h-6 ${report.color}`} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  {report.title}
                </h3>
                <p className="text-text-secondary text-sm">
                  {report.description}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleExport(report.id, 'csv')}
                disabled={isExporting === `${report.id}-csv`}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-neon-primary/20 text-neon-primary rounded-lg hover:bg-neon-primary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting === `${report.id}-csv` ? (
                  <div className="w-4 h-4 border-2 border-neon-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>CSV</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleExport(report.id, 'json')}
                disabled={isExporting === `${report.id}-json`}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-white/5 text-text-primary rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting === `${report.id}-json` ? (
                  <div className="w-4 h-4 border-2 border-text-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>JSON</span>
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Export Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="glass-panel p-6"
      >
        <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-neon-primary" />
          Export Information
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h3 className="font-medium text-text-primary mb-2">CSV Format</h3>
            <ul className="space-y-1 text-text-secondary">
              <li>• Comma-separated values</li>
              <li>• Compatible with Excel and Google Sheets</li>
              <li>• Includes headers for easy identification</li>
              <li>• Best for data analysis and reporting</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-text-primary mb-2">JSON Format</h3>
            <ul className="space-y-1 text-text-secondary">
              <li>• Structured data format</li>
              <li>• Includes metadata and timestamps</li>
              <li>• Perfect for API integrations</li>
              <li>• Preserves data types and relationships</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
