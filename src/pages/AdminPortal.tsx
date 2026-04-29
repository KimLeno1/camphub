import React from 'react';
import { useAppContext } from '../context/AppContext';
import { 
  Users, 
  BarChart3, 
  ShieldAlert, 
  Settings2, 
  UserPlus, 
  ArrowUpRight, 
  MoreHorizontal,
  Mail,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../lib/utils';

export function AdminPortal() {
  const { tenant, hasPermission } = useAppContext();

  if (!hasPermission(['campus_admin', 'super_admin'])) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-10">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">Access Restricted</h2>
        <p className="text-slate-500">Only authorized institutional administrators can access this terminal.</p>
      </div>
    );
  }

  const stats = [
    { label: 'Total Students', value: '4,281', change: '+12%', icon: Users },
    { label: 'Resource Velocity', value: '142/mo', change: '+5%', icon: BarChart3 },
    { label: 'Avg Merit Score', value: '1,240', change: '+18%', icon: CheckCircle2 },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="text-left">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Institutional Terminal</h1>
          <p className="text-slate-400 font-medium mt-1 uppercase text-[10px] tracking-widest">Administrative Control for {tenant.name}</p>
        </div>
        <div className="flex gap-3">
           <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-50 transition">
              <Mail className="w-4 h-4" /> Broadcast Notice
           </button>
           <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition shadow-lg shadow-indigo-100">
              <UserPlus className="w-4 h-4" /> Provision Seats
           </button>
        </div>
      </div>

      {/* High Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bento-card border-none bg-white p-6 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform">
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-black text-green-500 bg-green-50 px-2.5 py-1 rounded-full">{stat.change}</span>
            </div>
            <div className="text-3xl font-black text-slate-900 mb-1">{stat.value}</div>
            <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Moderation Queue */}
        <div className="bento-card md:col-span-8 bg-white border-slate-100 p-0 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h2 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500" /> Pending Moderation
            </h2>
            <button className="text-[10px] font-black uppercase text-indigo-600 tracking-widest hover:underline">Process Queue</button>
          </div>
          <div className="divide-y divide-slate-50">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-800">Resource Reported: Calculus_CheatSheet.pdf</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reason: Copyright Infringement • Red Flag #72</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-slate-400 hover:text-green-600 transition"><CheckCircle2 className="w-5 h-5" /></button>
                  <button className="p-2 text-slate-400 hover:text-red-600 transition"><ShieldAlert className="w-5 h-5" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global Settings Snapshot */}
        <div className="bento-card md:col-span-4 bg-slate-900 text-white p-6 text-left">
           <h2 className="text-lg font-bold mb-6 flex items-center gap-2 uppercase tracking-tight">
              <Settings2 className="w-5 h-5 text-indigo-400" /> System Protocols
           </h2>
           <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-2xl border border-white/10">
                 <span className="text-xs font-bold text-slate-300">Merit Multiplier</span>
                 <span className="text-indigo-400 font-bold">1.5x</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-2xl border border-white/10">
                 <span className="text-xs font-bold text-slate-300">Open Registration</span>
                 <span className="text-red-400 font-bold">Disabled</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-2xl border border-white/10">
                 <span className="text-xs font-bold text-slate-300">AI Assistance</span>
                 <span className="text-green-400 font-bold">Active</span>
              </div>
           </div>
           <button className="w-full py-4 bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition">
              Enterprise Configuration
           </button>
        </div>
      </div>
    </div>
  );
}
