import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup 
} from 'firebase/auth';
import { app } from '../lib/firebase';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Users, 
  BookOpen, 
  Vote, 
  Activity, 
  Scale, 
  Cpu, 
  Lock, 
  Server, 
  Terminal, 
  Zap, 
  HelpCircle, 
  ChevronRight, 
  Loader2,
  LockKeyhole
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';

export function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth(app);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Successfully signed in!');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success('Successfully created account!');
      }
      navigate('/');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('Successfully authenticated via Google!');
      navigate('/');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Google Auth aborted.');
    }
  };

  const handleQuickDemo = async () => {
    setIsLoading(true);
    const demoEmail = 'demo@center7.edu';
    const demoPassword = 'password123';
    try {
      try {
        // Try to sign in first, since the demo account might already exist
        await signInWithEmailAndPassword(auth, demoEmail, demoPassword);
        toast.success('Successfully authenticated as Demo Student!');
        navigate('/');
      } catch (signInErr: any) {
        // If sign in fails due to user not existing, create the account
        if (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential' || signInErr.code === 'auth/wrong-password') {
          try {
            await createUserWithEmailAndPassword(auth, demoEmail, demoPassword);
            toast.success('Provisioned & authenticated new Demo Student account!');
            navigate('/');
          } catch (createErr: any) {
            // Fallback: if creation failed because it actually exists but credentials mismatched, try login again or throw
            if (createErr.code === 'auth/email-already-in-use') {
              await signInWithEmailAndPassword(auth, demoEmail, demoPassword);
              toast.success('Successfully logged in as Demo Student!');
              navigate('/');
            } else {
              throw createErr;
            }
          }
        } else {
          throw signInErr;
        }
      }
    } catch (error: any) {
      console.error(error);
      toast.error(`Demo login failed: ${error.message || 'Verify your network connection.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // State for Interactive bylaws / constitution viewer on landing page
  const [selectedBylaw, setSelectedBylaw] = useState(0);
  const bylaws = [
    {
      title: "Article I: Absence of Administration",
      subtitle: "Absolute Student Autonomy",
      description: "Center7 operates entirely without permanent administrators, staff monitors, or commercial coordinators. All executive decisions, resource approvals, and moderation guidelines are decided via decentralised cryptographic ballots."
    },
    {
      title: "Article II: Reputation-Weighted Governance",
      subtitle: "Earned Trust Leadership",
      description: "Student voting power scales dynamically based on contribution metrics, resource sharing grades, peer-reviewed study support, and successful jury dispute participation. Reputation is non-transferable."
    },
    {
      title: "Article III: Random Juried Arbitration",
      subtitle: "Anti-Bias Jury Allocation",
      description: "Reports, code violations, or code breaches trigger an automated case. A random jury of 7 students with high trust scores is selected by the system's verifiable random engine to arbitrate neutrally."
    },
    {
      title: "Article IV: Transparent Audit Ledger",
      subtitle: "Public Accountability",
      description: "Every automated blocklist release, system backup, payload encryption, or file sanitization check is logged in a publicly verifiable real-time ledger. Auditing is open to all students."
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-rose-500 selection:text-white">
      
      {/* Landing Navbar */}
      <header className="border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-rose-600 rounded-xl flex items-center justify-center shadow-md shadow-rose-600/10">
              <span className="text-white font-extrabold text-lg tracking-wider leading-none">C7</span>
            </div>
            <span className="font-heading font-extrabold text-xl tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Center7
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-950/40 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Platform Active
            </span>
          </div>
        </div>
      </header>

      {/* Main Landing & Split Auth Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* LEFT COLUMN: Landing Information, Platform Principles, Live Constitution (7 Columns) */}
          <div className="lg:col-span-7 space-y-12">
            
            {/* Hero text */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-full border border-rose-100 dark:border-rose-950/40 uppercase tracking-wide">
                <Shield className="w-3.5 h-3.5 animate-pulse" /> Decentralized & Autonomous
              </div>
              <h1 className="text-4xl md:text-5xl font-black font-heading leading-[1.1] tracking-tight text-foreground">
                Self-Governing Student <span className="text-rose-600">Platform</span>
              </h1>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-xl">
                Center7 combines the real-time collaboration of Discord, the robust community indexes of Reddit, and the zero-trust security of blockchain-inspired reputation engines. Students rule, students decide.
              </p>
            </div>

            {/* Asymmetrical Core Grid - Avoiding default nested card slop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2 border-l-2 border-rose-600 pl-4 py-1">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-rose-600" />
                  <h4 className="text-sm font-extrabold text-foreground">Reputation Governance</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Earn points through collaborative learning, peer study sessions, and mentoring. Higher reputation grants greater vote authority in policy disputes.
                </p>
              </div>

              <div className="space-y-2 border-l-2 border-indigo-600 pl-4 py-1">
                <div className="flex items-center gap-2">
                  <Vote className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-sm font-extrabold text-foreground">Elected Jury Tribunals</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Disputes and reports are immediately dispatched to randomly assigned students holding valid credentials. Decisions are logged publicly in the audit ledger.
                </p>
              </div>

              <div className="space-y-2 border-l-2 border-rose-600 pl-4 py-1">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-rose-600" />
                  <h4 className="text-sm font-extrabold text-foreground">Versioned Resource Commons</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  A multi-format library equipped with full history, version control, and manual rollback logs. All uploads pass through our active signature-matching virus engine.
                </p>
              </div>

              <div className="space-y-2 border-l-2 border-indigo-600 pl-4 py-1">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-sm font-extrabold text-foreground">Integrated AI Assistant</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Use context-aware neural models for smart study recommendations, rapid syllabus summarization, and content translation on the fly.
                </p>
              </div>
            </div>

            {/* Constitution Interactive Bylaws Viewer */}
            <div className="bg-muted/10 border border-border/85 rounded-2xl p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                    <ShieldCheck className="w-4.5 h-4.5 text-rose-600" /> Interactive Platform Constitution
                  </h3>
                  <p className="text-xs text-muted-foreground">Select a legal article to review Center7 bylaws.</p>
                </div>
              </div>

              <div className="flex gap-2 overflow-x-auto whitespace-nowrap pb-1 scrollbar-none">
                {bylaws.map((b, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedBylaw(index)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-150 shrink-0 ${
                      selectedBylaw === index
                        ? 'bg-rose-600 border-rose-600 text-white shadow-sm'
                        : 'bg-card border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Article {index + 1}
                  </button>
                ))}
              </div>

              <div className="bg-card border border-border/50 rounded-xl p-4 min-h-[120px] flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
                    {bylaws[selectedBylaw].subtitle}
                  </span>
                  <h4 className="text-sm font-bold text-foreground">
                    {bylaws[selectedBylaw].title}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-2">
                    {bylaws[selectedBylaw].description}
                  </p>
                </div>
              </div>
            </div>

            {/* Simulated Live System Metrics */}
            <div className="flex flex-wrap gap-x-8 gap-y-4 pt-4 border-t border-border/60">
              <div>
                <span className="text-[10px] font-mono uppercase text-muted-foreground block">Active Members</span>
                <span className="text-sm font-black text-foreground">142</span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-muted-foreground block">Weekly Proposals Passed</span>
                <span className="text-sm font-black text-foreground">29</span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-muted-foreground block">Files Audited Safely</span>
                <span className="text-sm font-black text-foreground">2,510</span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-muted-foreground block">Decentralized Hubs</span>
                <span className="text-sm font-black text-foreground">14</span>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: The Auth Panel Widget (5 Columns) */}
          <div className="lg:col-span-5">
            <Card className="w-full shadow-2xl border-border/70 overflow-hidden bg-card/60 backdrop-blur-md">
              <div className="h-1.5 bg-gradient-to-r from-rose-600 to-indigo-600 w-full" />
              <CardHeader className="space-y-1.5 text-center pb-6">
                <CardTitle className="text-xl font-heading tracking-tight">
                  {isLogin ? 'Sign In' : 'Create Student ID'}
                </CardTitle>
                <CardDescription className="text-xs">
                  {isLogin ? 'Enter your credential logs to enter Center7' : 'Register a cryptographic account'}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                
                {/* One-Click Quick Demo Access (PRIMARY CALL TO ACTION FOR SANDBOX EVALUATION) */}
                <Button 
                  onClick={handleQuickDemo}
                  className="w-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-extrabold h-11 shadow-md shadow-rose-600/10 flex items-center justify-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4 text-amber-300 fill-amber-300 animate-pulse" />
                  )}
                  Quick Demo Access (Student)
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/80" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase">
                    <span className="bg-card px-2.5 text-muted-foreground font-semibold">Or use credentials</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="student@university.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-muted/15 h-10 border-border/80 focus:ring-rose-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-xs">Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-muted/15 h-10 border-border/80 focus:ring-rose-500"
                    />
                  </div>
                  <Button type="submit" className="w-full h-10" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLogin ? 'Sign In with Email' : 'Register Account'}
                  </Button>
                </form>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/80" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase">
                    <span className="bg-card px-2.5 text-muted-foreground font-semibold">Or continue with</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full h-10" onClick={handleGoogleSignIn} disabled={isLoading}>
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                    <path d="M1 1h22v22H1z" fill="none" />
                  </svg>
                  Google Account
                </Button>
              </CardContent>
              
              <CardFooter className="bg-muted/10 border-t border-border/50 py-4 flex justify-center">
                <Button 
                  variant="link" 
                  className="text-xs text-muted-foreground hover:text-rose-600 font-semibold" 
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </Button>
              </CardFooter>
            </Card>
          </div>

        </div>
      </main>

      {/* Footer block */}
      <footer className="border-t border-border/60 py-8 mt-12 bg-muted/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center gap-2 text-center text-xs text-muted-foreground">
          <p className="font-medium">
            © 2026 <strong className="font-bold text-foreground">@Nana Adu Asare</strong>
          </p>
          <div className="flex items-center justify-center gap-2 text-xs">
            <span>Powered by</span>
            <div className="inline-flex items-center gap-1.5 bg-white text-black px-2.5 py-1 rounded-full border border-slate-200 shadow-2xs">
              <span className="font-bold text-black tracking-tight">KIM_LENO</span>
              <img 
                src="/sss.jpeg" 
                alt="KIM_LENO" 
                className="w-5 h-5 rounded-full object-cover border border-slate-300 shrink-0" 
              />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
