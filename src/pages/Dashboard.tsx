import React from 'react';
import { motion } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { BookOpen, Target, Users, Flame, ChevronRight, Award, Zap, TrendingUp, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

export function Dashboard() {
  const { tenant, user, level, xpProgress, xp, xpForNextLevel, badges } = useAppContext();
  const navigate = useNavigate();

  const quests = [
    { id: 1, title: 'Ace a Math Quiz', xp: 50, type: 'quiz', path: '/quests', icon: Target },
    { id: 2, title: 'Upload Study Notes', xp: 30, type: 'material', path: '/academy', icon: BookOpen },
    { id: 3, title: 'Help a Peer in Q&A', xp: 15, type: 'social', path: '/community', icon: Users },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 max-w-7xl mx-auto">
      
      {/* Institutional Hero Banner */}
      <div className="bento-card md:col-span-12 bg-white overflow-hidden relative group">
         <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
            <TrendingUp className="w-64 h-64" />
         </div>
         <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
            <div>
               <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                 Welcome to {tenant.name} <span className="text-indigo-600">Hub</span>
               </h1>
               <div className="flex items-center gap-4 text-sm font-bold uppercase tracking-widest text-slate-400">
                  <span className="flex items-center gap-1.5 text-indigo-600">
                     <ShieldCheck className="w-4 h-4" /> Secure Session
                  </span>
                  <span>•</span>
                  <span>System v2.4.0</span>
               </div>
            </div>
            <div className="flex gap-4">
               <button className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition shadow-xl shadow-indigo-100">
                  Global Search
               </button>
            </div>
         </div>
      </div>

      {/* User Progress Stats Card */}
      <div className="bento-card md:col-span-8 bg-white border-slate-100">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              Personal Development <Flame className="w-5 h-5 text-orange-500" />
            </h2>
            <p className="text-slate-400 text-sm font-medium">Tracking your academic evolution within {tenant.name}.</p>
          </div>
          <div className="text-right">
            <span className="badge bg-indigo-50 text-indigo-600 border border-indigo-100">
              Rank: Academic Elite
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-8 mb-8 p-6 bg-slate-50 rounded-3xl border border-slate-100">
          <div className="w-24 h-24 rounded-full border-8 border-white flex items-center justify-center bg-indigo-600 shadow-2xl shadow-indigo-100 text-white">
            <span className="text-4xl font-black">{level}</span>
          </div>
          <div className="flex-1 w-full">
            <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-3">
              <span className="text-slate-500">Global Credits (XP)</span>
              <span className="text-indigo-600">{xp} / {xpForNextLevel * level}</span>
            </div>
            <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, Math.max(0, xpProgress))}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="xp-gradient h-full rounded-full shadow-lg"
              />
            </div>
            <div className="text-right mt-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{xpForNextLevel - (xp % xpForNextLevel)} Credits to Terminal Level</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-6">
          {[
            { label: 'Resources Shared', val: '12' },
            { label: 'Quests Cleared', val: '5' },
            { label: 'Help Points', val: '890' }
          ].map((stat, i) => (
            <div key={i} className="text-center p-4 border border-slate-50 rounded-2xl bg-white shadow-sm">
              <div className="text-2xl font-black text-slate-800">{stat.val}</div>
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Priority Quests Card */}
      <div className="bento-card md:col-span-4 bg-slate-900 text-white border-none relative overflow-hidden">
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="flex items-center gap-2 mb-2 relative z-10">
          <Zap className="w-5 h-5 text-yellow-400" />
          <h2 className="text-lg font-bold uppercase tracking-tight">Priority Quests</h2>
        </div>
        <p className="text-xs text-slate-400 mb-8 relative z-10 font-medium">Verified tasks for institutional growth.</p>
        
        <div className="space-y-4 relative z-10 mt-auto">
          {quests.map(quest => (
            <div 
              key={quest.id} 
              onClick={() => navigate(quest.path)}
              className="bg-white/5 hover:bg-white/10 transition-all cursor-pointer p-4 rounded-2xl border border-white/10 flex items-center gap-4 group"
            >
              <div className="p-2.5 bg-indigo-600/30 rounded-xl group-hover:scale-110 transition shadow-inner">
                <quest.icon className="w-5 h-5 text-indigo-300" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold tracking-tight">{quest.title}</h3>
                <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest transition-colors group-hover:text-indigo-300">+{quest.xp} CREDITS</p>
              </div>
              <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white transition" />
            </div>
          ))}
        </div>
        <button className="w-full mt-6 py-3 bg-indigo-600 rounded-xl text-sm font-bold hover:bg-indigo-500 transition shadow-lg shadow-indigo-900/50">
          Sync Quest Data
        </button>
      </div>

      {/* Recognition & Badges */}
      <div className="bento-card md:col-span-8 bg-white border-slate-100">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
            <Award className="w-6 h-6 text-indigo-600" /> Credentials Archive
          </h2>
          <button className="text-xs text-indigo-600 font-black uppercase tracking-widest hover:underline">Full Profile</button>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-auto">
          {badges.map(badge => (
            <div key={badge.id} className="flex flex-col items-center justify-center p-6 bg-slate-50 border border-slate-100 rounded-3xl text-center hover:bg-white hover:border-indigo-200 hover:shadow-xl transition-all group">
              <div className="text-4xl mb-3 group-hover:scale-125 transition-transform duration-300">{badge.icon}</div>
              <span className="text-[10px] font-black uppercase text-slate-700 tracking-widest">{badge.name}</span>
            </div>
          ))}
          
          {[1, 2, 3].map(i => (
            <div key={i} className="flex flex-col items-center justify-center p-6 bg-slate-50 border border-dashed border-slate-200 rounded-3xl text-center opacity-40 grayscale group cursor-not-allowed">
              <span className="text-4xl mb-3 text-slate-300 group-hover:grayscale-0 transition-all">🔒</span>
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Undefined</span>
            </div>
          ))}
        </div>
      </div>

      {/* Institutional Leaderboard */}
      <div className="bento-card md:col-span-4 bg-white border-slate-100 flex flex-col cursor-pointer hover:border-indigo-200 transition-colors group" onClick={() => navigate('/leaderboard')}>
         <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3 group-hover:text-indigo-600 transition-colors">
            🏆 Merit Rankings
          </h2>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition" />
        </div>
        
        <div className="space-y-3 mt-auto">
          {[ 
            { rank: 1, name: 'Lia Chen', xp: 14500, avatar: 'LC' },
            { rank: 2, name: 'Sarah J.', xp: 13200, avatar: 'SJ' },
            { rank: 3, name: 'Felix K. (You)', xp: xp, avatar: 'FK', highlight: true }
          ].map(user => (
            <div 
              key={user.rank} 
              className={cn(
                "flex items-center justify-between p-3 rounded-2xl border transition-all duration-300",
                user.highlight ? "bg-white border-indigo-200 shadow-2xl ring-4 ring-indigo-50/50" : "bg-transparent border-transparent grayscale group-hover:grayscale-0"
              )}
            >
              <div className="flex items-center gap-4">
                <span className="w-4 text-center text-xs font-bold text-slate-400">#{user.rank}</span>
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black",
                  user.highlight ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-500"
                )}>
                  {user.avatar}
                </div>
                <span className="text-sm font-bold text-slate-800 tracking-tight">{user.name}</span>
              </div>
              <span className="text-indigo-600 font-black text-xs">{user.xp >= 1000 ? (user.xp/1000).toFixed(1) + 'k' : user.xp} CR</span>
            </div>
          ))}
        </div>
        
        <div className="mt-8 py-3 bg-indigo-50 rounded-2xl border border-dashed border-indigo-200 text-[10px] text-indigo-600 text-center uppercase tracking-widest font-black group-hover:bg-indigo-600 group-hover:text-white transition-colors">
          View Global Standings
        </div>
      </div>
    </div>
  );
}
