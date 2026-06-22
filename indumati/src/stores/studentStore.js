import { create } from 'zustand';

export const useStudentStore = create((set) => ({
  students: [],
  currentStudent: null,
  meta: { page: 0, size: 10, totalPages: 1 },
  setStudents: (students, meta) => set({ students, meta }),
  setCurrentStudent: (student) => set({ currentStudent: student })
}));
