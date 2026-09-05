import React, { useState } from 'react';
import {
  Building2,
  DollarSign,
  Percent,
  ShieldAlert,
  AlertTriangle,
  ChevronDown,
  X,
  Check,
  Info,
  Layers,
} from 'lucide-react';
import { FlatType } from '../types';
import { ALL_TOWNS, FLAT_SIZES_SQFT, FLAT_TYPE_NAMES, LEASE_GRID } from '../data/hdbData';
import { SimulationParams } from '../utils/simulation';
import { formatDollar } from '../utils/financialRules';

interface SidebarControlsProps {
  params: SimulationParams;
  onChange: (updated: Partial<SimulationParams>) => void;
}

export const SidebarControls: React.FC<SidebarControlsProps> = ({ params, onChange }) => {
  const [townSearch, setTownSearch] = useState('');
  const [isTownDropdownOpen, setIsTownDropdownOpen] = useState(false);

  const filteredTowns = ALL_TOWNS.filter((t) =>
    t.toLowerCase().includes(townSearch.toLowerCase())
  );

  const toggleTown = (town: string) => {
    if (params.selectedTowns.includes(town)) {
      if (params.selectedTowns.length > 1) {
        onChange({ selectedTowns: params.selectedTowns.filter((t) => t !== town) });
      }
    } else {
      onChange({ selectedTowns: [...params.selectedTowns, town] });
    }
  };

  const toggleRoomType = (rt: FlatType) => {
    if (params.selectedRoomTypes.includes(rt)) {
      if (params.selectedRoomTypes.length > 1) {
        onChange({ selectedRoomTypes: params.selectedRoomTypes.filter((t) => t !== rt) });
      }
    } else {
      onChange({ selectedRoomTypes: [...params.selectedRoomTypes, rt] });
    }
  };

  const quickBenchmarkRates = [
    { label: 'HDB Concessionary ~2.6%', rate: 2.6 },
    { label: 'Bank Low ~3.5%', rate: 3.5 },
    { label: 'Bank High ~4.5%', rate: 4.5 },
  ];

  const maxMsrBudget = params.grossMonthlyIncome * 0.30;
  const maxTdsrBudget = Math.max(0, params.grossMonthlyIncome * 0.55 - params.existingMonthlyDebt);

  return (
    <aside
      id="sidebar-panel"
      className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-6 text-slate-300"
    >
      {/* Step 1: Property Configurations */}
      <div>
        <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-800">
          <Building2 className="w-5 h-5 text-indigo-400 shrink-0" />
          <h2 className="font-bold text-xs uppercase tracking-widest text-slate-300">
            Step 1: Property Configurations
          </h2>
        </div>

        {/* Selected Towns */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            Select Target Towns (Choose one or multiple):
          </label>

          {/* Active town chips */}
          <div className="flex flex-wrap gap-1.5 mb-2 min-h-7">
            {params.selectedTowns.map((town) => (
              <span
                key={town}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-950/80 text-indigo-300 border border-indigo-800/70"
              >
                {town}
                {params.selectedTowns.length > 1 && (
                  <button
                    type="button"
                    onClick={() => toggleTown(town)}
                    className="hover:text-indigo-100 focus:outline-hidden"
                    title={`Remove ${town}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </span>
            ))}
          </div>

          {/* Towns selector button & dropdown */}
          <div className="relative">
            <button
              type="button"
              id="town-dropdown-trigger"
              onClick={() => setIsTownDropdownOpen(!isTownDropdownOpen)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg hover:border-slate-600 text-white transition-colors text-left"
            >
              <span className="truncate">
                {params.selectedTowns.length === 1
                  ? params.selectedTowns[0]
                  : `${params.selectedTowns.length} towns selected`}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </button>

            {isTownDropdownOpen && (
              <div
                id="town-dropdown-menu"
                className="absolute z-30 mt-1 w-full bg-slate-900 rounded-lg shadow-2xl border border-slate-700 max-h-64 overflow-y-auto p-2"
              >
                <input
                  type="text"
                  placeholder="Filter town name..."
                  value={townSearch}
                  onChange={(e) => setTownSearch(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded mb-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  autoFocus
                />
                <div className="space-y-0.5">
                  {filteredTowns.map((town) => {
                    const isSelected = params.selectedTowns.includes(town);
                    return (
                      <button
                        key={town}
                        type="button"
                        onClick={() => toggleTown(town)}
                        className={`w-full text-left px-2.5 py-1.5 rounded text-xs flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-indigo-950 text-indigo-300 font-semibold border border-indigo-800/60'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span>{town}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                      </button>
                    );
                  })}
                  {filteredTowns.length === 0 && (
                    <div className="p-2 text-center text-xs text-slate-500">No town matching "{townSearch}"</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Flat Sizes Checkboxes */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            Select Flat Sizes to Compare:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['2_ROOM', '3_ROOM', '4_ROOM', '5_ROOM'] as FlatType[]).map((ft) => {
              const isChecked = params.selectedRoomTypes.includes(ft);
              return (
                <button
                  key={ft}
                  type="button"
                  id={`flat-type-btn-${ft}`}
                  onClick={() => toggleRoomType(ft)}
                  className={`flex items-center justify-between px-2.5 py-2 rounded-lg border text-xs font-medium transition-colors ${
                    isChecked
                      ? 'bg-indigo-950/60 border-indigo-500/80 text-indigo-200'
                      : 'bg-slate-900 border-slate-700/80 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                        isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-600 bg-slate-800'
                      }`}
                    >
                      {isChecked && <Check className="w-2.5 h-2.5" />}
                    </span>
                    <span>{FLAT_TYPE_NAMES[ft]}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-normal">
                    {FLAT_SIZES_SQFT[ft]} sqft
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">
            Note: Under Singles Scheme, only 2-Room flats are eligible for BTO. Resale allows 2, 3, 4, and 5-room.
          </p>
        </div>

        {/* Remaining Lease Slider */}
        <div className="mb-2">
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-medium text-slate-400">
              Remaining Lease
            </label>
            <span className="text-sm font-bold text-indigo-400 font-mono">
              {params.remainingLease}y
            </span>
          </div>
          <input
            id="lease-slider"
            type="range"
            min={LEASE_GRID[0]}
            max={LEASE_GRID[LEASE_GRID.length - 1]}
            step={5}
            value={params.remainingLease}
            onChange={(e) => onChange({ remainingLease: Number(e.target.value) })}
            className="w-full accent-indigo-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-0.5 font-mono">
            <span>40y (Older)</span>
            <span>60y (CPF Threshold)</span>
            <span>95y (Fresh MOP)</span>
          </div>
        </div>

        {/* Lease Reminder when < 60y */}
        {params.remainingLease < 60 && (
          <div
            id="lease-reminder"
            className="mt-3 bg-amber-900/20 border border-amber-900/50 text-amber-200/90 rounded-lg p-3 text-xs leading-relaxed flex items-start gap-2"
          >
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-300">Note: </span>
              CPF usage is reduced once remaining lease drops below 60 years. HDB loan tenure is also capped at the
              shorter of 25 years, (65 − your age), or the flat's remaining lease — this is not a hard block in this
              tool, but confirm your actual eligibility with HDB/a bank before relying on these projections.
            </div>
          </div>
        )}
      </div>

      {/* Step 2: Financial & Budget Bounds */}
      <div>
        <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-800">
          <DollarSign className="w-5 h-5 text-emerald-400 shrink-0" />
          <h2 className="font-bold text-xs uppercase tracking-widest text-slate-300">
            Step 2: Financial & Budget Bounds
          </h2>
        </div>

        {/* Monthly Budget */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-medium text-slate-400">
              Monthly Budget (Cash+CPF):
            </label>
            <span className="text-sm font-bold text-indigo-400 font-mono">
              {formatDollar(params.monthlyBudget)}/mo
            </span>
          </div>
          <input
            id="budget-slider"
            type="range"
            min={1000}
            max={10000}
            step={100}
            value={params.monthlyBudget}
            onChange={(e) => onChange({ monthlyBudget: Number(e.target.value) })}
            className="w-full accent-indigo-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-0.5 font-mono">
            <span>$1,000</span>
            <span>$5,000</span>
            <span>$10,000</span>
          </div>
        </div>

        {/* Available Cash / CPF Downpayment */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Available Cash / CPF Downpayment (Resale):
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 text-sm">
              $
            </span>
            <input
              id="cash-injection-input"
              type="number"
              min={0}
              step={5000}
              value={params.cashInjection}
              onChange={(e) => onChange({ cashInjection: Math.max(0, Number(e.target.value)) })}
              className="w-full pl-7 pr-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Used toward minimum 25% downpayment + reducing mortgage principal.
          </span>
        </div>
      </div>

      {/* Step 3: Factor in Interest Rate and Rental */}
      <div>
        <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-800">
          <Percent className="w-5 h-5 text-indigo-400 shrink-0" />
          <h2 className="font-bold text-xs uppercase tracking-widest text-slate-300">
            Step 3: Factor in Interest Rate and Rental
          </h2>
        </div>

        {/* Annual Mortgage Interest Rate */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-medium text-slate-400">
              Annual Mortgage Interest Rate (%):
            </label>
            <span className="text-sm font-bold text-indigo-400 font-mono">
              {params.interestRate.toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center gap-3">
            <input
              id="interest-rate-slider"
              type="range"
              min={1.0}
              max={10.0}
              step={0.1}
              value={params.interestRate}
              onChange={(e) => onChange({ interestRate: Number(e.target.value) })}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <input
              id="interest-rate-input"
              type="number"
              min={1.0}
              max={10.0}
              step={0.1}
              value={params.interestRate}
              onChange={(e) => onChange({ interestRate: Number(e.target.value) })}
              className="w-16 px-2 py-1 text-xs border border-slate-700 rounded font-mono text-center bg-slate-900 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Reference benchmarks */}
          <div className="flex flex-wrap gap-1 mt-2">
            {quickBenchmarkRates.map((bm) => (
              <button
                key={bm.rate}
                type="button"
                onClick={() => onChange({ interestRate: bm.rate })}
                className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                  params.interestRate === bm.rate
                    ? 'bg-indigo-950 border-indigo-500 text-indigo-300 font-semibold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {bm.label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Reference Benchmarks: HDB Concessionary ~2.6% | Bank Low ~3.5% | Bank High ~4.5%
          </p>
        </div>

        {/* Current Monthly Rental Baseline */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Current Monthly Rental Baseline ($):
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 text-sm">
              $
            </span>
            <input
              id="base-rent-input"
              type="number"
              min={500}
              max={10000}
              step={100}
              value={params.baseRent}
              onChange={(e) => onChange({ baseRent: Math.max(100, Number(e.target.value)) })}
              className="w-full pl-7 pr-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Models cumulative 5-year cash burn under 2.5% p.a. rental inflation.
          </p>
        </div>
      </div>

      {/* Step 4: Loan Eligibility (MSR/TDSR) */}
      <div>
        <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-800">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
          <h2 className="font-bold text-xs uppercase tracking-widest text-slate-300">
            Step 4: Loan Eligibility (MSR/TDSR)
          </h2>
        </div>

        <div className="space-y-3 mb-3">
          {/* Gross Monthly Income */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Gross Monthly Income ($):
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 text-sm">
                $
              </span>
              <input
                id="gross-income-input"
                type="number"
                min={0}
                step={100}
                value={params.grossMonthlyIncome}
                onChange={(e) => onChange({ grossMonthlyIncome: Math.max(0, Number(e.target.value)) })}
                className="w-full pl-7 pr-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Existing Monthly Debt */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Existing Monthly Debt (car loan, cards, etc) ($):
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 text-sm">
                $
              </span>
              <input
                id="existing-debt-input"
                type="number"
                min={0}
                step={50}
                value={params.existingMonthlyDebt}
                onChange={(e) => onChange({ existingMonthlyDebt: Math.max(0, Number(e.target.value)) })}
                className="w-full pl-7 pr-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Regulatory Guidance Callout */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 text-[11px] text-slate-300 leading-relaxed">
          <div className="font-semibold text-indigo-300 mb-1 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-indigo-400" />
            MAS Regulatory Limits (4.0% Stress Test):
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-slate-400">
            <li>
              <strong className="text-slate-300">MSR (30% max):</strong> Max monthly loan repayment:{' '}
              <span className="font-mono text-indigo-300">{formatDollar(maxMsrBudget)}</span>
            </li>
            <li>
              <strong className="text-slate-300">TDSR (55% max):</strong> Total monthly debt service ceiling:{' '}
              <span className="font-mono text-indigo-300">{formatDollar(maxTdsrBudget)}</span>
            </li>
          </ul>
          <p className="mt-2 text-[10.5px] text-slate-400 italic bg-amber-950/30 border border-amber-900/40 p-2 rounded text-amber-200/80">
            Eligibility is checked at MAS's mandatory 4% stress-test rate, regardless of the rate entered above — this is separate from your actual projected cash flow.
          </p>
        </div>
      </div>
    </aside>
  );
};
