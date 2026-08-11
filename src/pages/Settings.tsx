import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { 
  User, Shield, Bell, Lock
} from 'lucide-react';
import { toast } from 'sonner';

export function Settings() {
  const { profile, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'account'>('profile');

  // Profile form state
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [department, setDepartment] = useState(profile?.department || 'Computer Science');
  const [bio, setBio] = useState(profile?.bio || 'Student community member on Center7.');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Profile information saved!');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-safe">
      <div>
        <h1 className="text-3xl font-heading font-extrabold text-foreground">Settings & Governance Rules</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Customize your profile visibility, notification rules, and account configurations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Tabs */}
        <div className="col-span-1 space-y-1">
          <nav className="flex flex-col space-y-1 bg-card p-2 rounded-2xl border border-border">
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
