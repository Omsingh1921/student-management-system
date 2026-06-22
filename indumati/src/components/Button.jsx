import { forwardRef } from 'react';
import { motion } from 'framer-motion';

export const Button = forwardRef(({ children, className = '', variant = 'primary', ...props }, ref) => {
  const base = 'inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60';
  const styles = {
    primary: 'bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
    danger: 'bg-rose-600 text-white hover:bg-rose-700',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={`${base} ${styles[variant] ?? styles.primary} ${className}`}
      ref={ref}
      {...props}
    >
      {children}
    </motion.button>
  );
});
Button.displayName = 'Button';
