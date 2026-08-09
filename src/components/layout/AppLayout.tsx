import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { AuthModal } from '../auth/AuthModal';
import { Loader2, WifiOff, Lock } from 'lucide-react';
import { Button } from '../ui/button';
import { socketService } from '../../lib/api/socket';
import { toast } from 'sonner';

export function AppLayout() {
  const { user, loading, openAuthModal } = useAuthStore();
  const location = useLocation();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    if (user?.uid) {
      socketService.connect(user.uid);
      
      const unsubNotif = socketService.on('notification', (data) => {
        toast(data.title, {
          description: data.description,
          action: data.actionUrl ? {
            label: "View",
            onClick: () => window.location.href = data.actionUrl
          } : undefined
        });
      });

      return () => {
        unsubNotif();
        socketService.disconnect();
      };
    }
  }, [user?.uid]);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Restricted routes check (e.g. /settings, /security require auth)
  const isRestrictedRoute = !user && (
    location.pathname.startsWith('/settings') || 
    location.pathname.startsWith('/security')
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden text-foreground">
      <Sidebar className="hidden md:flex" />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header />
        {isOffline && (
          <div className="bg-destructive/10 text-destructive text-sm px-4 py-2 flex items-center justify-center font-medium shrink-0 border-b border-destructive/20">
            <WifiOff className="w-4 h-4 mr-2 shrink-0" />
            You are currently offline. Local cache active.
          </div>
        )}
        <main className="flex-1 overflow-auto p-4 pb-24 md:p-6 lg:p-8">
          {isRestrictedRoute ? (
            <div className="max-w-md mx-auto my-12 text-center bg-card p-8 rounded-2xl border border-border shadow-lg space-y-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-heading font-extrabold text-foreground">Authentication Required</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                You must be logged in to modify security settings, key configurations, or account details.
              </p>
              <Button onClick={openAuthModal} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 shadow-md shadow-blue-600/20">
                Sign In to Access Settings
              </Button>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
      <BottomNav />
      <AuthModal />
    </div>
  );
}
