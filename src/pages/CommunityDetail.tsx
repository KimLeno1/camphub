import React, { useState } from 'react';
import { useParams, Link, Routes, Route, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api/client';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { Hash, Settings, Users, BookOpen, MessageSquare, ArrowLeft, Loader2, Trophy, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { Chat } from './Chat';
import { Resources } from './Resources';
import { VoiceChat } from './VoiceChat';
import { ClubQuests } from '../components/ClubQuests';

export function CommunityDetail() {
  const { communityId } = useParams();
  const navigate = useNavigate();

  const { data: community, isLoading, isError } = useQuery({
    queryKey: ['community', communityId],
    queryFn: async () => {
      const res = await apiClient.get(`/communities`);
      const commList = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
      return commList.find((c: any) => c.id === communityId);
    },
  });

  const { data: channelsRaw, isLoading: channelsLoading } = useQuery({
    queryKey: ['channels', communityId],
    queryFn: async () => {
      const res = await apiClient.get(`/communities/${communityId}/channels`);
      return res.data;
    },
  });

  const channels: any[] = Array.isArray(channelsRaw) ? channelsRaw : (Array.isArray(channelsRaw?.data) ? channelsRaw.data : []);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !community) {
    return (
      <div className="flex flex-col h-full items-center justify-center space-y-4">
        <p className="text-destructive font-medium">Community not found.</p>
        <Button variant="outline" onClick={() => navigate('/communities')}>Back to Communities</Button>
      </div>
    );
  }

  return (
    <div className="flex h-full -m-4 md:-m-6 lg:-m-8">
      {/* Community Sidebar */}
      <div className="w-64 border-r border-border bg-muted/20 flex flex-col hidden sm:flex shrink-0">
        <div className="p-4 border-b border-border bg-card/50">
          <Button variant="ghost" size="sm" className="mb-4 -ml-2 text-muted-foreground" onClick={() => navigate('/communities')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h2 className="font-heading font-bold text-lg truncate">{community.name}</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          <div className="space-y-1">
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Channels</p>
            {channelsLoading ? (
              <div className="space-y-2 px-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : channels?.length === 0 ? (
              <p className="px-3 text-sm text-muted-foreground">No channels yet.</p>
            ) : (
              <>
                {channels?.filter((c: any) => c.type !== 'voice').map((channel: any) => (
                  <Link
                    key={channel.id}
                    to={`/communities/${community.id}/channels/${channel.id}`}
                    className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors text-foreground font-medium"
                  >
                    <Hash className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span className="truncate">{channel.name}</span>
                  </Link>
                ))}
                
                <div className="pt-2"></div>
                
                {channels?.filter((c: any) => c.type === 'voice').map((channel: any) => (
                  <Link
                    key={channel.id}
                    to={`/communities/${community.id}/voice/${channel.id}`}
                    className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors text-foreground font-medium"
                  >
                    <div className="w-4 h-4 mr-2 text-muted-foreground flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
                    </div>
                    <span className="truncate">{channel.name}</span>
                  </Link>
                ))}
              </>
            )}
          </div>
          
          <div className="space-y-1 pt-4 border-t border-border">
            <Link to={`/communities/${community.id}/quests`} className="flex items-center justify-between px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors text-foreground font-semibold bg-purple-500/10 text-purple-700 dark:text-purple-300">
              <span className="flex items-center">
                <Trophy className="w-4 h-4 mr-2 text-amber-500" />
                Club Quests
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-600 text-white">4 Active</span>
            </Link>
            <Link to={`/communities/${community.id}/resources`} className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors text-foreground font-medium">
              <BookOpen className="w-4 h-4 mr-2 text-muted-foreground" />
              Resource Center
            </Link>
            <Link to={`/communities/${community.id}/members`} className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors text-foreground font-medium">
              <Users className="w-4 h-4 mr-2 text-muted-foreground" />
              Members
            </Link>
            <Link to={`/communities/${community.id}/settings`} className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors text-foreground font-medium">
              <Settings className="w-4 h-4 mr-2 text-muted-foreground" />
              Settings
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-card flex flex-col relative overflow-hidden">
        <Routes>
          <Route index element={
            <div className="p-8 flex flex-col items-center justify-center h-full text-center space-y-4 max-w-lg mx-auto">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-2">
                <MessageSquare className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold font-heading">Welcome to {community.name}</h3>
              <p className="text-muted-foreground text-sm">
                Select a channel from the sidebar to start chatting with club members, view study resources, or complete active club quests.
              </p>

              <div className="pt-4 grid grid-cols-2 gap-3 w-full">
                <Link
                  to={`/communities/${community.id}/quests`}
                  className="p-4 rounded-xl border border-purple-500/30 bg-purple-50 dark:bg-purple-950/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all text-left group"
                >
                  <Trophy className="w-5 h-5 text-amber-500 mb-2 group-hover:scale-110 transition-transform" />
                  <h4 className="font-bold text-sm text-purple-900 dark:text-purple-200">Club Quests</h4>
                  <p className="text-[11px] text-purple-700/80 dark:text-purple-300/80 mt-1">Earn XP & club badges</p>
                </Link>

                <Link
                  to={`/communities/${community.id}/resources`}
                  className="p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-all text-left group"
                >
                  <BookOpen className="w-5 h-5 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                  <h4 className="font-bold text-sm text-foreground">Resources</h4>
                  <p className="text-[11px] text-muted-foreground mt-1">Files, guides & code</p>
                </Link>
              </div>
            </div>
          } />
          <Route path="channels/:channelId" element={<Chat />} />
          <Route path="voice/:channelId" element={<VoiceChat />} />
          <Route path="resources" element={<Resources />} />
          <Route path="quests" element={<ClubQuests communityName={community.name} />} />
          <Route path="*" element={<div className="p-6 text-xl">Not Found</div>} />
        </Routes>
      </div>
    </div>
  );
}
