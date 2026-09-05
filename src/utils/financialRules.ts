import { FinancialRules } from '../types';

export const rules: FinancialRules = {
  horizonYears: 5,
  loanYears: 25,
  ltv: 0.75, // 75% max LTV
  rentGrowthAnnual: 0.025, // 2.5% annual rental escalation
  stressRate: 0.04, // 4.0% MAS mandatory stress-test rate
  msrThreshold: 0.30, // 30% MSR limit for HDB
  tdsrThreshold: 0.55, // 55% TDSR limit
};

/**
 * Standard amortizing monthly mortgage payment formula
 */
export function monthlyPayment(principal: number, annualRate: number, loanYears: number): number {
  if (principal <= 0) return 0;
  if (annualRate <= 0) return principal / (loanYears * 12);
  
  const r = annualRate / 12;
  const n = loanYears * 12;
  const factor = Math.pow(1 + r, n);
  
  return (principal * (r * factor)) / (factor - 1);
}

/**
 * Remaining loan balance after k years
 */
export function remainingBalance(
  principal: number,
  annualRate: number,
  loanYears: number,
  elapsedYears: number
): number {
  if (principal <= 0) return 0;
  const k = elapsedYears * 12;
  const n = loanYears * 12;
  if (k >= n) return 0;
  if (annualRate <= 0) return principal * (1 - k / n);

  const r = annualRate / 12;
  const factorN = Math.pow(1 + r, n);
  const factorK = Math.pow(1 + r, k);
  
  return principal * ((factorN - factorK) / (factorN - 1));
}

/**
 * Computes equity and financial parameters for ownership pathways
 */
export function computeEquity(
  price: number,
  annualRate: number,
  growth: number,
  cashInjection: number,
  ltv: number,
  loanYears: number,
  horizonYears: number
) {
  const minDownpayment = price * (1 - ltv);
  const actualDownpayment = Math.min(price, Math.max(minDownpayment, cashInjection));
  const loan = Math.max(0, price - actualDownpayment);
  
  const monthlyPmt = monthlyPayment(loan, annualRate, loanYears);
  const futureValue = price * Math.pow(1 + growth, horizonYears);
  const remainingLoanBal = remainingBalance(loan, annualRate, loanYears, horizonYears);
  const equity5y = futureValue - remainingLoanBal;

  return {
    price,
    loan,
    downpayment: actualDownpayment,
    monthlyPayment: monthlyPmt,
    futureValue,
    remainingLoanBal,
    equity5y,
  };
}

/**
 * Checks MSR (Mortgage Servicing Ratio <= 30%) and TDSR (Total Debt Servicing Ratio <= 55%)
 * calculated at MAS's mandatory 4.0% stress-test interest rate
 */
export function checkMsrTdsr(
  grossMonthlyIncome: number,
  existingMonthlyDebt: number,
  loanAmount: number,
  loanYears: number,
  stressRate = 0.04
) {
  const stressedPmt = monthlyPayment(loanAmount, stressRate, loanYears);
  
  const msr = grossMonthlyIncome > 0 ? stressedPmt / grossMonthlyIncome : 1;
  const tdsr = grossMonthlyIncome > 0 ? (stressedPmt + existingMonthlyDebt) / grossMonthlyIncome : 1;
  
  const msrPass = msr <= rules.msrThreshold;
  const tdsrPass = tdsr <= rules.tdsrThreshold;
  const regulatoryFail = !msrPass || !tdsrPass;

  return {
    stressedPmt,
    msr,
    tdsr,
    msrPass,
    tdsrPass,
    regulatoryFail,
  };
}

/**
 * Calculates 5-year cumulative rental outflow with annual escalation
 */
export function calculateRent5y(baseRent: number, horizonYears = 5, rentGrowth = 0.025): number {
  let rentTotal = 0;
  for (let yr = 1; yr <= horizonYears; yr++) {
    rentTotal += (baseRent * 12) * Math.pow(1 + rentGrowth, yr - 1);
  }
  return rentTotal;
}

export function formatDollar(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return '—';
  const isNegative = value < 0;
  const absVal = Math.abs(Math.round(value));
  const formatted = '$' + absVal.toLocaleString('en-US');
  return isNegative ? `-${formatted}` : formatted;
}

export function formatPercent(value: number | null | undefined, decimals = 2): string {
  if (value === null || value === undefined || isNaN(value)) return '—';
  return (value * 100).toFixed(decimals) + '%';
}
