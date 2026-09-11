import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getLocalCases, FullCaseData } from '../services/caseService.ts';
import {
  Search,
  Filter,
  Clock,
  CheckCircle2,
  ArrowRight,
  FilePlus,
  Inbox,
} from 'lucide-react';
import { Button } from '../components/ui/Button.tsx';
import { Badge } from '../components/ui/Badge.tsx';

export const CasesPage: React.FC = () => {
  const navigate = useNavigate();
  const [cases] = useState<FullCaseData[]>(() => getLocalCases());
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'MISSING' | 'FOUND'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VERIFIED_MATCH' | 'POSSIBLE_MATCH' | 'SEARCHING'>('ALL');

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
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Badge variant="shade" size="sm">
            Central Directory
          </Badge>
          <h1 className="type-display-md text-ink mt-1.5">Cases Registry</h1>
          <p className="type-caption text-shade-50">
            Live cross-referenced database across emergency triage centers, camps, and family intakes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="aloe"
            size="sm"
            onClick={() => navigate('/report/missing')}
            leftIcon={<FilePlus className="w-3.5 h-3.5" />}
          >
            File Missing
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/report/found')}
            leftIcon={<FilePlus className="w-3.5 h-3.5" />}
          >
            Register Found
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-canvas-light border border-hairline-light rounded-lg p-4 sm:p-5 shadow-elevation-3 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-shade-40 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search name, UID, location, clue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2 text-xs border border-hairline-light rounded-md outline-none bg-canvas-light focus:border-ink transition-colors placeholder:text-shade-40"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-shade-50 flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" /> Type:
            </span>
            {(['ALL', 'MISSING', 'FOUND'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-pill text-xs font-medium transition-colors ${
                  typeFilter === t
                    ? 'bg-ink text-on-primary font-semibold'
                    : 'bg-canvas-cream text-shade-70 hover:bg-shade-30/50 border border-hairline-light'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 ml-0 sm:ml-2">
            <span className="text-xs font-semibold text-shade-50">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 text-xs border border-hairline-light rounded-md outline-none bg-canvas-light text-ink font-medium focus:border-ink transition-colors cursor-pointer"
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
      <div className="bg-canvas-light border border-hairline-light rounded-lg shadow-elevation-3 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-pill bg-canvas-cream flex items-center justify-center mx-auto text-shade-40 border border-hairline-light">
              <Inbox className="w-6 h-6" />
            </div>
            <h3 className="type-heading-md text-ink">No matching cases found</h3>
            <p className="type-caption text-shade-50 max-w-sm mx-auto">
              No registry entries match your query "{searchTerm}". Try refining filters or search criteria.
            </p>
            <Button
              variant="outline-light"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('ALL');
                setStatusFilter('ALL');
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-canvas-cream text-shade-60 font-semibold border-b border-hairline-light">
                <tr>
                  <th className="p-4">Case UID</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Reported Subject</th>
                  <th className="p-4">Location / Shelter</th>
                  <th className="p-4">Key Clue / Marks</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline-light">
                {filtered.map((item) => {
                  const { case: c, attributes: a, report: r } = item;
                  return (
                    <tr key={c.id} className="hover:bg-canvas-cream/60 transition-colors">
                      <td className="p-4 font-mono font-bold text-ink">
                        <Link to={`/cases/${c.id}`} className="hover:underline">
                          {c.case_uid}
                        </Link>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={c.case_type === 'MISSING' ? 'shade' : 'mint'}
                          size="sm"
                        >
                          {c.case_type}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-ink">
                          {a.full_name || (c.case_type === 'FOUND' ? 'Unidentified Survivor' : 'Name Withheld')}
                        </div>
                        <div className="type-caption text-shade-50">
                          {a.age || a.approximate_age ? `Age ${a.age || a.approximate_age}` : 'Age Unknown'} • {a.gender || 'Unknown'} • {a.blood_group || 'Blood ?'}
                        </div>
                      </td>
                      <td className="p-4 text-shade-60 max-w-[200px] truncate">
                        {r.found_location || 'Not recorded'}
                      </td>
                      <td className="p-4 text-shade-60 max-w-[180px] truncate">
                        {a.identifying_clue || a.scars || '—'}
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={
                            c.status === 'VERIFIED_MATCH'
                              ? 'verified'
                              : c.status === 'POSSIBLE_MATCH'
                              ? 'pending'
                              : 'shade'
                          }
                          size="sm"
                          icon={
                            c.status === 'VERIFIED_MATCH' ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : (
                              <Clock className="w-3 h-3" />
                            )
                          }
                        >
                          {c.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          to={`/cases/${c.id}`}
                          className="text-ink hover:underline font-semibold inline-flex items-center gap-1"
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
        )}
      </div>
    </div>
  );
};
