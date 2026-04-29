import React from 'react';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Settings, 
  LogOut, 
  User, 
  ShieldCheck, 
  Award,
  Zap
} from 'lucide-react';
import { cn } from '../lib/utils';

interface ProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfilePanel({ isOpen, onClose }: ProfilePanelProps) {
  const { user, level, xp, xpProgress, badges } = useAppContext();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 pointer-events-auto"
          />
          
          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl flex flex-col z-50 pointer-events-auto"
          >
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" />
                Profile
              </h2>
              <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-8">
              {/* Profile Header Block */}
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-white shadow-xl shadow-indigo-100 bg-slate-100">
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-3 -right-3 bg-white p-1 rounded-xl shadow-lg">
                    <div className="bg-indigo-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm">
                      {level}
                    </div>
                  </div>
                </div>
                
                <h3 className="text-xl font-black text-slate-900 tracking-tight">{user.name}</h3>
                <div className="flex items-center gap-1.5 text-slate-500 text-sm mt-1 font-medium capitalize">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  {user.role.replace('_', ' ')}
                </div>
              </div>

              {/* Stats Block */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                  <Zap className="w-24 h-24 text-indigo-500 transform rotate-12" />
                </div>
                
                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 relative z-10">Current Progress</h4>
                
                <div className="flex items-end gap-2 mb-2 relative z-10">
                  <span className="text-3xl font-black text-indigo-900 tracking-tight leading-none">{xp}</span>
                  <span className="text-sm font-bold text-indigo-600 pb-1">XP Total</span>
                </div>
                
                <div className="w-full h-2 bg-indigo-200/50 rounded-full overflow-hidden mt-4 relative z-10">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${xpProgress}%` }} />
                </div>
                <div className="flex justify-between text-xs font-bold text-indigo-500 mt-2 relative z-10">
                  <span>Level {level}</span>
                  <span>Level {level + 1}</span>
                </div>
              </div>

              {/* Badges Block */}
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Award className="w-3.5 h-3.5" /> Recent Badges
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {badges.slice(0, 4).map(badge => (
                    <div key={badge.id} className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex flex-col items-center text-center gap-2">
                      <div className="text-3xl">{badge.icon}</div>
                      <div>
                        <div className="text-[10px] sm:text-xs font-bold text-slate-800 line-clamp-1">{badge.name}</div>
                        <div className="text-[8px] sm:text-[9px] text-slate-500 mt-0.5 line-clamp-2">{badge.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 mt-auto space-y-2">
              <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-sm transition-all text-slate-700 font-bold text-sm">
                <div className="flex items-center gap-3">
                  <Settings className="w-4 h-4 text-slate-400" />
                  Account Settings
                </div>
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-red-50 text-red-600 font-bold text-sm transition-all">
                <div className="flex items-center gap-3">
                  <LogOut className="w-4 h-4" />
                  Log Out
                </div>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
