import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Shield, Scale, AlertTriangle, Users, Loader2, ThumbsUp, ThumbsDown, 
  Gavel, CheckCircle2, XCircle, Clock, Link as LinkIcon, FileText, 
  MessageSquare, User, HelpCircle, Info, Lock
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useAuthStore } from '../store/authStore';

export function Governance() {
  const queryClient = useQueryClient();
  const { user, openAuthModal } = useAuthStore();
  
  // Tab states and form states
  const [activeTab, setActiveTab] = useState('logs');
  const [reportType, setReportType] = useState<'user' | 'message' | 'resource'>('message');
  const [reportTargetId, setReportTargetId] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [reportEvidenceUrl, setReportEvidenceUrl] = useState('');
  const [reportEvidenceDesc, setReportEvidenceDesc] = useState('');
  
  // Jury voting states
  const [selectedJuryCase, setSelectedJuryCase] = useState<any>(null);
  const [voteDecision, setVoteDecision] = useState<'action' | 'no_action' | 'abstain'>('action');
  const [voteJustification, setVoteJustification] = useState('');
  
  // Appeal state
  const [appealCaseId, setAppealCaseId] = useState<string | null>(null);
  const [appealReasonText, setAppealReasonText] = useState('');

  // Simulation mode
  const [isElderMode, setIsElderMode] = useState(false);

  // Queries
  const { data: resolvedCasesRaw, isLoading: isLogsLoading } = useQuery({
    queryKey: ['governance-resolved-cases'],
    queryFn: async () => {
      const res = await apiClient.get('/governance/cases/resolved');
      return res.data;
    },
    refetchInterval: 5000, // keep public log real-time
  });

  const { data: juryDutiesRaw, isLoading: isJuryLoading } = useQuery({
    queryKey: ['governance-jury-duties'],
    queryFn: async () => {
      const res = await apiClient.get('/governance/cases/jury-duty');
      return res.data;
    },
    enabled: !!user,
    refetchInterval: 5000,
  });

  const { data: myCasesRaw, isLoading: isMyCasesLoading } = useQuery({
    queryKey: ['governance-my-cases'],
    queryFn: async () => {
      const res = await apiClient.get('/governance/cases/my-cases');
      return res.data;
    },
    enabled: !!user,
    refetchInterval: 5000,
  });

  const resolvedCases: any[] = Array.isArray(resolvedCasesRaw)
    ? resolvedCasesRaw
    : (Array.isArray(resolvedCasesRaw?.data) ? resolvedCasesRaw.data : []);

  const juryDuties: any[] = Array.isArray(juryDutiesRaw)
    ? juryDutiesRaw
    : (Array.isArray(juryDutiesRaw?.data) ? juryDutiesRaw.data : []);

  const myCases: any[] = Array.isArray(myCasesRaw)
    ? myCasesRaw
    : (Array.isArray(myCasesRaw?.data) ? myCasesRaw.data : []);

  // Selected case details (evidence, juror votes, etc.)
  const { data: activeCaseDetails } = useQuery({
    queryKey: ['governance-case-details', selectedJuryCase?.id],
    queryFn: async () => {
      if (!selectedJuryCase?.id) return null;
      const res = await apiClient.get(`/governance/cases/${selectedJuryCase.id}`);
      return res.data;
    },
    enabled: !!selectedJuryCase?.id,
  });

  // Mutations
  const reportMutation = useMutation({
    mutationFn: async (payload: any) => {
      return apiClient.post('/governance/cases', payload);
    },
    onSuccess: () => {
      toast.success('Report submitted! A random jury of 5 peers is being assigned.');
      setReportTargetId('');
      setReportReason('');
      setReportEvidenceUrl('');
      setReportEvidenceDesc('');
      queryClient.invalidateQueries({ queryKey: ['governance-my-cases'] });
      setActiveTab('my-cases');
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
      toast.success('Your weighted vote has been cast!');
      setSelectedJuryCase(null);
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
      toast.success('Appeal submitted successfully! Case sent for peer review.');
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
      toast.success(`Appeal has been resolved: ${variables.appealDecision === 'upheld' ? 'Penalty Upheld' : 'Penalty Reversed'}!`);
      queryClient.invalidateQueries({ queryKey: ['governance-resolved-cases'] });
      queryClient.invalidateQueries({ queryKey: ['governance-my-cases'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to resolve appeal. Only elders are authorized.');
    }
  });

  // Handlers
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
    if (!selectedJuryCase) return;
    voteMutation.mutate({
      caseId: selectedJuryCase.id,
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

  const handleResolveAppeal = (caseId: string, decision: 'upheld' | 'reversed') => {
    resolveAppealMutation.mutate({ caseId, appealDecision: decision });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-safe px-4">
      
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-card border border-border p-6 rounded-2xl shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-heading font-bold text-foreground">Decentralized Governance</h1>
            <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs px-2.5 py-0.5 rounded-full font-medium">
              Elected Jury Model
            </span>
          </div>
          <p className="text-muted-foreground text-sm max-w-2xl">
            Center7 eliminates permanent administrators. Moderation, ban appeals, and rule enforcements 
            are processed entirely through randomly selected student juries, verified evidence, and weighted trust votes.
          </p>
        </div>
        
        {/* Simulation Controls */}
        <div className="flex items-center gap-3 self-start lg:self-center bg-muted/30 p-2.5 rounded-xl border border-border">
          <div className="text-xs space-y-0.5 pr-2 border-r border-border">
            <div className="font-semibold text-foreground">Simulation Controls</div>
            <div className="text-muted-foreground text-[10px]">Toggle role simulation</div>
          </div>
          <Button 
            variant={isElderMode ? "default" : "outline"} 
            size="sm" 
            className="rounded-lg text-xs"
            onClick={() => {
              setIsElderMode(!isElderMode);
              toast.info(isElderMode ? 'Simulating Member mode' : 'Simulating Elder mode (Trust Level 4)');
            }}
          >
            {isElderMode ? "👑 Simulating Elder" : "👥 Simulating Member"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Active Jury Duties (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Your Jury Duty
              </CardTitle>
              <CardDescription>
                Randomly assigned panels that require your vote.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isJuryLoading ? (
                <div className="flex justify-center p-6"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              ) : !juryDuties || juryDuties.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center p-8 bg-muted/10 border border-dashed border-border/50 rounded-xl">
                  <Clock className="w-8 h-8 text-muted-foreground/50 mb-2" />
                  <h4 className="font-medium text-sm text-foreground">No Jury Assignments</h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                    You are currently not on any active jury panels. You will be notified if selected!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {juryDuties.map((item: any) => (
                    <div 
                      key={item.id}
                      className={`p-4 border rounded-xl transition-all cursor-pointer ${
                        selectedJuryCase?.id === item.id 
                          ? 'border-primary bg-primary/5 shadow-sm' 
                          : 'border-border hover:border-muted-foreground/30 bg-card'
                      }`}
                      onClick={() => setSelectedJuryCase(item)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
                          {item.targetType} Report
                        </span>
                        {item.hasVoted ? (
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-500 font-semibold px-2 py-0.5 rounded">Voted</span>
                        ) : (
                          <span className="text-[10px] bg-amber-500/10 text-amber-500 font-semibold px-2 py-0.5 rounded animate-pulse">Needs Vote</span>
                        )}
                      </div>
                      <h4 className="font-semibold text-sm line-clamp-1 text-foreground">{item.reason}</h4>
                      <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        Assigned {format(new Date(item.createdAt || Date.now()), 'MMM d, h:mm a')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Jury Voting Interaction Area */}
          {selectedJuryCase && (
            <Card className="border-primary bg-primary/[0.02] shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
              <CardHeader className="pb-2 border-b border-border/50">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-primary">
                    <Gavel className="w-4 h-4" /> Voting Panel
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 text-xs" 
                    onClick={() => setSelectedJuryCase(null)}
                  >
                    Cancel
                  </Button>
                </div>
                <CardDescription className="text-xs">
                  Review the case details and evidence before casting your vote.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="space-y-1.5">
                  <div className="text-xs text-muted-foreground font-semibold">Report Description</div>
                  <div className="text-sm bg-background border border-border p-3 rounded-lg text-foreground italic">
                    "{selectedJuryCase.reason}"
                  </div>
                </div>

                {activeCaseDetails?.evidenceUrl && (
                  <div className="space-y-1.5">
                    <div className="text-xs text-muted-foreground font-semibold">Verified Evidence</div>
                    <div className="bg-background border border-border p-3 rounded-lg space-y-2">
                      <a 
                        href={activeCaseDetails.evidenceUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-xs text-primary flex items-center gap-1.5 hover:underline break-all"
                      >
                        <LinkIcon className="w-3.5 h-3.5 shrink-0" />
                        {activeCaseDetails.evidenceUrl}
                      </a>
                      {activeCaseDetails.evidenceDescription && (
                        <p className="text-xs text-muted-foreground">{activeCaseDetails.evidenceDescription}</p>
                      )}
                    </div>
                  </div>
                )}

                {activeCaseDetails?.targetContent && (
                  <div className="space-y-1.5">
                    <div className="text-xs text-muted-foreground font-semibold">Reported Content Details</div>
                    <div className="bg-muted/50 border border-border p-3 rounded-lg text-xs space-y-1 text-foreground">
                      {selectedJuryCase.targetType === 'message' && (
                        <>
                          <div className="font-semibold flex items-center gap-1.5">
                            <MessageSquare className="w-3 h-3 text-muted-foreground" /> 
                            Author: {activeCaseDetails.targetContent.author?.displayName || 'Unknown'}
                          </div>
                          <div className="text-muted-foreground italic mt-1 bg-background border border-border p-2 rounded">
                            "{activeCaseDetails.targetContent.content}"
                          </div>
                        </>
                      )}
                      {selectedJuryCase.targetType === 'user' && (
                        <div className="font-semibold flex items-center gap-1.5">
                          <User className="w-3 h-3 text-muted-foreground" /> 
                          User: {activeCaseDetails.targetContent.displayName || 'Unknown'} 
                          <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded">Trust Level {activeCaseDetails.targetContent.trustLevel}</span>
                        </div>
                      )}
                      {selectedJuryCase.targetType === 'resource' && (
                        <>
                          <div className="font-semibold flex items-center gap-1.5">
                            <FileText className="w-3 h-3 text-muted-foreground" /> 
                            Resource Title: {activeCaseDetails.targetContent.title}
                          </div>
                          <div className="text-muted-foreground">Uploader: {activeCaseDetails.targetContent.uploader?.displayName}</div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <form onSubmit={handleCastVoteSubmit} className="space-y-4 pt-2 border-t border-border/50">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground block">Your Decision</label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        type="button"
                        variant={voteDecision === 'action' ? 'default' : 'outline'}
                        className={`text-xs ${voteDecision === 'action' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}`}
                        onClick={() => setVoteDecision('action')}
                      >
                        Action (Guilty)
                      </Button>
                      <Button
                        type="button"
                        variant={voteDecision === 'no_action' ? 'default' : 'outline'}
                        className={`text-xs ${voteDecision === 'no_action' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
                        onClick={() => setVoteDecision('no_action')}
                      >
                        No Action (Dismiss)
                      </Button>
                      <Button
                        type="button"
                        variant={voteDecision === 'abstain' ? 'default' : 'outline'}
                        className="text-xs"
                        onClick={() => setVoteDecision('abstain')}
                      >
                        Abstain
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground block">Justification (Anonymized in log)</label>
                    <Textarea
                      placeholder="Explain your decision..."
                      className="text-xs bg-background resize-none h-18"
                      value={voteJustification}
                      onChange={(e) => setVoteJustification(e.target.value)}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full text-xs font-semibold"
                    disabled={voteMutation.isPending || selectedJuryCase.hasVoted}
                  >
                    {voteMutation.isPending ? 'Casting...' : selectedJuryCase.hasVoted ? 'Already Voted' : 'Submit Weighted Vote'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Dashboard Navigation & Content (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-border overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="px-6 pt-4 border-b border-border/60 bg-muted/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
                  <h3 className="font-bold text-lg flex items-center gap-1.5">
                    <Scale className="w-5 h-5 text-purple-500" />
                    Governance Log & Tools
                  </h3>
                  <TabsList className="grid grid-cols-4 bg-muted border border-border h-9">
                    <TabsTrigger value="logs" className="text-xs">Public Log</TabsTrigger>
                    <TabsTrigger value="report" className="text-xs">File Report</TabsTrigger>
                    <TabsTrigger value="my-cases" className="text-xs">My Cases</TabsTrigger>
                    <TabsTrigger value="constitution" className="text-xs">Constitution</TabsTrigger>
                  </TabsList>
                </div>
              </div>

              {/* TAB 1: Public Moderation Log */}
              <TabsContent value="logs" className="p-6 m-0">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground pb-2 border-b border-border">
                    <Info className="w-4 h-4 text-primary" />
                    <span>Real-time public log of all jury verdicts and appeals for complete transparency.</span>
                  </div>

                  {isLogsLoading ? (
                    <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                  ) : !resolvedCases || resolvedCases.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground space-y-2">
                      <HelpCircle className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                      <h4 className="font-semibold text-sm">No Moderation Log Entries</h4>
                      <p className="text-xs max-w-sm mx-auto">No content or users have been disciplined or reviewed by student juries yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {resolvedCases.map((c: any) => (
                        <div key={c.id} className="p-5 border border-border rounded-xl bg-card hover:shadow-sm transition-all space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-2.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold uppercase bg-muted text-muted-foreground px-2 py-0.5 rounded">
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
                                <span className="text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                                  Verdict Overturned (Appeal Reversed)
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
                                  <LinkIcon className="w-3 h-3" /> Associated Evidence URL
                                </div>
                                <a href={c.evidenceUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline break-all block">{c.evidenceUrl}</a>
                                {c.evidenceDescription && <p className="text-muted-foreground mt-1">{c.evidenceDescription}</p>}
                              </div>
                            )}

                            {/* Appeals info */}
                            {c.status === 'appealed' && (
                              <div className="p-3 border border-amber-500/30 bg-amber-500/[0.03] rounded-lg space-y-2">
                                <div className="text-xs font-semibold text-amber-600 flex items-center gap-1">
                                  <AlertTriangle className="w-3.5 h-3.5" /> Appeal Argument submitted by Penalized Party
                                </div>
                                <p className="text-xs text-foreground italic">"{c.appealReason}"</p>
                                
                                {isElderMode && (
                                  <div className="pt-2 border-t border-amber-500/20 flex gap-2">
                                    <Button 
                                      size="sm" 
                                      className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                                      onClick={() => handleResolveAppeal(c.id, 'reversed')}
                                    >
                                      Accept Appeal (Reverse Penalty)
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="destructive"
                                      className="text-xs"
                                      onClick={() => handleResolveAppeal(c.id, 'upheld')}
                                    >
                                      Uphold Penalty (Dismiss Appeal)
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}

                            {c.appealDecision && c.status === 'resolved' && (
                              <div className="p-3 border border-border bg-muted/20 rounded-lg text-xs space-y-1">
                                <span className="font-semibold text-foreground">Appeal Outcome:</span> {c.appealDecision === 'reversed' ? 'Penalty Lifted & Reputation Restored.' : 'Appeal rejected. Penalty upheld.'}
                                {c.appealReason && <p className="text-muted-foreground mt-1 italic">Appeal argument: "{c.appealReason}"</p>}
                              </div>
                            )}
                          </div>

                          <div className="text-[11px] text-muted-foreground pt-1 flex items-center gap-4">
                            <span>Verification ID: {c.id.substring(0, 8)}</span>
                            <span>•</span>
                            <span>Updated: {format(new Date(c.updatedAt || Date.now()), 'MMM d, h:mm a')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* TAB 2: Report Content Engine */}
              <TabsContent value="report" className="p-6 m-0">
                <form onSubmit={handleReportSubmit} className="space-y-5 max-w-2xl">
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-foreground text-base">File a Student Report / Case</h4>
                    <p className="text-xs text-muted-foreground">
                      Reports are sent automatically to randomly chosen peers. Filing false reports is penalized (-30 rep).
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground">Report Target Type</label>
                    <div className="flex gap-4">
                      {['message', 'user', 'resource'].map((t) => (
                        <label key={t} className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                          <input 
                            type="radio" 
                            name="reportType" 
                            checked={reportType === t} 
                            onChange={() => setReportType(t as any)} 
                            className="text-primary accent-primary" 
                          />
                          <span className="capitalize">{t}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Target Content / User UUID</label>
                    <Input 
                      placeholder="e.g. 520ed77f-6f66-4668-89d1-e4ce94fc0a9a"
                      value={reportTargetId}
                      onChange={(e) => setReportTargetId(e.target.value)}
                      className="rounded-lg text-sm bg-background border-border"
                      required
                    />
                    <p className="text-[10px] text-muted-foreground">
                      You can copy UUIDs of messages, users, or files directly from their options menu on the site.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Reason / Code of Conduct Violated</label>
                    <Textarea 
                      placeholder="Please detail why this target violates the student constitution..."
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="rounded-lg text-sm bg-background h-24"
                      required
                    />
                  </div>

                  <div className="border-t border-border/60 pt-4 space-y-4">
                    <div className="text-xs font-bold text-foreground">Attach Verified Evidence (Optional but recommended)</div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Evidence URL (e.g. screenshot or message link)</label>
                      <Input 
                        placeholder="https://example.com/evidence-screenshot.png"
                        value={reportEvidenceUrl}
                        onChange={(e) => setReportEvidenceUrl(e.target.value)}
                        className="rounded-lg text-sm bg-background border-border"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Evidence Description / Notes</label>
                      <Textarea 
                        placeholder="Detail how this URL supports your claim..."
                        value={reportEvidenceDesc}
                        onChange={(e) => setReportEvidenceDesc(e.target.value)}
                        className="rounded-lg text-sm bg-background h-16"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full sm:w-auto font-semibold px-6"
                    disabled={reportMutation.isPending}
                  >
                    {reportMutation.isPending ? 'Filing Report...' : 'File Case to Jury'}
                  </Button>
                </form>
              </TabsContent>

              {/* TAB 3: User's Case History & Appeals Center */}
              <TabsContent value="my-cases" className="p-6 m-0">
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h4 className="font-bold text-foreground">Your Case History & Appeals</h4>
                    <p className="text-xs text-muted-foreground">Cases where you were either the reporter or the penalized offender.</p>
                  </div>

                  {isMyCasesLoading ? (
                    <div className="flex justify-center p-6"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                  ) : !myCases || myCases.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-xs">
                      No cases filed by or against you.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {myCases.map((c: any) => {
                        const isOffender = c.targetType === 'user' && c.targetId === user?.uid; // simple check
                        return (
                          <div key={c.id} className="p-4 border border-border rounded-xl bg-card text-sm space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                                  {c.targetType} case
                                </span>
                                <h5 className="font-semibold text-foreground mt-1">"{c.reason}"</h5>
                              </div>
                              <div className="text-xs font-semibold">
                                {c.status === 'resolved' ? (
                                  <span className="text-emerald-500">Resolved ({c.decision})</span>
                                ) : (
                                  <span className="text-amber-500 uppercase text-[10px] tracking-wider font-bold animate-pulse">{c.status}</span>
                                )}
                              </div>
                            </div>

                            {/* Appeal Submitting triggers */}
                            {c.status === 'resolved' && c.decision === 'action' && (
                              <div className="bg-muted/40 p-3 rounded-lg border border-border/50 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                                <div className="space-y-0.5">
                                  <div className="font-semibold text-xs text-red-500">Enforcement Action Taken</div>
                                  <div className="text-xs text-muted-foreground">You can file a formal appeal to clear this infraction.</div>
                                </div>
                                {appealCaseId === c.id ? (
                                  <form onSubmit={handleAppealSubmit} className="w-full sm:w-2/3 space-y-2 mt-2">
                                    <Input 
                                      placeholder="Explain why this penalty should be reversed..."
                                      className="text-xs bg-background h-8"
                                      value={appealReasonText}
                                      onChange={(e) => setAppealReasonText(e.target.value)}
                                      required
                                    />
                                    <div className="flex gap-1.5 justify-end">
                                      <Button type="submit" size="sm" className="h-7 text-xs bg-red-600 hover:bg-red-700 text-white" disabled={appealMutation.isPending}>
                                        {appealMutation.isPending ? 'Sending...' : 'Send Appeal'}
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
                                <div className="font-semibold text-foreground">Your Submitted Appeal:</div>
                                <p className="text-muted-foreground italic">"{c.appealReason}"</p>
                                {c.appealDecision && (
                                  <div className="mt-1.5 pt-1.5 border-t border-border font-semibold text-primary">
                                    Appeal Decision: <span className="capitalize">{c.appealDecision}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="text-[10px] text-muted-foreground">
                              Case ID: {c.id} • Created {format(new Date(c.createdAt || Date.now()), 'MMM d, h:mm a')}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* TAB 4: Constitution */}
              <TabsContent value="constitution" className="p-6 m-0">
                <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
                  <div className="space-y-1">
                    <h4 className="font-bold text-foreground text-lg">The Center7 Community Constitution</h4>
                    <p className="text-xs text-muted-foreground">Adopted by majority community voting. Enforced by peer juries.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div className="space-y-3 p-4 border border-border/80 rounded-xl bg-muted/20">
                      <h5 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        Article I: Citizen Rights
                      </h5>
                      <ul className="text-xs text-muted-foreground space-y-2 list-disc pl-4">
                        <li><strong>Base Reputation:</strong> Every member starts with a base reputation score of 100 upon joining the community.</li>
                        <li><strong>Right to Appeal:</strong> Every jury verdict resulting in disciplinary action can be appealed exactly once. Approved appeals restore deducted reputation.</li>
                        <li><strong>Anonymized Decisions:</strong> Jurors are assigned completely at random and their personal identities are hidden to prevent community retaliation.</li>
                      </ul>
                    </div>

                    <div className="space-y-3 p-4 border border-border/80 rounded-xl bg-muted/20">
                      <h5 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                        <XCircle className="w-4 h-4 text-red-500" />
                        Article II: Violations & Penalties
                      </h5>
                      <ul className="text-xs text-muted-foreground space-y-2 list-disc pl-4">
                        <li><strong>Harassment & Spam:</strong> Strictly forbidden. Penalty: Message deleted, -50 reputation points.</li>
                        <li><strong>Malicious Uploads:</strong> Files flagged as dangerous by automatic or manual scanning trigger automatic temporary bans.</li>
                        <li><strong>False Reporting:</strong> Filing malicious reports simply to deduct points from other students results in a -30 reputation penalty.</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-primary/[0.03] border border-primary/20 p-4 rounded-xl flex items-start gap-3">
                    <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="font-semibold text-xs text-foreground">A Note on Reputation & Trust Levels:</div>
                      <p className="text-xs text-muted-foreground">
                        All members start at <span className="font-semibold text-foreground">100 Base Reputation (Trust Level 2 Member)</span>. If reports filed against a member are accepted/upheld by community jury consensus, reputation drops accordingly.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

      </div>
    </div>
  );
}
