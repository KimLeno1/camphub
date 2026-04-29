import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  BookOpen, 
  Target, 
  MessageSquare, 
  Users, 
  LayoutDashboard,
  CalendarDays,
  Menu,
  Trophy,
  Briefcase,
  Settings,
  Bell,
  MoreHorizontal,
  Send
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { ProfilePanel } from './ProfilePanel';

export function Layout() {
  const { tenant, user, level, xpProgress, xp, xpForNextLevel, notifications, hasPermission } = useAppContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const [profilePanelOpen, setProfilePanelOpen] = useState(false);

  const navItems = [
    { name: 'Home', path: '/', icon: LayoutDashboard, roles: ['student', 'teacher', 'campus_admin'] },
    { name: 'Academy', path: '/academy', icon: BookOpen, roles: ['student', 'teacher'] },
    { name: 'Quests', path: '/quests', icon: Target, roles: ['student'] },
    { name: 'Clubs', path: '/clubs', icon: Users, roles: ['student', 'teacher'] },
    { name: 'Opportunities', path: '/opportunities', icon: Briefcase, roles: ['student', 'teacher'] },
    { name: 'Hall of Fame', path: '/leaderboard', icon: Trophy, roles: ['student', 'teacher', 'campus_admin'] },
    { name: 'Community', path: '/community', icon: MessageSquare, roles: ['student', 'teacher'] },
    { name: 'Messages', path: '/messages', icon: Send, roles: ['student', 'teacher', 'campus_admin'] },
    { name: 'Notifications', path: '/notifications', icon: Bell, roles: ['student', 'teacher', 'campus_admin'] },
    { name: 'Events', path: '/events', icon: CalendarDays, roles: ['student', 'teacher', 'campus_admin'] },
    { name: 'Admin', path: '/admin', icon: Settings, roles: ['campus_admin', 'super_admin'] },
  ];

  const filteredNav = navItems.filter(item => hasPermission(item.roles as any));

  return (
    <div className="flex h-[100dvh] bg-[#F1F5F9] text-slate-900 overflow-hidden font-sans">
      {/* Sidebar - Desktop Only */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 z-50">
        <div className="p-6 flex items-center gap-3 shrink-0 text-left">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold ring-4 ring-indigo-50">
             {tenant.logo}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-slate-800 uppercase leading-none">CampusOS</span>
            <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest mt-1">{tenant.name}</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          {filteredNav.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group relative",
                isActive 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5" />
                {item.name}
              </div>
              {item.name === 'Notifications' && notifications.filter(n => n.type !== 'xp' && !n.read).length > 0 && (
                <span className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full font-bold",
                  "bg-red-500 text-white shadow-md shadow-red-200/50"
                 )}>
                  {notifications.filter(n => n.type !== 'xp' && !n.read).length}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
           <div 
             className="bg-slate-50 rounded-2xl p-3 border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors"
             onClick={() => setProfilePanelOpen(true)}
           >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 border-2 border-indigo-600 p-0.5">
                   <img src={user.avatar} alt="Avatar" className="w-full h-full rounded-full" />
                </div>
                <div className="flex flex-col overflow-hidden text-left">
                   <span className="text-xs font-bold text-slate-800 truncate">{user.name}</span>
                   <span className="text-[10px] text-slate-400 font-medium truncate capitalize">{user.role.replace('_', ' ')}</span>
                </div>
              </div>
              <div className="flex justify-between text-[10px] items-center mb-1 font-bold uppercase tracking-wider text-slate-500">
                <span>LVL {level}</span>
                <span className="text-indigo-600">{xp} XP</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="xp-gradient h-full rounded-full" style={{ width: `${xpProgress}%` }} />
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="min-h-[80px] pt-safe w-full px-4 sm:px-8 py-3 flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md shrink-0 z-40 text-left">
           <div className="flex items-center gap-3 md:hidden">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">
               {tenant.logo}
            </div>
          </div>

          <div className="hidden sm:block">
             <h1 className="text-lg font-bold text-slate-800">Operational Hub</h1>
             <p className="text-xs text-slate-400 font-medium tracking-wide">Managing {tenant.name}</p>
          </div>

          <div className="flex items-center gap-4">
             <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-full">
                <Trophy className="w-4 h-4" />
                <span className="text-xs font-bold">Academic Elite</span>
             </div>
             
             <div className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
             </div>

             <div 
               className="w-10 h-10 rounded-full overflow-hidden border-2 border-indigo-600 p-0.5 cursor-pointer hover:opacity-80 transition-opacity"
               onClick={() => setProfilePanelOpen(true)}
             >
                <img src={user.avatar} alt="Avatar" className="w-full h-full rounded-full" />
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto relative p-4 sm:p-6 lg:p-8 pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-8">
           <Outlet />
           
           <ProfilePanel isOpen={profilePanelOpen} onClose={() => setProfilePanelOpen(false)} />

           <div className="fixed bottom-24 md:bottom-8 right-8 z-50 pointer-events-none pb-safe">
              <AnimatePresence>
                {notifications.filter(n => n.type === 'xp').map((notif) => (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, x: 20, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white px-4 py-3 rounded-2xl shadow-2xl border border-indigo-100 flex items-center gap-4 min-w-[240px] mb-2 pointer-events-auto"
                  >
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">+{notif.amount} Credits Acquired</p>
                      <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{notif.message}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
           </div>
        </main>

        {/* Mobile Nav */}
        <div className="md:hidden">
          <AnimatePresence>
            {mobileMoreOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 left-4 bg-white p-2 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 flex flex-col gap-1 z-50 max-h-[50vh] overflow-y-auto"
              >
                {filteredNav.slice(4).map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileMoreOpen(false)}
                    className={({ isActive }) => cn(
                      "flex items-center justify-between px-4 py-3 rounded-xl transition-all text-left",
                      isActive 
                        ? "bg-indigo-50 text-indigo-600 font-black" 
                        : "text-slate-500 hover:bg-slate-50 font-bold"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span className="text-sm tracking-tight">{item.name}</span>
                    </div>
                    {item.name === 'Notifications' && notifications.filter(n => n.type !== 'xp' && !n.read).length > 0 && (
                       <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-md">
                         {notifications.filter(n => n.type !== 'xp' && !n.read).length}
                       </span>
                     )}
                  </NavLink>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <nav className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 flex items-center justify-between px-1 sm:px-2 h-[calc(4.5rem+env(safe-area-inset-bottom))] z-50 pb-safe pt-1 gap-1">
            {filteredNav.slice(0, 4).map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setMobileMoreOpen(false)}
                className={({ isActive }) => cn(
                  "flex flex-col items-center justify-center flex-1 h-14 rounded-2xl transition-all duration-300 min-w-0",
                  isActive 
                    ? "bg-indigo-600 text-white shadow-xl shadow-indigo-200/50 -translate-y-2" 
                    : "text-slate-400 hover:text-slate-600"
                )}
              >
                <item.icon className="w-5 h-5 mb-1 shrink-0" />
                <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-wide truncate w-full text-center px-1">{item.name}</span>
              </NavLink>
            ))}

            {filteredNav.length > 4 && (
              <button
                onClick={() => setMobileMoreOpen(!mobileMoreOpen)}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-14 rounded-2xl transition-all duration-300 min-w-0",
                  mobileMoreOpen 
                    ? "bg-indigo-50 text-indigo-600 -translate-y-2" 
                    : "text-slate-400 hover:text-slate-600"
                )}
              >
                <MoreHorizontal className="w-5 h-5 mb-1 shrink-0" />
                <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-wide truncate w-full text-center px-1">More</span>
              </button>
            )}
          </nav>
        </div>
      </div>
    </div>
  );
}
