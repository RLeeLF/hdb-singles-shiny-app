export type FlatType = '2_ROOM' | '3_ROOM' | '4_ROOM' | '5_ROOM';

export type Pathway = 'BTO Purchase' | 'Resale Purchase' | 'Renting';

export interface TownInfo {
  name: string;
  clusterLabel: string;
  region: 'North' | 'North-East' | 'East' | 'West' | 'Central';
  isMature: boolean;
  hasBto2RoomHistory: boolean;
}

export interface ProjectionMatrixRow {
  town: string;
  flatType: FlatType;
  remainingLeaseYrs: number;
  path: 'Resale Purchase' | 'BTO Purchase';
  predictedStartPsf: number;
  floorAreaSqf: number;
  centralGrowthAnnual: number;
  lowConfidence: boolean;
  clusterLabel: string;
}

export interface SimulationResult {
  town: string;
  flatType: FlatType;
  clusterLabel: string;
  label: string;
  displayName: string;
  path: Pathway;
  netWorth5y: number;
  monthlyHousing: number;
  initialPrice: number | null;
  growthRate: number;
  regulatoryFail: boolean;
  budgetViolator: boolean;
  schemeIneligible: boolean;
  btoDataUnavailable: boolean;
  lowConfidence: boolean;
  // Detailed audit numbers
  loanAmount: number;
  downpayment: number;
  stressedPmt: number;
  msr: number;
  tdsr: number;
  msrPass: boolean;
  tdsrPass: boolean;
}

export interface FinancialRules {
  horizonYears: number;
  loanYears: number;
  ltv: number;
  rentGrowthAnnual: number;
  stressRate: number;
  msrThreshold: number;
  tdsrThreshold: number;
}
