import React from 'react';

export function Footer() {
  return (
    <footer className="w-full border-t border-border/60 bg-card/50 backdrop-blur-xs py-6 px-4 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center gap-2 text-center text-xs text-muted-foreground">
        <p className="font-medium text-muted-foreground">
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
  );
}
