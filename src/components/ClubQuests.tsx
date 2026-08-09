import React, { useState } from 'react';
import { Trophy, CheckCircle2, Circle, Sparkles, Award, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';

interface ClubQuestsProps {
  communityName: string;
}

interface Quest {
  id: string;
  title: string;
  description: string;
  xp: number;
  progress: number;
  maxProgress: number;
  completed: boolean;
  category: string;
}

export function ClubQuests({ communityName }: ClubQuestsProps) {
  const [quests, setQuests] = useState<Quest[]>([
    {
      id: 'q1',
      title: 'Club Orientation',
      description: `Post a friendly introduction message in the #${communityName.toLowerCase().replace(/\s+/g, '-')}-general channel.`,
      xp: 25,
      progress: 1,
      maxProgress: 1,
      completed: true,
      category: 'Community',
    },
    {
      id: 'q2',
      title: 'Resource Contributor',
      description: `Upload a study guide or notes PDF to the ${communityName} resource center.`,
      xp: 50,
      progress: 0,
      maxProgress: 1,
      completed: false,
      category: 'Academic',
    },
    {
      id: 'q3',
      title: 'Club Meetup Attendance',
      description: `RSVP to the next official ${communityName} meeting or study session on the Events tab.`,
      xp: 35,
      progress: 1,
      maxProgress: 2,
      completed: false,
      category: 'Events',
    },
    {
      id: 'q4',
      title: 'Club Governance Voter',
      description: `Participate in active voting for ${communityName} officer proposals or club budget allocation.`,
      xp: 40,
      progress: 0,
      maxProgress: 1,
      completed: false,
      category: 'Governance',
    },
  ]);

  const completeQuest = (questId: string) => {
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === questId) {
          toast.success(`Completed "${q.title}"! Earned +${q.xp} XP for ${communityName}`);
          return { ...q, progress: q.maxProgress, completed: true };
        }
        return q;
      })
    );
  };

  const completedCount = quests.filter((q) => q.completed).length;
  const totalXP = quests.filter((q) => q.completed).reduce((sum, q) => sum + q.xp, 0);

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950 via-indigo-900 to-slate-900 text-white shadow-xl border border-purple-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-semibold uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5 text-amber-400" /> Official Club Quests
          </div>
          <h2 className="text-2xl font-heading font-extrabold text-white">
            {communityName} Quests & Bounties
          </h2>
          <p className="text-purple-200/80 text-sm max-w-lg">
            Complete club-specific challenges to earn local club badges, level up your trust rank, and unlock officer voting privileges.
          </p>
        </div>

        <div className="bg-purple-900/60 border border-purple-400/30 rounded-xl p-4 shrink-0 text-center min-w-[140px]">
          <span className="text-xs uppercase text-purple-200 font-semibold tracking-wider">Club XP Earned</span>
          <div className="text-3xl font-extrabold text-amber-300 mt-1 flex items-center justify-center gap-1">
            <Sparkles className="w-5 h-5 text-amber-400" />
            {totalXP}
          </div>
          <span className="text-[10px] text-purple-300">{completedCount}/{quests.length} Quests Done</span>
        </div>
      </div>

      {/* Quests List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold font-heading flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          Active Club Quests
        </h3>

        <div className="grid gap-4">
          {quests.map((quest) => (
            <Card
              key={quest.id}
              className={`transition-all duration-200 border ${
                quest.completed
                  ? 'bg-muted/30 border-purple-500/30 dark:bg-purple-950/10'
                  : 'bg-card border-border hover:border-purple-500/50 shadow-sm'
              }`}
            >
              <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    {quest.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
                    )}
                    <h4 className="font-bold text-base text-foreground">{quest.title}</h4>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                      {quest.category}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed pl-7">
                    {quest.description}
                  </p>

                  <div className="pl-7 max-w-md pt-1">
                    <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                      <span>Progress</span>
                      <span>
                        {quest.progress} / {quest.maxProgress}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-purple-100 dark:bg-purple-950/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-600 transition-all duration-300 rounded-full"
                        style={{ width: `${(quest.progress / quest.maxProgress) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <div className="text-right">
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block">
                      +{quest.xp} XP
                    </span>
                    <span className="text-[10px] text-muted-foreground">Club Reputation</span>
                  </div>

                  {!quest.completed ? (
                    <Button
                      size="sm"
                      onClick={() => completeQuest(quest.id)}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs h-9 px-4 shadow-md shadow-purple-600/20"
                    >
                      Complete Quest
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" disabled className="text-xs h-9 px-4 text-green-600 border-green-500/30">
                      Completed ✓
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
