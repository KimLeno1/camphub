import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api/client';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Mic, MicOff, PhoneOff, Users } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { socketService } from '../lib/api/socket';

export function VoiceChat() {
  const { channelId, communityId } = useParams();
  const { user } = useAuthStore();
  const [isMuted, setIsMuted] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const { data: channelInfo } = useQuery({
    queryKey: ['channel', channelId],
    queryFn: async () => {
      const res = await apiClient.get(`/communities/${communityId}/channels`);
      return res.data.find((c: any) => c.id === channelId);
    },
    enabled: !!communityId,
  });

  useEffect(() => {
    if (channelId && user) {
      // Fake RTC connection logic for this preview
      setIsConnected(true);
      setConnectedUsers([user.uid]);
      socketService.emit('join_voice', { channelId, userId: user.uid });

      const handleUserJoined = (data: { userId: string }) => {
        setConnectedUsers(prev => {
          if (!prev.includes(data.userId)) return [...prev, data.userId];
          return prev;
        });
      };

      const unsub = socketService.on('user_joined_voice', handleUserJoined);

      return () => {
        setIsConnected(false);
        setConnectedUsers([]);
        unsub();
        // In real app, emit leave_voice and clean up RTCPeerConnections
      };
    }
  }, [channelId, user]);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="h-14 border-b border-border bg-card/80 backdrop-blur flex items-center px-6 shrink-0 z-10 shadow-sm">
        <div className="w-5 h-5 text-muted-foreground mr-2 flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
        </div>
        <h3 className="font-semibold text-lg">{channelInfo?.name || 'Voice Channel'}</h3>
        <div className="ml-auto flex items-center text-sm text-muted-foreground">
          <Users className="w-4 h-4 mr-1.5" />
          {connectedUsers.length} connected
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {connectedUsers.map(uid => (
            <div key={uid} className="flex flex-col items-center justify-center p-6 bg-card border border-border rounded-xl shadow-sm relative overflow-hidden group">
              {uid === user?.uid && !isMuted && (
                <div className="absolute inset-0 border-2 border-green-500 rounded-xl pointer-events-none animate-pulse opacity-50" />
              )}
              <Avatar className="w-24 h-24 mb-4 border-4 border-background shadow-md">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${uid}`} />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <h4 className="font-medium text-foreground">
                {uid === user?.uid ? 'You' : `User ${uid.substring(0, 5)}`}
              </h4>
              {uid === user?.uid && isMuted && (
                <div className="absolute top-3 right-3 bg-destructive text-destructive-foreground p-1 rounded-full shadow-sm">
                  <MicOff className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Controls Area */}
      <div className="p-6 bg-card shrink-0 border-t border-border mt-auto flex justify-center gap-4">
        <Button 
          variant={isMuted ? "destructive" : "secondary"} 
          size="lg" 
          className="rounded-full w-14 h-14 p-0 shadow-sm"
          onClick={() => setIsMuted(!isMuted)}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </Button>
        <Button 
          variant="destructive" 
          size="lg" 
          className="rounded-full w-14 h-14 p-0 shadow-sm bg-red-600 hover:bg-red-700 text-white"
        >
          <PhoneOff className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}
