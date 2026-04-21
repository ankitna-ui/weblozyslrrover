import type { Alert } from './types';
import { allRovers } from './rovers';

export function generateAlerts(): Alert[] {
  const alerts: Alert[] = [];

  // Outside area alerts
  const outsideRovers = allRovers.filter(r => r.status === 'online').slice(0, 8);
  outsideRovers.forEach((rover, i) => {
    alerts.push({
      id: `alert-out-${i}`,
      type: 'critical',
      message: `Rover ${rover.id} outside permitted survey area`,
      roverId: rover.id,
      districtId: rover.districtId,
      timestamp: new Date(Date.now() - randomInt(5, 120) * 60 * 1000),
    });
  });

  // Low battery alerts
  const lowBatteryRovers = allRovers.filter(r => r.battery < 20);
  lowBatteryRovers.forEach((rover, i) => {
    alerts.push({
      id: `alert-batt-${i}`,
      type: 'warning',
      message: `Battery below 20% on rover ${rover.id} (${rover.battery}%)`,
      roverId: rover.id,
      districtId: rover.districtId,
      timestamp: new Date(Date.now() - randomInt(10, 180) * 60 * 1000),
    });
  });

  // Inactive alerts
  const inactiveRovers = allRovers.filter(r => {
    const hoursSinceSync = (Date.now() - r.lastSync.getTime()) / (1000 * 60 * 60);
    return hoursSinceSync > 48 && r.status !== 'offline';
  }).slice(0, 6);
  inactiveRovers.forEach((rover, i) => {
    alerts.push({
      id: `alert-inact-${i}`,
      type: 'critical',
      message: `Rover ${rover.id} inactive for 48+ hours despite assignment`,
      roverId: rover.id,
      districtId: rover.districtId,
      timestamp: new Date(Date.now() - randomInt(60, 300) * 60 * 1000),
    });
  });

  // CORS disconnection alerts
  const corsDistricts = ['jangaon', 'mulugu', 'khammam'];
  corsDistricts.forEach((distId, i) => {
    alerts.push({
      id: `alert-cors-${i}`,
      type: 'warning',
      message: `No CORS connection for district (${randomInt(1, 4)} hours)`,
      roverId: null,
      districtId: distId,
      timestamp: new Date(Date.now() - randomInt(60, 240) * 60 * 1000),
    });
  });

  return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const allAlerts = generateAlerts();

export function getAlertsByDistrict(districtId: string): Alert[] {
  return allAlerts.filter(a => a.districtId === districtId);
}
