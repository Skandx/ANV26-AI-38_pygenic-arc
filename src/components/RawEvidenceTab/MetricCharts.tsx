import type { MetricSeries, ChangeEvent } from '../../data';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { BarChart3 } from 'lucide-react';

function formatTime(ts: string) {
  const d = new Date(ts);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

const COLORS = ['#2563EB', '#DC2626', '#D97706', '#7C3AED', '#059669'];

export function MetricCharts({ metrics, changes }: { metrics: MetricSeries[]; changes: ChangeEvent[] }) {
  // Find the deploy that matters (first one chronologically near the incident)
  const deployTs = changes.length > 0 ? changes[0].ts : null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <BarChart3 size={16} className="text-gray-500" />
        <h3 className="font-bold text-sm text-gray-800">Metric Series</h3>
        <span className="text-xs text-gray-400 ml-auto">{metrics.length} series</span>
      </div>
      <div className="p-4 space-y-6">
        {metrics.map((series, idx) => {
          const data = series.points.map((p) => ({
            time: formatTime(p.ts),
            value: p.value,
            rawTs: p.ts,
          }));
          const color = COLORS[idx % COLORS.length];
          const deployTimeLabel = deployTs ? formatTime(deployTs) : null;

          return (
            <div key={series.name}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-sm font-semibold text-gray-800">{series.name}</span>
                  <span className="ml-2 text-xs text-gray-400 font-mono">{series.service}</span>
                </div>
                <span className="text-xs font-mono text-gray-400">{series.unit}</span>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} width={50} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                    formatter={(value: number) => [`${value} ${series.unit}`, series.name]}
                  />
                  {deployTimeLabel && (
                    <ReferenceLine x={deployTimeLabel} stroke="#DC2626" strokeDasharray="5 5" strokeWidth={2} label={{ value: 'DEPLOY', position: 'top', fontSize: 9, fill: '#DC2626', fontWeight: 'bold' }} />
                  )}
                  <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={{ r: 3, fill: color }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          );
        })}
      </div>
    </div>
  );
}
