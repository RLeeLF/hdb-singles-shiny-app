import React from 'react';
import { SimulationResult } from '../types';
import { SimulationParams } from '../utils/simulation';
import { formatDollar, formatPercent, rules } from '../utils/financialRules';
import {
  Award,
  AlertOctagon,
  CheckCircle,
  TrendingUp,
  ShieldCheck,
  Building,
  DollarSign,
  PieChart,
  HelpCircle,
  Scale,
  Sparkles,
} from 'lucide-react';

interface RecommendationsCardProps {
  results: SimulationResult[];
  params: SimulationParams;
}

export const RecommendationsCard: React.FC<RecommendationsCardProps> = ({ results, params }) => {
  // 1. Exact algorithmic filtering from R Shiny code
  const passingRows = results.filter(
    (r) =>
      !r.budgetViolator &&
      !r.regulatoryFail &&
      !r.schemeIneligible &&
      !r.btoDataUnavailable
  );

  let recommendationStatus: 'winner' | 'regulatory_block' | 'budget_block' = 'winner';
  let recommendationText = '';
  let winner: SimulationResult | null = null;

  if (passingRows.length === 0) {
    const anyBudgetOk = results.filter(
      (r) => !r.budgetViolator && !r.schemeIneligible && !r.btoDataUnavailable
    );

    if (anyBudgetOk.length > 0) {
      recommendationStatus = 'regulatory_block';
      recommendationText =
        'CRITICAL WARNING STRATEGY GATEWAY: Configurations exist within your comfortable monthly budget, but ALL of them fail the MAS MSR/TDSR lending eligibility check at your stated income. A bank or HDB would not approve these loans regardless of your personal comfort level. Consider a lower price point, longer tenure, or higher income input.';
    } else {
      recommendationStatus = 'budget_block';
      recommendationText =
        'CRITICAL WARNING STRATEGY GATEWAY: Every selected HDB ownership configuration choice crosses your active monthly payment comfort ceiling constraint slider, or has no available pathway to compare. Please expand your threshold criteria or adjust your selections.';
    }
  } else {
    // Sort descending by net_worth_5y and take top 1
    const sorted = [...passingRows].sort((a, b) => b.netWorth5y - a.netWorth5y);
    winner = sorted[0];

    const formattedBudget = formatDollar(params.monthlyBudget);
    const formattedNetWorth = formatDollar(winner.netWorth5y);
    const formattedFlatType = winner.flatType.replace('_', '-');

    recommendationText = `Within your stated monthly cost budget envelope of ${formattedBudget} and passing MAS lending eligibility (MSR/TDSR) at your stated income, the strategy maximizing capital generation over 5 years is the ${winner.path.toUpperCase()} pathway tracking a ${formattedFlatType} configuration inside ${winner.town}. This delivers a 5-year equity footprint outcome of ${formattedNetWorth}. Configurations that break your comfortable cash flow bounds, fail the MSR/TDSR lending check, or have no available pathway have been automatically flagged with warning markers.`;
  }

  // Rent comparison metric
  const rentRow = results.find((r) => r.path === 'Renting');
  const rentOutlay5y = rentRow ? Math.abs(rentRow.netWorth5y) : 0;

  return (
    <div id="strategic-recommendations-view" className="space-y-6">
      {/* Primary Strategic Recommendation Verdict Box */}
      <div
        id="recommendation-verdict-box"
        className={`rounded-xl border p-5 shadow-lg ${
          recommendationStatus === 'winner'
            ? 'bg-indigo-900/30 border-indigo-500/30 text-slate-200'
            : recommendationStatus === 'regulatory_block'
            ? 'bg-rose-950/30 border-rose-800/40 text-rose-200'
            : 'bg-amber-950/30 border-amber-800/40 text-amber-200'
        }`}
      >
        <div className="flex items-start gap-4">
          {recommendationStatus === 'winner' ? (
            <div className="p-2.5 rounded-lg bg-indigo-600 text-white shrink-0 shadow-md">
              <Award className="w-6 h-6" />
            </div>
          ) : (
            <div className="p-2.5 rounded-lg bg-rose-600 text-white shrink-0 shadow-md">
              <AlertOctagon className="w-6 h-6" />
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-white tracking-wide">
                {recommendationStatus === 'winner'
                  ? 'Strategic Advisory & Optimal Capital Allocation'
                  : 'Actionable Planning Advisory'}
              </h3>
              {recommendationStatus === 'winner' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                  MAS & Budget Compliant
                </span>
              )}
            </div>

            <p id="recommendation_text" className="text-xs sm:text-sm leading-relaxed text-slate-300 font-normal">
              {recommendationText}
            </p>
          </div>
        </div>
      </div>

      {/* Winner Spotlight Card */}
      {winner && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Equity Outcome */}
          <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-xl flex flex-col justify-between shadow-md">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="uppercase font-semibold tracking-wider text-[11px]">Projected 5-Yr Equity</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              {formatDollar(winner.netWorth5y)}
            </div>
            <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-between">
              <span>vs Renting Outlay:</span>
              <span className="font-mono font-semibold text-emerald-400">
                +{formatDollar(winner.netWorth5y + rentOutlay5y)} delta
              </span>
            </div>
          </div>

          {/* Cash Flow Health */}
          <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-xl flex flex-col justify-between shadow-md">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="uppercase font-semibold tracking-wider text-[11px]">Monthly Housing Payment</span>
              <DollarSign className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              {formatDollar(winner.monthlyHousing)}
              <span className="text-xs font-normal text-slate-400 font-sans">/mo</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-between">
              <span>Budget Headroom:</span>
              <span className="font-mono font-semibold text-emerald-400">
                {formatDollar(params.monthlyBudget - winner.monthlyHousing)} buffer
              </span>
            </div>
          </div>

          {/* MAS Regulatory Margin */}
          <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-xl flex flex-col justify-between shadow-md">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="uppercase font-semibold tracking-wider text-[11px]">MAS Stress MSR (30% Cap)</span>
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-indigo-400">
              {formatPercent(winner.msr, 1)}
              <span className="text-xs font-normal text-slate-400 font-sans"> / 30.0%</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-between">
              <span>TDSR Ratio:</span>
              <span className="font-mono font-semibold text-slate-300">
                {formatPercent(winner.tdsr, 1)} / 55.0%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Strategic Deep-Dive: Singles Age 35 SSC Scheme Roadmap */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5 shadow-md space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-700/60">
          <Scale className="w-5 h-5 text-indigo-400" />
          <h4 className="font-bold text-white text-sm">
            Strategic Decision Architecture: Single Singapore Citizen (SSC) Scheme
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* BTO Strategy Column */}
          <div className="bg-slate-900/60 border border-slate-700/60 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 font-bold text-white text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
              BTO Pathway (2-Room Flexi)
            </div>
            <p className="text-slate-400 leading-relaxed">
              Under the SSC scheme, first-timer singles age 35+ are strictly restricted to <strong className="text-slate-200">2-Room Flexi flats</strong> in BTO launch exercises.
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-300 pt-1">
              <li>
                <strong className="text-white">Capital Efficiency:</strong> Highly subsidized entry price (~$110k–$190k) minimizes mortgage strain and preserves CPF OA liquidity.
              </li>
              <li>
                <strong className="text-white">Appreciation:</strong> Substantial post-MOP upside (~4.5%–5.2% p.a. equivalent).
              </li>
              <li>
                <strong className="text-white">Trade-off:</strong> 3 to 5 years construction wait time; 13 out of 26 towns have zero BTO launch history for singles.
              </li>
            </ul>
          </div>

          {/* Resale Strategy Column */}
          <div className="bg-slate-900/60 border border-slate-700/60 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 font-bold text-white text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-[#6366F1] shadow-[0_0_6px_rgba(99,102,241,0.6)]" />
              Resale Pathway (2 to 5-Room)
            </div>
            <p className="text-slate-400 leading-relaxed">
              Resale flat purchases on the open market have <strong className="text-slate-200">no flat-size restriction</strong> for singles age 35+.
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-300 pt-1">
              <li>
                <strong className="text-white">Immediate Occupation:</strong> Zero construction wait time; full geographic choice across all 26 towns.
              </li>
              <li>
                <strong className="text-white">Housing Grants:</strong> Up to $40,000 CPF Housing Grant for Singles, plus Enhanced CPF Housing Grant (EHG) up to $40,000 and Proximity Housing Grant (PHG) up to $15,000.
              </li>
              <li>
                <strong className="text-white">Tenure & Leasehold:</strong> Flats with remaining lease &lt; 60 years trigger CPF withdrawal limits and tenure caps.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
