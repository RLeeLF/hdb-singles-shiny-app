import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { SimulationResult } from '../types';
import { formatDollar } from '../utils/financialRules';
import { BarChart3, TrendingUp, Info } from 'lucide-react';

interface ProjectionChartProps {
  data: SimulationResult[];
}

interface ChartItem {
  displayName: string;
  shortLabel: string;
  town: string;
  flatType: string;
  cluster: string;
  btoNetWorth?: number;
  resaleNetWorth?: number;
  rentingNetWorth: number;
  btoDetails?: SimulationResult;
  resaleDetails?: SimulationResult;
  rentingDetails?: SimulationResult;
}

export const ProjectionChart: React.FC<ProjectionChartProps> = ({ data }) => {
  const [viewMode, setViewMode] = useState<'grouped' | 'ranked'>('grouped');

  // Filter out bto_data_unavailable as in R script: df <- results_data() %>% filter(!bto_data_unavailable)
  const validData = data.filter((d) => !d.btoDataUnavailable);

  // 1. Grouped by configuration label (Town + Flat Type)
  const groupedMap = new Map<string, ChartItem>();

  for (const item of validData) {
    const key = item.displayName;
    if (!groupedMap.has(key)) {
      groupedMap.set(key, {
        displayName: item.displayName,
        shortLabel: `${item.town} (${item.flatType.replace('_', '-')})`,
        town: item.town,
        flatType: item.flatType,
        cluster: item.clusterLabel,
        rentingNetWorth: 0,
      });
    }
    const group = groupedMap.get(key)!;
    if (item.path === 'BTO Purchase') {
      group.btoNetWorth = item.netWorth5y;
      group.btoDetails = item;
    } else if (item.path === 'Resale Purchase') {
      group.resaleNetWorth = item.netWorth5y;
      group.resaleDetails = item;
    } else if (item.path === 'Renting') {
      group.rentingNetWorth = item.netWorth5y;
      group.rentingDetails = item;
    }
  }

  const groupedChartData = Array.from(groupedMap.values());

  // 2. Ranked flat data for alternative sorted view
  const rankedChartData = [...validData]
    .sort((a, b) => b.netWorth5y - a.netWorth5y)
    .map((item) => ({
      name: `${item.town} ${item.flatType.replace('_', '-')} [${item.path}]`,
      netWorth: item.netWorth5y,
      path: item.path,
      monthly: item.monthlyHousing,
      status: item.regulatoryFail ? 'Fails MSR/TDSR' : item.budgetViolator ? 'Over Budget' : 'Eligible',
      displayName: item.displayName,
    }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-white/95 backdrop-blur-xs p-3.5 rounded-lg shadow-xl border border-slate-200 text-xs max-w-xs z-50">
        <p className="font-bold text-slate-800 border-b border-slate-100 pb-1.5 mb-2 leading-tight">
          {label}
        </p>
        <div className="space-y-2">
          {payload.map((entry: any) => {
            if (entry.value === undefined || entry.value === null) return null;
            const color = entry.color;
            const name = entry.name;
            const value = entry.value;

            return (
              <div key={name} className="flex flex-col gap-0.5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                    <span className="font-semibold text-slate-700">{name}</span>
                  </div>
                  <span
                    className={`font-mono font-bold ${
                      value >= 0 ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    {formatDollar(value)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-[10px] text-slate-400 mt-2 pt-1.5 border-t border-slate-100">
          5-year projected asset equity minus remaining mortgage debt, or total rental outlay.
        </p>
      </div>
    );
  };

  return (
    <div
      id="networth-plot-card"
      className="bg-slate-800/20 border border-slate-700/50 rounded-2xl p-5 shadow-lg flex flex-col gap-4 overflow-hidden backdrop-blur-xs"
    >
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/50">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white text-base tracking-wide">
              Cross-Comparison Simulation Grid Output
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Projected 5-Year Net Worth Accumulation across Strategy Paths
          </p>
        </div>

        {/* View Switcher & Legend summary */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-slate-700 p-0.5 bg-slate-900/80 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('grouped')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                viewMode === 'grouped'
                  ? 'bg-indigo-600 shadow-xs text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Grouped Matrix
            </button>
            <button
              type="button"
              onClick={() => setViewMode('ranked')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                viewMode === 'ranked'
                  ? 'bg-indigo-600 shadow-xs text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Ranked Leaderboard
            </button>
          </div>
        </div>
      </div>

      {/* Palette Legend Indicator */}
      <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 bg-slate-800/40 py-2 px-3 rounded-lg border border-slate-700/40">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-xs bg-[#10B981] inline-block shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
          <span className="font-medium text-slate-200">BTO Purchase</span>
          <span className="text-[10px] text-slate-500">(2-Room Singles Scheme)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-xs bg-[#6366F1] inline-block shadow-[0_0_6px_rgba(99,102,241,0.5)]" />
          <span className="font-medium text-slate-200">Resale Purchase</span>
          <span className="text-[10px] text-slate-500">(Open Market)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-xs bg-[#F43F5E] inline-block shadow-[0_0_6px_rgba(244,63,94,0.5)]" />
          <span className="font-medium text-slate-200">Renting</span>
          <span className="text-[10px] text-slate-500">(Cumulative Outflow)</span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-[460px] pt-2">
        {groupedChartData.length === 0 ? (
          <div className="h-full flex items-center justify-center flex-col text-slate-500 gap-2">
            <Info className="w-8 h-8" />
            <p className="text-sm">Please select at least one town and flat type to view the simulation plot.</p>
          </div>
        ) : viewMode === 'grouped' ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={groupedChartData}
              margin={{ top: 20, right: 30, left: 35, bottom: 90 }}
              barGap={6}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.6} />
              <XAxis
                dataKey="displayName"
                tick={{ fontSize: 11, fill: '#94A3B8' }}
                interval={0}
                angle={-30}
                textAnchor="end"
                height={85}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#94A3B8' }}
                tickFormatter={(val) => formatDollar(val)}
              />
              <Tooltip
                content={({ active, payload, label }: any) => {
                  if (!active || !payload || !payload.length) return null;
                  return (
                    <div className="bg-slate-900/95 backdrop-blur-md p-3.5 rounded-xl shadow-2xl border border-slate-700 text-xs max-w-xs z-50 text-slate-200">
                      <p className="font-bold text-white border-b border-slate-700 pb-1.5 mb-2 leading-tight">
                        {label}
                      </p>
                      <div className="space-y-2">
                        {payload.map((entry: any) => {
                          if (entry.value === undefined || entry.value === null) return null;
                          return (
                            <div key={entry.name} className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                <span className="text-slate-300">{entry.name}</span>
                              </div>
                              <span
                                className={`font-mono font-bold ${
                                  entry.value >= 0 ? 'text-emerald-400' : 'text-rose-400'
                                }`}
                              >
                                {formatDollar(entry.value)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2 pt-1.5 border-t border-slate-800">
                        5-year projected asset equity minus remaining loan balance.
                      </p>
                    </div>
                  );
                }}
              />
              <ReferenceLine y={0} stroke="#475569" strokeWidth={1.5} />
              <Bar
                dataKey="btoNetWorth"
                name="BTO Purchase"
                fill="#10B981"
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
              />
              <Bar
                dataKey="resaleNetWorth"
                name="Resale Purchase"
                fill="#6366F1"
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
              />
              <Bar
                dataKey="rentingNetWorth"
                name="Renting"
                fill="#F43F5E"
                radius={[0, 0, 4, 4]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={rankedChartData}
              layout="vertical"
              margin={{ top: 15, right: 30, left: 140, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.6} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: '#94A3B8' }}
                tickFormatter={(val) => formatDollar(val)}
              />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 10, fill: '#CBD5E1' }}
                width={135}
              />
              <Tooltip
                content={({ active, payload, label }: any) => {
                  if (!active || !payload || !payload.length) return null;
                  const item = payload[0];
                  return (
                    <div className="bg-slate-900/95 backdrop-blur-md p-3 rounded-lg border border-slate-700 text-xs shadow-xl text-slate-200">
                      <p className="font-bold text-white mb-1">{label}</p>
                      <div className="font-mono font-bold text-indigo-400">
                        {formatDollar(Number(item.value))}
                      </div>
                    </div>
                  );
                }}
              />
              <ReferenceLine x={0} stroke="#475569" strokeWidth={1.5} />
              <Bar
                dataKey="netWorth"
                fill="#6366F1"
                radius={[0, 4, 4, 0]}
                maxBarSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
