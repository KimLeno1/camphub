import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api/client';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Skeleton } from '../components/ui/skeleton';
import { Send, Hash, Loader2, Flag, MessageSquare, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { socketService } from '../lib/api/socket';

export function Chat() {
  const { channelId, communityId } = useParams();
  const [content, setContent] = useState('');
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const [checkingSafety, setCheckingSafety] = useState(false);
  const [safetyViolation, setSafetyViolation] = useState<{ type: 'spam' | 'toxicity'; reason: string } | null>(null);

  const { data: messagesRaw, isLoading } = useQuery({
    queryKey: ['messages', channelId],
    queryFn: async () => {
      const res = await apiClient.get(`/channels/${channelId}/messages`);
      const dataArr = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
      return [...dataArr].reverse(); // Backend returns desc, we want asc for chat
    },
  });

  const messages: any[] = Array.isArray(messagesRaw) ? messagesRaw : [];

  const { data: channelInfo } = useQuery({
    queryKey: ['channel', channelId],
    queryFn: async () => {
      const res = await apiClient.get(`/communities/${communityId}/channels`);
      const channelsList = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
      return channelsList.find((c: any) => c.id === channelId);
    },
    enabled: !!communityId,
  });

  useEffect(() => {
    if (channelId && user) {
      socketService.emit('join_channel', { channelId });

      const handleNewMessage = (msg: any) => {
        // If the message belongs to this channel, append it
        if (msg.channelId === channelId) {
          queryClient.setQueryData(['messages', channelId], (old: any) => {
            if (!old) return [msg];
            // Don't add duplicate if we just sent it (though we usually invalidate, optimistic update is better, but here we just append)
            if (old.some((m: any) => m.id === msg.id)) return old;
            return [...old, msg];
          });
          scrollToBottom();
        }
      };

      const handleUserTyping = (data: { channelId: string, userId: string, isTyping: boolean }) => {
        if (data.channelId === channelId && data.userId !== user.uid) {
          setTypingUsers(prev => {
            const next = new Set(prev);
            if (data.isTyping) next.add(data.userId);
            else next.delete(data.userId);
            return next;
          });
        }
      };

      const unsubMsg = socketService.on('new_message', handleNewMessage);
      const unsubTyping = socketService.on('user_typing', handleUserTyping);

      return () => {
        socketService.emit('leave_channel', { channelId });
        unsubMsg();
        unsubTyping();
      };
    }
  }, [channelId, user]);

  const sendMutation = useMutation({
    mutationFn: async (messageContent: string) => {
      const res = await apiClient.post(`/channels/${channelId}/messages`, { content: messageContent });
      return res.data;
    },
    onSuccess: (data) => {
      setContent('');
      setSafetyViolation(null);
      socketService.emit('typing', { channelId, userId: user?.uid, isTyping: false });
      scrollToBottom();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send message');
    }
  });

  const reportMutation = useMutation({
    mutationFn: async ({ targetId, reason }: { targetId: string, reason: string }) => {
      const res = await apiClient.post(`/governance/cases`, {
        targetType: 'message',
        targetId,
        reason
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Message reported for jury review');
    }
  });

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || checkingSafety || sendMutation.isPending) return;

    if (safetyViolation) {
      sendMutation.mutate(content);
      setSafetyViolation(null);
      return;
    }

    try {
      setCheckingSafety(true);
      
      const [toxicityRes, spamRes] = await Promise.all([
        apiClient.post('/ai/detect-toxicity', { content }),
        apiClient.post('/ai/detect-spam', { content })
      ]);
      
      setCheckingSafety(false);

      if (toxicityRes.data?.isToxic) {
        setSafetyViolation({ type: 'toxicity', reason: toxicityRes.data.reason });
        toast.error(`Toxicity warning: ${toxicityRes.data.reason}`);
        return;
      }

      if (spamRes.data?.isSpam) {
        setSafetyViolation({ type: 'spam', reason: spamRes.data.reason });
        toast.error(`Spam warning: ${spamRes.data.reason}`);
        return;
      }

      sendMutation.mutate(content);
    } catch (err) {
      setCheckingSafety(false);
      sendMutation.mutate(content);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);
    setSafetyViolation(null);
    
    // Emit typing event
    socketService.emit('typing', { channelId, userId: user?.uid, isTyping: true });
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to clear typing status
    typingTimeoutRef.current = setTimeout(() => {
      socketService.emit('typing', { channelId, userId: user?.uid, isTyping: false });
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Chat Header */}
      <div className="h-14 border-b border-border bg-card/80 backdrop-blur flex items-center px-6 shrink-0 z-10 shadow-sm">
        <Hash className="w-5 h-5 text-muted-foreground mr-2" />
        <h3 className="font-semibold text-lg">{channelInfo?.name || 'Loading...'}</h3>
        {channelInfo?.description && (
          <>
            <div className="w-1 h-1 bg-border rounded-full mx-3" />
            <p className="text-sm text-muted-foreground truncate">{channelInfo.description}</p>
          </>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={scrollRef}>
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-4">
                <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : messages?.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-2">
            <MessageSquare className="w-12 h-12 opacity-20" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages?.map((msg: any) => (
            <div key={msg.id} className="flex gap-4 group">
              <Avatar className="w-10 h-10 mt-0.5 border border-border/50 shadow-sm shrink-0">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.userId}`} />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-sm hover:underline cursor-pointer">
                      User {msg.userId.substring(0,6)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(msg.createdAt || Date.now()), 'h:mm a')}
                    </span>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={() => reportMutation.mutate({ targetId: msg.id, reason: 'Inappropriate content' })}
                      title="Report to Jury"
                    >
                      <Flag className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="text-sm mt-1 leading-relaxed text-foreground whitespace-pre-wrap break-words">
                  {msg.content}
                </div>
              </div>
            </div>
          ))
        )}
        
        {typingUsers.size > 0 && (
          <div className="flex items-center gap-2 text-muted-foreground text-sm italic px-2">
            <span className="flex gap-1">
              <span className="animate-bounce inline-block w-1 h-1 bg-current rounded-full"></span>
              <span className="animate-bounce inline-block w-1 h-1 bg-current rounded-full" style={{ animationDelay: '0.2s' }}></span>
              <span className="animate-bounce inline-block w-1 h-1 bg-current rounded-full" style={{ animationDelay: '0.4s' }}></span>
            </span>
            {typingUsers.size === 1 ? 'Someone is typing...' : 'Several people are typing...'}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-card shrink-0 border-t border-border mt-auto space-y-3">
        {safetyViolation && (
          <div className="bg-destructive/10 text-destructive text-xs p-3 rounded-lg flex items-center justify-between border border-destructive/25 animate-fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <div>
                <span className="font-bold capitalize">{safetyViolation.type} Warning: </span>
                <span>{safetyViolation.reason}</span>
              </div>
            </div>
            <span className="text-[10px] bg-destructive/15 px-2 py-0.5 rounded font-semibold shrink-0">Press Send again to bypass AI guard</span>
          </div>
        )}
        {checkingSafety && (
          <div className="text-[10px] text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 px-1 animate-pulse font-medium">
            <Loader2 className="w-3 h-3 animate-spin" /> AI Copilot is scanning message for toxicity & spam...
          </div>
        )}
        <form onSubmit={handleSend} className="flex items-center gap-2 relative">
          <Input 
            value={content}
            onChange={handleInputChange}
            placeholder={`Message #${channelInfo?.name || 'channel'}`}
            className="flex-1 rounded-xl bg-muted/50 border-border pr-12 focus-visible:ring-1"
            disabled={sendMutation.isPending || checkingSafety}
          />
          <Button 
            type="submit" 
            size="icon" 
            className={`absolute right-1 w-8 h-8 rounded-lg shrink-0 ${safetyViolation ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground" : ""}`} 
            disabled={!content.trim() || sendMutation.isPending || checkingSafety}
          >
            {sendMutation.isPending || checkingSafety ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
}
