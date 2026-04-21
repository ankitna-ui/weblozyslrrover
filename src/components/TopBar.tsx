import { useCurrentTime } from '@/hooks/useLiveData';
// Icons imported as needed
import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

export default function TopBar() {
  const time = useCurrentTime();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 lg:px-8"
      style={{
        height: '48px',
        backgroundColor: 'var(--void)',
        borderBottom: '1px solid var(--border-color)',
        transition: 'background-color 0.3s ease, border-color 0.3s ease'
      }}
    >
      <div className="flex items-center gap-3">
        <span className="font-display font-medium text-sm tracking-wider uppercase"
          style={{ color: 'var(--text-primary)' }}>
          TELANGANA S&LR
        </span>
        <span style={{ width: '1px', height: '16px', backgroundColor: 'var(--border-color)', transition: 'background-color 0.3s ease' }} />
        <span className="font-display font-medium text-sm tracking-wider uppercase"
          style={{ color: 'var(--primary-cyan)' }}>
          ROVER COMMAND
        </span>
      </div>

      <div className="flex items-center gap-4">
        <Link
          to="/performance"
          className="hidden sm:block font-mono-data text-xs tracking-wider uppercase transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary-cyan)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          Performance
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full pulse-dot" style={{ backgroundColor: 'var(--success)' }} />
          <span className="font-mono-data text-xs tracking-wider uppercase" style={{ color: 'var(--success)' }}>
            SYSTEM ONLINE
          </span>
        </div>
        <span className="font-mono-data text-xs hidden sm:inline" style={{ color: 'var(--text-secondary)' }}>
          {time.toISOString().replace('T', ' ').slice(0, 19)} UTC
        </span>
        <ThemeToggle />
      </div>
    </header>
  );
}
