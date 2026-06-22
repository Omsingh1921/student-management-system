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

const departmentSchema = z.object({
  name: z.string().min(2, 'Department name is required'),
  description: z.string().optional()
});

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [teacherAssigning, setTeacherAssigning] = useState('');
  const [teacherListOpen, setTeacherListOpen] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [departmentSearch, setDepartmentSearch] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({ resolver: zodResolver(departmentSchema) });

  const columns = useMemo(
    () => [
      { Header: 'Name',        accessor: 'name' },
      { Header: 'Description', accessor: 'description' },
      {
        Header: 'Actions',
        accessor: 'actions',
        cell: (department) => (
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => openModal(department)}>Edit</Button>
            <Button variant="primary" onClick={() => openTeacherAssignment(department)}>Assign Teacher</Button>
          </div>
        )
      }
    ],
    []
  );

  useEffect(() => {
    loadDepartments();
  }, [pageIndex]);

  useEffect(() => {
    loadTeachers();
  }, []);

  async function loadDepartments() {
    setLoading(true);
    try {
      const response = await api.get(`/departments/page?page=${pageIndex}&size=10&sortBy=id&direction=asc`);
      setDepartments(response.data.content || []);
      setPageCount(response.data.totalPages || 1);
    } catch (error) {
      toast.error('Unable to load departments');
    } finally {
      setLoading(false);
    }
  }

  async function loadTeachers() {
    try {
      const response = await api.get('/teachers?page=0&size=100&sortBy=id&direction=asc');
      setTeachers(response.data.content || []);
    } catch (error) {
      toast.error('Unable to load teachers');
    }
  }

  function openModal(department = null) {
    setSelectedDepartment(department);
    reset(
      department
        ? { name: department.name || '', description: department.description || '' }
        : { name: '', description: '' }
    );
    setModalOpen(true);
  }

  async function onSubmit(values) {
    try {
      if (selectedDepartment) {
        await api.put(`/departments/${selectedDepartment.id}`, values);
        toast.success('Department updated');
      } else {
        await api.post('/departments/create', values);
        toast.success('Department created');
      }
      setModalOpen(false);
      setSelectedDepartment(null);
      loadDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Save failed');
    }
  }

  function openTeacherAssignment(department) {
    setSelectedDepartment(department);
    setTeacherAssigning('');
    setTeacherListOpen(true);
  }

  async function assignTeacher() {
    if (!selectedDepartment || !teacherAssigning) {
      return toast.error('Please select a teacher');
    }
    setAssigning(true);
    try {
      // PUT /api/v1/departments/{departmentId}/teachers/{teacherId}
      // No request body — both IDs are path variables
      await api.put(`/departments/${selectedDepartment.id}/teachers/${Number(teacherAssigning)}`, null, {
        headers: { 'Content-Type': 'application/json' }
      });
      toast.success(`Teacher assigned to ${selectedDepartment.name}`);
      setTeacherListOpen(false);
      setSelectedDepartment(null);
      setTeacherAssigning('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Assignment failed');
    } finally {
      setAssigning(false);
    }
  }

  const tableData = departments.map((dept) => ({
    ...dept,
    description: dept.description || '—',
    actions: dept
  }));

  const filteredDepartments = useMemo(
    () => {
      if (!departmentSearch) return tableData;
      const searchLower = departmentSearch.toLowerCase();
      return tableData.filter(
        (dept) =>
          (dept.name?.toLowerCase() || '').includes(searchLower) ||
          (dept.description?.toLowerCase() || '').includes(searchLower)
      );
    },
    [tableData, departmentSearch]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Departments</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Create departments and assign faculty to each unit.</p>
        </div>
        <Button onClick={() => openModal()}>Add Department</Button>
      </div>

      {/* Table — shows Name, Description, Actions */}
      <Card>
        <div className="space-y-4">
          {/* Filter input */}
          <input
            type="text"
            placeholder="Search departments by name or description..."
            value={departmentSearch}
            onChange={(e) => setDepartmentSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
          <DataTable
            columns={columns}
            data={filteredDepartments}
            pageIndex={pageIndex}
            pageCount={pageCount}
            onPageChange={(index) => setPageIndex(Math.max(0, Math.min(index, pageCount - 1)))}
            loading={loading}
          />
        </div>
      </Card>

      {/* ── ADD / EDIT MODAL ── */}
      <Modal
        open={modalOpen}
        title={selectedDepartment ? 'Edit Department' : 'New Department'}
        onClose={() => { setModalOpen(false); setSelectedDepartment(null); }}
        footer={
          <Button variant="primary" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {selectedDepartment ? 'Update Department' : 'Create Department'}
          </Button>
        }
      >
        <div className="grid gap-4">
          <Input label="Department Name" {...register('name')} error={errors.name?.message} />
          <label className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            Description
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Optional description..."
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
            {errors.description && (
              <p className="text-xs text-rose-500">{errors.description.message}</p>
            )}
          </label>
        </div>
      </Modal>

      {/* ── ASSIGN TEACHER MODAL ── */}
      <Modal
        open={teacherListOpen}
        title={`Assign Teacher to ${selectedDepartment?.name ?? 'Department'}`}
        onClose={() => { setTeacherListOpen(false); setSelectedDepartment(null); setTeacherAssigning(''); }}
        footer={
          <div className="flex w-full justify-end gap-3">
            <Button variant="secondary" onClick={() => { setTeacherListOpen(false); setSelectedDepartment(null); setTeacherAssigning(''); }}>Cancel</Button>
            <Button variant="primary" onClick={assignTeacher} disabled={!teacherAssigning || assigning}>
              {assigning ? 'Assigning...' : 'Assign Teacher'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Department info */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Department</p>
            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{selectedDepartment?.name}</p>
            {selectedDepartment?.description && (
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{selectedDepartment.description}</p>
            )}
          </div>

          {/* Teacher select */}
          <label className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            Select Teacher
            <input
              type="text"
              placeholder="Search teachers..."
              list="teacherListDept"
              value={teacherAssigning}
              onChange={(e) => setTeacherAssigning(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
            <datalist id="teacherListDept">
              <option value="">Choose a teacher</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}{teacher.specialization ? ` — ${teacher.specialization}` : ''}
                </option>
              ))}
            </datalist>
          </label>
        </div>
      </Modal>
    </div>
  );
}
