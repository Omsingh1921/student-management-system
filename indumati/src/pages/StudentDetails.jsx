import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

export default function StudentDetails() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [grades, setGrades] = useState([]);
  const [activeTab, setActiveTab] = useState('attendance');

  useEffect(() => {
    async function load() {
      try {
        const [studentRes, attendanceRes, gradesRes] = await Promise.all([
          api.get(`/students/${id}`),
          api.get(`/attendance/student/${id}?page=0&size=10`),
          api.get(`/grades/student/${id}?page=0&size=10`)
        ]);
        setStudent(studentRes.data);
        setAttendance(attendanceRes.data.content || []);
        setGrades(gradesRes.data.content || []);
      } catch (error) {
        console.error(error);
      }
    }
    load();
  }, [id]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Student Profile</p>
            <h1 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-slate-100">{student?.name || 'Student details'}</h1>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm text-slate-500 dark:text-slate-400">Course</p>
              <p className="font-semibold text-slate-900 dark:text-slate-100">{student?.course || 'N/A'}</p>
            </div>
            <div className="space-y-2 rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm text-slate-500 dark:text-slate-400">Batch</p>
              <p className="font-semibold text-slate-900 dark:text-slate-100">{student?.departmentId || 'N/A'}</p>
            </div>
            <div className="space-y-2 rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm text-slate-500 dark:text-slate-400">Year</p>
              <p className="font-semibold text-slate-900 dark:text-slate-100">{student?.year || 'N/A'}</p>
            </div>
            <div className="space-y-2 rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm text-slate-500 dark:text-slate-400">Enrollment</p>
              <p className="font-semibold text-slate-900 dark:text-slate-100">{student?.enrollmentYear || 'N/A'}</p>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">Publish</p>
            <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">C.Batse, Stance, Batch, 3PK</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Student report and progress placeholder information with summary of achievements and next steps.</p>
          </div>
        </Card>
        <Card className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Summary</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">Performance</h2>
            </div>
            <Button variant="secondary">Export</Button>
          </div>
          <div className="space-y-4">
            <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-900">
              <p className="text-sm text-slate-500 dark:text-slate-400">Average Attendance</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">89%</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-900">
              <p className="text-sm text-slate-500 dark:text-slate-400">Current GPA</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">8.7</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-wrap gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
          <button onClick={() => setActiveTab('attendance')} className={`rounded-3xl px-5 py-3 text-sm font-semibold ${activeTab === 'attendance' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
            Attendance Records
          </button>
          <button onClick={() => setActiveTab('grades')} className={`rounded-3xl px-5 py-3 text-sm font-semibold ${activeTab === 'grades' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
            Grades
          </button>
        </div>
        <div className="mt-6 space-y-4">
          {activeTab === 'attendance' ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {attendance.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">No attendance records available.</p>
              ) : (
                attendance.map((record) => (
                  <div key={record.id} className="rounded-3xl border border-slate-200 p-4 dark:border-slate-800">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{record.courseId || 'Course'}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{record.date}</p>
                    <p className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${record.status === 'Present' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{record.status}</p>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {grades.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">No grades available.</p>
              ) : (
                grades.map((grade) => (
                  <div key={grade.id} className="rounded-3xl border border-slate-200 p-4 dark:border-slate-800">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{grade.courseId || 'Course'}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Marks: {grade.marksObtained}</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{grade.letterGrade || 'N/A'}</p>
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
