import { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getDistrictById } from '@/data/districts';
import { getRoversByDistrict } from '@/data/rovers';
import { getAlertsByDistrict } from '@/data/alerts';
import RoverMap from '@/components/RoverMap';
import StatusDot from '@/components/StatusDot';
import BatteryBar from '@/components/BatteryBar';
import UtilizationBar from '@/components/UtilizationBar';
import UtilizationChart from '@/components/UtilizationChart';
import ReadOnlyBadge from '@/components/ReadOnlyBadge';
import { ChevronRight, AlertTriangle, AlertCircle, Printer, Play, Pause, Search } from 'lucide-react';

export default function DistrictDetail() {
  const { districtId } = useParams<{ districtId: string }>();
  const navigate = useNavigate();

  const district = useMemo(() => getDistrictById(districtId || ''), [districtId]);
  const initialRovers = useMemo(() => district ? getRoversByDistrict(district.id) : [], [district]);
  const alerts = useMemo(() => district ? getAlertsByDistrict(district.id) : [], [district]);

  const [rovers, setRovers] = useState(initialRovers);
  const [isSimulating, setIsSimulating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline'>('all');
  const [batteryFilter, setBatteryFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  useEffect(() => {
    setRovers(initialRovers);
  }, [initialRovers]);

  useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(() => {
      setRovers(prev => prev.map(r => ({
        ...r,
        battery: Math.max(0, Math.min(100, r.battery + (Math.random() > 0.5 ? 1 : -2))),
        speed: r.status === 'online' ? Math.max(0, Math.min(40, r.speed + Math.floor(Math.random() * 5 - 2))) : 0,
        lastSync: new Date()
      })));
    }, 5000);
    return () => clearInterval(interval);
  }, [isSimulating]);

  const filteredRovers = useMemo(() => {
    return rovers.filter(r => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (batteryFilter === 'high' && r.battery <= 50) return false;
      if (batteryFilter === 'medium' && (r.battery > 50 || r.battery < 20)) return false;
      if (batteryFilter === 'low' && r.battery >= 20) return false;
      if (searchQuery && !r.id.toLowerCase().includes(searchQuery.toLowerCase()) && !r.ptsLicence.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [rovers, statusFilter, batteryFilter, searchQuery]);

  if (!district) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--void)', paddingTop: '48px' }}>
        <div className="text-center">
          <h2 className="font-display font-semibold text-xl mb-2" style={{ color: 'var(--text-primary)' }}>
            District Not Found
          </h2>
          <Link to="/" className="text-sm" style={{ color: 'var(--primary-cyan)' }}>
            &larr; Back to State Overview
          </Link>
        </div>
      </div>
    );
  }

  const activeRovers = rovers.filter(r => r.status === 'online').length;
  const avgUtil = rovers.reduce((sum, r) => {
    const avg = r.workingHours.reduce((a, b) => a + b, 0) / r.workingHours.length;
    return sum + (avg / 8) * 100;
  }, 0) / (rovers.length || 1);

  const corsConnected = district.corsStatus === 'connected';

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--void)', paddingTop: '48px' }}>
      {/* Breadcrumb & Header */}
      <div className="px-4 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="font-mono-data text-xs uppercase tracking-wider transition-colors no-print"
              style={{ color: 'var(--primary-cyan)' }}
            >
              STATE OVERVIEW
            </Link>
            <ChevronRight className="w-3 h-3 no-print" style={{ color: 'var(--text-muted)' }} />
            <h2 className="font-display font-semibold" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {district.name}
            </h2>
          </div>

          <div className="flex items-center gap-2 no-print">
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className="flex items-center gap-2 px-3 py-1.5 font-mono-data text-xs rounded transition-colors"
              style={{
                backgroundColor: isSimulating ? 'var(--danger-soft)' : 'var(--success-soft)',
                color: isSimulating ? 'var(--danger)' : 'var(--success)',
                border: `1px solid ${isSimulating ? 'var(--danger)' : 'var(--success)'}`
              }}
            >
              {isSimulating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              {isSimulating ? 'STOP SIMULATION' : 'SIMULATE LIVE'}
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-3 py-1.5 font-mono-data text-xs rounded transition-colors card-surface"
              style={{ color: 'var(--text-primary)' }}
            >
              <Printer className="w-3 h-3" />
              EXPORT PDF
            </button>
          </div>
        </div>

        {/* District Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'TOTAL ROVERS', value: rovers.length, color: 'var(--text-primary)' },
            { label: 'ACTIVE NOW', value: activeRovers, color: 'var(--primary-cyan)' },
            { label: 'AVG UTILIZATION', value: `${avgUtil.toFixed(1)}%`, color: 'var(--text-primary)', bar: true },
            { label: 'CORS STATUS', value: corsConnected ? 'Connected' : 'Disconnected', color: corsConnected ? 'var(--success)' : 'var(--danger)', dot: true },
          ].map((card, i) => (
            <div key={i} className="card-surface p-4 flex flex-col items-center justify-center text-center" style={{ minHeight: '80px' }}>
              <span className="font-mono-data text-xs uppercase mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
                {card.label}
              </span>
              {card.bar ? (
                <UtilizationBar percentage={avgUtil} />
              ) : card.dot ? (
                <StatusDot status={corsConnected ? 'connected' : 'disconnected'} />
              ) : (
                <span className="font-mono-data font-bold text-2xl" style={{ color: card.color, letterSpacing: '-0.02em' }}>
                  {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Rover Map & List */}
      <div className="px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-4" style={{ height: '520px' }}>
          {/* Map */}
          <div className="card-surface overflow-hidden">
            <RoverMap rovers={rovers} districtCentroid={district.centroid} />
          </div>

          {/* Rover List */}
          <div className="card-surface overflow-hidden flex flex-col">
            <div className="flex flex-wrap items-center justify-between p-3 border-b gap-2" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-medium text-sm uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  Rovers <ReadOnlyBadge />
                </h3>
                <span className="font-mono-data text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                  {filteredRovers.length} rovers
                </span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto no-print">
                <div className="relative">
                  <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search ID/Licence"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-7 pr-2 py-1 text-xs font-mono-data rounded outline-none w-32 focus:ring-1 focus:ring-primary-cyan transition-shadow"
                    style={{ backgroundColor: 'var(--void)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-2 py-1 text-xs font-mono-data rounded outline-none focus:ring-1 focus:ring-primary-cyan transition-shadow cursor-pointer"
                  style={{ backgroundColor: 'var(--void)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                >
                  <option value="all">Status: All</option>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </select>
                <select
                  value={batteryFilter}
                  onChange={(e) => setBatteryFilter(e.target.value as any)}
                  className="px-2 py-1 text-xs font-mono-data rounded outline-none focus:ring-1 focus:ring-primary-cyan transition-shadow cursor-pointer"
                  style={{ backgroundColor: 'var(--void)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                >
                  <option value="all">Battery: All</option>
                  <option value="high">&gt; 50%</option>
                  <option value="medium">20% - 50%</option>
                  <option value="low">&lt; 20%</option>
                </select>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <table className="w-full">
                <thead className="sticky top-0 z-10" style={{ backgroundColor: 'var(--surface)' }}>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    {['ROVER ID', 'LICENCE', 'BATTERY', 'SPEED', 'LAST SYNC', 'STATUS'].map((h) => (
                      <th key={h} className="font-mono-data font-medium text-xs uppercase p-2.5 text-left"
                        style={{ color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRovers.map((rover) => (
                    <tr
                      key={rover.id}
                      className="cursor-pointer transition-colors"
                      style={{ borderBottom: '1px solid var(--border-color)', height: '40px' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                      onClick={() => navigate(`/rover/${rover.id}`)}
                    >
                      <td className="p-2.5 font-mono-data text-xs" style={{ color: 'var(--primary-cyan)' }}>
                        {rover.id}
                      </td>
                      <td className="p-2.5 font-mono-data text-xs truncate max-w-[100px]" style={{ color: 'var(--text-secondary)' }}>
                        {rover.ptsLicence}
                      </td>
                      <td className="p-2.5">
                        <BatteryBar percentage={rover.battery} width={40} height={3} />
                      </td>
                      <td className="p-2.5 font-mono-data text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {rover.speed > 0 ? `${rover.speed} km/h` : '—'}
                      </td>
                      <td className="p-2.5 font-mono-data text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {getRelativeTime(rover.lastSync)}
                      </td>
                      <td className="p-2.5">
                        <StatusDot status={rover.status} size={5} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Chart */}
      <div className="px-4 lg:px-8 mt-4">
        <div className="card-surface p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-medium text-sm uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              7-DAY UTILIZATION <ReadOnlyBadge />
            </h3>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-0.5 inline-block" style={{ backgroundColor: 'var(--chart-line)' }} />
                <span className="font-mono-data text-xs" style={{ color: 'var(--text-muted)' }}>Hours Used</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-0.5 inline-block" style={{ borderTop: '2px dashed var(--border-color)' }} />
                <span className="font-mono-data text-xs" style={{ color: 'var(--text-muted)' }}>Target 6hr</span>
              </span>
            </div>
          </div>
          <UtilizationChart workingHours={rovers[0]?.workingHours || [0, 0, 0, 0, 0, 0, 0]} />
        </div>
      </div>

      {/* District Alerts */}
      {alerts.length > 0 && (
        <div className="px-4 lg:px-8 mt-4 mb-8">
          <div className="card-surface p-4">
            <h3 className="font-display font-medium text-sm uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              DISTRICT ALERTS <ReadOnlyBadge />
            </h3>
            <div className="flex flex-col gap-2">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 p-3 card-surface"
                  style={{ borderColor: alert.type === 'critical' ? 'var(--danger)' : 'var(--warning)' }}
                >
                  {alert.type === 'critical' ? (
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--danger)' }} />
                  ) : (
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--warning)' }} />
                  )}
                  <div>
                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{alert.message}</p>
                    <span className="font-mono-data text-xs" style={{ color: 'var(--text-muted)' }}>
                      {alert.timestamp.toLocaleTimeString('en-US', { hour12: false })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {alerts.length === 0 && <div className="mb-8" />}
    </div>
  );
}

function getRelativeTime(date: Date): string {
  const minutes = Math.floor((Date.now() - date.getTime()) / (1000 * 60));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
