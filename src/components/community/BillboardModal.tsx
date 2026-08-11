import React, { useState } from 'react';
import { BillboardAnnouncement } from '../../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Pin, Megaphone, Plus, Trash2, CheckCircle2, AlertTriangle, Calendar, ShieldCheck, FileText, Search, UserCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface BillboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  billboards: BillboardAnnouncement[];
  isAdmin: boolean;
  onAddNotice: (notice: Omit<BillboardAnnouncement, 'id' | 'createdAt'>) => void;
  onTogglePin: (id: string) => void;
  onDeleteNotice: (id: string) => void;
  onAcknowledgeNotice: (id: string) => void;
  currentUserName: string;
}

export function BillboardModal({
  isOpen,
  onClose,
  billboards,
  isAdmin,
  onAddNotice,
  onTogglePin,
  onDeleteNotice,
  onAcknowledgeNotice,
  currentUserName,
}: BillboardModalProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'urgent' | 'announcement' | 'event' | 'rules'>('all');
  const [search, setSearch] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Form State for New Notice
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'announcement' | 'urgent' | 'event' | 'rules' | 'resource'>('announcement');
  const [isPinned, setIsPinned] = useState(true);

  const filteredNotices = billboards.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(search.toLowerCase()) || 
                          b.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeTab === 'all' || b.category === activeTab;
    return matchesSearch && matchesCategory;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Please provide a title and content for the billboard notice.');
      return;
    }

    onAddNotice({
      communityId: 'current',
      title,
      content,
      category,
      isPinned,
      authorId: 'me',
      authorName: currentUserName || 'Group Admin',
      authorRole: 'Group Admin',
      authorAvatar: '/sss.jpeg',
    });

    setTitle('');
    setContent('');
    setIsCreating(false);
    toast.success('📢 Announcement pinned to Group Billboard!');
  };

  const categoryBadgeMap: Record<string, { label: string; color: string; icon: any }> = {
    urgent: { label: 'Urgent Notice', color: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30', icon: AlertTriangle },
    announcement: { label: 'Announcement', color: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30', icon: Megaphone },
    event: { label: 'Event Schedule', color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30', icon: Calendar },
    rules: { label: 'Group Rules', color: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30', icon: ShieldCheck },
    resource: { label: 'Resource Link', color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30', icon: FileText },
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { onClose(); setIsCreating(false); } }}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden gap-0 rounded-2xl border-border">
        
        {/* Header */}
        <div className="p-5 border-b border-border bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-background flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shadow-2xs">
              <Megaphone className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <DialogTitle className="text-lg font-heading font-bold text-foreground flex items-center gap-2">
                <span>Group Billboard</span>
                <Badge variant="outline" className="text-[10px] bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30 font-bold">
                  Pinned Major Info
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Group Admins pin major announcements, schedules, guidelines & rules here.
              </DialogDescription>
            </div>
          </div>

          {isAdmin && !isCreating && (
            <Button 
              onClick={() => setIsCreating(true)} 
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs gap-1.5 shadow-md shadow-amber-600/20 rounded-xl"
            >
              <Plus className="w-4 h-4" />
              Post Notice
            </Button>
          )}
        </div>

        {/* Create Notice Form View */}
        {isCreating ? (
          <form onSubmit={handleCreateSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 bg-card">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Pin className="w-4 h-4 text-amber-500" />
                <span>Post New Billboard Announcement (Admin Only)</span>
              </h3>
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsCreating(false)} className="text-xs">
                Cancel
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notice-title" className="text-xs font-bold">Title</Label>
              <Input
                id="notice-title"
                placeholder="e.g. Midterm Timetable & Exam Guidelines..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-10 text-xs rounded-xl"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-bold">Category</Label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full h-10 text-xs rounded-xl border border-input bg-background px-3 font-medium text-foreground focus:ring-2 focus:ring-amber-500"
                >
                  <option value="announcement">📢 Announcement</option>
                  <option value="urgent">🚨 Urgent Notice</option>
                  <option value="event">📅 Event Schedule</option>
                  <option value="rules">📜 Group Rules</option>
                  <option value="resource">🔗 Resource Link</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold">Pin Option</Label>
                <label className="flex items-center gap-2 h-10 px-3 rounded-xl border border-input bg-background cursor-pointer hover:bg-muted/50">
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                  />
                  <span className="text-xs font-semibold text-foreground">Pin to Top Banner</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notice-content" className="text-xs font-bold">Announcement Content</Label>
              <Textarea
                id="notice-content"
                placeholder="Write full announcement details, links, or instructions..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[120px] text-xs rounded-xl leading-relaxed"
                required
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsCreating(false)} className="text-xs rounded-xl">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs gap-1.5 rounded-xl">
                <Pin className="w-3.5 h-3.5" />
                Publish to Billboard
              </Button>
            </div>
          </form>
        ) : (
          /* Notices List View */
          <div className="flex-1 flex flex-col overflow-hidden bg-muted/10">
            {/* Filter & Search Bar */}
            <div className="p-3 border-b border-border bg-card flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search notices..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-8 text-xs rounded-lg"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none">
                {[
                  { id: 'all', label: 'All Notices' },
                  { id: 'urgent', label: '🚨 Urgent' },
                  { id: 'announcement', label: '📢 News' },
                  { id: 'event', label: '📅 Events' },
                  { id: 'rules', label: '📜 Rules' },
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveTab(cat.id as any)}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg shrink-0 transition-all ${
                      activeTab === cat.id 
                        ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30' 
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="p-4 space-y-3 overflow-y-auto flex-1">
              {filteredNotices.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground space-y-2">
                  <Megaphone className="w-8 h-8 mx-auto opacity-30 text-amber-500" />
                  <p className="text-xs font-semibold">No announcements found in this category.</p>
                </div>
              ) : (
                filteredNotices.map((item) => {
                  const badgeInfo = categoryBadgeMap[item.category] || categoryBadgeMap.announcement;
                  const CategoryIcon = badgeInfo.icon;
                  return (
                    <div 
                      key={item.id} 
                      className={`p-4 rounded-xl border transition-all space-y-3 ${
                        item.isPinned 
                          ? 'bg-card border-amber-500/30 shadow-2xs' 
                          : 'bg-card border-border/70 hover:border-border'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {item.isPinned && (
                              <Badge className="bg-amber-500 text-white font-bold text-[10px] py-0 px-2 gap-1 rounded-md">
                                <Pin className="w-3 h-3 rotate-45" />
                                Pinned Top Banner
                              </Badge>
                            )}
                            <Badge variant="outline" className={`text-[10px] py-0 px-2 font-bold uppercase ${badgeInfo.color}`}>
                              <CategoryIcon className="w-3 h-3 mr-1 inline" />
                              {badgeInfo.label}
                            </Badge>
                            <span className="text-[11px] text-muted-foreground">
                              {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                            </span>
                          </div>

                          <h4 className="font-bold text-sm text-foreground pt-0.5">{item.title}</h4>
                        </div>

                        {/* Admin Action buttons */}
                        {isAdmin && (
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                onTogglePin(item.id);
                                toast.success(item.isPinned ? 'Unpinned from top banner' : 'Pinned to top banner');
                              }}
                              className={`h-7 px-2 text-xs gap-1 rounded-lg ${
                                item.isPinned ? 'text-amber-600 bg-amber-500/10' : 'text-muted-foreground hover:text-foreground'
                              }`}
                              title={item.isPinned ? "Unpin banner" : "Pin to banner"}
                            >
                              <Pin className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">{item.isPinned ? 'Pinned' : 'Pin'}</span>
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                onDeleteNotice(item.id);
                                toast.success('Notice deleted');
                              }}
                              className="h-7 px-2 text-xs text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-lg"
                              title="Delete notice"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-foreground/90 whitespace-pre-line leading-relaxed bg-muted/30 p-3 rounded-lg border border-border/40">
                        {item.content}
                      </p>

                      <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
                        <div className="flex items-center gap-1.5 font-medium">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Pinned by <strong className="text-foreground">{item.authorName}</strong> ({item.authorRole})</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => {
                              onAcknowledgeNotice(item.id);
                              toast.success('Acknowledged notice');
                            }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold hover:bg-emerald-500/20 transition-colors"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{item.acknowledgedCount || 1} Acknowledged</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        <DialogFooter className="p-3 border-t border-border bg-card flex justify-between items-center text-xs text-muted-foreground">
          <span>Center7 Peer Moderated Group Billboard</span>
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs rounded-xl">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
