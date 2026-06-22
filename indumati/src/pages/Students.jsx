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

// Academic year options 2000 – 2026
const YEAR_OPTIONS = Array.from({ length: 27 }, (_, i) => 2000 + i);

// --- CREATE schema (all fields required) ---
const createSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Valid email required'),
  mobileNumber: z.string().regex(/^[0-9]{10}$/, 'Mobile number must be 10 digits'),
  rollNumber: z.string().min(1, 'Roll number required'),
  enrollmentYear: z.preprocess(
    (v) => (v === '' || v === undefined ? undefined : Number(v)),
    z.number({ required_error: 'Enrollment year required' }).int().min(2000).max(2026)
  ),
  address: z.string().min(1, 'Address required'),
  guardianName: z.string().min(1, 'Guardian name required'),
  departmentId: z.preprocess(
    (v) => (v === '' || v === undefined ? undefined : Number(v)),
    z.number({ required_error: 'Department is required' }).min(1, 'Department is required')
  )
});

// --- UPDATE schema (only updatable fields per StudentUpdateRequestDTO) ---
const updateSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100, 'Name too long'),
  mobileNumber: z.string().regex(/^[0-9]{10}$/, 'Mobile number must be 10 digits'),
  address: z.string().min(1, 'Address required'),
  guardianName: z.string().min(1, 'Guardian name required'),
  departmentId: z.preprocess(
    (v) => (v === '' || v === undefined ? undefined : Number(v)),
    z.number().optional()
  )
});

const enrollmentSchema = z.object({
  courseId: z.preprocess(
    (v) => (v === '' || v === undefined ? undefined : Number(v)),
    z.number({ required_error: 'Course is required' }).min(1, 'Course is required')
  )
});

function getPageContent(data) {
  return Array.isArray(data) ? data : data?.content || data?.data || [];
}

function getStudentDepartmentId(student) {
  return student?.departmentId || student?.department_id || student?.department?.id || '';
}

function isCourseAssignedToTeacher(course, user) {
  const teacherId = course?.teacherId || course?.teacher_id || course?.teacher?.id;
  const teacherEmail = course?.teacherEmail || course?.teacher?.email;
  return String(teacherId) === String(user?.id) || String(teacherEmail || '').toLowerCase() === String(user?.email || '').toLowerCase();
}

