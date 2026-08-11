import React, { useState } from 'react';
import { BillboardAnnouncement } from '../../types';
import { Pin, Megaphone, ChevronDown, ChevronUp, Check, ShieldCheck, Plus, Sparkles, AlertTriangle, Calendar, FileText, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface BillboardBannerProps {
  pinnedNotice: BillboardAnnouncement | null;
  totalNoticesCount: number;
  onOpenBillboardHub: () => void;
  onOpenCreateModal?: () => void;
  isAdmin: boolean;
  onAcknowledge?: (id: string) => void;
}

export function BillboardBanner({
  pinnedNotice,
  totalNoticesCount,
  onOpenBillboardHub,
  onOpenCreateModal,
  isAdmin,
  onAcknowledge,
}: BillboardBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  if (!pinnedNotice) {
    return (
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
          <Megaphone className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="font-medium">Group Billboard is empty. Admins can pin major announcements for members.</span>
        </div>
        {isAdmin && onOpenCreateModal && (
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onOpenCreateModal}
            className="h-7 text-xs gap-1 border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200 hover:bg-amber-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            Post Info
          </Button>
        )}
      </div>
    );
  }

  const categoryBadgeMap: Record<string, { label: string; color: string; icon: any }> = {
    urgent: { label: 'Urgent Notice', color: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30', icon: AlertTriangle },
    announcement: { label: 'Announcement', color: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30', icon: Megaphone },
    event: { label: 'Event Schedule', color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30', icon: Calendar },
    rules: { label: 'Group Rules', color: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30', icon: ShieldCheck },
    resource: { label: 'Resource Link', color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30', icon: FileText },
  };

  const badgeInfo = categoryBadgeMap[pinnedNotice.category] || categoryBadgeMap.announcement;
  const CategoryIcon = badgeInfo.icon;

  const handleAck = () => {
    setAcknowledged(true);
    if (onAcknowledge) onAcknowledge(pinnedNotice.id);
  };

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-primary/5 border-b border-amber-500/20 shadow-2xs transition-all">
      <div className="px-4 py-2.5 flex items-start justify-between gap-3">
        {/* Left Icon & Title */}
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
            <Pin className="w-4 h-4 text-amber-600 dark:text-amber-400 fill-amber-500/30 rotate-45" />
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={`text-[10px] py-0 px-2 font-bold uppercase tracking-wider flex items-center gap-1 ${badgeInfo.color}`}>
                <CategoryIcon className="w-3 h-3" />
                {badgeInfo.label}
              </Badge>
              <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                <span>by</span>
                <span className="font-bold text-foreground inline-flex items-center gap-1">
                  {pinnedNotice.authorName}
                  <ShieldCheck className="w-3 h-3 text-emerald-500 inline shrink-0" />
                </span>
              </span>
            </div>

            <h4 className="font-bold text-xs sm:text-sm text-foreground tracking-tight leading-snug line-clamp-1">
              {pinnedNotice.title}
            </h4>

            {isExpanded && (
              <p className="text-xs text-foreground/90 whitespace-pre-line leading-relaxed pt-1.5 border-t border-amber-500/15 mt-2 animate-in fade-in-50 duration-200">
                {pinnedNotice.content}
              </p>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-amber-500/10 gap-1 rounded-lg"
            title={isExpanded ? "Collapse" : "Read full notice"}
          >
            {isExpanded ? (
              <>
                <span className="hidden sm:inline">Less</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span className="hidden sm:inline font-medium">Read</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={onOpenBillboardHub}
            className="h-7 px-2.5 text-xs font-semibold bg-amber-500/15 text-amber-900 dark:text-amber-200 border-amber-500/30 hover:bg-amber-500/25 rounded-lg gap-1"
          >
            <Megaphone className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Billboard</span>
            {totalNoticesCount > 1 && (
              <span className="w-4 h-4 rounded-full bg-amber-600 text-white font-bold text-[10px] flex items-center justify-center ml-0.5">
                {totalNoticesCount}
              </span>
            )}
          </Button>

          {isExpanded && !acknowledged && (
            <Button
              size="sm"
              onClick={handleAck}
              className="h-7 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg gap-1 shadow-2xs"
            >
              <Check className="w-3.5 h-3.5" />
              Ack
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
