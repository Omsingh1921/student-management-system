import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useAuthStore } from '../stores/authStore';

export default function Profile() {
  const { user } = useAuthStore();
  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [grades, setGrades] = useState([]);
  const [activeSection, setActiveSection] = useState('attendance');

  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);

  const isStudent = user?.role?.toLowerCase() === 'student';

  function getCourseLabel(record) {
    const courseFromRecord = record?.course;
    const direct = courseFromRecord?.name || courseFromRecord?.title || courseFromRecord?.code;
    if (direct) return direct;

    const fromRecordFields = record?.courseName || record?.courseTitle || record?.courseCode;
    if (fromRecordFields) return fromRecordFields;

    const courseId = record?.courseId ?? courseFromRecord?.id;
    if (courseId != null) {
      const match = courses.find((c) => String(c.id) === String(courseId));
      return match?.name || match?.title || `Course ${courseId}`;
    }

    return 'Course';
  }

  const enrolledCourseIds = useMemo(() => {
    return new Set(
      enrollments
        .map((e) => e?.courseId ?? e?.course?.id ?? e?.course?.courseId ?? e?.courseId)
        .filter((id) => id != null)
        .map((id) => String(id))
    );
  }, [enrollments]);

  const remainingEnrollSlots = useMemo(() => {
    return Math.max(0, 3 - enrolledCourseIds.size);
  }, [enrolledCourseIds]);

  async function loadEnrollments(studentId) {
    try {
      const response = await api.get(`/enrollments/student/${studentId}?page=0&size=50`);
      const data = response.data;
      const content = Array.isArray(data) ? data : data?.content || data?.data || [];
      setEnrollments(content);
    } catch (error) {
      // Enrollment is optional for UI, so don’t hard-fail entire profile
      setEnrollments([]);
    }
  }

  useEffect(() => {
    if (!user?.id) return;

    async function loadProfile() {
      try {
        const [studentRes, attendanceRes, gradesRes, coursesRes] = await Promise.all([
          api.get(`/students/${user.id}`),
          api.get(`/attendance/student/${user.id}?page=0&size=10`),
          api.get(`/grades/student/${user.id}?page=0&size=10`),
          api.get('/courses?page=0&size=50&sortBy=id&direction=asc')
        ]);
        setStudent(studentRes.data);
        setAttendance(attendanceRes.data.content || []);
        setGrades(gradesRes.data.content || []);
        setCourses(coursesRes.data.content || coursesRes.data || []);

        if (isStudent) {
          await loadEnrollments(user.id);
        }
      } catch (error) {
        toast.error('Unable to load profile');
      }
    }

    loadProfile();
  }, [user, isStudent]);

  async function addCourse() {
    if (!isStudent) return;
    if (!selectedCourseId) return toast.error('Please select a course');

    const courseId = Number(selectedCourseId);
    if (!Number.isFinite(courseId) || courseId <= 0) {
      return toast.error('Invalid course');
    }

    if (enrolledCourseIds.has(String(courseId))) {
      return toast.error('Already enrolled in this course');
    }

    if (remainingEnrollSlots <= 0) {
      return toast.error('You can enroll in up to 3 courses');
    }

    setEnrollmentLoading(true);
    try {
      await api.post('/enrollments', {
        studentId: Number(user.id),
        courseId
      });

      toast.success('Course enrolled successfully');
      setSelectedCourseId('');
      await loadEnrollments(user.id);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to enroll');
    } finally {
      setEnrollmentLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">My Profile</p>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">{student?.name || user?.email}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Role: {user?.role}</p>

          {isStudent ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Recommended: Improve weak subjects and maintain attendance for this term.
            </p>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Recommended: Review student performance and update attendance/grades regularly.
            </p>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
          {isStudent ? (
            <>
              <p className="text-sm text-slate-500 dark:text-slate-400">Enrollment</p>
              <p className="mt-3 text-lg font-semibold text-slate-900 dark:text-slate-100">{student?.enrollmentYear || 'N/A'}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Batch: {student?.departmentId || 'N/A'}</p>
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                Tip: Your attendance and grades are shown below.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-slate-500 dark:text-slate-400">Summary</p>
              <p className="mt-3 text-lg font-semibold text-slate-900 dark:text-slate-100">Dashboard view</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Use the sidebar to manage students/courses.</p>
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                Tip: Attendance/Grades tabs are primarily for students.
              </p>
            </>
          )}
        </div>
      </Card>

      {isStudent && (
        <Card>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Enrolled Courses</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  You can manually enroll up to <span className="font-semibold text-sky-700 dark:text-sky-300">3</span> courses.
                </p>
              </div>
              <div className="rounded-2xl bg-sky-50 px-4 py-2 text-sm text-sky-700 ring-1 ring-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:ring-sky-900">
                Slots left: <span className="font-semibold">{remainingEnrollSlots}</span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_320px] md:items-start">
              <div className="space-y-3">
                {enrollments.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">No courses enrolled yet.</p>
                ) : (
                  enrollments.map((en) => (
                    <div
                      key={en.id ?? `${en.courseId ?? en.course?.id}`}
                      className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900"
                    >
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{getCourseLabel(en)}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Enrollment ID: {en.id ?? 'N/A'}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                <label className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  Course
                  <input
                    type="text"
                    placeholder={remainingEnrollSlots > 0 ? 'Search courses...' : 'Course limit reached'}
                    list="courseListProfileEnroll"
                    value={selectedCourseId}
                    disabled={remainingEnrollSlots <= 0 || enrollmentLoading}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                  <datalist id="courseListProfileEnroll">
                    <option value="">Choose course</option>
                    {courses
                      .filter((c) => !enrolledCourseIds.has(String(c.id)))
                      .map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.name || course.title || course.code}
                        </option>
                      ))}
                  </datalist>
                </label>

                <Button
                  variant="primary"
                  onClick={addCourse}
                  disabled={enrollmentLoading || remainingEnrollSlots <= 0 || !selectedCourseId}
                >
                  {enrollmentLoading ? 'Enrolling...' : 'Add Course'}
                </Button>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Only courses not already enrolled are shown.
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <div className="flex flex-wrap gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
          <button
            className={`rounded-3xl px-5 py-3 text-sm font-semibold ${activeSection === 'attendance' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}
            onClick={() => setActiveSection('attendance')}
          >
            Attendance
          </button>
          <button
            className={`rounded-3xl px-5 py-3 text-sm font-semibold ${activeSection === 'grades' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}
            onClick={() => setActiveSection('grades')}
          >
            Grades
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {activeSection === 'attendance' ? (
            <div className="grid gap-4">
              {attendance.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">No attendance data available yet.</p>
              ) : (
                attendance.map((record) => (
                  <div
                    key={record.id}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{getCourseLabel(record)}</p>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          record.status === 'Present' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {record.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{record.date}</p>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {grades.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">No grades recorded yet.</p>
              ) : (
                grades.map((grade) => (
                  <div
                    key={grade.id}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{grade.courseId || 'Course'}</p>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {grade.letterGrade || 'Pending'}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Marks: {grade.marksObtained ?? 'N/A'}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

