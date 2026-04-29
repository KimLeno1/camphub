import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, TrendingUp, Medal, ShieldCheck, Zap, Search } from 'lucide-react';
import { cn } from '../lib/utils';

type TabType = 'week' | 'month' | 'all';

// MOCK DATA for leaderboard
const LEADERBOARD_DATA = {
  week: [
    { id: '1', name: 'Lia Chen', xp: 1200, avatar: 'LC' },
    { id: '2', name: 'Marcus V.', xp: 950, avatar: 'MV' },
    { id: '3', name: 'Felix K.', xp: 820, avatar: 'FK' },
    { id: '4', name: 'Sarah J.', xp: 700, avatar: 'SJ' },
    { id: '5', name: 'Omar D.', xp: 650, avatar: 'OD' },
    { id: '6', name: 'Jenna L.', xp: 500, avatar: 'JL' },
    { id: '7', name: 'Alex M.', xp: 420, avatar: 'AM' },
  ],
  month: [
    { id: '2', name: 'Marcus V.', xp: 4500, avatar: 'MV' },
    { id: '1', name: 'Lia Chen', xp: 4100, avatar: 'LC' },
    { id: '4', name: 'Sarah J.', xp: 3800, avatar: 'SJ' },
    { id: '3', name: 'Felix K.', xp: 3500, avatar: 'FK' },
    { id: '7', name: 'Alex M.', xp: 3100, avatar: 'AM' },
    { id: '5', name: 'Omar D.', xp: 2900, avatar: 'OD' },
    { id: '6', name: 'Jenna L.', xp: 2200, avatar: 'JL' },
  ],
  all: [
    { id: '1', name: 'Lia Chen', xp: 14500, avatar: 'LC' },
    { id: '4', name: 'Sarah J.', xp: 13200, avatar: 'SJ' },
    { id: '3', name: 'Felix K.', xp: 12800, avatar: 'FK', isCurrent: true }, // Felix is user
    { id: '2', name: 'Marcus V.', xp: 11000, avatar: 'MV' },
    { id: '5', name: 'Omar D.', xp: 9500, avatar: 'OD' },
    { id: '7', name: 'Alex M.', xp: 8200, avatar: 'AM' },
    { id: '6', name: 'Jenna L.', xp: 7500, avatar: 'JL' },
  ]
};

