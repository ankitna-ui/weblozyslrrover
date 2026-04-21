interface BatteryBarProps {
  percentage: number;
  width?: number;
  height?: number;
}

export default function BatteryBar({ percentage, width = 40, height = 3 }: BatteryBarProps) {
  const getColor = () => {
    if (percentage <= 20) return 'var(--danger)';
    if (percentage <= 40) return 'var(--warning)';
    return 'var(--success)';
  };

  return (
    <span className="inline-flex items-center gap-2">
      <span className="font-mono-data text-xs" style={{ color: getColor() }}>
        {percentage}%
      </span>
      <span
        className="inline-block flex-shrink-0"
        style={{
          width,
          height,
          backgroundColor: 'var(--border-color)',
          borderRadius: '1px',
          overflow: 'hidden',
        }}
      >
        <span
          className="block h-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            backgroundColor: getColor(),
          }}
        />
      </span>
    </span>
  );
}
