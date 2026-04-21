interface StatusDotProps {
  status: 'online' | 'offline' | 'low-battery' | 'degraded' | 'connected' | 'disconnected';
  size?: number;
  showLabel?: boolean;
}

const statusColors: Record<string, string> = {
  online: 'var(--success)',
  connected: 'var(--success)',
  offline: 'var(--danger)',
  disconnected: 'var(--danger)',
  'low-battery': 'var(--warning)',
  degraded: 'var(--warning)',
};

const statusLabels: Record<string, string> = {
  online: 'Online',
  connected: 'Connected',
  offline: 'Offline',
  disconnected: 'Disconnected',
  'low-battery': 'Low Battery',
  degraded: 'Degraded',
};

export default function StatusDot({ status, size = 6, showLabel = true }: StatusDotProps) {
  const color = statusColors[status] || 'var(--text-muted)';
  const label = statusLabels[status] || status;

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="rounded-full flex-shrink-0"
        style={{
          width: size,
          height: size,
          backgroundColor: color,
        }}
      />
      {showLabel && (
        <span className="font-mono-data text-xs tracking-wider" style={{ color }}>
          {label.toUpperCase()}
        </span>
      )}
    </span>
  );
}
