import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users2,
  BookOpen,
  ShieldCheck,
  Building2,
  Sparkles,
  ShoppingBag,
  MoreHorizontal,
  Settings,
  Shield,
  Calendar,
  GraduationCap,
  MessageSquare,
  X
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

const primaryItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Events', href: '/events', icon: Calendar },
  { name: 'Communities', href: '/communities', icon: Users2 },
  { name: 'Resources', href: '/resources', icon: BookOpen },
];

const secondaryItems = [
  { name: 'Opportunities', href: '/opportunities', icon: GraduationCap },
  { name: 'Chat', href: '/chat', icon: MessageSquare },
  { name: 'Governance', href: '/governance', icon: ShieldCheck },
  { name: 'Hostels', href: '/hostels', icon: Building2 },
  { name: 'AI Hub', href: '/ai-hub', icon: Sparkles },
  { name: 'Market', href: '/marketplace', icon: ShoppingBag },
  { name: 'Security', href: '/security', icon: Shield },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function BottomNav() {
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-lg border-t border-border shadow-lg md:hidden">
      <nav className="flex items-center justify-around h-16 px-1">
        {primaryItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center flex-1 py-1 px-1 text-[10px] font-semibold transition-all relative',
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute top-0 w-8 h-1 bg-blue-600 rounded-b-full shadow-sm shadow-blue-500/50" />
                )}
                <item.icon className={cn("w-5 h-5 mb-0.5 shrink-0", isActive ? "text-blue-600 dark:text-blue-400" : "")} />
                <span className="truncate max-w-[64px]">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}

        <Popover open={isMoreOpen} onOpenChange={setIsMoreOpen}>
          <PopoverTrigger
            type="button"
            className={cn(
              'flex flex-col items-center justify-center flex-1 py-1 px-1 text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-all',
              isMoreOpen && 'text-blue-600'
            )}
          >
            <MoreHorizontal className="w-5 h-5 mb-0.5 shrink-0" />
            <span>More</span>
          </PopoverTrigger>
          <PopoverContent side="top" align="end" className="w-52 p-2 mb-2 bg-card border-border shadow-xl rounded-xl max-h-[75vh] overflow-y-auto">
            <div className="space-y-1">
              <div className="flex items-center justify-between px-2 py-1 border-b border-border mb-1">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Navigation</span>
                <button 
                  onClick={() => setIsMoreOpen(false)}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              {secondaryItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsMoreOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                      isActive
                        ? 'bg-blue-600/10 text-blue-600 font-bold dark:bg-blue-950 dark:text-blue-400'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )
                  }
                >
                  <item.icon className="w-4 h-4 mr-2.5 shrink-0" />
                  {item.name}
                </NavLink>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </nav>
    </div>
  );
}
