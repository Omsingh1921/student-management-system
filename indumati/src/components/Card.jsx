export function Card({ children, className = '' }) {
  return (
    <div className={`rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft shadow-slate-200/60 transition dark:border-slate-800 dark:bg-slate-900 ${className}`}>
      {children}
    </div>
  );
}
