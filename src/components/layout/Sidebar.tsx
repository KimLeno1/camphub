import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users2,
  Rss,
  Building2,
  MessageSquare,
  BookOpen,
  ShoppingBag,
  ShieldCheck,
  Calendar,
  Settings,
  Sparkles,
  Shield,
  GraduationCap
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Communities', href: '/communities', icon: Users2 },
  { name: 'Feed', href: '/feed', icon: Rss },
  { name: 'Resources', href: '/resources', icon: BookOpen },
  { name: 'Opportunities', href: '/opportunities', icon: GraduationCap },
  { name: 'Hostels', href: '/hostels', icon: Building2 },
  { name: 'Chat', href: '/chat', icon: MessageSquare },
  { name: 'AI Hub', href: '/ai-hub', icon: Sparkles },
  { name: 'Marketplace', href: '/marketplace', icon: ShoppingBag },
  { name: 'Governance', href: '/governance', icon: ShieldCheck },
  { name: 'Events', href: '/events', icon: Calendar },
  { name: 'Security', href: '/security', icon: Shield },
];

export function Sidebar({ className }: { className?: string }) {
  return (
    <div className={cn("w-64 border-r border-border bg-card flex flex-col h-full shrink-0", className)}>
      <div className="h-16 flex items-center px-6 border-b border-border">
        <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center mr-3 shadow-sm">
          <span className="text-primary-foreground font-bold text-xl leading-none">C7</span>
        </div>
        <h1 className="font-heading font-bold text-xl tracking-tight text-foreground">Center7</h1>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )
            }
          >
            <item.icon className="w-5 h-5 mr-3 shrink-0" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-border mt-auto">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )
          }
        >
          <Settings className="w-5 h-5 mr-3 shrink-0" />
          Settings
        </NavLink>
      </div>
    </div>
  );
}
