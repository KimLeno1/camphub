import React from 'react';
import { useAppContext } from '../context/AppContext';
import { 
  Briefcase, 
  Globe, 
  MapPin, 
  Calendar, 
  ExternalLink, 
  Filter, 
  Search,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export function Opportunities() {
  const { tenant, awardXP } = useAppContext();

  const opportunites = [
    {
      id: 1,
      title: 'Full Stack Engineering Internship',
      company: 'TechFlow Systems',
      location: 'Remote / Lagos',
      type: 'Internship',
      tags: ['SaaS', 'Node.js', 'React'],
      credits: 200,
      deadline: 'Oct 30, 2026'
    },
    {
      id: 2,
      title: 'Global Merit Scholarship',
      company: 'Commonwealth Scholars',
      location: 'International',
      type: 'Scholarship',
      tags: ['Academic', 'Fully Funded'],
      credits: 500,
      deadline: 'Nov 15, 2026'
    },
    {
      id: 3,
      title: 'AI Ethics Fellowship',
      company: 'Nexus Institute',
      location: 'Hybrid',
      type: 'Fellowship',
      tags: ['Policy', 'Tech'],
      credits: 300,
      deadline: 'Dec 05, 2026'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="text-left">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Opportunity Graph</h1>
          <p className="text-slate-400 font-medium mt-1 uppercase text-[10px] tracking-widest">Global Pathways via {tenant.name}</p>
        </div>
        <div className="flex gap-3">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search pathways..." className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-100 transition shadow-sm w-full sm:w-64" />
           </div>
           <button className="p-2.5 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 transition">
              <Filter className="w-5 h-5" />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Featured Pathways */}
        <div className="lg:col-span-8 space-y-6">
           {opportunites.map((op) => (
             <motion.div 
               whileHover={{ scale: 1.01 }}
               key={op.id} 
               className="bento-card bg-white p-6 border-slate-100 flex flex-col sm:flex-row gap-6 relative overflow-hidden group text-left"
             >
                <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center shrink-0 group-hover:border-indigo-100 transition-colors">
                   <Briefcase className="w-8 h-8 text-indigo-400 group-hover:text-indigo-600 transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                   <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-black text-slate-800 tracking-tight truncate group-hover:text-indigo-600 transition-colors">{op.title}</h3>
                      <span className="badge bg-indigo-50 text-indigo-600 border border-indigo-100 shrink-0">+{op.credits} CR</span>
                   </div>
                   <p className="text-sm font-bold text-slate-500 mb-4">{op.company}</p>
                   
                   <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">
                      <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {op.location}</span>
                      <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Deadline: {op.deadline}</span>
                      <span className="flex items-center gap-1.5 font-black text-indigo-600 px-2 py-0.5 bg-indigo-50 rounded border border-indigo-100">{op.type}</span>
                   </div>

                   <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <div className="flex gap-2">
                         {op.tags.map(tag => (
                           <span key={tag} className="px-2.5 py-1 bg-slate-50 text-slate-400 rounded-lg text-[9px] font-black uppercase border border-slate-100">{tag}</span>
                         ))}
                      </div>
                      <button 
                        onClick={() => awardXP(20, `Applied: ${op.title}`)}
                        className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 transition"
                      >
                         Apply Now <ExternalLink className="w-4 h-4" />
                      </button>
                   </div>
                </div>
             </motion.div>
           ))}
        </div>

        {/* Global Insight Panel */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bento-card bg-indigo-600 text-white p-8 relative overflow-hidden text-left shadow-2xl shadow-indigo-100">
              <Globe className="absolute -right-12 -bottom-12 w-48 h-48 opacity-10 rotate-12" />
              <div className="relative z-10">
                 <h2 className="text-2xl font-black mb-4 tracking-tight">Professional Sync</h2>
                 <p className="text-indigo-100 font-medium text-sm leading-relaxed mb-8">
                    CampusOS synchronizes your institutional credits with global talent marketplaces. High merit scores unlock premium internships.
                 </p>
                 <div className="space-y-3 mb-8">
                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest p-3 bg-white/10 rounded-2xl border border-white/10">
                       <span>Talent Profile</span>
                       <span className="text-indigo-200">92% Verified</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest p-3 bg-white/10 rounded-2xl border border-white/10">
                       <span>Market Visibility</span>
                       <span className="text-green-400">High Impact</span>
                    </div>
                 </div>
                 <button className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-50 transition">
                    Export Credentials
                 </button>
              </div>
           </div>

           <div className="bento-card bg-white border-slate-100 p-6 text-left">
              <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-tight">
                 <Sparkles className="w-5 h-5 text-indigo-400" /> Career AI Suggests
              </h2>
              <div className="space-y-4">
                 <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer hover:border-indigo-200 transition group">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight mb-1 group-hover:text-indigo-600 transition-colors">Data Science Workshop</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Closes in 48 hours • +150 Credits</p>
                 </div>
                 <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer hover:border-indigo-200 transition group">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight mb-1 group-hover:text-indigo-600 transition-colors">Summer Research Grant</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Matching your academic profile</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
