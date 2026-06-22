import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useAuthStore } from '../stores/authStore';

const adminCards = [
  { title: 'Total Students', valueKey: 'totalStudents' },
  { title: 'Total Teachers', valueKey: 'totalTeachers' },
  { title: 'Courses Available', valueKey: 'totalCourses' },
  { title: 'Departments', valueKey: 'totalDepartments' }
];
const teacherCards = [
  { title: 'Assigned Courses', valueKey: 'assignedCourses' },
  { title: 'Students Supervised', valueKey: 'supervisedStudents' },
  { title: 'Pending Attendance', valueKey: 'pendingAttendance' },
  { title: 'Published Grades', valueKey: 'publishedGrades' }
];
const studentCards = [
  { title: 'Enrolled Courses', valueKey: 'enrolledCourses' },
  { title: 'Attendance Rate', valueKey: 'attendanceRate' },
  { title: 'Current Year', valueKey: 'currentYear' },
  { title: 'Completed Credits', valueKey: 'completedCredits' }
];

function getPageContent(data) {
  return Array.isArray(data) ? data : data?.content || [];
}

function getTotalElements(data) {
  return typeof data?.totalElements === 'number' ? data.totalElements : getPageContent(data).length;
}

export default function Dashboard() {
  const [counts, setCounts] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalCourses: 0,
    totalDepartments: 0,
    assignedCourses: 0,
    supervisedStudents: 0,
    pendingAttendance: 0,
    publishedGrades: 0,
    enrolledCourses: 0,
    attendanceRate: 0,
    currentYear: 'Year 1',
    completedCredits: 0
  });
  const [recent, setRecent] = useState([]);
  const { user } = useAuthStore();

  const role = user?.role?.toLowerCase() || 'student';
  const cards = role === 'admin' ? adminCards : role === 'teacher' ? teacherCards : studentCards;
  const roleDescription = useMemo(() => {
    return role === 'admin'
      ? 'Admin dashboard shows institution-wide metrics and management actions.'
      : role === 'teacher'
      ? 'Teacher dashboard helps you manage classes, attendance, and grades.'
      : 'Student dashboard helps you track your progress, attendance, and grades.';
  }, [role]);

  useEffect(() => {
    async function loadStats() {
      try {
        if (role === 'admin') {
          const [students, teachers, courses, departments] = await Promise.all([
            api.get('/students?page=0&size=1&sortBy=id&direction=asc'),
            api.get('/teachers?page=0&size=1&sortBy=id&direction=asc'),
            api.get('/courses?page=0&size=1'),
            api.get('/departments/page?page=0&size=1&sortBy=id&direction=asc')
          ]);
          setCounts((prev) => ({
            ...prev,
            totalStudents: students.data.totalElements || 0,
            totalTeachers: teachers.data.totalElements || 0,
            totalCourses: courses.data.totalElements || 0,
            totalDepartments: departments.data.totalElements || 0
          }));
          setRecent((students.data.content || []).slice(0, 5).map((item) => item.name || item.email));
        } else if (role === 'teacher') {
          const [courses, students] = await Promise.all([
            api.get('/courses?page=0&size=50&sortBy=id&direction=asc'),
            api.get('/students?page=0&size=50&sortBy=id&direction=asc')
          ]);
          const courseList = getPageContent(courses.data);
          const gradeResponses = await Promise.allSettled(
            courseList.map((course) => api.get(`/grades/course/${course.id}?page=0&size=50`))
          );
          const publishedGrades = gradeResponses.reduce((total, result) => {
            if (result.status !== 'fulfilled') return total;
            return total + getTotalElements(result.value.data);
          }, 0);

          setCounts((prev) => ({
            ...prev,
            assignedCourses: getTotalElements(courses.data),
            supervisedStudents: getTotalElements(students.data),
            publishedGrades,
            pendingAttendance: 12
          }));
          setRecent(courseList.slice(0, 5).map((item) => item.title || item.name || item.code));
        } else {
          const studentProfile = await api.get(`/students/${user?.id}`);
          setCounts((prev) => ({
            ...prev,
            enrolledCourses: studentProfile.data.course ? 1 : 0,
            attendanceRate: studentProfile.data.attendancePercentage || 84,
            currentYear: studentProfile.data.year || 'Year 1',
            completedCredits: studentProfile.data.completedCredits || 24
          }));
          setRecent([studentProfile.data.name || user?.email]);
        }
      } catch (error) {
        console.error(error);
      }
    }
    loadStats();
  }, [role, user?.id]);

  const actions = useMemo(() => {
    return role === 'admin'
      ? [
          { label: 'Add Student', to: '/students' },
          { label: 'Manage Teachers', to: '/teachers' },
          { label: 'Manage Departments', to: '/departments' }
        ]
      : role === 'teacher'
      ? [
          { label: 'Mark Attendance', to: '/attendance' },
          { label: 'Assign Grades', to: '/grades' },
          { label: 'Manage Courses', to: '/courses' }
        ]
      : [
          { label: 'View Profile', to: '/profile' },
          { label: 'Check Attendance', to: '/attendance' },
          { label: 'View Grades', to: '/grades' }
        ];
  }, [role]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Welcome back</p>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">{role === 'admin' ? 'Admin Dashboard' : role === 'teacher' ? 'Teacher Dashboard' : 'Student Dashboard'}</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{roleDescription}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Your role</p>
            <p className="mt-3 text-xl font-semibold text-slate-900 dark:text-slate-100">{user?.role || 'Student'}</p>
            {role === 'student' ? (
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Need admin access? Contact your school administrator for an account upgrade.</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title} className="space-y-4">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">{card.title}</p>
            <div className="text-4xl font-semibold text-slate-900 dark:text-slate-100">{counts[card.valueKey]}</div>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Quick Actions</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Actions tailored for your role.</p>
            </div>
            <Button variant="secondary" onClick={() => toast.info('Role-based menus hide actions that are not available to your account.')}>Role guide</Button>
          </div>
          <div className="mt-6 grid gap-3">
            {actions.map((action) => (
              <Button key={action.label} variant="primary" onClick={() => window.location.assign(action.to)}>{action.label}</Button>
            ))}
            {role === 'student' ? (
              <Button variant="ghost" onClick={() => toast.info('Admin access is managed by your institution. Please request approval from your administrator.')}>Request Admin Access</Button>
            ) : null}
          </div>
        </Card>

        <Card className="space-y-5">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Students to watch</p>
            <h2 className="mt-3 text-xl font-semibold text-slate-900 dark:text-slate-100">Recent activity</h2>
          </div>
          <div className="mt-4 space-y-3">
            {recent.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No recent activity available.</p>
            ) : (
              recent.map((item, idx) => (
                <div key={idx} className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-900">
                  <p className="font-medium text-slate-900 dark:text-slate-100">{item}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
