import { NavLink } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';

const navItemsByRole = {
  admin: [
    { label: 'Dashboard', path: '/dashboard', icon: '🏠' },
    { label: 'Students', path: '/students', icon: '🎓' },
    { label: 'Teachers', path: '/teachers', icon: '' },
    { label: 'Courses', path: '/courses', icon: '📚' },
    { label: 'Enrollment', path: '/enrollment', icon: '📝' },
    { label: 'Departments', path: '/departments', icon: '🏛️' },
    { label: 'Attendance', path: '/attendance', icon: '🗓️' },
    { label: 'Grades', path: '/grades', icon: '📝' },
    { label: 'Promotion', path: '/promotion', icon: '🚀' },
    { label: 'Profile', path: '/profile', icon: '👤' }
  ],
  teacher: [
    { label: 'Dashboard', path: '/dashboard', icon: '🏠' },
    { label: 'Students', path: '/students', icon: '🎓' },
    { label: 'Courses', path: '/courses', icon: '📚' },
    { label: 'Attendance', path: '/attendance', icon: '🗓️' },
    { label: 'Grades', path: '/grades', icon: '📝' },
    { label: 'Profile', path: '/profile', icon: '👤' }
  ],
  student: [
    { label: 'Dashboard', path: '/dashboard', icon: '🏠' },
    { label: 'Enrollment', path: '/enrollment', icon: '📝' },
    { label: 'Attendance', path: '/attendance', icon: '🗓️' },
    { label: 'Grades', path: '/grades', icon: '📝' },
    { label: 'Profile', path: '/profile', icon: '👤' }
  ]
};


export function Sidebar({ onLogout }) {
  const { theme, setTheme } = useTheme();
  const { user } = useAuthStore();
  const role = user?.role?.toLowerCase() || 'student';
  const navItems = navItemsByRole[role] || navItemsByRole.student;

  return (
    <aside className="flex h-full min-h-screen w-72 flex-col gap-6 border-r border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950 md:w-80">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="mt-1 flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-500/20 to-indigo-500/20 ring-1 ring-sky-200/30 dark:ring-slate-800/60">
            <img
              src="/images/original-d871ef0e27a4bd76a8321468f6658fab.webp"
              alt="Student management logo"
              className="h-10 w-10 rounded-2xl object-cover"
              loading="eager"
            />
          </div>

          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Student Management</p>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">AND TRACKING SYSTEM</h1>
          </div>
        </div>

        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="flex items-center justify-between rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
        >
          <span>Dark mode</span>
          <span>{theme === 'dark' ? '🌙' : '☀️'}</span>
        </button>
      </div>
      <nav className="flex flex-1 flex-col gap-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium transition ${
                isActive ? 'bg-sky-600 text-white' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`
            }
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
        <p className="font-semibold text-slate-900 dark:text-slate-100">{user?.email || 'Signed in'}</p>
        <p className="mt-2">Manage students, attendance, grades, and more.</p>
      </div>
      <button onClick={onLogout} className="rounded-3xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700">
        Logout
      </button>
    </aside>
  );
}
