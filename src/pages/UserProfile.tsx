import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { 
  UserPlus, UserCheck, MessageSquare, Shield, Star, Award, 
  MapPin, BookOpen, Clock, Tag, ThumbsUp, MessageCircle, Share2, 
  Check, X, Sparkles, Building2
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorDepartment?: string;
  content: string;
  tags: string[];
  likes: number;
  commentsCount: number;
  createdAt: string;
}

export function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, profile: currentProfile } = useAuthStore();

  // Mock database of users
  const mockUsers: Record<string, any> = {
    'user-alex': {
      id: 'user-alex',
      displayName: 'Alex Chen',
      email: 'alex.chen@university.edu',
      department: 'Computer Science',
      major: 'Software Engineering & AI',
      trustLevel: 3,
      reputationScore: 285,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex.chen',
      bio: 'Passionate CS senior building decentralized student governance tools. Always down for hackathons and algo prep.',
      joinedDate: '2024-09-15',
    },
    'user-sarah': {
      id: 'user-sarah',
      displayName: 'Sarah Miller',
      email: 'sarah.m@university.edu',
      department: 'Business & Finance',
      major: 'FinTech & Quantitative Economics',
      trustLevel: 2,
      reputationScore: 190,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah.m',
      bio: 'Finance lead at FinTech Society. Studying market algorithms and campus micro-entrepreneurship.',
      joinedDate: '2024-10-01',
    },
    'user-david': {
      id: 'user-david',
      displayName: 'David Okon',
      email: 'david.o@university.edu',
      department: 'Engineering & Tech',
      major: 'Electrical & Embedded Systems',
      trustLevel: 4,
      reputationScore: 420,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david.o',
      bio: 'Hardware tinkerer, student council representative, and open-source enthusiast.',
      joinedDate: '2024-08-20',
    },
  };

  const targetUser = mockUsers[userId || ''] || {
    id: userId || 'user-unknown',
    displayName: `Student ${userId ? userId.substring(0, 6) : 'User'}`,
    department: 'General Studies',
    major: 'Higher Education',
    trustLevel: 1,
    reputationScore: 120,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId || 'student'}`,
    bio: 'Student community member on Center7.',
    joinedDate: '2025-01-10',
  };

  // Connection status state: 'none' | 'pending_sent' | 'pending_received' | 'connected'
  const [connectionStatus, setConnectionStatus] = useState<'none' | 'pending_sent' | 'pending_received' | 'connected'>(() => {
    // Check localStorage for existing friend state
    try {
      const friends = JSON.parse(localStorage.getItem('center7_connected_friends') || '[]');
      if (friends.includes(targetUser.id)) return 'connected';

      const pending = JSON.parse(localStorage.getItem('center7_pending_requests') || '[]');
      if (pending.includes(targetUser.id)) return 'pending_sent';
    } catch (e) {
      console.error(e);
    }
    return 'none';
  });

  // User posts
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 'post-u-1',
      authorId: targetUser.id,
      authorName: targetUser.displayName,
      authorAvatar: targetUser.avatar,
      authorDepartment: targetUser.department,
      content: `Just uploaded my revised notes for the upcoming ${targetUser.department} exam! Check out the Resource Center for past solutions.`,
      tags: ['ExamPrep', targetUser.department.replace(/\s+/g, '')],
      likes: 24,
      commentsCount: 5,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'post-u-2',
      authorId: targetUser.id,
      authorName: targetUser.displayName,
      authorAvatar: targetUser.avatar,
      authorDepartment: targetUser.department,
      content: `Participating in today's student governance vote regarding library 24/7 access. Make sure your voice is heard!`,
      tags: ['StudentGovernance', 'CampusLife'],
      likes: 42,
      commentsCount: 11,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
  ]);

  const handleConnect = () => {
    if (!currentUser) {
      toast.error('Please sign in to connect with other students');
      return;
    }

    if (connectionStatus === 'none') {
      setConnectionStatus('pending_sent');
      try {
        const pending = JSON.parse(localStorage.getItem('center7_pending_requests') || '[]');
        localStorage.setItem('center7_pending_requests', JSON.stringify([...pending, targetUser.id]));
      } catch (e) {
        console.error(e);
      }
      toast.success(`Friend request sent to ${targetUser.displayName}!`);
    } else if (connectionStatus === 'pending_sent') {
      setConnectionStatus('none');
      toast.info('Friend request cancelled');
    } else if (connectionStatus === 'connected') {
      setConnectionStatus('none');
      try {
        const friends = JSON.parse(localStorage.getItem('center7_connected_friends') || '[]');
        localStorage.setItem('center7_connected_friends', JSON.stringify(friends.filter((id: string) => id !== targetUser.id)));
      } catch (e) {
        console.error(e);
      }
      toast.info(`Disconnected from ${targetUser.displayName}`);
    }
  };

  const handleDirectMessage = () => {
    navigate('/chat');
    toast.info(`Opening message stream with ${targetUser.displayName}`);
  };

  const handleLikePost = (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6 pb-safe">
      {/* Profile Banner & Header */}
      <Card className="border-border shadow-md overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 relative">
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/20 backdrop-blur border border-blue-400/30 text-blue-200 text-xs font-semibold">
              <Shield className="w-3.5 h-3.5 text-blue-300" /> Trust Level {targetUser.trustLevel}
            </span>
          </div>
        </div>

        <CardContent className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-12 mb-4">
            <div className="flex items-end gap-4">
              <Avatar className="w-24 h-24 rounded-2xl border-4 border-card shadow-xl shrink-0">
                <AvatarImage src={targetUser.avatar} />
                <AvatarFallback>{targetUser.displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="pt-2 sm:pt-0">
                <h2 className="text-xl sm:text-2xl font-bold font-heading text-foreground flex items-center gap-2">
                  {targetUser.displayName}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-semibold">
                    Verified Student
                  </span>
                </h2>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-500" /> {targetUser.department} • {targetUser.major}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            {currentUser?.uid !== targetUser.id && (
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <Button
                  onClick={handleConnect}
                  className={`flex-1 sm:flex-initial text-xs font-bold gap-2 rounded-xl transition-all ${
                    connectionStatus === 'connected'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : connectionStatus === 'pending_sent'
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20'
                  }`}
                >
                  {connectionStatus === 'connected' ? (
                    <>
                      <UserCheck className="w-4 h-4" /> Connected
                    </>
                  ) : connectionStatus === 'pending_sent' ? (
                    <>
                      <Clock className="w-4 h-4" /> Request Sent
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" /> Connect (Friend)
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleDirectMessage}
                  className="text-xs font-semibold gap-1.5 rounded-xl border-border hover:bg-muted"
                >
                  <MessageSquare className="w-4 h-4 text-blue-500" /> Direct Message
                </Button>
              </div>
            )}
          </div>

          <p className="text-sm text-foreground/90 leading-relaxed max-w-2xl mt-2">
            {targetUser.bio}
          </p>

          {/* User Rep & Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-border/60">
            <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
              <span className="text-[11px] text-muted-foreground uppercase font-semibold flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-500" /> Reputation Points
              </span>
              <span className="text-lg font-bold text-foreground mt-0.5 block">{targetUser.reputationScore} Rep</span>
            </div>

            <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
              <span className="text-[11px] text-muted-foreground uppercase font-semibold flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-blue-500" /> Governance Rank
              </span>
              <span className="text-lg font-bold text-foreground mt-0.5 block">Trust Level {targetUser.trustLevel}</span>
            </div>

            <div className="p-3 rounded-xl bg-muted/30 border border-border/50 col-span-2 sm:col-span-1">
              <span className="text-[11px] text-muted-foreground uppercase font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-purple-500" /> Joined Campus
              </span>
              <span className="text-sm font-bold text-foreground mt-1 block">
                {format(new Date(targetUser.joinedDate || Date.now()), 'MMM yyyy')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Posts Stream */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold font-heading flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          {targetUser.displayName}&apos;s Campus Activity & Posts
        </h3>

        {posts.map((post) => (
          <Card key={post.id} className="bento-card hover:border-blue-500/40 transition-all">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 border border-border">
                    <AvatarImage src={post.authorAvatar} />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{post.authorName}</h4>
                    <p className="text-[11px] text-muted-foreground">
                      {post.authorDepartment} • {format(new Date(post.createdAt || Date.now()), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>

                {connectionStatus === 'connected' && (
                  <span className="text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                    Connected Friend
                  </span>
                )}
              </div>
            </CardHeader>

            <CardContent className="px-4 py-2 space-y-3">
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {post.tags.map((tag) => (
                  <span 
                    key={tag} 
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full hover:bg-blue-500/20 cursor-pointer transition-colors"
                  >
                    <Tag className="w-3 h-3" /> #{tag}
                  </span>
                ))}
              </div>
            </CardContent>

            <div className="px-4 py-2 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleLikePost(post.id)}
                className="gap-1.5 hover:text-blue-600 text-xs h-8"
              >
                <ThumbsUp className="w-3.5 h-3.5" /> {post.likes} Likes
              </Button>

              <span className="flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5" /> {post.commentsCount} Comments
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
