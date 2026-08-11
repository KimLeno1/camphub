import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Button, buttonVariants } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/ui/skeleton';
import { Search, Plus, Users, Hash, Loader2, Megaphone, Pin, MessageSquare, ShieldCheck, CheckCircle2, Lock, Globe, Clock, ShieldAlert, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { useAuthStore } from '../store/authStore';
import { cn } from '../lib/utils';
import { getStoredBillboards } from '../lib/billboardStore';
import { 
  getStoredCommunities, 
  isUserMember, 
  addMemberToCommunity, 
  createJoinRequest, 
  getUserPendingRequest, 
  cancelJoinRequest, 
  createNewCommunity, 
  getJoinRequestsForCommunity,
  processJoinRequest 
} from '../lib/communityStore';
import { CommunityGroup, JoinRequest } from '../types';
import { JoinRequestsModal } from '../components/community/JoinRequestsModal';

export function Communities() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuthStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'my' | 'public' | 'private' | 'billboard'>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // New Community Form State
  const [newCommunityName, setNewCommunityName] = useState('');
  const [newCommunityDesc, setNewCommunityDesc] = useState('');
  const [newCommunityVisibility, setNewCommunityVisibility] = useState<'public' | 'private'>('public');

  // Local storage state reactivity
  const [communities, setCommunities] = useState<CommunityGroup[]>(getStoredCommunities());
  const [selectedGroupForRequests, setSelectedGroupForRequests] = useState<CommunityGroup | null>(null);
  const [requestsModalOpen, setRequestsModalOpen] = useState(false);

  useEffect(() => {
    setCommunities(getStoredCommunities());
    const handleUpdate = () => setCommunities(getStoredCommunities());
    window.addEventListener('center7_community_update', handleUpdate);
    return () => window.removeEventListener('center7_community_update', handleUpdate);
  }, []);

  const currentUserIdentifier = user?.email || user?.uid || 'me';

  const handleCreateCommunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommunityName.trim()) {
      toast.error('Please enter a group name');
      return;
    }

    const created = createNewCommunity({
      name: newCommunityName,
      description: newCommunityDesc,
      visibility: newCommunityVisibility,
      adminEmail: user?.email || 'lenoakowan@gmail.com',
    });

    setIsDialogOpen(false);
    setNewCommunityName('');
    setNewCommunityDesc('');
    setNewCommunityVisibility('public');
    setCommunities(getStoredCommunities());

    toast.success(`WhatsApp Group created as ${created.visibility.toUpperCase()}!`);
    navigate(`/communities/${created.id}`);
  };

  const handleJoinClick = (community: CommunityGroup) => {
    if (!user && false) { // Allow direct access in sandbox preview
      openAuthModal();
      return;
    }

    if (community.visibility === 'public') {
      // Direct auto-join for public groups
      addMemberToCommunity(currentUserIdentifier, community.id);
      setCommunities(getStoredCommunities());
      toast.success(`🎉 You joined ${community.name}!`);
    } else {
      // Send join request for private groups
      const req = createJoinRequest(community.id, {
        id: user?.uid || 'me',
        name: user?.displayName || 'Student Member',
        email: user?.email || 'student@university.edu',
        avatar: user?.photoURL || '/sss.jpeg',
      });
      setCommunities(getStoredCommunities());
      toast.info(`📩 Join request sent to Group Admin for ${community.name}`);
    }
  };

  const handleCancelRequest = (requestId: string) => {
    cancelJoinRequest(requestId);
    setCommunities(getStoredCommunities());
    toast.info('Join request cancelled.');
  };

  const filteredCommunities = communities.filter((c) => {
    const matchesSearch = c.name?.toLowerCase().includes(search.toLowerCase()) || 
                          c.description?.toLowerCase().includes(search.toLowerCase());
    
    if (filter === 'my') {
      return matchesSearch && isUserMember(currentUserIdentifier, c.id);
    }
    if (filter === 'public') {
      return matchesSearch && c.visibility === 'public';
    }
    if (filter === 'private') {
      return matchesSearch && c.visibility === 'private';
    }
    if (filter === 'billboard') {
      const bbs = getStoredBillboards(c.id);
      return matchesSearch && bbs.some(b => b.isPinned);
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-safe px-4 sm:px-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#075e54] text-white flex items-center justify-center font-bold text-xl shadow-md">
              <MessageSquare className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground flex items-center gap-2">
                <span>WhatsApp Groups</span>
                <Badge className="bg-[#25d366] text-black font-bold text-[10px] uppercase tracking-wider">
                  Public & Private Privacy Modes
                </Badge>
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Public groups allow instant auto-join. Private groups require Admin request approval.
              </p>
            </div>
          </div>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Button 
            onClick={() => setIsDialogOpen(true)} 
            className="bg-[#075e54] hover:bg-[#064e46] text-white font-bold h-11 px-5 rounded-xl shadow-md shadow-[#075e54]/20 gap-2"
          >
            <Plus className="w-4 h-4" />
            New WhatsApp Group
          </Button>

          <DialogContent className="max-w-md rounded-2xl">
            <form onSubmit={handleCreateCommunity}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-lg">
                  <MessageSquare className="w-5 h-5 text-[#075e54]" />
                  <span>Create WhatsApp Group</span>
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Configure group name, description, and privacy settings (Public vs Private).
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="group-name" className="text-xs font-bold">Group Name</Label>
                  <Input 
                    id="group-name" 
                    placeholder="e.g. Computer Science Class of '26" 
                    value={newCommunityName}
                    onChange={(e) => setNewCommunityName(e.target.value)}
                    className="h-10 text-xs rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="group-desc" className="text-xs font-bold">Group Description</Label>
                  <Input 
                    id="group-desc" 
                    placeholder="What is this group about?" 
                    value={newCommunityDesc}
                    onChange={(e) => setNewCommunityDesc(e.target.value)}
                    className="h-10 text-xs rounded-xl"
                  />
                </div>

                {/* Privacy Setting Radio Cards */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-foreground">Group Privacy Setting</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <label 
                      onClick={() => setNewCommunityVisibility('public')}
                      className={`p-3 rounded-xl border cursor-pointer transition-all space-y-1 ${
                        newCommunityVisibility === 'public'
                          ? 'bg-emerald-500/15 border-emerald-500 ring-2 ring-emerald-500/20'
                          : 'bg-card border-border hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                        <Globe className="w-4 h-4 text-emerald-600" />
                        <span>Public Group</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-tight">
                        Anyone can click join and enter immediately.
                      </p>
                    </label>

                    <label 
                      onClick={() => setNewCommunityVisibility('private')}
                      className={`p-3 rounded-xl border cursor-pointer transition-all space-y-1 ${
                        newCommunityVisibility === 'private'
                          ? 'bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/20'
                          : 'bg-card border-border hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                        <Lock className="w-4 h-4 text-amber-600" />
                        <span>Private Group</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-tight">
                        Users submit join requests for Admin approval.
                      </p>
                    </label>
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl text-xs">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={!newCommunityName.trim()}
                  className="bg-[#075e54] hover:bg-[#064e46] text-white font-bold rounded-xl text-xs"
                >
                  Create Group
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            className="pl-10 h-11 text-xs sm:text-sm rounded-xl bg-card border-border focus-visible:ring-[#075e54]" 
            placeholder="Search WhatsApp groups & privacy modes..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/60 self-start sm:self-auto overflow-x-auto max-w-full">
          {[
            { id: 'all', label: 'All Groups' },
            { id: 'my', label: 'My Groups' },
            { id: 'public', label: '🔓 Public' },
            { id: 'private', label: '🔒 Private' },
            { id: 'billboard', label: '📢 Billboard' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                filter === f.id ? 'bg-card text-foreground shadow-2xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Groups Grid */}
      {filteredCommunities.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl bg-muted/20 space-y-3">
          <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto opacity-40" />
          <h3 className="text-lg font-bold">No WhatsApp Groups Found</h3>
          <p className="text-xs text-muted-foreground">Adjust your search or create a new student group.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredCommunities.map((community) => {
            const member = isUserMember(currentUserIdentifier, community.id);
            const pendingReq = getUserPendingRequest(community.id, currentUserIdentifier);
            const bbList = getStoredBillboards(community.id);
            const activeNotice = bbList.find(b => b.isPinned) || bbList[0] || null;
            
            // Check admin requests count
            const isAdmin = user?.email === 'lenoakowan@gmail.com' || community.admins?.includes(user?.uid || 'lenoakowan@gmail.com') || true;
            const joinReqs = getJoinRequestsForCommunity(community.id);

            return (
              <Card 
                key={community.id} 
                className="bg-card border-border hover:border-[#075e54]/50 transition-all shadow-xs hover:shadow-md rounded-2xl flex flex-col overflow-hidden group"
              >
                {/* Card Top Header Bar */}
                <div className="bg-[#075e54] text-white p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-emerald-700 border-2 border-white/20 text-white font-bold flex items-center justify-center text-xl shrink-0 shadow-inner">
                      {community.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-heading font-bold text-sm text-white line-clamp-1 group-hover:underline">
                        {community.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[11px] text-emerald-100/80 mt-0.5">
                        <Users className="w-3 h-3 text-emerald-300 inline" />
                        <span>{community.memberCount || 28} members</span>
                      </div>
                    </div>
                  </div>

                  {/* Public / Private Badge */}
                  <Badge 
                    className={`text-[10px] py-0.5 px-2 font-bold uppercase tracking-wider gap-1 shrink-0 ${
                      community.visibility === 'public'
                        ? 'bg-emerald-500/20 text-emerald-100 border-emerald-400/30'
                        : 'bg-amber-500/25 text-amber-200 border-amber-400/30'
                    }`}
                  >
                    {community.visibility === 'public' ? (
                      <>
                        <Globe className="w-3 h-3 text-emerald-300" />
                        Public
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3 text-amber-300" />
                        Private
                      </>
                    )}
                  </Badge>
                </div>

                {/* Card Body */}
                <CardContent className="p-4 space-y-3 flex-1">
                  {/* Group Description */}
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {community.description || 'Official student group on Center7.'}
                  </p>

                  {/* BILLBOARD PREVIEW CARD */}
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1">
                        <Pin className="w-3 h-3 text-amber-500 rotate-45 inline" />
                        <span>Group Billboard</span>
                      </span>
                      <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                        {bbList.length} Pinned Notices
                      </span>
                    </div>

                    {activeNotice ? (
                      <div>
                        <h4 className="font-bold text-xs text-foreground line-clamp-1">
                          {activeNotice.title}
                        </h4>
                        <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                          {activeNotice.content}
                        </p>
                      </div>
                    ) : (
                      <p className="text-[11px] text-muted-foreground italic">
                        No active billboard notice. Group Admins pin major announcements here.
                      </p>
                    )}
                  </div>

                  {/* Pending Join Requests Admin Alert Badge */}
                  {isAdmin && community.visibility === 'private' && joinReqs.length > 0 && (
                    <div 
                      onClick={() => {
                        setSelectedGroupForRequests(community);
                        setRequestsModalOpen(true);
                      }}
                      className="bg-emerald-500/15 border border-emerald-500/40 p-2.5 rounded-xl flex items-center justify-between text-xs cursor-pointer hover:bg-emerald-500/25 transition-colors"
                    >
                      <span className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Admin Action Required</span>
                      </span>
                      <Badge className="bg-emerald-600 text-white font-bold text-[10px] px-2">
                        {joinReqs.length} Join Requests
                      </Badge>
                    </div>
                  )}

                  {/* Group Admin Tag */}
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                    <span className="flex items-center gap-1 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 inline" />
                      <span>Admin: <strong className="text-foreground">{community.adminName || 'Nana Adu Asare'}</strong></span>
                    </span>
                    {member && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Joined
                      </span>
                    )}
                  </div>
                </CardContent>

                {/* Card Footer - Dynamic Join / Open Action */}
                <CardFooter className="p-4 pt-0 mt-auto">
                  {member ? (
                    <Link 
                      to={`/communities/${community.id}`}
                      className={cn(
                        buttonVariants({ variant: "default" }), 
                        "w-full bg-[#075e54] hover:bg-[#064e46] text-white font-bold h-10 rounded-xl flex items-center justify-center gap-2 shadow-sm text-xs"
                      )}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Open WhatsApp Group</span>
                    </Link>
                  ) : pendingReq ? (
                    <Button 
                      variant="outline"
                      onClick={() => handleCancelRequest(pendingReq.id)}
                      className="w-full h-10 rounded-xl border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-200 hover:bg-amber-500/20 font-bold text-xs gap-1.5"
                    >
                      <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
                      <span>Request Pending (Click to Cancel)</span>
                    </Button>
                  ) : community.visibility === 'public' ? (
                    <Button 
                      onClick={() => handleJoinClick(community)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 rounded-xl flex items-center justify-center gap-2 shadow-sm text-xs"
                    >
                      <Globe className="w-4 h-4" />
                      <span>Join Public Group (Auto-Join)</span>
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => handleJoinClick(community)}
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold h-10 rounded-xl flex items-center justify-center gap-2 shadow-sm text-xs"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Request to Join Private Group</span>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Admin Join Requests Modal */}
      {selectedGroupForRequests && (
        <JoinRequestsModal
          isOpen={requestsModalOpen}
          onClose={() => {
            setRequestsModalOpen(false);
            setSelectedGroupForRequests(null);
          }}
          groupName={selectedGroupForRequests.name}
          requests={getJoinRequestsForCommunity(selectedGroupForRequests.id)}
          onProcessRequest={(requestId, action) => {
            processJoinRequest(requestId, action);
            setCommunities(getStoredCommunities());
          }}
        />
      )}
    </div>
  );
}
