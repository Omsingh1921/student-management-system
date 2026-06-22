import { create } from 'zustand';

export const useTeacherStore = create((set) => ({
  teachers: [],
  meta: { page: 0, size: 10, totalPages: 1 },
  setTeachers: (teachers, meta) => set({ teachers, meta })
}));
