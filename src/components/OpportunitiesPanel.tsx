import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { 
  Briefcase, GraduationCap, Calendar, MapPin, 
  ExternalLink, Plus, Search, Tag, Bookmark, Heart, Share2, 
  Sparkles, Check, Building2, Globe, Clock, Send, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useAuthStore } from '../store/authStore';

export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  category: 'Scholarship' | 'Internship' | 'Job' | 'Fellowship' | 'Hackathon';
  location: string;
  stipend?: string;
  deadline: string;
  applyUrl: string;
  description: string;
  tags: string[];
  postedBy: string;
  postedByAvatar?: string;
  createdAt: string;
  upvotes: number;
}

const INITIAL_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp-1',
    title: 'Google STEM Undergraduate Scholarship 2026',
    organization: 'Google Education',
    category: 'Scholarship',
    location: 'Global / Remote',
    stipend: '₵10,000 Annual Grant',
    deadline: '2026-10-15',
    applyUrl: 'https://buildyourfuture.withgoogle.com/scholarships',
    description: 'Annual merit scholarship awarded to computer science, software engineering, and STEM students with strong academic standing and leadership in student communities.',
    tags: ['Scholarship', 'STEM', 'ComputerScience', 'Global'],
    postedBy: 'Center7 Campus Relations',
    postedByAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=center7',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    upvotes: 64,
  },
  {
    id: 'opp-2',
    title: 'Summer 2026 Software Engineering & AI Intern',
    organization: 'TechVentures Labs',
    category: 'Internship',
    location: 'Hybrid / Campus Innovation Park',
    stipend: '₵3,500 / month + Mentorship',
    deadline: '2026-09-30',
    applyUrl: 'https://techventures.io/careers/interns-2026',
    description: '12-week paid internship working directly on distributed systems, AI agent workflows, and modern React/TypeScript frontends. Open to 2nd, 3rd, and 4th year students.',
    tags: ['Internship', 'SoftwareEngineering', 'AI', 'Paid'],
    postedBy: 'Alex Chen',
    postedByAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex.chen',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    upvotes: 42,
  },
  {
    id: 'opp-3',
    title: 'Student Open Source Fellowship & Micro-Grants',
    organization: 'Decentralized Campus Foundation',
    category: 'Fellowship',
    location: '100% Remote',
    stipend: '₵2,000 Project Stipend',
    deadline: '2026-11-01',
    applyUrl: 'https://github.com/campus-foundation/fellowship',
    description: 'Build open-source tools for student governance, decentralized voting, or campus resource sharing and receive developer grants and mentorship from senior engineers.',
    tags: ['Fellowship', 'OpenSource', 'Web3', 'Grant'],
    postedBy: 'David Okon',
    postedByAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david.o',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    upvotes: 89,
  },
  {
    id: 'opp-4',
    title: 'Junior Quantitative Analyst (Campus Graduate Track)',
    organization: 'Apex Capital Quantitative',
    category: 'Job',
    location: 'Financial Center / On-site',
    stipend: 'Full-time Competitive Salary + Bonus',
    deadline: '2026-10-01',
    applyUrl: 'https://apexcapital.com/campus',
    description: 'Full-time graduate entry role for graduating seniors in Math, Physics, Computer Science, or Economics. High-frequency algorithmic modeling and risk analysis.',
    tags: ['Job', 'FinTech', 'FullTime', 'Quantitative'],
    postedBy: 'Sarah Miller',
    postedByAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah.m',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    upvotes: 31,
  },
];

