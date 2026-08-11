import React from 'react';
import { Building2 } from 'lucide-react';

export function Hostels() {
  return (
    <div id="hostels-coming-soon" className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center animate-fade-in">
      <div className="space-y-6 max-w-md">
        <div className="inline-flex items-center justify-center p-4 bg-muted/50 dark:bg-muted/10 rounded-2xl border border-border/40 text-muted-foreground shadow-xs">
          <Building2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-heading">
            Coming Soon
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            The Student Hostels & Housing portal is currently under development.
          </p>
        </div>
      </div>
    </div>
  );
}
