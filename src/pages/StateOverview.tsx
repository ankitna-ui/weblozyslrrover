import React, { useEffect, useRef, useState, useMemo, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { districts } from '@/data/districts';
import { allRovers } from '@/data/rovers';
import { allAlerts } from '@/data/alerts';
import DistrictMap from '@/components/DistrictMap';
import UtilizationBar from '@/components/UtilizationBar';
import StatusDot from '@/components/StatusDot';
import ReadOnlyBadge from '@/components/ReadOnlyBadge';
import { AlertTriangle, AlertCircle, ChevronRight, ShieldCheck, ShieldAlert, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const ParticleBackground = React.lazy(() => import('@/components/3d/ParticleBackground'));
const Globe = React.lazy(() => import('@/components/3d/Globe'));

gsap.registerPlugin(ScrollTrigger);

export default function StateOverview() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  const telemetryRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const alertsRef = useRef<HTMLDivElement>(null);

  const { userRole, assignedMultiZone, assignedZone, assignedDistrict } = useAuth();

  const filteredDistricts = useMemo(() => {
    if (!userRole) return districts; // Super Admin
    if (userRole === 'LEVEL1' && assignedMultiZone) return districts.filter(d => d.multiZone === assignedMultiZone);
    if (userRole === 'LEVEL2' && assignedZone) return districts.filter(d => d.zone === assignedZone);
    if (userRole === 'LEVEL3' && assignedDistrict) return districts.filter(d => d.id === assignedDistrict);
    return districts;
  }, [userRole, assignedMultiZone, assignedZone, assignedDistrict]);

  const filteredRovers = useMemo(() => {
    const districtIds = new Set(filteredDistricts.map(d => d.id));
    return allRovers.filter(r => districtIds.has(r.districtId));
  }, [filteredDistricts]);

  const [activeCount, setActiveCount] = useState(() =>
    filteredRovers.filter(r => r.status === 'online').length
  );
  const [alertFilter, setAlertFilter] = useState<'all' | 'critical' | 'warning'>('all');

  // Animate hero
  useEffect(() => {
    if (heroRef.current) {
      const chars1 = heroRef.current.querySelectorAll('.hero-char-1');
      const chars2 = heroRef.current.querySelectorAll('.hero-char-2');

      gsap.set([...chars1, ...chars2], { opacity: 0, y: 30 });

      const tl = gsap.timeline();
      tl.to(chars1, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.04,
        ease: 'power3.out',
      })
        .to(chars2, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.04,
          ease: 'power3.out',
        }, '-=0.4');

      return () => { tl.kill(); };
    }
  }, []);

  // Animate chips
  useEffect(() => {
    if (chipsRef.current) {
      gsap.fromTo(chipsRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out', delay: 0.8 }
      );
    }
  }, []);

  // Animate telemetry cards
  useEffect(() => {
    if (telemetryRef.current) {
      const cards = telemetryRef.current.querySelectorAll('.telemetry-card');
      gsap.fromTo(cards,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out', delay: 0.4 }
      );
    }
  }, []);

  // Animate table rows
  useEffect(() => {
    if (tableRef.current) {
      const rows = tableRef.current.querySelectorAll('.district-row');
      gsap.fromTo(rows,
        { opacity: 0, x: 12 },
        {
          opacity: 1, x: 0, duration: 0.3, stagger: 0.03, ease: 'power2.out',
          scrollTrigger: {
            trigger: tableRef.current,
            start: 'top 85%',
          },
        }
      );
    }
  }, []);

  // Animate alerts
  useEffect(() => {
    if (alertsRef.current) {
      const cards = alertsRef.current.querySelectorAll('.alert-card');
      gsap.fromTo(cards,
        { opacity: 0, x: 30 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out', delay: 0.6 }
      );
    }
  }, []);

  // Live active count simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCount(prev => {
        const change = Math.random() > 0.5 ? 1 : -1;
        return Math.max(Math.floor(filteredRovers.length * 0.7), Math.min(filteredRovers.length, prev + change));
      });
    }, 8000);
    return () => clearInterval(interval);
  }, [filteredRovers]);

  const totalRovers = filteredRovers.length;
  const inactiveCount = totalRovers - activeCount;
  const lowBatteryCount = filteredRovers.filter(r => r.battery < 20).length;
  
  const relevantAlerts = useMemo(() => {
    const districtIds = new Set(filteredDistricts.map(d => d.id));
    return allAlerts.filter(a => districtIds.has(a.districtId));
  }, [filteredDistricts]);

  const outsideAlerts = relevantAlerts.filter(a => a.message.includes('outside')).length;
  const connectedDistricts = filteredDistricts.filter(d => d.corsStatus === 'connected').length;
  const corsPercentage = ((connectedDistricts / (filteredDistricts.length || 1)) * 100).toFixed(1);

  const districtSummaries = useMemo(() => {
    return filteredDistricts.map((d) => {
      const rovers = filteredRovers.filter(r => r.districtId === d.id);
      const active = rovers.filter(r => r.status === 'online').length;
      const avgUtil = rovers.reduce((sum, r) => {
        const avg = r.workingHours.reduce((a, b) => a + b, 0) / r.workingHours.length;
        return sum + (avg / 8) * 100;
      }, 0) / (rovers.length || 1);

      let status: 'online' | 'offline' | 'degraded' = 'online';
      if (d.corsStatus === 'disconnected') status = 'offline';
      else if (d.corsStatus === 'degraded') status = 'degraded';
      else if (active / (rovers.length || 1) < 0.7) status = 'degraded';

      return {
        district: d,
        totalRovers: rovers.length,
        activeRovers: active,
        avgUtilization: avgUtil,
        status,
        multiZone: d.multiZone,
        zone: d.zone
      };
    });
  }, [filteredDistricts, filteredRovers]);

  const filteredAlerts = useMemo(() => {
    if (alertFilter === 'all') return relevantAlerts.slice(0, 8);
    return relevantAlerts.filter(a => a.type === alertFilter).slice(0, 8);
  }, [alertFilter, relevantAlerts]);

  const splitText = (text: string, className: string) => {
    return text.split('').map((char, i) => (
      <span
        key={i}
        className={className}
        style={{
          display: 'inline-block',
          willChange: 'transform, opacity',
        }}
      >
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
  };

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: 'var(--void)', paddingTop: '48px' }}>
      <Suspense fallback={null}>
        <ParticleBackground />
      </Suspense>

      {/* Hero Section */}
      <div ref={heroRef} className="px-4 lg:px-8 relative z-10" style={{ paddingBottom: '2rem', minHeight: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <h1 className="font-display font-bold leading-none" style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', letterSpacing: '-0.04em', color: 'var(--text-primary)' }}>
          <span style={{ display: 'flex', flexWrap: 'wrap' }}>
            {splitText('FIELD', 'hero-char-1')}
          </span>
          <span style={{ display: 'flex', flexWrap: 'wrap' }}>
            {splitText('SURVEILLANCE', 'hero-char-2')}
          </span>
        </h1>

        <div ref={chipsRef} className="flex flex-wrap gap-2 mt-4">
          <span className="font-mono-data text-xs px-3 py-1.5 card-surface flex items-center gap-2" style={{ color: 'var(--primary-cyan)', letterSpacing: '0.04em' }}>
            {userRole === 'LEVEL1' ? <ShieldCheck className="w-3.5 h-3.5" /> : userRole === 'LEVEL2' ? <Shield className="w-3.5 h-3.5" /> : userRole === 'LEVEL3' ? <ShieldAlert className="w-3.5 h-3.5" /> : null}
            {userRole === 'LEVEL1' ? `MZ ${assignedMultiZone} ACCESS` : 
             userRole === 'LEVEL2' ? `ZONE ${assignedZone} ACCESS` : 
             userRole === 'LEVEL3' ? `${assignedDistrict?.toUpperCase()} ACCESS` : 
             'STATE ADMIN ACCESS'}
          </span>
          <span className="font-mono-data text-xs px-3 py-1.5 card-surface" style={{ color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>
            {totalRovers} ACTIVE ROVERS
          </span>
          <span className="font-mono-data text-xs px-3 py-1.5 card-surface" style={{ color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>
            {filteredDistricts.length} DISTRICTS
          </span>
        </div>
      </div>

      {/* Telemetry Summary Strip */}
      <div className="px-4 lg:px-8" ref={telemetryRef}>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { label: 'ACTIVE', value: activeCount, sub: `${((activeCount / totalRovers) * 100).toFixed(1)}%`, color: 'var(--primary-cyan)' },
            { label: 'INACTIVE', value: inactiveCount, sub: `${((inactiveCount / totalRovers) * 100).toFixed(1)}%`, color: 'var(--danger)' },
            { label: 'LOW BATTERY', value: lowBatteryCount, sub: '< 20% charge', color: 'var(--warning)' },
            { label: 'AREA ALERTS', value: outsideAlerts, sub: 'Outside permitted zone', color: 'var(--danger)' },
            { label: 'CORS CONNECTIVITY', value: `${corsPercentage}%`, sub: `${connectedDistricts}/${districts.length} districts`, color: 'var(--success)' },
          ].map((card, i) => (
            <div key={i} className="telemetry-card card-surface p-5 flex flex-col items-center justify-center text-center" style={{ minHeight: '100px' }}>
              <span className="font-mono-data text-xs uppercase mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
                {card.label}
              </span>
              <span className="font-mono-data font-bold" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', lineHeight: 1, color: card.color, letterSpacing: '-0.02em' }}>
                {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
              </span>
              <span className="font-mono-data text-xs mt-1" style={{ color: card.color === 'var(--danger)' ? 'var(--danger-dim)' : card.color }}>
                {card.sub}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* District Map & Table */}
      <div className="px-4 lg:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-4" style={{ height: '500px' }}>
          {/* Map */}
          <div className="card-surface overflow-hidden relative" style={{ backgroundColor: 'var(--map-bg)' }}>
            <div className="block lg:hidden h-full">
              <DistrictMap onDistrictSelect={(id) => navigate(`/district/${id}`)} />
            </div>
            <div className="hidden lg:block h-full">
              <Suspense fallback={<div className="flex items-center justify-center h-full"><span className="pulse-dot w-4 h-4 rounded-full bg-primary-cyan"></span></div>}>
                <Globe filteredDistricts={filteredDistricts} />
              </Suspense>
            </div>
          </div>

          {/* District Table */}
          <div className="card-surface overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <h3 className="font-display font-medium text-sm uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                Districts <ReadOnlyBadge />
              </h3>
              <span className="font-mono-data text-xs" style={{ color: 'var(--text-muted)' }}>
                {districts.length} districts
              </span>
            </div>
            <div ref={tableRef} className="flex-1 overflow-y-auto custom-scrollbar">
              <table className="w-full">
                <thead className="sticky top-0 z-10" style={{ backgroundColor: 'var(--surface)' }}>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    {['MULTI ZONE', 'ZONE', 'DISTRICT', 'ROVERS', 'ACTIVE', 'UTILIZATION', 'STATUS'].map((h) => (
                      <th key={h} className="font-mono-data font-medium text-xs uppercase p-3 text-left"
                        style={{ color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {districtSummaries.map((summary) => (
                    <tr
                      key={summary.district.id}
                      className="district-row cursor-pointer transition-colors"
                      style={{ borderBottom: '1px solid var(--border-color)', height: '44px' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                      onClick={() => navigate(`/district/${summary.district.id}`)}
                    >
                      <td className="p-3 text-sm text-center font-mono-data" style={{ color: 'var(--text-secondary)' }}>
                        {summary.multiZone}
                      </td>
                      <td className="p-3 text-sm text-center font-mono-data" style={{ color: 'var(--text-secondary)' }}>
                        {summary.zone}
                      </td>
                      <td className="p-3 text-sm" style={{ color: 'var(--text-primary)' }}>
                        {summary.district.name}
                      </td>
                      <td className="p-3 text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
                        {summary.totalRovers}
                      </td>
                      <td className="p-3 text-sm text-center" style={{ color: 'var(--success)' }}>
                        {summary.activeRovers}
                      </td>
                      <td className="p-3">
                        <UtilizationBar percentage={summary.avgUtilization} />
                      </td>
                      <td className="p-3">
                        <StatusDot status={summary.status} size={6} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="px-4 lg:px-8 mt-6 mb-8">
        <div className="card-surface p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-medium text-sm uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              LIVE ALERTS <ReadOnlyBadge />
            </h3>
            <div className="flex gap-1">
              {(['all', 'critical', 'warning'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setAlertFilter(filter)}
                  className="font-mono-data text-xs uppercase px-2.5 py-1 transition-colors"
                  style={{
                    backgroundColor: alertFilter === filter ? 'var(--primary-cyan)' : 'transparent',
                    color: alertFilter === filter ? 'var(--void)' : 'var(--text-secondary)',
                    border: `1px solid ${alertFilter === filter ? 'var(--primary-cyan)' : 'var(--border-color)'}`,
                  }}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div ref={alertsRef} className="flex gap-3 overflow-x-auto custom-scrollbar pb-2">
            {filteredAlerts.map((alert) => {
              const district = districts.find(d => d.id === alert.districtId);
              return (
                <div
                  key={alert.id}
                  className="alert-card flex-shrink-0 p-3.5 card-surface"
                  style={{
                    width: '280px',
                    borderColor: alert.type === 'critical' ? 'var(--danger)' : 'var(--warning)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {alert.type === 'critical' ? (
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--danger)' }} />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--warning)' }} />
                    )}
                    <span className="font-mono-data text-xs" style={{ color: 'var(--text-muted)' }}>
                      {alert.timestamp.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm mb-2 line-clamp-2" style={{ color: 'var(--text-primary)' }}>
                    {alert.message}
                  </p>
                  {alert.roverId && (
                    <p className="font-mono-data text-xs mb-1" style={{ color: 'var(--primary-cyan)' }}>
                      {alert.roverId}
                    </p>
                  )}
                  <p className="font-mono-data text-xs flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                    <ChevronRight className="w-3 h-3" />
                    {district?.name || alert.districtId}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
