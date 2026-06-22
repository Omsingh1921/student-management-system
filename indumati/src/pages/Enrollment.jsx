import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Modal } from '../components/Modal';
import { useAuthStore } from '../stores/authStore';

function getPageContent(data) {
  if (Array.isArray(data)) return data;
  return data?.content || data?.data || data?.courses || data?.items || [];
}

function getCourseName(course) {
  return course?.name || course?.title || course?.code || `Course ${course?.id || ''}`;
}

function getEnrollmentStatus(enrollment) {
  return enrollment?.status || (enrollment?.active === false ? 'Cancelled' : 'Approved');
}

function getEnrollmentDate(enrollment) {
  return enrollment?.enrollmentDate || enrollment?.createdAt || enrollment?.date || '';
}

function normalizeDepartmentId(obj) {
  if (!obj) return null;
  return (
    obj?.departmentId ??
    obj?.DepartmentId ??
    obj?.department_id ??
    obj?.department?.id ??
    obj?.department?.DepartmentId ??
    obj?.department?.departmentId ??
    null
  );
}

function normalizeTeacherId(obj) {
  if (!obj) return null;
  return obj?.id ?? obj?.teacherId ?? obj?.teacher_id ?? obj?.userId ?? obj?.user?.id ?? null;
}

export default function Enrollment() {
  const { user } = useAuthStore();
  const role = user?.role?.toLowerCase();

  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);

  const [student, setStudent] = useState(null);
  const [myEnrollments, setMyEnrollments] = useState([]);


  // Department-first enrollment form
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');

  const availableCourses = useMemo(() => {
    if (!selectedDepartmentId) return [];
    return courses.filter((course) => {
      const depId = normalizeDepartmentId(course);
      return depId != null && String(depId) === String(selectedDepartmentId);
    });
  }, [courses, selectedDepartmentId]);

  async function loadDepartments() {
    // Use paged endpoint (consistent with other pages)
    const res = await api.get('/departments/page?page=0&size=100&sortBy=id&direction=asc');
    setDepartments(res.data.content || []);
  }

  async function loadCourses() {
    const res = await api.get('/courses?page=0&size=100&sortBy=id&direction=asc');
    const list = getPageContent(res.data);
    setCourses(list);
  }

  async function loadMyEnrollments() {
    if (!user?.id) return;
    try {
      const res = await api.get(`/enrollments/student/${user.id}?page=0&size=100`);
      setMyEnrollments(res.data.content || res.data || []);
    } catch {
      setMyEnrollments([]);
    }
  }

  async function loadStudent() {

    // Student id is same as auth.user.id in this project
    const res = await api.get(`/students/${user?.id}`);
    setStudent(res.data);

    // Preselect student's current department if available
    const deptId = res.data?.departmentId ?? res.data?.department?.id ?? res.data?.department_id ?? '';
    if (deptId) {
      setSelectedDepartmentId(String(deptId));
    }
  }

  async function submitEnrollment() {
    if (role !== 'student') {
      toast.error('Enrollment is available for students only');
      return;
    }
    if (!user?.id) {
      toast.error('Student account not found');
      return;
    }
    if (!selectedDepartmentId) {
      toast.error('Select department first');
      return;
    }
    if (!selectedCourseId) {
      toast.error('Select course');
      return;
    }
    if (!availableCourses.some((c) => String(c.id) === String(selectedCourseId))) {
      toast.error('Selected course does not belong to the chosen department');
      return;
    }

    setLoading(true);
    try {
      // NOTE:
      // Backend appears to deny STUDENT role access to updating `/students/{id}` (403 in logs).
      // Enrollment should be created without forcing a department update.


      // API #2: enroll student into course
      await api.post('/enrollments', {
        studentId: Number(user.id),
        courseId: Number(selectedCourseId)
      });

      toast.success('Enrollment successful');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Enrollment failed');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        await Promise.all([loadDepartments(), loadCourses(), loadStudent(), loadMyEnrollments()]);

      } catch (e) {
        toast.error(e?.response?.data?.message || 'Failed to load enrollment page');
      } finally {
        setLoading(false);
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // when department changes, clear course
    setSelectedCourseId('');
  }, [selectedDepartmentId]);

  return (
    <div className="space-y-5">
      <Card className="p-0">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Self Enrollment</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Select department first, then choose a course.</p>
            </div>
          </div>
        </div>

        <div className="space-y-5 bg-slate-50 p-5 dark:bg-slate-950">
          {role !== 'student' ? (
            <p className="text-sm text-rose-600 dark:text-rose-400">Enrollment is available to students only.</p>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                Department
                <select
                  value={selectedDepartmentId}
                  onChange={(e) => setSelectedDepartmentId(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                >
                  <option value="">Select department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                Course
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  disabled={!selectedDepartmentId || availableCourses.length === 0}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                >
                  <option value="">
                    {!selectedDepartmentId
                      ? 'Select department first'
                      : availableCourses.length === 0
                      ? 'No courses in this department'
                      : 'Select course'}
                  </option>
                  {availableCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {getCourseName(c)}
                    </option>
                  ))}
                </select>
              </label>

              <div className="lg:col-span-2 flex flex-wrap items-center justify-end gap-3">
                <Button
                  variant="primary"
                  onClick={submitEnrollment}
                  disabled={loading || !selectedDepartmentId || !selectedCourseId || availableCourses.length === 0}
                >
                  {loading ? 'Submitting...' : 'Enroll Me'}
                </Button>
              </div>

              {myEnrollments?.length > 0 ? (
                <div className="lg:col-span-2 mt-2">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">You are already enrolled in:</p>
                  <div className="mt-3 grid gap-3">
                    {myEnrollments.map((e) => (
                      <div
                        key={e.id}
                        className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">
                              {(() => {
                                // Prefer explicit course name/title/code; avoid showing id-only
                                const courseObj = e.course || null;
                                const courseName = courseObj?.name || courseObj?.title || courseObj?.code || e.courseName;
                                if (courseName) return courseName;
                                if (e.course?.id != null) return getCourseName(e.course);
                                return 'Course';
                              })()}
                            </p>

                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                              Dept: {e.department?.name || e.departmentName || e.department?.id || e.course?.department?.name || e.course?.departmentName || e.course?.departmentId || 'N/A'}

                            </p>
                          </div>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {getEnrollmentStatus(e)}
                          </span>
                        </div>

                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                          {getEnrollmentDate(e) ? `Enrolled on: ${getEnrollmentDate(e)}` : 'Enrollment date not available'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="lg:col-span-2 text-xs text-slate-500 dark:text-slate-400">
                  You are not enrolled in any course yet.
                </div>
              )}

              {student?.departmentName || student?.department ? (
                <div className="lg:col-span-2 text-xs text-slate-500 dark:text-slate-400">
                  Your enrollment is submitted for the selected course.
                </div>
              ) : null}

            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

