import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent } from '../ui/sheet';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Users, ShieldCheck, Megaphone, Share2, Check, Lock, Globe, UserCheck, Info, Search, ShieldAlert, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { 
  getJoinRequestsForCommunity, 
  processJoinRequest, 
  updateCommunityVisibility, 
  getStoredCommunities 
} from '../../lib/communityStore';
import { JoinRequestsModal } from './JoinRequestsModal';
import { JoinRequest } from '../../types';

interface GroupInfoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  community: any;
  isAdmin: boolean;
  billboardsCount: number;
  onOpenBillboard: () => void;
}

export function GroupInfoDrawer({
  isOpen,
  onClose,
  community,
  isAdmin,
  billboardsCount,
  onOpenBillboard,
}: GroupInfoDrawerProps) {
  const [copied, setCopied] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [showJoinRequestsModal, setShowJoinRequestsModal] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<JoinRequest[]>([]);
  const [visibility, setVisibility] = useState<'public' | 'private'>(community?.visibility || 'public');

  useEffect(() => {
    if (community?.id) {
      setPendingRequests(getJoinRequestsForCommunity(community.id));
      const communities = getStoredCommunities();
      const currentComm = communities.find(c => c.id === community.id);
      if (currentComm) setVisibility(currentComm.visibility);
    }
  }, [community?.id, isOpen]);

  useEffect(() => {
    const handleUpdate = () => {
      if (community?.id) {
        setPendingRequests(getJoinRequestsForCommunity(community.id));
        const communities = getStoredCommunities();
        const currentComm = communities.find(c => c.id === community.id);
        if (currentComm) setVisibility(currentComm.visibility);
      }
    };
    window.addEventListener('center7_community_update', handleUpdate);
    return () => window.removeEventListener('center7_community_update', handleUpdate);
  }, [community?.id]);

  // Sample group members
  const mockMembers = [
    { id: '1', name: 'Nana Adu Asare', role: 'Group Admin', avatar: '/sss.jpeg', isOnline: true },
    { id: '2', name: 'KIM_LENO Admin', role: 'Group Admin', avatar: '/sss.jpeg', isOnline: true },
    { id: '3', name: 'Kofi Mensah', role: 'Member', isOnline: true },
    { id: '4', name: 'Ama Owusu', role: 'Member', isOnline: false },
    { id: '5', name: 'Kwame Boateng', role: 'Member', isOnline: false },
    { id: '6', name: 'Abena Sarfo', role: 'Member', isOnline: true },
  ];

  const filteredMembers = mockMembers.filter(m => 
    m.name.toLowerCase().includes(memberSearch.toLowerCase())
  );

  const groupInviteUrl = `${window.location.origin}/communities/${community?.id || 'group'}`;

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(groupInviteUrl);
    setCopied(true);
    toast.success('Group invite link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleVisibility = (newVisibility: 'public' | 'private') => {
    if (!community?.id) return;
    updateCommunityVisibility(community.id, newVisibility);
    setVisibility(newVisibility);
    toast.success(`Group privacy changed to ${newVisibility.toUpperCase()}`);
  };

  const handleProcessRequest = (requestId: string, action: 'approved' | 'declined') => {
    processJoinRequest(requestId, action);
    if (community?.id) {
      setPendingRequests(getJoinRequestsForCommunity(community.id));
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
        <SheetContent className="w-full sm:max-w-md p-0 overflow-y-auto bg-card border-l border-border flex flex-col">
          
          {/* Header Banner */}
          <div className="bg-[#075e54] dark:bg-[#202c33] text-white p-6 flex flex-col items-center justify-center text-center relative border-b border-border/40">
            <div className="w-20 h-20 rounded-full bg-emerald-700 text-white font-bold text-3xl flex items-center justify-center border-4 border-white/20 shadow-lg mb-3 overflow-hidden">
              {community?.avatarUrl ? (
                <img src={community.avatarUrl} alt={community.name} className="w-full h-full object-cover" />
              ) : (
                <span>{community?.name?.charAt(0) || 'G'}</span>
              )}
            </div>

            <h3 className="font-heading font-bold text-xl text-white tracking-tight">
              {community?.name}
            </h3>

            {/* Privacy Badge */}
            <div className="flex items-center gap-2 mt-2">
              <Badge 
                className={`text-[10px] font-bold py-0.5 px-2.5 rounded-full uppercase tracking-wider gap-1 border ${
                  visibility === 'public'
                    ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30'
                    : 'bg-amber-500/20 text-amber-200 border-amber-400/30'
                }`}
              >
                {visibility === 'public' ? (
                  <>
                    <Globe className="w-3 h-3 text-emerald-300" />
                    Public Group
                  </>
                ) : (
                  <>
                    <Lock className="w-3 h-3 text-amber-300" />
                    Private Group (Approval Req.)
                  </>
                )}
              </Badge>
              <span className="text-xs text-emerald-100/80">• {community?.memberCount || 28} members</span>
            </div>
          </div>

          {/* Content Body */}
          <div className="p-5 space-y-5 flex-1">
            
            {/* Quick Group Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={onOpenBillboard}
                className="bg-amber-500/15 text-amber-900 dark:text-amber-200 border border-amber-500/30 hover:bg-amber-500/25 h-11 rounded-xl flex items-center justify-center gap-2 font-bold text-xs"
              >
                <Megaphone className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Group Billboard ({billboardsCount})</span>
              </Button>

              <Button
                variant="outline"
                onClick={handleCopyInvite}
                className="h-11 rounded-xl flex items-center justify-center gap-2 font-bold text-xs"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Invite Link'}</span>
              </Button>
            </div>

            {/* Admin Settings & Join Requests Section (Admin Only) */}
            {isAdmin && (
              <div className="space-y-3 bg-card p-4 rounded-xl border border-amber-500/40 shadow-2xs">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                    <Settings className="w-3.5 h-3.5 text-amber-500" />
                    <span>Admin Group Settings</span>
                  </h4>
                  <Badge className="bg-amber-500 text-white text-[9px] font-bold">Admin Privileges</Badge>
                </div>

                {/* Privacy Setting Toggle */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground block">
                    Group Privacy Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleVisibility('public')}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        visibility === 'public'
                          ? 'bg-emerald-500/15 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold'
                          : 'bg-muted/30 border-border text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs">
                        <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Public</span>
                      </div>
                      <p className="text-[10px] font-normal text-muted-foreground mt-1">Instant auto-join</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleVisibility('private')}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        visibility === 'private'
                          ? 'bg-amber-500/15 border-amber-500 text-amber-900 dark:text-amber-200 font-bold'
                          : 'bg-muted/30 border-border text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs">
                        <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>Private</span>
                      </div>
                      <p className="text-[10px] font-normal text-muted-foreground mt-1">Requires Admin approval</p>
                    </button>
                  </div>
                </div>

                {/* Pending Join Requests Button */}
                <div className="pt-1">
                  <Button
                    onClick={() => setShowJoinRequestsModal(true)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 rounded-lg gap-2 justify-between"
                  >
                    <span className="flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4" />
                      <span>Review Join Requests</span>
                    </span>
                    <Badge className="bg-white text-emerald-800 font-extrabold text-[10px] px-2">
                      {pendingRequests.length} Pending
                    </Badge>
                  </Button>
                </div>
              </div>
            )}

            {/* Group Description */}
            <div className="space-y-2 bg-muted/30 p-3.5 rounded-xl border border-border/50">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                <Info className="w-3.5 h-3.5 text-emerald-600" />
                <span>Group Description</span>
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                {community?.description || 'Official student group on Center7. Peer-moderated with equal voting rights.'}
              </p>
            </div>

            {/* Members List Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-primary" />
                  <span>{mockMembers.length} Group Members</span>
                </h4>
                <span className="text-[11px] text-muted-foreground font-medium">
                  2 Group Admins
                </span>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search group members..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="pl-8 h-8 text-xs rounded-lg"
                />
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {filteredMembers.map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center overflow-hidden">
                          {m.avatar ? <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" /> : m.name.charAt(0)}
                        </div>
                        {m.isOnline && (
                          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full absolute bottom-0 right-0 border border-card"></span>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-foreground flex items-center gap-1.5">
                          <span>{m.name}</span>
                          {m.role === 'Group Admin' && (
                            <Badge className="bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-[9px] py-0 px-1 font-bold">
                              Group Admin
                            </Badge>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {m.isOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Join Requests Modal */}
      <JoinRequestsModal
        isOpen={showJoinRequestsModal}
        onClose={() => setShowJoinRequestsModal(false)}
        groupName={community?.name || 'Group'}
        requests={pendingRequests}
        onProcessRequest={handleProcessRequest}
      />
    </>
  );
}
