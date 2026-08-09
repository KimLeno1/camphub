import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { 
  User, Rss, Shield, Bell, Check, Sparkles, SlidersHorizontal, 
  Users, BookOpen, Zap, RotateCcw, Lock
} from 'lucide-react';
import { toast } from 'sonner';

const COMMUNITY_TOPICS = [
  'Computer Science & IT',
  'Engineering & Tech',
  'Business & Finance',
  'Medical & Life Sciences',
  'Law & Humanities',
  'Hostel Life & Housing',
  'Student Clubs & Sports',
  'Exam & Career Prep',
];

const RESOURCE_TYPES = [
  'Past Exam Papers',
  'Lecture Notes & Slides',
  'Code Repositories',
  'Lab Manuals & Reports',
  'E-Books & Textbooks',
  'Research Papers',
];

export function Settings() {
  const { profile, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'feed' | 'notifications' | 'account'>('feed');

  // Profile form state
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [department, setDepartment] = useState(profile?.department || 'Computer Science');
  const [bio, setBio] = useState(profile?.bio || 'Student community member on Center7.');

  // Feed preferences state
  const [selectedTopics, setSelectedTopics] = useState<string[]>([
    'Computer Science & IT',
    'Engineering & Tech',
    'Exam & Career Prep',
  ]);
  const [selectedResources, setSelectedResources] = useState<string[]>([
    'Past Exam Papers',
    'Lecture Notes & Slides',
  ]);
  const [prioritizeMajor, setPrioritizeMajor] = useState(true);
  const [filterUnverified, setFilterUnverified] = useState(false);
  const [showTrendingFirst, setShowTrendingFirst] = useState(true);
  const [feedSaved, setFeedSaved] = useState(false);

  // Load stored preferences
  useEffect(() => {
    try {
      const stored = localStorage.getItem('center7_feed_preferences');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.topics) setSelectedTopics(parsed.topics);
        if (parsed.resources) setSelectedResources(parsed.resources);
        if (typeof parsed.prioritizeMajor === 'boolean') setPrioritizeMajor(parsed.prioritizeMajor);
        if (typeof parsed.filterUnverified === 'boolean') setFilterUnverified(parsed.filterUnverified);
        if (typeof parsed.showTrendingFirst === 'boolean') setShowTrendingFirst(parsed.showTrendingFirst);
      }
    } catch (e) {
      console.error('Failed loading feed settings', e);
    }
  }, []);

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
    setFeedSaved(false);
  };

  const toggleResource = (resource: string) => {
    setSelectedResources((prev) =>
      prev.includes(resource) ? prev.filter((r) => r !== resource) : [...prev, resource]
    );
    setFeedSaved(false);
  };

  const handleSaveFeedPreferences = () => {
    const preferences = {
      topics: selectedTopics,
      resources: selectedResources,
      prioritizeMajor,
      filterUnverified,
      showTrendingFirst,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem('center7_feed_preferences', JSON.stringify(preferences));
    setFeedSaved(true);
    toast.success('Feed & discovery rules updated! Recommended feed will adapt immediately.');
    setTimeout(() => setFeedSaved(false), 2000);
  };

  const handleResetFeed = () => {
    setSelectedTopics(['Computer Science & IT', 'Engineering & Tech', 'Exam & Career Prep']);
    setSelectedResources(['Past Exam Papers', 'Lecture Notes & Slides']);
    setPrioritizeMajor(true);
    setFilterUnverified(false);
    setShowTrendingFirst(true);
    setFeedSaved(false);
    toast.info('Reset feed settings to campus defaults');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Profile information saved!');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-safe">
      <div>
        <h1 className="text-3xl font-heading font-extrabold text-foreground">Settings & Governance Rules</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Customize your campus feed rules, profile visibility, and account configurations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Tabs */}
        <div className="col-span-1 space-y-1">
          <nav className="flex flex-col space-y-1 bg-card p-2 rounded-2xl border border-border">
            <Button
              variant={activeTab === 'feed' ? 'secondary' : 'ghost'}
              onClick={() => setActiveTab('feed')}
              className="justify-start gap-2 text-xs font-bold rounded-xl"
            >
              <Rss className="w-4 h-4 text-blue-500" />
              Feed & Discovery
            </Button>

            <Button
              variant={activeTab === 'profile' ? 'secondary' : 'ghost'}
              onClick={() => setActiveTab('profile')}
              className="justify-start gap-2 text-xs font-bold rounded-xl"
            >
              <User className="w-4 h-4 text-emerald-500" />
              Profile Details
            </Button>

            <Button
              variant={activeTab === 'notifications' ? 'secondary' : 'ghost'}
              onClick={() => setActiveTab('notifications')}
              className="justify-start gap-2 text-xs font-bold rounded-xl"
            >
              <Bell className="w-4 h-4 text-amber-500" />
              Notifications
            </Button>

            <Button
              variant={activeTab === 'account' ? 'secondary' : 'ghost'}
              onClick={() => setActiveTab('account')}
              className="justify-start gap-2 text-xs font-bold rounded-xl"
            >
              <Shield className="w-4 h-4 text-purple-500" />
              Account & Security
            </Button>
          </nav>
        </div>

        {/* Tab Contents */}
        <div className="col-span-1 md:col-span-3 space-y-6">
          {activeTab === 'feed' && (
            <Card className="border-border shadow-sm">
              <CardHeader className="border-b border-border/60 pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Rss className="w-5 h-5 text-blue-500" /> Recommended Feed Settings
                </CardTitle>
                <CardDescription className="text-xs">
                  Configure the rules that govern your campus timeline, discovery feed, and resource recommendations.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6 pt-5 text-xs">
                {/* Section 1: Interested Topics */}
                <div className="space-y-2.5">
                  <label className="font-semibold text-foreground flex items-center justify-between uppercase tracking-wider text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-500" /> Primary Interested Topics
                    </span>
                    <span>{selectedTopics.length} active</span>
                  </label>

                  <div className="flex flex-wrap gap-2">
                    {COMMUNITY_TOPICS.map((topic) => {
                      const isSelected = selectedTopics.includes(topic);
                      return (
                        <button
                          key={topic}
                          type="button"
                          onClick={() => toggleTopic(topic)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80 border border-border/60'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          {topic}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section 2: Resource Types */}
                <div className="space-y-2.5 border-t border-border/60 pt-4">
                  <label className="font-semibold text-foreground flex items-center justify-between uppercase tracking-wider text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-purple-500" /> Preferred Study Resources
                    </span>
                    <span>{selectedResources.length} active</span>
                  </label>

                  <div className="flex flex-wrap gap-2">
                    {RESOURCE_TYPES.map((resource) => {
                      const isSelected = selectedResources.includes(resource);
                      return (
                        <button
                          key={resource}
                          type="button"
                          onClick={() => toggleResource(resource)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                            isSelected
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80 border border-border/60'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          {resource}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section 3: Feed Algorithmic Rules */}
                <div className="space-y-3 border-t border-border/60 pt-4">
                  <label className="font-semibold text-foreground flex items-center gap-1.5 uppercase tracking-wider text-[11px] text-muted-foreground">
                    <Zap className="w-3.5 h-3.5 text-amber-500" /> Feed Algorithmic & Quality Rules
                  </label>

                  <div className="space-y-2">
                    <label className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/60 cursor-pointer hover:bg-muted/50 transition-colors">
                      <div>
                        <div className="font-semibold text-foreground">Prioritize Department & Major</div>
                        <div className="text-muted-foreground text-[11px]">
                          Boost posts, exam prep, and updates from your active academic faculty
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={prioritizeMajor}
                        onChange={(e) => { setPrioritizeMajor(e.target.checked); setFeedSaved(false); }}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 accent-blue-600"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/60 cursor-pointer hover:bg-muted/50 transition-colors">
                      <div>
                        <div className="font-semibold text-foreground">Filter Out Unverified Posts</div>
                        <div className="text-muted-foreground text-[11px]">
                          Only show discussions and files from verified campus members
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={filterUnverified}
                        onChange={(e) => { setFilterUnverified(e.target.checked); setFeedSaved(false); }}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 accent-blue-600"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/60 cursor-pointer hover:bg-muted/50 transition-colors">
                      <div>
                        <div className="font-semibold text-foreground">Rank Trending & Upvoted Content First</div>
                        <div className="text-muted-foreground text-[11px]">
                          Place highly engaged posts at the top of your recommended feed
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={showTrendingFirst}
                        onChange={(e) => { setShowTrendingFirst(e.target.checked); setFeedSaved(false); }}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 accent-blue-600"
                      />
                    </label>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="border-t border-border/60 pt-4 flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={handleResetFeed} className="text-muted-foreground text-xs gap-1">
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
                </Button>

                <Button
                  onClick={handleSaveFeedPreferences}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1.5 rounded-xl shadow-xs"
                >
                  {feedSaved ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" /> Saved!
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" /> Save Feed Preferences
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          )}

          {activeTab === 'profile' && (
            <Card className="border-border shadow-sm">
              <CardHeader className="border-b border-border/60 pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald-500" /> Public Profile Info
                </CardTitle>
                <CardDescription className="text-xs">
                  This information is visible to other students and faculty on Center7.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-5 text-xs">
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Display Name</Label>
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="rounded-xl text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Department / Faculty</Label>
                    <Input
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="rounded-xl text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Campus Bio</Label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full p-3 rounded-xl border border-border bg-card text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>

                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl">
                    Save Profile Changes
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card className="border-border shadow-sm">
              <CardHeader className="border-b border-border/60 pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-500" /> Notification Preferences
                </CardTitle>
                <CardDescription className="text-xs">
                  Control how you receive alerts for friend requests, governance votes, and opportunity matches.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-5 text-xs">
                <label className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/60">
                  <div>
                    <div className="font-semibold text-foreground">Friend Requests & Messages</div>
                    <div className="text-muted-foreground text-[11px]">Instant alerts when peers request connection</div>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/60">
                  <div>
                    <div className="font-semibold text-foreground">New Matching Opportunities</div>
                    <div className="text-muted-foreground text-[11px]">Alerts for scholarships & internships in your field</div>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/60">
                  <div>
                    <div className="font-semibold text-foreground">Campus Jury & Governance Cases</div>
                    <div className="text-muted-foreground text-[11px]">Notifications when summoned for jury duty</div>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                </label>
              </CardContent>
            </Card>
          )}

          {activeTab === 'account' && (
            <Card className="border-border shadow-sm">
              <CardHeader className="border-b border-border/60 pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Lock className="w-5 h-5 text-purple-500" /> Account Security & Verification
                </CardTitle>
                <CardDescription className="text-xs">
                  View your student verification credentials and governance trust status.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-5 text-xs">
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-emerald-600 dark:text-emerald-400">Verified Campus Account</div>
                    <div className="text-muted-foreground text-[11px]">Student ID verified via institutional email</div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-full">
                    Active
                  </span>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Registered Email</Label>
                  <Input value={user?.email || 'student@university.edu'} disabled className="rounded-xl text-xs bg-muted/50" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
