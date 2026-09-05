import React, { useState, useMemo } from 'react';
import { HeroBanner } from './components/HeroBanner';
import { SidebarControls } from './components/SidebarControls';
import { ProjectionChart } from './components/ProjectionChart';
import { BreakdownTable } from './components/BreakdownTable';
import { RecommendationsCard } from './components/RecommendationsCard';
import { SimulationParams, runSimulation } from './utils/simulation';
import {
  TrendingUp,
  Award,
  HelpCircle,
  FileSpreadsheet,
  Building,
  RotateCcw,
  CheckCircle,
} from 'lucide-react';

export default function App() {
  // Initial parameters matching R script defaults exactly
  const initialParams: SimulationParams = {
    selectedTowns: ['PUNGGOL'],
    selectedRoomTypes: ['4_ROOM'],
    remainingLease: 75,
    monthlyBudget: 3500,
    cashInjection: 100000,
    interestRate: 3.5,
    baseRent: 2200,
    grossMonthlyIncome: 6000,
    existingMonthlyDebt: 0,
  };

  const [params, setParams] = useState<SimulationParams>(initialParams);
  const [activeTab, setActiveTab] = useState<'matrix' | 'recommendations'>('matrix');
  const [showFaqModal, setShowFaqModal] = useState(false);

  const handleParamChange = (updated: Partial<SimulationParams>) => {
    setParams((prev) => ({ ...prev, ...updated }));
  };

  const handleReset = () => {
    setParams(initialParams);
  };

  // Run the simulation reactively whenever parameters change
  const simulationResults = useMemo(() => {
    return runSimulation(params);
  }, [params]);

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 antialiased font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="bg-slate-900/90 border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-black text-sm shadow-[0_0_15px_rgba(99,102,241,0.4)]">
              HDB
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base sm:text-lg tracking-tight">
                  Housing Strategy Calculator
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 rounded-md">
                  Singles Age 35 Scheme
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Singapore Citizen BTO vs Resale vs Renting Quantitative Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700/80 bg-slate-800/60 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors shadow-xs"
              title="Reset inputs to default"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            <button
              type="button"
              onClick={() => setShowFaqModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600/90 hover:bg-indigo-600 text-white text-xs font-semibold shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Rules Guide</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grow w-full">
        {/* Hero Banner Component */}
        <HeroBanner />

        {/* 2-Column Responsive Layout matching R Shiny sidebarLayout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: sidebarPanel */}
          <div className="lg:col-span-5 xl:col-span-4">
            <SidebarControls params={params} onChange={handleParamChange} />
          </div>

          {/* Right Column: mainPanel with tabsetPanel */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-5">
            {/* Tabset Header matching Shiny tabsetPanel */}
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-1 shadow-md flex gap-1 backdrop-blur-xs">
              <button
                type="button"
                id="tab-matrix"
                onClick={() => setActiveTab('matrix')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'matrix'
                    ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>5-Year Wealth Projection Matrix</span>
              </button>

              <button
                type="button"
                id="tab-recommendations"
                onClick={() => setActiveTab('recommendations')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'recommendations'
                    ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Strategic Recommendations</span>
              </button>
            </div>

            {/* Tab 1: Wealth Projection Matrix */}
            {activeTab === 'matrix' && (
              <div className="space-y-6">
                {/* 1. Bar Chart: networth_plot */}
                <ProjectionChart data={simulationResults} />

                {/* 2. Breakdown Table: summary_table */}
                <BreakdownTable data={simulationResults} />
              </div>
            )}

            {/* Tab 2: Strategic Recommendations */}
            {activeTab === 'recommendations' && (
              <div className="space-y-6">
                <RecommendationsCard results={simulationResults} params={params} />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Rules Guide Modal */}
      {showFaqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-700 max-h-[85vh] overflow-y-auto space-y-4 text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    Singapore Single Citizen (SSC) Housing Rules Reference
                  </h3>
                  <p className="text-xs text-slate-400">Statutory and model arithmetic guidelines</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowFaqModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60">
                <h4 className="font-bold text-white mb-1.5 text-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  1. Single Singapore Citizen (SSC) Scheme Eligibility
                </h4>
                <p className="text-slate-400">
                  To purchase an HDB flat as a single buyer in Singapore, you must be a Singapore Citizen and at least 35 years old.
                  For new Build-To-Order (BTO) flats, singles can only apply for <strong className="text-white">2-Room Flexi flats</strong>.
                  For resale flats, singles are legally permitted to purchase any flat size (2, 3, 4, or 5-room).
                </p>
              </div>

              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60">
                <h4 className="font-bold text-white mb-1.5 text-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  2. MAS Mortgage Servicing Ratio (MSR) — 30%
                </h4>
                <p className="text-slate-400">
                  MSR caps the portion of your gross monthly income that goes towards servicing your HDB mortgage at <strong className="text-white">30%</strong>.
                  It is tested at MAS's mandatory <strong className="text-white">4.0% stress-test interest rate</strong>, ensuring you can sustain repayments even if market interest rates rise.
                </p>
              </div>

              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60">
                <h4 className="font-bold text-white mb-1.5 text-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  3. MAS Total Debt Servicing Ratio (TDSR) — 55%
                </h4>
                <p className="text-slate-400">
                  TDSR caps your total monthly debt obligations (mortgage, car loans, credit cards, student loans, personal loans) at <strong className="text-white">55%</strong> of your gross monthly income.
                </p>
              </div>

              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60">
                <h4 className="font-bold text-white mb-1.5 text-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  4. Remaining Lease & CPF Usage Limits
                </h4>
                <p className="text-slate-400">
                  If a flat has less than 60 years remaining lease, CPF Board limits the maximum CPF Ordinary Account funds you can withdraw.
                  The flat's remaining lease must also cover the youngest buyer up to age 95 for maximum financing.
                </p>
              </div>

              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60">
                <h4 className="font-bold text-white mb-1.5 text-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  5. 5-Year Equity vs Renting Methodology
                </h4>
                <p className="text-slate-400">
                  The model projects property appreciation over 5 years based on empirical town growth vectors and amortizes mortgage debt.
                  Net worth is calculated as Future Property Value minus Outstanding Loan Principal.
                  For renting, net worth is the negative sum of all monthly rent payments escalated at 2.5% p.a. inflation.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowFaqModal(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-900/80 border-t border-slate-800 mt-auto py-5">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          HDB Housing Strategy Calculator • Built for Singapore Citizens Age 35+ evaluating BTO, Resale, and Rental pathways.
        </div>
      </footer>
    </div>
  );
}
