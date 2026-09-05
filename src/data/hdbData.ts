import { FlatType, ProjectionMatrixRow, TownInfo } from '../types';

export const LEASE_GRID = [40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95];

export const FLAT_SIZES_SQFT: Record<FlatType, number> = {
  '2_ROOM': 484, // ~45 sqm
  '3_ROOM': 721, // ~67 sqm
  '4_ROOM': 1001, // ~93 sqm
  '5_ROOM': 1205, // ~112 sqm
};

export const FLAT_TYPE_NAMES: Record<FlatType, string> = {
  '2_ROOM': '2-Room',
  '3_ROOM': '3-Room',
  '4_ROOM': '4-Room',
  '5_ROOM': '5-Room',
};

export const SINGLES_BTO_FLAT_TYPES: FlatType[] = ['2_ROOM'];

export const TOWNS_METADATA: TownInfo[] = [
  { name: 'ANG MO KIO', clusterLabel: 'Mature / North-East', region: 'North-East', isMature: true, hasBto2RoomHistory: false },
  { name: 'BEDOK', clusterLabel: 'Mature / East', region: 'East', isMature: true, hasBto2RoomHistory: true },
  { name: 'BISHAN', clusterLabel: 'Mature / Central', region: 'Central', isMature: true, hasBto2RoomHistory: false },
  { name: 'BUKIT BATOK', clusterLabel: 'Non-Mature / West', region: 'West', isMature: false, hasBto2RoomHistory: true },
  { name: 'BUKIT MERAH', clusterLabel: 'Mature / City Fringe', region: 'Central', isMature: true, hasBto2RoomHistory: false },
  { name: 'BUKIT PANJANG', clusterLabel: 'Non-Mature / West', region: 'West', isMature: false, hasBto2RoomHistory: false },
  { name: 'BUKIT TIMAH', clusterLabel: 'Mature / Central', region: 'Central', isMature: true, hasBto2RoomHistory: false },
  { name: 'CENTRAL AREA', clusterLabel: 'Mature / Central Core', region: 'Central', isMature: true, hasBto2RoomHistory: false },
  { name: 'CHOA CHU KANG', clusterLabel: 'Non-Mature / West', region: 'West', isMature: false, hasBto2RoomHistory: true },
  { name: 'CLEMENTI', clusterLabel: 'Mature / West', region: 'West', isMature: true, hasBto2RoomHistory: false },
  { name: 'GEYLANG', clusterLabel: 'Mature / City Fringe', region: 'Central', isMature: true, hasBto2RoomHistory: false },
  { name: 'HOUGANG', clusterLabel: 'Non-Mature / North-East', region: 'North-East', isMature: false, hasBto2RoomHistory: true },
  { name: 'JURONG EAST', clusterLabel: 'Non-Mature / West Commercial', region: 'West', isMature: false, hasBto2RoomHistory: false },
  { name: 'JURONG WEST', clusterLabel: 'Non-Mature / West', region: 'West', isMature: false, hasBto2RoomHistory: true },
  { name: 'KALLANG/WHAMPOA', clusterLabel: 'Mature / Central Fringe', region: 'Central', isMature: true, hasBto2RoomHistory: true },
  { name: 'MARINE PARADE', clusterLabel: 'Mature / Coastal East', region: 'East', isMature: true, hasBto2RoomHistory: false },
  { name: 'PASIR RIS', clusterLabel: 'Non-Mature / East', region: 'East', isMature: false, hasBto2RoomHistory: false },
  { name: 'PUNGGOL', clusterLabel: 'Non-Mature / Waterfront NE', region: 'North-East', isMature: false, hasBto2RoomHistory: true },
  { name: 'QUEENSTOWN', clusterLabel: 'Mature / City Fringe', region: 'Central', isMature: true, hasBto2RoomHistory: false },
  { name: 'SEMBAWANG', clusterLabel: 'Non-Mature / North', region: 'North', isMature: false, hasBto2RoomHistory: true },
  { name: 'SENGKANG', clusterLabel: 'Non-Mature / North-East', region: 'North-East', isMature: false, hasBto2RoomHistory: true },
  { name: 'SERANGOON', clusterLabel: 'Mature / North-East', region: 'North-East', isMature: true, hasBto2RoomHistory: false },
  { name: 'TAMPINES', clusterLabel: 'Mature / Regional East', region: 'East', isMature: true, hasBto2RoomHistory: true },
  { name: 'TOA PAYOH', clusterLabel: 'Mature / Central Fringe', region: 'Central', isMature: true, hasBto2RoomHistory: false },
  { name: 'WOODLANDS', clusterLabel: 'Non-Mature / Regional North', region: 'North', isMature: false, hasBto2RoomHistory: true },
  { name: 'YISHUN', clusterLabel: 'Non-Mature / North', region: 'North', isMature: false, hasBto2RoomHistory: true },
];

export const ALL_TOWNS = TOWNS_METADATA.map((t) => t.name).sort();

