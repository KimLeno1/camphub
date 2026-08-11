import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Users, Lock, Search, Send, 
  Code, Image as ImageIcon, Flag, 
  X, Check, Copy, Sparkles, AlertCircle, Loader2, Radio,
  ShieldCheck, ArrowLeft, Plus, Hash, UserCheck, Flame, Heart, ThumbsUp, Lightbulb, PartyPopper
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';
import { apiClient } from '../lib/api/client';
import { 
  CAMPUS_STUDENTS, 
  DEFAULT_CHAT_ROOMS, 
  ChatMessage, 
  ChatUser, 
  ChatRoom,
  loadStoredPublicMessages, 
  saveStoredPublicMessages, 
  loadStoredDmMessages, 
  saveStoredDmMessages 
} from '../lib/chatStore';

export function Chat() {
  const { user, profile } = useAuthStore();

  // Active Navigation Mode: 'public' or 'dm'
  const [activeMode, setActiveMode] = useState<'public' | 'dm'>('public');

  // Active Selected Room / DM User ID
  const [activeRoomId, setActiveRoomId] = useState<string>('general-campus');
  const [isolatedUser, setIsolatedUser] = useState<ChatUser | null>(null);

  // Messages State
  const [publicMessages, setPublicMessages] = useState<ChatMessage[]>(loadStoredPublicMessages());
  const [dmMessages, setDmMessages] = useState<Record<string, ChatMessage[]>>(loadStoredDmMessages());

  // Input & Attachments
  const [content, setContent] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [codeLang, setCodeLang] = useState('typescript');
  const [codeText, setCodeText] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  // Sidebar search & category
  const [sidebarTab, setSidebarTab] = useState<'channels' | 'dms' | 'directory'>('channels');
  const [searchQuery, setSearchQuery] = useState('');

  // Safety & AI Guard
  const [checkingSafety, setCheckingSafety] = useState(false);
  const [safetyViolation, setSafetyViolation] = useState<{ type: 'spam' | 'toxicity'; reason: string } | null>(null);

  // Typing state & auto responder
  const [typingText, setTypingText] = useState<string | null>(null);

  // Focus Study Mode
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Scroll ref
  const scrollRef = useRef<HTMLDivElement>(null);

  // Save changes to localStorage on update
  useEffect(() => {
    saveStoredPublicMessages(publicMessages);
  }, [publicMessages]);

  useEffect(() => {
    saveStoredDmMessages(dmMessages);
  }, [dmMessages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeRoomId, isolatedUser, publicMessages, dmMessages]);

  // Current logged in user info
  const currentUserId = user?.uid || 'current_user';
  const currentUserName = profile?.displayName || user?.displayName || ' You (Student)';
  const currentUserAvatar = profile?.avatarUrl || user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUserId}`;

  // Helper to isolate a user for 1-on-1
  const handleIsolateUser = (student: ChatUser) => {
    setIsolatedUser(student);
    setActiveMode('dm');
    setActiveRoomId(`dm_${student.id}`);

    // Ensure array exists
    if (!dmMessages[student.id]) {
      const welcomeMsg: ChatMessage = {
        id: `dm_init_${Date.now()}`,
        roomId: `dm_${student.id}`,
        senderId: student.id,
        senderName: student.name,
        senderAvatar: student.avatar,
        content: `🔒 Isolated 1-on-1 private chat session initiated with ${student.name}. How can I help you today?`,
        timestamp: new Date().toISOString(),
        isPrivate: true,
      };
      setDmMessages((prev) => ({
        ...prev,
        [student.id]: [welcomeMsg],
      }));
    }

    toast.success(`Isolated 1-on-1 private chat active with ${student.name}`);
    scrollToBottom();
  };

  // Switch back to public chatroom
  const handleReturnToPublic = () => {
    setActiveMode('public');
    setIsolatedUser(null);
    setActiveRoomId('general-campus');
    toast.info('Returned to Public Campus Chatroom');
  };

  // Send Message Handler
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!content.trim() && !codeText.trim() && !imageUrl.trim()) || checkingSafety) return;

    const messageText = content.trim();

    // AI Guard check for toxicity / spam
    if (!safetyViolation && messageText) {
      try {
        setCheckingSafety(true);
        const [toxicityRes, spamRes] = await Promise.all([
          apiClient.post('/ai/detect-toxicity', { content: messageText }),
          apiClient.post('/ai/detect-spam', { content: messageText }),
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
      } catch (err) {
        setCheckingSafety(false);
      }
    }

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      roomId: activeMode === 'public' ? activeRoomId : `dm_${isolatedUser?.id}`,
      senderId: currentUserId,
      senderName: currentUserName,
      senderAvatar: currentUserAvatar,
      senderRole: 'Student',
      senderDept: profile?.department || 'Computer Science',
      content: messageText || (showCodeInput ? 'Shared a code snippet:' : 'Shared an image attachment:'),
      timestamp: new Date().toISOString(),
      isPrivate: activeMode === 'dm',
      codeSnippet: showCodeInput && codeText.trim() ? { language: codeLang, code: codeText.trim() } : undefined,
      attachments: showImageInput && imageUrl.trim() ? [{ type: 'image', url: imageUrl.trim(), name: 'Image Banner' }] : undefined,
    };

    if (activeMode === 'public') {
      setPublicMessages((prev) => [...prev, newMessage]);
    } else if (isolatedUser) {
      setDmMessages((prev) => ({
        ...prev,
        [isolatedUser.id]: [...(prev[isolatedUser.id] || []), newMessage],
      }));

      // Simulate isolated user 1-on-1 typing & automated response
      setTypingText(`${isolatedUser.name} is typing...`);
      setTimeout(() => {
        setTypingText(null);
        const replies = [
          `Thanks for messaging me 1-on-1! Let me review this and get back to you in a sec. 👍`,
          `Got it! I am currently working on midterms in the library, but let's collaborate on this. 📚`,
          `That sounds like a great plan! Let me know if you want to discuss details right here. 💬`,
          `Awesome! Let's keep this private session focused. 🎯`,
        ];
        const autoReply: ChatMessage = {
          id: `reply_${Date.now()}`,
          roomId: `dm_${isolatedUser.id}`,
          senderId: isolatedUser.id,
          senderName: isolatedUser.name,
          senderAvatar: isolatedUser.avatar,
          content: replies[Math.floor(Math.random() * replies.length)],
          timestamp: new Date().toISOString(),
          isPrivate: true,
        };

        setDmMessages((prev) => ({
          ...prev,
          [isolatedUser.id]: [...(prev[isolatedUser.id] || []), autoReply],
        }));
      }, 1600);
    }

    // Reset Form
    setContent('');
    setCodeText('');
    setShowCodeInput(false);
    setImageUrl('');
    setShowImageInput(false);
    setSafetyViolation(null);
    scrollToBottom();
  };

  // Toggle Reactions
  const handleReaction = (messageId: string, emoji: string) => {
    if (activeMode === 'public') {
      setPublicMessages((prev) =>
        prev.map((msg) => {
          if (msg.id !== messageId) return msg;
          const currentReactions = msg.reactions || {};
          const usersForEmoji = currentReactions[emoji] || [];
          const hasReacted = usersForEmoji.includes(currentUserId);

          const updatedUsers = hasReacted
            ? usersForEmoji.filter((id) => id !== currentUserId)
            : [...usersForEmoji, currentUserId];

          return {
            ...msg,
            reactions: {
              ...currentReactions,
              [emoji]: updatedUsers,
            },
          };
        })
      );
    } else if (isolatedUser) {
      setDmMessages((prev) => {
        const userDms = prev[isolatedUser.id] || [];
        const updatedDms = userDms.map((msg) => {
          if (msg.id !== messageId) return msg;
          const currentReactions = msg.reactions || {};
          const usersForEmoji = currentReactions[emoji] || [];
          const hasReacted = usersForEmoji.includes(currentUserId);

          const updatedUsers = hasReacted
            ? usersForEmoji.filter((id) => id !== currentUserId)
            : [...usersForEmoji, currentUserId];

          return {
            ...msg,
            reactions: {
              ...currentReactions,
              [emoji]: updatedUsers,
            },
          };
        });
        return { ...prev, [isolatedUser.id]: updatedDms };
      });
    }
  };

  const handleReport = (msgId: string) => {
    toast.success('Message reported to Student Governance Jury for review');
  };

  // Active room messages filtered
  const displayedMessages = activeMode === 'public'
    ? publicMessages.filter((m) => m.roomId === activeRoomId)
    : (isolatedUser ? dmMessages[isolatedUser.id] || [] : []);

  const activeRoom = DEFAULT_CHAT_ROOMS.find((r) => r.id === activeRoomId) || DEFAULT_CHAT_ROOMS[0];

  // Filter members for sidebar
  const filteredStudents = CAMPUS_STUDENTS.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background text-foreground overflow-hidden">
      
      {/* LEFT SIDEBAR NAVIGATION */}
      <div className="w-80 border-r border-border bg-card flex flex-col shrink-0">
        
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border bg-card flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-sm text-foreground flex items-center gap-1.5">
                <span>Campus Chatrooms</span>
                <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[9px] py-0 px-1.5">
                  Live
                </Badge>
              </h2>
              <p className="text-[11px] text-muted-foreground">Global Rooms & 1-on-1 DMs</p>
            </div>
          </div>
        </div>

        {/* Sidebar Mode Tabs */}
        <div className="grid grid-cols-3 p-2 bg-muted/40 gap-1 border-b border-border text-xs font-bold">
          <button
            onClick={() => setSidebarTab('channels')}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              sidebarTab === 'channels'
                ? 'bg-card text-blue-600 dark:text-blue-400 shadow-xs border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Hash className="w-3.5 h-3.5 text-blue-500" />
            <span>Rooms</span>
          </button>

          <button
            onClick={() => setSidebarTab('dms')}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              sidebarTab === 'dms'
                ? 'bg-card text-blue-600 dark:text-blue-400 shadow-xs border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-purple-500" />
            <span>1-on-1s</span>
          </button>

          <button
            onClick={() => setSidebarTab('directory')}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              sidebarTab === 'directory'
                ? 'bg-card text-blue-600 dark:text-blue-400 shadow-xs border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-emerald-500" />
            <span>Students</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-border/60">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder={
                sidebarTab === 'channels'
                  ? 'Search public channels...'
                  : sidebarTab === 'dms'
                  ? 'Search isolated 1-on-1s...'
                  : 'Search student directory...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-8 text-xs rounded-xl bg-muted/30 border-border"
            />
          </div>
        </div>

        {/* Sidebar Content List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          
          {/* 1. PUBLIC CHANNELS TAB */}
          {sidebarTab === 'channels' && (
            <div className="space-y-1">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span>Public Chatrooms</span>
                <span className="text-blue-500 font-extrabold">{DEFAULT_CHAT_ROOMS.length} Active</span>
              </div>

              {DEFAULT_CHAT_ROOMS.filter((r) =>
                r.name.toLowerCase().includes(searchQuery.toLowerCase())
              ).map((room) => {
                const isSelected = activeMode === 'public' && activeRoomId === room.id;
                return (
                  <button
                    key={room.id}
                    onClick={() => {
                      setActiveMode('public');
                      setActiveRoomId(room.id);
                      setIsolatedUser(null);
                    }}
                    className={`w-full p-2.5 rounded-xl text-left flex items-center gap-3 transition-all ${
                      isSelected
                        ? 'bg-blue-600/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 font-bold'
                        : 'hover:bg-muted/60 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span className="text-lg">{room.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold truncate text-foreground flex items-center gap-1.5">
                        <span>{room.name}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate">{room.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* 2. ISOLATED 1-ON-1 CHATS TAB */}
          {sidebarTab === 'dms' && (
            <div className="space-y-1">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span>Isolated 1-on-1 Direct Chats</span>
                <span className="text-purple-500 font-extrabold">
                  {Object.keys(dmMessages).length} Active
                </span>
              </div>

              {CAMPUS_STUDENTS.map((student) => {
                const userDms = dmMessages[student.id] || [];
                const lastMsg = userDms[userDms.length - 1];
                const isSelected = activeMode === 'dm' && isolatedUser?.id === student.id;

                return (
                  <button
                    key={student.id}
                    onClick={() => handleIsolateUser(student)}
                    className={`w-full p-2.5 rounded-xl text-left flex items-center gap-3 transition-all ${
                      isSelected
                        ? 'bg-purple-600/10 border border-purple-500/30 text-purple-600 dark:text-purple-400 font-bold'
                        : 'hover:bg-muted/60 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <Avatar className="w-8 h-8 border border-border">
                        <AvatarImage src={student.avatar} />
                        <AvatarFallback>{student.name[0]}</AvatarFallback>
                      </Avatar>
                      {student.isOnline ? (
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-card animate-pulse" />
                      ) : (
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-zinc-400 dark:bg-zinc-600 rounded-full border-2 border-card" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-xs font-bold text-foreground">
                        <span className="truncate">{student.name}</span>
                        <Badge className={`text-[9px] py-0 px-1 border-0 ${
                          student.isOnline 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300' 
                            : 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400'
                        }`}>
                          {student.isOnline ? 'Online' : 'Offline'}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {lastMsg ? lastMsg.content : student.statusText}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* 3. CAMPUS DIRECTORY / ISOLATE ANY STUDENT */}
          {sidebarTab === 'directory' && (
            <div className="space-y-1">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span>Student Directory ({filteredStudents.length})</span>
                <span className="text-emerald-500">Tap to Isolate</span>
              </div>

              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="p-2.5 rounded-xl border border-border/50 bg-card/60 hover:bg-muted/60 flex items-center justify-between gap-2 transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative shrink-0">
                      <Avatar className="w-8 h-8 border border-border">
                        <AvatarImage src={student.avatar} />
                        <AvatarFallback>{student.name[0]}</AvatarFallback>
                      </Avatar>
                      {student.isOnline ? (
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-card animate-pulse" />
                      ) : (
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-zinc-400 dark:bg-zinc-600 rounded-full border-2 border-card" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-foreground truncate flex items-center gap-1.5">
                        <span>{student.name}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate flex items-center gap-1">
                        <span>{student.department}</span>
                        <span>•</span>
                        <span className={`font-semibold ${student.isOnline ? 'text-emerald-500' : 'text-zinc-400'}`}>
                          {student.isOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleIsolateUser(student)}
                    className="h-7 px-2.5 text-[10px] font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-lg shrink-0 gap-1"
                    title="Isolate in 1-on-1 Chat"
                  >
                    <Lock className="w-3 h-3" />
                    <span>Isolate</span>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Current User Status Footer */}
        <div className="p-3 border-t border-border bg-card flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar className="w-8 h-8 border border-border">
              <AvatarImage src={currentUserAvatar} />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="text-xs font-bold text-foreground truncate">{currentUserName}</div>
              <div className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Verified Student
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col bg-background relative overflow-hidden">
        
        {/* HEADER BAR */}
        <div className="h-16 border-b border-border bg-card/90 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-10 shadow-xs">
          
          {activeMode === 'public' ? (
            /* Public Room Header */
            <div className="flex items-center gap-3">
              <div className="text-2xl">{activeRoom.icon}</div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-extrabold text-base text-foreground">
                    {activeRoom.name}
                  </h3>
                  <Badge className="bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px] font-bold">
                    Public Chatroom
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{activeRoom.description}</p>
              </div>
            </div>
          ) : (
            /* Isolated 1-on-1 Private Header */
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReturnToPublic}
                className="h-8 w-8 p-0 rounded-xl text-muted-foreground hover:text-foreground"
                title="Return to Public Chatroom"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>

              <div className="relative">
                <Avatar className="w-9 h-9 border border-purple-500/50">
                  <AvatarImage src={isolatedUser?.avatar} />
                  <AvatarFallback>{isolatedUser?.name[0]}</AvatarFallback>
                </Avatar>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-purple-600 rounded-full border-2 border-card flex items-center justify-center text-[8px] text-white">
                  🔒
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-extrabold text-base text-foreground">
                    {isolatedUser?.name}
                  </h3>
                  <Badge className="bg-purple-600 text-white font-bold text-[10px] py-0.5 px-2 gap-1 shadow-xs">
                    <Lock className="w-3 h-3" /> Isolated 1-on-1 Session
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
                  <span>{isolatedUser?.department} • {isolatedUser?.role}</span>
                  <span>•</span>
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    isolatedUser?.isOnline 
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                      : 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isolatedUser?.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400 dark:bg-zinc-500'}`} />
                    <span>{isolatedUser?.isOnline ? 'Online' : 'Offline'}</span>
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Action Header Controls */}
          <div className="flex items-center gap-2">
            {activeMode === 'dm' && isolatedUser && (
              <>
                <Button
                  size="sm"
                  variant={isFocusMode ? 'default' : 'outline'}
                  onClick={() => setIsFocusMode(!isFocusMode)}
                  className={`text-xs h-9 px-3 rounded-xl gap-1.5 font-bold ${
                    isFocusMode ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{isFocusMode ? 'Focus Active' : 'Focus Mode'}</span>
                </Button>
              </>
            )}

            {activeMode === 'dm' && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleReturnToPublic}
                className="text-xs h-9 px-3 rounded-xl gap-1.5 font-bold border-border"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="hidden sm:inline">Exit 1-on-1</span>
              </Button>
            )}

            {activeMode === 'public' && (
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs py-1.5 px-3 font-bold gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>AI Copilot Guard Active</span>
              </Badge>
            )}
          </div>
        </div>

        {/* ISOLATED 1-ON-1 EXCLUSIVE BANNER */}
        {activeMode === 'dm' && isolatedUser && (
          <div className="bg-gradient-to-r from-purple-950/30 via-purple-900/15 to-background border-b border-purple-500/30 px-6 py-2.5 flex items-center justify-between text-xs text-purple-900 dark:text-purple-200 shrink-0">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-500 shrink-0 animate-pulse" />
              <span>
                <strong>Isolated 1-on-1 Session:</strong> Messages exchanged here are direct and private between you and <strong>{isolatedUser.name}</strong>.
              </span>
            </div>
            <button
              onClick={handleReturnToPublic}
              className="font-bold underline text-purple-600 hover:text-purple-500 dark:text-purple-400 text-[11px] shrink-0"
            >
              Return to Campus Chatroom
            </button>
          </div>
        )}

        {/* MESSAGES LIST AREA */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4" ref={scrollRef}>
          
          {displayedMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-muted/50 border border-border flex items-center justify-center text-muted-foreground">
                {activeMode === 'dm' ? <Lock className="w-8 h-8 text-purple-500" /> : <MessageSquare className="w-8 h-8 text-blue-500" />}
              </div>
              <h4 className="font-bold text-foreground text-base">
                {activeMode === 'dm' ? `Isolated 1-on-1 Chat with ${isolatedUser?.name}` : `Welcome to #${activeRoom.name}`}
              </h4>
              <p className="text-xs max-w-sm">
                {activeMode === 'dm'
                  ? 'Send a direct message to start this private conversation.'
                  : 'Start chatting with students, share code snippets, or click any avatar to isolate 1-on-1!'}
              </p>
            </div>
          ) : (
            displayedMessages.map((msg) => {
              const isMe = msg.senderId === currentUserId;
              const senderStudent = CAMPUS_STUDENTS.find((s) => s.id === msg.senderId);

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 group/msg ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Sender Avatar */}
                  <Avatar className="w-9 h-9 border border-border shadow-xs shrink-0 mt-0.5">
                    <AvatarImage src={msg.senderAvatar} />
                    <AvatarFallback>{msg.senderName[0]}</AvatarFallback>
                  </Avatar>

                  {/* Message Bubble Container */}
                  <div className={`max-w-[80%] sm:max-w-[70%] space-y-1 ${isMe ? 'items-end text-right' : 'items-start text-left'}`}>
                    
                    {/* Header line: Sender Name, Role, Timestamp */}
                    <div className={`flex items-baseline gap-2 text-xs text-muted-foreground ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <span className="font-bold text-foreground hover:underline cursor-pointer">
                        {msg.senderName}
                      </span>
                      {msg.senderDept && (
                        <span className="text-[10px] bg-muted px-1.5 py-0.2 rounded font-semibold text-muted-foreground">
                          {msg.senderDept}
                        </span>
                      )}
                      <span className="text-[10px]">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Main Bubble Content */}
                    <div
                      className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs relative ${
                        isMe
                          ? 'bg-blue-600 text-white rounded-tr-none'
                          : msg.isPrivate
                          ? 'bg-purple-900/10 border border-purple-500/20 text-foreground rounded-tl-none'
                          : 'bg-card border border-border text-foreground rounded-tl-none'
                      }`}
                    >
                      {/* Text Content */}
                      <div className="whitespace-pre-wrap break-words">{msg.content}</div>

                      {/* Code Snippet Block if any */}
                      {msg.codeSnippet && (
                        <div className="mt-2.5 p-3 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800">
                          <div className="flex items-center justify-between pb-1 mb-2 border-b border-slate-800 text-[10px] text-slate-400 uppercase font-bold">
                            <span>{msg.codeSnippet.language}</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(msg.codeSnippet?.code || '');
                                toast.success('Code copied to clipboard!');
                              }}
                              className="hover:text-white flex items-center gap-1"
                            >
                              <Copy className="w-3 h-3" /> Copy
                            </button>
                          </div>
                          <code>{msg.codeSnippet.code}</code>
                        </div>
                      )}

                      {/* Attachments if any */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-2 rounded-xl overflow-hidden border border-border/60 max-w-sm">
                          {msg.attachments.map((att, i) => (
                            <img key={i} src={att.url} alt={att.name} className="w-full h-auto object-cover max-h-60" />
                          ))}
                        </div>
                      )}

                      {/* Hover Action Bar: Reactions & Isolate 1-on-1 */}
                      <div
                        className={`absolute top-0 -translate-y-1/2 hidden group-hover/msg:flex items-center gap-1 p-1 bg-card border border-border rounded-xl shadow-md z-20 ${
                          isMe ? 'right-full mr-2' : 'left-full ml-2'
                        }`}
                      >
                        {/* Quick Reaction Emojis */}
                        {['👍', '❤️', '🔥', '💡', '🎉'].map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleReaction(msg.id, emoji)}
                            className="p-1 hover:bg-muted rounded-lg text-xs transition-transform hover:scale-125"
                            title={`React with ${emoji}`}
                          >
                            {emoji}
                          </button>
                        ))}

                        {!isMe && senderStudent && activeMode === 'public' && (
                          <Button
                            size="sm"
                            onClick={() => handleIsolateUser(senderStudent)}
                            className="h-6 px-2 text-[10px] font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-lg gap-1"
                            title="Isolate this student in 1-on-1 Chat"
                          >
                            <Lock className="w-2.5 h-2.5" />
                            <span>Isolate 1-on-1</span>
                          </Button>
                        )}

                        {!isMe && (
                          <button
                            onClick={() => handleReport(msg.id)}
                            className="p-1 text-muted-foreground hover:text-red-500 rounded-lg text-xs"
                            title="Report to Jury"
                          >
                            <Flag className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Reactions Pill Display underneath message */}
                    {msg.reactions && Object.keys(msg.reactions).some((k) => ((msg.reactions?.[k] as string[])?.length || 0) > 0) && (
                      <div className={`flex flex-wrap gap-1 pt-0.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                        {Object.entries(msg.reactions).map(([emoji, userIdsRaw]) => {
                          const userIds = (userIdsRaw as string[]) || [];
                          if (!userIds || userIds.length === 0) return null;
                          const hasReacted = userIds.includes(currentUserId);
                          return (
                            <button
                              key={emoji}
                              onClick={() => handleReaction(msg.id, emoji)}
                              className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 font-bold transition-all ${
                                hasReacted
                                  ? 'bg-blue-600/15 border-blue-500/40 text-blue-600 dark:text-blue-400'
                                  : 'bg-card border-border text-muted-foreground hover:bg-muted'
                              }`}
                            >
                              <span>{emoji}</span>
                              <span>{userIds.length}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Typing Indicator */}
          {typingText && (
            <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400 font-semibold italic animate-pulse px-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>{typingText}</span>
            </div>
          )}
        </div>

        {/* INPUT FORM BAR */}
        <div className="p-4 bg-card shrink-0 border-t border-border space-y-3">
          
          {/* AI Guard Warning Banner */}
          {safetyViolation && (
            <div className="bg-destructive/10 text-destructive text-xs p-3 rounded-xl flex items-center justify-between border border-destructive/25">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <div>
                  <span className="font-bold capitalize">{safetyViolation.type} Guard Triggered: </span>
                  <span>{safetyViolation.reason}</span>
                </div>
              </div>
              <span className="text-[10px] bg-destructive/15 px-2 py-0.5 rounded font-semibold shrink-0">
                Tap Send again to bypass
              </span>
            </div>
          )}

          {/* Code Snippet Input Popup Drawer if active */}
          {showCodeInput && (
            <div className="p-3 bg-slate-950 text-slate-100 rounded-xl border border-slate-800 space-y-2 text-xs animate-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between text-slate-400 font-bold">
                <span className="flex items-center gap-1.5 text-blue-400">
                  <Code className="w-4 h-4" /> Insert Code Snippet
                </span>
                <select
                  value={codeLang}
                  onChange={(e) => setCodeLang(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200"
                >
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="cpp">C++ / C</option>
                  <option value="sql">SQL Query</option>
                  <option value="html">HTML / CSS</option>
                </select>
              </div>
              <textarea
                rows={3}
                placeholder="Paste or type code snippet here..."
                value={codeText}
                onChange={(e) => setCodeText(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Image URL Input Drawer if active */}
          {showImageInput && (
            <div className="p-3 bg-muted/40 rounded-xl border border-border space-y-2 text-xs">
              <div className="font-bold text-foreground flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-purple-500" /> Attach Image Banner
              </div>
              <Input
                placeholder="Paste Image URL (e.g. https://images.unsplash.com/...)"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="h-9 text-xs rounded-lg"
              />
            </div>
          )}

          {/* Form Controls */}
          <form onSubmit={handleSendMessage} className="flex items-center gap-2 relative">
            
            {/* Quick Attachment Toggles */}
            <div className="flex items-center gap-1 shrink-0">
              <Button
                type="button"
                variant={showCodeInput ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setShowCodeInput(!showCodeInput)}
                className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground"
                title="Code Snippet"
              >
                <Code className="w-4 h-4" />
              </Button>

              <Button
                type="button"
                variant={showImageInput ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setShowImageInput(!showImageInput)}
                className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground"
                title="Attach Image"
              >
                <ImageIcon className="w-4 h-4" />
              </Button>
            </div>

            {/* Input Field */}
            <Input
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setSafetyViolation(null);
              }}
              placeholder={
                activeMode === 'dm' && isolatedUser
                  ? `Private 1-on-1 message to ${isolatedUser.name}...`
                  : `Message #${activeRoom.name}...`
              }
              className="flex-1 rounded-xl bg-muted/30 border-border h-10 text-xs sm:text-sm focus-visible:ring-1 focus-visible:ring-blue-500"
              disabled={checkingSafety}
            />

            {/* Send Button */}
            <Button
              type="submit"
              disabled={(!content.trim() && !codeText.trim() && !imageUrl.trim()) || checkingSafety}
              className={`h-10 px-4 rounded-xl font-bold text-xs gap-1.5 shrink-0 ${
                activeMode === 'dm'
                  ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
              }`}
            >
              {checkingSafety ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
