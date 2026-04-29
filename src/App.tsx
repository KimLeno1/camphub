import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Quizzes } from './pages/Quizzes';
import { Forum } from './pages/Forum';
import { Materials } from './pages/Materials';
import { AdminPortal } from './pages/AdminPortal';
import { Opportunities } from './pages/Opportunities';
import { Messages } from './pages/Messages';
import { Notifications } from './pages/Notifications';
import { Leaderboard } from './pages/Leaderboard';
import { BarChart3, CalendarDays } from 'lucide-react';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="academy" element={<Materials />} />
            <Route path="quests" element={<Quizzes />} />
            <Route path="community" element={<Forum />} />
            <Route path="opportunities" element={<Opportunities />} />
            <Route path="messages" element={<Messages />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="admin" element={<AdminPortal />} />
            {/* Stubs for other features */}
            <Route path="clubs" element={
              <div className="text-center mt-20 p-10 max-w-2xl mx-auto">
                <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-100">
                   <BarChart3 className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4 uppercase">Campus Clubs Protocol</h2>
                <p className="text-slate-400 font-medium leading-relaxed">
                  Decentralized club management and election protocols are being provisioned. Your institutional membership remains active.
                </p>
              </div>
            } />
            <Route path="events" element={
              <div className="text-center mt-20 p-10 max-w-2xl mx-auto">
                <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-amber-100">
                   <CalendarDays className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4 uppercase">Institution Calendar</h2>
                <p className="text-slate-400 font-medium leading-relaxed">
                  Real-time event synchronization engine is initializing. Faculty-led sessions will appear here shortly.
                </p>
              </div>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

