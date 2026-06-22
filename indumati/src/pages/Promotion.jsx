import { useState } from 'react';
import toast from 'react-hot-toast';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

const YEAR_OPTIONS = [
  { value: '1', label: 'Year 1' },
  { value: '2', label: 'Year 2' },
  { value: '3', label: 'Year 3' },
  { value: '4', label: 'Year 4' }
];

export default function Promotion() {
  const [currentYear, setCurrentYear] = useState('1');
  const [promoteTo, setPromoteTo] = useState('2');

  const handlePromote = () => {
    toast.success(`Students from Year ${currentYear} will be promoted to Year ${promoteTo}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Promote Students</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Review promotion readiness and move students to the next academic year.</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.5fr_0.8fr]">
        <Card className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Progress indicators</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-slate-100">Promotion readiness</h2>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Year 1 Students Promoted', value: 78 },
              { label: 'Year 2 Students Promoted', value: 64 },
              { label: 'Year 3 Students Promoted', value: 49 }
            ].map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                  <span>{item.label}</span>
                  <span>{item.value}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div className="h-full rounded-full bg-sky-600" style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Promotion plan</p>
            <h2 className="mt-3 text-xl font-semibold text-slate-900 dark:text-slate-100">Promote Students</h2>
          </div>
          <div className="grid gap-4">
            <label className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              Current Year
              <input
                type="text"
                placeholder="Select year..."
                list="yearListCurrent"
                value={currentYear}
                onChange={(event) => setCurrentYear(event.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
              <datalist id="yearListCurrent">
                {YEAR_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </datalist>
            </label>
            <label className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              Promote To
              <input
                type="text"
                placeholder="Select year..."
                list="yearListPromoteTo"
                value={promoteTo}
                onChange={(event) => setPromoteTo(event.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
              <datalist id="yearListPromoteTo">
                {YEAR_OPTIONS.filter((option) => option.value !== currentYear).map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </datalist>
            </label>
          </div>
          <Button variant="primary" onClick={handlePromote}>Promote Now</Button>
        </Card>
      </div>
    </div>
  );
}
