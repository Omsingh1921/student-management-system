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

const teacherSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().trim().email('Valid email required'),
  mobileNumber: z.string().trim().regex(/^[0-9]{10}$/, 'Mobile number must be 10 digits'),
  specialization: z.string().trim().min(1, 'Specialization is required'),
  experience: z.preprocess(
    (v) => (v === '' || v === undefined ? undefined : Number(v)),
    z.number().min(0, 'Experience must be 0 or more').optional()
  ),
  qualification: z.string().trim().min(1, 'Qualification is required'),
  DepartmentId: z.preprocess(
    (v) => {
      if (v === '' || v === undefined || v === null) return undefined;
      const n = Number(v);
      return isNaN(n) ? undefined : n;
    },
    z.number({ required_error: 'Department is required' }).min(1, 'Department is required')
  )
});

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [viewingTeacher, setViewingTeacher] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(teacherSchema),
    shouldUnregister: false,
    defaultValues: {
      name: '', email: '', mobileNumber: '',
      specialization: '', experience: '',
      qualification: '', DepartmentId: ''
    }
  });

  const columns = useMemo(
    () => [
      {
        Header: '',
        accessor: 'profile',
        cell: (teacher) => (
          <button
            onClick={() => openProfile(teacher)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-600 transition hover:bg-violet-200 dark:bg-violet-900 dark:text-violet-300 dark:hover:bg-violet-800"
            title="View Profile"
          >
            🧑‍🏫
          </button>
        )
      },
      { Header: 'Name',           accessor: 'name' },
      { Header: 'Email',          accessor: 'email' },
      { Header: 'Mobile',         accessor: 'mobileNumber' },
      { Header: 'Specialization', accessor: 'specialization' },
      {
        Header: 'Actions',
        accessor: 'actions',
        cell: (teacher) => (
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => openTeacherModal(teacher)}>Edit</Button>
          </div>
        )
      }
    ],
    []
  );

  async function loadTeachers() {
    setLoading(true);
    try {
      const searchQuery = search ? `&search=${encodeURIComponent(search)}` : '';
      const deptQuery = departmentFilter ? `&departmentId=${encodeURIComponent(departmentFilter)}` : '';
      const response = await api.get(`/teachers?page=${pageIndex}&size=10&sortBy=id&direction=asc${searchQuery}${deptQuery}`);
      setTeachers(response.data.content || []);
      setPageCount(response.data.totalPages || 1);
    } catch (error) {
      toast.error('Could not load teachers');
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

  useEffect(() => {
    loadTeachers();
  }, [pageIndex, search, departmentFilter]);

  useEffect(() => {
    loadDepartments();
  }, []);

  function openProfile(teacher) {
    setViewingTeacher(teacher);
    setProfileModalOpen(true);
  }

  function openTeacherModal(teacher = null) {
    setSelectedTeacher(teacher);
    reset(
      teacher
        ? {
            name: teacher.name,
            email: teacher.email,
            mobileNumber: teacher.mobileNumber,
            specialization: teacher.specialization,
            experience: teacher.experience,
            qualification: teacher.qualification,
            DepartmentId: teacher.DepartmentId || teacher.department_id || teacher.departmentId || ''
          }
        : { name: '', email: '', mobileNumber: '', specialization: '', experience: '', qualification: '', DepartmentId: '' }
    );
    setModalOpen(true);
  }

  async function onSubmit(values) {
    try {
      const deptId = parseInt(values.DepartmentId, 10);
      const payload = {
        name: values.name.trim(),
        email: values.email.trim(),
        mobileNumber: values.mobileNumber.trim(),
        specialization: values.specialization.trim(),
        experience: values.experience ? Number(values.experience) : 0,
        qualification: values.qualification.trim(),
        DepartmentId: deptId,
        departmentId: deptId
      };

      if (selectedTeacher) {
        await api.put(`/teachers/${selectedTeacher.id}`, payload);
        toast.success('Teacher updated');
      } else {
        await api.post('/teachers', payload);
        toast.success('Teacher added');
      }
      setModalOpen(false);
      setSelectedTeacher(null);
      reset();
      loadTeachers();
    } catch (error) {
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
        toast.error(data?.message || 'Save failed');
      } else {
        toast.error('Validation failed — check the form fields');
      }
    }
  }

  const tableData = teachers.map((teacher) => ({
    ...teacher,
    profile: teacher,
    actions: teacher
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Teachers</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage teaching staff and department assignments.</p>
        </div>
        <Button onClick={() => openTeacherModal()}>Add Teacher</Button>
      </div>

      {/* Filters */}
      <Card className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Search Teachers"
            placeholder="Name, email, specialization..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPageIndex(0);
            }}
          />

          <label className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <span className="font-medium text-slate-700 dark:text-slate-200">Filter by Department</span>
            <input
              type="text"
              placeholder="Select department..."
              list="deptListFilter"
              value={departmentFilter}
              onChange={(event) => {
                setDepartmentFilter(event.target.value);
                setPageIndex(0);
              }}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
            <datalist id="deptListFilter">
              <option value="">All departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </datalist>
          </label>

          <div className="flex items-end justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setSearch('');
                setDepartmentFilter('');
                setPageIndex(0);
              }}
            >
              Clear filters
            </Button>
          </div>
        </div>
      </Card>

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
        title={selectedTeacher ? 'Edit Teacher' : 'Add Teacher'}
        onClose={() => { setModalOpen(false); setSelectedTeacher(null); }}
        footer={
          <Button variant="primary" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {selectedTeacher ? 'Update Teacher' : 'Save Teacher'}
          </Button>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Name"                  {...register('name')}           error={errors.name?.message} />
          <Input label="Email" type="email"    {...register('email')}          error={errors.email?.message} />
          <Input label="Mobile Number"         {...register('mobileNumber')}   error={errors.mobileNumber?.message} />
          <Input label="Specialization"        {...register('specialization')} error={errors.specialization?.message} />
          <Input label="Experience (years)" type="number" {...register('experience')}    error={errors.experience?.message} />
          <Input label="Qualification"         {...register('qualification')}  error={errors.qualification?.message} />

          {/* Department dropdown — fetches live, stores departmentId */}
          <label className="space-y-2 text-sm text-slate-600 dark:text-slate-300 sm:col-span-2">
            Department
            <input
              type="text"
              placeholder="Search departments..."
              list="deptListTeachers"
              {...register('DepartmentId')}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
            <datalist id="deptListTeachers">
              <option value="">Select department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </datalist>
            {errors.DepartmentId && (
              <p className="text-xs text-rose-500">{errors.DepartmentId.message}</p>
            )}
          </label>
        </div>

        {/* Read-only current department info — shown only when editing and department is assigned */}
        {selectedTeacher && (selectedTeacher.department_id || selectedTeacher.departmentName) && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Current Department ID</p>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {selectedTeacher.department_id || '—'}
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Current Department</p>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {selectedTeacher.departmentName || '—'}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ── PROFILE MODAL ── */}
      <Modal
        open={profileModalOpen}
        title=""
        onClose={() => { setProfileModalOpen(false); setViewingTeacher(null); }}
        footer={
          <div className="flex w-full items-center justify-between">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${viewingTeacher?.active !== false ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400'}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${viewingTeacher?.active !== false ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              {viewingTeacher?.active !== false ? 'Active' : 'Inactive'}
            </span>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => { setProfileModalOpen(false); setViewingTeacher(null); }}>Close</Button>
              <Button variant="primary" onClick={() => { setProfileModalOpen(false); openTeacherModal(viewingTeacher); }}>Edit Teacher</Button>
            </div>
          </div>
        }
      >
        {viewingTeacher && (
          <div className="space-y-5">

            {/* Hero header */}
            <div className="flex items-center gap-5 rounded-2xl bg-gradient-to-r from-violet-50 to-slate-50 p-5 dark:from-violet-950/40 dark:to-slate-900">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-violet-600 text-2xl text-white shadow-md">
                {viewingTeacher.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-xl font-semibold text-slate-900 dark:text-slate-100">{viewingTeacher.name}</h3>
                <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-400">{viewingTeacher.email}</p>
                <p className="mt-1 text-xs font-medium text-violet-600 dark:text-violet-400">
                  {viewingTeacher.specialization || 'No Specialization'} {viewingTeacher.departmentName ? `· ${viewingTeacher.departmentName}` : ''}
                </p>
              </div>
            </div>

            {/* Info rows */}
            <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-700 dark:bg-slate-900">
              {[
                { label: 'Mobile Number',  value: viewingTeacher.mobileNumber },
                { label: 'Specialization', value: viewingTeacher.specialization },
                { label: 'Qualification',  value: viewingTeacher.qualification },
                { label: 'Experience',     value: viewingTeacher.experience != null ? `${viewingTeacher.experience} year${viewingTeacher.experience !== 1 ? 's' : ''}` : null },
                { label: 'Role',           value: viewingTeacher.role },
                { label: 'Department',     value: viewingTeacher.departmentName },
                { label: 'Department ID',  value: viewingTeacher.department_id },
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
