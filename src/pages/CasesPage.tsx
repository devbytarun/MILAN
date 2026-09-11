import React, { useState } from 'react';
import { Search, Filter, Clock, CheckCircle2, ArrowRight } from 'lucide-react';

const MOCK_CASES = [
  {
    id: 'case-1',
    uid: 'MILAN-2026-081',
    type: 'MISSING',
    name: 'Aarav Sharma',
    age: 9,
    gender: 'Male',
    location: 'Alaknanda Riverside Market, Sector 4',
    status: 'POSSIBLE_MATCH',
    reporter: 'Anita Sharma (Family)',
    updatedAt: '12 mins ago',
  },
  {
    id: 'case-2',
    uid: 'MILAN-2026-094',
    type: 'FOUND',
    name: 'Unidentified Minor',
    age: 9,
    gender: 'Male',
    location: 'Camp Relief Zone 2 (NDRF Intake)',
    status: 'POSSIBLE_MATCH',
    reporter: 'Major Vikram Rathore (Army Rescue)',
    updatedAt: '25 mins ago',
  },
  {
    id: 'case-3',
    uid: 'MILAN-2026-065',
    type: 'MISSING',
    name: 'Meera Sen',
    age: 64,
    gender: 'Female',
    location: 'Bridge Colony, Block C',
    status: 'VERIFIED_MATCH',
    reporter: 'Debasis Sen (Family)',
    updatedAt: '2 hours ago',
  },
  {
    id: 'case-4',
    uid: 'MILAN-2026-102',
    type: 'FOUND',
    name: 'Sunil Verma',
    age: 42,
    gender: 'Male',
    location: 'City Trauma Center (Bed #14)',
    status: 'SEARCHING',
    reporter: 'Dr. Sunita Patel (Hospital)',
    updatedAt: '3 hours ago',
  },
];

export const CasesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'MISSING' | 'FOUND'>('ALL');

  const filtered = MOCK_CASES.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.uid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'ALL' || c.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cases Registry</h1>
          <p className="text-xs text-slate-500">
            Search active missing and found records across all emergency triage and relief camps
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by name, Milan UID, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
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
      </div>

      {/* Cases List */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Case UID</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Reported Subject</th>
                <th className="p-3.5">Last Known / Shelter Location</th>
                <th className="p-3.5">Reporting Source</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition">
                  <td className="p-3.5 font-mono font-bold text-blue-700">{c.uid}</td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.type === 'MISSING'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {c.type}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <div className="font-semibold text-slate-800">{c.name}</div>
                    <div className="text-[11px] text-slate-400">
                      Age {c.age} • {c.gender}
                    </div>
                  </td>
                  <td className="p-3.5 text-slate-600">{c.location}</td>
                  <td className="p-3.5 text-slate-500 text-[11px]">{c.reporter}</td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 w-fit ${
                        c.status === 'VERIFIED_MATCH'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : c.status === 'POSSIBLE_MATCH'
                          ? 'bg-amber-100 text-amber-800 border-amber-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {c.status === 'VERIFIED_MATCH' ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                      {c.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1">
                      Details <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
