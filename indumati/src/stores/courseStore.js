import { create } from 'zustand';

export const useCourseStore = create((set) => ({
  courses: [],
  meta: { page: 0, size: 10, totalPages: 1 },
  setCourses: (courses, meta) => set({ courses, meta })
}));
