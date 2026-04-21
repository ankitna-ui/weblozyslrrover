interface UtilizationBarProps {
  percentage: number;
  width?: number;
  height?: number;
}

export default function UtilizationBar({ percentage, width = 80, height = 4 }: UtilizationBarProps) {
  return (
    <span className="inline-flex items-center gap-2">
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
            width: `${Math.min(percentage, 100)}%`,
            backgroundColor: 'var(--primary-cyan)',
          }}
        />
      </span>
      <span className="font-mono-data text-xs" style={{ color: 'var(--text-secondary)' }}>
        {percentage.toFixed(1)}%
      </span>
    </span>
  );
}
