'use client';

import { useState } from 'react';

const MONTHLY_DATA = [
  { month: 'Jan', revenue: 4200, orders: 38 },
  { month: 'Feb', revenue: 5800, orders: 51 },
  { month: 'Mar', revenue: 5100, orders: 44 },
  { month: 'Apr', revenue: 7400, orders: 68 },
  { month: 'May', revenue: 8900, orders: 82 },
  { month: 'Jun', revenue: 8200, orders: 74 },
  { month: 'Jul', revenue: 10600, orders: 95 },
  { month: 'Aug', revenue: 11800, orders: 108 },
  { month: 'Sep', revenue: 9700, orders: 86 },
  { month: 'Oct', revenue: 12900, orders: 117 },
  { month: 'Nov', revenue: 14800, orders: 132 },
  { month: 'Dec', revenue: 16400, orders: 149 },
];

export default function RevenueChart({ liveRevenue = 0 }) {
  const [hovered, setHovered] = useState(null);
  const [metric, setMetric] = useState('revenue');

  const data = MONTHLY_DATA.map((item, idx) => {
    if (idx === MONTHLY_DATA.length - 1 && liveRevenue > 0) {
      return { ...item, revenue: Math.round(item.revenue + liveRevenue) };
    }
    return item;
  });

  const maxVal = Math.max(...data.map((d) => d[metric]), 1);

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-semibold text-white">Revenue & Order Velocity</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Annual performance overview {liveRevenue > 0 ? '(includes live database orders)' : ''}
          </p>
        </div>

        <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800 self-start">
          <button
            type="button"
            onClick={() => setMetric('revenue')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
              metric === 'revenue'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Revenue ($)
          </button>
          <button
            type="button"
            onClick={() => setMetric('orders')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
              metric === 'orders'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Orders
          </button>
        </div>
      </div>

      <div className="relative h-56 flex items-end gap-2 sm:gap-3 pt-8">
        {/* Horizontal guide lines */}
        <div className="absolute inset-x-0 top-8 bottom-7 flex flex-col justify-between pointer-events-none">
          {[0, 1, 2, 3].map((line) => (
            <div key={line} className="w-full border-t border-slate-800/70 border-dashed" />
          ))}
        </div>

        {data.map((item, idx) => {
          const val = item[metric];
          const heightPct = Math.max(8, Math.round((val / maxVal) * 100));
          const isHovered = hovered === idx;

          return (
            <div
              key={item.month}
              onMouseEnter={() => setHovered(idx)}
              onMouseLeave={() => setHovered(null)}
              className="relative flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
            >
              {isHovered && (
                <div className="absolute -top-2 z-10 whitespace-nowrap rounded-lg bg-slate-800 border border-slate-700 px-2.5 py-1 text-[11px] font-medium text-white shadow-xl">
                  {item.month}: {metric === 'revenue' ? `$${val.toLocaleString()}` : `${val} orders`}
                </div>
              )}

              <div className="w-full flex-1 flex items-end pb-2">
                <div
                  style={{ height: `${heightPct}%` }}
                  className={`w-full rounded-t-lg transition-all duration-300 ${
                    isHovered
                      ? 'bg-gradient-to-t from-indigo-500 to-cyan-400 shadow-lg shadow-indigo-500/30'
                      : 'bg-gradient-to-t from-indigo-600/80 to-indigo-400/80 group-hover:from-indigo-500 group-hover:to-cyan-400'
                  }`}
                />
              </div>

              <span className="text-[11px] font-medium text-slate-400 group-hover:text-slate-200 transition">
                {item.month}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
