import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

interface ElevationChartProps {
  baseElevation: number;
}

export default function ElevationChart({ baseElevation }: ElevationChartProps) {
  const data = useMemo(() => {
    const now = Date.now();
    const points = [];
    for (let i = 10; i >= 0; i--) {
      const time = new Date(now - i * 60 * 1000);
      const variation = (Math.sin(i * 0.8) * 15) + (Math.random() - 0.5) * 8;
      points.push({
        time: time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        elevation: parseFloat((baseElevation + variation).toFixed(1)),
      });
    }
    return points;
  }, [baseElevation]);

  return (
    <div className="w-full" style={{ height: '200px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" horizontal={true} vertical={false} />
          <XAxis dataKey="time" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
          <Area
            type="monotone"
            dataKey="elevation"
            stroke="var(--chart-line)"
            strokeWidth={2}
            fill="var(--chart-fill)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
