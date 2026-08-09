import React, { useState } from 'react';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup 
} from 'firebase/auth';
import { app } from '../../lib/firebase';
import { useAuthStore } from '../../store/authStore';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Zap, Loader2, ShieldCheck, LockKeyhole } from 'lucide-react';
import { toast } from 'sonner';

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
      closeAuthModal();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Authentication failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('Successfully signed in via Google!');
      closeAuthModal();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Google Auth cancelled.');
    }
  };

  const handleQuickDemo = async () => {
    setIsLoading(true);
    const demoEmail = 'demo@center7.edu';
    const demoPassword = 'password123';
    try {
      try {
        await signInWithEmailAndPassword(auth, demoEmail, demoPassword);
        toast.success('Successfully authenticated as Demo Student Juror!');
      } catch (signInErr: any) {
        if (
          signInErr.code === 'auth/user-not-found' || 
          signInErr.code === 'auth/invalid-credential' || 
          signInErr.code === 'auth/wrong-password'
        ) {
          try {
            await createUserWithEmailAndPassword(auth, demoEmail, demoPassword);
            toast.success('Provisioned & signed in as Demo Student!');
          } catch (createErr: any) {
            if (createErr.code === 'auth/email-already-in-use') {
              await signInWithEmailAndPassword(auth, demoEmail, demoPassword);
              toast.success('Logged in as Demo Student!');
            } else {
              throw createErr;
            }
          }
        } else {
          throw signInErr;
        }
      }
      closeAuthModal();
    } catch (error: any) {
      console.error(error);
      toast.error(`Demo login failed: ${error.message || 'Verify network connection.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={(open) => { if (!open) closeAuthModal(); }}>
      <DialogContent className="sm:max-w-md bg-card border-border/80 shadow-2xl p-6">
        <DialogHeader className="space-y-2 text-center flex flex-col items-center">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 mb-1">
            <span className="text-white font-extrabold text-xl tracking-wider leading-none">C7</span>
          </div>
          <DialogTitle className="text-xl font-heading font-extrabold tracking-tight">
            {isLogin ? 'Sign In to Center7' : 'Create Student ID'}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed max-w-xs">
            Unlock complete access to student communities, jury governance, live messaging, and resources.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Quick Demo Access (Primary Action) */}
          <Button 
            onClick={handleQuickDemo}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 shadow-md shadow-blue-600/20 flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300 animate-pulse" />
            )}
            Quick Demo Access (Student Juror)
          </Button>

          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/80" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-card px-2 text-muted-foreground font-semibold">Or use email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="modal-email" className="text-xs font-semibold">Student Email</Label>
              <Input 
                id="modal-email" 
                type="email" 
                placeholder="student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-muted/20 h-9 border-border/80 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="modal-password" className="text-xs font-semibold">Password</Label>
              <Input 
                id="modal-password" 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-muted/20 h-9 border-border/80 focus:ring-blue-500"
              />
            </div>
            <Button type="submit" className="w-full h-9 bg-primary text-primary-foreground font-semibold" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLogin ? 'Sign In with Credentials' : 'Register Account'}
            </Button>
          </form>

          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/80" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-card px-2 text-muted-foreground font-semibold">Or OAuth</span>
            </div>
          </div>

          <Button variant="outline" className="w-full h-9" onClick={handleGoogleSignIn} disabled={isLoading}>
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
            </svg>
            Continue with Google
          </Button>

          <div className="pt-2 text-center">
            <button 
              type="button"
              className="text-xs text-muted-foreground hover:text-blue-600 font-semibold underline underline-offset-4" 
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Need a new account? Register" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
