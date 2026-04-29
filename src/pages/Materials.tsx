import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { 
  FileText, 
  Search, 
  Plus, 
  Download, 
  Share2, 
  BookOpen, 
  Clock, 
  Tag,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';

export function Materials() {
  const { awardXP, tenant } = useAppContext();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const handleDownload = (title: string) => {
    awardXP(10, `Synchronized: ${title}`);
  };

  const MATERIALS = [
    { id: 1, title: 'Calculus 101 Cheat Sheet', author: 'Dr. Smith', type: 'PDF', tags: ['Math', 'Basic'], downloads: 42, date: '2d ago' },
    { id: 2, title: 'World History Timeline', author: 'Sarah K.', type: 'ZIP', tags: ['History', 'Prep'], downloads: 85, date: '5d ago' },
    { id: 3, title: 'Chemistry Lab Notes', author: 'Alex M.', type: 'DOC', tags: ['Chemistry', 'Lab'], downloads: 21, date: '1w ago' },
  ];

  const filtered = MATERIALS.filter(m => 
    (filter === 'All' || m.tags.includes(filter)) &&
    (m.title.toLowerCase().includes(search.toLowerCase()) || m.author.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="text-left">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Institutional Academy</h1>
          <p className="text-slate-400 font-medium mt-1 uppercase text-[10px] tracking-widest">{tenant.name} Archive</p>
        </div>
        <button 
          onClick={() => awardXP(50, 'Shared educational resource')}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition shadow-xl shadow-indigo-100"
        >
          <Plus className="w-5 h-5" /> Share Resource
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search archive..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-3xl focus:ring-4 focus:ring-indigo-50 transition outline-none font-medium"
          />
        </div>
        <div className="flex gap-2 p-1.5 bg-slate-100 rounded-3xl shrink-0 overflow-x-auto scrollbar-none relative">
          {['All', 'Math', 'History', 'Chemistry'].map(tag => (
            <button
              key={tag}
              onClick={() => setFilter(tag)}
              className={cn(
                "px-4 sm:px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                filter === tag 
                  ? "bg-white text-indigo-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filtered.map((mat) => (
            <motion.div
              layout
              key={mat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bento-card bg-white p-6 hover:shadow-2xl hover:scale-[1.02] transition-all group border-slate-100 text-left"
            >
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner ring-4 ring-indigo-50/50 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-800 mb-1 tracking-tight group-hover:text-indigo-600 transition-colors uppercase">{mat.title}</h3>
              <p className="text-xs font-bold text-slate-400 mb-6 tracking-wide">COLLABORATOR: <span className="text-slate-600">{mat.author}</span></p>
              
              <div className="flex flex-wrap gap-2 mb-8">
                {mat.tags.map(tag => (
                  <span key={tag} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100">
                    <Tag className="w-3 h-3" /> {tag}
                  </span>
                ))}
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-slate-50">
                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-indigo-300" /> {mat.date}</span>
                  <span className="bg-slate-100 px-2.5 py-1 rounded-lg text-slate-500">{mat.type}</span>
                </div>
                <button 
                  onClick={() => handleDownload(mat.title)}
                  className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition shadow-sm group/btn"
                >
                  <Download className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="bento-card bg-slate-900 text-white p-10 relative overflow-hidden text-left">
         <BookOpen className="absolute -right-16 -bottom-16 w-64 h-64 opacity-10 -rotate-12" />
         <div className="relative z-10 max-w-lg">
            <h2 className="text-2xl font-black mb-4 tracking-tight uppercase">Knowledge Pooling Reward</h2>
            <p className="text-slate-400 font-medium mb-6 leading-relaxed">
              Sharing high-quality resources contributes to your institutional merit. Top contributors earn early access to global research opportunities.
            </p>
            <button className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-500 transition shadow-xl shadow-indigo-900/50">
              View Leaderboard
            </button>
         </div>
      </div>
    </div>
  );
}
