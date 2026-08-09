import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { SlidersHorizontal, Check, Sparkles, RotateCcw, BookOpen, Users, Shield, Zap } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { apiClient } from '../../lib/api/client';

interface FeedPreferencesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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

export function FeedPreferencesModal({ open, onOpenChange }: FeedPreferencesModalProps) {
  const { user, profile } = useAuthStore();

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
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load saved preferences from localStorage on mount
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
      console.error('Failed to parse feed preferences', e);
    }
  }, []);

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
    setSaved(false);
  };

  const toggleResource = (resource: string) => {
    setSelectedResources((prev) =>
      prev.includes(resource) ? prev.filter((r) => r !== resource) : [...prev, resource]
    );
    setSaved(false);
  };

  const handleReset = () => {
    setSelectedTopics(['Computer Science & IT', 'Engineering & Tech', 'Exam & Career Prep']);
    setSelectedResources(['Past Exam Papers', 'Lecture Notes & Slides']);
    setPrioritizeMajor(true);
    setFilterUnverified(false);
    setShowTrendingFirst(true);
    setSaved(false);
  };

  const handleSave = async () => {
    setLoading(true);
    const preferences = {
      topics: selectedTopics,
      resources: selectedResources,
      prioritizeMajor,
      filterUnverified,
      showTrendingFirst,
      updatedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem('center7_feed_preferences', JSON.stringify(preferences));
      if (user) {
        await apiClient.patch('/users/me', {
          preferences,
        }).catch(() => {
          // Fallback if backend patch route isn't strictly defined
        });
      }
      setSaved(true);
      setTimeout(() => {
        onOpenChange(false);
        setSaved(false);
      }, 600);
    } catch (err) {
      console.error('Failed saving feed preferences', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto p-6 rounded-2xl border-border bg-card shadow-2xl">
        <DialogHeader className="space-y-2 pb-2 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold font-heading">
                Feed Preferences
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Permanently customize your personalized community and resource discovery feeds.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-3 text-sm">
          {/* Section 1: Community Topics */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-foreground flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
                <Users className="w-3.5 h-3.5 text-blue-500" /> Interested Community Topics
              </label>
              <span className="text-[11px] text-muted-foreground">
                {selectedTopics.length} selected
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {COMMUNITY_TOPICS.map((topic) => {
                const isSelected = selectedTopics.includes(topic);
                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => toggleTopic(topic)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                        : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/50'
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
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-foreground flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
                <BookOpen className="w-3.5 h-3.5 text-purple-500" /> Preferred Study Resources
              </label>
              <span className="text-[11px] text-muted-foreground">
                {selectedResources.length} selected
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {RESOURCE_TYPES.map((resource) => {
                const isSelected = selectedResources.includes(resource);
                return (
                  <button
                    key={resource}
                    type="button"
                    onClick={() => toggleResource(resource)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/30'
                        : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/50'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    {resource}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Algorithmic Controls */}
          <div className="space-y-3 border-t border-border/50 pt-4">
            <label className="font-semibold text-foreground flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground mb-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> Feed Customization Rules
            </label>

            <div className="space-y-2.5">
              <label className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/60 cursor-pointer hover:bg-muted/60 transition-colors">
                <div>
                  <div className="font-medium text-xs text-foreground">Prioritize My Department & Major</div>
                  <div className="text-[11px] text-muted-foreground">Surface courses and notes related to your faculty first</div>
                </div>
                <input
                  type="checkbox"
                  checked={prioritizeMajor}
                  onChange={(e) => {
                    setPrioritizeMajor(e.target.checked);
                    setSaved(false);
                  }}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 accent-blue-600"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/60 cursor-pointer hover:bg-muted/60 transition-colors">
                <div>
                  <div className="font-medium text-xs text-foreground">Filter Out Unverified Resources</div>
                  <div className="text-[11px] text-muted-foreground">Only display community-validated or high-reputation files</div>
                </div>
                <input
                  type="checkbox"
                  checked={filterUnverified}
                  onChange={(e) => {
                    setFilterUnverified(e.target.checked);
                    setSaved(false);
                  }}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 accent-blue-600"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/60 cursor-pointer hover:bg-muted/60 transition-colors">
                <div>
                  <div className="font-medium text-xs text-foreground">Show Trending & High Engagement First</div>
                  <div className="text-[11px] text-muted-foreground">Rank discussions and materials by recent community upvotes</div>
                </div>
                <input
                  type="checkbox"
                  checked={showTrendingFirst}
                  onChange={(e) => {
                    setShowTrendingFirst(e.target.checked);
                    setSaved(false);
                  }}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 accent-blue-600"
                />
              </label>
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between gap-2 border-t border-border/60 pt-4 mt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-muted-foreground text-xs gap-1.5 hover:text-foreground"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Default
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1.5 shadow-sm shadow-blue-600/20"
            >
              {saved ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" /> Saved!
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" /> Save Preferences
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
