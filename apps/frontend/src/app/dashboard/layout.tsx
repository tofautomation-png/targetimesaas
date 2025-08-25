'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, SessionResponse } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import MembershipCard from '@/components/MembershipCard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMembershipCard, setShowMembershipCard] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const sessionData = await apiClient.getSession();
        setSession(sessionData);
      } catch (error) {
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-neon">
          <div className="w-16 h-16 border-4 border-neon-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-dark-gradient">
      <Sidebar />
      
      {/* Membership Card Overlay */}
      {showMembershipCard && (
        <MembershipCard
          user={session.user}
          agencyCode={session.agency_code}
          onComplete={() => setShowMembershipCard(false)}
        />
      )}

      {/* Main Content */}
      <div className="ml-64 transition-all duration-300">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
