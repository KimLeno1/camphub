import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AppLayout } from './components/layout/AppLayout';
import { Login } from './pages/Login';
import { useAuthStore } from './store/authStore';

import { Dashboard } from './pages/Dashboard';
import { Communities } from './pages/Communities';
import { CommunityDetail } from './pages/CommunityDetail';
import { Marketplace } from './pages/Marketplace';
import { Governance } from './pages/Governance';
import { Events } from './pages/Events';
import { Settings } from './pages/Settings';
import { Search } from './pages/Search';
import { AiHub } from './pages/AiHub';
import { Security } from './pages/Security';
import { Hostels } from './pages/Hostels';
import { Resources } from './pages/Resources';
import { Feed } from './pages/Feed';
import { UserProfile } from './pages/UserProfile';
import { Opportunities } from './pages/Opportunities';
import { Chat } from './pages/Chat';
import { VoiceChat } from './pages/VoiceChat';

import { ResourceDetail } from './pages/ResourceDetail';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="communities" element={<Communities />} />
            <Route path="communities/:communityId/*" element={<CommunityDetail />} />
            <Route path="feed" element={<Feed />} />
            <Route path="resources" element={<Resources />} />
            <Route path="resources/:id" element={<ResourceDetail />} />
            <Route path="profile/:userId" element={<UserProfile />} />
            <Route path="marketplace" element={<Marketplace />} />
            <Route path="governance" element={<Governance />} />
            <Route path="events" element={<Events />} />
            <Route path="settings" element={<Settings />} />
            <Route path="search" element={<Search />} />
            <Route path="hostels" element={<Hostels />} />
            <Route path="ai-hub" element={<AiHub />} />
            <Route path="security" element={<Security />} />
            <Route path="opportunities" element={<Opportunities />} />
            <Route path="chat" element={<Chat />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}
