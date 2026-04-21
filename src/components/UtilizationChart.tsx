import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from 'recharts';

interface UtilizationChartProps {
  workingHours: number[];
}

export default function UtilizationChart({ workingHours }: UtilizationChartProps) {
  const data = useMemo(() => {
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date().getDay();
    const adjustedDays = [];
    for (let i = 6; i >= 0; i--) {
      const dayIndex = (today - 1 - i + 7) % 7;
      adjustedDays.push(dayNames[dayIndex]);
    }

    return adjustedDays.map((day, i) => ({
      day,
      hours: workingHours[i] || 0,
    }));
  }, [workingHours]);

  return (
    <div className="w-full" style={{ height: '220px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
          <XAxis dataKey="day" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} domain={[0, 8]} ticks={[0, 2, 4, 6, 8]} />
          <ReferenceLine y={6} stroke="var(--border-color)" strokeDasharray="4 4" />
          <Line
            type="monotone"
            dataKey="hours"
            stroke="var(--chart-line)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
