import React from 'react';

export const DataTable = React.memo(function DataTable({ data, columns, pageIndex, pageCount, onPageChange, loading }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-800">
          <thead className="bg-slate-50 text-slate-500 dark:bg-slate-950 dark:text-slate-300">
            <tr>
              {columns.map((column) => (
                <th key={column.accessor ?? column.Header} className="px-6 py-4 font-medium">{column.Header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-10 text-center text-slate-500 dark:text-slate-300">
                  Loading records...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-10 text-center text-slate-500 dark:text-slate-300">
                  No records found.
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                  {columns.map((column) => (
                    <td key={`${row.id}-${column.accessor ?? column.Header}`} className="px-6 py-4 align-top text-slate-700 dark:text-slate-200">
                      {column.cell ? column.cell(row[column.accessor] ?? row) : row[column.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <span>
          Page {pageIndex + 1} of {pageCount}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button className="rounded-2xl bg-slate-100 px-4 py-2 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700" onClick={() => onPageChange(pageIndex - 1)} disabled={pageIndex === 0}>
            Previous
          </button>
          <button className="rounded-2xl bg-slate-100 px-4 py-2 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700" onClick={() => onPageChange(pageIndex + 1)} disabled={pageIndex + 1 >= pageCount}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
});