export function Leaderboard() {
  const { tenant, user, xp } = useAppContext();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const currentData = [...LEADERBOARD_DATA[activeTab]];
  
  // Inject user's current XP dynamically for 'All Time' so it aligns with app context
  if (activeTab === 'all') {
    const userIndex = currentData.findIndex(u => u.isCurrent);
    if (userIndex !== -1) {
       currentData[userIndex].xp = xp;
       // Re-sort data
       currentData.sort((a, b) => b.xp - a.xp);
    }
  }

  const currentDataWithRank = currentData.map((u, i) => ({ ...u, rank: i + 1 }));

  const filteredData = currentDataWithRank.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // If searching, we don't necessarily show top 3 podium layout
  const isSearching = searchQuery.trim().length > 0;

  const topThree = currentDataWithRank.slice(0, 3);
  const remainingListRaw = currentDataWithRank.slice(3);

  const currentUser = currentDataWithRank.find(u => u.isCurrent || u.name === user.name);
  const userInTopThree = currentUser && currentUser.rank <= 3;
  
  const isPinnedFeatureActive = activeTab === 'all';
  const currentUserPinned = (isPinnedFeatureActive && currentUser && !userInTopThree && !isSearching) ? currentUser : null;
  
  const remainingList = isSearching 
    ? filteredData 
    : (currentUserPinned ? remainingListRaw.filter(u => u.rank !== currentUser.rank) : remainingListRaw);

  const TABS: { id: TabType; label: string }[] = [
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'all', label: 'All Time' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="text-left">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
             <Trophy className="w-8 h-8 text-amber-500" /> Hall of Fame
          </h1>
          <p className="text-slate-400 font-medium mt-1 uppercase text-[10px] tracking-widest flex items-center gap-1.5">
             <ShieldCheck className="w-3.5 h-3.5" /> Institutional Leaderboard for {tenant.name}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search user..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-48 pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-indigo-50 transition"
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 overflow-x-auto scrollbar-none">
             {TABS.map(tab => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 className={cn(
                   "px-4 md:px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                   activeTab === tab.id 
                     ? "bg-white text-indigo-600 shadow-sm border border-slate-200" 
                     : "text-slate-400 hover:text-slate-600"
                 )}
               >
                 {tab.label}
               </button>
             ))}
          </div>
        </div>
      </div>

      <div className="bento-card bg-white p-4 sm:p-8 md:p-12 border-slate-100 relative shadow-2xl pb-12">
         {/* Decorative background element */}
         <div className="absolute inset-0 overflow-hidden rounded-[2rem] pointer-events-none">
           <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-50/50 rounded-full blur-3xl" />
         </div>

         <AnimatePresence mode="wait">
           <motion.div 
             key={activeTab}
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -10 }}
             transition={{ duration: 0.2 }}
           >
              {/* Top 3 Podium - Desktop */}
              {!isSearching && (
                <div className="hidden sm:flex flex-row justify-center items-end gap-8 mb-8 relative z-30 pt-24 mt-0 sticky top-0 bg-white/95 backdrop-blur-md pb-8 -mx-8 px-8 md:-mx-12 md:px-12 border-b border-slate-100 shadow-[0_10px_20px_-10px_rgba(0,0,0,0.05)] rounded-b-[2rem]">
                   {/* Position 2 (Silver) */}
                   {topThree[1] && (
                     <motion.div whileHover={{ scale: 1.05, y: -5 }} className="flex flex-col items-center order-1 relative cursor-pointer group">
                       <div className="w-20 h-20 bg-slate-200 rounded-full border-4 border-slate-300 flex items-center justify-center font-black text-slate-500 shadow-xl relative z-10 text-xl group-hover:border-indigo-400 group-hover:text-indigo-600 transition-colors">
                         {topThree[1].avatar}
                       </div>
                       <div className="absolute -bottom-4 bg-slate-300 text-slate-800 text-[10px] font-black px-2.5 h-6 flex justify-center items-center rounded-full z-20 border-2 border-white shadow-sm group-hover:bg-indigo-500 group-hover:text-white transition-colors gap-1">
                         <Medal className="w-3 h-3" /> 2
                       </div>
                       <div className="mt-6 text-center">
                          <div className="font-bold text-slate-800 tracking-tight text-sm group-hover:text-indigo-900 transition-colors truncate max-w-[100px]">{topThree[1].name}</div>
                          <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{topThree[1].xp} CR</div>
                       </div>
                     </motion.div>
                   )}

                   {/* Position 1 (Gold) */}
                   {topThree[0] && (
                     <motion.div whileHover={{ scale: 1.05, y: -5 }} className="flex flex-col items-center order-2 relative -translate-y-12 cursor-pointer group mx-0">
                       <div className="absolute -top-10 text-amber-500 bg-amber-50 rounded-full p-2 animate-bounce shadow-sm">
                          <Trophy className="w-6 h-6" />
                       </div>
                       <div className="w-28 h-28 bg-amber-100 rounded-full border-4 border-amber-400 flex items-center justify-center font-black text-amber-700 shadow-2xl relative z-10 text-3xl group-hover:border-amber-500 group-hover:bg-amber-200 transition-colors">
                         {topThree[0].avatar}
                       </div>
                       <div className="absolute -bottom-4 bg-amber-400 text-amber-900 text-xs font-black px-3 h-8 flex justify-center items-center rounded-full z-20 border-2 border-white shadow-md gap-1">
                         <Medal className="w-3.5 h-3.5" /> 1
                       </div>
                       <div className="mt-6 text-center">
                          <div className="font-black text-slate-900 tracking-tight text-lg group-hover:text-amber-700 transition-colors truncate max-w-[120px]">{topThree[0].name}</div>
                          <div className="text-[12px] font-black text-indigo-600 uppercase tracking-widest">{topThree[0].xp} CR</div>
                       </div>
                     </motion.div>
                   )}

                   {/* Position 3 (Bronze) */}
                   {topThree[2] && (
                     <motion.div whileHover={{ scale: 1.05, y: -5 }} className="flex flex-col items-center order-3 relative cursor-pointer group">
                       <div className="w-20 h-20 bg-orange-100 rounded-full border-4 border-orange-300 flex items-center justify-center font-black text-orange-800 shadow-xl relative z-10 text-xl group-hover:border-orange-400 group-hover:text-orange-900 transition-colors">
                         {topThree[2].avatar}
                       </div>
                       <div className="absolute -bottom-4 bg-orange-300 text-orange-900 text-[10px] font-black px-2.5 h-6 flex justify-center items-center rounded-full z-20 border-2 border-white shadow-sm group-hover:bg-orange-500 group-hover:text-white transition-colors gap-1">
                         <Medal className="w-3 h-3" /> 3
                       </div>
                       <div className="mt-6 text-center">
                          <div className="font-bold text-slate-800 tracking-tight text-sm group-hover:text-orange-900 transition-colors truncate max-w-[100px]">{topThree[2].name}</div>
                          <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{topThree[2].xp} CR</div>
                       </div>
                     </motion.div>
                   )}
                </div>
              )}

              {/* Top 3 Mobile Stack */}
              {!isSearching && (
                <div className="sm:hidden flex flex-col gap-3 mb-8 pt-4 pb-4 sticky top-0 z-30 bg-white/95 backdrop-blur-md -mx-4 px-4 border-b border-slate-100 shadow-sm rounded-b-3xl">
                  {/* #1 Gold */}
                  {topThree[0] && (
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center gap-4 p-4 rounded-3xl bg-amber-50 border border-amber-200 shadow-lg shadow-amber-100/50 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Trophy className="w-20 h-20 text-amber-500" />
                      </div>
                      <div className="flex flex-col items-center justify-center shrink-0 w-8 text-amber-500 font-black">
                        <span className="text-xl leading-none">1</span>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-white border-2 border-amber-300 flex items-center justify-center text-xl font-black text-amber-700 shadow-inner z-10">
                        {topThree[0].avatar}
                      </div>
                      <div className="flex flex-col flex-1 z-10 min-w-0 pr-2">
                        <span className="text-lg font-black text-amber-900 truncate">{topThree[0].name}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Zap className="w-4 h-4 text-amber-500" />
                          <span className="text-sm font-black text-amber-700">{topThree[0].xp} CR</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  {/* #2 Silver */}
                  {topThree[1] && (
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center gap-4 p-4 rounded-3xl bg-slate-50 border border-slate-200 shadow-md relative overflow-hidden"
                    >
                      <div className="flex flex-col items-center justify-center shrink-0 w-8 text-slate-400 font-black">
                        <span className="text-xl leading-none">2</span>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-white border-2 border-slate-300 flex items-center justify-center text-xl font-black text-slate-600 shadow-inner z-10">
                        {topThree[1].avatar}
                      </div>
                      <div className="flex flex-col flex-1 z-10 min-w-0 pr-2">
                        <span className="text-lg font-black text-slate-800 truncate">{topThree[1].name}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Zap className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-black text-slate-600">{topThree[1].xp} CR</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  {/* #3 Bronze */}
                  {topThree[2] && (
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center gap-4 p-4 rounded-3xl bg-orange-50 border border-orange-200 shadow-md relative overflow-hidden"
                    >
                      <div className="flex flex-col items-center justify-center shrink-0 w-8 text-orange-400 font-black">
                        <span className="text-xl leading-none">3</span>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-white border-2 border-orange-300 flex items-center justify-center text-xl font-black text-orange-700 shadow-inner z-10">
                        {topThree[2].avatar}
                      </div>
                      <div className="flex flex-col flex-1 z-10 min-w-0 pr-2">
                        <span className="text-lg font-black text-orange-900 truncate">{topThree[2].name}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Zap className="w-4 h-4 text-orange-400" />
                          <span className="text-sm font-black text-orange-700">{topThree[2].xp} CR</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              <div className="space-y-3 sm:space-y-4 relative z-10 pb-4 sm:pb-0">
                 {remainingList.map((u) => {
                   return (
                     <motion.div 
                       key={u.id}
                       whileHover={{ scale: 1.02, y: -2 }}
                       className="flex items-center justify-between p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all duration-300 group"
                     >
                       <div className="flex items-center gap-3 sm:gap-6 min-w-0">
                         <span className="w-5 sm:w-6 text-center text-sm font-black text-slate-400 group-hover:text-indigo-500 transition-colors shrink-0">
                           {u.rank}
                         </span>
                         <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-sm font-black text-white shadow-inner bg-slate-300 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors shrink-0">
                           {u.avatar}
                         </div>
                         <div className="flex flex-col text-left min-w-0 pr-2">
                           <span className="text-sm sm:text-base font-bold tracking-tight text-slate-800 group-hover:text-indigo-900 transition-colors truncate">
                             {u.name}
                           </span>
                           <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">Academic</span>
                         </div>
                       </div>
                       <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                          <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-slate-300 group-hover:text-amber-500 transition-colors" />
                          <span className="font-black text-xs sm:text-sm text-slate-500 group-hover:text-indigo-600 transition-colors">
                            {u.xp >= 1000 ? (u.xp/1000).toFixed(1) + 'k' : u.xp} <span className="hidden sm:inline">CR</span>
                          </span>
                       </div>
                     </motion.div>
                   );
                 })}

                 {currentUserPinned && (
                   <motion.div 
                     whileHover={{ scale: 1.02, y: -2 }}
                     className="flex items-center justify-between p-3 sm:p-4 rounded-2xl bg-indigo-50 border-indigo-200 shadow-md ring-2 ring-indigo-100 transition-all duration-300 sticky bottom-4 z-20 mt-4"
                   >
                     <div className="flex items-center gap-3 sm:gap-6 min-w-0">
                       <span className="w-5 sm:w-6 text-center text-sm font-black text-indigo-600 shrink-0">
                         {currentUserPinned.rank}
                       </span>
                       <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-sm font-black text-white shadow-inner bg-indigo-600 shrink-0">
                         {currentUserPinned.avatar}
                       </div>
                       <div className="flex flex-col text-left min-w-0 pr-2">
                         <span className="text-sm sm:text-base font-bold tracking-tight text-indigo-900 truncate">
                           {currentUserPinned.name} <span className="opacity-60 text-[10px]">(You)</span>
                         </span>
                         <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-indigo-400">Academic</span>
                       </div>
                     </div>
                     <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                        <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-500" />
                        <span className="font-black text-xs sm:text-sm text-indigo-600">
                          {currentUserPinned.xp >= 1000 ? (currentUserPinned.xp/1000).toFixed(1) + 'k' : currentUserPinned.xp} <span className="hidden sm:inline">CR</span>
                        </span>
                     </div>
                   </motion.div>
                 )}
              </div>
           </motion.div>
         </AnimatePresence>
      </div>
    </div>
  );
}