// Bala's Table leasehold adjustment curve relative to a fresh 95-year lease
const LEASE_DEPRECIATION_CURVE: Record<number, number> = {
  95: 1.0,
  90: 0.965,
  85: 0.928,
  80: 0.887,
  75: 0.842,
  70: 0.795,
  65: 0.742,
  60: 0.686,
  55: 0.625,
  50: 0.560,
  45: 0.492,
  40: 0.428,
};

// Base 95-year lease PSF benchmarks per town and flat type
interface TownBenchmark {
  basePsf: Record<FlatType, number>;
  baseGrowth: number;
  btoStartPsf?: number;
  btoGrowth?: number;
  btoLowConfidence?: boolean;
}

const TOWN_BENCHMARKS: Record<string, TownBenchmark> = {
  'ANG MO KIO': {
    basePsf: { '2_ROOM': 580, '3_ROOM': 610, '4_ROOM': 680, '5_ROOM': 740 },
    baseGrowth: 0.028,
  },
  BEDOK: {
    basePsf: { '2_ROOM': 560, '3_ROOM': 590, '4_ROOM': 660, '5_ROOM': 710 },
    baseGrowth: 0.027,
    btoStartPsf: 290,
    btoGrowth: 0.046,
    btoLowConfidence: true,
  },
  BISHAN: {
    basePsf: { '2_ROOM': 670, '3_ROOM': 720, '4_ROOM': 820, '5_ROOM': 910 },
    baseGrowth: 0.032,
  },
  'BUKIT BATOK': {
    basePsf: { '2_ROOM': 490, '3_ROOM': 510, '4_ROOM': 550, '5_ROOM': 580 },
    baseGrowth: 0.024,
    btoStartPsf: 245,
    btoGrowth: 0.043,
  },
  'BUKIT MERAH': {
    basePsf: { '2_ROOM': 710, '3_ROOM': 780, '4_ROOM': 890, '5_ROOM': 980 },
    baseGrowth: 0.034,
  },
  'BUKIT PANJANG': {
    basePsf: { '2_ROOM': 480, '3_ROOM': 500, '4_ROOM': 540, '5_ROOM': 560 },
    baseGrowth: 0.023,
  },
  'BUKIT TIMAH': {
    basePsf: { '2_ROOM': 720, '3_ROOM': 790, '4_ROOM': 910, '5_ROOM': 1020 },
    baseGrowth: 0.033,
  },
  'CENTRAL AREA': {
    basePsf: { '2_ROOM': 790, '3_ROOM': 880, '4_ROOM': 990, '5_ROOM': 1100 },
    baseGrowth: 0.036,
  },
  'CHOA CHU KANG': {
    basePsf: { '2_ROOM': 470, '3_ROOM': 490, '4_ROOM': 530, '5_ROOM': 550 },
    baseGrowth: 0.023,
    btoStartPsf: 235,
    btoGrowth: 0.042,
  },
  CLEMENTI: {
    basePsf: { '2_ROOM': 650, '3_ROOM': 710, '4_ROOM': 810, '5_ROOM': 890 },
    baseGrowth: 0.031,
  },
  GEYLANG: {
    basePsf: { '2_ROOM': 620, '3_ROOM': 660, '4_ROOM': 740, '5_ROOM': 800 },
    baseGrowth: 0.029,
  },
  HOUGANG: {
    basePsf: { '2_ROOM': 520, '3_ROOM': 540, '4_ROOM': 590, '5_ROOM': 620 },
    baseGrowth: 0.025,
    btoStartPsf: 260,
    btoGrowth: 0.045,
  },
  'JURONG EAST': {
    basePsf: { '2_ROOM': 530, '3_ROOM': 560, '4_ROOM': 610, '5_ROOM': 650 },
    baseGrowth: 0.026,
  },
  'JURONG WEST': {
    basePsf: { '2_ROOM': 480, '3_ROOM': 500, '4_ROOM': 540, '5_ROOM': 560 },
    baseGrowth: 0.023,
    btoStartPsf: 240,
    btoGrowth: 0.042,
  },
  'KALLANG/WHAMPOA': {
    basePsf: { '2_ROOM': 690, '3_ROOM': 750, '4_ROOM': 860, '5_ROOM': 930 },
    baseGrowth: 0.033,
    btoStartPsf: 330,
    btoGrowth: 0.052,
    btoLowConfidence: true,
  },
  'MARINE PARADE': {
    basePsf: { '2_ROOM': 640, '3_ROOM': 680, '4_ROOM': 780, '5_ROOM': 850 },
    baseGrowth: 0.030,
  },
  'PASIR RIS': {
    basePsf: { '2_ROOM': 530, '3_ROOM': 550, '4_ROOM': 600, '5_ROOM': 630 },
    baseGrowth: 0.025,
  },
  PUNGGOL: {
    basePsf: { '2_ROOM': 560, '3_ROOM': 550, '4_ROOM': 580, '5_ROOM': 595 },
    baseGrowth: 0.028,
    btoStartPsf: 280, // ~$135,500 for 484 sqft
    btoGrowth: 0.048,
  },
  QUEENSTOWN: {
    basePsf: { '2_ROOM': 740, '3_ROOM': 810, '4_ROOM': 920, '5_ROOM': 1040 },
    baseGrowth: 0.035,
  },
  SEMBAWANG: {
    basePsf: { '2_ROOM': 470, '3_ROOM': 490, '4_ROOM': 525, '5_ROOM': 545 },
    baseGrowth: 0.022,
    btoStartPsf: 235,
    btoGrowth: 0.041,
  },
  SENGKANG: {
    basePsf: { '2_ROOM': 550, '3_ROOM': 540, '4_ROOM': 570, '5_ROOM': 585 },
    baseGrowth: 0.027,
    btoStartPsf: 275,
    btoGrowth: 0.047,
  },
  SERANGOON: {
    basePsf: { '2_ROOM': 590, '3_ROOM': 630, '4_ROOM': 700, '5_ROOM': 760 },
    baseGrowth: 0.029,
  },
  TAMPINES: {
    basePsf: { '2_ROOM': 570, '3_ROOM': 600, '4_ROOM': 670, '5_ROOM': 720 },
    baseGrowth: 0.028,
    btoStartPsf: 295,
    btoGrowth: 0.049,
  },
  'TOA PAYOH': {
    basePsf: { '2_ROOM': 680, '3_ROOM': 740, '4_ROOM': 850, '5_ROOM': 920 },
    baseGrowth: 0.032,
  },
  WOODLANDS: {
    basePsf: { '2_ROOM': 480, '3_ROOM': 495, '4_ROOM': 535, '5_ROOM': 555 },
    baseGrowth: 0.024,
    btoStartPsf: 240,
    btoGrowth: 0.043,
  },
  YISHUN: {
    basePsf: { '2_ROOM': 485, '3_ROOM': 505, '4_ROOM': 540, '5_ROOM': 560 },
    baseGrowth: 0.024,
    btoStartPsf: 245,
    btoGrowth: 0.044,
  },
};

