import { ismailiaProjection } from './MapProjection';

export interface Landmark {
  id: string;
  nameEn: string;
  nameAr: string;
  kind: string;
  lat: number;
  lon: number;
  metersFromOrigin: { x: number; y: number };
  pixelPosition: { x: number; y: number };
  tilePosition: { x: number; y: number };
  relativeNote: string;
  missionRelevance?: number[];
}

export const ismailiaLandmarks: Landmark[] = [
  {
    id: 'railway_station',
    nameEn: 'Ismailia Railway Station',
    nameAr: 'محطة قطار الإسماعيلية',
    kind: 'building',
    lat: 30.59337,
    lon: 32.27008,
    metersFromOrigin: { x: -1128, y: -159 },
    pixelPosition: { x: 0, y: 0 },
    tilePosition: { x: 0, y: 0 },
    relativeNote: 'Far west, railway splits old town from new town',
    missionRelevance: [1]
  },
  {
    id: 'orabi_sq',
    nameEn: 'Orabi Square',
    nameAr: 'ميدان عرابي',
    kind: 'square',
    lat: 30.59265,
    lon: 32.27035,
    metersFromOrigin: { x: -1102, y: -80 },
    pixelPosition: { x: 0, y: 0 },
    tilePosition: { x: 0, y: 0 },
    relativeNote: 'Station forecourt',
    missionRelevance: [1]
  },
  {
    id: 'gumhuriya_sq',
    nameEn: 'Gumhuriya Square',
    nameAr: 'ميدان الجمهورية',
    kind: 'square',
    lat: 30.59162,
    lon: 32.2733,
    metersFromOrigin: { x: -819, y: 34 },
    pixelPosition: { x: 0, y: 0 },
    tilePosition: { x: 0, y: 0 },
    relativeNote: 'Heart of Hay el-Afrang',
    missionRelevance: [2]
  },
  {
    id: 'abu_bakr_mosque',
    nameEn: 'Abu Bakr el-Siddiq Mosque',
    nameAr: 'مسجد أبو بكر الصديق',
    kind: 'building',
    lat: 30.5923,
    lon: 32.27271,
    metersFromOrigin: { x: -876, y: -41 },
    pixelPosition: { x: 0, y: 0 },
    tilePosition: { x: 0, y: 0 },
    relativeNote: 'Old quarter, wayfinding only',
    missionRelevance: [2]
  },
  {
    id: 'st_mark_cathedral',
    nameEn: 'St. Mark Cathedral',
    nameAr: 'كاتدرائية مارمرقس',
    kind: 'building',
    lat: 30.59142,
    lon: 32.27146,
    metersFromOrigin: { x: -996, y: 56 },
    pixelPosition: { x: 0, y: 0 },
    tilePosition: { x: 0, y: 0 },
    relativeNote: 'Old quarter, wayfinding only',
    missionRelevance: [2]
  },
  {
    id: 'lesseps_house',
    nameEn: 'Ferdinand de Lesseps House',
    nameAr: 'بيت ديليسبس',
    kind: 'building',
    lat: 30.58948,
    lon: 32.27234,
    metersFromOrigin: { x: -911, y: 271 },
    pixelPosition: { x: 0, y: 0 },
    tilePosition: { x: 0, y: 0 },
    relativeNote: 'Override token location',
    missionRelevance: [3]
  },
  {
    id: 'suez_canal_museum',
    nameEn: 'Suez Canal Museum',
    nameAr: 'متحف قناة السويس',
    kind: 'building',
    lat: 30.59017,
    lon: 32.27325,
    metersFromOrigin: { x: -824, y: 195 },
    pixelPosition: { x: 0, y: 0 },
    tilePosition: { x: 0, y: 0 },
    relativeNote: 'Token decryption location',
    missionRelevance: [3]
  },
  {
    id: 'sweet_water_canal',
    nameEn: 'Sweet-Water Canal at Bridge 3',
    nameAr: 'ترعة الإسماعيلية (كوبري 3)',
    kind: 'water',
    lat: 30.5891,
    lon: 32.2744,
    metersFromOrigin: { x: -714, y: 313 },
    pixelPosition: { x: 0, y: 0 },
    tilePosition: { x: 0, y: 0 },
    relativeNote: 'Bridge repair location',
    missionRelevance: [3]
  },
  {
    id: 'abdel_moneim_riad_sq',
    nameEn: 'Abdel Moneim Riad Square',
    nameAr: 'ميدان عبد المنعم رياض',
    kind: 'square',
    lat: 30.59193,
    lon: 32.28185,
    metersFromOrigin: { x: 0, y: 0 },
    pixelPosition: { x: 0, y: 0 },
    tilePosition: { x: 0, y: 0 },
    relativeNote: 'Map origin'
  }
];

export function initializeLandmarkPositions(): void {
  for (const landmark of ismailiaLandmarks) {
    const pixels = ismailiaProjection.metersToPixels(landmark.metersFromOrigin);
    landmark.pixelPosition = pixels;
    landmark.tilePosition = ismailiaProjection.pixelsToTile(pixels);
  }
}

export function getLandmarkById(id: string): Landmark | undefined {
  return ismailiaLandmarks.find(l => l.id === id);
}

export function getLandmarksForMission(missionId: number): Landmark[] {
  return ismailiaLandmarks.filter(l => l.missionRelevance?.includes(missionId));
}

initializeLandmarkPositions();
