import { FlatType, Pathway, SimulationResult } from '../types';
import { housingProjectionMatrix, SINGLES_BTO_FLAT_TYPES } from '../data/hdbData';
import { checkMsrTdsr, computeEquity, calculateRent5y, rules } from './financialRules';

export interface SimulationParams {
  selectedTowns: string[];
  selectedRoomTypes: FlatType[];
  remainingLease: number;
  monthlyBudget: number;
  cashInjection: number;
  interestRate: number; // e.g. 3.5%
  baseRent: number;
  grossMonthlyIncome: number;
  existingMonthlyDebt: number;
}

export function runSimulation(params: SimulationParams): SimulationResult[] {
  const {
    selectedTowns,
    selectedRoomTypes,
    remainingLease,
    monthlyBudget,
    cashInjection,
    interestRate,
    baseRent,
    grossMonthlyIncome,
    existingMonthlyDebt,
  } = params;

  const rateFraction = interestRate / 100;
  const horizonYears = rules.horizonYears;
  const loanYears = rules.loanYears;

  const results: SimulationResult[] = [];

  for (const currentTown of selectedTowns) {
    for (const currentFt of selectedRoomTypes) {
      // 1. Resale Purchase lookup
      const resaleRow = housingProjectionMatrix.find(
        (r) =>
          r.town === currentTown &&
          r.flatType === currentFt &&
          r.remainingLeaseYrs === remainingLease &&
          r.path === 'Resale Purchase'
      );

      const clusterLabel = resaleRow ? resaleRow.clusterLabel : 'Standard';
      const label = `${currentTown} [${clusterLabel}] (${currentFt.replace('_', '-')})`;

      if (resaleRow) {
        const resalePrice = resaleRow.predictedStartPsf * resaleRow.floorAreaSqf;
        const eqResale = computeEquity(
          resalePrice,
          rateFraction,
          resaleRow.centralGrowthAnnual,
          cashInjection,
          rules.ltv,
          loanYears,
          horizonYears
        );

        const msrTdsrResale = checkMsrTdsr(
          grossMonthlyIncome,
          existingMonthlyDebt,
          eqResale.loan,
          loanYears,
          rules.stressRate
        );

        const budgetViolator = eqResale.monthlyPayment > monthlyBudget;
        const regulatoryFail = msrTdsrResale.regulatoryFail;

        let displayName = label;
        if (regulatoryFail && budgetViolator) {
          displayName = `${label} ⚠️ Over budget & fails MSR/TDSR`;
        } else if (regulatoryFail) {
          displayName = `${label} 🚫 Fails MSR/TDSR`;
        } else if (budgetViolator) {
          displayName = `${label} ⚠️ Unaffordable`;
        } else if (resaleRow.lowConfidence) {
          displayName = `${label} ℹ️ Limited data — treat with caution`;
        }

        results.push({
          town: currentTown,
          flatType: currentFt,
          clusterLabel,
          label,
          displayName,
          path: 'Resale Purchase',
          netWorth5y: eqResale.equity5y,
          monthlyHousing: eqResale.monthlyPayment,
          initialPrice: resalePrice,
          growthRate: resaleRow.centralGrowthAnnual,
          regulatoryFail,
          budgetViolator,
          schemeIneligible: false,
          btoDataUnavailable: false,
          lowConfidence: resaleRow.lowConfidence,
          loanAmount: eqResale.loan,
          downpayment: eqResale.downpayment,
          stressedPmt: msrTdsrResale.stressedPmt,
          msr: msrTdsrResale.msr,
          tdsr: msrTdsrResale.tdsr,
          msrPass: msrTdsrResale.msrPass,
          tdsrPass: msrTdsrResale.tdsrPass,
        });
      }

      // 2. BTO Purchase pathway
      const btoSchemeIneligible = !SINGLES_BTO_FLAT_TYPES.includes(currentFt);
      const btoRow = !btoSchemeIneligible
        ? housingProjectionMatrix.find(
            (r) => r.town === currentTown && r.flatType === '2_ROOM' && r.path === 'BTO Purchase'
          )
        : null;

      const btoDataUnavailable = !btoSchemeIneligible && !btoRow;

      if (!btoSchemeIneligible) {
        if (btoDataUnavailable) {
          results.push({
            town: currentTown,
            flatType: currentFt,
            clusterLabel,
            label,
            displayName: `${label} 📭 No BTO history for this town`,
            path: 'BTO Purchase',
            netWorth5y: 0,
            monthlyHousing: 0,
            initialPrice: null,
            growthRate: 0,
            regulatoryFail: false,
            budgetViolator: false,
            schemeIneligible: false,
            btoDataUnavailable: true,
            lowConfidence: false,
            loanAmount: 0,
            downpayment: 0,
            stressedPmt: 0,
            msr: 0,
            tdsr: 0,
            msrPass: true,
            tdsrPass: true,
          });
        } else if (btoRow) {
          const btoPrice = btoRow.predictedStartPsf * btoRow.floorAreaSqf;
          const eqBto = computeEquity(
            btoPrice,
            rateFraction,
            btoRow.centralGrowthAnnual,
            cashInjection,
            rules.ltv,
            loanYears,
            horizonYears
          );

          const msrTdsrBto = checkMsrTdsr(
            grossMonthlyIncome,
            existingMonthlyDebt,
            eqBto.loan,
            loanYears,
            rules.stressRate
          );

          const budgetViolator = eqBto.monthlyPayment > monthlyBudget;
          const regulatoryFail = msrTdsrBto.regulatoryFail;

          let displayName = label;
          if (regulatoryFail && budgetViolator) {
            displayName = `${label} ⚠️ Over budget & fails MSR/TDSR`;
          } else if (regulatoryFail) {
            displayName = `${label} 🚫 Fails MSR/TDSR`;
          } else if (budgetViolator) {
            displayName = `${label} ⚠️ Unaffordable`;
          } else if (btoRow.lowConfidence) {
            displayName = `${label} ℹ️ Limited data — treat with caution`;
          }

          results.push({
            town: currentTown,
            flatType: currentFt,
            clusterLabel,
            label,
            displayName,
            path: 'BTO Purchase',
            netWorth5y: eqBto.equity5y,
            monthlyHousing: eqBto.monthlyPayment,
            initialPrice: btoPrice,
            growthRate: btoRow.centralGrowthAnnual,
            regulatoryFail,
            budgetViolator,
            schemeIneligible: false,
            btoDataUnavailable: false,
            lowConfidence: btoRow.lowConfidence,
            loanAmount: eqBto.loan,
            downpayment: eqBto.downpayment,
            stressedPmt: msrTdsrBto.stressedPmt,
            msr: msrTdsrBto.msr,
            tdsr: msrTdsrBto.tdsr,
            msrPass: msrTdsrBto.msrPass,
            tdsrPass: msrTdsrBto.tdsrPass,
          });
        }
      }

      // 3. Renting Pathway
      const rentTotal = calculateRent5y(baseRent, horizonYears, rules.rentGrowthAnnual);
      const rentBudgetViolator = baseRent > monthlyBudget;

      let rentDisplayName = label;
      if (rentBudgetViolator) {
        rentDisplayName = `${label} ⚠️ Unaffordable`;
      }

      results.push({
        town: currentTown,
        flatType: currentFt,
        clusterLabel,
        label,
        displayName: rentDisplayName,
        path: 'Renting',
        netWorth5y: -rentTotal,
        monthlyHousing: baseRent,
        initialPrice: null,
        growthRate: 0,
        regulatoryFail: false,
        budgetViolator: rentBudgetViolator,
        schemeIneligible: false,
        btoDataUnavailable: false,
        lowConfidence: false,
        loanAmount: 0,
        downpayment: 0,
        stressedPmt: 0,
        msr: 0,
        tdsr: 0,
        msrPass: true,
        tdsrPass: true,
      });
    }
  }

  // Filter out scheme_ineligible (Singles BTO only allowed for 2_ROOM)
  return results.filter((r) => !r.schemeIneligible);
}
