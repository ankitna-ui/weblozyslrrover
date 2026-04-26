import type { District } from './types';

export const districts: District[] = [
  { id: 'adilabad', name: 'Adilabad', code: 'ADL', roverCount: 11, centroid: [19.66, 78.53], corsStatus: 'connected', multiZone: 1, zone: 1 },
  { id: 'bhadradi-kothagudem', name: 'Bhadradi-Kothagudem', code: 'BDK', roverCount: 17, centroid: [17.55, 80.3], corsStatus: 'connected', multiZone: 1, zone: 1 },
  { id: 'hanumakonda', name: 'Hanumakonda', code: 'HNK', roverCount: 8, centroid: [17.98, 79.6], corsStatus: 'connected', multiZone: 1, zone: 1 },
  { id: 'hyderabad', name: 'Hyderabad', code: 'HYD', roverCount: 9, centroid: [17.38, 78.48], corsStatus: 'connected', multiZone: 1, zone: 2 },
  { id: 'jagitial', name: 'Jagitial', code: 'JGL', roverCount: 25, centroid: [18.8, 78.92], corsStatus: 'connected', multiZone: 1, zone: 2 },
  { id: 'jangaon', name: 'Jangaon', code: 'JGN', roverCount: 7, centroid: [17.73, 79.18], corsStatus: 'disconnected', multiZone: 1, zone: 2 },
  { id: 'jayashankar-bhupalpally', name: 'Jayashankar-Bhupalpally', code: 'JBP', roverCount: 7, centroid: [18.22, 79.87], corsStatus: 'connected', multiZone: 1, zone: 3 },
  { id: 'jogulamba-gadwal', name: 'Jogulamba-Gadwal', code: 'JGD', roverCount: 7, centroid: [16.23, 77.8], corsStatus: 'connected', multiZone: 1, zone: 3 },
  { id: 'kamareddy', name: 'Kamareddy', code: 'KMD', roverCount: 14, centroid: [18.32, 78.33], corsStatus: 'connected', multiZone: 1, zone: 3 },
  { id: 'karimnagar', name: 'Karimnagar', code: 'KRM', roverCount: 9, centroid: [18.44, 79.13], corsStatus: 'connected', multiZone: 2, zone: 4 },
  { id: 'khammam', name: 'Khammam', code: 'KHM', roverCount: 11, centroid: [17.25, 80.15], corsStatus: 'degraded', multiZone: 2, zone: 4 },
  { id: 'kumarambheem-asifabad', name: 'Kumarambheem-Asifabad', code: 'KBA', roverCount: 9, centroid: [19.2, 79.35], corsStatus: 'connected', multiZone: 2, zone: 4 },
  { id: 'mahabubabad', name: 'Mahabubabad', code: 'MBB', roverCount: 17, centroid: [17.6, 80.0], corsStatus: 'connected', multiZone: 2, zone: 5 },
  { id: 'mahbubnagar', name: 'Mahbubnagar', code: 'MBN', roverCount: 17, centroid: [16.75, 78.0], corsStatus: 'connected', multiZone: 2, zone: 5 },
  { id: 'mancherial', name: 'Mancherial', code: 'MCR', roverCount: 10, centroid: [18.87, 79.45], corsStatus: 'connected', multiZone: 2, zone: 5 },
  { id: 'medak', name: 'Medak', code: 'MDK', roverCount: 11, centroid: [18.05, 78.27], corsStatus: 'connected', multiZone: 2, zone: 6 },
  { id: 'medchal-malkajgiri', name: 'Medchal-Malkajgiri', code: 'MML', roverCount: 9, centroid: [17.45, 78.53], corsStatus: 'connected', multiZone: 2, zone: 6 },
  { id: 'mulugu', name: 'Mulugu', code: 'MLG', roverCount: 5, centroid: [18.2, 80.1], corsStatus: 'disconnected', multiZone: 2, zone: 6 },
  { id: 'nagarkurnool', name: 'Nagarkurnool', code: 'NKL', roverCount: 11, centroid: [16.48, 78.32], corsStatus: 'connected', multiZone: 2, zone: 7 },
  { id: 'nalgonda', name: 'Nalgonda', code: 'NLG', roverCount: 32, centroid: [17.05, 79.27], corsStatus: 'connected', multiZone: 2, zone: 7 },
  { id: 'narayanpet', name: 'Narayanpet', code: 'NRP', roverCount: 7, centroid: [16.75, 77.5], corsStatus: 'connected', multiZone: 2, zone: 7 },
  { id: 'nirmal', name: 'Nirmal', code: 'NRM', roverCount: 11, centroid: [19.1, 78.35], corsStatus: 'connected', multiZone: 1, zone: 1 },
  { id: 'nizamabad', name: 'Nizamabad', code: 'NZB', roverCount: 18, centroid: [18.68, 78.1], corsStatus: 'connected', multiZone: 1, zone: 2 },
  { id: 'peddapally', name: 'Peddapally', code: 'PDL', roverCount: 8, centroid: [18.62, 79.38], corsStatus: 'connected', multiZone: 1, zone: 3 },
  { id: 'rajanna-siricilla', name: 'Rajanna-Siricilla', code: 'RSC', roverCount: 14, centroid: [18.38, 78.85], corsStatus: 'connected', multiZone: 2, zone: 4 },
  { id: 'ranga-reddy', name: 'Ranga Reddy', code: 'RRD', roverCount: 15, centroid: [17.25, 78.35], corsStatus: 'connected', multiZone: 2, zone: 5 },
  { id: 'sangareddy', name: 'Sangareddy', code: 'SGY', roverCount: 15, centroid: [17.85, 77.92], corsStatus: 'connected', multiZone: 2, zone: 6 },
  { id: 'siddipet', name: 'Siddipet', code: 'SDP', roverCount: 17, centroid: [18.1, 78.85], corsStatus: 'connected', multiZone: 2, zone: 7 },
  { id: 'suryapet', name: 'Suryapet', code: 'SRT', roverCount: 12, centroid: [17.15, 79.55], corsStatus: 'connected', multiZone: 1, zone: 1 },
  { id: 'vikarabad', name: 'Vikarabad', code: 'VKB', roverCount: 13, centroid: [17.33, 77.9], corsStatus: 'connected', multiZone: 1, zone: 2 },
  { id: 'wanaparthy', name: 'Wanaparthy', code: 'WNP', roverCount: 8, centroid: [16.37, 78.07], corsStatus: 'connected', multiZone: 1, zone: 3 },
  { id: 'warangal', name: 'Warangal', code: 'WGL', roverCount: 9, centroid: [17.98, 79.6], corsStatus: 'connected', multiZone: 2, zone: 4 },
  { id: 'yadadri-bhuvangiri', name: 'Yadadri-Bhuvangiri', code: 'YBG', roverCount: 11, centroid: [17.2, 78.85], corsStatus: 'connected', multiZone: 2, zone: 5 },
  { id: 'talim', name: 'TALIM', code: 'TLM', roverCount: 7, centroid: [17.0, 79.5], corsStatus: 'connected', multiZone: 2, zone: 6 },
];

export const districtMap = new Map(districts.map(d => [d.id, d]));

export function getDistrictById(id: string): District | undefined {
  return districtMap.get(id);
}
