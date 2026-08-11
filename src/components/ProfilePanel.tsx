import React, { useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Settings, 
  LogOut, 
  User, 
  ShieldCheck, 
  Award,
  Zap,
  Camera,
  MapPin,
  GraduationCap,
  FileText,
  Shield,
  Vote,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../lib/utils';

interface ProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

function getReputationRank(reputation: number) {
  if (reputation >= 600) {
    return {
      title: 'Community Elder',
      icon: '👑',
      tier: 4,
      badgeBg: 'bg-indigo-100 dark:bg-indigo-950/50',
      badgeText: 'text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-200 dark:border-indigo-800/50'
    };
  }
  if (reputation >= 300) {
    return {
      title: 'Trusted Member',
      icon: '🛡️',
      tier: 3,
      badgeBg: 'bg-purple-100 dark:bg-purple-950/50',
      badgeText: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-200 dark:border-purple-800/50'
    };
  }
  if (reputation >= 100) {
    return {
      title: 'Member',
      icon: '👥',
      tier: 2,
      badgeBg: 'bg-emerald-100 dark:bg-emerald-950/50',
      badgeText: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800/50'
    };
  }
  return {
    title: 'Initiate',
    icon: '🌱',
    tier: 1,
    badgeBg: 'bg-slate-100 dark:bg-slate-800',
    badgeText: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-200 dark:border-slate-700/50'
  };
}

export function ProfilePanel({ isOpen, onClose }: ProfilePanelProps) {
  const { user, profile } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const displayName = profile?.displayName || user.displayName || 'Student';
  const avatarUrl = profile?.avatarUrl || user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&h=256&fit=crop';
  const level = profile?.trustLevel || 2;
  const reputation = typeof profile?.reputation === 'object' ? (profile?.reputation?.points ?? 100) : (profile?.reputation || profile?.reputationScore || 100);

  // Simulated metrics grounded in actual reputation
  const contributionsCount = Math.max(2, Math.floor(reputation / 15));
  const votesCastCount = Math.max(1, Math.floor(reputation / 8));
  const helpfulVotesCount = Math.max(4, Math.floor(reputation / 5));
  const xp = reputation * 12 + 150;
  const xpProgress = Math.max(10, xp % 100);

  const repRank = getReputationRank(reputation);

  const votingHistory = [
    { id: '1', caseTitle: 'Report of CoC Violation', repEarned: 2, chosenOptionLabel: 'Action', votedAt: new Date().toISOString() },
    { id: '2', caseTitle: 'Resource Verification Dispute', repEarned: 2, chosenOptionLabel: 'No Action', votedAt: new Date(Date.now() - 86400000).toISOString() }
  ];

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Standard visual feedback or real upload trigger
  };

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
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 pointer-events-auto"
          />
          
          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-sm bg-white dark:bg-slate-900 shadow-2xl flex flex-col z-50 pointer-events-auto overflow-hidden"
          >
            {/* Header / Cover Banner */}
            <div className="relative h-40 bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 shrink-0">
              <div className="absolute inset-0 bg-white/10 dark:bg-slate-900/20" />
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
              
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-xl transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto pb-6">
              
              {/* Profile Header Block */}
              <div className="px-6 relative pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-end -mt-12 mb-4 relative z-10">
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-white dark:border-slate-900 shadow-xl shadow-indigo-100 dark:shadow-none bg-slate-100 dark:bg-slate-800 transition-transform group-hover:scale-105">
                      <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
                        <Camera className="w-6 h-6 mb-1" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Edit</span>
                      </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-900 p-1 rounded-xl shadow-lg z-10">
                      <div className="bg-indigo-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm">
                        {level}
                      </div>
                    </div>
                    
                    {/* Hidden Input */}
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleAvatarChange} 
                      accept="image/*" 
                      className="hidden" 
                    />
                  </div>
                  
                  <div className="mb-2">
                    <button className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg transition-colors">
                      Edit Profile
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">{displayName}</h3>
                  <span className={cn(
                    "inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border shadow-sm",
                    repRank.badgeBg, repRank.badgeText, repRank.border
                  )}>
                    <span>{repRank.icon}</span> {repRank.title}
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                  <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 text-sm font-bold capitalize">
                    <ShieldCheck className="w-4 h-4" />
                    {repRank.title}
                  </div>
                  <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-sm font-medium">
                    <GraduationCap className="w-4 h-4" />
                    Computer Science '26
                  </div>
                  <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-sm font-medium">
                    <MapPin className="w-4 h-4" />
                    North Campus
                  </div>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-300 mt-4 leading-relaxed font-medium">
                  Passionate about student governance, decentralized voting, peer collaboration, and community engineering. 🚀
                </p>
              </div>

              {/* Reputation & Stats Overview */}
              <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-800 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
                <div className="p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-black text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <Shield className="w-4 h-4" /> {reputation}
                  </span>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider mt-1">
                    Reputation
                  </span>
                </div>
                <div className="p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-black text-slate-900 dark:text-slate-50">
                    {contributionsCount}
                  </span>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider mt-1 flex items-center gap-1">
                    <FileText className="w-3 h-3 text-indigo-500" /> Uploads & Posts
                  </span>
                </div>
                <div className="p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-black text-purple-600 dark:text-purple-400">
                    {votesCastCount}
                  </span>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider mt-1 flex items-center gap-1">
                    <Vote className="w-3 h-3 text-purple-500" /> Jury Votes
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-6">
                
                {/* Reputation Status Card */}
                <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-purple-500/10 border border-amber-200 dark:border-amber-800/40 rounded-3xl p-5 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{repRank.icon}</span>
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-300 block">CIVIC REPUTATION RANK</span>
                        <h4 className="text-base font-black text-slate-900 dark:text-slate-50">{repRank.title}</h4>
                      </div>
                    </div>
                    <span className="text-xs font-black text-amber-700 dark:text-amber-300 px-2.5 py-1 bg-amber-100 dark:bg-amber-900/60 rounded-xl">
                      Tier {repRank.tier} / 4
                    </span>
                  </div>

                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                    Earned through verified study material shares, helpful community forum answers, and active participation in democratic Community Jury voting.
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-center text-xs font-bold">
                    <div className="p-2.5 bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-slate-200/50 dark:border-slate-800">
                      <span className="text-[9px] font-black uppercase text-slate-400 block">HELPFUL UPVOTES</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-black">{helpfulVotesCount} Likes</span>
                    </div>
                    <div className="p-2.5 bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-slate-200/50 dark:border-slate-800">
                      <span className="text-[9px] font-black uppercase text-slate-400 block">JURY PARTICIPATION</span>
                      <span className="text-purple-600 dark:text-purple-400 font-black">100% Attendance</span>
                    </div>
                  </div>
                </div>

                {/* Voting History Log */}
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-3">
                    <Vote className="w-3.5 h-3.5 text-purple-500" /> Recent Jury Voting History
                  </h4>
                  
                  {votingHistory.length > 0 ? (
                    <div className="space-y-2.5">
                      {votingHistory.map(v => (
                        <div key={v.id} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-left">
                          <div className="flex items-center justify-between text-xs font-black text-slate-800 dark:text-slate-100">
                            <span className="truncate max-w-[200px]">{v.caseTitle}</span>
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">+{v.repEarned} Rep</span>
                          </div>
                          <div className="flex items-center justify-between mt-1 text-[10px] font-bold text-slate-400">
                            <span className="text-purple-600 dark:text-purple-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Voted: "{v.chosenOptionLabel}"
                            </span>
                            <span>{new Date(v.votedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 font-medium italic">No governance votes cast yet.</p>
                  )}
                </div>

                {/* Experience Level */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-100 dark:border-indigo-900/50 rounded-3xl p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <Zap className="w-32 h-32 text-indigo-500 transform rotate-12" />
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4 relative z-10">
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <Zap className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-black text-indigo-900 dark:text-indigo-100 uppercase tracking-widest">Experience Level</h4>
                  </div>
                  
                  <div className="flex items-end gap-2 mb-2 relative z-10">
                    <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight leading-none">{xp}</span>
                    <span className="text-sm font-bold text-indigo-500 dark:text-indigo-300 pb-1 uppercase tracking-wider">XP Total</span>
                  </div>
                  
                  <div className="w-full h-3 bg-indigo-200/50 dark:bg-indigo-900/50 rounded-full overflow-hidden mt-6 relative z-10">
                    <div className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full" style={{ width: `${xpProgress}%` }} />
                  </div>
                  <div className="flex justify-between text-xs font-bold text-indigo-500 dark:text-indigo-400 mt-2 relative z-10 uppercase tracking-wider">
                    <span>Level {level}</span>
                    <span>Level {level + 1}</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 shrink-0 flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-700 dark:text-slate-200 font-bold text-sm transition-all shadow-sm">
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <button className="flex items-center justify-center p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-red-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-500 dark:text-slate-400 font-bold text-sm transition-all shadow-sm group">
                <LogOut className="w-4 h-4 group-hover:text-red-600 transition-colors" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
