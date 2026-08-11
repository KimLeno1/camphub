import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Shield, Scale, AlertTriangle, Loader2, Gavel, 
  CheckCircle2, XCircle, Clock, Link as LinkIcon, FileText, 
  MessageSquare, User, HelpCircle, Info, Filter, Search,
  Vote, FilePlus, History, BookOpen, ChevronRight, AlertCircle,
  ExternalLink, BarChart2, ShieldAlert, RefreshCw, Check, UserCheck, UserX, HeartHandshake,
  ChevronDown
} from 'lucide-react';
import { format, formatDistanceToNow, differenceInDays, differenceInHours } from 'date-fns';
import { toast } from 'sonner';
import { useAuthStore } from '../store/authStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';

export function Governance() {
  const queryClient = useQueryClient();
  const { user, openAuthModal } = useAuthStore();
  const location = useLocation();
  
  // Primary Navigation
  const [activeTab, setActiveTab] = useState('open-votes');
  
  // Log Filters
  const [logSearch, setLogSearch] = useState('');
  const [logFilter, setLogFilter] = useState<'all' | 'message' | 'user' | 'resource' | 'appealed'>('all');

  // Report Form States
  const [reportType, setReportType] = useState<'message' | 'user' | 'resource'>('message');
  const [reportTargetId, setReportTargetId] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [reportEvidenceUrl, setReportEvidenceUrl] = useState('');
  const [reportEvidenceDesc, setReportEvidenceDesc] = useState('');

  // Handle location state prefilling
  useEffect(() => {
    if (location.state && (location.state as any).reportType) {
      setReportType((location.state as any).reportType);
      if ((location.state as any).targetId) {
        setReportTargetId((location.state as any).targetId);
      }
      setActiveTab('report');
    }
  }, [location.state]);
  
  // Active Selected Case for Voting Drawer/Modal
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [voteDecision, setVoteDecision] = useState<'action' | 'no_action' | 'abstain'>('action');
  const [voteJustification, setVoteJustification] = useState('');
  
  // Appeal Form States
  const [appealCaseId, setAppealCaseId] = useState<string | null>(null);
  const [appealReasonText, setAppealReasonText] = useState('');

  // Reinstatement Petition States
  const [selectedBannedUser, setSelectedBannedUser] = useState<any>(null);
  const [reinstatementReason, setReinstatementReason] = useState('');

  // Queries
  const { data: openCasesRaw, isLoading: isOpenCasesLoading, refetch: refetchOpenCases } = useQuery({
    queryKey: ['governance-jury-duties'],
    queryFn: async () => {
      const res = await apiClient.get('/governance/cases/jury-duty');
      return res.data;
    },
    refetchInterval: 5000,
  });

  const { data: bannedUsersRaw, isLoading: isBannedLoading, refetch: refetchBannedUsers } = useQuery({
    queryKey: ['governance-banned-users'],
    queryFn: async () => {
      const res = await apiClient.get('/governance/banned-users');
      return res.data;
    },
    refetchInterval: 5000,
  });

  const { data: resolvedCasesRaw, isLoading: isLogsLoading, refetch: refetchLogs } = useQuery({
    queryKey: ['governance-resolved-cases'],
    queryFn: async () => {
      const res = await apiClient.get('/governance/cases/resolved');
      return res.data;
    },
    refetchInterval: 5000,
  });

  const { data: myCasesRaw, isLoading: isMyCasesLoading, refetch: refetchMyCases } = useQuery({
    queryKey: ['governance-my-cases'],
    queryFn: async () => {
      const res = await apiClient.get('/governance/cases/my-cases');
      return res.data;
    },
    enabled: !!user,
    refetchInterval: 5000,
  });

  // Selected case full details
  const { data: activeCaseDetails, isLoading: isDetailsLoading } = useQuery({
    queryKey: ['governance-case-details', selectedCase?.id],
    queryFn: async () => {
      if (!selectedCase?.id) return null;
      const res = await apiClient.get(`/governance/cases/${selectedCase.id}`);
      return res.data;
    },
    enabled: !!selectedCase?.id,
  });

  const openCases: any[] = Array.isArray(openCasesRaw)
    ? openCasesRaw
    : (Array.isArray(openCasesRaw?.data) ? openCasesRaw.data : []);

  const resolvedCases: any[] = Array.isArray(resolvedCasesRaw)
    ? resolvedCasesRaw
    : (Array.isArray(resolvedCasesRaw?.data) ? resolvedCasesRaw.data : []);

  const myCases: any[] = Array.isArray(myCasesRaw)
    ? myCasesRaw
    : (Array.isArray(myCasesRaw?.data) ? myCasesRaw.data : []);

  const bannedUsers: any[] = Array.isArray(bannedUsersRaw)
    ? bannedUsersRaw
    : (Array.isArray(bannedUsersRaw?.data) ? bannedUsersRaw.data : []);

  // Mutations
  const petitionMutation = useMutation({
    mutationFn: async (data: { bannedUserId: string; reason: string }) => {
      const res = await apiClient.post(`/governance/banned-users/${data.bannedUserId}/reinstatement`, { reason: data.reason });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Reinstatement petition created! Open for peer voting.');
      refetchBannedUsers();
      refetchOpenCases();
      setSelectedBannedUser(null);
      setReinstatementReason('');
      setActiveTab('open-votes');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to submit reinstatement petition');
    }
  });

  const reportMutation = useMutation({
    mutationFn: async (payload: any) => {
      return apiClient.post('/governance/cases', payload);
    },
    onSuccess: () => {
      toast.success('Report filed! Opened for 7-day community voting.');
      setReportTargetId('');
      setReportReason('');
      setReportEvidenceUrl('');
      setReportEvidenceDesc('');
      queryClient.invalidateQueries({ queryKey: ['governance-my-cases'] });
      queryClient.invalidateQueries({ queryKey: ['governance-jury-duties'] });
      setActiveTab('open-votes');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to submit report');
    }
  });

  const voteMutation = useMutation({
    mutationFn: async (payload: { caseId: string; decision: 'action' | 'no_action' | 'abstain'; justification?: string }) => {
      return apiClient.post(`/governance/cases/${payload.caseId}/vote`, {
        decision: payload.decision,
        justification: payload.justification
      });
    },
    onSuccess: () => {
      toast.success('Your vote has been cast successfully!');
      setSelectedCase(null);
      setVoteJustification('');
      queryClient.invalidateQueries({ queryKey: ['governance-jury-duties'] });
      queryClient.invalidateQueries({ queryKey: ['governance-resolved-cases'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to cast vote');
    }
  });

  const appealMutation = useMutation({
    mutationFn: async (payload: { caseId: string; appealReason: string }) => {
      return apiClient.post(`/governance/cases/${payload.caseId}/appeal`, {
        appealReason: payload.appealReason
      });
    },
    onSuccess: () => {
      toast.success('Appeal submitted for peer review.');
      setAppealCaseId(null);
      setAppealReasonText('');
      queryClient.invalidateQueries({ queryKey: ['governance-my-cases'] });
      queryClient.invalidateQueries({ queryKey: ['governance-resolved-cases'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to submit appeal');
    }
  });

  const resolveAppealMutation = useMutation({
    mutationFn: async (payload: { caseId: string; appealDecision: 'upheld' | 'reversed' }) => {
      return apiClient.post(`/governance/cases/${payload.caseId}/appeal/resolve`, {
        appealDecision: payload.appealDecision
      });
    },
    onSuccess: (_, variables) => {
      toast.success(`Appeal resolved: ${variables.appealDecision === 'upheld' ? 'Penalty Upheld' : 'Penalty Reversed'}!`);
      queryClient.invalidateQueries({ queryKey: ['governance-resolved-cases'] });
      queryClient.invalidateQueries({ queryKey: ['governance-my-cases'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to resolve appeal.');
    }
  });

  // Filter resolved cases
  const filteredResolved = resolvedCases.filter((c: any) => {
    const matchesSearch = !logSearch || 
      c.reason?.toLowerCase().includes(logSearch.toLowerCase()) || 
      c.id?.toLowerCase().includes(logSearch.toLowerCase());
    
    if (logFilter === 'all') return matchesSearch;
    if (logFilter === 'appealed') return matchesSearch && c.status === 'appealed';
    return matchesSearch && c.targetType === logFilter;
  });

  // Calculate stats
  const totalVotesCast = openCases.reduce((acc, c) => acc + (c.totalVotes || 0), 0) + 
                         resolvedCases.reduce((acc, c) => acc + (c.totalVotes || 0), 0);
  const userVotedCount = openCases.filter(c => c.hasVoted).length;

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }
    if (!reportTargetId.trim() || !reportReason.trim()) {
      toast.error('Target ID and Reason are required.');
      return;
    }
    reportMutation.mutate({
      targetType: reportType,
      targetId: reportTargetId,
      reason: reportReason,
      evidenceUrl: reportEvidenceUrl,
      evidenceDescription: reportEvidenceDesc
    });
  };

  const handleCastVoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }
    if (!selectedCase) return;
    voteMutation.mutate({
      caseId: selectedCase.id,
      decision: voteDecision,
      justification: voteJustification
    });
  };

  const handleAppealSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealCaseId || !appealReasonText.trim()) return;
    appealMutation.mutate({
      caseId: appealCaseId,
      appealReason: appealReasonText
    });
  };

  // Helper for remaining time in 7-day window
  const getRemainingTimeText = (createdAtStr: string) => {
    const createdAt = new Date(createdAtStr);
    const expiresAt = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);
    const now = new Date();
    if (now >= expiresAt) return 'Closing soon';
    
    const daysLeft = differenceInDays(expiresAt, now);
    if (daysLeft >= 1) return `${daysLeft}d left`;
    const hoursLeft = differenceInHours(expiresAt, now);
    return `${hoursLeft}h left`;
  };

  const navOptions = [
    {
      id: 'open-votes',
      label: 'Open Votes',
      icon: Gavel,
      iconColor: 'text-amber-500',
      count: openCases.length,
      countBg: 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
    },
    {
      id: 'banned-users',
      label: 'Reinstatements',
      icon: UserX,
      iconColor: 'text-red-500',
      count: bannedUsers.length,
      countBg: 'bg-red-500/20 text-red-600 dark:text-red-400',
    },
    {
      id: 'logs',
      label: 'Public Log',
      icon: History,
      iconColor: 'text-emerald-500',
    },
    {
      id: 'report',
      label: 'File Report',
      icon: FilePlus,
      iconColor: 'text-primary',
    },
    {
      id: 'my-cases',
      label: 'My Cases',
      icon: ShieldAlert,
      iconColor: 'text-purple-500',
    },
    {
      id: 'constitution',
      label: 'Read Constitution',
      icon: BookOpen,
      iconColor: 'text-primary',
    },
  ];

  const activeOption = navOptions.find(opt => opt.id === activeTab) || navOptions[0];
  const ActiveIcon = activeOption.icon;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-safe px-4 sm:px-6">
      
      {/* Hero Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-card to-primary/5 border border-border p-4 sm:p-6 lg:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <Vote className="w-3.5 h-3.5" />
              <span>Direct Democratic Governance</span>
            </div>
            <h1 className="text-xl sm:text-3xl lg:text-4xl font-heading font-bold text-foreground tracking-tight">
              Community Moderation & Equal Voting
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
              Center7 operates on <strong className="text-foreground">pure peer equality</strong>. 
              No single admin holds moderation power. Every member receives <strong className="text-foreground font-semibold">1 equal vote</strong> on all open community cases. Cases remain open for 7 days, and a simple majority determines the verdict.
            </p>
          </div>

          <div className="flex flex-row sm:flex-row lg:flex-col gap-2.5 sm:gap-3 shrink-0 w-full sm:w-auto">
            <Button 
              onClick={() => setActiveTab('report')} 
              className="flex-1 sm:flex-initial font-semibold shadow-sm text-xs sm:text-sm gap-2 h-10"
            >
              <FilePlus className="w-4 h-4" />
              File a Report
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                refetchOpenCases();
                refetchLogs();
                refetchMyCases();
                toast.success('Governance feed updated!');
              }} 
              className="flex-1 sm:flex-initial text-xs sm:text-sm gap-2 h-10"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh Feed
            </Button>
          </div>
        </div>

        {/* Quick Governance Stats Bar */}
        <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-border/60 grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="bg-background/60 backdrop-blur border border-border/50 rounded-xl p-2.5 sm:p-3.5 flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <Gavel className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-base sm:text-xl font-bold text-foreground truncate">{openCases.length}</div>
              <div className="text-[11px] sm:text-xs text-muted-foreground font-medium truncate">Open Votes</div>
            </div>
          </div>

          <div className="bg-background/60 backdrop-blur border border-border/50 rounded-xl p-2.5 sm:p-3.5 flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-base sm:text-xl font-bold text-foreground truncate">{resolvedCases.length}</div>
              <div className="text-[11px] sm:text-xs text-muted-foreground font-medium truncate">Resolved Cases</div>
            </div>
          </div>

          <div className="bg-background/60 backdrop-blur border border-border/50 rounded-xl p-2.5 sm:p-3.5 flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Vote className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-base sm:text-xl font-bold text-foreground truncate">{totalVotesCast}</div>
              <div className="text-[11px] sm:text-xs text-muted-foreground font-medium truncate">Total Votes</div>
            </div>
          </div>

          <div className="bg-background/60 backdrop-blur border border-border/50 rounded-xl p-2.5 sm:p-3.5 flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-base sm:text-xl font-bold text-foreground truncate">1 Vote</div>
              <div className="text-[11px] sm:text-xs text-muted-foreground font-medium truncate">Per Member</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        
        {/* Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-2">
          
          {/* Mobile Dropdown Selector */}
          <div className="sm:hidden w-full space-y-1">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Governance Section
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger
                className="inline-flex items-center justify-between w-full h-11 px-3.5 bg-card border border-border shadow-2xs font-semibold rounded-xl text-xs gap-2 hover:bg-muted/50 transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-primary/20"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <ActiveIcon className={`w-4 h-4 ${activeOption.iconColor} shrink-0`} />
                  <span className="truncate">{activeOption.label}</span>
                  {activeOption.count !== undefined && activeOption.count > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeOption.countBg}`}>
                      {activeOption.count}
                    </span>
                  )}
                </div>
                <ChevronDown className="w-4 h-4 opacity-60 shrink-0 ml-1" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[calc(100vw-2rem)] max-w-sm p-1.5 rounded-xl border border-border shadow-xl z-50 bg-card">
                {navOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = activeTab === opt.id;
                  return (
                    <DropdownMenuItem
                      key={opt.id}
                      onClick={() => setActiveTab(opt.id)}
                      className={`flex items-center justify-between px-3.5 py-2.5 text-xs rounded-lg cursor-pointer my-0.5 ${
                        isSelected ? 'bg-primary/10 font-bold text-primary' : 'text-foreground hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${opt.iconColor}`} />
                        <span>{opt.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {opt.count !== undefined && opt.count > 0 && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${opt.countBg}`}>
                            {opt.count}
                          </span>
                        )}
                        {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                      </div>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Desktop Navigation Tabs */}
          <TabsList className="hidden sm:flex bg-muted p-1 rounded-xl border border-border flex-row overflow-x-auto scrollbar-none max-w-full w-auto h-11 gap-1">
            <TabsTrigger value="open-votes" className="text-xs sm:text-sm font-semibold rounded-lg gap-1.5 whitespace-nowrap shrink-0 px-3 py-1.5">
              <Gavel className="w-4 h-4 text-amber-500" />
              <span>Open Votes</span>
              {openCases.length > 0 && (
                <span className="ml-1 bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {openCases.length}
                </span>
              )}
            </TabsTrigger>

            <TabsTrigger value="banned-users" className="text-xs sm:text-sm font-semibold rounded-lg gap-1.5 whitespace-nowrap shrink-0 px-3 py-1.5">
              <UserX className="w-4 h-4 text-red-500" />
              <span>Reinstatements</span>
              {bannedUsers.length > 0 && (
                <span className="ml-1 bg-red-500/20 text-red-600 dark:text-red-400 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {bannedUsers.length}
                </span>
              )}
            </TabsTrigger>

            <TabsTrigger value="logs" className="text-xs sm:text-sm font-semibold rounded-lg gap-1.5 whitespace-nowrap shrink-0 px-3 py-1.5">
              <History className="w-4 h-4 text-emerald-500" />
              <span>Public Log</span>
            </TabsTrigger>

            <TabsTrigger value="report" className="text-xs sm:text-sm font-semibold rounded-lg gap-1.5 whitespace-nowrap shrink-0 px-3 py-1.5">
              <FilePlus className="w-4 h-4 text-primary" />
              <span>File Report</span>
            </TabsTrigger>

            <TabsTrigger value="my-cases" className="text-xs sm:text-sm font-semibold rounded-lg gap-1.5 whitespace-nowrap shrink-0 px-3 py-1.5">
              <ShieldAlert className="w-4 h-4 text-purple-500" />
              <span>My Cases</span>
            </TabsTrigger>
          </TabsList>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setActiveTab('constitution')} 
            className="text-xs text-muted-foreground hover:text-foreground gap-1.5 self-start sm:self-auto shrink-0 hidden sm:inline-flex"
          >
            <BookOpen className="w-3.5 h-3.5 text-primary" />
            Read Constitution
          </Button>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: OPEN COMMUNITY VOTES */}
        {/* ========================================================= */}
        <TabsContent value="open-votes" className="space-y-6 m-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: List of Open Cases (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                    <Gavel className="w-5 h-5 text-amber-500" />
                    Open Community Cases
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Review and cast your equal vote on active reports. Cases automatically resolve after 7 days by majority vote.
                  </p>
                </div>
              </div>

              {isOpenCasesLoading ? (
                <div className="flex flex-col items-center justify-center p-12 bg-card border border-border rounded-xl">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                  <p className="text-xs text-muted-foreground">Loading active governance cases...</p>
                </div>
              ) : openCases.length === 0 ? (
                <Card className="border-dashed border-border/80 bg-muted/10 p-8 text-center">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500/40 mx-auto mb-3" />
                  <h4 className="font-semibold text-foreground text-sm">No Open Governance Cases</h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                    The community is currently quiet. All reported cases have been resolved by vote. You can file a new report if you notice policy infractions.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4 text-xs" 
                    onClick={() => setActiveTab('report')}
                  >
                    File a New Report
                  </Button>
                </Card>
              ) : (
                <div className="space-y-3">
                  {openCases.map((c: any) => {
                    const isSelected = selectedCase?.id === c.id;
                    const remainingText = getRemainingTimeText(c.createdAt);
                    const totalVotes = c.totalVotes || 0;
                    const actionVotes = c.actionVotes || 0;
                    const noActionVotes = c.noActionVotes || 0;
                    const actionPct = totalVotes > 0 ? Math.round((actionVotes / totalVotes) * 100) : 0;

                    return (
                      <div
                        key={c.id}
                        onClick={() => setSelectedCase(c)}
                        className={`p-5 rounded-xl border transition-all cursor-pointer space-y-3 ${
                          isSelected 
                            ? 'border-primary bg-primary/[0.03] shadow-sm ring-1 ring-primary/20' 
                            : 'border-border hover:border-primary/40 bg-card'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground px-2 py-0.5 rounded">
                              {c.targetType} report
                            </span>
                            <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {remainingText}
                            </span>
                          </div>

                          {c.hasVoted ? (
                            <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <Check className="w-3 h-3" /> Voted
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full animate-pulse">
                              Vote Open
                            </span>
                          )}
                        </div>

                        <div>
                          <h4 className="font-semibold text-foreground text-sm line-clamp-2">
                            "{c.reason}"
                          </h4>
                          {c.evidenceUrl && (
                            <div className="text-xs text-primary flex items-center gap-1 mt-1 hover:underline">
                              <ExternalLink className="w-3 h-3" />
                              Has Attached Evidence
                            </div>
                          )}
                        </div>

                        {/* Live Community Vote Bar */}
                        <div className="space-y-1.5 pt-1 border-t border-border/50">
                          <div className="flex justify-between items-center text-[11px] text-muted-foreground">
                            <span>Community Consensus</span>
                            <span className="font-medium text-foreground">
                              {totalVotes} total votes ({actionVotes} Action / {noActionVotes} Dismiss)
                            </span>
                          </div>
                          
                          <div className="w-full bg-muted h-2 rounded-full overflow-hidden flex">
                            <div 
                              className="bg-red-500 h-full transition-all duration-300" 
                              style={{ width: `${totalVotes > 0 ? actionPct : 50}%` }}
                              title={`${actionPct}% Action`}
                            />
                            <div 
                              className="bg-emerald-500 h-full transition-all duration-300" 
                              style={{ width: `${totalVotes > 0 ? 100 - actionPct : 50}%` }}
                              title={`${100 - actionPct}% Dismiss`}
                            />
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-[11px] text-muted-foreground pt-1">
                          <span>Opened: {format(new Date(c.createdAt || Date.now()), 'MMM d, h:mm a')}</span>
                          <span className="text-primary font-medium flex items-center gap-1">
                            Review Case <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column: Active Voting & Details Inspector (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {selectedCase ? (
                <Card className="border-primary/50 bg-card shadow-md sticky top-4">
                  <CardHeader className="pb-3 border-b border-border/60 bg-primary/[0.02]">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                          <Gavel className="w-4 h-4 text-primary" />
                          Cast Equal Community Vote
                        </CardTitle>
                        <CardDescription className="text-xs mt-0.5">
                          1 Member = 1 Vote. Your decision carries equal weight.
                        </CardDescription>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 text-xs text-muted-foreground"
                        onClick={() => setSelectedCase(null)}
                      >
                        Close
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-4 space-y-4">
                    {isDetailsLoading ? (
                      <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                    ) : (
                      <>
                        {/* Report Reason */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-muted-foreground">Infraction / Reason</label>
                          <div className="bg-muted/40 border border-border/60 p-3 rounded-lg text-xs font-medium text-foreground italic">
                            "{selectedCase.reason}"
                          </div>
                        </div>

                        {/* Content Details */}
                        {activeCaseDetails?.targetContent && (
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground">Reported Subject</label>
                            <div className="bg-background border border-border p-3 rounded-lg text-xs space-y-2">
                              {selectedCase.targetType === 'message' && (
                                <>
                                  <div className="flex items-center gap-1.5 text-muted-foreground font-semibold">
                                    <MessageSquare className="w-3.5 h-3.5 text-primary" />
                                    <span>Message by {activeCaseDetails.targetContent.author?.displayName || 'Unknown'}</span>
                                  </div>
                                  <div className="bg-muted/50 border border-border p-2.5 rounded text-foreground italic">
                                    "{activeCaseDetails.targetContent.content}"
                                  </div>
                                </>
                              )}

                              {selectedCase.targetType === 'user' && (
                                <div className="flex items-center gap-2 font-semibold text-foreground">
                                  <User className="w-4 h-4 text-primary" />
                                  <span>User Profile: {activeCaseDetails.targetContent.displayName || 'Unknown'}</span>
                                </div>
                              )}

                              {selectedCase.targetType === 'resource' && (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 font-semibold text-foreground">
                                    <FileText className="w-4 h-4 text-primary" />
                                    <span>Study Material: {activeCaseDetails.targetContent.title}</span>
                                  </div>
                                  <p className="text-muted-foreground">Uploader: {activeCaseDetails.targetContent.uploader?.displayName || 'Peer'}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Evidence section */}
                        {activeCaseDetails?.evidenceUrl && (
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground">Submitted Evidence</label>
                            <div className="bg-background border border-border p-3 rounded-lg text-xs space-y-1">
                              <a 
                                href={activeCaseDetails.evidenceUrl} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-primary hover:underline flex items-center gap-1 font-semibold break-all"
                              >
                                <LinkIcon className="w-3.5 h-3.5 shrink-0" />
                                View Evidence Document / Screenshot
                              </a>
                              {activeCaseDetails.evidenceDescription && (
                                <p className="text-muted-foreground mt-1">{activeCaseDetails.evidenceDescription}</p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Voting Form */}
                        <form onSubmit={handleCastVoteSubmit} className="space-y-4 pt-3 border-t border-border">
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-foreground block">Select Your Vote</label>
                            <div className="grid grid-cols-3 gap-2">
                              <Button
                                type="button"
                                size="sm"
                                variant={voteDecision === 'action' ? 'default' : 'outline'}
                                className={`text-xs ${voteDecision === 'action' ? 'bg-red-600 hover:bg-red-700 text-white font-semibold' : ''}`}
                                onClick={() => setVoteDecision('action')}
                              >
                                Enforce Action
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant={voteDecision === 'no_action' ? 'default' : 'outline'}
                                className={`text-xs ${voteDecision === 'no_action' ? 'bg-emerald-600 hover:bg-emerald-700 text-white font-semibold' : ''}`}
                                onClick={() => setVoteDecision('no_action')}
                              >
                                Dismiss Case
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant={voteDecision === 'abstain' ? 'default' : 'outline'}
                                className="text-xs"
                                onClick={() => setVoteDecision('abstain')}
                              >
                                Abstain
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground block">Vote Justification (Optional)</label>
                            <Textarea
                              placeholder="Briefly state your reason for this vote..."
                              className="text-xs bg-background resize-none h-18 border-border"
                              value={voteJustification}
                              onChange={(e) => setVoteJustification(e.target.value)}
                            />
                          </div>

                          <Button 
                            type="submit" 
                            className="w-full text-xs font-bold"
                            disabled={voteMutation.isPending || selectedCase.hasVoted}
                          >
                            {voteMutation.isPending ? 'Casting Vote...' : selectedCase.hasVoted ? 'Vote Already Cast' : 'Cast Equal Vote'}
                          </Button>
                        </form>
                      </>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-border bg-muted/20 p-8 text-center sticky top-4">
                  <Vote className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <h4 className="font-semibold text-foreground text-sm">Select a Case to Vote</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click on any open community case from the left list to review evidence and cast your vote.
                  </p>
                </Card>
              )}
            </div>

          </div>
        </TabsContent>

        {/* ========================================================= */}
        {/* TAB 2: BANNED USERS & PEER REINSTATEMENT PETITIONS */}
        {/* ========================================================= */}
        <TabsContent value="banned-users" className="space-y-6 m-0">
          <Card className="border-border">
            <CardHeader className="pb-4 border-b border-border/60 bg-red-500/[0.02]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                    <UserX className="w-5 h-5 text-red-500" />
                    Peer Reinstatement Engine
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Center7 peer-based restoration mechanism. Banned users can be petitioned for reinstatement by any peer. A reinstatement petition must receive <strong>at least the same amount of votes</strong> that were used to ban them.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 text-xs bg-muted px-3 py-1.5 rounded-lg border border-border">
                  <HeartHandshake className="w-4 h-4 text-emerald-500" />
                  <span className="font-semibold text-foreground">{bannedUsers.length} Suspended Peers</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              {isBannedLoading ? (
                <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
              ) : bannedUsers.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl bg-card p-6">
                  <UserCheck className="w-12 h-12 text-emerald-500/40 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-foreground">No Banned Users</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                    All community members are in active good standing. If a peer ever receives a suspension, another student can file a reinstatement petition here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bannedUsers.map((u: any) => {
                    const requiredVotes = u.banVotes || 3;
                    const activePetition = u.activePetition;
                    const isSelected = selectedBannedUser?.id === u.id;

                    return (
                      <Card key={u.id} className="border-border bg-card hover:border-border/80 transition-all flex flex-col justify-between">
                        <CardHeader className="p-4 pb-3 border-b border-border/50">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <img 
                                src={u.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.displayName)}`}
                                alt={u.displayName}
                                className="w-10 h-10 rounded-full border border-border object-cover"
                              />
                              <div>
                                <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                                  {u.displayName}
                                  <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.2 rounded bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30">
                                    {u.status}
                                  </span>
                                </h4>
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                  Banned with <strong className="text-foreground">{requiredVotes} Action votes</strong>
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="p-4 space-y-3 text-xs flex-1">
                          <div className="bg-muted/30 p-2.5 rounded-lg border border-border/50 space-y-1">
                            <span className="font-semibold text-muted-foreground block text-[11px]">Original Ban Reason:</span>
                            <p className="text-foreground italic font-medium">"{u.banReason}"</p>
                          </div>

                          {/* Reinstatement Progress / Active Petition State */}
                          {activePetition ? (
                            <div className="p-3 bg-amber-500/[0.05] border border-amber-500/30 rounded-xl space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" /> Active Reinstatement Vote
                                </span>
                                <span className="font-mono font-bold text-foreground">
                                  {activePetition.reinstatementVotes} / {requiredVotes} Votes
                                </span>
                              </div>

                              {/* Progress bar */}
                              <div className="w-full bg-muted rounded-full h-2 overflow-hidden border border-border/40">
                                <div 
                                  className="bg-amber-500 h-full transition-all duration-500 rounded-full"
                                  style={{ width: `${Math.min(100, (activePetition.reinstatementVotes / requiredVotes) * 100)}%` }}
                                />
                              </div>

                              <p className="text-[11px] text-muted-foreground italic">
                                Petition argument: "{activePetition.reason}"
                              </p>

                              <Button
                                size="sm"
                                className="w-full text-xs font-bold gap-1.5 bg-amber-600 hover:bg-amber-700 text-white mt-1"
                                onClick={() => {
                                  const petitionCase = openCases.find(c => c.id === activePetition.id) || {
                                    id: activePetition.id,
                                    targetType: 'user',
                                    targetId: u.id,
                                    reason: activePetition.reason,
                                    hasVoted: false
                                  };
                                  setSelectedCase(petitionCase);
                                  setActiveTab('open-votes');
                                }}
                              >
                                <Vote className="w-3.5 h-3.5" />
                                Vote on Reinstatement ({Math.max(0, requiredVotes - activePetition.reinstatementVotes)} more vote needed)
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-2 pt-1">
                              {!isSelected ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full text-xs font-semibold gap-1.5 border-primary/40 hover:bg-primary/5 text-primary"
                                  onClick={() => {
                                    if (!user) {
                                      openAuthModal();
                                      return;
                                    }
                                    setSelectedBannedUser(u);
                                  }}
                                >
                                  <HeartHandshake className="w-4 h-4" />
                                  Petition Peer Reinstatement
                                </Button>
                              ) : (
                                <div className="p-3 border border-primary/40 bg-primary/[0.03] rounded-xl space-y-3">
                                  <div className="flex justify-between items-center">
                                    <span className="font-bold text-xs text-foreground">Submit Reinstatement Petition</span>
                                    <button 
                                      onClick={() => setSelectedBannedUser(null)} 
                                      className="text-[11px] text-muted-foreground hover:text-foreground"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                  <p className="text-[11px] text-muted-foreground">
                                    Explain why {u.displayName} should be reinstated. A 7-day vote will launch requiring {requiredVotes} Action votes to restore their account.
                                  </p>
                                  <Textarea
                                    placeholder="State justification for peer reinstatement..."
                                    value={reinstatementReason}
                                    onChange={(e) => setReinstatementReason(e.target.value)}
                                    className="text-xs bg-background h-20 border-border"
                                  />
                                  <Button
                                    size="sm"
                                    className="w-full text-xs font-bold gap-1.5"
                                    disabled={petitionMutation.isPending || !reinstatementReason.trim()}
                                    onClick={() => {
                                      petitionMutation.mutate({
                                        bannedUserId: u.id,
                                        reason: reinstatementReason.trim()
                                      });
                                    }}
                                  >
                                    {petitionMutation.isPending ? 'Filing Petition...' : `Launch Reinstatement Vote (${requiredVotes} Votes Required)`}
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================================================= */}
        {/* TAB 2: PUBLIC MODERATION LOG */}
        {/* ========================================================= */}
        <TabsContent value="logs" className="space-y-6 m-0">
          <Card className="border-border">
            <CardHeader className="pb-4 border-b border-border/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <History className="w-5 h-5 text-emerald-500" />
                    Public Moderation & Verdict Log
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Transparent history of all community votes, penalties enforced, and appeal outcomes.
                  </CardDescription>
                </div>

                {/* Filter and Search controls */}
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <div className="relative w-full sm:w-48">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                    <Input 
                      placeholder="Search log..."
                      value={logSearch}
                      onChange={(e) => setLogSearch(e.target.value)}
                      className="pl-8 h-8 text-xs bg-background"
                    />
                  </div>

                  <div className="flex items-center gap-1 bg-muted p-1 rounded-lg border border-border text-xs w-full sm:w-auto">
                    {(['all', 'message', 'user', 'resource', 'appealed'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setLogFilter(filter)}
                        className={`px-2.5 py-1 rounded-md capitalize font-medium transition-all text-[11px] ${
                          logFilter === filter 
                            ? 'bg-background text-foreground shadow-sm' 
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              {isLogsLoading ? (
                <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
              ) : filteredResolved.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground space-y-2">
                  <HelpCircle className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                  <h4 className="font-semibold text-sm text-foreground">No Matching Log Entries</h4>
                  <p className="text-xs max-w-sm mx-auto">No governance cases match the current filter or search query.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredResolved.map((c: any) => {
                    const totalVotes = c.totalVotes || 0;
                    const actionVotes = c.actionVotes || 0;
                    const noActionVotes = c.noActionVotes || 0;

                    return (
                      <div key={c.id} className="p-5 border border-border rounded-xl bg-card hover:shadow-sm transition-all space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase bg-muted text-muted-foreground px-2 py-0.5 rounded">
                              {c.targetType} case
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Reported by {c.reporter?.displayName || 'Peer'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {c.status === 'appealed' ? (
                              <span className="text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2.5 py-0.5 rounded-full animate-pulse">
                                Under Appeal Review
                              </span>
                            ) : c.appealDecision === 'reversed' ? (
                              <span className="text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Verdict Overturned
                              </span>
                            ) : c.decision === 'action' ? (
                              <span className="text-xs font-semibold bg-red-500/10 text-red-500 border border-red-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5" /> Penalty Enforced
                              </span>
                            ) : (
                              <span className="text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Case Dismissed
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <div className="text-xs text-muted-foreground font-semibold">Infraction / Reason</div>
                            <p className="text-sm text-foreground font-medium mt-0.5">"{c.reason}"</p>
                          </div>

                          {c.evidenceUrl && (
                            <div className="text-xs bg-muted/40 p-2.5 border border-border/50 rounded-lg space-y-1">
                              <div className="font-semibold text-muted-foreground flex items-center gap-1">
                                <LinkIcon className="w-3 h-3 text-primary" /> Associated Evidence URL
                              </div>
                              <a href={c.evidenceUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline break-all block">{c.evidenceUrl}</a>
                              {c.evidenceDescription && <p className="text-muted-foreground mt-1">{c.evidenceDescription}</p>}
                            </div>
                          )}

                          {/* Appeal Section in Log */}
                          {c.status === 'appealed' && (
                            <div className="p-3 border border-amber-500/30 bg-amber-500/[0.03] rounded-lg space-y-2">
                              <div className="text-xs font-semibold text-amber-600 flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" /> Appeal Submitted by Penalized Party
                              </div>
                              <p className="text-xs text-foreground italic">"{c.appealReason}"</p>
                              
                              <div className="pt-2 border-t border-amber-500/20 flex gap-2">
                                <Button 
                                  size="sm" 
                                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                                  onClick={() => resolveAppealMutation.mutate({ caseId: c.id, appealDecision: 'reversed' })}
                                >
                                  Accept Appeal (Reverse Penalty)
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  className="text-xs font-semibold"
                                  onClick={() => resolveAppealMutation.mutate({ caseId: c.id, appealDecision: 'upheld' })}
                                >
                                  Uphold Penalty
                                </Button>
                              </div>
                            </div>
                          )}

                          {c.appealDecision && c.status === 'resolved' && (
                            <div className="p-3 border border-border bg-muted/20 rounded-lg text-xs space-y-1">
                              <span className="font-semibold text-foreground">Appeal Outcome:</span> {c.appealDecision === 'reversed' ? 'Penalty Lifted & Reputation Restored.' : 'Appeal rejected. Penalty upheld.'}
                              {c.appealReason && <p className="text-muted-foreground mt-1 italic">Appeal argument: "{c.appealReason}"</p>}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap justify-between items-center text-[11px] text-muted-foreground pt-2 border-t border-border/40 gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">Vote Result:</span>
                            <span>{totalVotes} total votes ({actionVotes} Action / {noActionVotes} Dismiss)</span>
                          </div>
                          <span>Case ID: {c.id.substring(0, 8)} • Resolved {format(new Date(c.updatedAt || Date.now()), 'MMM d, h:mm a')}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================================================= */}
        {/* TAB 3: FILE A REPORT */}
        {/* ========================================================= */}
        <TabsContent value="report" className="space-y-6 m-0">
          <Card className="border-border max-w-3xl mx-auto">
            <CardHeader className="pb-4 border-b border-border/60">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <FilePlus className="w-5 h-5 text-primary" />
                Submit a Community Governance Report
              </CardTitle>
              <CardDescription className="text-xs">
                Reports open a 7-day community voting window. All members vote equally. False reports incur reputation deductions (-30 rep).
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              <form onSubmit={handleReportSubmit} className="space-y-5">
                
                {/* Target Type Picker Cards */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground">1. Select Target Type</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { type: 'message', label: 'Message', icon: MessageSquare, desc: 'Chat or forum post' },
                      { type: 'user', label: 'User Profile', icon: User, desc: 'Harassment or impersonation' },
                      { type: 'resource', label: 'Study Resource', icon: FileText, desc: 'Malicious file or spam' },
                    ].map((item) => {
                      const Icon = item.icon;
                      const isSelected = reportType === item.type;
                      return (
                        <div
                          key={item.type}
                          onClick={() => setReportType(item.type as any)}
                          className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                            isSelected 
                              ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                              : 'border-border hover:border-muted-foreground/30 bg-card'
                          }`}
                        >
                          <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                          <div className="font-semibold text-xs text-foreground">{item.label}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">{item.desc}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">2. Target UUID / ID</label>
                  <Input 
                    placeholder="e.g. 520ed77f-6f66-4668-89d1-e4ce94fc0a9a"
                    value={reportTargetId}
                    onChange={(e) => setReportTargetId(e.target.value)}
                    className="rounded-lg text-xs bg-background border-border"
                    required
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Copy the UUID directly from the target message, user profile, or file details menu.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">3. Reason & Code of Conduct Violated</label>
                  <Textarea 
                    placeholder="Describe the violation clearly so community voters can assess..."
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="rounded-lg text-xs bg-background h-24 border-border"
                    required
                  />
                </div>

                <div className="border-t border-border pt-4 space-y-4">
                  <div className="text-xs font-bold text-foreground">4. Attach Verified Evidence (Optional but recommended)</div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Evidence URL (Screenshot or Document Link)</label>
                    <Input 
                      placeholder="https://example.com/evidence-screenshot.png"
                      value={reportEvidenceUrl}
                      onChange={(e) => setReportEvidenceUrl(e.target.value)}
                      className="rounded-lg text-xs bg-background border-border"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Evidence Notes</label>
                    <Textarea 
                      placeholder="Explain how this URL or attachment proves the claim..."
                      value={reportEvidenceDesc}
                      onChange={(e) => setReportEvidenceDesc(e.target.value)}
                      className="rounded-lg text-xs bg-background h-16 border-border"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full font-bold text-xs"
                  disabled={reportMutation.isPending}
                >
                  {reportMutation.isPending ? 'Filing Report...' : 'File Case to Community Vote'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================================================= */}
        {/* TAB 4: MY CASES & APPEALS */}
        {/* ========================================================= */}
        <TabsContent value="my-cases" className="space-y-6 m-0">
          <Card className="border-border max-w-4xl mx-auto">
            <CardHeader className="pb-4 border-b border-border/60">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-purple-500" />
                Your Governance History & Appeals
              </CardTitle>
              <CardDescription className="text-xs">
                View cases you filed or cases where you were subject to a report.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              {!user ? (
                <div className="text-center py-8 space-y-3">
                  <Lock className="w-10 h-10 text-muted-foreground/30 mx-auto" />
                  <p className="text-xs text-muted-foreground">Please log in to view your case history.</p>
                  <Button size="sm" onClick={openAuthModal} className="text-xs font-semibold">Sign In</Button>
                </div>
              ) : isMyCasesLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              ) : myCases.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-xs space-y-1">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500/30 mx-auto mb-2" />
                  <p className="font-semibold text-foreground">No Case History</p>
                  <p>You have not filed any reports and have no infractions against you.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myCases.map((c: any) => (
                    <div key={c.id} className="p-4 border border-border rounded-xl bg-card text-xs space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                            {c.targetType} case
                          </span>
                          <h5 className="font-semibold text-foreground text-sm mt-1">"{c.reason}"</h5>
                        </div>
                        <div className="text-xs font-semibold">
                          {c.status === 'resolved' ? (
                            <span className="text-emerald-500">Resolved ({c.decision})</span>
                          ) : (
                            <span className="text-amber-500 uppercase text-[10px] tracking-wider font-bold animate-pulse">{c.status}</span>
                          )}
                        </div>
                      </div>

                      {/* Appeal trigger */}
                      {c.status === 'resolved' && c.decision === 'action' && (
                        <div className="bg-muted/40 p-3 rounded-lg border border-border flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                          <div>
                            <div className="font-semibold text-xs text-red-500">Enforcement Action Taken</div>
                            <div className="text-muted-foreground">Submit a formal appeal argument to request community review.</div>
                          </div>

                          {appealCaseId === c.id ? (
                            <form onSubmit={handleAppealSubmit} className="w-full sm:w-2/3 space-y-2">
                              <Input 
                                placeholder="Explain why this decision was incorrect..."
                                className="text-xs bg-background h-8"
                                value={appealReasonText}
                                onChange={(e) => setAppealReasonText(e.target.value)}
                                required
                              />
                              <div className="flex gap-1.5 justify-end">
                                <Button type="submit" size="sm" className="h-7 text-xs bg-red-600 text-white font-semibold" disabled={appealMutation.isPending}>
                                  {appealMutation.isPending ? 'Submitting...' : 'Send Appeal'}
                                </Button>
                                <Button type="button" size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setAppealCaseId(null)}>
                                  Cancel
                                </Button>
                              </div>
                            </form>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                              onClick={() => {
                                setAppealCaseId(c.id);
                                setAppealReasonText('');
                              }}
                            >
                              Submit Appeal
                            </Button>
                          )}
                        </div>
                      )}

                      {c.appealReason && (
                        <div className="p-3 bg-muted/40 rounded-lg text-xs border border-border space-y-1">
                          <div className="font-semibold text-foreground">Submitted Appeal:</div>
                          <p className="text-muted-foreground italic">"{c.appealReason}"</p>
                          {c.appealDecision && (
                            <div className="mt-1 pt-1 border-t border-border font-semibold text-primary">
                              Appeal Outcome: <span className="capitalize">{c.appealDecision}</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="text-[10px] text-muted-foreground">
                        Case ID: {c.id} • Created {format(new Date(c.createdAt || Date.now()), 'MMM d, h:mm a')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================================================= */}
        {/* TAB 5: CONSTITUTION */}
        {/* ========================================================= */}
        <TabsContent value="constitution" className="space-y-6 m-0">
          <Card className="border-border max-w-4xl mx-auto">
            <CardHeader className="pb-4 border-b border-border/60">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                The Center7 Community Constitution
              </CardTitle>
              <CardDescription className="text-xs">
                Core guidelines for direct equal democracy and peer moderation.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 border border-border rounded-xl bg-muted/20 space-y-3">
                  <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Article I: Equal Democracy
                  </h4>
                  <ul className="text-xs text-muted-foreground space-y-2.5 list-disc pl-4">
                    <li><strong>1 Member = 1 Vote:</strong> Every registered student has identical voting power. There are no admin ranks or weighted voting multipliers.</li>
                    <li><strong>7-Day Voting Window:</strong> All reported cases remain open for community voting for exactly 7 days from creation.</li>
                    <li><strong>Majority Rule:</strong> At the end of the 7-day period, a simple majority determines whether enforcement action is taken or dismissed.</li>
                  </ul>
                </div>

                <div className="p-5 border border-border rounded-xl bg-muted/20 space-y-3">
                  <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    Article II: Conduct & Appeals
                  </h4>
                  <ul className="text-xs text-muted-foreground space-y-2.5 list-disc pl-4">
                    <li><strong>Prohibited Actions:</strong> Harassment, malicious file uploads, and spam incur reputation point deductions and content removal if voted guilty.</li>
                    <li><strong>False Reporting:</strong> Filing frivolous or malicious reports results in a -30 reputation deduction.</li>
                    <li><strong>Right to Appeal:</strong> Any penalized member can submit a formal appeal detailing their defense for community review.</li>
                  </ul>
                </div>
              </div>

              <div className="bg-primary/[0.04] border border-primary/20 p-4 rounded-xl flex items-start gap-3">
                <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-semibold text-xs text-foreground">Self-Governing Community Guarantee</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Center7 is built entirely on decentralized peer moderation. No centralized team or single administrator holds executive authority over student communications or materials. Transparency is preserved through public voting logs.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
