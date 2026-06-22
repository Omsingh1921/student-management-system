import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import api from '../services/api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { DataTable } from '../components/DataTable';
import { useAuthStore } from '../stores/authStore';

const courseSchema = z.object({
  name: z.string().min(2, 'Course name is required'),
  code: z.string().min(1, 'Course code is required'),
  credits: z.preprocess(
    (v) => (v === '' || v === undefined ? undefined : Number(v)),
    z.number({ required_error: 'Credits required' }).min(1, 'Credits must be at least 1').optional()
  ),
  semester: z.string().min(1, 'Semester is required'),
  departmentId: z.preprocess(
    (v) => (v === '' || v === undefined ? undefined : Number(v)),
    z.number({ required_error: 'Department is required' }).min(1, 'Department is required')
  ),
  teacherId: z.preprocess(
    (v) => (v === '' || v === undefined ? undefined : Number(v)),
    z.number().optional()
  )
});

function getPageContent(data) {
  return Array.isArray(data) ? data : data?.content || data?.data || [];
}

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [viewingCourse, setViewingCourse] = useState(null);
  const { user } = useAuthStore();
  const role = user?.role?.toLowerCase();
  const canManageCourses = role === 'admin';

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({ resolver: zodResolver(courseSchema) });

  const selectedDepartmentId = watch('departmentId');

  const columns = useMemo(
    () => [
      {
        Header: '',
        accessor: 'profile',
        cell: (course) => (
          <button
            onClick={() => openProfile(course)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 transition hover:bg-emerald-200 dark:bg-emerald-900 dark:text-emerald-300 dark:hover:bg-emerald-800"
            title="View Details"
          >
            📚
          </button>
        )
      },
      { Header: 'Name',        accessor: 'name' },
      { Header: 'Code',        accessor: 'code' },
      { Header: 'Department',  accessor: 'departmentName' },
      { Header: 'Teacher',     accessor: 'teacherName' },
      { Header: 'Semester',    accessor: 'semester' },
      {
        Header: 'Actions',
        accessor: 'actions',
        cell: (course) => (
          <div className="flex flex-wrap gap-2">
            {canManageCourses ? <Button variant="secondary" onClick={() => openCourseModal(course)}>Edit</Button> : null}
          </div>
        )
      }
    ],
    [canManageCourses]
  );

  async function loadCourses() {
    setLoading(true);
    try {
      const response = await api.get(`/courses?page=${pageIndex}&size=10`);
      setCourses(response.data.content || []);
      setPageCount(response.data.totalPages || 1);
    } catch (error) {
      toast.error('Could not load courses');
    } finally {
      setLoading(false);
    }
  }

  async function loadDepartments() {
    try {
      let list = [];
      try {
        const res = await api.get('/departments/page?page=0&size=100&sortBy=id&direction=asc');
        const data = res.data;
        list = Array.isArray(data) ? data : data.content || [];
      } catch {
        const res = await api.get('/departments?page=0&size=100');
        const data = res.data;
        list = Array.isArray(data) ? data : data.content || data.data || [];
      }
      setDepartments(list);
    } catch (error) {
      toast.error('Failed to load departments');
    }
  }

  async function loadTeachers() {
    try {
      const res = await api.get('/teachers?page=0&size=100&sortBy=id&direction=asc');
      setTeachers(getPageContent(res.data));
    } catch (error) {
      if (error.response?.status !== 403) {
        toast.error('Failed to load teachers');
      }
    }
  }

  async function loadTeachersByDepartment(departmentId) {
    if (!departmentId) {
      setFilteredTeachers([]);
      return;
    }
    setTeachersLoading(true);
    try {
      // Try department-specific teachers endpoint first
      const res = await api.get(`/departments/${departmentId}/teachers`);
      setFilteredTeachers(getPageContent(res.data));
    } catch {
      // Fallback: filter from all teachers by departmentId
      const filtered = teachers.filter((t) => String(t.departmentId) === String(departmentId));
      setFilteredTeachers(filtered);
    } finally {
      setTeachersLoading(false);
    }
  }

  useEffect(() => {
    loadCourses();
  }, [pageIndex]);

  useEffect(() => {
    loadDepartments();
    if (canManageCourses) {
      loadTeachers();
    }
  }, [canManageCourses]);

  // When department changes in the form, load its teachers and clear teacherId
  useEffect(() => {
    if (selectedDepartmentId) {
      loadTeachersByDepartment(Number(selectedDepartmentId));
    } else {
      setFilteredTeachers([]);
    }
    setValue('teacherId', '');
  }, [selectedDepartmentId]);

  function openProfile(course) {
    setViewingCourse(course);
    setProfileModalOpen(true);
  }

  function openCourseModal(course = null) {
    setSelectedCourse(course);
    reset(
      course
        ? {
            name: course.name || '',
            code: course.code || '',
            credits: course.credits || '',
            semester: course.semester || '',
            departmentId: course.departmentId || '',
            teacherId: course.teacherId || ''
          }
        : { name: '', code: '', credits: '', semester: '', departmentId: '', teacherId: '' }
    );
    // Pre-load teachers for the course's department when editing
    if (course?.departmentId) {
      loadTeachersByDepartment(course.departmentId);
    } else {
      setFilteredTeachers([]);
    }
    setModalOpen(true);
  }

  async function onSubmit(values) {
    try {
      const payload = {
        name: values.name,
        code: values.code,
        credits: values.credits ? Number(values.credits) : null,
        semester: values.semester,
        departmentId: Number(values.departmentId),
        teacherId: values.teacherId ? Number(values.teacherId) : null
      };

      if (selectedCourse) {
        await api.put(`/courses/${selectedCourse.id}`, payload);
        toast.success('Course updated');
      } else {
        await api.post('/courses', payload);
        toast.success('Course created');
      }
      setModalOpen(false);
      setSelectedCourse(null);
      reset();
      loadCourses();
    } catch (error) {
      const data = error.response?.data;
      toast.error(data?.message || 'Save failed');
    }
  }

  const tableData = courses.map((course) => ({
    ...course,
    departmentName: course.departmentName || '—',
    teacherName: course.teacherName || '—',
    profile: course,
    actions: course
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Courses</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Create and manage courses with department and teacher assignments.</p>
        </div>
        {canManageCourses ? <Button onClick={() => openCourseModal()}>Add Course</Button> : null}
      </div>

      {/* Table */}
      <Card>
        <DataTable
          data={tableData}
          columns={columns}
          pageIndex={pageIndex}
          pageCount={pageCount}
          onPageChange={setPageIndex}
          loading={loading}
        />
      </Card>

      {/* ── ADD / EDIT MODAL ── */}
      <Modal
        open={modalOpen}
        title={selectedCourse ? 'Edit Course' : 'Add Course'}
        onClose={() => { setModalOpen(false); setSelectedCourse(null); }}
        footer={
          <Button variant="primary" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {selectedCourse ? 'Update Course' : 'Save Course'}
          </Button>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Course Name" {...register('name')} error={errors.name?.message} />
          <Input label="Course Code" {...register('code')} error={errors.code?.message} />
          <Input label="Credits" type="number" {...register('credits')} error={errors.credits?.message} />
          <Input label="Semester" {...register('semester')} error={errors.semester?.message} />

          {/* Department dropdown */}
          <label className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            Department
            <input
              type="text"
              placeholder="Search departments..."
              list="departmentList"
              {...register('departmentId')}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
            <datalist id="departmentList">
              <option value="">Select department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </datalist>
            {errors.departmentId && (
              <p className="text-xs text-rose-500">{errors.departmentId.message}</p>
            )}
          </label>

          {/* Teacher dropdown — filtered by selected department */}
          <label className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            Assign Teacher
            <input
              type="text"
              placeholder="Search teachers..."
              list="teacherList"
              {...register('teacherId')}
              disabled={!selectedDepartmentId || teachersLoading}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:disabled:bg-slate-800"
            />
            <datalist id="teacherList">
              <option value="">
                {!selectedDepartmentId
                  ? 'Select department first'
                  : teachersLoading
                  ? 'Loading teachers...'
                  : filteredTeachers.length === 0
                  ? 'No teachers in this department'
                  : 'Select teacher'}
              </option>
              {filteredTeachers.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </datalist>
            {errors.teacherId && (
              <p className="text-xs text-rose-500">{errors.teacherId.message}</p>
            )}
          </label>
        </div>

        {/* Read-only current department & teacher — shown only when editing */}
        {selectedCourse && (selectedCourse.departmentName || selectedCourse.teacherName) && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Current Department</p>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {selectedCourse.departmentName || '—'}
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Current Teacher</p>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {selectedCourse.teacherName || '—'}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ── PROFILE / DETAILS MODAL ── */}
      <Modal
        open={profileModalOpen}
        title=""
        onClose={() => { setProfileModalOpen(false); setViewingCourse(null); }}
        footer={
          <div className="flex w-full justify-end gap-3">
            <Button variant="secondary" onClick={() => { setProfileModalOpen(false); setViewingCourse(null); }}>Close</Button>
            {canManageCourses ? (
              <Button variant="primary" onClick={() => { setProfileModalOpen(false); openCourseModal(viewingCourse); }}>Edit Course</Button>
            ) : null}
          </div>
        }
      >
        {viewingCourse && (
          <div className="space-y-5">

            {/* Hero header */}
            <div className="flex items-center gap-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-slate-50 p-5 dark:from-emerald-950/40 dark:to-slate-900">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-2xl text-white shadow-md">
                {viewingCourse.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-xl font-semibold text-slate-900 dark:text-slate-100">{viewingCourse.name}</h3>
                <p className="mt-0.5 text-sm font-medium text-slate-500 dark:text-slate-400">{viewingCourse.code}</p>
                <p className="mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  {viewingCourse.departmentName || 'No Department'}
                </p>
              </div>
            </div>

            {/* Info rows */}
            <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-700 dark:bg-slate-900">
              {[
                { label: 'Course Code',  value: viewingCourse.code },
                { label: 'Credits',      value: viewingCourse.credits != null ? `${viewingCourse.credits} credit${viewingCourse.credits !== 1 ? 's' : ''}` : null },
                { label: 'Semester',     value: viewingCourse.semester },
                { label: 'Department',   value: viewingCourse.departmentName },
                { label: 'Teacher',      value: viewingCourse.teacherName },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start justify-between gap-4 px-5 py-3.5">
                  <span className="w-36 shrink-0 text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {label}
                  </span>
                  <span className="text-right text-sm font-medium text-slate-800 dark:text-slate-200">
                    {value || <span className="text-slate-400 dark:text-slate-600">—</span>}
                  </span>
                </div>
              ))}
            </div>

          </div>
        )}
      </Modal>
    </div>
  );
}
