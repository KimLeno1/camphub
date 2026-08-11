import React from 'react';
import { Bell, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useAuthStore } from '../../store/authStore';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { getAuth, signOut } from 'firebase/auth';
import { app } from '../../lib/firebase';

export function Header() {
  const { profile, user, openAuthModal } = useAuthStore();

  const handleSignOut = () => {
    signOut(getAuth(app));
  };

  const navigate = useNavigate();

  return (
    <header className="h-16 border-b border-border bg-card/60 backdrop-blur-md flex items-center justify-between px-4 md:px-6 shrink-0 sticky top-0 z-10">
      <div className="flex items-center flex-1">
        <div className="flex items-center gap-2 md:hidden mr-3">
          <div className="w-7 h-7 bg-blue-600 rounded-xl flex items-center justify-center shadow-xs">
            <span className="text-white font-extrabold text-xs leading-none">C7</span>
          </div>
          <span className="font-heading font-extrabold text-base tracking-tight text-foreground">Center7</span>
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3">
        {user ? (
          <>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground relative"
              onClick={() => navigate('/notifications')}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full border-2 border-card" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger className="relative h-9 w-9 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500">
                <Avatar className="h-9 w-9 border border-border">
                  <AvatarImage src={profile?.avatarUrl || user?.photoURL || ''} alt="Avatar" />
                  <AvatarFallback className="bg-blue-100 text-blue-700 font-bold dark:bg-blue-950 dark:text-blue-300">
                    {profile?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold leading-none">{profile?.displayName || 'Student'}</p>
                    <p className="text-xs leading-none text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/events')}>Events Calendar</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>Settings</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/security')}>Security & Keys</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:bg-destructive/10">
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <span className="hidden lg:inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full border border-border/50">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> Guest Access Mode
            </span>
            <Button 
              onClick={openAuthModal}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-9 px-4 text-xs shadow-sm shadow-blue-600/20 gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" /> Sign In / Demo
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}

