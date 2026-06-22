export function Loader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <div className="inline-flex items-center gap-3 rounded-3xl bg-white px-6 py-4 text-slate-900 shadow-soft dark:bg-slate-900 dark:text-slate-100">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-sky-500"></div>
        <span>Loading...</span>
      </div>
    </div>
  );
}
