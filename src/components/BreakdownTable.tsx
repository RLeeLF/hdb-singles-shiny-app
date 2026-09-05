import React, { useState, useMemo } from 'react';
import { SimulationResult } from '../types';
import { formatDollar, formatPercent } from '../utils/financialRules';
import {
  Table as TableIcon,
  Download,
  Search,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
} from 'lucide-react';

interface BreakdownTableProps {
  data: SimulationResult[];
}

export const BreakdownTable: React.FC<BreakdownTableProps> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPathway, setFilterPathway] = useState<string>('ALL');
  const [sortField, setSortField] = useState<keyof SimulationResult>('netWorth5y');
  const [sortAsc, setSortAsc] = useState(false);

  const processedRows = useMemo(() => {
    return data.map((row) => {
      const unavailable = row.schemeIneligible || row.btoDataUnavailable;

      let lendingEligibleText = 'Yes';
      if (row.schemeIneligible) {
        lendingEligibleText = 'Not applicable (Singles Scheme: 2-Room only)';
      } else if (row.btoDataUnavailable) {
        lendingEligibleText = 'Not applicable (no BTO history this town)';
      } else if (row.path === 'Renting') {
        lendingEligibleText = '—';
      } else if (row.regulatoryFail) {
        lendingEligibleText = 'No (MSR/TDSR)';
      }

      let dataConfidenceText = 'Good';
      if (unavailable || row.path === 'Renting') {
        dataConfidenceText = '—';
      } else if (row.lowConfidence) {
        dataConfidenceText = 'Limited (thin/stale supporting data)';
      }

      return {
        ...row,
        unavailable,
        lendingEligibleText,
        dataConfidenceText,
        formattedMonthly: unavailable ? '—' : formatDollar(row.monthlyHousing),
        formattedInitialPrice:
          unavailable || row.initialPrice === null ? '—' : formatDollar(row.initialPrice),
        formattedGrowth:
          unavailable || row.path === 'Renting' ? '—' : formatPercent(row.growthRate, 2),
        formattedNetWorth: unavailable ? '—' : formatDollar(row.netWorth5y),
      };
    });
  }, [data]);

  const filteredRows = useMemo(() => {
    return processedRows.filter((row) => {
      if (filterPathway !== 'ALL' && row.path !== filterPathway) {
        return false;
      }
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchesLabel = row.displayName.toLowerCase().includes(query);
        const matchesTown = row.town.toLowerCase().includes(query);
        const matchesPath = row.path.toLowerCase().includes(query);
        return matchesLabel || matchesTown || matchesPath;
      }
      return true;
    });
  }, [processedRows, filterPathway, searchTerm]);

  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((a, b) => {
      const valA = (a as any)[sortField];
      const valB = (b as any)[sortField];
      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }
      return sortAsc
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [filteredRows, sortField, sortAsc]);

  const handleSort = (field: keyof SimulationResult) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const exportCSV = () => {
    const headers = [
      'Configuration Label',
      'Pathway Option',
      'Monthly Payment',
      'Initial Asset Price',
      'Growth Path Vector',
      'Projected Net Worth',
      'Lending Eligible?',
      'Data Confidence',
    ];

    const rows = sortedRows.map((r) => [
      `"${r.displayName.replace(/"/g, '""')}"`,
      `"${r.path}"`,
      `"${r.formattedMonthly}"`,
      `"${r.formattedInitialPrice}"`,
      `"${r.formattedGrowth}"`,
      `"${r.formattedNetWorth}"`,
      `"${r.lendingEligibleText}"`,
      `"${r.dataConfidenceText}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hdb_housing_strategy_matrix_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      id="summary-table-section"
      className="bg-slate-800/20 border border-slate-700/50 rounded-2xl p-5 shadow-lg flex flex-col gap-4 backdrop-blur-xs"
    >
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/50">
        <div>
          <div className="flex items-center gap-2">
            <TableIcon className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white text-base tracking-wide">
              Granular Financial Breakdown Table
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Exact mathematical ledger across simulated town, room size, and pathway alternatives.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Pathway Filter */}
          <select
            value={filterPathway}
            onChange={(e) => setFilterPathway(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-200 font-medium focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Pathways ({data.length})</option>
            <option value="BTO Purchase">BTO Purchase</option>
            <option value="Resale Purchase">Resale Purchase</option>
            <option value="Renting">Renting</option>
          </select>

          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search table..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs pl-8 pr-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-36 sm:w-44"
            />
          </div>

          {/* Export CSV */}
          <button
            type="button"
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-slate-700/60">
        <table id="summary-table" className="w-full text-xs text-slate-300 text-center border-collapse">
          <thead>
            <tr className="bg-slate-800/80 text-slate-300 font-semibold border-b border-slate-700">
              <th
                onClick={() => handleSort('displayName')}
                className="px-3.5 py-2.5 text-left cursor-pointer hover:bg-slate-700/60 transition-colors whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>Configuration Label</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort('path')}
                className="px-3 py-2.5 cursor-pointer hover:bg-slate-700/60 transition-colors whitespace-nowrap"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Pathway Option</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort('monthlyHousing')}
                className="px-3 py-2.5 cursor-pointer hover:bg-slate-700/60 transition-colors whitespace-nowrap"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Monthly Payment</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort('initialPrice')}
                className="px-3 py-2.5 cursor-pointer hover:bg-slate-700/60 transition-colors whitespace-nowrap"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Initial Asset Price</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort('growthRate')}
                className="px-3 py-2.5 cursor-pointer hover:bg-slate-700/60 transition-colors whitespace-nowrap"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Growth Path Vector</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort('netWorth5y')}
                className="px-3 py-2.5 cursor-pointer hover:bg-slate-700/60 transition-colors whitespace-nowrap"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Projected Net Worth</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="px-3 py-2.5 whitespace-nowrap">Lending Eligible?</th>
              <th className="px-3 py-2.5 whitespace-nowrap">Data Confidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-900/40">
            {sortedRows.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                  No configuration entries found matching filter.
                </td>
              </tr>
            ) : (
              sortedRows.map((row, idx) => {
                const isBto = row.path === 'BTO Purchase';
                const isResale = row.path === 'Resale Purchase';
                const isRenting = row.path === 'Renting';

                return (
                  <tr
                    key={`${row.town}-${row.flatType}-${row.path}-${idx}`}
                    className={`hover:bg-slate-800/60 transition-colors ${
                      row.budgetViolator ? 'bg-amber-950/20' : ''
                    } ${row.regulatoryFail ? 'bg-rose-950/20' : ''}`}
                  >
                    {/* Configuration Label with badges */}
                    <td className="px-3.5 py-2.5 text-left font-medium text-white max-w-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="leading-snug">{row.displayName}</span>
                      </div>
                    </td>

                    {/* Pathway Option */}
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                          isBto
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/70'
                            : isResale
                            ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-800/70'
                            : 'bg-rose-950/80 text-rose-300 border border-rose-800/70'
                        }`}
                      >
                        {row.path}
                      </span>
                    </td>

                    {/* Monthly Payment */}
                    <td className="px-3 py-2.5 font-mono whitespace-nowrap">
                      <span
                        className={
                          row.budgetViolator ? 'text-amber-300 font-bold' : 'text-slate-200'
                        }
                      >
                        {row.formattedMonthly}
                      </span>
                    </td>

                    {/* Initial Asset Price */}
                    <td className="px-3 py-2.5 font-mono whitespace-nowrap text-slate-300">
                      {row.formattedInitialPrice}
                    </td>

                    {/* Growth Path Vector */}
                    <td className="px-3 py-2.5 font-mono whitespace-nowrap">
                      {row.formattedGrowth !== '—' ? (
                        <span className="text-emerald-400 font-semibold">
                          +{row.formattedGrowth}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>

                    {/* Projected Net Worth */}
                    <td className="px-3 py-2.5 font-mono font-semibold whitespace-nowrap">
                      <span
                        className={
                          row.netWorth5y > 0
                            ? 'text-emerald-400'
                            : row.netWorth5y < 0
                            ? 'text-rose-400'
                            : 'text-slate-500'
                        }
                      >
                        {row.formattedNetWorth}
                      </span>
                    </td>

                    {/* Lending Eligible? */}
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      {row.lendingEligibleText === 'Yes' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Yes
                        </span>
                      ) : row.lendingEligibleText === 'No (MSR/TDSR)' ? (
                        <span className="inline-flex items-center gap-1 text-rose-400 font-semibold">
                          <XCircle className="w-3.5 h-3.5 text-rose-400" />
                          No (MSR/TDSR)
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px] leading-tight">
                          {row.lendingEligibleText}
                        </span>
                      )}
                    </td>

                    {/* Data Confidence */}
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      {row.dataConfidenceText === 'Good' ? (
                        <span className="text-slate-300 font-medium">Good</span>
                      ) : row.dataConfidenceText.includes('Limited') ? (
                        <span className="inline-flex items-center gap-1 text-amber-400 font-medium text-[11px]">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                          Limited
                        </span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Notes */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1">
        <span>Showing {sortedRows.length} configuration combinations</span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]" /> Unaffordable (&gt; Comfortable Budget)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.6)]" /> Regulatory Fail (MSR &gt; 30% or TDSR &gt; 55%)
          </span>
        </div>
      </div>
    </div>
  );
};
