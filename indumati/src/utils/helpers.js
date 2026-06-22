export const getLetterGrade = (marks) => {
  if (marks >= 90) return 'A';
  if (marks >= 75) return 'B';
  if (marks >= 60) return 'C';
  if (marks >= 45) return 'D';
  return 'F';
};

export function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