export function OpportunitiesPanel() {
  const { user, profile } = useAuthStore();
  
  const [opportunities, setOpportunities] = useState<Opportunity[]>(() => {
    try {
      const stored = localStorage.getItem('center7_opportunities');
      return stored ? JSON.parse(stored) : INITIAL_OPPORTUNITIES;
    } catch {
      return INITIAL_OPPORTUNITIES;
    }
  });

  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('center7_bookmarked_opps');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedOppForDetails, setSelectedOppForDetails] = useState<Opportunity | null>(null);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const oppId = params.get('opp');
      if (oppId) {
        const found = opportunities.find(o => o.id === oppId);
        if (found) {
          setSelectedOppForDetails(found);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [opportunities]);

  // Form states for sharing an opportunity
  const [title, setTitle] = useState('');
  const [organization, setOrganization] = useState('');
  const [category, setCategory] = useState<Opportunity['category']>('Scholarship');
  const [location, setLocation] = useState('');
  const [stipend, setStipend] = useState('');
  const [deadline, setDeadline] = useState('');
  const [applyUrl, setApplyUrl] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  // Vote state: oppId -> 'up' | 'down' | null
  const [oppVotes, setOppVotes] = useState<Record<string, 'up' | 'down' | null>>(() => {
    try {
      const stored = localStorage.getItem('center7_opp_votes');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const handleBookmark = (id: string) => {
    const updated = bookmarkedIds.includes(id)
      ? bookmarkedIds.filter((b) => b !== id)
      : [...bookmarkedIds, id];
    setBookmarkedIds(updated);
    localStorage.setItem('center7_bookmarked_opps', JSON.stringify(updated));
    toast.success(bookmarkedIds.includes(id) ? 'Removed from saved opportunities' : 'Saved to your opportunities list!');
  };

  const handleVote = (oppId: string, direction: 'up' | 'down') => {
    const currentVote = oppVotes[oppId] || null;
    const nextVote = currentVote === direction ? null : direction;
    const nextVotes = { ...oppVotes, [oppId]: nextVote };
    
    setOppVotes(nextVotes);
    localStorage.setItem('center7_opp_votes', JSON.stringify(nextVotes));

    setOpportunities((prev) => {
      const next = prev.map((opp) => {
        if (opp.id !== oppId) return opp;
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
        return { ...opp, upvotes: Math.max(0, opp.upvotes + delta) };
      });
      localStorage.setItem('center7_opportunities', JSON.stringify(next));
      return next;
    });
  };

  const handleUpvote = (id: string) => {
    handleVote(id, 'up');
  };

  const handleShareOpportunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !organization.trim() || !applyUrl.trim()) {
      toast.error('Please fill in the title, organization, and application link.');
      return;
    }

    const newOpp: Opportunity = {
      id: `opp-${Date.now()}`,
      title: title.trim(),
      organization: organization.trim(),
      category,
      location: location.trim() || 'Remote / Flexible',
      stipend: stipend.trim() || undefined,
      deadline: deadline || format(new Date(Date.now() + 86400000 * 30), 'yyyy-MM-dd'),
      applyUrl: applyUrl.trim().startsWith('http') ? applyUrl.trim() : `https://${applyUrl.trim()}`,
      description: description.trim() || 'No detailed description provided.',
      tags: tagsInput ? tagsInput.split(',').map((t) => t.trim().replace(/^#/, '')).filter(Boolean) : [category],
      postedBy: profile?.displayName || user?.email?.split('@')[0] || 'Campus Student',
      postedByAvatar: profile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid || 'student'}`,
      createdAt: new Date().toISOString(),
      upvotes: 1,
    };

    const updatedOpps = [newOpp, ...opportunities];
    setOpportunities(updatedOpps);
    localStorage.setItem('center7_opportunities', JSON.stringify(updatedOpps));

    // Reset form
    setTitle('');
    setOrganization('');
    setCategory('Scholarship');
    setLocation('');
    setStipend('');
    setDeadline('');
    setApplyUrl('');
    setDescription('');
    setTagsInput('');
    setIsShareModalOpen(false);

    toast.success('Opportunity posted successfully to campus network!');
  };

  const filteredOpps = opportunities.filter((opp) => {
    if (activeCategory !== 'All' && activeCategory !== 'Saved') {
      if (opp.category !== activeCategory) return false;
    }
    if (activeCategory === 'Saved' && !bookmarkedIds.includes(opp.id)) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = opp.title.toLowerCase().includes(q);
      const matchOrg = opp.organization.toLowerCase().includes(q);
      const matchDesc = opp.description.toLowerCase().includes(q);
      const matchTags = opp.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchOrg && !matchDesc && !matchTags) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900/40 border border-blue-500/30 backdrop-blur-md">
        <div>
          <h3 className="text-xl font-heading font-extrabold text-foreground flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-blue-400" />
            Opportunities Portal
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xl">
            Discover scholarships, paid internships, research grants, entry jobs, and student hackathons shared by peers and faculty.
          </p>
        </div>

        <Button
          onClick={() => setIsShareModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-2 rounded-xl shadow-md shadow-blue-600/20 shrink-0"
        >
          <Plus className="w-4 h-4" /> Share an Opportunity
        </Button>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {['All', 'Scholarship', 'Internship', 'Job', 'Fellowship', 'Saved'].map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {cat === 'Saved' ? `Saved (${bookmarkedIds.length})` : cat}
              </button>
            );
          })}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search internships, grants, companies..."
            className="pl-8 rounded-xl bg-card border-border text-xs h-8"
          />
        </div>
      </div>

      {/* Opportunities List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredOpps.length === 0 ? (
          <div className="col-span-full text-center py-12 border-dashed border-2 border-border rounded-2xl p-6">
            <Briefcase className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-40" />
            <h4 className="font-bold text-foreground text-sm">No opportunities found</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Try choosing a different category or click &quot;Share an Opportunity&quot; to add one!
            </p>
          </div>
        ) : (
          filteredOpps.map((opp) => {
            const isSaved = bookmarkedIds.includes(opp.id);
            return (
              <Card 
                key={opp.id} 
                className="bento-card hover:border-blue-500/50 hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer"
                onClick={() => setSelectedOppForDetails(opp)}
              >
                <CardHeader className="p-4 pb-2 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          opp.category === 'Scholarship' ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30' :
                          opp.category === 'Internship' ? 'bg-blue-500/15 text-blue-600 border-blue-500/30' :
                          opp.category === 'Fellowship' ? 'bg-purple-500/15 text-purple-600 border-purple-500/30' :
                          'bg-amber-500/15 text-amber-600 border-amber-500/30'
                        }`}>
                          {opp.category}
                        </Badge>
                        <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-blue-500" /> {opp.organization}
                        </span>
                      </div>

                      <h4 className="text-base font-bold font-heading text-foreground leading-snug">
                        {opp.title}
                      </h4>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookmark(opp.id);
                      }}
                      className={`h-8 w-8 rounded-lg shrink-0 ${isSaved ? 'text-amber-500 fill-amber-500/20' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500' : ''}`} />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="px-4 py-2 space-y-3 flex-1 text-xs">
                  <p className="text-muted-foreground leading-relaxed line-clamp-3">
                    {opp.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-border/50 text-foreground/80 font-medium">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                      <span className="truncate">{opp.location}</span>
                    </div>

                    {opp.stipend && (
                      <div className="flex items-center gap-1.5 truncate text-emerald-600 dark:text-emerald-400 font-bold">
                      <span className="font-bold shrink-0">₵</span>
                      <span className="truncate">{opp.stipend}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 truncate text-amber-600 dark:text-amber-400">
                      <Calendar className="w-3 h-3 shrink-0" />
                      <span>Deadline: {format(new Date(opp.deadline || Date.now()), 'MMM d, yyyy')}</span>
                    </div>

                    <div className="flex items-center gap-1.5 truncate text-muted-foreground">
                      <Clock className="w-3 h-3 shrink-0" />
                      <span>Posted by {opp.postedBy}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {opp.tags.map((t) => (
                      <span key={t} className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                        #{t}
                      </span>
                    ))}
                  </div>
                </CardContent>

                <div className="px-4 py-3 border-t border-border/50 bg-muted/20 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border border-border/50">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVote(opp.id, 'up');
                      }}
                      className={`h-7 px-2.5 rounded-md gap-1.5 transition-all font-semibold text-xs ${
                        oppVotes[opp.id] === 'up'
                          ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 font-bold'
                          : 'hover:text-emerald-600 text-muted-foreground'
                      }`}
                      title="Upvote opportunity"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{opp.upvotes}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVote(opp.id, 'down');
                      }}
                      className={`h-7 px-2.5 rounded-md gap-1 transition-all font-semibold text-xs ${
                        oppVotes[opp.id] === 'down'
                          ? 'text-rose-600 dark:text-rose-400 bg-rose-500/15 font-bold'
                          : 'hover:text-rose-600 text-muted-foreground'
                      }`}
                      title="Downvote opportunity"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOppForDetails(opp);
                      }}
                      className="text-xs h-8 border-blue-500/30 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-500/10 rounded-xl px-3"
                    >
                      View Details
                    </Button>
                    <a
                      href={opp.applyUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-xs"
                    >
                      Apply Now <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Share Opportunity Modal */}
      <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto p-6 rounded-2xl border-border bg-card">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-xl font-bold font-heading flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-500" /> Post a Student Opportunity
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Share scholarships, internship roles, research grants, or jobs with the Center7 community.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleShareOpportunity} className="space-y-4 pt-3 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Opportunity Title *</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 2026 Undergraduate Research Grant"
                required
                className="rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Organization / Company *</label>
                <Input
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="e.g. Google, FinTech Club, Faculty"
                  required
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full h-9 rounded-xl border border-border bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Scholarship">Scholarship</option>
                  <option value="Internship">Internship</option>
                  <option value="Job">Job</option>
                  <option value="Fellowship">Fellowship</option>
                  <option value="Hackathon">Hackathon</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Location / Type</label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Remote, On-campus, London"
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Stipend / Award Amount</label>
                <Input
                  value={stipend}
                  onChange={(e) => setStipend(e.target.value)}
                  placeholder="e.g. ₵5,000 / ₵25/hr / Fully Funded"
                  className="rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Application Deadline</label>
                <Input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Application Link / URL *</label>
                <Input
                  value={applyUrl}
                  onChange={(e) => setApplyUrl(e.target.value)}
                  placeholder="https://..."
                  required
                  className="rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">Description & Eligibility</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain requirements, eligibility, key dates, and how students can apply..."
                className="w-full p-3 rounded-xl border border-border bg-card text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">Tags (comma separated)</label>
              <Input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. STEM, Paid, ComputerScience, Research"
                className="rounded-xl text-xs"
              />
            </div>

            <DialogFooter className="pt-2 border-t border-border/60 flex items-center justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsShareModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-1.5 rounded-xl">
                <Send className="w-3.5 h-3.5" /> Publish Opportunity
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Opportunity Details Dialog */}
      <Dialog open={selectedOppForDetails !== null} onOpenChange={(open) => { if (!open) setSelectedOppForDetails(null); }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl border-border bg-card">
          {selectedOppForDetails && (
            <div className="space-y-6 text-sm">
              <DialogHeader className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    selectedOppForDetails.category === 'Scholarship' ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30' :
                    selectedOppForDetails.category === 'Internship' ? 'bg-blue-500/15 text-blue-600 border-blue-500/30' :
                    selectedOppForDetails.category === 'Fellowship' ? 'bg-purple-500/15 text-purple-600 border-purple-500/30' :
                    'bg-amber-500/15 text-amber-600 border-amber-500/30'
                  }`}>
                    {selectedOppForDetails.category}
                  </Badge>
                  <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-blue-500" /> {selectedOppForDetails.organization}
                  </span>
                </div>
                <DialogTitle className="text-xl sm:text-2xl font-extrabold font-heading text-foreground tracking-tight leading-snug">
                  {selectedOppForDetails.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground flex items-center gap-1 flex-wrap pt-0.5">
                  Posted {format(new Date(selectedOppForDetails.createdAt || Date.now()), 'MMMM d, yyyy')} by {selectedOppForDetails.postedBy}
                </DialogDescription>
              </DialogHeader>

              {/* Specs Table / Meta Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-muted/40 rounded-xl border border-border/50 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Location / Type</span>
                  <div className="flex items-center gap-1.5 font-semibold text-foreground">
                    <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>{selectedOppForDetails.location}</span>
                  </div>
                </div>

                {selectedOppForDetails.stipend && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Compensation / Award</span>
                    <div className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                      <span className="font-bold shrink-0">₵</span>
                      <span>{selectedOppForDetails.stipend}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Application Deadline</span>
                  <div className="flex items-center gap-1.5 font-semibold text-amber-600 dark:text-amber-400">
                    <Calendar className="w-4 h-4 shrink-0" />
                    <span>{format(new Date(selectedOppForDetails.deadline || Date.now()), 'MMMM d, yyyy')}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Social Verification</span>
                  <div className="flex items-center gap-1.5 font-semibold text-foreground">
                    <ThumbsUp className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{selectedOppForDetails.upvotes} Peers upvoted this</span>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Opportunity Description & Eligibility</h4>
                <div className="bg-card p-4 rounded-xl border border-border/50 shadow-xs">
                  <p className="text-muted-foreground text-xs leading-relaxed whitespace-pre-wrap">
                    {selectedOppForDetails.description}
                  </p>
                </div>
              </div>

              {/* Tags list */}
              {selectedOppForDetails.tags && selectedOppForDetails.tags.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Indexed Tags</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedOppForDetails.tags.map((tag) => (
                      <span key={tag} className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/10">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-border/60">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleBookmark(selectedOppForDetails.id);
                    }}
                    className={`text-xs h-9 px-4 rounded-xl font-bold gap-1.5 ${
                      bookmarkedIds.includes(selectedOppForDetails.id) 
                        ? 'text-amber-500 border-amber-500/20 bg-amber-500/5' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${bookmarkedIds.includes(selectedOppForDetails.id) ? 'fill-amber-500' : ''}`} />
                    {bookmarkedIds.includes(selectedOppForDetails.id) ? 'Saved' : 'Save'}
                  </Button>

                  <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-xl border border-border/50">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        handleVote(selectedOppForDetails.id, 'up');
                      }}
                      className={`h-8 px-3 rounded-lg gap-1.5 transition-all font-bold text-xs ${
                        oppVotes[selectedOppForDetails.id] === 'up'
                          ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 font-extrabold'
                          : 'hover:text-emerald-600 text-muted-foreground'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{selectedOppForDetails.upvotes}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        handleVote(selectedOppForDetails.id, 'down');
                      }}
                      className={`h-8 px-3 rounded-lg gap-1 transition-all font-bold text-xs ${
                        oppVotes[selectedOppForDetails.id] === 'down'
                          ? 'text-rose-600 dark:text-rose-400 bg-rose-500/15 font-extrabold'
                          : 'hover:text-rose-600 text-muted-foreground'
                      }`}
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      try {
                        const url = `${window.location.origin}/opportunities?opp=${selectedOppForDetails.id}`;
                        navigator.clipboard.writeText(url);
                        toast.success('Opportunity link copied to clipboard!');
                      } catch {
                        toast.success('Ready to share this opportunity!');
                      }
                    }}
                    className="text-xs h-9 px-3 rounded-xl text-muted-foreground hover:text-foreground"
                    title="Copy shareable link"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setSelectedOppForDetails(null)}
                    className="text-xs h-9 rounded-xl"
                  >
                    Close
                  </Button>
                  <a
                    href={selectedOppForDetails.applyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-md shadow-blue-600/10"
                  >
                    Apply Now <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
