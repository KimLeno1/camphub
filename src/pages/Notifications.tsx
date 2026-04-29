import React, { useState } from 'react';
import { useAppContext, NotificationPreferences, NotificationType } from '../context/AppContext';
import { 
  Bell, 
  Settings, 
  Check, 
  MessageSquare, 
  Trophy, 
  CalendarDays, 
  Briefcase, 
  AlertCircle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

export function Notifications() {
  const { notifications, preferences, updatePreferences, markNotificationRead, dismissNotification } = useAppContext();
  const [showSettings, setShowSettings] = useState(false);

  // Filter out XP toasts 
  const displayNotifications = notifications.filter(n => n.type !== 'xp');
  const unreadCount = displayNotifications.filter(n => !n.read).length;

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'message': return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'quiz': return <Trophy className="w-5 h-5 text-amber-500" />;
      case 'event': return <CalendarDays className="w-5 h-5 text-emerald-500" />;
      case 'opportunity': return <Briefcase className="w-5 h-5 text-purple-500" />;
      default: return <AlertCircle className="w-5 h-5 text-indigo-500" />;
    }
  };

  const getBgColor = (type: NotificationType) => {
    switch (type) {
      case 'message': return 'bg-blue-50';
      case 'quiz': return 'bg-amber-50';
      case 'event': return 'bg-emerald-50';
      case 'opportunity': return 'bg-purple-50';
      default: return 'bg-indigo-50';
    }
  };

  const markAllRead = () => {
    displayNotifications.forEach(n => {
      if (!n.read) markNotificationRead(n.id);
    });
  };

  const handleTogglePreference = (key: keyof NotificationPreferences) => {
    updatePreferences({ [key]: !preferences[key] });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight uppercase flex items-center gap-3">
            <Bell className="w-8 h-8 text-indigo-600" />
            Notifications
            {unreadCount > 0 && (
              <span className="bg-indigo-600 text-white text-sm px-3 py-1 rounded-full">
                {unreadCount} New
              </span>
            )}
          </h1>
          <p className="text-slate-500 font-medium mt-1">Stay updated with your campus activities.</p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button 
              onClick={markAllRead}
              className="text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-xl transition"
            >
              Mark all as read
            </button>
          )}
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={cn(
              "p-2 rounded-xl border transition",
              showSettings ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
            )}
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Notifications List */}
        <div className={cn("grid gap-4", showSettings ? "lg:col-span-2" : "lg:col-span-3")}>
          <AnimatePresence>
            {displayNotifications.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-white p-12 rounded-3xl border border-slate-100 shadow-sm text-center col-span-full"
              >
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-black text-slate-800 mb-1">You're all caught up!</h3>
                <p className="text-slate-500 text-sm">No new notifications at the moment.</p>
              </motion.div>
            ) : (
              displayNotifications.map((notif) => (
                <motion.div 
                  key={notif.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={cn(
                    "bg-white p-4 rounded-2xl border transition-all duration-300 shadow-sm group",
                    notif.read ? "border-slate-100 opacity-75" : "border-indigo-100 ring-4 ring-indigo-50"
                  )}
                  onClick={() => !notif.read && markNotificationRead(notif.id)}
                >
                  <div className="flex gap-4">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", getBgColor(notif.type))}>
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={cn("font-bold truncate text-base", notif.read ? "text-slate-700" : "text-slate-900")}>
                          {notif.title}
                        </h4>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap shrink-0 mt-1">
                          {new Date(notif.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">{notif.message}</p>
                      
                      {notif.link && (
                        <Link 
                          to={notif.link}
                          className="inline-block mt-3 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg transition"
                        >
                          View Details
                        </Link>
                      )}
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        dismissNotification(notif.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition self-start shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="lg:col-span-1"
            >
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl sticky top-8">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Settings className="w-4 h-4" /> Preferences
                </h3>
                
                <div className="space-y-4">
                  <label className="flex items-center justify-between cursor-pointer group p-2 hover:bg-slate-50 rounded-xl transition">
                    <div>
                      <div className="font-bold text-slate-800 text-sm">Direct Messages</div>
                      <div className="text-xs text-slate-500 mt-0.5">Alerts for new chat messages</div>
                    </div>
                    <div className={cn(
                      "w-12 h-6 rounded-full transition-colors flex items-center px-1 border-2",
                      preferences.messages ? "bg-indigo-600 border-indigo-600" : "bg-slate-200 border-slate-200"
                    )}
                    onClick={() => handleTogglePreference('messages')}
                    >
                      <motion.div 
                        animate={{ x: preferences.messages ? 24 : 0 }} 
                        className="w-4 h-4 bg-white rounded-full shadow-sm"
                      />
                    </div>
                  </label>

                  <label className="flex items-center justify-between cursor-pointer group p-2 hover:bg-slate-50 rounded-xl transition">
                    <div>
                      <div className="font-bold text-slate-800 text-sm">Quiz Results</div>
                      <div className="text-xs text-slate-500 mt-0.5">Alerts when grades are posted</div>
                    </div>
                    <div className={cn(
                      "w-12 h-6 rounded-full transition-colors flex items-center px-1 border-2",
                      preferences.quizResults ? "bg-amber-500 border-amber-500" : "bg-slate-200 border-slate-200"
                    )}
                    onClick={() => handleTogglePreference('quizResults')}
                    >
                      <motion.div 
                        animate={{ x: preferences.quizResults ? 24 : 0 }} 
                        className="w-4 h-4 bg-white rounded-full shadow-sm"
                      />
                    </div>
                  </label>

                  <label className="flex items-center justify-between cursor-pointer group p-2 hover:bg-slate-50 rounded-xl transition">
                    <div>
                      <div className="font-bold text-slate-800 text-sm">Upcoming Events</div>
                      <div className="text-xs text-slate-500 mt-0.5">Reminders for campus events</div>
                    </div>
                    <div className={cn(
                      "w-12 h-6 rounded-full transition-colors flex items-center px-1 border-2",
                      preferences.events ? "bg-emerald-500 border-emerald-500" : "bg-slate-200 border-slate-200"
                    )}
                    onClick={() => handleTogglePreference('events')}
                    >
                      <motion.div 
                        animate={{ x: preferences.events ? 24 : 0 }} 
                        className="w-4 h-4 bg-white rounded-full shadow-sm"
                      />
                    </div>
                  </label>

                  <label className="flex items-center justify-between cursor-pointer group p-2 hover:bg-slate-50 rounded-xl transition">
                    <div>
                      <div className="font-bold text-slate-800 text-sm">Opportunities</div>
                      <div className="text-xs text-slate-500 mt-0.5">Alerts for internships & jobs</div>
                    </div>
                    <div className={cn(
                      "w-12 h-6 rounded-full transition-colors flex items-center px-1 border-2",
                      preferences.opportunities ? "bg-purple-500 border-purple-500" : "bg-slate-200 border-slate-200"
                    )}
                    onClick={() => handleTogglePreference('opportunities')}
                    >
                      <motion.div 
                        animate={{ x: preferences.opportunities ? 24 : 0 }} 
                        className="w-4 h-4 bg-white rounded-full shadow-sm"
                      />
                    </div>
                  </label>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
