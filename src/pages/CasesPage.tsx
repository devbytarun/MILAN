import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getLocalCases, FullCaseData } from '../services/caseService.ts';
import {
  Search,
  Filter,
  Clock,
  CheckCircle2,
  ArrowRight,
  FilePlus,
} from 'lucide-react';

export const CasesPage: React.FC = () => {
  const [cases, setCases] = useState<FullCaseData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'MISSING' | 'FOUND'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VERIFIED_MATCH' | 'POSSIBLE_MATCH' | 'SEARCHING'>('ALL');

  useEffect(() => {
    setCases(getLocalCases());
  }, []);

  const filtered = cases.filter((item) => {
    const { case: c, attributes: a, report: r } = item;
    const name = a.full_name || '';
    const uid = c.case_uid || '';
    const loc = r.found_location || '';
    const clue = a.identifying_clue || '';

    const query = searchTerm.toLowerCase();
    const matchesSearch =
      name.toLowerCase().includes(query) ||
      uid.toLowerCase().includes(query) ||
      loc.toLowerCase().includes(query) ||
      clue.toLowerCase().includes(query);

    const matchesType = typeFilter === 'ALL' || c.case_type === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cases Registry</h1>
          <p className="text-xs text-slate-500">
            Live cross-referenced database across emergency triage centers, camps, and family intakes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/report/missing"
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
          >
            <FilePlus className="w-3.5 h-3.5" /> File Missing
          </Link>
          <Link
            to="/report/found"
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
          >
            <FilePlus className="w-3.5 h-3.5" /> Register Found
          </Link>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by name, Milan UID, location, clue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Type:
            </span>
            {(['ALL', 'MISSING', 'FOUND'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  typeFilter === t
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 ml-0 sm:ml-2">
            <span className="text-xs font-semibold text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg outline-none bg-white text-slate-700 font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="POSSIBLE_MATCH">Possible Matches</option>
              <option value="VERIFIED_MATCH">Verified Matches</option>
              <option value="SEARCHING">Searching</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Case UID</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Reported Subject</th>
                <th className="p-3.5">Location / Shelter</th>
                <th className="p-3.5">Key Clue / Marks</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => {
                const { case: c, attributes: a, report: r } = item;
                return (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5 font-mono font-bold text-blue-700">
                      <Link to={`/cases/${c.id}`} className="hover:underline">
                        {c.case_uid}
                      </Link>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.case_type === 'MISSING'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {c.case_type}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">
                        {a.full_name || (c.case_type === 'FOUND' ? 'Unidentified Survivor' : 'Name Withheld')}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {a.age || a.approximate_age ? `Age ${a.age || a.approximate_age}` : 'Age Unknown'} • {a.gender || 'Unknown'} • {a.blood_group || 'Blood ?'}
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-600 max-w-[200px] truncate">
                      {r.found_location || 'Not recorded'}
                    </td>
                    <td className="p-3.5 text-slate-600 max-w-[180px] truncate">
                      {a.identifying_clue || a.scars || '—'}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 w-fit ${
                          c.status === 'VERIFIED_MATCH'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : c.status === 'POSSIBLE_MATCH'
                            ? 'bg-amber-100 text-amber-800 border-amber-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {c.status === 'VERIFIED_MATCH' ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Clock className="w-3 h-3 text-amber-600" />
                        )}
                        {c.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <Link
                        to={`/cases/${c.id}`}
                        className="text-blue-600 hover:text-blue-800 font-bold inline-flex items-center gap-1"
                      >
                        View <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
