export function BackgroundShell({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {/* soft gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-indigo-50 to-white opacity-90 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />

        {/* subtle grid */}
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(to_right,rgba(2,132,199,0.25)_1px,transparent_1px),linear-gradient(to_bottom,rgba(2,132,199,0.25)_1px,transparent_1px)] [background-size:48px_48px] dark:opacity-10" />

        {/* decorative “image” (inline SVG) */}
        <div className="absolute -right-24 -top-24 h-[320px] w-[320px] blur-3xl">
          <svg viewBox="0 0 200 200" className="h-full w-full opacity-60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="rgb(56 189 248)" stopOpacity="0.45" />
                <stop offset="1" stopColor="rgb(99 102 241)" stopOpacity="0.15" />
              </linearGradient>
            </defs>
            <path d="M48 92C36 64 58 38 90 38C124 38 142 62 130 92C118 122 86 156 70 168C56 156 60 126 48 92Z" fill="url(#g1)" />
            <circle cx="86" cy="88" r="18" fill="rgba(56,189,248,0.35)" />
            <circle cx="120" cy="108" r="10" fill="rgba(99,102,241,0.25)" />
          </svg>
        </div>

        <div className="absolute -left-24 -bottom-24 h-[320px] w-[320px] rounded-full bg-indigo-300/20 blur-3xl dark:bg-indigo-400/10" />

        {/* small hero icon */}
        <div className="absolute left-10 top-20 hidden h-16 w-16 items-center justify-center rounded-3xl border border-sky-200/40 bg-white/60 shadow-sm dark:border-slate-800/50 dark:bg-slate-950/50 sm:flex">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7l10 5 10-5-10-5Z" stroke="rgb(14 165 233)" strokeWidth="1.8" />
            <path d="M2 17l10 5 10-5" stroke="rgb(99 102 241)" strokeWidth="1.8" />
            <path d="M2 12l10 5 10-5" stroke="rgb(56 189 248)" strokeWidth="1.8" />
          </svg>
        </div>
      </div>

      {/* Foreground */}
      <div className="relative">{children}</div>
    </div>
  );
}










