import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { districts } from '@/data/districts';
import { allRovers } from '@/data/rovers';
import StatusDot from '@/components/StatusDot';
import UtilizationBar from '@/components/UtilizationBar';
import ReadOnlyBadge from '@/components/ReadOnlyBadge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { ChevronRight } from 'lucide-react';

export default function PerformanceDashboard() {
  // Surveyor utilization data
  const surveyorData = useMemo(() => {
    const surveyors = new Map<string, { name: string; hours: number; days: number }>();
    allRovers.forEach(r => {
      const existing = surveyors.get(r.surveyorName);
      const totalHours = r.workingHours.reduce((a, b) => a + b, 0);
      if (existing) {
        existing.hours += totalHours;
        existing.days += r.workingHours.length;
      } else {
        surveyors.set(r.surveyorName, { name: r.surveyorName, hours: totalHours, days: r.workingHours.length });
      }
    });

    return Array.from(surveyors.values())
      .map(s => ({
        name: s.name,
        utilization: Math.min(100, parseFloat(((s.hours / (s.days * 8)) * 100).toFixed(1))),
      }))
      .sort((a, b) => b.utilization - a.utilization)
      .slice(0, 20);
  }, []);

  // Battery distribution
  const batteryDistribution = useMemo(() => {
    const ranges = [
      { range: '0-20%', min: 0, max: 20, count: 0, color: '#EF4444' },
      { range: '21-40%', min: 21, max: 40, count: 0, color: '#F59E0B' },
      { range: '41-60%', min: 41, max: 60, count: 0, color: '#06B6D4' },
      { range: '61-80%', min: 61, max: 80, count: 0, color: '#06B6D4' },
      { range: '81-100%', min: 81, max: 100, count: 0, color: '#06B6D4' },
    ];

    allRovers.forEach(r => {
      const range = ranges.find(rng => r.battery >= rng.min && r.battery <= rng.max);
      if (range) range.count++;
    });

    return ranges.map(r => ({ name: r.range, count: r.count, color: r.color }));
  }, []);

  // CORS connectivity table
  const corsData = useMemo(() => {
    const now = Date.now();
    return districts.map(d => {
      const uptime = d.corsStatus === 'connected' ? 95 + Math.random() * 4.9 : d.corsStatus === 'degraded' ? 70 + Math.random() * 20 : 0;
      return {
        district: d.name,
        status: d.corsStatus,
        uptime: parseFloat(uptime.toFixed(1)),
        lastDisconnect: d.corsStatus === 'connected' ? '—' : new Date(now - Math.random() * 86400000 * 3).toLocaleString('en-US', { hour12: false }),
        connectedSince: new Date(now - Math.random() * 86400000 * 30).toLocaleString('en-US', { hour12: false }),
      };
    });
  }, [districts]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--void)', paddingTop: '48px' }}>
      {/* Header */}
      <div className="px-4 lg:px-8 py-6">
        <div className="flex items-center gap-2 mb-2">
          <Link to="/" className="font-mono-data text-xs uppercase tracking-wider" style={{ color: 'var(--primary-cyan)' }}>
            STATE OVERVIEW
          </Link>
          <ChevronRight className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
        </div>
        <h2 className="font-display font-semibold mb-1" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          PERFORMANCE METRICS
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Surveyor-wise rover utilization and system health
        </p>
      </div>

      {/* Surveyor Utilization Chart */}
      <div className="px-4 lg:px-8">
        <div className="card-surface p-4">
          <h3 className="font-display font-medium text-sm uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            SURVEYOR UTILIZATION % <ReadOnlyBadge />
          </h3>
          <div style={{ height: '360px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={surveyorData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={75} />
                <ReferenceLine x={70} stroke="var(--warning)" strokeDasharray="4 4" />
                <Bar dataKey="utilization" fill="var(--chart-line)" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Battery Status Histogram */}
      <div className="px-4 lg:px-8 mt-4">
        <div className="card-surface p-4">
          <h3 className="font-display font-medium text-sm uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            BATTERY STATUS DISTRIBUTION <ReadOnlyBadge />
          </h3>
          <div style={{ height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={batteryDistribution} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                  {batteryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* CORS Connectivity Table */}
      <div className="px-4 lg:px-8 mt-4 mb-8">
        <div className="card-surface p-4">
          <h3 className="font-display font-medium text-sm uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            CORS CONNECTIVITY <ReadOnlyBadge />
          </h3>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  {['DISTRICT', 'STATUS', 'UPTIME', 'LAST DISCONNECT', 'CONNECTED SINCE'].map((h) => (
                    <th key={h} className="font-mono-data font-medium text-xs uppercase p-3 text-left"
                      style={{ color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {corsData.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-color)', height: '44px' }}>
                    <td className="p-3 text-sm" style={{ color: 'var(--text-primary)' }}>{row.district}</td>
                    <td className="p-3">
                      <StatusDot status={row.status === 'connected' ? 'connected' : 'disconnected'} />
                    </td>
                    <td className="p-3">
                      <UtilizationBar percentage={row.uptime} width={60} />
                    </td>
                    <td className="p-3 font-mono-data text-xs" style={{ color: row.lastDisconnect === '—' ? 'var(--text-muted)' : 'var(--warning)' }}>
                      {row.lastDisconnect}
                    </td>
                    <td className="p-3 font-mono-data text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {row.connectedSince}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
