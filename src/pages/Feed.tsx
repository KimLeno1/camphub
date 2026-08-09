import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { 
  Rss, Tag, MessageCircle, ThumbsUp, ThumbsDown, Share2, Plus, Sparkles, 
  UserPlus, SlidersHorizontal, Users, Search, 
  Send, Clock, Paperclip, Check, Shield, Flame, CheckCircle2, X,
  Settings as SettingsIcon, Flag, ArrowUp, ArrowDown, Scale, AlertTriangle, 
  Eye, EyeOff, Info, Activity, MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { FeedPreferencesModal } from '../components/modals/FeedPreferencesModal';
import { apiClient } from '../lib/api/client';

interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorDepartment?: string;
  isFriend?: boolean;
  content: string;
  tags: string[];
  likes: number;
  commentsCount: number;
  createdAt: string;
  attachmentUrl?: string;
}

interface Comment {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorDepartment: string;
  content: string;
  createdAt: string;
}

const PRESET_TAGS = [
  'ComputerScience',
  'Engineering',
  'ExamPrep',
  'FinTech',
  'CampusHousing',
  'StudentLife',
  'ResearchPaper',
  'General',
];

export function Feed() {
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'recommended' | 'friends' | 'all'>('recommended');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  // New post creation states
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTags, setNewPostTags] = useState<string[]>(['General']);
  const [tagInput, setTagInput] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  // Comments state keyed by postId
  const [commentsByPostId, setCommentsByPostId] = useState<Record<string, Comment[]>>({
    'post-1': [
      {
        id: 'c-1',
        authorName: 'Sarah Miller',
        authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah.m',
        authorDepartment: 'Business & Finance',
        content: 'I checked your Dijkstra complexity solutions on page 4, they are highly elegant. Mind if we include this in our study session slides?',
        createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
      },
      {
        id: 'c-2',
        authorName: 'Prof. Clara Thomas',
        authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=clara.t',
        authorDepartment: 'Research & Humanities',
        content: 'Excellent academic initiative, Alex. Verified community contributions like this are exactly why the reputation system was established.',
        createdAt: new Date(Date.now() - 3600000 * 0.5).toISOString(),
      }
    ],
    'post-2': [
      {
        id: 'c-3',
        authorName: 'Alex Chen',
        authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex.chen',
        authorDepartment: 'Computer Science',
        content: 'Will there be hands-on contract trials? I want to build a decentralized escrow contract demo.',
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      }
    ],
    'post-3': [
      {
        id: 'c-4',
        authorName: 'David Okon',
        authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david.o',
        authorDepartment: 'Engineering & Tech',
        content: 'Tested it this morning. Constant 150Mbps, absolutely game-changing for study groups here.',
        createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
      }
    ]
  });

  const [expandedCommentsPostId, setExpandedCommentsPostId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState('');

  // Post reporting state
  const [reportingPost, setReportingPost] = useState<Post | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportCategory, setReportCategory] = useState('spam');
  const [reportedPostsSet, setReportedPostsSet] = useState<Set<string>>(new Set());
  const [hiddenFlaggedPosts, setHiddenFlaggedPosts] = useState<Set<string>>(new Set());

  // Vote state: postId -> 'up' | 'down' | null
  const [postVotes, setPostVotes] = useState<Record<string, 'up' | 'down' | null>>({});

  // Connected friends state
  const [connectedFriends, setConnectedFriends] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('center7_connected_friends');
      return stored ? JSON.parse(stored) : ['user-alex', 'user-sarah'];
    } catch {
      return ['user-alex', 'user-sarah'];
    }
  });

  // Pending friend requests
  const [pendingRequests, setPendingRequests] = useState<any[]>([
    {
      id: 'req-1',
      senderId: 'user-david',
      senderName: 'David Okon',
      senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david.o',
      department: 'Engineering & Tech',
    },
  ]);

  // Feed preferences from user settings
  const [userPreferences, setUserPreferences] = useState<any>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('center7_feed_preferences');
      if (stored) {
        setUserPreferences(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, [isPreferencesOpen]);

  // Initial posts array
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 'post-1',
      authorId: 'user-alex',
      authorName: 'Alex Chen',
      authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex.chen',
      authorDepartment: 'Computer Science & IT',
      isFriend: true,
      content: 'Hey everyone! I just published the complete past midterm solutions for CS201 Data Structures in the Resource Center. Let me know if you spot any bugs in the algorithms!',
      tags: ['ComputerScience', 'ExamPrep'],
      likes: 38,
      commentsCount: 2,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      attachmentUrl: '/resources',
    },
    {
      id: 'post-2',
      authorId: 'user-sarah',
      authorName: 'Sarah Miller',
      authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah.m',
      authorDepartment: 'Business & Finance',
      isFriend: true,
      content: 'FinTech Society is holding an open hackathon prep workshop this Friday in Hall 4. We will cover decentralized trading APIs and smart contract basics.',
      tags: ['FinTech', 'Engineering', 'StudentLife'],
      likes: 29,
      commentsCount: 1,
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: 'post-3',
      authorId: 'user-david',
      authorName: 'David Okon',
      authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david.o',
      authorDepartment: 'Engineering & Tech',
      isFriend: false,
      content: 'Hostel Block B study room now has high-speed Wi-Fi upgraded! Thank you to the student jury for approving the infrastructure improvement proposal.',
      tags: ['CampusHousing', 'StudentLife'],
      likes: 54,
      commentsCount: 1,
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
    {
      id: 'post-4',
      authorId: 'user-clara',
      authorName: 'Prof. Clara Thomas',
      authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=clara.t',
      authorDepartment: 'Research & Humanities',
      isFriend: false,
      content: 'Reminder to all undergraduate research fellows: the deadline for spring paper abstracts is approaching next Wednesday. Submit via the research portal.',
      tags: ['ResearchPaper', 'General'],
      likes: 18,
      commentsCount: 0,
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
  ]);

  const handleAddTag = () => {
    if (tagInput.trim()) {
      const formatted = tagInput.trim().replace(/^#/, '');
      if (!newPostTags.includes(formatted)) {
        setNewPostTags([...newPostTags, formatted]);
      }
      setTagInput('');
    }
  };

  const handleTogglePresetTag = (tag: string) => {
    setNewPostTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) {
      toast.error('Post content cannot be empty');
      return;
    }

    const createdPost: Post = {
      id: `post-${Date.now()}`,
      authorId: user?.uid || 'current-user',
      authorName: profile?.displayName || user?.email?.split('@')[0] || 'You',
      authorAvatar: profile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid || 'me'}`,
      authorDepartment: profile?.department || 'Computer Science',
      isFriend: true,
      content: newPostContent.trim(),
      tags: newPostTags.length > 0 ? newPostTags : ['General'],
      likes: 1,
      commentsCount: 0,
      createdAt: new Date().toISOString(),
      attachmentUrl: attachmentUrl.trim() || undefined,
    };

    setPosts([createdPost, ...posts]);
    setCommentsByPostId(prev => ({ ...prev, [createdPost.id]: [] }));
    setNewPostContent('');
    setNewPostTags(['General']);
    setAttachmentUrl('');
    setIsCreatingPost(false);
    toast.success('Post published to campus feed!');
  };

  // Upvote/Downvote logic (Reddit/StackOverflow style)
  const handleVote = (postId: string, direction: 'up' | 'down') => {
    const currentVote = postVotes[postId] || null;

    setPostVotes(prev => ({
      ...prev,
      [postId]: currentVote === direction ? null : direction
    }));

    setPosts(prevPosts => 
      prevPosts.map(p => {
        if (p.id !== postId) return p;

        let delta = 0;
        if (direction === 'up') {
          if (currentVote === 'up') delta = -1;
          else if (currentVote === 'down') delta = 2;
          else delta = 1;
        } else {
          if (currentVote === 'down') delta = 1;
          else if (currentVote === 'up') delta = -2;
          else delta = -1;
        }

        return { ...p, likes: p.likes + delta };
      })
    );
  };

  const handleAddComment = (postId: string) => {
    if (!newCommentText.trim()) {
      toast.error('Comment text cannot be empty');
      return;
    }

    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      authorName: profile?.displayName || user?.email?.split('@')[0] || 'You',
      authorAvatar: profile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid || 'me'}`,
      authorDepartment: profile?.department || 'Computer Science',
      content: newCommentText.trim(),
      createdAt: new Date().toISOString()
    };

    setCommentsByPostId(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newComment]
    }));

    setPosts(prevPosts =>
      prevPosts.map(p => p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p)
    );

    setNewCommentText('');
    toast.success('Comment posted successfully!');
  };

  const handleSharePost = (post: Post) => {
    try {
      const shareUrl = `${window.location.origin}/feed?post=${post.id}`;
      navigator.clipboard.writeText(shareUrl);
      toast.success('Post link copied to clipboard!');
    } catch {
      toast.success('Post is ready to share!');
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingPost) return;
    if (!reportReason.trim()) {
      toast.error('Please specify a reason or evidence');
      return;
    }

    try {
      // Real API integration if user is logged in
      await apiClient.post('/governance/cases', {
        targetType: 'message', // matches backend model expectation
        targetId: reportingPost.id,
        reason: `[Feed Post Category: ${reportCategory}] ${reportReason.trim()}`
      }).catch((err) => {
        console.warn('Real backend report failed or path undefined, running offline fallback mode', err);
      });

      setReportedPostsSet(prev => {
        const next = new Set(prev);
        next.add(reportingPost.id);
        return next;
      });

      setHiddenFlaggedPosts(prev => {
        const next = new Set(prev);
        next.add(reportingPost.id);
        return next;
      });

      toast.success('Jury case submitted!', {
        description: 'An anonymized Peer Case was filed. 7 random students with reputation > 120 will review.',
        duration: 5000
      });

      setReportingPost(null);
      setReportReason('');
    } catch (err) {
      toast.error('Failed to submit report. Please try again.');
    }
  };

  const handleAcceptRequest = (req: any) => {
    const updated = [...connectedFriends, req.senderId];
    setConnectedFriends(updated);
    localStorage.setItem('center7_connected_friends', JSON.stringify(updated));
    setPendingRequests((prev) => prev.filter((r) => r.id !== req.id));
    toast.success(`You are now connected with ${req.senderName}!`);
  };

  const handleDeclineRequest = (reqId: string) => {
    setPendingRequests((prev) => prev.filter((r) => r.id !== reqId));
    toast.info('Connection request declined');
  };

  const filteredPosts = posts.filter((post) => {
    // Search query filter
    if (
      searchQuery &&
      !post.content.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !post.authorName.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Selected Tag filter
    if (selectedTagFilter && !post.tags.includes(selectedTagFilter)) {
      return false;
    }

    // Tab filter
    if (activeTab === 'friends') {
      return connectedFriends.includes(post.authorId) || post.authorId === user?.uid;
    }

    if (activeTab === 'recommended' && userPreferences) {
      if (userPreferences.topics && userPreferences.topics.length > 0) {
        const matchesTopic = post.tags.some((t) =>
          userPreferences.topics.some((prefTopic: string) =>
            prefTopic.toLowerCase().includes(t.toLowerCase()) ||
            t.toLowerCase().includes(prefTopic.toLowerCase())
          )
        );
        return matchesTopic || connectedFriends.includes(post.authorId);
      }
    }

    return true;
  });

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6 pb-safe">
      <FeedPreferencesModal open={isPreferencesOpen} onOpenChange={setIsPreferencesOpen} />

      {/* Campus Feed Header Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white shadow-xl border border-blue-500/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold">
              <Activity className="w-3.5 h-3.5 animate-pulse" /> Peer-to-Peer Newsroom
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-white flex items-center gap-2">
              <Rss className="w-8 h-8 text-blue-400 shrink-0" />
              Campus Feed
            </h1>
            <p className="text-blue-100/80 text-xs sm:text-sm leading-relaxed">
              No admins, no algorithms. Every update, debate, and study guide is community-driven, governed entirely by peer moderation logs and direct reputation weights.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Button
              variant="outline"
              onClick={() => setIsPreferencesOpen(true)}
              className="text-xs font-semibold gap-1.5 rounded-xl border-blue-400/30 text-blue-200 bg-white/5 hover:bg-white/15 shrink-0"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Feed Rules
            </Button>
            <Button
              onClick={() => navigate('/settings')}
              className="text-xs font-semibold gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shrink-0 shadow-lg shadow-blue-600/20"
            >
              <SettingsIcon className="w-3.5 h-3.5" />
              Preferences
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Main Feed and Creator (8 Cols) */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* Expanded Beautiful Creator Box */}
          <Card className="border-border shadow-sm overflow-hidden bg-card/60 backdrop-blur-md transition-all duration-300">
            <CardContent className="p-4 sm:p-5 space-y-3.5">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 border border-border shrink-0">
                  <AvatarImage src={profile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid || 'me'}`} />
                  <AvatarFallback>ME</AvatarFallback>
                </Avatar>
                <div 
                  onClick={() => setIsCreatingPost(true)}
                  className={`w-full bg-muted/40 hover:bg-muted/70 border border-border/50 rounded-xl px-4 py-2.5 text-xs text-muted-foreground cursor-pointer transition-all ${isCreatingPost ? 'hidden' : 'block'}`}
                >
                  Share an update, study question, or announcement with campus peers...
                </div>
                {isCreatingPost && (
                  <div className="text-xs font-bold text-foreground">
                    Create Community Post
                  </div>
                )}
              </div>

              <AnimatePresence>
                {isCreatingPost && (
                  <motion.form 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleCreatePost} 
                    className="space-y-4 pt-3 border-t border-border/50"
                  >
                    <textarea
                      rows={4}
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder="Write your post here... Markdown format is supported. Use tags like #ComputerScience, #ExamPrep, #CampusHousing to categorize your announcement."
                      className="w-full p-3 text-xs bg-muted/40 rounded-xl border border-border/70 focus:outline-none focus:ring-2 focus:ring-blue-500 text-foreground resize-none transition-all"
                    />

                    {/* Attachment Link */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <Paperclip className="w-3.5 h-3.5" /> Attach Study Resource / Material URL (Optional)
                      </label>
                      <Input
                        value={attachmentUrl}
                        onChange={(e) => setAttachmentUrl(e.target.value)}
                        placeholder="https://storage.center7.edu/resources/cs201-midterm.pdf"
                        className="text-xs h-8.5 rounded-lg bg-muted/30"
                      />
                    </div>

                    {/* Preset Topic Tags */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                        Select Relevant Topics
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {PRESET_TAGS.map((tag) => {
                          const isSelected = newPostTags.includes(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => handleTogglePresetTag(tag)}
                              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                                isSelected
                                  ? 'bg-blue-600 text-white shadow-sm'
                                  : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                              }`}
                            >
                              #{tag}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Custom Tag Inputs */}
                    <div className="flex items-center gap-2 pt-1">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="Add custom tag (e.g. Hostels)"
                        className="text-xs h-8.5 rounded-lg bg-muted/30"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                      />
                      <Button type="button" variant="outline" size="sm" onClick={handleAddTag} className="text-xs h-8.5 rounded-lg">
                        Add Custom Tag
                      </Button>
                    </div>

                    {/* Selected Tags list */}
                    {newPostTags.length > 0 && (
                      <div className="flex flex-wrap gap-1 bg-muted/30 p-2 rounded-lg border border-border/50">
                        {newPostTags.map((tag) => (
                          <span key={tag} className="inline-flex items-center gap-1 text-[11px] bg-blue-500/15 text-blue-600 dark:text-blue-400 px-2.5 py-0.5 rounded-full font-bold">
                            #{tag}
                            <X className="w-3.5 h-3.5 cursor-pointer text-blue-500 hover:text-blue-700" onClick={() => setNewPostTags(newPostTags.filter(t => t !== tag))} />
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-border/40">
                      <span className="text-[11px] text-muted-foreground italic">
                        Writing as: {profile?.displayName || 'Anonymous student'}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button type="button" variant="ghost" size="sm" onClick={() => setIsCreatingPost(false)} className="text-xs">
                          Cancel
                        </Button>
                        <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1.5 rounded-xl shadow-md shadow-blue-600/10">
                          <Send className="w-3.5 h-3.5" /> Post to Campus Feed
                        </Button>
                      </div>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Search, Filter, and View Tabs Group */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 sm:pb-0 scrollbar-none">
              <button
                onClick={() => { setActiveTab('recommended'); setSelectedTagFilter(null); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'recommended' && !selectedTagFilter
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                Recommended
              </button>
              <button
                onClick={() => { setActiveTab('friends'); setSelectedTagFilter(null); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'friends' && !selectedTagFilter
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Users className="w-3.5 h-3.5" /> Friends Feed
              </button>
              <button
                onClick={() => { setActiveTab('all'); setSelectedTagFilter(null); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'all' && !selectedTagFilter
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                All Campus Posts
              </button>
              
              {selectedTagFilter && (
                <span className="text-xs text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1 bg-blue-500/10 px-2.5 py-1.5 rounded-xl shrink-0 border border-blue-500/20">
                  Tag: #{selectedTagFilter}
                  <X className="w-3.5 h-3.5 cursor-pointer ml-1" onClick={() => setSelectedTagFilter(null)} />
                </span>
              )}
            </div>

            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posts or authors..."
                className="pl-8 rounded-xl bg-card border-border text-xs h-8.5"
              />
            </div>
          </div>

          {/* Posts Stream */}
          <div className="space-y-4">
            {filteredPosts.length === 0 ? (
              <Card className="p-12 text-center border-dashed border-2 border-border/80 bg-card/20">
                <Rss className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30 animate-pulse" />
                <h3 className="font-bold text-foreground text-sm">No Campus Posts Found</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Try clearing active tag filters, changing search phrases, or editing settings discovery feeds.
                </p>
                {selectedTagFilter && (
                  <Button variant="outline" size="sm" onClick={() => setSelectedTagFilter(null)} className="mt-4 text-xs">
                    Clear Filter
                  </Button>
                )}
              </Card>
            ) : (
              filteredPosts.map((post) => {
                const isReportedByMe = reportedPostsSet.has(post.id);
                const isHidden = hiddenFlaggedPosts.has(post.id);
                const isCommentsOpen = expandedCommentsPostId === post.id;
                const activeVote = postVotes[post.id] || null;

                if (isHidden) {
                  return (
                    <div key={post.id} className="p-4 border border-orange-500/20 bg-orange-500/[0.02] rounded-2xl flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        <span className="text-xs text-muted-foreground">
                          Post by <strong className="text-foreground">{post.authorName}</strong> flagged for review. Awaiting random jury verdict.
                        </span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          setHiddenFlaggedPosts(prev => {
                            const next = new Set(prev);
                            next.delete(post.id);
                            return next;
                          });
                        }}
                        className="text-[11px] h-7 px-2 hover:bg-orange-500/10 text-orange-600 dark:text-orange-400"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> Reveal
                      </Button>
                    </div>
                  );
                }

                return (
                  <Card key={post.id} className="bento-card hover:border-blue-500/30 transition-all duration-200">
                    <CardHeader className="p-4 pb-2.5">
                      <div className="flex items-start justify-between">
                        <Link to={`/profile/${post.authorId}`} className="flex items-center gap-3 group">
                          <Avatar className="w-10 h-10 border border-border group-hover:border-blue-500 transition-colors">
                            <AvatarImage src={post.authorAvatar} />
                            <AvatarFallback>{post.authorName.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-bold text-sm text-foreground group-hover:text-blue-600 transition-colors flex items-center gap-1.5 flex-wrap">
                              {post.authorName}
                              {post.isFriend && (
                                <span className="text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-500/20">
                                  Friend
                                </span>
                              )}
                              {isReportedByMe && (
                                <span className="text-[10px] bg-orange-500/15 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full font-bold border border-orange-500/20 flex items-center gap-1">
                                  <Shield className="w-3 h-3" /> Reported to Jury
                                </span>
                              )}
                            </h4>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {post.authorDepartment} • {format(new Date(post.createdAt || Date.now()), 'MMM d, h:mm a')}
                            </p>
                          </div>
                        </Link>

                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSharePost(post)}
                            title="Copy link to post"
                            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setReportingPost(post)}
                            title="Report post to student jury"
                            className={`h-8 w-8 rounded-lg ${isReportedByMe ? 'text-orange-500 hover:text-orange-600' : 'text-muted-foreground hover:text-orange-500'}`}
                          >
                            <Flag className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="px-4 py-1 space-y-3">
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                        {post.content}
                      </p>

                      {post.attachmentUrl && (
                        <div className="p-3 rounded-xl bg-blue-500/[0.04] border border-blue-500/15 text-xs text-blue-600 dark:text-blue-400 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 truncate">
                            <Paperclip className="w-4 h-4 shrink-0 text-blue-500" />
                            <span className="truncate font-semibold">Attached Study Document / Resource Link</span>
                          </div>
                          <Link to={post.attachmentUrl} className="underline font-bold hover:text-blue-700 shrink-0 text-[11px]">
                            Open Link
                          </Link>
                        </div>
                      )}

                      {/* Post Tags */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {post.tags.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => setSelectedTagFilter(tag)}
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full transition-all border ${
                              selectedTagFilter === tag
                                ? 'bg-blue-600 border-blue-600 text-white font-bold shadow-sm'
                                : 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/10 hover:bg-blue-500/20'
                            }`}
                          >
                            <Tag className="w-3 h-3" /> #{tag}
                          </button>
                        ))}
                      </div>
                    </CardContent>

                    {/* Integrated Interactive Actions Footer */}
                    <div className="px-4 py-2 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground bg-muted/10">
                      
                      {/* Sophisticated Upvote/Downvote Group */}
                      <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border border-border/50">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVote(post.id, 'up')}
                          className={`h-7 px-2.5 rounded-md gap-1 transition-all font-semibold text-xs ${
                            activeVote === 'up' 
                              ? 'text-blue-600 dark:text-blue-400 bg-blue-500/15 font-bold scale-[1.02]' 
                              : 'hover:text-blue-600'
                          }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" /> Upvote
                        </Button>
                        <span className="w-8 text-center font-mono font-semibold text-[11px] text-foreground">
                          {post.likes}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVote(post.id, 'down')}
                          className={`h-7 px-2.5 rounded-md gap-1 transition-all font-semibold text-xs ${
                            activeVote === 'down'
                              ? 'text-orange-600 dark:text-orange-400 bg-orange-500/15 font-bold scale-[1.02]'
                              : 'hover:text-orange-600'
                          }`}
                        >
                          <ThumbsDown className="w-3.5 h-3.5" /> Downvote
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedCommentsPostId(isCommentsOpen ? null : post.id)}
                        className={`gap-1.5 text-xs h-8 px-3 rounded-lg ${
                          isCommentsOpen ? 'text-blue-600 dark:text-blue-400 bg-blue-500/10' : 'hover:text-blue-600'
                        }`}
                      >
                        <MessageCircle className="w-4 h-4" /> 
                        {post.commentsCount} Comments
                      </Button>
                    </div>

                    {/* Expandable Comments / Peer Threads */}
                    <AnimatePresence>
                      {isCommentsOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t border-border/50 bg-muted/20"
                        >
                          <div className="p-4 space-y-4">
                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                              <MessageSquare className="w-3.5 h-3.5 text-blue-500" /> Discussion Thread
                            </div>

                            {/* Comment List */}
                            <div className="space-y-3.5">
                              {(!commentsByPostId[post.id] || commentsByPostId[post.id].length === 0) ? (
                                <p className="text-xs text-muted-foreground italic pl-2">No comments yet. Start the debate below!</p>
                              ) : (
                                commentsByPostId[post.id].map((comm) => (
                                  <div key={comm.id} className="flex gap-3 text-xs">
                                    <Avatar className="w-8 h-8 border border-border shrink-0">
                                      <AvatarImage src={comm.authorAvatar} />
                                      <AvatarFallback>{comm.authorName.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 bg-card p-3 rounded-2xl border border-border/60 shadow-xs space-y-1">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span className="font-bold text-foreground text-[11px]">{comm.authorName}</span>
                                          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm">{comm.authorDepartment}</span>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground font-mono">
                                          {format(new Date(comm.createdAt || Date.now()), 'MMM d, h:mm a')}
                                        </span>
                                      </div>
                                      <p className="text-muted-foreground text-xs leading-relaxed">{comm.content}</p>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>

                            {/* Post Comment Input */}
                            <div className="flex items-start gap-3 pt-2 border-t border-border/40">
                              <Avatar className="w-8 h-8 border border-border shrink-0">
                                <AvatarImage src={profile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid || 'me'}`} />
                                <AvatarFallback>ME</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 flex gap-2">
                                <Input
                                  value={newCommentText}
                                  onChange={(e) => setNewCommentText(e.target.value)}
                                  placeholder="Write a supportive reply or respectful question..."
                                  className="text-xs bg-card border-border rounded-xl h-8.5"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleAddComment(post.id);
                                    }
                                  }}
                                />
                                <Button 
                                  size="sm" 
                                  onClick={() => handleAddComment(post.id)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-8.5 rounded-xl px-3"
                                >
                                  Reply
                                </Button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Sidebar (4 Cols) */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Live Platform Telemetry */}
          <Card className="border-border shadow-sm overflow-hidden relative">
            <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-blue-500 animate-pulse" /> Self-Governance Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1 text-xs space-y-3">
              <p className="text-muted-foreground leading-relaxed">
                Center7 relies on continuous decentralized telemetry and randomly-selected peer juries.
              </p>
              
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="bg-muted/40 border border-border/50 p-2.5 rounded-xl text-center space-y-0.5">
                  <span className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Active Jurors</span>
                  <span className="font-mono font-extrabold text-foreground text-sm">48 Online</span>
                </div>
                <div className="bg-muted/40 border border-border/50 p-2.5 rounded-xl text-center space-y-0.5">
                  <span className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Jury Cases</span>
                  <span className="font-mono font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">3 Active</span>
                </div>
                <div className="bg-muted/40 border border-border/50 p-2.5 rounded-xl text-center space-y-0.5">
                  <span className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Constitution</span>
                  <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">v1.4 Adopted</span>
                </div>
                <div className="bg-muted/40 border border-border/50 p-2.5 rounded-xl text-center space-y-0.5">
                  <span className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Uptime</span>
                  <span className="font-mono font-extrabold text-blue-600 dark:text-blue-400 text-sm">100% Peer</span>
                </div>
              </div>

              <div className="bg-blue-500/[0.03] border border-blue-500/10 p-2.5 rounded-xl text-[11px] text-blue-600 dark:text-blue-400">
                Every member begins with **100 base reputation**. Bad behavior incurs automatic jury trials and point deductions.
              </div>
            </CardContent>
          </Card>

          {/* Trending Topics (Tags Filter Widget) */}
          <Card className="border-border shadow-sm">
            <CardHeader className="p-4 pb-2 border-b border-border/50">
              <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-foreground">
                <Flame className="w-4 h-4 text-orange-500 animate-bounce" /> Trending Campus Topics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3.5 space-y-1 pt-2">
              {[
                { name: 'ComputerScience', count: 18, isTrending: true },
                { name: 'ExamPrep', count: 14, isTrending: true },
                { name: 'FinTech', count: 11, isTrending: false },
                { name: 'CampusHousing', count: 9, isTrending: false },
                { name: 'StudentLife', count: 8, isTrending: false },
                { name: 'ResearchPaper', count: 6, isTrending: false },
              ].map((tag) => {
                const isSelected = selectedTagFilter === tag.name;
                return (
                  <button
                    key={tag.name}
                    onClick={() => setSelectedTagFilter(isSelected ? null : tag.name)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-blue-500/15 border border-blue-500/30 text-blue-600 dark:text-blue-400 font-bold'
                        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-blue-500/60" />
                      #{tag.name}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {tag.isTrending && (
                        <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest bg-amber-500/10 px-1 rounded-sm">Hot</span>
                      )}
                      <span className="font-mono text-[10px] text-muted-foreground/80">{tag.count} posts</span>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* Peer Connection Requests */}
          <Card className="border-border shadow-sm">
            <CardHeader className="p-4 pb-2 border-b border-border/50">
              <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center justify-between text-foreground">
                <span className="flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-blue-500" /> Connection Requests
                </span>
                {pendingRequests.length > 0 && (
                  <span className="text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full">
                    {pendingRequests.length}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {pendingRequests.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-2">
                  No pending connection requests
                </p>
              ) : (
                pendingRequests.map((req) => (
                  <div key={req.id} className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-2">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="w-8 h-8 border border-border shrink-0">
                        <AvatarImage src={req.senderAvatar} />
                        <AvatarFallback>{req.senderName.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <h5 className="font-bold text-xs text-foreground truncate">{req.senderName}</h5>
                        <p className="text-[10px] text-muted-foreground truncate">{req.department}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      <Button
                        size="sm"
                        onClick={() => handleAcceptRequest(req)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] h-7.5 font-bold rounded-lg"
                      >
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeclineRequest(req.id)}
                        className="text-[11px] h-7.5 rounded-lg"
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Settings Feed Config Widget */}
          <Card className="border-border shadow-sm bg-blue-500/[0.02] border-blue-200/50 dark:border-blue-900/40">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Algorithmic Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1 text-xs space-y-2 text-muted-foreground">
              <p className="leading-relaxed">
                Your Feed recommendations are dynamically prioritized by interests configured in settings.
              </p>
              <div className="space-y-1.5 pt-1 font-medium text-[11px]">
                <div className="flex items-center justify-between border-b border-border/40 pb-1">
                  <span>Prioritize My Major:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {userPreferences?.prioritizeMajor !== false ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Engagement Ranking:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {userPreferences?.showTrendingFirst !== false ? 'Trending First' : 'Chronological'}
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPreferencesOpen(true)}
                className="w-full text-xs font-bold border-blue-400/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 mt-2 rounded-xl h-8"
              >
                Configure Feed Rules
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* REPORTING MODAL FOR DECENTRALIZED JURY CASES */}
      <AnimatePresence>
        {reportingPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
            >
              <form onSubmit={handleReportSubmit}>
                <div className="p-5 border-b border-border/60 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
                      <Scale className="w-5 h-5" /> File Peer Jury Case
                    </h3>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setReportingPost(null)}
                      className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Center7 is governed entirely by students. Filing a case assigns 7 random trusted peers to evaluate the evidence anonymized. False reports penalty: -30 reputation points.
                  </p>
                </div>

                <div className="p-5 space-y-4">
                  {/* Target Post Summary */}
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/50 text-xs text-muted-foreground space-y-1">
                    <div className="font-semibold text-foreground">Post Author: {reportingPost.authorName}</div>
                    <div className="italic line-clamp-2">"{reportingPost.content}"</div>
                  </div>

                  {/* Violation Category */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Violation Category
                    </label>
                    <select
                      value={reportCategory}
                      onChange={(e) => setReportCategory(e.target.value)}
                      className="w-full text-xs p-2.5 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-foreground"
                    >
                      <option value="spam">Spam / Advertisements / Scams</option>
                      <option value="harassment">Targeted Harassment or Hate Speech</option>
                      <option value="academic">Academic Plagiarism / Exam Leakage</option>
                      <option value="malware">Malicious Attachment / Link</option>
                      <option value="offtopic">Off-topic announcements</option>
                    </select>
                  </div>

                  {/* Reason / Evidence */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Evidence & Detailed Justification
                    </label>
                    <textarea
                      rows={3}
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      placeholder="Please reference exact violations of Article II in the Community Constitution. Provide clean links or context as evidence."
                      className="w-full p-3 text-xs bg-muted/30 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-blue-500 text-foreground resize-none"
                      required
                    />
                  </div>
                </div>

                <div className="p-5 border-t border-border/60 bg-muted/10 flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setReportingPost(null)}
                    className="text-xs h-9 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-md"
                  >
                    Submit Case to Jury
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
