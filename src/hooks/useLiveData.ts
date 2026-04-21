import { useState, useEffect, useRef, useCallback } from 'react';
import type { Rover, LogEntry } from '@/data/types';
import { allRovers } from '@/data/rovers';

export function useLiveData(enabled: boolean) {
  const [rovers, setRovers] = useState<Rover[]>(allRovers);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeCount, setActiveCount] = useState(() => 
    allRovers.filter(r => r.status === 'online').length
  );
  const intervalRefs = useRef<number[]>([]);

  const addLog = useCallback((level: LogEntry['level'], message: string) => {
    setLogs(prev => [{
      timestamp: new Date(),
      level,
      message,
    }, ...prev].slice(0, 100));
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Fluctuate active count
    const activeInterval = window.setInterval(() => {
      setActiveCount(prev => {
        const change = Math.random() > 0.5 ? 1 : -1;
        const next = prev + change;
        return Math.max(320, Math.min(380, next));
      });
    }, 8000);
    intervalRefs.current.push(activeInterval);

    // Decrease battery
    const batteryInterval = window.setInterval(() => {
      setRovers(prev => prev.map(r => {
        if (r.status === 'offline') return r;
        const newBattery = Math.max(0, parseFloat((r.battery + r.dischargeRate * 0.1).toFixed(1)));
        return { ...r, battery: newBattery };
      }));
    }, 30000);
    intervalRefs.current.push(batteryInterval);

    // Jitter speed
    const speedInterval = window.setInterval(() => {
      setRovers(prev => prev.map(r => {
        if (r.status !== 'online') return r;
        const jitter = (Math.random() - 0.5) * 4;
        const newSpeed = Math.max(0, parseFloat((r.speed + jitter).toFixed(1)));
        return { ...r, speed: newSpeed };
      }));
    }, 3000);
    intervalRefs.current.push(speedInterval);

    // Add log entries
    const logMessages: { level: LogEntry['level']; message: string }[] = [
      { level: 'ok', message: 'GPS fix acquired (Accuracy: 1.2m)' },
      { level: 'ok', message: 'Syncing batch #{n}... Success' },
      { level: 'ok', message: 'Telemetry update: Battery {p}%' },
      { level: 'ok', message: 'New point registered: ID-{id}' },
      { level: 'warn', message: 'Signal strength fluctuating' },
      { level: 'ok', message: 'CORS connection stable' },
      { level: 'err', message: 'Packet timeout, retrying...' },
      { level: 'ok', message: 'Batch sync completed ({n} points)' },
    ];

    const logInterval = window.setInterval(() => {
      const template = logMessages[Math.floor(Math.random() * logMessages.length)];
      let message = template.message;
      if (message.includes('{n}')) message = message.replace('{n}', String(Math.floor(Math.random() * 5000) + 1000));
      if (message.includes('{p}')) message = message.replace('{p}', String(Math.floor(Math.random() * 40) + 60));
      if (message.includes('{id}')) message = message.replace('{id}', String(Math.floor(Math.random() * 9000) + 1000));
      addLog(template.level, message);
    }, 5000);
    intervalRefs.current.push(logInterval);

    // Initial logs
    addLog('ok', 'System initialized — Rover Command v2.4.1');
    addLog('ok', 'Connected to 34 district monitoring stations');
    addLog('ok', 'CORS base stations: 31/34 online');

    return () => {
      intervalRefs.current.forEach(clearInterval);
      intervalRefs.current = [];
    };
  }, [enabled, addLog]);

  const getRover = useCallback((roverId: string) => {
    return rovers.find(r => r.id === roverId) || allRovers.find(r => r.id === roverId);
  }, [rovers]);

  const getDistrictRovers = useCallback((districtId: string) => {
    return rovers.filter(r => r.districtId === districtId);
  }, [rovers]);

  return { rovers, activeCount, logs, getRover, getDistrictRovers, addLog };
}

export function useCurrentTime() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return time;
}
