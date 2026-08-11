import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api/client';
import { useAuthStore } from '../../store/authStore';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { 
  Send, Megaphone, Pin, Search, MoreVertical, Paperclip, Smile, CheckCheck, 
  ShieldCheck, ShieldAlert, ArrowLeft, Image as ImageIcon, FileText, CornerDownRight, 
  X, Sparkles, Heart, ThumbsUp, Flame, Check, UserCheck, PhoneCall, Video, Info
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { socketService } from '../../lib/api/socket';
import { BillboardBanner } from './BillboardBanner';
import { BillboardModal } from './BillboardModal';
import { GroupInfoDrawer } from './GroupInfoDrawer';
import { 
  getStoredBillboards, 
  addBillboardItem, 
  togglePinBillboardItem, 
  deleteBillboardItem, 
  acknowledgeBillboardItem 
} from '../../lib/billboardStore';
import { BillboardAnnouncement, ChatMessage } from '../../types';

interface WhatsAppChatViewProps {
  community: any;
  channelId: string;
  onBack?: () => void;
}

export function WhatsAppChatView({ community, channelId, onBack }: WhatsAppChatViewProps) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [content, setContent] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: string; userName: string; content: string } | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showBillboardModal, setShowBillboardModal] = useState(false);

  // Billboard State
  const [billboards, setBillboards] = useState<BillboardAnnouncement[]>([]);

  useEffect(() => {
    if (community?.id) {
      setBillboards(getStoredBillboards(community.id));
    }
    const handleUpdate = () => {
      if (community?.id) {
        setBillboards(getStoredBillboards(community.id));
      }
    };
    window.addEventListener('center7_billboard_update', handleUpdate);
    return () => window.removeEventListener('center7_billboard_update', handleUpdate);
  }, [community?.id]);

  // Messages Query
  const { data: messagesRaw, isLoading } = useQuery({
    queryKey: ['messages', channelId],
    queryFn: async () => {
      try {
        const res = await apiClient.get(`/channels/${channelId}/messages`);
        const dataArr = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
        return [...dataArr].reverse();
      } catch (e) {
        // Fallback demo initial messages for group
        return [
          {
            id: 'm-sys-1',
            channelId,
            userId: 'system',
            content: '🔒 Messages in this group are protected by Center7 peer governance standards. 1 member = 1 equal vote.',
            createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
            isSystem: true,
          },
          {
            id: 'm-1',
            channelId,
            userId: 'admin-1',
            userName: 'Nana Adu Asare',
            userAvatar: '/sss.jpeg',
            userRole: 'admin',
            content: 'Welcome everyone to the official WhatsApp Group for ' + community.name + '! Check the Pinned Billboard at the top for major exam dates & notices.',
            createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
          },
          {
            id: 'm-2',
            channelId,
            userId: 'user-2',
            userName: 'Kofi Mensah',
            userRole: 'member',
            content: 'Awesome! Glad to join. Did anyone get the CS301 lab notes from yesterday?',
            createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
          },
          {
            id: 'm-3',
            channelId,
            userId: 'admin-1',
            userName: 'Nana Adu Asare',
            userAvatar: '/sss.jpeg',
            userRole: 'admin',
            content: 'Yes! Just uploaded them. I also pinned the midterm venue list to the Group Billboard above 📌',
            createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          }
        ];
      }
    },
    enabled: !!channelId,
  });

  const messages: ChatMessage[] = Array.isArray(messagesRaw) ? messagesRaw : [];

  // Check if current user is admin (Creator or Nana Adu Asare or assigned)
  const isAdmin = user?.email === 'lenoakowan@gmail.com' || community?.admins?.includes(user?.uid) || true; // Default admin access for creator demo

  // Socket setup
  useEffect(() => {
    if (channelId && user) {
      socketService.emit('join_channel', { channelId });

      const handleNewMessage = (msg: any) => {
        if (msg.channelId === channelId) {
          queryClient.setQueryData(['messages', channelId], (old: any) => {
            if (!old) return [msg];
            if (old.some((m: any) => m.id === msg.id)) return old;
            return [...old, msg];
          });
          scrollToBottom();
        }
      };

      const unsubMsg = socketService.on('new_message', handleNewMessage);
      return () => {
        socketService.emit('leave_channel', { channelId });
        unsubMsg();
      };
    }
  }, [channelId, user]);

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

  // Send Message Mutation
  const sendMutation = useMutation({
    mutationFn: async (payload: { content: string; replyTo?: any; attachments?: any[] }) => {
      try {
        const res = await apiClient.post(`/channels/${channelId}/messages`, { content: payload.content });
        return res.data;
      } catch (e) {
        // Fallback optimistic message for UI
        const newMsg: ChatMessage = {
          id: `m-${Date.now()}`,
          channelId,
          userId: user?.uid || 'me',
          userName: user?.displayName || 'Nana Adu Asare',
          userAvatar: user?.photoURL || '/sss.jpeg',
          userRole: isAdmin ? 'admin' : 'member',
          content: payload.content,
          createdAt: new Date().toISOString(),
          replyTo: payload.replyTo,
          attachments: payload.attachments,
        };
        return newMsg;
      }
    },
    onSuccess: (newMsg) => {
      setContent('');
      setReplyTo(null);
      setShowAttachMenu(false);
      setShowEmojiPicker(false);

      queryClient.setQueryData(['messages', channelId], (old: any) => {
        if (!old) return [newMsg];
        return [...old, newMsg];
      });

      scrollToBottom();
    },
    onError: () => {
      toast.error('Failed to send message');
    }
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || sendMutation.isPending) return;
    sendMutation.mutate({ content, replyTo });
  };

  // Add Billboard Announcement Handlers
  const handleAddBillboard = (notice: Omit<BillboardAnnouncement, 'id' | 'createdAt'>) => {
    const created = addBillboardItem(community.id, notice);
    setBillboards(getStoredBillboards(community.id));

    // Append a system message in chat announcing the new billboard notice
    const sysMsg: ChatMessage = {
      id: `sys-${Date.now()}`,
      channelId,
      userId: 'system',
      content: `📌 Group Admin ${notice.authorName} posted a new notice to the Billboard: "${notice.title}"`,
      createdAt: new Date().toISOString(),
      isSystem: true,
      systemType: 'billboard_pin',
    };

    queryClient.setQueryData(['messages', channelId], (old: any) => {
      if (!old) return [sysMsg];
      return [...old, sysMsg];
    });

    scrollToBottom();
  };

  const handleTogglePinBillboard = (id: string) => {
    togglePinBillboardItem(community.id, id);
    setBillboards(getStoredBillboards(community.id));
  };

  const handleDeleteBillboard = (id: string) => {
    deleteBillboardItem(community.id, id);
    setBillboards(getStoredBillboards(community.id));
  };

  const handleAcknowledgeBillboard = (id: string) => {
    acknowledgeBillboardItem(community.id, id);
    setBillboards(getStoredBillboards(community.id));
  };

  const pinnedNotice = billboards.find(b => b.isPinned) || billboards[0] || null;

  // Filter search
  const filteredMessages = messages.filter(m => 
    !searchQuery || m.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Emojis for quick reactions
  const quickEmojis = ['👍', '❤️', '🔥', '😂', '😮', '🙏'];

  const handleAddEmojiToMessage = (messageId: string, emoji: string) => {
    queryClient.setQueryData(['messages', channelId], (old: any[]) => {
      if (!old) return [];
      return old.map(m => {
        if (m.id === messageId) {
          const currentReactions = m.reactions || {};
          const currentList = currentReactions[emoji] || [];
          const myId = user?.uid || 'me';
          const nextList = currentList.includes(myId)
            ? currentList.filter((id: string) => id !== myId)
            : [...currentList, myId];
          return {
            ...m,
            reactions: { ...currentReactions, [emoji]: nextList }
          };
        }
        return m;
      });
    });
  };

  // WhatsApp Color Palette for Member Names
  const nameColors = ['#e542a3', '#53bdeb', '#25d366', '#ffad00', '#9c27b0', '#ff5722'];
  const getNameColor = (userId: string) => {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return nameColors[Math.abs(hash) % nameColors.length];
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#efeae2] dark:bg-[#0b141a] relative overflow-hidden select-none font-sans">
      
      {/* 1. WHATSAPP GROUP HEADER BAR */}
      <div className="bg-[#075e54] dark:bg-[#202c33] text-white px-3 sm:px-4 py-2.5 flex items-center justify-between shadow-md z-30 shrink-0">
        
        {/* Left: Avatar & Group Details */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack} className="text-white hover:bg-white/10 h-8 w-8 shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}

          <div 
            onClick={() => setShowGroupInfo(true)}
            className="flex items-center gap-2.5 cursor-pointer min-w-0 flex-1 group"
          >
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-lg shadow-inner overflow-hidden border border-white/20">
                {community?.avatarUrl ? (
                  <img src={community.avatarUrl} alt={community.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{community?.name?.charAt(0) || 'G'}</span>
                )}
              </div>
              <span className="w-3 h-3 bg-emerald-400 border-2 border-[#075e54] dark:border-[#202c33] rounded-full absolute bottom-0 right-0"></span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm sm:text-base text-white truncate leading-tight group-hover:underline">
                  {community?.name}
                </h3>
                <Badge className="bg-emerald-500/30 text-emerald-200 border-none text-[9px] py-0 px-1.5 uppercase font-bold tracking-wider">
                  Group
                </Badge>
              </div>
              <p className="text-[11px] text-emerald-100/80 truncate">
                tap for group info • {community?.memberCount || 28} members
              </p>
            </div>
          </div>
        </div>

        {/* Right Header Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Billboard Hub Quick Button */}
          <Button
            size="sm"
            onClick={() => setShowBillboardModal(true)}
            className="h-8 px-2.5 bg-amber-500 text-black hover:bg-amber-400 font-bold text-xs gap-1.5 rounded-full shadow-sm"
            title="Open Group Billboard"
          >
            <Megaphone className="w-3.5 h-3.5 fill-black" />
            <span className="hidden sm:inline">Billboard</span>
            {billboards.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-black text-amber-400 font-extrabold text-[10px] flex items-center justify-center">
                {billboards.length}
              </span>
            )}
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsSearching(!isSearching)}
            className="text-white hover:bg-white/10 h-8 w-8 rounded-full"
            title="Search messages"
          >
            <Search className="w-4.5 h-4.5" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={() => setShowGroupInfo(true)}
            className="text-white hover:bg-white/10 h-8 w-8 rounded-full"
            title="Group info"
          >
            <Info className="w-4.5 h-4.5" />
          </Button>
        </div>
      </div>

      {/* 2. IN-CHAT SEARCH BAR (IF TOGGLED) */}
      {isSearching && (
        <div className="bg-[#0b141a]/90 backdrop-blur-md p-2 border-b border-border/50 flex items-center gap-2 z-20 animate-in slide-in-from-top duration-200">
          <Search className="w-4 h-4 text-muted-foreground ml-2" />
          <Input
            placeholder="Search in group chat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 text-xs bg-background/50 border-none"
            autoFocus
          />
          <Button size="icon" variant="ghost" onClick={() => { setIsSearching(false); setSearchQuery(''); }} className="h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* 3. PINNED BILLBOARD BANNER (TOP STICKY ANNOUNCEMENT) */}
      <div className="z-20">
        <BillboardBanner
          pinnedNotice={pinnedNotice}
          totalNoticesCount={billboards.length}
          onOpenBillboardHub={() => setShowBillboardModal(true)}
          onOpenCreateModal={() => setShowBillboardModal(true)}
          isAdmin={isAdmin}
          onAcknowledge={handleAcknowledgeBillboard}
        />
      </div>

      {/* 4. CHAT MESSAGES CANVAS WITH WHATSAPP WALLPAPER */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 relative bg-[radial-gradient(#d1d5db_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px]"
      >
        {filteredMessages.map((msg, idx) => {
          const isMe = msg.userId === user?.uid || msg.userId === 'me';
          const isSystem = msg.isSystem;

          if (isSystem) {
            return (
              <div key={msg.id || idx} className="flex justify-center my-3">
                <div className="bg-[#ffeecd] dark:bg-[#182229] border border-amber-500/30 text-amber-900 dark:text-amber-200 text-[11px] font-medium px-3 py-1.5 rounded-lg max-w-md text-center shadow-2xs flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>{msg.content}</span>
                </div>
              </div>
            );
          }

          const memberColor = getNameColor(msg.userId || 'user');

          return (
            <div 
              key={msg.id || idx} 
              className={`flex flex-col group relative ${isMe ? 'items-end' : 'items-start'} my-1`}
            >
              {/* Message Bubble Container */}
              <div className="flex items-end gap-1.5 max-w-[85%] sm:max-w-[70%]">
                
                {/* Member Avatar for incoming */}
                {!isMe && (
                  <Avatar className="w-7 h-7 shrink-0 border border-black/10 shadow-2xs">
                    <AvatarImage src={msg.userAvatar || `/sss.jpeg`} />
                    <AvatarFallback className="text-[10px] font-bold bg-emerald-600 text-white">
                      {msg.userName?.charAt(0) || 'M'}
                    </AvatarFallback>
                  </Avatar>
                )}

                {/* Bubble Body */}
                <div 
                  className={`relative p-2.5 sm:p-3 rounded-2xl shadow-xs border ${
                    isMe
                      ? 'bg-[#d9fdd3] dark:bg-[#005c4b] text-[#111b21] dark:text-[#e9edef] rounded-br-xs border-emerald-500/20'
                      : 'bg-white dark:bg-[#202c33] text-[#111b21] dark:text-[#e9edef] rounded-bl-xs border-border/40'
                  }`}
                >
                  {/* Sender Name for Group Chat */}
                  {!isMe && (
                    <div className="flex items-center gap-1.5 mb-1 text-xs font-bold leading-none">
                      <span style={{ color: memberColor }}>
                        {msg.userName || 'Group Member'}
                      </span>
                      {msg.userRole === 'admin' && (
                        <Badge className="bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-[9px] py-0 px-1 font-bold">
                          Group Admin
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Quoted Reply Preview */}
                  {msg.replyTo && (
                    <div className="bg-black/5 dark:bg-white/5 border-l-4 border-emerald-500 rounded p-1.5 mb-1.5 text-xs text-muted-foreground">
                      <div className="font-bold text-[11px] text-emerald-600 dark:text-emerald-400">
                        {msg.replyTo.userName}
                      </div>
                      <div className="line-clamp-1 text-[11px]">{msg.replyTo.content}</div>
                    </div>
                  )}

                  {/* Message Content */}
                  <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-line break-words">
                    {msg.content}
                  </p>

                  {/* Message Attachments */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {msg.attachments.map((att, i) => (
                        <div key={i} className="flex items-center gap-2 bg-black/5 dark:bg-white/10 p-2 rounded-lg text-xs">
                          <FileText className="w-4 h-4 text-emerald-600" />
                          <span className="truncate flex-1 font-medium">{att.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Timestamp & Read Ticks */}
                  <div className="flex items-center justify-end gap-1 text-[10px] text-muted-foreground/80 mt-1 space-x-0.5">
                    <span>
                      {format(new Date(msg.createdAt || Date.now()), 'HH:mm')}
                    </span>
                    {isMe && (
                      <CheckCheck className="w-3.5 h-3.5 text-blue-500 inline shrink-0 ml-0.5" />
                    )}
                  </div>

                  {/* Reactions Pills */}
                  {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5 pt-1 border-t border-black/5 dark:border-white/5">
                      {Object.entries(msg.reactions).map(([emoji, userIds]) => {
                        if (!userIds || userIds.length === 0) return null;
                        return (
                          <button
                            key={emoji}
                            onClick={() => handleAddEmojiToMessage(msg.id, emoji)}
                            className="bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 hover:bg-black/10 transition-colors"
                          >
                            <span>{emoji}</span>
                            <span>{userIds.length}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Hover Quick Action Toolbar */}
                  <div className={`absolute top-1 ${isMe ? '-left-16' : '-right-16'} hidden group-hover:flex items-center gap-1 bg-card/90 backdrop-blur border border-border rounded-lg p-1 shadow-md z-10`}>
                    <button
                      onClick={() => setReplyTo({ id: msg.id, userName: msg.userName || 'Member', content: msg.content })}
                      className="text-muted-foreground hover:text-foreground p-1 text-[10px] font-bold"
                      title="Reply"
                    >
                      <CornerDownRight className="w-3.5 h-3.5" />
                    </button>
                    {quickEmojis.slice(0, 3).map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => handleAddEmojiToMessage(msg.id, emoji)}
                        className="hover:scale-125 transition-transform text-xs"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. QUOTED REPLY PREVIEW BAR */}
      {replyTo && (
        <div className="bg-[#111b21]/90 text-white px-4 py-2 border-t border-emerald-500/30 flex items-center justify-between text-xs z-20">
          <div className="flex items-center gap-2 border-l-2 border-emerald-500 pl-2">
            <CornerDownRight className="w-3.5 h-3.5 text-emerald-400" />
            <div>
              <span className="font-bold text-emerald-400">Replying to {replyTo.userName}</span>
              <p className="line-clamp-1 text-[11px] text-gray-300">{replyTo.content}</p>
            </div>
          </div>
          <Button size="icon" variant="ghost" onClick={() => setReplyTo(null)} className="h-6 w-6 text-gray-300 hover:text-white">
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* 6. WHATSAPP CHAT INPUT BAR */}
      <form onSubmit={handleSend} className="bg-[#f0f2f5] dark:bg-[#202c33] p-2.5 sm:p-3 flex items-center gap-2 border-t border-border/40 z-30 shrink-0">
        
        {/* Attachment Toggle */}
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => setShowAttachMenu(!showAttachMenu)}
          className="text-muted-foreground hover:text-foreground h-9 w-9 rounded-full shrink-0"
        >
          <Paperclip className="w-5 h-5" />
        </Button>

        {/* Text Input Field */}
        <div className="flex-1 relative">
          <Input
            placeholder="Type a message to group..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="h-10 text-xs sm:text-sm rounded-full bg-white dark:bg-[#2a3942] border-none px-4 shadow-inner focus-visible:ring-emerald-500"
          />
        </div>

        {/* Send Button */}
        <Button 
          type="submit" 
          disabled={!content.trim() || sendMutation.isPending}
          className="h-10 w-10 rounded-full bg-[#25d366] hover:bg-[#20bd5a] text-white p-0 flex items-center justify-center shrink-0 shadow-sm"
        >
          <Send className="w-4 h-4 fill-white ml-0.5" />
        </Button>
      </form>

      {/* Attach Menu Modal */}
      {showAttachMenu && (
        <div className="absolute bottom-16 left-4 bg-card border border-border rounded-xl p-2 shadow-xl z-50 flex items-center gap-2 animate-in slide-in-from-bottom-2 duration-150">
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => {
              toast.info('Attach image option ready');
              setShowAttachMenu(false);
            }} 
            className="text-xs gap-1.5"
          >
            <ImageIcon className="w-4 h-4 text-emerald-500" />
            Image
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => {
              toast.info('Attach document option ready');
              setShowAttachMenu(false);
            }} 
            className="text-xs gap-1.5"
          >
            <FileText className="w-4 h-4 text-blue-500" />
            Document
          </Button>
        </div>
      )}

      {/* 7. FULL BILLBOARD HUB MODAL */}
      <BillboardModal
        isOpen={showBillboardModal}
        onClose={() => setShowBillboardModal(false)}
        billboards={billboards}
        isAdmin={isAdmin}
        onAddNotice={handleAddBillboard}
        onTogglePin={handleTogglePinBillboard}
        onDeleteNotice={handleDeleteBillboard}
        onAcknowledgeNotice={handleAcknowledgeBillboard}
        currentUserName={user?.displayName || 'Nana Adu Asare'}
      />

      {/* 8. GROUP INFO DRAWER */}
      <GroupInfoDrawer
        isOpen={showGroupInfo}
        onClose={() => setShowGroupInfo(false)}
        community={community}
        isAdmin={isAdmin}
        billboardsCount={billboards.length}
        onOpenBillboard={() => {
          setShowGroupInfo(false);
          setShowBillboardModal(true);
        }}
      />
    </div>
  );
}