export default function Students() {
  const { user } = useAuthStore();
  const role = user?.role?.toLowerCase();
  const canEnroll = role === 'admin' || role === 'teacher';
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [enrollmentStudent, setEnrollmentStudent] = useState(null);
  const [studentEnrollments, setStudentEnrollments] = useState([]);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [departments, setDepartments] = useState([]);

  // Separate forms for create and update
  const createForm = useForm({ resolver: zodResolver(createSchema) });
  const updateForm = useForm({ resolver: zodResolver(updateSchema) });
  const enrollmentForm = useForm({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: { courseId: '' }
  });

  const isEditing = !!selectedStudent;
  const activeForm = isEditing ? updateForm : createForm;
  const { formState: { isSubmitting } } = activeForm;
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  
  const availableCourses = useMemo(
    () => role === 'teacher' ? courses.filter((course) => isCourseAssignedToTeacher(course, user)) : courses,
    [courses, role, user]
  );

  const columns = useMemo(
    () => [
      {
        Header: '',
        accessor: 'profile',
        cell: (student) => (
          <button
            onClick={() => openProfile(student)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sky-600 transition hover:bg-sky-200 dark:bg-sky-900 dark:text-sky-300 dark:hover:bg-sky-800"
            title="View Profile"
          >
            👤
          </button>
        )
      },
      { Header: 'Name', accessor: 'name' },
      { Header: 'Mobile', accessor: 'mobileNumber' },
      { Header: 'Roll No', accessor: 'rollNumber' },
      { Header: 'Department', accessor: 'departmentName' },
      {
        Header: 'Actions',
        accessor: 'actions',
        cell: (student) => (
          <div className="flex flex-wrap gap-2">
            {canEnroll ? <Button variant="primary" onClick={() => openEnroll(student)}>Enroll</Button> : null}
            <Button variant="secondary" onClick={() => openEdit(student)}>Edit</Button>
            <Button variant="danger" onClick={() => openDelete(student)}>Delete</Button>
          </div>
        )
      }
    ],
    [canEnroll]
  );

  function openEdit(student) {
    setSelectedStudent(student);
    // Pre-fill only the updatable fields
    updateForm.reset({
      name: student.name || '',
      mobileNumber: student.mobileNumber || '',
      address: student.address || '',
      guardianName: student.guardianName || '',
      departmentId: getStudentDepartmentId(student)
    });
    setModalOpen(true);
  }

  function openProfile(student) {
    setViewingStudent(student);
    setProfileModalOpen(true);
  }

  function openDelete(student) {
    setSelectedStudent(student);
    setConfirmOpen(true);
  }

  async function openEnroll(student) {
    setEnrollmentStudent(student);
    enrollmentForm.reset({ courseId: '' });
    setStudentEnrollments([]);
    setEnrollModalOpen(true);
    await Promise.all([loadCourses(), loadStudentEnrollments(student.id)]);
  }

  async function openAddStudent() {
    setSelectedStudent(null);
    createForm.reset({
      name: '', email: '', mobileNumber: '', rollNumber: '',
      enrollmentYear: '', address: '', guardianName: '', departmentId: ''
    });
    await loadDepartments();
    setModalOpen(true);
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
      toast.error(error.response?.data?.message || 'Failed to load departments');
    }
  }

  async function loadCourses() {
    if (!canEnroll) {
      return;
    }
    try {
      const response = await api.get('/courses?page=0&size=100&sortBy=id&direction=asc');
      setCourses(getPageContent(response.data));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load courses');
    }
  }

  async function loadStudentEnrollments(studentId) {
    setEnrollmentLoading(true);
    try {
      const response = await api.get(`/enrollments/student/${studentId}?page=0&size=50`);
      setStudentEnrollments(getPageContent(response.data));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load enrollments');
    } finally {
      setEnrollmentLoading(false);
    }
  }

  async function loadStudents() {
    setLoading(true);
    try {
      const response = await api.get(
        `/students?page=${pageIndex}&size=10&sortBy=id&direction=asc${search ? `&search=${search}` : ''}`
      );
      setStudents(response.data.content || []);
      setPageCount(response.data.totalPages || 1);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
    loadDepartments();
    loadCourses();
  }, [pageIndex, search, canEnroll]);

  // --- CREATE submit ---
  async function onCreateSubmit(values) {
    try {
      const payload = {
        name: values.name,
        email: values.email,
        mobileNumber: values.mobileNumber,
        rollNumber: values.rollNumber,
        enrollmentYear: Number(values.enrollmentYear),
        address: values.address,
        guardianName: values.guardianName,
        departmentId: values.departmentId ? Number(values.departmentId) : null
      };
      await api.post('/students/create', payload);
      toast.success('Student added successfully');
      setModalOpen(false);
      createForm.reset();
      loadStudents();
    } catch (error) {
      handleFormError(error, createForm.setError);
    }
  }

  // --- UPDATE submit — only sends updatable fields ---
  async function onUpdateSubmit(values) {
    try {
      const departmentId = values.departmentId || getStudentDepartmentId(selectedStudent);
      const payload = {
        id: selectedStudent.id,
        name: values.name,
        mobileNumber: values.mobileNumber,
        address: values.address,
        guardianName: values.guardianName,
        departmentId: departmentId ? Number(departmentId) : null
      };
      await api.put(`/students/${selectedStudent.id}`, payload);
      toast.success('Student updated successfully');
      setModalOpen(false);
      setSelectedStudent(null);
      updateForm.reset();
      loadStudents();
    } catch (error) {
      handleFormError(error, updateForm.setError);
    }
  }

  function handleFormError(error, setError) {
    const data = error.response?.data;
    let handled = false;
    if (data) {
      if (Array.isArray(data.errors)) {
        data.errors.forEach((e) => {
          if (e.field) {
            setError(e.field, { type: 'server', message: e.message || e.defaultMessage || 'Invalid' });
            handled = true;
          }
        });
      } else if (data.fieldErrors && typeof data.fieldErrors === 'object') {
        Object.entries(data.fieldErrors).forEach(([field, msg]) => {
          setError(field, { type: 'server', message: msg || 'Invalid' });
          handled = true;
        });
      }
    }
    if (!handled) {
      toast.error(data?.message || data?.error || `Failed (${error.response?.status || 'network error'})`);
    } else {
      toast.error('Validation failed — check the form fields');
    }
  }

  async function confirmDelete() {
    try {
      await api.delete(`/students/${selectedStudent.id}`);
      toast.success('Student deleted');
      setConfirmOpen(false);
      setSelectedStudent(null);
      loadStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  }

  async function onEnrollSubmit(values) {
    if (!enrollmentStudent) {
      return;
    }
    const courseId = Number(values.courseId);
    if (role === 'teacher' && !availableCourses.some((course) => Number(course.id) === courseId)) {
      toast.error('Teachers can enroll students only in assigned courses');
      return;
    }
    try {
      await api.post('/enrollments', {
        studentId: enrollmentStudent.id,
        courseId
      });
      toast.success('Student enrolled successfully');
      enrollmentForm.reset({ courseId: '' });
      await loadStudentEnrollments(enrollmentStudent.id);
    } catch (error) {
      if (error.response?.status === 403 && role === 'teacher') {
        toast.error('Backend currently allows enrollment only for admin. Please allow TEACHER on POST /enrollments.');
        return;
      }
      toast.error(error.response?.data?.message || 'Enrollment failed');
    }
  }

  async function dropEnrollment(enrollmentId) {
    try {
      await api.delete(`/enrollments/${enrollmentId}`);
      toast.success('Enrollment dropped');
      await loadStudentEnrollments(enrollmentStudent.id);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not drop enrollment');
    }
  }

  const tableData = students.map((student) => ({
    ...student,
    departmentId: getStudentDepartmentId(student) || 'N/A',
    departmentName: student.departmentName || student.department?.name || 'N/A',
    role: student.role || 'N/A',
    enrollmentYear: student.enrollmentYear || 'N/A',
    address: student.address || 'N/A',
    guardianName: student.guardianName || 'N/A',
    mobileNumber: student.mobileNumber || 'N/A',
    rollNumber: student.rollNumber || 'N/A',
    active: student.active !== false,
    profile: student,
    actions: student
  }));

  const filteredStudents = useMemo(
    () => {
      let result = tableData;
      
      // Filter by keyword (name, email, roll number)
      if (search) {
        const searchLower = search.toLowerCase();
        result = result.filter(
          (student) =>
            (student.name?.toLowerCase() || '').includes(searchLower) ||
            (student.email?.toLowerCase() || '').includes(searchLower) ||
            (student.rollNumber?.toLowerCase() || '').includes(searchLower)
        );
      }
      
      // Filter by department
      if (departmentFilter) {
        result = result.filter(
          (student) => String(student.departmentId) === String(departmentFilter)
        );
      }
      
      // Filter by course enrollment (only if teacher is filtering)
      if (courseFilter && canEnroll) {
        // This would filter students enrolled in the selected course
        // For now, we'll show a simplified version - you may need to add course enrollment data to students
        // If you have studentEnrollments data available, you can filter by that
      }
      
      return result;
    },
    [tableData, search, departmentFilter, courseFilter, canEnroll]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Students</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage student records, update details, and publish reports.
          </p>
        </div>
        <Button onClick={openAddStudent}>Add Student</Button>
      </div>

      <Card className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Keyword search */}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Search by name, email, roll no..."
            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
          
          {/* Department filter */}
          <label className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <div className="text-xs font-medium uppercase">Filter by Department</div>
            <input
              type="text"
              placeholder="Search departments..."
              list="deptListFilter"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
            <datalist id="deptListFilter">
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </datalist>
          </label>

          {/* Course filter - only for admins/teachers */}
          {canEnroll && (
            <label className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <div className="text-xs font-medium uppercase">Filter by Course</div>
              <input
                type="text"
                placeholder="Search courses..."
                list="courseListFilter"
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
              <datalist id="courseListFilter">
                <option value="">All Courses</option>
                {availableCourses.map((course) => (
                  <option key={course.id} value={course.id}>{course.name || course.title || course.code}</option>
                ))}
              </datalist>
            </label>
          )}
        </div>

        {/* Clear filters button */}
        {(search || departmentFilter || courseFilter) && (
          <div className="flex justify-end">
            <button
              onClick={() => {
                setSearch('');
                setDepartmentFilter('');
                setCourseFilter('');
              }}
              className="text-sm text-sky-600 hover:underline dark:text-sky-400"
            >
              Clear all filters
            </button>
          </div>
        )}

        <DataTable
          columns={columns}
          data={filteredStudents}
          pageIndex={pageIndex}
          pageCount={pageCount}
          onPageChange={(index) => setPageIndex(Math.max(0, Math.min(index, pageCount - 1)))}
          loading={loading}
        />
      </Card>

      {/* ── ADD STUDENT MODAL ── */}
      <Modal
        open={modalOpen && !isEditing}
        title="Add Student"
        onClose={() => setModalOpen(false)}
        footer={
          <Button variant="primary" onClick={createForm.handleSubmit(onCreateSubmit)} disabled={isSubmitting}>
            Save Student
          </Button>
        }
      >
        <form className="grid gap-4 sm:grid-cols-2">
          <Input label="Name" {...createForm.register('name')} error={createForm.formState.errors.name?.message} />
          <Input label="Email" type="email" {...createForm.register('email')} error={createForm.formState.errors.email?.message} />
          <Input label="Mobile Number" {...createForm.register('mobileNumber')} error={createForm.formState.errors.mobileNumber?.message} />
          <Input label="Roll Number" {...createForm.register('rollNumber')} error={createForm.formState.errors.rollNumber?.message} />

          {/* Enrollment Year dropdown */}
          <label className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            Enrollment Year
            <select
              {...createForm.register('enrollmentYear')}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            >
              <option value="">Select year</option>
              {YEAR_OPTIONS.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            {createForm.formState.errors.enrollmentYear && (
              <p className="text-xs text-rose-500">{createForm.formState.errors.enrollmentYear.message}</p>
            )}
          </label>

          <Input label="Guardian Name" {...createForm.register('guardianName')} error={createForm.formState.errors.guardianName?.message} />

          {/* Department dropdown */}
          <label className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            Department
            <input
              type="text"
              placeholder="Search departments..."
              list="deptListCreate"
              {...createForm.register('departmentId')}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
            <datalist id="deptListCreate">
              <option value="">Select department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </datalist>
            {createForm.formState.errors.departmentId && (
              <p className="text-xs text-rose-500">{createForm.formState.errors.departmentId.message}</p>
            )}
          </label>

          <Input label="Address" {...createForm.register('address')} error={createForm.formState.errors.address?.message} className="sm:col-span-2" />
        </form>
      </Modal>

      {/* ── EDIT STUDENT MODAL — only updatable fields ── */}
      <Modal
        open={modalOpen && isEditing}
        title="Edit Student"
        onClose={() => { setModalOpen(false); setSelectedStudent(null); }}
        footer={
          <Button variant="primary" onClick={updateForm.handleSubmit(onUpdateSubmit)} disabled={updateForm.formState.isSubmitting}>
            Update Student
          </Button>
        }
      >
        {/* Read-only info banner */}
        <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          <span className="font-medium text-slate-700 dark:text-slate-300">Email:</span> {selectedStudent?.email}
          &nbsp;&nbsp;|&nbsp;&nbsp;
          <span className="font-medium text-slate-700 dark:text-slate-300">Roll No:</span> {selectedStudent?.rollNumber}
          &nbsp;&nbsp;|&nbsp;&nbsp;
          <span className="font-medium text-slate-700 dark:text-slate-300">Year:</span> {selectedStudent?.enrollmentYear}
        </div>

        <form className="grid gap-4 sm:grid-cols-2">
          <Input label="Name" {...updateForm.register('name')} error={updateForm.formState.errors.name?.message} />
          <Input label="Mobile Number" {...updateForm.register('mobileNumber')} error={updateForm.formState.errors.mobileNumber?.message} />
          <Input label="Guardian Name" {...updateForm.register('guardianName')} error={updateForm.formState.errors.guardianName?.message} />

          {/* Department dropdown */}
          <label className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            Department
            <input
              type="text"
              placeholder="Search departments..."
              list="deptListUpdate"
              {...updateForm.register('departmentId')}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
            <datalist id="deptListUpdate">
              <option value="">Select department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </datalist>
            {updateForm.formState.errors.departmentId && (
              <p className="text-xs text-rose-500">{updateForm.formState.errors.departmentId.message}</p>
            )}
          </label>

          <Input label="Address" {...updateForm.register('address')} error={updateForm.formState.errors.address?.message} className="sm:col-span-2" />
        </form>
      </Modal>

      {/* ── DELETE CONFIRM MODAL ── */}
      <Modal
        open={confirmOpen}
        title="Confirm Delete"
        onClose={() => setConfirmOpen(false)}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={confirmDelete}>Delete</Button>
          </div>
        }
      >
        <p>
          Are you sure you want to remove{' '}
          <span className="font-semibold">{selectedStudent?.name || 'this student'}</span>?
          This action will soft delete the record.
        </p>
      </Modal>

      {/* ── ENROLL STUDENT MODAL ── */}
      <Modal
        open={enrollModalOpen}
        title="Enroll Student"
        onClose={() => { setEnrollModalOpen(false); setEnrollmentStudent(null); setStudentEnrollments([]); }}
        footer={
          <div className="flex w-full flex-wrap justify-end gap-3">
            <Button variant="secondary" onClick={() => { setEnrollModalOpen(false); setEnrollmentStudent(null); setStudentEnrollments([]); }}>Close</Button>
            <Button variant="primary" onClick={enrollmentForm.handleSubmit(onEnrollSubmit)} disabled={enrollmentForm.formState.isSubmitting || availableCourses.length === 0}>
              Enroll
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900">
            <p className="font-semibold text-slate-900 dark:text-slate-100">{enrollmentStudent?.name}</p>
            <p className="mt-1 text-slate-500 dark:text-slate-400">Roll No: {enrollmentStudent?.rollNumber || 'N/A'}</p>
          </div>

          <label className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            Course
            <input
              type="text"
              placeholder="Search courses..."
              list="courseListEnroll"
              {...enrollmentForm.register('courseId')}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
            <datalist id="courseListEnroll">
              <option value="">
                {availableCourses.length === 0
                  ? role === 'teacher'
                    ? 'No assigned courses available'
                    : 'No courses available'
                  : 'Select course'}
              </option>
              {availableCourses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name || course.title || course.code}
                </option>
              ))}
            </datalist>
            {enrollmentForm.formState.errors.courseId && (
              <p className="text-xs text-rose-500">{enrollmentForm.formState.errors.courseId.message}</p>
            )}
          </label>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Current Enrollments</h3>
            {enrollmentLoading ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Loading enrollments...</p>
            ) : studentEnrollments.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No enrollments found.</p>
            ) : (
              <div className="grid gap-3">
                {studentEnrollments.map((enrollment) => (
                  <div key={enrollment.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {enrollment.courseName || enrollment.course?.name || enrollment.courseTitle || `Course ${enrollment.courseId || ''}`}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Enrollment ID: {enrollment.id}
                      </p>
                    </div>
                    <Button variant="danger" onClick={() => dropEnrollment(enrollment.id)}>Drop</Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {role === 'teacher' ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Teachers can choose only courses assigned to their account.
            </p>
          ) : null}
        </div>
      </Modal>

      {/* ── PROFILE DETAILS MODAL ── */}
      <Modal
        open={profileModalOpen}
        title=""
        onClose={() => { setProfileModalOpen(false); setViewingStudent(null); }}
        footer={
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${viewingStudent?.active !== false ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400'}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${viewingStudent?.active !== false ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              {viewingStudent?.active !== false ? 'Active' : 'Inactive'}
            </span>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={() => { setProfileModalOpen(false); setViewingStudent(null); }}>Close</Button>
              <Button variant="primary" onClick={() => { setProfileModalOpen(false); openEdit(viewingStudent); }}>Edit Student</Button>
            </div>
          </div>
        }
      >
        {viewingStudent && (
          <div className="space-y-4">

            {/* ── Hero header ── */}
            <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-sky-50 to-slate-50 p-4 dark:from-sky-950/40 dark:to-slate-900">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-sky-600 text-xl text-white shadow-md">
                {viewingStudent.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-lg font-semibold text-slate-900 dark:text-slate-100">{viewingStudent.name}</h3>
                <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-400">{viewingStudent.email}</p>
                <p className="mt-1 truncate text-xs font-medium text-sky-600 dark:text-sky-400">
                  {viewingStudent.departmentName || viewingStudent.department?.name || 'No Department'}
                </p>
              </div>
            </div>

            {/* ── Info rows ── */}
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { label: 'Student ID', value: viewingStudent.id },
                { label: 'Roll Number', value: viewingStudent.rollNumber },
                { label: 'Role', value: viewingStudent.role },
                { label: 'Mobile Number', value: viewingStudent.mobileNumber },
                { label: 'Enrollment Year', value: viewingStudent.enrollmentYear },
                { label: 'Guardian Name', value: viewingStudent.guardianName },
                { label: 'Department ID', value: getStudentDepartmentId(viewingStudent) },
                { label: 'Department', value: viewingStudent.departmentName || viewingStudent.department?.name },
              ].map(({ label, value }) => (
                <div key={label} className="min-w-0 rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</p>
                  <p className="mt-1 truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                    {value || <span className="text-slate-400 dark:text-slate-600">—</span>}
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Address</p>
              <p className="mt-1 whitespace-pre-wrap break-words text-sm font-medium text-slate-800 dark:text-slate-200">
                {viewingStudent.address || <span className="text-slate-400 dark:text-slate-600">—</span>}
              </p>
            </div>

          </div>
        )}
      </Modal>
    </div>
  );
}
