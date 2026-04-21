import type { Rover } from './types';
import { districts } from './districts';

const surveyorNames = [
  'Ramesh Kumar', 'Lakshmi Devi', 'Suresh Reddy', 'Padmaja Rani', 'Krishna Murthy',
  'Anitha Devi', 'Venkatesh Rao', 'Saritha Reddy', 'Prasad Babu', 'Kavitha Rani',
  'Nagesh Kumar', 'Swathi Devi', 'Mohan Reddy', 'Lalitha Rani', 'Gopal Rao',
  'Meena Devi', 'Rajesh Kumar', 'Sujatha Rani', 'Hari Prasad', 'Vasavi Devi',
  'Srinivas Rao', 'Kalyani Rani', 'Madhu Babu', 'Parvathi Devi', 'Ravi Teja',
  'Neelima Rani', 'Chandra Shekar', 'Sravani Devi', 'Vijay Kumar', 'Anuradha Rani',
  'Naveen Reddy', 'Divya Rani', 'Kiran Kumar', 'Bhavani Devi', 'Santosh Rao',
  'Priya Rani', 'Akhil Kumar', 'Manasa Devi', 'Deepak Reddy', 'Sneha Rani',
  'Arjun Rao', 'Tejaswini Rani', 'Rahul Kumar', 'Haritha Devi', 'Vikram Reddy',
  'Shalini Rani', 'Karthik Babu', 'Spandana Devi', 'Mahesh Kumar', 'Sirisha Rani',
];

const deviceNames = [
  'Samsung Galaxy Tab Active3', 'Pixel Rugged 5', 'Field Unit Alpha', 'Samsung XCover Pro',
  'Trimble TSC7', 'Leica CS20', 'Topcon FC-5000', 'Spectra Precision Ranger 7',
  'Nautiz X9', 'Handheld Algiz 8X', 'Panasonic Toughpad FZ-G1', 'Getac ZX80',
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(1));
}

function generateLicence(_code: string, seq: number): string {
  const num = randomInt(1000, 9999);
  const alpha = String.fromCharCode(65 + randomInt(0, 25)) + String.fromCharCode(65 + randomInt(0, 25));
  return `PTS-${num}-${alpha}-${String(seq).padStart(2, '0')}`;
}

function generateFileNumber(): string {
  const year = 2026;
  const num = randomInt(1000, 9999);
  const alpha = String.fromCharCode(65 + randomInt(0, 25)) + String.fromCharCode(65 + randomInt(0, 25));
  return `SLR/${year}/${alpha}/${num}`;
}

export function generateRovers(): Rover[] {
  const rovers: Rover[] = [];
  let globalSeq = 1;

  for (const district of districts) {
    for (let i = 1; i <= district.roverCount; i++) {
      const statusRoll = Math.random();
      let status: Rover['status'];
      if (statusRoll < 0.8) status = 'online';
      else if (statusRoll < 0.95) status = 'offline';
      else status = 'low-battery';

      const battery = status === 'low-battery' ? randomInt(10, 20) : randomInt(25, 100);
      const speed = status === 'offline' ? 0 : randomFloat(0, 45);
      const lastSyncMinutes = status === 'offline' ? randomInt(120, 2880) : randomInt(1, 60);
      const lastSync = new Date(Date.now() - lastSyncMinutes * 60 * 1000);

      const offsetLat = (Math.random() - 0.5) * 0.16;
      const offsetLng = (Math.random() - 0.5) * 0.16;

      rovers.push({
        id: `R-${district.code}-${String(i).padStart(2, '0')}`,
        districtId: district.id,
        ptsLicence: generateLicence(district.code, i),
        deviceName: deviceNames[randomInt(0, deviceNames.length - 1)],
        surveyorName: surveyorNames[(globalSeq - 1) % surveyorNames.length],
        battery,
        dischargeRate: randomFloat(-5, -1),
        status,
        speed,
        accuracy: randomFloat(0.5, 3.0),
        satellites: status === 'offline' ? 0 : randomInt(6, 16),
        lat: district.centroid[0] + offsetLat,
        lng: district.centroid[1] + offsetLng,
        lastSync,
        workingHours: Array.from({ length: 7 }, () => randomInt(0, 8)),
        pointsCollected: randomInt(100, 5000),
        fileNumber: generateFileNumber(),
        workLocation: `${district.name} Mandal ${randomInt(1, 20)}`,
        elevation: randomFloat(200, 800),
        heading: randomInt(0, 359),
      });

      globalSeq++;
    }
  }

  return rovers;
}

export const allRovers = generateRovers();

export function getRoversByDistrict(districtId: string): Rover[] {
  return allRovers.filter(r => r.districtId === districtId);
}

export function getRoverById(roverId: string): Rover | undefined {
  return allRovers.find(r => r.id === roverId);
}

export const validLicenceKeys = new Set([
  ...allRovers.map(r => r.ptsLicence),
  'PTS-MASTER-00',
  'PTS-ADMIN-01',
]);
