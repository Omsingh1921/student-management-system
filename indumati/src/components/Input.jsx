import { forwardRef } from 'react';

export const Input = forwardRef(({ label, error, className = '', ...props }, ref) => {
  return (
    <label className={`space-y-2 text-sm ${className}`}>
      {label ? <span className="font-medium text-slate-700 dark:text-slate-200">{label}</span> : null}
      <input
        ref={ref}
        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400 dark:focus:ring-sky-900"
        {...props}
      />
      {error ? <p className="text-xs text-rose-500">{error}</p> : null}
    </label>
  );
});
Input.displayName = 'Input';
