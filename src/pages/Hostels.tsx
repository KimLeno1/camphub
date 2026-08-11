import React, { useState } from 'react';
import { 
  Building2, 
  Sparkles, 
  Home, 
  Lock, 
  MapPin, 
  Bell, 
  Calendar, 
  ArrowRight, 
  ShieldCheck, 
  Info,
  Compass,
  Users2,
  ChevronRight,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

export function Hostels() {
  const [email, setEmail] = useState('');
  const [hasSubscribed, setHasSubscribed] = useState(false);

  const handleNotifyMe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid student email address');
      return;
    }
    setHasSubscribed(true);
    toast.success('Successfully subscribed to housing availability alerts!');
  };

  const previewHostels = [
    {
      name: 'Trinity Hall Residences',
      location: 'North Campus Quad',
      desc: 'Premium suite-style dorms featuring private study hubs, gigabit ethernet, and automated laundry tracking.',
      badge: '95% Built'
    },
    {
      name: 'Decentralized Student Suites',
      location: 'West Wing Perimeter',
      desc: 'Collaborative student housing co-operatives managed directly via student council governance.',
      badge: 'Planning Phase'
    }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16 animate-fade-in px-4">
      {/* Banner / Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-900 via-neutral-900 to-zinc-950 text-white p-6 md:p-12 shadow-lg border border-neutral-800">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_120%,_var(--tw-gradient-stops))] from-indigo-500 via-purple-900 to-transparent pointer-events-none animate-pulse" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-800 border border-neutral-700 rounded-full text-[11px] font-bold tracking-wider uppercase text-zinc-300">
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Campus Accommodations</span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight font-heading leading-tight bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent">
              Student Hostels & Housing
            </h1>
            
            <p className="text-neutral-400 text-sm md:text-base leading-relaxed max-w-xl">
              We are building a unified, transparent portal to discover campus residences, apply for vacancies, cast governance votes on meal plans, and co-manage shared decentralized housing.
            </p>
          </div>

          {/* Glowing Status Badge */}
          <div className="flex flex-col items-start md:items-end gap-1.5 bg-neutral-900/60 border border-neutral-800 backdrop-blur-md p-4 rounded-xl self-start md:self-center">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Under Construction</span>
            </div>
            <span className="text-[10px] text-neutral-500">Target Launch: Fall Semester</span>
          </div>
        </div>
      </div>

      {/* CORE CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* LEFT TWO COLUMNS: Features Overview */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/60 shadow-xs">
            <CardHeader className="pb-3 border-b border-border/30">
              <CardTitle className="text-base font-bold font-heading flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Planned Modules & Features</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Here is what is coming to Center7 Student Hostels.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-border/35 text-xs">
              <div className="p-5 flex gap-4 items-start hover:bg-muted/20 transition-colors">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg text-indigo-600 shrink-0 mt-0.5">
                  <Compass className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-foreground">Interactive Room Explorer</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    View complete floorplans, amenities list, pricing, and distance from major lecture halls in high-fidelity listings.
                  </p>
                </div>
              </div>

              <div className="p-5 flex gap-4 items-start hover:bg-muted/20 transition-colors">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg text-emerald-600 shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-foreground">Decentralized Allocation System</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Fair, transparent queue allocation for premium rooms, backstopped by verified academic records and student priority scoring.
                  </p>
                </div>
              </div>

              <div className="p-5 flex gap-4 items-start hover:bg-muted/20 transition-colors">
                <div className="p-2 bg-amber-50 dark:bg-amber-950/40 rounded-lg text-amber-600 shrink-0 mt-0.5">
                  <Users2 className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-foreground">Meal Plan & Room Governance</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Direct voting on caterer changes, weekly schedules, curfew rules, and hostel community guidelines right from your app.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interactive Preview Teaser Cards */}
          <div className="space-y-3">
            <h3 className="font-heading font-bold text-sm text-foreground flex items-center gap-2 px-1">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>Previewing Residential Partners</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {previewHostels.map((h, i) => (
                <Card key={i} className="bg-card/50 border-border/40 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-muted/20 backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <span className="bg-background/95 border border-border/60 text-foreground px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase shadow-md tracking-wider flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" /> Coming Soon
                    </span>
                  </div>
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start gap-3">
                      <h4 className="font-bold text-xs text-foreground font-heading">{h.name}</h4>
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-muted/40 font-semibold shrink-0">
                        {h.badge}
                      </Badge>
                    </div>
                    <CardDescription className="text-[10px] flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-muted-foreground" /> {h.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {h.desc}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Waiting List / Subscribe Widget */}
        <div className="space-y-6">
          <Card className="border-indigo-600/20 dark:border-indigo-500/10 bg-indigo-50/20 dark:bg-indigo-950/10 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-xl pointer-events-none -mr-4 -mt-4" />
            
            <CardHeader className="pb-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 rounded-lg w-fit mb-2">
                <Bell className="w-4 h-4" />
              </div>
              <CardTitle className="text-base font-bold font-heading">Subscribe to Alerts</CardTitle>
              <CardDescription className="text-xs">
                Be the first to know when housing applications open, lottery rules are published, or room viewing tours begin.
              </CardDescription>
            </CardHeader>

            <CardContent className="pb-4">
              {hasSubscribed ? (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-400 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>You're on the Waitlist!</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    We will send an email invite code to <strong className="text-foreground">{email}</strong> as soon as the housing engine compiles on production.
                  </p>
                  <Button 
                    variant="link" 
                    size="sm" 
                    onClick={() => setHasSubscribed(false)}
                    className="p-0 text-xs h-auto text-emerald-700 font-bold"
                  >
                    Change Email
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleNotifyMe} className="space-y-3">
                  <div className="space-y-1">
                    <Input
                      type="email"
                      placeholder="Enter student email..."
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-background text-xs border-border h-9"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-9 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg gap-2 shadow-xs transition-transform active:scale-98"
                  >
                    <span>Keep Me Updated</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </form>
              )}
            </CardContent>

            <CardFooter className="pt-2 border-t border-indigo-100/50 dark:border-indigo-950/50 flex items-center gap-2 text-[10px] text-muted-foreground">
              <Info className="w-3.5 h-3.5 text-indigo-500" />
              <span>We never spam or share student emails.</span>
            </CardFooter>
          </Card>

          {/* Progress Card */}
          <Card className="border-border/60">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs uppercase font-extrabold text-muted-foreground tracking-wider">
                Deployment Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between font-bold text-foreground">
                  <span>Smart Housing Core</span>
                  <span className="text-indigo-600 dark:text-indigo-400">70%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: '70%' }} />
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between font-bold text-foreground">
                  <span>Room Contract Auditing</span>
                  <span className="text-emerald-600 dark:text-emerald-400">90%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: '90%' }} />
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between font-bold text-foreground">
                  <span>Student Governance Portals</span>
                  <span className="text-amber-600 dark:text-amber-400">45%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-amber-600 rounded-full" style={{ width: '45%' }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
