export interface District {
  id: string;
  name: string;
  code: string;
  roverCount: number;
  centroid: [number, number]; // [lat, lng]
  corsStatus: 'connected' | 'disconnected' | 'degraded';
  multiZone: number;
  zone: number;
}

export interface Rover {
  id: string;
  districtId: string;
  ptsLicence: string;
  deviceName: string;
  surveyorName: string;
  battery: number;
  dischargeRate: number;
  status: 'online' | 'offline' | 'low-battery';
  speed: number;
  accuracy: number;
  satellites: number;
  lat: number;
  lng: number;
  lastSync: Date;
  workingHours: number[]; // 7 days
  pointsCollected: number;
  fileNumber: string;
  workLocation: string;
  elevation: number;
  heading: number;
}

export interface Alert {
  id: string;
  type: 'critical' | 'warning';
  message: string;
  roverId: string | null;
  districtId: string;
  timestamp: Date;
}

export interface LogEntry {
  timestamp: Date;
  level: 'ok' | 'warn' | 'err';
  message: string;
}

export interface DistrictSummary {
  district: District;
  totalRovers: number;
  activeRovers: number;
  avgUtilization: number;
  status: 'online' | 'offline' | 'degraded';
}
