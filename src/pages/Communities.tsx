import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Button, buttonVariants } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/ui/skeleton';
import { Search, Plus, Users, Hash, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { useAuthStore } from '../store/authStore';
import { cn } from '../lib/utils';

export function Communities() {
  const queryClient = useQueryClient();
  const { user, openAuthModal } = useAuthStore();
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // New Community Form
  const [newCommunityName, setNewCommunityName] = useState('');
  const [newCommunityDesc, setNewCommunityDesc] = useState('');

  const { data: communitiesData, isLoading, isError } = useQuery({
    queryKey: ['communities'],
    queryFn: async () => {
      const res = await apiClient.get('/communities');
      return res.data;
    },
  });

  const { data: myMembershipsData } = useQuery({
    queryKey: ['my-memberships'],
    queryFn: async () => {
      if (!user) return [];
      const res = await apiClient.get('/communities/my-memberships');
      return res.data;
    },
    enabled: !!user,
  });

  const communityList: any[] = Array.isArray(communitiesData) 
    ? communitiesData 
    : (communitiesData?.data && Array.isArray(communitiesData.data) ? communitiesData.data : []);

  const membershipList: any[] = Array.isArray(myMembershipsData) 
    ? myMembershipsData 
    : (myMembershipsData?.data && Array.isArray(myMembershipsData.data) ? myMembershipsData.data : []);

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      const res = await apiClient.post('/communities', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      setIsDialogOpen(false);
      setNewCommunityName('');
      setNewCommunityDesc('');
      toast.success('Community created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create community');
    }
  });

  const joinMutation = useMutation({
    mutationFn: async (communityId: string) => {
      const res = await apiClient.post(`/communities/${communityId}/join`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-memberships'] });
      toast.success('Joined community');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to join community');
    }
  });

  const handleJoin = (communityId: string) => {
    if (!user) {
      openAuthModal();
      return;
    }
    joinMutation.mutate(communityId);
  };

  const handleOpenCreateDialog = () => {
    if (!user) {
      openAuthModal();
      return;
    }
    setIsDialogOpen(true);
  };

  const isMember = (communityId: string) => {
    return membershipList.some((m: any) => m.communityId === communityId);
  };

  const filteredCommunities = communityList.filter((c: any) => 
    c.name?.toLowerCase().includes(search.toLowerCase()) || 
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-safe">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Communities</h1>
          <p className="text-muted-foreground mt-1">Discover and join decentralized student spaces.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          if (open && !user) {
            openAuthModal();
            return;
          }
          setIsDialogOpen(open);
        }}>
          <Button onClick={handleOpenCreateDialog} className="bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/20">
            <Plus className="w-4 h-4 mr-2" />
            Create Community
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a new community</DialogTitle>
              <DialogDescription>
                Communities are self-governed spaces for students with similar interests.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. Computer Science Class of '26" 
                  value={newCommunityName}
                  onChange={(e) => setNewCommunityName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input 
                  id="description" 
                  placeholder="What is this community about?" 
                  value={newCommunityDesc}
                  onChange={(e) => setNewCommunityDesc(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={() => createMutation.mutate({ name: newCommunityName, description: newCommunityDesc })}
                disabled={!newCommunityName || createMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input 
          className="pl-10 h-12 text-base rounded-xl bg-card border-border focus-visible:ring-blue-500" 
          placeholder="Search communities..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="bento-card">
              <CardHeader className="p-0 mb-4 flex flex-row items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </CardHeader>
              <CardContent className="p-0 mb-6 flex-1">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-4/5" />
              </CardContent>
              <CardFooter className="p-0 mt-auto">
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-12">
          <p className="text-destructive font-medium">Failed to load communities.</p>
        </div>
      ) : filteredCommunities?.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-xl bg-muted/20">
          <Hash className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">No communities found</h3>
          <p className="text-muted-foreground">Try adjusting your search or create a new one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCommunities?.map((community: any) => {
            const member = isMember(community.id);
            return (
              <Card key={community.id} className="bento-card">
                <CardHeader className="p-0 mb-4 flex flex-row items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center font-bold text-xl shrink-0">
                    {community.name.charAt(0)}
                  </div>
                  <div>
                    <CardTitle className="text-lg line-clamp-1">{community.name}</CardTitle>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <Users className="w-3 h-3 mr-1" />
                      <span>{community.memberCount || 0} members</span>
                      {member && <Badge variant="secondary" className="ml-2 py-0 h-4 text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">Joined</Badge>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 mb-6 flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {community.description || 'No description provided.'}
                  </p>
                </CardContent>
                <CardFooter className="p-0 mt-auto pt-4 border-t border-border/50">
                  {member ? (
                    <Link 
                      to={`/communities/${community.id}`}
                      className={cn(buttonVariants({ variant: "secondary" }), "w-full text-center inline-flex justify-center items-center")}
                    >
                      Open Community
                    </Link>
                  ) : (
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold" 
                      onClick={() => handleJoin(community.id)}
                      disabled={joinMutation.isPending}
                    >
                      {joinMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Join Community'}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
