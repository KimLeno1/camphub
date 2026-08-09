import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api/client';
import { 
  Sparkles, 
  Brain, 
  Bot, 
  FileText, 
  Globe, 
  Search, 
  RefreshCw, 
  Send, 
  Users, 
  Compass, 
  Award, 
  ArrowRight, 
  AlertTriangle,
  CheckCircle2,
  Trash2,
  BookOpen,
  Lock,
  Bell,
  Clock
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

type TabType = 'assistant' | 'summarizer' | 'recommendations' | 'semantic-search';

export function AiHub() {
  const [activeTab, setActiveTab] = useState<TabType>('assistant');
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Assistant state
  const [assistantQuestion, setAssistantQuestion] = useState('');
  const [assistantHistory, setAssistantHistory] = useState<Array<{ q: string; a: string; followUps: string[] }>>([]);
  
  // Summarizer state
  const [textToProcess, setTextToProcess] = useState('');
  const [summaryType, setSummaryType] = useState<'bullet' | 'short' | 'detailed'>('bullet');
  const [targetLang, setTargetLang] = useState('Spanish');
  const [summaryResult, setSummaryResult] = useState<{ summary: string; bullets: string[]; keyTakeaways: string[] } | null>(null);
  const [translationResult, setTranslationResult] = useState<{ translatedText: string; detectedLanguage: string } | null>(null);

  // Semantic search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ itemId: string; title: string; type: string; relevanceScore: number; matchExplanation: string }>>([]);

  // Recommendations queries
  const { data: opportunities, isLoading: loadingOpps, refetch: refetchOpps } = useQuery({
    queryKey: ['ai-opportunities'],
    queryFn: async () => {
      const res = await apiClient.get('/ai/recommend-opportunities');
      return res.data;
    },
    enabled: activeTab === 'recommendations',
  });

  const { data: clubs, isLoading: loadingClubs, refetch: refetchClubs } = useQuery({
    queryKey: ['ai-clubs'],
    queryFn: async () => {
      const res = await apiClient.get('/ai/recommend-clubs');
      return res.data;
    },
    enabled: activeTab === 'recommendations',
  });

  const { data: studyPartners, isLoading: loadingPartners, refetch: refetchPartners } = useQuery({
    queryKey: ['ai-partners'],
    queryFn: async () => {
      const res = await apiClient.get('/ai/recommend-study-partners');
      return res.data;
    },
    enabled: activeTab === 'recommendations',
  });

  // Mutations
  const askMutation = useMutation({
    mutationFn: async (payload: { question: string }) => {
      const res = await apiClient.post('/ai/ask', payload);
      return res.data;
    },
    onSuccess: (data, variables) => {
      setAssistantHistory(prev => [
        ...prev,
        { q: variables.question, a: data.answer, followUps: data.followUps || [] }
      ]);
      setAssistantQuestion('');
      toast.success('Assistant replied!');
    },
    onError: () => {
      toast.error('AI Study Assistant encountered an error.');
    }
  });

  const summarizeMutation = useMutation({
    mutationFn: async (payload: { content: string; type: 'bullet' | 'short' | 'detailed' }) => {
      const res = await apiClient.post('/ai/summarize', payload);
      return res.data;
    },
    onSuccess: (data) => {
      setSummaryResult(data);
      toast.success('Text summarized successfully');
    },
    onError: () => {
      toast.error('Failed to summarize text.');
    }
  });

  const translateMutation = useMutation({
    mutationFn: async (payload: { text: string; targetLanguage: string }) => {
      const res = await apiClient.post('/ai/translate', payload);
      return res.data;
    },
    onSuccess: (data) => {
      setTranslationResult(data);
      toast.success('Text translated successfully');
    },
    onError: () => {
      toast.error('Failed to translate text.');
    }
  });

  const searchMutation = useMutation({
    mutationFn: async (query: string) => {
      const res = await apiClient.get(`/ai/semantic-search?query=${encodeURIComponent(query)}`);
      return res.data;
    },
    onSuccess: (data) => {
      setSearchResults(data);
      toast.success(`Found ${data.length} semantic results`);
    },
    onError: () => {
      toast.error('Semantic search failed.');
    }
  });

  const handleAsk = (q: string) => {
    if (!q.trim()) return;
    askMutation.mutate({ question: q });
  };

  // Waitlist state
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [joinedWaitlist, setJoinedWaitlist] = useState(false);

  const handleJoinWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail || !waitlistEmail.includes('@')) {
      toast.error('Please enter a valid student email address.');
      return;
    }
    setJoinedWaitlist(true);
    toast.success("You're on the waitlist! We'll notify you as soon as Phase 7 AI Hub goes live.");
  };

  const samplePrompts = [
    "Explain standard deviation and variance like I'm 10",
    "How do I optimize a binary search tree in TypeScript?",
    "Summarize the key differences between SQL and NoSQL"
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-16 relative">
      {/* Prominent Coming Soon Top Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-indigo-500/15 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-foreground">AI Hub — Launching Soon</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white">
                Coming Soon
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Generative study assistant, semantic search, and AI smart matching modules are currently in preview testing.
            </p>
          </div>
        </div>

        {!joinedWaitlist ? (
          <form onSubmit={handleJoinWaitlist} className="flex gap-2 shrink-0">
            <Input
              type="email"
              placeholder="Enter student email"
              value={waitlistEmail}
              onChange={(e) => setWaitlistEmail(e.target.value)}
              className="h-9 w-48 text-xs bg-background"
            />
            <Button type="submit" size="sm" className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shrink-0 gap-1.5">
              <Bell className="w-3.5 h-3.5" /> Notify Me
            </Button>
          </form>
        ) : (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
            <CheckCircle2 className="w-4 h-4" /> You&apos;re on the early access list!
          </div>
        )}
      </div>

      {/* Main Container with Translucent Blur Overlay */}
      <div className="relative">
        {/* Full Overlay Banner Card */}
        <div className="absolute inset-0 z-20 bg-background/70 backdrop-blur-md rounded-2xl border border-border flex flex-col items-center justify-center p-6 text-center shadow-2xl">
          <div className="max-w-md space-y-4 bg-card/90 border border-border p-8 rounded-2xl shadow-xl backdrop-blur-lg">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-purple-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-purple-500/20">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5" /> Feature Preview
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold font-heading text-foreground">
                AI Hub Coming Soon
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                Center7&apos;s decentralized AI study assistant, document summarizer, and peer matcher are being trained on community guidelines.
              </p>
            </div>

            {!joinedWaitlist ? (
              <form onSubmit={handleJoinWaitlist} className="space-y-2 pt-2">
                <Input
                  type="email"
                  placeholder="name@university.edu"
                  value={waitlistEmail}
                  onChange={(e) => setWaitlistEmail(e.target.value)}
                  className="text-xs text-center"
                />
                <Button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-white font-bold text-xs">
                  <Bell className="w-4 h-4 mr-2" /> Join Early Access Waitlist
                </Button>
              </form>
            ) : (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Waitlist Confirmed! We&apos;ll notify you on release.
              </div>
            )}
          </div>
        </div>

        {/* Underlying Preview Content (Blurred behind overlay) */}
        <div className="pointer-events-none select-none opacity-40 filter blur-[1px] space-y-8">
          {/* Premium Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-8 md:p-12 shadow-md">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-indigo-200 to-indigo-900 pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Phase 7 AI Hub
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-heading leading-tight">
            Center7 AI Copilot
          </h1>
          <p className="text-white/80 text-sm md:text-base leading-relaxed">
            Welcome, {user?.displayName}. Experience autonomous student learning & smart matching powered by deep semantic intelligence.
          </p>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-border overflow-x-auto whitespace-nowrap scrollbar-none gap-2">
        {(['assistant', 'summarizer', 'recommendations', 'semantic-search'] as TabType[]).map((tab) => {
          const labels: Record<TabType, { label: string; icon: any }> = {
            assistant: { label: 'Study Assistant', icon: Brain },
            summarizer: { label: 'Summarize & Translate', icon: FileText },
            recommendations: { label: 'Smart Matcher', icon: Compass },
            'semantic-search': { label: 'Semantic Search', icon: Search }
          };
          const Icon = labels[tab].icon;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm border-b-2 transition-all duration-200 ${
                activeTab === tab
                  ? 'border-primary text-primary bg-primary/5 rounded-t-md'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {labels[tab].label}
            </button>
          );
        })}
      </div>

      {/* Main Feature Content Container */}
      <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm min-h-[400px]">
        <AnimatePresence mode="wait">
          {/* 1. Study Assistant Chat */}
          {activeTab === 'assistant' && (
            <motion.div
              key="assistant"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h3 className="text-xl font-bold font-heading">AI Study Assistant</h3>
                <p className="text-muted-foreground text-sm">
                  Instant homework explanations, concept drilling, and code suggestions with interactive follow-up prompts.
                </p>
              </div>

              {/* Chat history list */}
              {assistantHistory.length > 0 && (
                <div className="space-y-4 border-t border-b border-border py-4 max-h-[450px] overflow-y-auto pr-2 space-y-6">
                  {assistantHistory.map((item, index) => (
                    <div key={index} className="space-y-4">
                      {/* User question */}
                      <div className="flex justify-end">
                        <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-none px-4 py-3 max-w-[80%] text-sm font-medium">
                          {item.q}
                        </div>
                      </div>
                      {/* Assistant answer */}
                      <div className="flex justify-start gap-3">
                        <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center shrink-0">
                          <Bot className="w-4 h-4" />
                        </div>
                        <div className="space-y-3 max-w-[85%]">
                          <div className="bg-muted/40 text-foreground rounded-2xl rounded-tl-none px-4 py-3 text-sm leading-relaxed prose prose-sm dark:prose-invert">
                            {item.a.split('\n').map((line, lIdx) => (
                              <p key={lIdx}>{line}</p>
                            ))}
                          </div>

                          {/* Follow-up suggestion pill cards */}
                          {item.followUps?.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-1">
                              {item.followUps.map((fu, fIdx) => (
                                <button
                                  key={fIdx}
                                  onClick={() => handleAsk(fu)}
                                  className="text-xs bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-950/40 rounded-full px-3 py-1 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors"
                                >
                                  {fu}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Sample Prompts Grid */}
              {assistantHistory.length === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {samplePrompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAsk(p)}
                      className="text-left p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
                    >
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{p}</p>
                      <span className="text-xs text-muted-foreground mt-2 block flex items-center gap-1">
                        Try prompt <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Chat Input */}
              <div className="flex gap-2">
                <Input
                  value={assistantQuestion}
                  onChange={(e) => setAssistantQuestion(e.target.value)}
                  placeholder="Ask the AI Study Assistant anything..."
                  className="flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && handleAsk(assistantQuestion)}
                />
                <Button 
                  onClick={() => handleAsk(assistantQuestion)}
                  disabled={!assistantQuestion.trim() || askMutation.isPending}
                >
                  {askMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </motion.div>
          )}

          {/* 2. Summarizer & Translator */}
          {activeTab === 'summarizer' && (
            <motion.div
              key="summarizer"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h3 className="text-xl font-bold font-heading">AI Summarizer & Translator</h3>
                <p className="text-muted-foreground text-sm">
                  Quickly summarize lengthy study PDFs or translate textbook materials to any global language instantly.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-foreground">Paste Text Content</label>
                    <textarea
                      value={textToProcess}
                      onChange={(e) => setTextToProcess(e.target.value)}
                      placeholder="Paste textbook excerpts, discussion threads, or assignment outlines here..."
                      className="w-full h-64 border border-border rounded-xl p-4 bg-muted/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none leading-relaxed"
                    />
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 border border-border rounded-lg p-1.5 bg-card shrink-0">
                      <span className="text-xs text-muted-foreground px-2 font-medium">Format:</span>
                      {(['bullet', 'short', 'detailed'] as const).map((fmt) => (
                        <button
                          key={fmt}
                          onClick={() => setSummaryType(fmt)}
                          className={`text-xs px-2.5 py-1 rounded-md capitalize font-semibold transition-colors ${
                            summaryType === fmt ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {fmt}
                        </button>
                      ))}
                    </div>

                    <Button 
                      className="flex-1 sm:flex-none"
                      disabled={!textToProcess.trim() || summarizeMutation.isPending}
                      onClick={() => summarizeMutation.mutate({ content: textToProcess, type: summaryType })}
                    >
                      {summarizeMutation.isPending && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                      Summarize
                    </Button>

                    <div className="flex items-center gap-2 border border-border rounded-lg p-1.5 bg-card shrink-0">
                      <select 
                        value={targetLang}
                        onChange={(e) => setTargetLang(e.target.value)}
                        className="text-xs bg-transparent border-none outline-none font-semibold text-foreground px-2"
                      >
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                        <option value="German">German</option>
                        <option value="Japanese">Japanese</option>
                        <option value="Chinese">Chinese</option>
                        <option value="Arabic">Arabic</option>
                      </select>
                    </div>

                    <Button 
                      variant="secondary"
                      className="flex-1 sm:flex-none"
                      disabled={!textToProcess.trim() || translateMutation.isPending}
                      onClick={() => translateMutation.mutate({ text: textToProcess, targetLanguage: targetLang })}
                    >
                      {translateMutation.isPending && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                      Translate
                    </Button>
                  </div>
                </div>

                {/* Outputs Panel */}
                <div className="border border-border rounded-xl bg-muted/10 p-6 flex flex-col justify-between min-h-[350px]">
                  <div className="space-y-6 overflow-y-auto max-h-[500px]">
                    {/* Summary Result */}
                    {summaryResult && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                            <FileText className="w-4 h-4" /> Summary Output
                          </h4>
                          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setSummaryResult(null)}>Clear</Button>
                        </div>
                        <p className="text-sm font-medium leading-relaxed bg-card border border-border rounded-lg p-3 text-foreground">
                          {summaryResult.summary}
                        </p>
                        {summaryResult.bullets?.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Bullets</p>
                            <ul className="list-disc list-inside space-y-1.5 text-sm text-muted-foreground bg-card border border-border rounded-lg p-3">
                              {summaryResult.bullets.map((b, i) => (
                                <li key={i}>{b}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {summaryResult.keyTakeaways?.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Key Takeaways</p>
                            <ul className="list-decimal list-inside space-y-1.5 text-sm text-muted-foreground bg-card border border-border rounded-lg p-3">
                              {summaryResult.keyTakeaways.map((b, i) => (
                                <li key={i}><span className="font-semibold text-foreground">{b}</span></li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Translation Result */}
                    {translationResult && (
                      <div className="space-y-4 border-t border-border pt-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                            <Globe className="w-4 h-4" /> Translation ({targetLang})
                          </h4>
                          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setTranslationResult(null)}>Clear</Button>
                        </div>
                        <p className="text-xs text-muted-foreground">Detected source language: <span className="font-semibold text-foreground capitalize">{translationResult.detectedLanguage}</span></p>
                        <p className="text-sm leading-relaxed bg-card border border-border rounded-lg p-3 text-foreground whitespace-pre-wrap">
                          {translationResult.translatedText}
                        </p>
                      </div>
                    )}

                    {!summaryResult && !translationResult && (
                      <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                        <Sparkles className="w-10 h-10 text-muted-foreground/35 animate-pulse" />
                        <p className="text-sm font-medium text-muted-foreground">Output will be displayed here</p>
                        <p className="text-xs text-muted-foreground/60 max-w-xs">Paste text on the left and trigger a summarization or translation to get started.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* 3. Smart Recommendations Matching */}
          {activeTab === 'recommendations' && (
            <motion.div
              key="recommendations"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold font-heading">Student Compatibility Matcher</h3>
                  <p className="text-muted-foreground text-sm">
                    Autonomous matches aligning your profile to relevant study buddies, active communities/clubs, and career opportunities.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    refetchOpps();
                    refetchClubs();
                    refetchPartners();
                  }}
                  className="shrink-0"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-2" /> Recalculate AI Matches
                </Button>
              </div>

              {/* Three Section Grids */}
              <div className="space-y-8">
                {/* A. Study Partners */}
                <div className="space-y-4">
                  <h4 className="text-base font-bold flex items-center gap-2 text-foreground">
                    <Users className="w-5 h-5 text-indigo-500" /> Compatible Study Partners
                  </h4>
                  {loadingPartners ? (
                    <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground"><RefreshCw className="w-4 h-4 animate-spin" /> Matching study partners...</div>
                  ) : !studyPartners || studyPartners.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No other active student profiles available to match.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {studyPartners.map((partner: any, idx: number) => (
                        <div key={idx} className="border border-border rounded-xl bg-card p-4 shadow-xs hover:border-indigo-500/40 transition-colors flex flex-col justify-between">
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 overflow-hidden flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400">
                                {partner.avatarUrl ? (
                                  <img src={partner.avatarUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  partner.displayName.substring(0, 2).toUpperCase()
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold truncate">{partner.displayName}</p>
                                <p className="text-xs text-muted-foreground truncate">{partner.major}</p>
                              </div>
                              <span className="ml-auto text-xs font-bold px-2 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-950/20 rounded-md shrink-0">
                                {partner.matchScore}% Match
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {partner.matchReason}
                            </p>
                          </div>
                          <Button size="sm" className="w-full mt-4 text-xs h-8" variant="outline">Connect</Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* B. Clubs / Communities */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <h4 className="text-base font-bold flex items-center gap-2 text-foreground">
                    <Compass className="w-5 h-5 text-violet-500" /> Recommended Clubs & Communities
                  </h4>
                  {loadingClubs ? (
                    <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground"><RefreshCw className="w-4 h-4 animate-spin" /> Scanning campus clubs...</div>
                  ) : !clubs || clubs.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Create some communities first to receive AI-curated matching.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {clubs.map((club: any, idx: number) => (
                        <div key={idx} className="border border-border rounded-xl bg-card p-4 shadow-xs hover:border-violet-500/40 transition-colors flex flex-col justify-between">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-bold truncate text-foreground">{club.name}</p>
                              <span className="text-xs font-bold px-2 py-1 bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-950/20 rounded-md shrink-0">
                                {club.matchScore}% Match
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {club.matchReason}
                            </p>
                          </div>
                          <Button size="sm" className="w-full mt-4 text-xs h-8" variant="outline">Join Club</Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* C. Opportunities */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <h4 className="text-base font-bold flex items-center gap-2 text-foreground">
                    <Award className="w-5 h-5 text-amber-500" /> Curated Opportunities
                  </h4>
                  {loadingOpps ? (
                    <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground"><RefreshCw className="w-4 h-4 animate-spin" /> Mining academic opportunities...</div>
                  ) : !opportunities || opportunities.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Configure your major in profile to customize career recommendations.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {opportunities.map((opp: any, idx: number) => (
                        <div key={idx} className="border border-border rounded-xl bg-card p-5 shadow-xs hover:border-amber-500/40 transition-colors flex flex-col justify-between space-y-4">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-500 border border-amber-100 dark:border-amber-950/20 rounded px-2 py-0.5">
                                {opp.type}
                              </span>
                              <span className="text-xs text-muted-foreground ml-auto">{opp.deadline}</span>
                            </div>
                            <h5 className="text-sm font-extrabold text-foreground">{opp.title}</h5>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {opp.description}
                            </p>
                          </div>
                          <div className="bg-muted/35 rounded-lg p-3 border border-border">
                            <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Fit Analysis:
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                              {opp.fitReason}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* 4. Semantic Search */}
          {activeTab === 'semantic-search' && (
            <motion.div
              key="semantic-search"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h3 className="text-xl font-bold font-heading">AI Semantic Search Engine</h3>
                <p className="text-muted-foreground text-sm">
                  Search resources and community hubs by conceptual alignment, meaning, and intent rather than just basic keyword matches.
                </p>
              </div>

              {/* Search input group */}
              <div className="flex gap-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g., resources dealing with computer architecture or advanced algorithms..."
                  className="flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && searchQuery.trim() && searchMutation.mutate(searchQuery)}
                />
                <Button 
                  onClick={() => searchQuery.trim() && searchMutation.mutate(searchQuery)}
                  disabled={!searchQuery.trim() || searchMutation.isPending}
                >
                  {searchMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
              </div>

              {/* Results display */}
              <div className="space-y-4">
                {searchMutation.isPending ? (
                  <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 animate-spin text-muted-foreground/50" /></div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Semantic Matches</p>
                    {searchResults.map((item, idx) => (
                      <div 
                        key={idx} 
                        className="border border-border rounded-xl bg-card p-4 hover:border-primary/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1 max-w-xl">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground rounded px-1.5 py-0.5">
                              {item.type}
                            </span>
                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                              Relevance: {(item.relevanceScore * 100).toFixed(0)}%
                            </span>
                          </div>
                          <h5 className="text-sm font-bold text-foreground">{item.title}</h5>
                          <p className="text-xs text-muted-foreground italic">
                            &quot;{item.matchExplanation}&quot;
                          </p>
                        </div>
                        <Button size="sm" variant="outline" className="shrink-0">View Match</Button>
                      </div>
                    ))}
                  </div>
                ) : searchQuery ? (
                  <p className="text-sm text-center py-12 text-muted-foreground">No matches found for &quot;{searchQuery}&quot;.</p>
                ) : (
                  <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl bg-muted/20">
                    <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="text-sm font-semibold">Enter a conceptual query to test deep semantic ranking</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  </div>
</div>
  );
}
