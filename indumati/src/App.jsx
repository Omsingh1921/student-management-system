import { Suspense, lazy, useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Loader } from './components/Loader';
import { ErrorBoundary } from './components/ErrorBoundary';

const Login          = lazy(() => import('./pages/Auth/Login'));
const ForgotPassword = lazy(() => import('./pages/Auth/ForgotPassword'));
const Dashboard      = lazy(() => import('./pages/Dashboard'));
const Students       = lazy(() => import('./pages/Students'));
const StudentDetails = lazy(() => import('./pages/StudentDetails'));
const Teachers       = lazy(() => import('./pages/Teachers'));
const Courses        = lazy(() => import('./pages/Courses'));
const Enrollment     = lazy(() => import('./pages/Enrollment'));
const Departments    = lazy(() => import('./pages/Departments'));
const Attendance     = lazy(() => import('./pages/Attendance'));
const Grades         = lazy(() => import('./pages/Grades'));
const Profile        = lazy(() => import('./pages/Profile'));
const Promotion      = lazy(() => import('./pages/Promotion'));

// Decode JWT and check if it is expired (no library needed)
function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // exp is in seconds, Date.now() is in milliseconds
    return payload.exp * 1000 < Date.now();
  } catch {
    return true; // treat malformed token as expired
  }
}

function App() {
  const { token, logout } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!token) {
      setReady(true);
      return;
    }

    // Check expiry locally — no network call needed
    if (isTokenExpired(token)) {
      logout(); // clears localStorage + store
    }

    setReady(true);
  }, []);

  if (!ready) return <Loader />;

  return (
    <ErrorBoundary>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route path="/" element={<ProtectedRoute authenticated={!!token} />}>
            <Route element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />

              <Route
                path="students"
                element={
                  <ProtectedRoute authenticated={!!token} allowedRoles={['ADMIN', 'TEACHER']}>
                    <Students />
                  </ProtectedRoute>
                }
              />
              <Route path="students/:id" element={<StudentDetails />} />

              <Route
                path="teachers"
                element={
                  <ProtectedRoute authenticated={!!token} allowedRoles={['ADMIN']}>
                    <Teachers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="departments"
                element={
                  <ProtectedRoute authenticated={!!token} allowedRoles={['ADMIN']}>
                    <Departments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="promotion"
                element={
                  <ProtectedRoute authenticated={!!token} allowedRoles={['ADMIN']}>
                    <Promotion />
                  </ProtectedRoute>
                }
              />
              <Route
                path="courses"
                element={
                  <ProtectedRoute authenticated={!!token} allowedRoles={['ADMIN', 'TEACHER']}>
                    <Courses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="enrollment"
                element={
                  <ProtectedRoute authenticated={!!token} allowedRoles={['ADMIN', 'STUDENT']}>
                    <Enrollment />
                  </ProtectedRoute>
                }
              />

              <Route path="attendance" element={<Attendance />} />
              <Route path="grades" element={<Grades />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to={token ? '/dashboard' : '/login'} replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
