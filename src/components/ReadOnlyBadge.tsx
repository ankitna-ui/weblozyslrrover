import { Lock } from 'lucide-react';

export default function ReadOnlyBadge() {
  return (
    <span className="inline-flex items-center gap-1 group relative">
      <Lock className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-secondary)',
        }}>
        Read-Only Access
      </span>
    </span>
  );
}
