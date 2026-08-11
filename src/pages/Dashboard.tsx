import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api/client';
import { useAuthStore } from '../store/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { 
  Shield, Star, Users, ArrowRight, Zap, Trophy, LogIn, BookOpen, 
  FileText, Download, Scale, ShoppingBag, CheckCircle2, Tag, 
  Sparkles, Clock, Gavel, ExternalLink, Flame, MessageSquare, ThumbsUp, ThumbsDown, UserCheck
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';

export function Dashboard() {
  const { profile, user, openAuthModal } = useAuthStore();
  const navigate = useNavigate();

  const [selectedResource, setSelectedResource] = useState<any | null>(null);
  const [selectedClub, setSelectedClub] = useState<any | null>(null);
  const [selectedQuest, setSelectedQuest] = useState<any | null>(null);
  const [selectedGov, setSelectedGov] = useState<any | null>(null);
  const [selectedMarketItem, setSelectedMarketItem] = useState<any | null>(null);

  const connectedCount = React.useMemo(() => {
    try {
      const friends = JSON.parse(localStorage.getItem('center7_connected_friends') || '[]');
      return Array.isArray(friends) ? friends.length : 2;
    } catch {
      return 2;
    }
  }, []);

  // Query user communities
  const { data: communitiesData, isLoading: isCommunitiesLoading } = useQuery({
    queryKey: ['my-communities'],
    queryFn: async () => {
      const res = await apiClient.get('/communities');
      return res.data;
    },
  });

  const communityList: any[] = Array.isArray(communitiesData) 
    ? communitiesData 
    : (communitiesData?.data && Array.isArray(communitiesData.data) ? communitiesData.data : []);

  // Query latest governance cases
  const { data: governanceData } = useQuery({
    queryKey: ['governance-resolved-cases-dashboard'],
    queryFn: async () => {
      const res = await apiClient.get('/governance/cases/resolved');
      return res.data;
    },
  });

  const governanceCases: any[] = Array.isArray(governanceData)
    ? governanceData
    : (governanceData?.data && Array.isArray(governanceData.data) ? governanceData.data : []);

  // Mock static showcase items for resources & marketplace if backend lists are empty
  const mockResources = [
    {
      id: 'res-1',
      title: 'CS201 Data Structures & Algorithms - Midterm Past Solutions (2025)',
      type: 'PDF',
      size: '2.4 MB',
      downloads: 142,
      category: 'Computer Science',
      verified: true,
      time: '2 hours ago',
    },
    {
      id: 'res-2',
      title: 'PHY102 Electromagnetism - Formula Sheet & Comprehensive Notes',
      type: 'PDF',
      size: '5.1 MB',
      downloads: 89,
      category: 'Physics & Engineering',
      verified: true,
      time: '5 hours ago',
    },
    {
      id: 'res-3',
      title: 'BUS301 Financial Accounting - Case Study Summaries & Practice Problems',
      type: 'PDF',
      size: '1.8 MB',
      downloads: 210,
      category: 'Business School',
      verified: true,
      time: '1 day ago',
    },
  ];

  const mockRecommendedClubs = [
    {
      id: 'club-1',
      name: 'Computer Science & AI Society',
      description: 'Hub for coding competitions, AI research papers, and open-source projects.',
      members: 342,
      category: 'Academic & Tech',
      iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      id: 'club-2',
      name: 'Campus Developers Network',
      description: 'Collaborative development studio building real student software and tools.',
      members: 218,
      category: 'Engineering',
      iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    },
    {
      id: 'club-3',
      name: 'FinTech & Quant Trading Guild',
      description: 'Exploring quantitative finance, algorithmic trading, and decentralized economics.',
      members: 165,
      category: 'Finance & Math',
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
  ];

  const mockActiveQuests = [
    {
      id: 'quest-1',
      title: 'Peer Study Helper',
      description: 'Answer 5 student questions in community study channels',
      progress: 3,
      total: 5,
      reward: '+25 Reputation',
    },
    {
      id: 'quest-2',
      title: 'Resource Contributor',
      description: 'Upload 1 verified lecture note or past exam paper',
      progress: 0,
      total: 1,
      reward: '+50 Reputation',
    },
    {
      id: 'quest-3',
      title: 'Civic Reviewer',
      description: 'Participate in 2 active governance or community votes',
      progress: 1,
      total: 2,
      reward: '+15 Reputation',
    },
  ];

  const mockGovernance = [
    {
      id: 'gov-1',
      title: 'Proposal #14: Extend Main Library Hours to 24/7 During Finals Week',
      status: 'Active Vote',
      statusColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      votes: '412 Votes • 88% Approval',
      time: 'Ends in 2 days',
    },
    {
      id: 'gov-2',
      title: 'Case #82: Plagiarism Dispute in CS101 Assignment Repository',
      status: 'Under Review',
      statusColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
      votes: '7 Reviewers Assigned',
      time: 'In Deliberation',
    },
    {
      id: 'gov-3',
      title: 'Proposal #12: Establish Student Hardware Repair & Recycling Cooperative',
      status: 'Passed',
      statusColor: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
      votes: '520 Votes • 92% Approval',
      time: 'Implemented',
    },
  ];

  const mockMarketplace = [
    {
      id: 'mkt-1',
      title: 'Calculus: Early Transcendentals (9th Edition)',
      price: '₵45',
      condition: 'Like New',
      category: 'Textbooks',
      seller: 'Alex K.',
      reputation: '120 Rep',
    },
    {
      id: 'mkt-2',
      title: 'CASIO FX-991EX ClassWiz Scientific Calculator',
      price: '₵20',
      condition: 'Excellent',
      category: 'Electronics',
      seller: 'Sarah M.',
      reputation: '145 Rep',
    },
    {
      id: 'mkt-3',
      title: 'Ergonomic Desk LED Lamp with Wireless Charger',
      price: '₵15',
      condition: 'Brand New',
      category: 'Hostel Gear',
      seller: 'David O.',
      reputation: '98 Rep',
    },
  ];

  const userIsInClub = communityList.length > 0;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-safe">
      
      {/* 1. WELCOME AND INTRO CARD */}
      {!user ? (
        <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-blue-900/90 via-blue-800/80 to-slate-900 text-white shadow-xl border border-blue-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <h1 className="text-2xl md:text-3xl font-heading font-extrabold tracking-tight text-white">
              Welcome to Center7
            </h1>
            <p className="text-blue-100/80 text-sm leading-relaxed">
              A self-governed student platform without administrators. Moderation, verify resources, join study clubs, and participate in peer-based jury voting.
            </p>
          </div>
          <Button 
            onClick={openAuthModal}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold h-11 px-6 shadow-lg shadow-blue-600/30 text-sm shrink-0 gap-2 rounded-xl"
          >
            <LogIn className="w-4 h-4" /> Sign In / Demo Mode
          </Button>
        </div>
      ) : (
        <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-950 text-white shadow-xl border border-blue-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <h1 className="text-2xl md:text-3xl font-heading font-extrabold tracking-tight text-white">
              Welcome back, {profile?.displayName || user?.email?.split('@')[0] || 'Student'}!
            </h1>
            <p className="text-blue-100/80 text-sm leading-relaxed">
              You are currently at Trust Level {profile?.trustLevel || 1} with {profile?.reputation?.points ?? profile?.reputationScore ?? 100} Reputation Points. Check out active community votes, new resources, and daily quests.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              onClick={() => navigate('/communities')}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold h-10 px-5 shadow-md shadow-blue-600/30 text-xs rounded-xl"
            >
              Explore Communities
            </Button>
          </div>
        </div>
      )}

      {/* Stats Quick Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="bento-card p-3 sm:p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
            <CardTitle className="text-xs sm:text-sm font-medium">Reputation Score</CardTitle>
            <Star className="h-4 w-4 text-amber-500 shrink-0 ml-1" />
          </CardHeader>
          <CardContent className="p-0 pt-2 sm:pt-4">
            <div className="text-xl sm:text-2xl font-bold">{profile?.reputation?.points ?? profile?.reputationScore ?? 100}</div>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 line-clamp-1">
              Community Trust Rating
            </p>
          </CardContent>
        </Card>
        
        <Card className="bento-card p-3 sm:p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
            <CardTitle className="text-xs sm:text-sm font-medium">Trust Level</CardTitle>
            <Shield className="h-4 w-4 text-blue-500 shrink-0 ml-1" />
          </CardHeader>
          <CardContent className="p-0 pt-2 sm:pt-4">
            <div className="text-xl sm:text-2xl font-bold">Level {profile?.trustLevel || 1}</div>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 line-clamp-1">
              {profile?.trustLevel >= 2 ? 'Jury Duty Eligible' : 'Level up by participating'}
            </p>
          </CardContent>
        </Card>

        <Card className="bento-card p-3 sm:p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
            <CardTitle className="text-xs sm:text-sm font-medium">Joined Communities</CardTitle>
            <Users className="h-4 w-4 text-primary shrink-0 ml-1" />
          </CardHeader>
          <CardContent className="p-0 pt-2 sm:pt-4">
            <div className="text-xl sm:text-2xl font-bold">{communityList.length}</div>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">Active Memberships</p>
          </CardContent>
        </Card>
        

      </div>


      {/* 2. LATEST RESOURCES SECTION */}
      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-2">
          <div>
            <CardTitle className="text-xl font-bold font-heading flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Latest Study Resources
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm mt-0.5">
              Recently uploaded lecture notes, past exam papers, and verified study guides.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockResources.map((res) => (
            <div 
              key={res.id} 
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl border border-border/70 hover:bg-muted/40 transition-colors gap-3 cursor-pointer"
              onClick={() => setSelectedResource(res)}
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-sm text-foreground hover:text-blue-600 transition-colors">
                      {res.title}
                    </h4>
                    {res.verified && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-3 flex-wrap">
                    <span>{res.category}</span>
                    <span>•</span>
                    <span>{res.type} ({res.size})</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Download className="w-3 h-3" /> {res.downloads} downloads
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-3 h-3" /> {res.time}
                    </span>
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedResource(res);
                }}
                className="text-xs gap-1.5 shrink-0 self-start sm:self-center"
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-600" /> View Details
              </Button>
            </div>
          ))}
        </CardContent>
        <CardFooter className="pt-2 pb-5 flex justify-center border-t border-border/50">
          <Button 
            onClick={() => navigate('/resources')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md shadow-blue-600/20 text-xs sm:text-sm gap-2 transition-all"
          >
            Show More <ArrowRight className="w-4 h-4" />
          </Button>
        </CardFooter>
      </Card>


      {/* 3. CLUB RECOMMENDATION OR ACTIVE QUESTS */}
      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-2">
          <div>
            <CardTitle className="text-xl font-bold font-heading flex items-center gap-2">
              {userIsInClub ? (
                <>
                  <Trophy className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  Active Community Quests
                </>
              ) : (
                <>
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Recommended Clubs & Communities
                </>
              )}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm mt-0.5">
              {userIsInClub 
                ? 'Complete active community tasks to earn reputation points and unlock jury duty eligibility.' 
                : 'Discover and join decentralized student clubs tailored to your academic interests.'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {userIsInClub ? (
            /* Active Quests */
            mockActiveQuests.map((quest) => (
              <div 
                key={quest.id}
                className="p-4 rounded-2xl border border-border/70 hover:bg-muted/40 transition-colors space-y-2.5 cursor-pointer"
                onClick={() => setSelectedQuest(quest)}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                      <Flame className="w-4 h-4" />
                    </div>
                    <h4 className="font-semibold text-sm text-foreground">{quest.title}</h4>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                    {quest.reward}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{quest.description}</p>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
                    <span>Progress</span>
                    <span>{quest.progress} / {quest.total} Completed</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${(quest.progress / quest.total) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            /* Club Recommendations */
            mockRecommendedClubs.map((club) => (
              <div 
                key={club.id} 
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-border/70 hover:bg-muted/40 transition-colors gap-3 cursor-pointer"
                onClick={() => setSelectedClub(club)}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-3 rounded-2xl ${club.iconBg} shrink-0 mt-0.5`}>
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-sm text-foreground">{club.name}</h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                        {club.category}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{club.description}</p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1 pt-0.5">
                      <Users className="w-3 h-3" /> {club.members} active student members
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedClub(club);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs gap-1.5 shrink-0 self-start sm:self-center rounded-xl"
                >
                  View Details
                </Button>
              </div>
            ))
          )}
        </CardContent>
        <CardFooter className="pt-2 pb-5 flex justify-center border-t border-border/50">
          <Button 
            onClick={() => navigate('/communities')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md shadow-blue-600/20 text-xs sm:text-sm gap-2 transition-all"
          >
            Show More <ArrowRight className="w-4 h-4" />
          </Button>
        </CardFooter>
      </Card>


      {/* 4. LATEST GOVERNANCE SECTION */}
      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-2">
          <div>
            <CardTitle className="text-xl font-bold font-heading flex items-center gap-2">
              <Scale className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Latest Governance & Jury Decisions
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm mt-0.5">
              Transparent community proposals, policy votes, and peer jury moderation logs.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockGovernance.map((gov) => (
            <div 
              key={gov.id} 
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-border/70 hover:bg-muted/40 transition-colors gap-3 cursor-pointer"
              onClick={() => setSelectedGov(gov)}
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                  <Gavel className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-sm text-foreground">{gov.title}</h4>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${gov.statusColor}`}>
                      {gov.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-3">
                    <span>{gov.votes}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {gov.time}
                    </span>
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedGov(gov);
                }}
                className="text-xs gap-1.5 shrink-0 self-start sm:self-center"
              >
                Inspect Vote
              </Button>
            </div>
          ))}
        </CardContent>
        <CardFooter className="pt-2 pb-5 flex justify-center border-t border-border/50">
          <Button 
            onClick={() => navigate('/governance')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md shadow-blue-600/20 text-xs sm:text-sm gap-2 transition-all"
          >
            Show More <ArrowRight className="w-4 h-4" />
          </Button>
        </CardFooter>
      </Card>


      {/* 5. LATEST MARKET PRODUCTS SECTION */}
      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-2">
          <div>
            <CardTitle className="text-xl font-bold font-heading flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Latest Campus Marketplace Products
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm mt-0.5">
              Peer-to-peer textbook trades, electronics, and verified student hardware.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockMarketplace.map((item) => (
            <div 
              key={item.id} 
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-border/70 hover:bg-muted/40 transition-colors gap-3 cursor-pointer"
              onClick={() => setSelectedMarketItem(item)}
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                  <Tag className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-sm text-foreground">{item.title}</h4>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-500/10">
                      {item.price}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-3 flex-wrap">
                    <span>{item.category}</span>
                    <span>•</span>
                    <span>Condition: {item.condition}</span>
                    <span>•</span>
                    <span>Seller: {item.seller} ({item.reputation})</span>
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMarketItem(item);
                }}
                className="text-xs gap-1.5 shrink-0 self-start sm:self-center"
              >
                View Listing
              </Button>
            </div>
          ))}
        </CardContent>
        <CardFooter className="pt-2 pb-5 flex justify-center border-t border-border/50">
          <Button 
            onClick={() => navigate('/marketplace')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md shadow-blue-600/20 text-xs sm:text-sm gap-2 transition-all"
          >
            Show More <ArrowRight className="w-4 h-4" />
          </Button>
        </CardFooter>
      </Card>

      {/* Study Resource Details Dialog */}
      <Dialog open={selectedResource !== null} onOpenChange={(open) => { if (!open) setSelectedResource(null); }}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl border-border bg-card">
          {selectedResource && (
            <div className="space-y-6 text-sm">
              <DialogHeader className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                    {selectedResource.category}
                  </span>
                  {selectedResource.verified && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                    </span>
                  )}
                </div>
                <DialogTitle className="text-xl font-extrabold font-heading text-foreground tracking-tight leading-snug">
                  {selectedResource.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Published {selectedResource.time} • Highly referenced student document
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-3 p-4 bg-muted/40 rounded-xl border border-border/50 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Document Type</span>
                  <span className="font-semibold text-foreground">{selectedResource.type}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">File Size</span>
                  <span className="font-semibold text-foreground">{selectedResource.size}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Downloads</span>
                  <span className="font-semibold text-foreground">{selectedResource.downloads} student downloads</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Course Affiliation</span>
                  <span className="font-semibold text-foreground">General Academics</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Document Description</h4>
                <div className="bg-card p-4 rounded-xl border border-border/50">
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    This document was shared by a fellow student to assist with revision, coursework, and prep. All uploads are student-verified for authenticity. Always refer to your professor's syllabus for specific requirements.
                  </p>
                </div>
              </div>

              <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border/60">
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedResource(null)}
                  className="text-xs h-9 rounded-xl w-full sm:w-auto"
                >
                  Close
                </Button>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    onClick={() => {
                      toast.success(`Downloading ${selectedResource.title}...`);
                      setSelectedResource(null);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9 px-4 rounded-xl w-full sm:w-auto flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/10"
                  >
                    <Download className="w-4 h-4" /> Download Now
                  </Button>
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Decentralized Club Details Dialog */}
      <Dialog open={selectedClub !== null} onOpenChange={(open) => { if (!open) setSelectedClub(null); }}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl border-border bg-card">
          {selectedClub && (
            <div className="space-y-6 text-sm">
              <DialogHeader className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 self-start">
                  {selectedClub.category}
                </span>
                <DialogTitle className="text-xl font-extrabold font-heading text-foreground tracking-tight leading-snug">
                  {selectedClub.name}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Decentralized student-led workspace & discussion club
                </DialogDescription>
              </DialogHeader>

              <div className="p-4 bg-muted/40 rounded-xl border border-border/50 text-xs flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Active Members</span>
                  <span className="text-base font-extrabold text-foreground">{selectedClub.members} Peers</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Governance Status</span>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Self-Governed</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Mission & Description</h4>
                <div className="bg-card p-4 rounded-xl border border-border/50">
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {selectedClub.description} Participate in discussion channels, attend student-organized virtual voice workshops, share notes, and collaborate without traditional campus administrative barriers.
                  </p>
                </div>
              </div>

              <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border/60">
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedClub(null)}
                  className="text-xs h-9 rounded-xl w-full sm:w-auto"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    toast.success(`Successfully registered interest to join ${selectedClub.name}!`);
                    setSelectedClub(null);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9 px-5 rounded-xl w-full sm:w-auto shadow-md shadow-blue-600/10"
                >
                  Join Community
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Active Quest Details Dialog */}
      <Dialog open={selectedQuest !== null} onOpenChange={(open) => { if (!open) setSelectedQuest(null); }}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-6 rounded-2xl border-border bg-card">
          {selectedQuest && (
            <div className="space-y-5 text-sm">
              <DialogHeader className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 self-start">
                  Community Quest
                </span>
                <DialogTitle className="text-lg font-bold font-heading text-foreground tracking-tight">
                  {selectedQuest.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-purple-600 dark:text-purple-400 font-semibold">
                  Reward: {selectedQuest.reward}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 bg-muted/40 p-4 rounded-xl border border-border/50 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Goal Description</span>
                  <p className="text-foreground font-medium mt-0.5">{selectedQuest.description}</p>
                </div>
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground">
                    <span>Task Progress</span>
                    <span>{selectedQuest.progress} / {selectedQuest.total} Completed</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 border border-border/20">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${(selectedQuest.progress / selectedQuest.total) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 p-3 flex rounded-xl text-xs border border-blue-100 dark:border-blue-900/35">
                <Sparkles className="w-4 h-4 mr-2 shrink-0 text-blue-500 mt-0.5" />
                <p>Completing Quests is the primary way to earn high-tier community badges, increase your Trust Level, and unlock Jury duty.</p>
              </div>

              <DialogFooter className="pt-2 border-t border-border/60">
                <Button 
                  onClick={() => setSelectedQuest(null)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9 rounded-xl"
                >
                  Got it, thank you!
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Governance Proposal / Jury Decision Details Dialog */}
      <Dialog open={selectedGov !== null} onOpenChange={(open) => { if (!open) setSelectedGov(null); }}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl border-border bg-card">
          {selectedGov && (
            <div className="space-y-6 text-sm">
              <DialogHeader className="space-y-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border self-start ${selectedGov.statusColor}`}>
                  {selectedGov.status}
                </span>
                <DialogTitle className="text-lg font-extrabold font-heading text-foreground tracking-tight leading-snug">
                  {selectedGov.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Status: {selectedGov.votes}
                </DialogDescription>
              </DialogHeader>

              <div className="p-4 bg-muted/40 rounded-xl border border-border/50 text-xs space-y-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">About this Case</span>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Center7 functions entirely on direct user governance. In case of reports or disputes, all community members vote equally (1 vote per user) over a 7-day period. Majority vote determines the outcome. No individual admin holds moderation authority over users, channels, or materials.
                </p>
              </div>

              <div className="space-y-3 bg-card p-4 rounded-xl border border-border/50 text-xs">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active Deliberations</h4>
                <div className="space-y-2 text-muted-foreground leading-relaxed">
                  <p>• Summoned trusted peer reviewers are reviewing evidence logs, timestamps, and community guidelines.</p>
                  <p>• Appeals can be filed within 72 hours of decision publication, prompting a second blind review.</p>
                </div>
              </div>

              <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border/60">
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedGov(null)}
                  className="text-xs h-9 rounded-xl w-full sm:w-auto"
                >
                  Close
                </Button>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    onClick={() => {
                      toast.success('Deliberations and audit trails are fully transparent. Redirecting...');
                      setSelectedGov(null);
                      navigate('/governance');
                    }}
                    className="text-xs h-9 px-4 rounded-xl w-full sm:w-auto gap-1"
                  >
                    Go to Governance Room <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Market Listing Details Dialog */}
      <Dialog open={selectedMarketItem !== null} onOpenChange={(open) => { if (!open) setSelectedMarketItem(null); }}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl border-border bg-card">
          {selectedMarketItem && (
            <div className="space-y-6 text-sm">
              <DialogHeader className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    {selectedMarketItem.category}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-md bg-emerald-500/10">
                    {selectedMarketItem.price}
                  </span>
                </div>
                <DialogTitle className="text-xl font-extrabold font-heading text-foreground tracking-tight leading-snug">
                  {selectedMarketItem.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Condition: <span className="font-semibold text-foreground">{selectedMarketItem.condition}</span>
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-3 p-4 bg-muted/40 rounded-xl border border-border/50 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Seller</span>
                  <span className="font-semibold text-foreground">{selectedMarketItem.seller}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Seller Reputation</span>
                  <span className="font-semibold text-foreground text-amber-500">{selectedMarketItem.reputation}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Verification Level</span>
                  <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Student Verification Match OK
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Item Details & Description</h4>
                <div className="bg-card p-4 rounded-xl border border-border/50">
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    This item is listed for trade or sale directly on the student campus marketplace. No external escrow fees. Transaction is conducted peer-to-peer in campus common areas or libraries. Meet safely!
                  </p>
                </div>
              </div>

              <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border/60">
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedMarketItem(null)}
                  className="text-xs h-9 rounded-xl w-full sm:w-auto"
                >
                  Close
                </Button>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    onClick={() => {
                      toast.success(`Opening private, decentralized chat with seller ${selectedMarketItem.seller}...`);
                      setSelectedMarketItem(null);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9 px-4 rounded-xl w-full sm:w-auto flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/10"
                  >
                    <MessageSquare className="w-4 h-4" /> Message Seller
                  </Button>
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
