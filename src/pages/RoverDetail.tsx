import { useMemo, useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getRoverById } from '@/data/rovers';
import { getDistrictById } from '@/data/districts';
import ElevationChart from '@/components/ElevationChart';
import ReadOnlyBadge from '@/components/ReadOnlyBadge';
import { ChevronRight, Lock, Crosshair } from 'lucide-react';
import ButtonSpinner from '@/components/loaders/ButtonSpinner';

export default function RoverDetail() {
  const { roverId } = useParams<{ roverId: string }>();
  const navigate = useNavigate();

  const baseRover = useMemo(() => getRoverById(roverId || ''), [roverId]);
  const district = useMemo(() => baseRover ? getDistrictById(baseRover.districtId) : undefined, [baseRover]);

  const [liveBattery, setLiveBattery] = useState(baseRover?.battery || 0);
  const [liveSpeed, setLiveSpeed] = useState(baseRover?.speed || 0);
  const [logs, setLogs] = useState<Array<{ timestamp: Date; level: 'ok' | 'warn' | 'err'; message: string }>>([]);
  const [isOffline, setIsOffline] = useState(false);
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  const rover = useMemo(() => (baseRover ? { ...baseRover, battery: liveBattery, speed: liveSpeed } : undefined), [baseRover, liveBattery, liveSpeed]);

  // Check offline status
  useEffect(() => {
    if (rover) {
      const minutesSinceSync = (Date.now() - rover.lastSync.getTime()) / (1000 * 60);
      setIsOffline(minutesSinceSync > 15);
    }
  }, [rover]);

  // Live data simulation
  useEffect(() => {
    if (!rover || isOffline) return;

    const speedInterval = setInterval(() => {
      setLiveSpeed(prev => {
        const jitter = (Math.random() - 0.5) * 4;
        return Math.max(0, parseFloat((prev + jitter).toFixed(1)));
      });
    }, 3000);

    const batteryInterval = setInterval(() => {
      setLiveBattery(prev => Math.max(0, parseFloat((prev + rover.dischargeRate * 0.05).toFixed(1))));
    }, 30000);

    return () => {
      clearInterval(speedInterval);
      clearInterval(batteryInterval);
    };
  }, [rover, isOffline]);

  // Log simulation
  useEffect(() => {
    if (!rover) return;

    const templates = [
      { level: 'ok' as const, message: `GPS fix acquired (Accuracy: ${rover.accuracy}m)` },
      { level: 'ok' as const, message: `Syncing batch #${Math.floor(Math.random() * 5000 + 1000)}... Success` },
      { level: 'ok' as const, message: `Telemetry update: Battery ${liveBattery.toFixed(0)}%` },
      { level: 'ok' as const, message: `New point registered: ID-${Math.floor(Math.random() * 9000 + 1000)}` },
      { level: 'warn' as const, message: 'Signal strength fluctuating' },
      { level: 'ok' as const, message: 'CORS connection stable' },
      { level: 'err' as const, message: 'Packet timeout, retrying...' },
    ];

    const interval = setInterval(() => {
      const tmpl = templates[Math.floor(Math.random() * templates.length)];
      setLogs(prev => [{
        timestamp: new Date(),
        level: tmpl.level,
        message: tmpl.message,
      }, ...prev].slice(0, 50));
    }, 5000);

    // Initial logs
    setLogs([
      { timestamp: new Date(Date.now() - 120000), level: 'ok', message: 'Session initialized' },
      { timestamp: new Date(Date.now() - 90000), level: 'ok', message: `GPS fix acquired (Accuracy: ${rover.accuracy}m)` },
      { timestamp: new Date(Date.now() - 60000), level: 'ok', message: `Syncing batch #4091... Success` },
      { timestamp: new Date(Date.now() - 30000), level: 'ok', message: `Telemetry update: Battery ${rover.battery}%` },
    ]);

    return () => clearInterval(interval);
  }, [rover, liveBattery]);

  const runDiagnostic = () => {
    setIsDiagnosing(true);
    setTimeout(() => {
      setIsDiagnosing(false);
      setLogs(prev => [{
        timestamp: new Date(),
        level: 'ok' as const,
        message: 'System diagnostic completed. All systems nominal.',
      }, ...prev].slice(0, 50));
    }, 2000);
  };

  if (!rover || !district) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--void)', paddingTop: '48px' }}>
        <div className="text-center">
          <h2 className="font-display font-semibold text-xl mb-2" style={{ color: 'var(--text-primary)' }}>
            Rover Not Found
          </h2>
          <Link to="/" className="text-sm" style={{ color: 'var(--primary-cyan)' }}>
            &larr; Back to State Overview
          </Link>
        </div>
      </div>
    );
  }

  const batteryColor = rover.battery <= 20 ? 'var(--danger)' : rover.battery <= 40 ? 'var(--warning)' : 'var(--success)';
  const totalHours = rover.workingHours.reduce((a, b) => a + b, 0);
  const avgHours = (totalHours / rover.workingHours.length).toFixed(1);

  const usageDates = useMemo(() => {
    const now = Date.now();
    const today = new Date().getDay();
    return rover.workingHours.map((_, i) => ({
      dayIndex: (today - 1 - (6 - i) + 7) % 7,
      date: new Date(now - (6 - i) * 24 * 60 * 60 * 1000)
    }));
  }, [rover.workingHours]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--void)', paddingTop: '48px' }}>
      {/* Breadcrumb */}
      <div className="px-4 lg:px-8 py-6">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <Link to="/" className="font-mono-data text-xs uppercase tracking-wider" style={{ color: 'var(--primary-cyan)' }}>
            STATE OVERVIEW
          </Link>
          <ChevronRight className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
          <button
            onClick={() => navigate(`/district/${district.id}`)}
            className="font-mono-data text-xs uppercase tracking-wider"
            style={{ color: 'var(--primary-cyan)' }}
          >
            {district.name.toUpperCase()}
          </button>
          <ChevronRight className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
          <h2 className="font-display font-semibold" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {rover.id}
          </h2>
        </div>

        {/* Rover Identity Card */}
        <div className="card-surface p-5 relative">
          <div className="absolute top-4 right-4 no-print z-10 hidden sm:block">
            <button
              onClick={runDiagnostic}
              disabled={isDiagnosing}
              className="px-3 py-1.5 font-mono-data text-xs rounded transition-colors flex items-center gap-2"
              style={{
                backgroundColor: isDiagnosing ? 'var(--border-color)' : 'var(--primary-cyan)',
                color: isDiagnosing ? 'var(--text-muted)' : 'var(--void)',
              }}
            >
              {isDiagnosing ? <ButtonSpinner size="h-3 w-3" color="text-current" /> : null}
              {isDiagnosing ? 'RUNNING...' : 'RUN DIAGNOSTIC'}
            </button>
          </div>
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            {/* Left: Icon + ID */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="relative">
                <Crosshair className="w-12 h-12" style={{ color: 'var(--primary-cyan)', opacity: 0.2 }} />
                <span className="absolute inset-0 flex items-center justify-center font-mono-data font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                  {rover.id.split('-')[2]}
                </span>
              </div>
              <div>
                <h2 className="font-mono-data font-bold text-2xl" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                  {rover.id}
                </h2>
                <p className="font-mono-data text-xs" style={{ color: 'var(--text-secondary)' }}>{rover.deviceName}</p>
              </div>
            </div>

            {/* Center: Key-Value Pairs */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 lg:ml-8">
              <div>
                <span className="font-mono-data text-xs uppercase block mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.06em' }}>Licence Key</span>
                <span className="font-mono-data text-sm" style={{ color: 'var(--text-primary)' }}>{rover.ptsLicence}</span>
              </div>
              <div>
                <span className="font-mono-data text-xs uppercase block mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.06em' }}>District</span>
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{district.name}</span>
              </div>
              <div>
                <span className="font-mono-data text-xs uppercase block mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.06em' }}>Surveyor</span>
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{rover.surveyorName}</span>
              </div>
            </div>

            {/* Right: Status Badge */}
            <div className="flex-shrink-0">
              <span
                className="inline-flex items-center gap-2 px-4 py-2 rounded-sm font-mono-data text-xs uppercase tracking-wider"
                style={{
                  backgroundColor: isOffline ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  color: isOffline ? 'var(--danger)' : 'var(--success)',
                  border: `1px solid ${isOffline ? 'var(--danger)' : 'var(--success)'}`,
                }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: isOffline ? 'var(--danger)' : 'var(--success)' }} />
                {isOffline ? 'OFFLINE' : 'ONLINE'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Offline Mode Banner */}
      {isOffline && (
        <div className="px-4 lg:px-8 mb-4">
          <div
            className="flex items-center gap-3 px-5 py-3"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--danger)',
            }}
          >
            <Lock className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--danger)' }} />
            <div>
              <span className="text-sm font-medium" style={{ color: 'var(--danger)' }}>
                OFFLINE MODE — Viewing Local Database (Read-Only)
              </span>
              <p className="font-mono-data text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Last Sync: {rover.lastSync.toLocaleString('en-US', { hour12: false })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Telemetry Cards */}
      <div className="px-4 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Speed */}
          <div className="card-surface p-4 flex flex-col justify-center" style={{ minHeight: '90px' }}>
            <span className="font-mono-data text-xs uppercase mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.06em' }}>Speed</span>
            <span className="font-mono-data font-bold" style={{ fontSize: '2rem', lineHeight: 1, color: 'var(--primary-cyan)' }}>
              {liveSpeed.toFixed(1)}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono-data text-xs" style={{ color: 'var(--text-muted)' }}>km/h</span>
              <span className="font-mono-data text-xs" style={{ color: 'var(--text-secondary)' }}>ACCURACY: {rover.accuracy}m</span>
            </div>
          </div>

          {/* Battery */}
          <div className="card-surface p-4 flex flex-col justify-center" style={{ minHeight: '90px' }}>
            <span className="font-mono-data text-xs uppercase mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.06em' }}>Battery</span>
            <span className="font-mono-data font-bold" style={{ fontSize: '2rem', lineHeight: 1, color: batteryColor }}>
              {liveBattery.toFixed(0)}%
            </span>
            <span className="font-mono-data text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Discharging ({rover.dischargeRate}%/hr)
            </span>
          </div>

          {/* Satellites */}
          <div className="card-surface p-4 flex flex-col justify-center" style={{ minHeight: '90px' }}>
            <span className="font-mono-data text-xs uppercase mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.06em' }}>Satellites</span>
            <span className="font-mono-data font-bold" style={{ fontSize: '2rem', lineHeight: 1, color: 'var(--text-primary)' }}>
              {rover.satellites}
            </span>
            <span className="font-mono-data text-xs mt-1" style={{ color: rover.satellites > 8 ? 'var(--success)' : 'var(--warning)' }}>
              GPS SIGNAL: {rover.satellites > 8 ? 'Strong' : rover.satellites > 4 ? 'Fair' : 'Weak'}
            </span>
          </div>

          {/* Points Collected */}
          <div className="card-surface p-4 flex flex-col justify-center" style={{ minHeight: '90px' }}>
            <span className="font-mono-data text-xs uppercase mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.06em' }}>Points Collected</span>
            <span className="font-mono-data font-bold" style={{ fontSize: '2rem', lineHeight: 1, color: 'var(--primary-cyan)' }}>
              {rover.pointsCollected.toLocaleString()}
            </span>
            <span className="font-mono-data text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              +12 since last sync
            </span>
          </div>
        </div>
      </div>

      {/* Elevation Profile */}
      <div className="px-4 lg:px-8 mt-4">
        <div className="card-surface p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-medium text-sm uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              ELEVATION PROFILE (LIVE) <ReadOnlyBadge />
            </h3>
            <span className="font-mono-data text-xs" style={{ color: 'var(--text-muted)' }}>Last 10 min</span>
          </div>
          <ElevationChart baseElevation={rover.elevation} />
        </div>
      </div>

      {/* Work Order & Usage History */}
      <div className="px-4 lg:px-8 mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Work Order */}
          <div className="card-surface p-4">
            <h3 className="font-display font-medium text-sm uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              WORK ORDER <ReadOnlyBadge />
            </h3>
            <div className="space-y-3">
              <div>
                <span className="font-mono-data text-xs uppercase block mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.06em' }}>File Number</span>
                <span className="font-mono-data text-sm" style={{ color: 'var(--text-primary)' }}>{rover.fileNumber}</span>
              </div>
              <div>
                <span className="font-mono-data text-xs uppercase block mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.06em' }}>Work Location</span>
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{rover.workLocation}</span>
              </div>
              <div>
                <span className="font-mono-data text-xs uppercase block mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.06em' }}>District</span>
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{district.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2" style={{ borderTop: '1px solid var(--border-color)' }}>
                <div>
                  <span className="font-mono-data text-xs uppercase block mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.06em' }}>Total Hours (7d)</span>
                  <span className="font-mono-data font-bold text-lg" style={{ color: 'var(--primary-cyan)' }}>{totalHours}h</span>
                </div>
                <div>
                  <span className="font-mono-data text-xs uppercase block mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.06em' }}>Avg/Day</span>
                  <span className="font-mono-data font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{avgHours}h</span>
                </div>
              </div>
            </div>
          </div>

          {/* Usage History */}
          <div className="card-surface p-4">
            <h3 className="font-display font-medium text-sm uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              USAGE HISTORY <ReadOnlyBadge />
            </h3>
            <div className="space-y-2">
              {rover.workingHours.map((hours, i) => {
                const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                const currDate = usageDates[i];
                return (
                  <div key={i} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <div className="flex items-center gap-3">
                      <span className="font-mono-data text-xs w-8" style={{ color: 'var(--text-secondary)' }}>{dayNames[currDate.dayIndex]}</span>
                      <span className="font-mono-data text-xs" style={{ color: 'var(--text-muted)' }}>
                        {currDate.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-1.5" style={{ backgroundColor: 'var(--border-color)', borderRadius: '1px', overflow: 'hidden' }}>
                        <div className="h-full" style={{ width: `${(hours / 8) * 100}%`, backgroundColor: hours >= 6 ? 'var(--success)' : hours >= 3 ? 'var(--primary-cyan)' : 'var(--warning)' }} />
                      </div>
                      <span className="font-mono-data text-xs w-10 text-right" style={{ color: 'var(--text-primary)' }}>{hours}h</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* System Log */}
      <div className="px-4 lg:px-8 mt-4 mb-8">
        <div className="card-surface p-4">
          <h3 className="font-display font-medium text-sm uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            SYSTEM LOG <ReadOnlyBadge />
          </h3>
          <div className="overflow-y-auto custom-scrollbar font-mono-data text-xs" style={{ maxHeight: '200px' }}>
            {logs.map((log, i) => (
              <div key={i} className="py-1 flex items-start gap-2">
                <span style={{ color: 'var(--text-muted)' }}>
                  [{log.timestamp.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
                </span>
                <span style={{
                  color: log.level === 'ok' ? 'var(--success)' : log.level === 'warn' ? 'var(--warning)' : 'var(--danger)',
                }}>
                  [{log.level.toUpperCase()}]
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
