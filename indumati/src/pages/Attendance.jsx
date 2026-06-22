import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuthStore } from '../stores/authStore';

const STATUS_OPTIONS = ['Present', 'Absent', 'On Leave'];

function getPageContent(data) {
  return Array.isArray(data) ? data : data?.content || data?.data || [];
}

export default function Attendance() {
  const { user } = useAuthStore();
  const role = user?.role?.toLowerCase();
  const isTeacher = role === 'teacher';
  const isStudent = role === 'student';
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [studentAttendance, setStudentAttendance] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isStudent) {
      return;
    }

    async function loadCourses() {
      try {
        const response = await api.get('/courses?page=0&size=50&sortBy=id&direction=asc');
        setCourses(getPageContent(response.data));
      } catch (error) {
        toast.error('Could not load courses');
      }
    }
    loadCourses();
  }, [isStudent]);

  useEffect(() => {
    if (!isStudent) {
      if (!selectedCourse) {
        setStudents([]);
        return;
      }

      async function loadStudents() {
        setLoading(true);
        try {
          let enrolled = [];
          let response;
          try {
            response = await api.get(`/courses/${selectedCourse}/students`);
            enrolled = getPageContent(response.data);
          } catch (error) {
            if (error.response?.status === 404) {
              response = await api.get(`/enrollments/course/${selectedCourse}?page=0&size=100`);
              const enrollments = getPageContent(response.data);
              enrolled = enrollments.map((enrollment) => ({
                id: enrollment.studentId || enrollment.student?.id,
                name: enrollment.studentName || enrollment.student?.name,
                rollNumber: enrollment.studentRollNumber || enrollment.student?.rollNumber || enrollment.rollNumber,
                course: courses.find((course) => String(course.id) === String(selectedCourse))?.name || 'Unknown'
              }));
            } else {
              throw error;
            }
          }

          setStudents(enrolled.map((student) => ({
            ...student,
            course: student.course || courses.find((course) => String(course.id) === String(selectedCourse))?.name || 'Unknown'
          })));
          const initial = {};
          enrolled.forEach((student) => {
            if (student?.id != null) {
              initial[student.id] = 'Present';
            }
          });
          setAttendanceRecords(initial);
        } catch (error) {
          console.error('Failed loading students for attendance:', error);
          const status = error.response?.status;
          const message = error.response?.data?.message || error.message || 'Could not load enrolled students';
          toast.error(status ? `${status}: ${message}` : message);
          setStudents([]);
        } finally {
          setLoading(false);
        }
      }

      loadStudents();
    }
  }, [selectedCourse, courses, isStudent]);

  useEffect(() => {
    if (!isStudent) {
      return;
    }

    async function loadStudentAttendance() {
      setLoading(true);
      try {
        const response = await api.get(`/attendance/student/${user?.id}?page=0&size=10`);
        setStudentAttendance(response.data.content || response.data || []);
      } catch (error) {
        console.error('Failed loading student attendance:', error);
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message || 'Could not load your attendance';
        toast.error(status ? `${status}: ${message}` : message);
      } finally {
        setLoading(false);
      }
    }

    loadStudentAttendance();
  }, [isStudent, user?.id]);

  async function submitAttendance() {
    if (!selectedCourse) {
      return toast.error('Please select a course');
    }
    if (!isTeacher) {
      return toast.error('Only teachers can mark attendance.');
    }
    if (!date) {
      return toast.error('Please select a date');
    }
    try {
      setLoading(true);
      const promises = students.map((student) => {
        if (!student?.id) {
          console.warn('Student missing ID:', student);
          return Promise.reject(new Error(`Student ${student?.name || 'Unknown'} has no ID`));
        }
        return api.post('/api/attendance', {
          studentId: Number(student.id),
          courseId: Number(selectedCourse),
          date: date, // LocalDate format: YYYY-MM-DD
          status: attendanceRecords[student.id] || 'Present'
        });
      });
      await Promise.all(promises);
      toast.success('Attendance marked successfully');
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Unable to save attendance';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  const columns = useMemo(
    () => [
      { Header: 'Student', accessor: 'name' },
      { Header: 'Course', accessor: 'course' },
      { Header: 'Status', accessor: 'status' }
    ],
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Attendance</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isTeacher
              ? 'Mark attendance for students enrolled in a selected course.'
              : isStudent
              ? 'View your attendance records and course participation.'
              : 'View attendance reports for courses.'}
          </p>
        </div>
      </div>

      {isStudent ? (
        <Card className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Your Attendance Records</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Only your own attendance is visible here.</p>
          </div>
          {loading ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Loading records...</p>
          ) : studentAttendance.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No attendance records found.</p>
          ) : (
            <div className="grid gap-4">
              {studentAttendance.map((record) => (
                <div key={record.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{record.course?.name || record.course?.title || record.courseName || record.course?.code || record.courseId || 'Course'}</p>

                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${record.status === 'Present' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {record.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{record.date}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
          <Card className="space-y-4">
            {/* Attendance Overview for Course */}
            {selectedCourse && (
              <div className="rounded-3xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-900 dark:bg-sky-950">
                <p className="text-sm font-semibold text-sky-700 dark:text-sky-300">Course Selected: {courses.find(c => String(c.id) === String(selectedCourse))?.name || 'Unknown Course'}</p>
                <p className="mt-1 text-xs text-sky-600 dark:text-sky-400">Students in course: {students.length}</p>
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                Select Course
                <input
                  type="text"
                  placeholder="Search courses..."
                  list="courseListAttendance"
                  value={selectedCourse}
                  onChange={(event) => setSelectedCourse(event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
                <datalist id="courseListAttendance">
                  <option value="">Choose course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>{course.name || course.title}</option>
                  ))}
                </datalist>
              </label>
              <Input label="Date" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            </div>
            <div className="grid gap-4">
              {students.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">Select a course to load enrolled students.</p>
              ) : (
                students.map((student) => (
                  <div key={student.id} className="grid gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-[1fr_auto]">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{student.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Roll No: {student.rollNumber || 'N/A'}</p>
                    </div>
                    <select
                      value={attendanceRecords[student.id] || 'Present'}
                      onChange={(event) => setAttendanceRecords((prev) => ({ ...prev, [student.id]: event.target.value }))}
                      disabled={!isTeacher}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none disabled:cursor-not-allowed dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                ))
              )}
            </div>
            <div className="flex justify-end">
              <Button variant="primary" onClick={submitAttendance} disabled={loading || students.length === 0 || !isTeacher}>
                {isTeacher ? (loading ? 'Submitting...' : 'Submit Attendance') : 'Teachers only'}
              </Button>
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Attendance Overview</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {isTeacher
                ? 'Teachers can mark attendance for the selected course.'
                : 'Admins can view attendance lists, teachers can mark attendance.'}
            </p>
            <div className="mt-6 space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm text-slate-500 dark:text-slate-400">Important</p>
                <p className="mt-2 text-slate-900 dark:text-slate-100">Only teacher accounts may submit attendance.</p>
              </div>
              {!isTeacher ? (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Note</p>
                  <p className="mt-2 text-slate-900 dark:text-slate-100">Please use a teacher account if you need to mark attendance.</p>
                </div>
              ) : null}
            </div>
          </Card>
        </div>
      )}

      <Card>
        <p className="text-sm text-slate-500 dark:text-slate-400">Attendance records are saved to the backend and visible in student profiles.</p>
      </Card>
    </div>
  );
}
