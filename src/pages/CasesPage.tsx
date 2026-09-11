import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCasesForUser, FullCaseData } from '../services/caseService.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useI18n } from '../context/I18nContext.tsx';
import { hasPermission } from '../lib/permissions.ts';
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
  const { profile } = useAuth();
  const { t } = useI18n();
  const [cases, setCases] = useState<FullCaseData[]>(() => getCasesForUser(profile));
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'MISSING' | 'FOUND'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VERIFIED_MATCH' | 'POSSIBLE_MATCH' | 'SEARCHING'>('ALL');

  useEffect(() => {
    setCases(getCasesForUser(profile));
  }, [profile]);

  const canReportMissing = hasPermission(profile?.role, 'CREATE_MISSING_REPORT');
  const canReportFound = hasPermission(profile?.role, 'CREATE_FOUND_REPORT');
  const canReview = hasPermission(profile?.role, 'REVIEW_MATCH');
  const isFamily = profile?.role === 'FAMILY';

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
          <h1 className="font-display text-2xl sm:text-3xl font-normal text-[#181d26] mt-1.5">
            {t('cases_title')}
          </h1>
          <p className="text-sm text-[#41454d]">
            {t('cases_subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {canReportMissing && (
            <Button
              variant="coral"
              size="sm"
              onClick={() => navigate('/report/missing')}
              leftIcon={<FilePlus className="w-3.5 h-3.5" />}
            >
              File Missing
            </Button>
          )}
          {canReportFound && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/report/found')}
              leftIcon={<FilePlus className="w-3.5 h-3.5" />}
            >
              Register Rescued
            </Button>
          )}
        </div>
      </div>

      {/* Filters Bar (Airtable Input & Pill Bar) */}
      <div className="bg-white border border-[#dddddd] rounded-xl p-4 sm:p-5 shadow-elevation-1 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96 flex items-center">
          <Search className="w-4 h-4 text-[#9297a0] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder={t('cases_search_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full !pl-10 pr-3.5 py-2 text-xs border border-[#dddddd] rounded-md outline-none bg-white text-[#181d26] focus:border-[#181d26] transition-colors placeholder:text-[#9297a0]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-[#41454d] flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5 text-[#9297a0]" /> Type:
            </span>
            {(['ALL', 'MISSING', 'FOUND'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  typeFilter === type
                    ? 'bg-[#181d26] text-white font-semibold'
                    : 'bg-white text-[#41454d] hover:bg-[#f8fafc] border border-[#dddddd]'
                }`}
              >
                {type === 'ALL' ? t('cases_filter_all') : type === 'MISSING' ? t('cases_filter_missing') : t('cases_filter_found')}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 ml-0 sm:ml-2">
            <span className="text-xs font-semibold text-[#41454d]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 text-xs border border-[#dddddd] rounded-md outline-none bg-white text-[#181d26] font-medium focus:border-[#181d26] transition-colors cursor-pointer"
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
      <div className="bg-white border border-[#dddddd] rounded-xl shadow-elevation-1 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#f8fafc] flex items-center justify-center mx-auto text-[#9297a0] border border-[#dddddd]">
              <Inbox className="w-6 h-6" />
            </div>
            <h3 className="font-display text-lg font-normal text-[#181d26]">{t('cases_empty_title')}</h3>
            <p className="text-xs text-[#41454d] max-w-sm mx-auto">
              {t('cases_empty_desc')}
            </p>
            <Button
              variant="secondary"
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
              <thead className="bg-[#f8fafc] text-[#333840] font-semibold border-b border-[#dddddd]">
                <tr>
                  <th className="p-4">Case UID</th>
                  <th className="p-4">{t('cases_col_type')}</th>
                  <th className="p-4">{t('cases_col_person')}</th>
                  <th className="p-4">{t('cases_col_location')}</th>
                  <th className="p-4">Key Clue / Marks</th>
                  <th className="p-4">{t('cases_col_status')}</th>
                  <th className="p-4 text-right">{t('cases_col_actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dddddd]">
                {filtered.map((item) => {
                  const { case: c, attributes: a, report: r } = item;
                  return (
                    <tr key={c.id} className="hover:bg-[#f8fafc] transition-colors">
                      <td className="p-4 font-mono font-bold text-[#181d26]">
                        <Link to={`/cases/${c.id}`} className="hover:underline">
                          {c.case_uid}
                        </Link>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={c.case_type === 'MISSING' ? 'coral' : 'forest'}
                          size="sm"
                        >
                          {c.case_type}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-[#181d26]">
                          {a.full_name || (c.case_type === 'FOUND' ? 'Unidentified Survivor' : 'Name Withheld')}
                        </div>
                        <div className="text-[11px] text-[#9297a0] mt-0.5">
                          {a.age || a.approximate_age ? `Age ${a.age || a.approximate_age}` : 'Age Unknown'} • {a.gender || 'Unknown'} • {a.blood_group || 'Blood ?'}
                        </div>
                      </td>
                      <td className="p-4 text-[#41454d] max-w-[200px] truncate">
                        {r.found_location || 'Not recorded'}
                      </td>
                      <td className="p-4 text-[#41454d] max-w-[180px] truncate">
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
                              <CheckCircle2 className="w-3 h-3 text-[#006400]" />
                            ) : (
                              <Clock className="w-3 h-3 text-[#d9a441]" />
                            )
                          }
                        >
                          {c.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        {(() => {
                          const isOwnCase =
                            (c.created_by && (c.created_by === profile?.id || c.created_by === profile?.auth_user_id)) ||
                            (isFamily && (c.created_by === 'family-demo' || c.id === 'case-demo-1'));

                          const actionLabel = isOwnCase
                            ? 'My Case Status'
                            : canReview
                            ? t('cases_view_details')
                            : 'View Record';

                          const targetUrl = isOwnCase && isFamily
                            ? `/cases/${c.id}/status`
                            : `/cases/${c.id}`;

                          return (
                            <Link
                              to={targetUrl}
                              className="text-[#181d26] hover:underline font-semibold inline-flex items-center gap-1"
                            >
                              {actionLabel} <ArrowRight className="w-3 h-3" />
                            </Link>
                          );
                        })()}
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
