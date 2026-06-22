import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { getLetterGrade } from '../utils/helpers';
import api from '../services/api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuthStore } from '../stores/authStore';

function getPageContent(data) {
  return Array.isArray(data) ? data : data?.content || data?.data || [];
}

export default function Grades() {
  const { user } = useAuthStore();
  const role = user?.role?.toLowerCase();
  const isTeacher = role === 'teacher';
  const isStudent = role === 'student';
  const isAdmin = role === 'admin';
  const canManageGrades = isTeacher;
  const canViewCourseGrades = isTeacher || isAdmin;

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [gradeInputs, setGradeInputs] = useState({});
  const [studentGrades, setStudentGrades] = useState([]);
  const [loading, setLoading] = useState(false);

  const columns = useMemo(
    () => [
      { Header: 'Student', accessor: 'name' },
      { Header: 'Course', accessor: 'course' },
      { Header: 'Marks', accessor: 'marksObtained' },
      { Header: 'Grade', accessor: 'letterGrade' },
      { Header: 'Status', accessor: 'finalized' },
      {
        Header: 'Actions',
        accessor: 'actions',
        cell: (row) => (
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => finalizeGrade(row)} disabled={!canManageGrades || row.finalized}>
              {row.finalized ? 'Finalized' : 'Finalize'}
            </Button>
          </div>
        )
      }
    ],
    [canManageGrades]
  );

  useEffect(() => {
    if (!isStudent) {
      async function loadCourses() {
        try {
          const response = await api.get('/courses?page=0&size=50&sortBy=id&direction=asc');
          setCourses(getPageContent(response.data));
        } catch (error) {
          toast.error('Unable to load courses');
        }
      }
      loadCourses();
    }
  }, [isStudent]);

  useEffect(() => {
    if (!selectedCourse || !canViewCourseGrades) {
      setStudents([]);
      setGrades([]);
      setGradeInputs({});
      return;
    }

    async function loadCourseData() {
      setLoading(true);
      try {
        const [studentRes, gradeRes] = await Promise.all([
          api.get(`/courses/${selectedCourse}/students`),
          api.get(`/grades/course/${selectedCourse}?page=0&size=50`)
        ]);

        const enrolledStudents = getPageContent(studentRes.data);
        const currentGrades = getPageContent(gradeRes.data);
        const gradeMap = currentGrades.reduce((acc, grade) => {
          acc[grade.studentId] = grade;
          return acc;
        }, {});

        setStudents(enrolledStudents.map((student) => ({
          ...student,
          course: courses.find((course) => String(course.id) === String(selectedCourse))?.name || 'Course'
        })));
        setGrades(currentGrades);
        setGradeInputs(
          enrolledStudents.reduce((acc, student) => {
            const existing = gradeMap[student.id];
            acc[student.id] = {
              marksObtained: existing?.marksObtained || 0,
              letterGrade: existing?.letterGrade || 'F',
              gradeId: existing?.id || null,
              finalized: existing?.finalized || false
            };
            return acc;
          }, {})
        );
      } catch (error) {
        toast.error('Unable to load grade data');
      } finally {
        setLoading(false);
      }
    }

    loadCourseData();
  }, [selectedCourse, courses, canViewCourseGrades]);

  useEffect(() => {
    if (!isStudent) {
      return;
    }

    async function loadStudentGradeData() {
      setLoading(true);
      try {
        const response = await api.get(`/grades/student/${user?.id}?page=0&size=50`);
        setStudentGrades(response.data.content || []);
      } catch (error) {
        toast.error('Unable to load your grades');
      } finally {
        setLoading(false);
      }
    }

    loadStudentGradeData();
  }, [isStudent, user?.id]);

  const tableData = useMemo(
    () => students.map((student) => {
      const input = gradeInputs[student.id] || {};
      return {
        id: student.id,
        name: student.name,
        course: student.course,
        marksObtained: input.marksObtained,
        letterGrade: input.letterGrade,
        finalized: input.finalized ? 'Finalized' : 'Draft',
        actions: { ...student, ...input }
      };
    }),
    [students, gradeInputs]
  );

  const handleGradeChange = (studentId, value) => {
    const marks = Number(value);
    const letterGrade = getLetterGrade(marks);
    setGradeInputs((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        marksObtained: marks,
        letterGrade
      }
    }));
  };

  async function saveGrades() {
    if (!selectedCourse) {
      return toast.error('Select a course first');
    }
    if (!canManageGrades) {
      return toast.error('Only teachers can save grades.');
    }
    try {
      setLoading(true);
      const promises = Object.entries(gradeInputs).map(([studentId, record]) => {
        const payload = {
          studentId,
          courseId: selectedCourse,
          marksObtained: record.marksObtained,
          letterGrade: record.letterGrade
        };
        if (record.gradeId) {
          return api.put(`/grades/${record.gradeId}`, payload);
        }
        return api.post('/grades', payload);
      });
      await Promise.all(promises);
      toast.success('Grades saved successfully');
    } catch (error) {
      toast.error('Unable to save grades');
    } finally {
      setLoading(false);
    }
  }

  async function finalizeGrade(row) {
    if (!canManageGrades) {
      return toast.error('Only teachers can finalize grades.');
    }
    const gradeRecord = gradeInputs[row.id];
    if (!gradeRecord?.gradeId) {
      return toast.error('Save the grade before finalizing');
    }
    try {
      await api.patch(`/grades/${gradeRecord.gradeId}/finalize`);
      toast.success('Grade finalized');
      setGradeInputs((prev) => ({
        ...prev,
        [row.id]: { ...prev[row.id], finalized: true }
      }));
    } catch (error) {
      toast.error('Unable to finalize grade');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Grades</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isTeacher
              ? 'Assign and finalize grades for enrolled students.'
              : isStudent
              ? 'Review your submitted grades for enrolled courses.'
              : 'View grades across the institution.'}
          </p>
        </div>
      </div>

      {isStudent ? (
        <Card className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Your Grades</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Only your grades are visible here.</p>
          </div>
          {loading ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Loading grade records...</p>
          ) : studentGrades.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No grades found yet.</p>
          ) : (
            <div className="space-y-4">
              {studentGrades.map((grade) => (
                <div key={grade.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{grade.courseId || 'Course'}</p>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {grade.letterGrade || 'Pending'}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Marks: {grade.marksObtained ?? 'N/A'}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      ) : (
        <Card className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              Select Course
              <input
                type="text"
                placeholder="Search courses..."
                list="courseListGrades"
                value={selectedCourse}
                onChange={(event) => setSelectedCourse(event.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
              <datalist id="courseListGrades">
                <option value="">Choose course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>{course.name || course.title}</option>
                ))}
              </datalist>
            </label>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm text-slate-500 dark:text-slate-400">Grade Summary</p>
              <p className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">{students.length} enrolled students</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{canManageGrades ? 'You can edit and finalize grades.' : 'Teachers can edit and finalize grades.'}</p>
            </div>
          </div>

          {students.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Choose a course to load enrolled students and view grades.</p>
          ) : (
            <div className="space-y-4">
              {students.map((student) => (
                <div key={student.id} className="grid gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-[1.5fr_1fr_1fr_auto]">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{student.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Roll No: {student.rollNumber || 'N/A'}</p>
                  </div>
                  <Input
                    label="Marks"
                    type="number"
                    min="0"
                    max="100"
                    value={gradeInputs[student.id]?.marksObtained || 0}
                    onChange={(event) => handleGradeChange(student.id, event.target.value)}
                    disabled={!canManageGrades}
                  />
                  <div className="space-y-2">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Letter Grade</p>
                    <div className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
                      {gradeInputs[student.id]?.letterGrade || 'F'}
                    </div>
                  </div>
                  <Button variant="secondary" onClick={() => finalizeGrade(student)} disabled={!canManageGrades || gradeInputs[student.id]?.finalized}>
                    {gradeInputs[student.id]?.finalized ? 'Finalized' : 'Finalize'}
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end">
            <Button variant="primary" onClick={saveGrades} disabled={loading || students.length === 0 || !canManageGrades}>
              {loading ? 'Saving...' : canManageGrades ? 'Save Grades' : 'Teacher access only'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
