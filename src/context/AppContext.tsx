import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export type UserRole = 'student' | 'teacher' | 'club_leader' | 'campus_admin' | 'super_admin';

export interface Tenant {
  id: string;
  name: string;
  logo: string;
  theme: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earnedAt: string;
}

export type NotificationType = 'xp' | 'message' | 'quiz' | 'event' | 'opportunity' | 'alert';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  link?: string;
  amount?: number; // for XP toasts
}

export interface NotificationPreferences {
  messages: boolean;
  quizResults: boolean;
  events: boolean;
  opportunities: boolean;
}

interface AppState {
  tenant: Tenant;
  user: User;
  xp: number;
  level: number;
  xpForNextLevel: number;
  xpProgress: number;
  badges: Badge[];
  notifications: AppNotification[];
  preferences: NotificationPreferences;
}

interface AppContextType extends AppState {
  awardXP: (amount: number, reason: string) => void;
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  dismissNotification: (id: string) => void;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => void;
  updateUser: (updates: Partial<User>) => void;
  hasPermission: (role: UserRole[]) => boolean;
}


const AppContext = createContext<AppContextType | undefined>(undefined);

// Mock Initial Tenant/User for SaaS simulation
const DEFAULT_TENANT: Tenant = {
  id: 'uni-a',
  name: 'Campus Institute',
  logo: 'A',
  theme: 'indigo'
};

const DEFAULT_USER: User = {
  id: 'user-001',
  name: 'Felix K.',
  email: 'felix@student.campus.edu',
  role: 'student',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [tenant] = useState<Tenant>(DEFAULT_TENANT);
  const [user, setUser] = useState<User>(DEFAULT_USER);
  const [xp, setXp] = useState(1240);
  const [badges] = useState<Badge[]>([
    {
      id: 'early_bird',
      name: 'Pioneer',
      icon: '🚀',
      description: 'The first cohort of CampusOS.',
      earnedAt: new Date().toISOString()
    }
  ]);
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif-1',
      type: 'message',
      title: 'New Message',
      message: 'Dr. Smith sent you a message regarding your thesis.',
      read: false,
      timestamp: new Date().toISOString(),
      link: '/messages'
    },
    {
      id: 'notif-2',
      type: 'quiz',
      title: 'Quiz Results are in',
      message: 'You scored 95% in Advanced Economics.',
      read: false,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      link: '/quizzes'
    },
    {
      id: 'notif-3',
      type: 'event',
      title: 'Upcoming Event',
      message: 'Campus Hackathon starts in 2 days. Register now!',
      read: true,
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      link: '/community'
    }
  ]);

  const [preferences, setPreferences] = useState<NotificationPreferences>({
    messages: true,
    quizResults: true,
    events: true,
    opportunities: true,
  });

  const level = Math.floor(xp / 500) + 1;
  const currentLevelXP = xp % 500;
  const xpForNextLevel = 500;
  const xpProgress = (currentLevelXP / xpForNextLevel) * 100;

  const addNotification = useCallback((notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    // Check preferences before adding if applicable
    if (notif.type === 'message' && !preferences.messages) return;
    if (notif.type === 'quiz' && !preferences.quizResults) return;
    if (notif.type === 'event' && !preferences.events) return;
    if (notif.type === 'opportunity' && !preferences.opportunities) return;

    const newNotif: AppNotification = {
      ...notif,
      id: Math.random().toString(36).substring(7),
      read: false,
      timestamp: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);
  }, [preferences]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const updatePreferences = useCallback((prefs: Partial<NotificationPreferences>) => {
    setPreferences(prev => ({ ...prev, ...prefs }));
  }, []);

  const awardXP = useCallback((amount: number, reason: string) => {
    setXp((prev) => prev + amount);
    
    // Add XP notification
    const notifId = Math.random().toString(36).substring(7);
    const xpNotif: AppNotification = {
      id: notifId,
      type: 'xp',
      title: 'XP Gained',
      message: reason,
      amount,
      read: false,
      timestamp: new Date().toISOString(),
    };
    
    setNotifications((prev) => [xpNotif, ...prev]);

    // Auto-dismiss XP toast
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== notifId));
    }, 3500);
  }, []);


  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(prev => ({ ...prev, ...updates }));
  }, []);

  const hasPermission = (allowedRoles: UserRole[]) => {
    return allowedRoles.includes(user.role);
  };

  return (
    <AppContext.Provider value={{ 
      tenant, 
      user, 
      xp, 
      level, 
      xpForNextLevel, 
      xpProgress, 
      badges, 
      notifications, 
      preferences,
      awardXP, 
      addNotification,
      markNotificationRead,
      dismissNotification,
      updatePreferences,
      updateUser,
      hasPermission
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