/**
 * Generates the full projection matrix for Resale (all towns, flat types, and lease grid)
 * and BTO (for towns with 2-room BTO history)
 */
function buildHousingProjectionMatrix(): ProjectionMatrixRow[] {
  const matrix: ProjectionMatrixRow[] = [];
  const flatTypes: FlatType[] = ['2_ROOM', '3_ROOM', '4_ROOM', '5_ROOM'];

  for (const townMeta of TOWNS_METADATA) {
    const town = townMeta.name;
    const bench = TOWN_BENCHMARKS[town] || {
      basePsf: { '2_ROOM': 500, '3_ROOM': 520, '4_ROOM': 560, '5_ROOM': 600 },
      baseGrowth: 0.025,
    };

    // 1. Resale Purchase rows for all flat types and lease grid years
    for (const ft of flatTypes) {
      const area = FLAT_SIZES_SQFT[ft];
      const baseFtPsf = bench.basePsf[ft] || 520;

      for (const lease of LEASE_GRID) {
        const factor = LEASE_DEPRECIATION_CURVE[lease] ?? 0.85;
        const startPsf = Math.round(baseFtPsf * factor);

        // Older flats have dampened growth due to lease decay
        let growth = bench.baseGrowth;
        if (lease < 60) {
          growth = Math.max(0.008, bench.baseGrowth * 0.55);
        } else if (lease < 75) {
          growth = bench.baseGrowth * 0.82;
        }

        // Low confidence flag for thin transactions in certain segments
        const isLowConfidence =
          (lease <= 45 && (ft === '5_ROOM' || ft === '2_ROOM')) ||
          (townMeta.isMature && ft === '2_ROOM' && lease < 60) ||
          (town === 'CENTRAL AREA' && ft === '5_ROOM');

        matrix.push({
          town,
          flatType: ft,
          remainingLeaseYrs: lease,
          path: 'Resale Purchase',
          predictedStartPsf: startPsf,
          floorAreaSqf: area,
          centralGrowthAnnual: growth,
          lowConfidence: isLowConfidence,
          clusterLabel: townMeta.clusterLabel,
        });
      }
    }

    // 2. BTO Purchase row (Single Singapore Citizen Scheme allows 2-Room only)
    if (bench.btoStartPsf) {
      matrix.push({
        town,
        flatType: '2_ROOM',
        remainingLeaseYrs: 99,
        path: 'BTO Purchase',
        predictedStartPsf: bench.btoStartPsf,
        floorAreaSqf: FLAT_SIZES_SQFT['2_ROOM'],
        centralGrowthAnnual: bench.btoGrowth || 0.045,
        lowConfidence: bench.btoLowConfidence || false,
        clusterLabel: townMeta.clusterLabel,
      });
    }
  }

  return matrix;
}

export const housingProjectionMatrix: ProjectionMatrixRow[] = buildHousingProjectionMatrix();
