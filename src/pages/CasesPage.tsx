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
    <div className="space-y-6 pb-12 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Badge variant="shade" size="sm">
            Central Directory
          </Badge>
          <h1 className="font-sans text-2xl sm:text-3xl font-bold text-slate-900 mt-1.5">
            {t('cases_title')}
          </h1>
          <p className="text-sm text-slate-600">
            {t('cases_subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {canReportMissing && (
            <Button
              variant="brand"
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

      {/* Filters Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-card flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96 flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder={t('cases_search_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-3.5 text-xs border border-slate-200 rounded-lg outline-none bg-white text-slate-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-600 flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" /> Type:
            </span>
            {(['ALL', 'MISSING', 'FOUND'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  typeFilter === type
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                {type === 'ALL' ? t('cases_filter_all') : type === 'MISSING' ? t('cases_filter_missing') : t('cases_filter_found')}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 ml-0 sm:ml-2">
            <span className="text-xs font-semibold text-slate-600">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="h-9 px-3 text-xs border border-slate-200 rounded-lg outline-none bg-white text-slate-900 font-medium focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all cursor-pointer"
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
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-400 border border-slate-200">
              <Inbox className="w-6 h-6" />
            </div>
            <h3 className="font-sans text-lg font-semibold text-slate-900">{t('cases_empty_title')}</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
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
              <thead className="bg-slate-50/80 text-slate-500 font-semibold text-[11px] uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Case UID</th>
                  <th className="py-3.5 px-4">{t('cases_col_type')}</th>
                  <th className="py-3.5 px-4">{t('cases_col_person')}</th>
                  <th className="py-3.5 px-4">{t('cases_col_location')}</th>
                  <th className="py-3.5 px-4">Key Clue / Marks</th>
                  <th className="py-3.5 px-4">{t('cases_col_status')}</th>
                  <th className="py-3.5 px-4 text-right">{t('cases_col_actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => {
                  const { case: c, attributes: a, report: r } = item;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-slate-900">
                        <Link to={`/cases/${c.id}`} className="hover:underline hover:text-orange-600 transition-colors">
                          {c.case_uid}
                        </Link>
                      </td>
                      <td className="py-4 px-4">
                        <Badge
                          variant={c.case_type === 'MISSING' ? 'critical' : 'verified'}
                          size="sm"
                        >
                          {c.case_type}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-900">
                          {a.full_name || (c.case_type === 'FOUND' ? 'Unidentified Survivor' : 'Name Withheld')}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {a.age || a.approximate_age ? `Age ${a.age || a.approximate_age}` : 'Age Unknown'} • {a.gender || 'Unknown'} • {a.blood_group || 'Blood ?'}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-600 max-w-[200px] truncate">
                        {r.found_location || 'Not recorded'}
                      </td>
                      <td className="py-4 px-4 text-slate-600 max-w-[180px] truncate">
                        {a.identifying_clue || a.scars || '—'}
                      </td>
                      <td className="py-4 px-4">
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
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Clock className="w-3 h-3 text-amber-600" />
                            )
                          }
                        >
                          {c.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-right">
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
                              className="text-slate-900 hover:text-orange-600 hover:underline font-semibold inline-flex items-center gap-1 transition-colors"
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
