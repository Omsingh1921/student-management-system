import { useMemo } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuthStore } from '../stores/authStore';
import { motion } from 'framer-motion';
import { BackgroundShell } from './BackgroundShell';


export function Layout() {
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const welcomeMessage = useMemo(() => {
    if (!user) return 'Welcome back';
    return `Welcome, ${user.email}`;
  }, [user]);

  return (
    <BackgroundShell>
      <div className="flex min-h-screen">

        <Sidebar onLogout={handleLogout} />
        <main className="flex-1 p-6 md:p-8">
          <div className="mb-6 flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{welcomeMessage}</p>
                <h2 className="text-2xl font-semibold">STUDENT MANAGEMENT AND TRACKING SYSTEM</h2>
              </div>
            </div>
          </div>
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Outlet />
          </motion.div>
        </main>
      </div>
    </BackgroundShell>
  );
}

