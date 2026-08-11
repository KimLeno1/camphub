import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { Footer } from './Footer';
import { AuthModal } from '../auth/AuthModal';
import { Loader2, WifiOff, Lock, Download, Sparkles, X } from 'lucide-react';
import { Button } from '../ui/button';
import { socketService } from '../../lib/api/socket';
import { toast } from 'sonner';

export function AppLayout() {
  const { user, loading, openAuthModal } = useAuthStore();
  const location = useLocation();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // PWA installation states
  const [isInstallable, setIsInstallable] = useState(!!(window as any).deferredPrompt);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);

  useEffect(() => {
    // Check if already running in standalone/installed mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    
    if (isStandalone) {
      return;
    }

    // Detect iOS native browser Safari (doesn't trigger beforeinstallprompt but supports PWA)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !/crios|fxios/.test(userAgent);
    setIsIOS(isIosDevice);

    if (isIosDevice) {
      const dismissed = sessionStorage.getItem('ios-pwa-dismissed');
      if (!dismissed) {
        setShowIOSPrompt(true);
      }
    }

    // Standard PWA handler for other browsers
    const handleInstallable = () => {
      setIsInstallable(true);
      const dismissed = sessionStorage.getItem('pwa-banner-dismissed');
      if (!dismissed) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener('pwa-installable', handleInstallable);
    
    // Check if the event was already fired before we mounted
    if ((window as any).deferredPrompt) {
      handleInstallable();
    }

    return () => {
      window.removeEventListener('pwa-installable', handleInstallable);
    };
  }, []);

  const handleInstallClick = async () => {
    const promptEvent = (window as any).deferredPrompt;
    if (!promptEvent) return;

    promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    console.log('User PWA install choice outcome:', outcome);
    
    // Prompt can only be used once, reset global and state
    (window as any).deferredPrompt = null;
    setIsInstallable(false);
    setShowInstallBanner(false);
  };

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

        {/* PWA Standard Install Prompt Banner */}
        {showInstallBanner && (
          <div className="bg-blue-600/10 border-b border-blue-500/20 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/5 to-transparent pointer-events-none" />
            <div className="flex items-center gap-3 relative z-10 text-center sm:text-left">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/10 shrink-0">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h4 className="font-heading font-extrabold text-sm text-foreground">
                  Install Center7 App
                </h4>
                <p className="text-xs text-muted-foreground">
                  Access decentralized student governance, messaging, and resources directly on your device offline.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 relative z-10 w-full sm:w-auto justify-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setShowInstallBanner(false);
                  sessionStorage.setItem('pwa-banner-dismissed', 'true');
                }}
                className="text-xs text-muted-foreground hover:text-foreground h-8 px-3 rounded-lg"
              >
                Dismiss
              </Button>
              <Button 
                onClick={handleInstallClick}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-8 px-4 rounded-lg shadow-xs flex items-center gap-1.5 shrink-0"
              >
                <Download className="w-3.5 h-3.5" /> Install App
              </Button>
            </div>
          </div>
        )}

        {/* PWA iOS Safari Guided Install Banner */}
        {showIOSPrompt && (
          <div className="bg-purple-600/10 border-b border-purple-500/20 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/5 to-transparent pointer-events-none" />
            <div className="flex items-center gap-3 relative z-10 text-center sm:text-left">
              <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-600/10 shrink-0">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h4 className="font-heading font-extrabold text-sm text-foreground">
                  Add Center7 to your device
                </h4>
                <p className="text-xs text-muted-foreground">
                  Tap the <span className="font-bold text-foreground">Share</span> icon in Safari, then select <span className="font-bold text-foreground">"Add to Home Screen"</span>.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 relative z-10 w-full sm:w-auto justify-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setShowIOSPrompt(false);
                  sessionStorage.setItem('ios-pwa-dismissed', 'true');
                }}
                className="text-xs text-muted-foreground hover:text-foreground h-8 px-3 rounded-lg"
              >
                Dismiss
              </Button>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-auto flex flex-col justify-between">
          <div className="p-4 pb-12 md:p-6 lg:p-8 flex-1">
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
          </div>
          <div className="pb-20 md:pb-0">
            <Footer />
          </div>
        </main>
      </div>
      <BottomNav />
      <AuthModal />
    </div>
  );
}
