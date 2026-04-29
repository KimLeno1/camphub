import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppContext } from '../context/AppContext';
import { 
  Send, 
  Search, 
  MoreVertical, 
  User, 
  Users, 
  Hash, 
  Image as ImageIcon,
  Smile,
  Paperclip,
  Check,
  CheckCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  channelId: string;
  status?: 'sent' | 'delivered' | 'read';
}

interface ChatUser {
  id: string;
  name: string;
  role: string;
  socketId?: string;
  online?: boolean;
}

export function Messages() {
  const { user, tenant } = useAppContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [activeChannel, setActiveChannel] = useState('global');
  const [activeUsers, setActiveUsers] = useState<ChatUser[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const CHANNELS = [
    { id: 'global', name: 'Global Terminal', type: 'broadcast' },
    { id: 'study-group-a', name: 'Calc-III Study', type: 'group' },
    { id: 'campus-news', name: 'Institutional Feed', type: 'news' },
  ];

  useEffect(() => {
    // In production environment, we'd use the window.location.origin
    const socket = io();
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join', {
        id: user.id,
        name: user.name,
        role: user.role
      });
    });

    socket.on('users_update', (users: ChatUser[]) => {
      setActiveUsers(users);
    });

    socket.on('new_message', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socketRef.current) return;

    const messageData = {
      senderId: user.id,
      senderName: user.name,
      content: input,
      channelId: activeChannel
    };

    socketRef.current.emit('send_message', messageData);
    setInput('');
  };

  const filteredMessages = messages.filter(m => m.channelId === activeChannel);

  const [showMobileSidebar, setShowMobileSidebar] = useState(true);

  const handleChannelSelect = (id: string) => {
    setActiveChannel(id);
    setShowMobileSidebar(false);
  };

  return (
    <div className="h-[calc(100vh-150px)] md:h-[calc(100vh-140px)] flex bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 relative">
      {/* Sidebar - Channels & Users */}
      <div className={cn(
        "absolute inset-0 md:relative md:w-80 border-r border-slate-100 flex flex-col bg-slate-50/50 z-20 md:z-auto transition-transform duration-300 md:translate-x-0 w-full",
        showMobileSidebar ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between md:block">
          <h2 className="text-xl font-black text-slate-800 tracking-tight md:mb-6 uppercase">Sync Grid</h2>
          <button 
             onClick={() => setShowMobileSidebar(false)}
             className="md:hidden p-2 text-slate-400 hover:text-slate-800"
          >
             <Users className="w-6 h-6" />
          </button>
        </div>
        <div className="px-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search frequencies..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-indigo-50 transition"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-8 p-6 pt-0">
          <div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Channels</h3>
            <div className="space-y-1">
              {CHANNELS.map(ch => (
                <button
                  key={ch.id}
                  onClick={() => handleChannelSelect(ch.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
                    activeChannel === ch.id 
                      ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100 translate-x-1" 
                      : "text-slate-500 hover:bg-slate-100"
                  )}
                >
                  <Hash className={cn("w-4 h-4", activeChannel === ch.id ? "text-indigo-200" : "text-slate-400")} />
                  {ch.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active nodes</h3>
              <span className="flex items-center gap-1.5 text-[9px] font-black text-green-500 bg-green-50 px-2 py-0.5 rounded-full">
                {activeUsers.length} ONLINE
              </span>
            </div>
            <div className="space-y-4">
              {activeUsers.map(u => (
                <div key={u.id} className="flex items-center gap-3 group cursor-pointer" onClick={() => setShowMobileSidebar(false)}>
                  <div className="relative">
                    <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center text-slate-500 font-bold border border-slate-300">
                      {u.name.charAt(0)}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{u.name}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{u.role}</p>
                  </div>
                </div>
              ))}
              {activeUsers.length === 0 && (
                <div className="p-4 bg-slate-100 border border-dashed border-slate-200 rounded-2xl text-[9px] font-black text-slate-400 text-center uppercase tracking-widest">
                  No other nodes active
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Chat Header */}
        <div className="h-16 md:h-20 border-b border-slate-50 flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-3 md:gap-4 text-left">
            <button 
              className="md:hidden p-2 -ml-2 text-slate-400 hover:text-indigo-600"
              onClick={() => setShowMobileSidebar(true)}
            >
              <Users className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <Hash className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <div>
              <h2 className="text-xs md:text-sm font-black text-slate-800 uppercase tracking-tight">
                {CHANNELS.find(c => c.id === activeChannel)?.name}
              </h2>
              <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 md:gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> 
                {activeUsers.length} Nodes
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-6">
            <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-slate-800 transition">
              Archive Search
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-800 transition">
              <MoreVertical className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>

        {/* Messages List */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 md:p-10 space-y-6 scroll-smooth bg-slate-50/20"
        >
          {filteredMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto">
              <div className="w-20 h-20 bg-indigo-50 text-indigo-200 rounded-full flex items-center justify-center mb-6">
                <Users className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase mb-2">Protocol Silent</h3>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">
                Frequency {activeChannel} is clear. Data synchronization recommended for terminal growth.
              </p>
            </div>
          ) : (
            filteredMessages.map((msg, i) => {
              const isOwn = msg.senderId === user.id;
              return (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  key={msg.id}
                  className={cn(
                    "flex flex-col max-w-[80%] text-left",
                    isOwn ? "ml-auto items-end text-right" : "mr-auto"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1 px-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{msg.senderName}</span>
                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{msg.timestamp}</span>
                  </div>
                  <div className={cn(
                    "p-4 rounded-3xl text-sm font-medium leading-relaxed shadow-sm",
                    isOwn 
                      ? "bg-slate-900 text-white rounded-tr-none" 
                      : "bg-white border border-slate-100 text-slate-800 rounded-tl-none"
                  )}>
                    {msg.content}
                  </div>
                  <div className="mt-1.5 px-2">
                    {isOwn && (
                      <CheckCheck className="w-3.5 h-3.5 text-indigo-400" />
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Message Input */}
        <div className="p-4 md:p-8 border-t border-slate-50">
          <form 
            onSubmit={handleSendMessage}
            className="bg-slate-50 border border-slate-100 rounded-3xl p-1.5 md:p-2.5 flex items-center gap-2 md:gap-4 focus-within:ring-8 focus-within:ring-indigo-50/50 transition-all duration-500"
          >
            <div className="hidden sm:flex items-center gap-2 px-4">
              <button type="button" className="p-2 text-slate-400 hover:text-indigo-600 transition hover:scale-110 active:scale-95">
                <Paperclip className="w-5 h-5" />
              </button>
              <button type="button" className="p-2 text-slate-400 hover:text-indigo-600 transition hover:scale-110 active:scale-95">
                <ImageIcon className="w-5 h-5" />
              </button>
            </div>
            
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              type="text" 
              placeholder={`Broadcast /${activeChannel}...`}
              className="flex-1 w-full min-w-0 bg-transparent px-3 py-3 md:py-4 text-xs md:text-sm font-bold text-slate-800 outline-none placeholder:text-slate-400 placeholder:uppercase placeholder:tracking-widest"
            />

            <div className="flex items-center gap-1 md:gap-2 pr-1 md:pr-2">
              <button type="button" className="hidden sm:block p-3 text-slate-400 hover:text-amber-500 transition hover:scale-110 active:scale-95">
                <Smile className="w-5 h-5" />
              </button>
              <button 
                type="submit"
                disabled={!input.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 md:p-4 rounded-2xl transition shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 shrink-0"
              >
                <Send className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
