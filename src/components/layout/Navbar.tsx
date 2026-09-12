import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, DEMO_USERS } from '../../context/AuthContext.tsx';
import { useI18n } from '../../context/I18nContext.tsx';
import type { UserRole } from '../../types/index.ts';
import { hasPermission } from '../../lib/permissions.ts';
import {
  FilePlus,
  CheckCircle2,
  LogOut,
  LogIn,
  Menu,
  X,
  ChevronDown,
  Building2,
  Search,
  Radio,
  FileText,
  PlusCircle,
} from 'lucide-react';
import { Button } from '../ui/Button.tsx';
import { LanguageSwitcher } from '../common/LanguageSwitcher.tsx';

export const Navbar: React.FC = () => {
  const { profile, signOut, switchDemoRole, isDemoMode } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
  const [intakeMenuOpen, setIntakeMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const intakeMenuRef = useRef<HTMLDivElement>(null);

  const role = profile?.role;
  const isFamily = role === 'FAMILY';
  const canViewCases = hasPermission(role, 'VIEW_PUBLIC_CASE');
  const canReportMissing = hasPermission(role, 'CREATE_MISSING_REPORT');
  const canReportFound = hasPermission(role, 'CREATE_FOUND_REPORT');
  const canReportHospital = hasPermission(role, 'CREATE_HOSPITAL_REPORT');
  const canReview = hasPermission(role, 'REVIEW_MATCH');
  const canVoice = hasPermission(role, 'USE_VOICE_AI');
  const canDossier = hasPermission(role, 'VIEW_FORENSIC_DOSSIER');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setRoleSwitcherOpen(false);
    setIntakeMenuOpen(false);
  }, [location.pathname]);

  // Handle escape key and click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setRoleSwitcherOpen(false);
        setIntakeMenuOpen(false);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setRoleSwitcherOpen(false);
      }
      if (intakeMenuRef.current && !intakeMenuRef.current.contains(e.target as Node)) {
        setIntakeMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleRoleChange = (role: UserRole) => {
    switchDemoRole(role);
    setRoleSwitcherOpen(false);
    navigate('/dashboard');
  };

  const isActive = (path: string) => location.pathname === path;

  // Format role label cleanly without double colons
  const roleLabelText = t('nav_role_label').replace(/:$/, '');

  return (
    <header
      className={`sticky top-0 z-40 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 w-full max-w-full overflow-x-clip transition-all duration-200 ${
        scrolled ? 'shadow-card border-slate-200' : ''
      }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 h-full max-w-full">
        <div className="flex items-center justify-between h-full gap-2 sm:gap-4 max-w-full">
          {/* Brand Logo (Premium MILAN Typography) */}
          <div className="flex items-center shrink-0">
            <Link
              to="/"
              className="flex items-center group select-none whitespace-nowrap py-1"
              aria-label="MILAN Home"
            >
              <span className="font-brand text-2xl sm:text-[26px] font-black tracking-[0.22em] text-slate-950 group-hover:text-orange-600 transition-colors uppercase">
                MILAN
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links (Streamlined, role-aware, in-flow & overflow-free) */}
          <nav
            className="hidden lg:flex items-center justify-center gap-1 xl:gap-2 flex-1 min-w-0 px-1 xl:px-2"
            aria-label="Main Navigation"
          >
            {profile && (
              <Link
                to="/dashboard"
                className={`whitespace-nowrap px-2.5 xl:px-3 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors ${
                  isActive('/dashboard')
                    ? 'bg-orange-50/90 text-orange-700 font-semibold border border-orange-200/70 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                {isFamily ? 'My Case Status' : role === 'VOLUNTEER' ? 'Volunteer Hub' : t('nav_dashboard')}
              </Link>
            )}

            {canViewCases && (
              <Link
                to="/cases"
                className={`whitespace-nowrap flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors ${
                  isActive('/cases')
                    ? 'bg-orange-50/90 text-orange-700 font-semibold border border-orange-200/70 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <Search className="w-3.5 h-3.5 shrink-0" />
                <span>{isFamily || role === 'VOLUNTEER' ? 'Public Directory' : t('nav_cases')}</span>
              </Link>
            )}

            {/* If FAMILY: single direct link to Report Missing */}
            {isFamily && canReportMissing && (
              <Link
                to="/report/missing"
                className={`whitespace-nowrap flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors ${
                  isActive('/report/missing')
                    ? 'bg-orange-50/90 text-orange-700 font-semibold border border-orange-200/70 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <FilePlus className="w-3.5 h-3.5 shrink-0" />
                <span>{t('nav_report_missing')}</span>
              </Link>
            )}

            {/* If OPERATIONAL: consolidated Intake Forms dropdown */}
            {!isFamily && (canReportMissing || canReportFound || canReportHospital || canVoice) && (
              <div className="relative" ref={intakeMenuRef}>
                <button
                  type="button"
                  onClick={() => setIntakeMenuOpen(!intakeMenuOpen)}
                  className={`whitespace-nowrap flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors ${
                    isActive('/report/missing') ||
                    isActive('/report/found') ||
                    isActive('/report/hospital') ||
                    isActive('/report/voice')
                      ? 'bg-orange-50/90 text-orange-700 font-semibold border border-orange-200/70 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                  aria-expanded={intakeMenuOpen}
                >
                  <PlusCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Intake Forms</span>
                  <ChevronDown className="w-3 h-3 opacity-60 shrink-0" />
                </button>

                {intakeMenuOpen && (
                  <div className="absolute left-0 mt-2 w-64 rounded-xl shadow-dropdown py-1.5 z-50 border border-slate-200/90 bg-white text-slate-900">
                    {canReportMissing && (
                      <Link
                        to="/report/missing"
                        onClick={() => setIntakeMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs hover:bg-slate-50 transition-colors"
                      >
                        <FilePlus className="w-3.5 h-3.5 text-orange-600" />
                        <div>
                          <span className="font-semibold block">{t('nav_report_missing')}</span>
                          <span className="text-[10px] text-slate-500">Family missing person report</span>
                        </div>
                      </Link>
                    )}
                    {canReportFound && (
                      <Link
                        to="/report/found"
                        onClick={() => setIntakeMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs hover:bg-slate-50 transition-colors"
                      >
                        <FilePlus className="w-3.5 h-3.5 text-emerald-600" />
                        <div>
                          <span className="font-semibold block">{t('nav_report_found')}</span>
                          <span className="text-[10px] text-slate-500">Field rescue shelter intake</span>
                        </div>
                      </Link>
                    )}
                    {canReportHospital && (
                      <Link
                        to="/report/hospital"
                        onClick={() => setIntakeMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs hover:bg-slate-50 transition-colors"
                      >
                        <Building2 className="w-3.5 h-3.5 text-blue-600" />
                        <div>
                          <span className="font-semibold block">{t('nav_report_hospital')}</span>
                          <span className="text-[10px] text-slate-500">Clinical patient triage</span>
                        </div>
                      </Link>
                    )}
                    {canVoice && (
                      <Link
                        to="/report/voice"
                        onClick={() => setIntakeMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs hover:bg-slate-50 transition-colors border-t border-slate-100 mt-1 pt-1.5"
                      >
                        <Radio className="w-3.5 h-3.5 text-slate-900" />
                        <div>
                          <span className="font-semibold block">{t('nav_voice_ai')}</span>
                          <span className="text-[10px] text-slate-500">Radio dispatch & voice parser</span>
                        </div>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}

            {canReview && (
              <Link
                to="/review"
                className={`whitespace-nowrap flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors ${
                  isActive('/review')
                    ? 'bg-orange-50/90 text-orange-700 font-semibold border border-orange-200/70 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>{t('nav_review')}</span>
              </Link>
            )}

            {canDossier && (
              <Link
                to="/dossier"
                className={`whitespace-nowrap flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors ${
                  isActive('/dossier')
                    ? 'bg-orange-50/90 text-orange-700 font-semibold border border-orange-200/70 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <FileText className="w-3.5 h-3.5 shrink-0 text-slate-900" />
                <span>{t('nav_forensic_dossiers')}</span>
              </Link>
            )}
          </nav>

          {/* Right Controls (Language / Role Switcher / Profile) */}
          <div className="hidden lg:flex items-center gap-1.5 xl:gap-2.5 shrink-0">
            {/* Language Switcher */}
            <LanguageSwitcher variant="pill" />

            {/* Quick Persona Switcher (Simulation Mode) */}
            {isDemoMode ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
                  className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-medium transition-colors whitespace-nowrap shadow-xs"
                  title="Switch evaluation persona (Simulation Mode)"
                  aria-expanded={roleSwitcherOpen}
                >
                  <span className="text-slate-400">Sim:</span>
                  <span className="font-semibold text-slate-900">
                    {profile ? profile.role.replace('_', ' ') : t('nav_guest')}
                  </span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>

                {roleSwitcherOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-xl shadow-dropdown py-2 z-50 border border-slate-200 bg-white text-slate-900">
                    <div className="px-3.5 py-2 border-b border-slate-100 mb-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Simulation Persona
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        Test role-based access control and data visibility
                      </div>
                    </div>
                    {(Object.keys(DEMO_USERS) as UserRole[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => handleRoleChange(r)}
                        className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors ${
                          profile?.role === r
                            ? 'bg-orange-50 text-orange-800 font-semibold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <span className="font-semibold block">{r.replace('_', ' ')}</span>
                          <span className="text-[10px] text-slate-400">
                            {DEMO_USERS[r].fullName} ({DEMO_USERS[r].orgName})
                          </span>
                        </div>
                        {profile?.role === r && (
                          <span className="w-2 h-2 rounded-full bg-orange-600"></span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              profile && (
                <div className="px-2.5 py-1 text-xs rounded-md bg-slate-50 border border-slate-200 font-semibold text-slate-900">
                  {profile.role.replace('_', ' ')}
                </div>
              )
            )}

            {/* Profile or Auth CTAs */}
            {profile ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 shrink-0">
                <div className="hidden xl:block text-right whitespace-nowrap">
                  <div className="text-xs font-semibold text-slate-900 leading-tight truncate max-w-[110px]">
                    {profile.full_name || 'Coordinator'}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[110px]">
                    {profile.organization_name || profile.role}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title={t('nav_sign_out')}
                  aria-label={t('nav_sign_out')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 whitespace-nowrap">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/login')}
                  leftIcon={<LogIn className="w-3.5 h-3.5" />}
                >
                  {t('nav_sign_in')}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/signup')}
                >
                  {t('nav_sign_up')}
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Trigger (lg:hidden) */}
          <div className="lg:hidden flex items-center gap-2 shrink-0">
            <LanguageSwitcher variant="compact" />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white text-slate-900 px-4 pt-3 pb-6 space-y-4 shadow-dropdown animate-in fade-in duration-150">
          <div className="space-y-1">
            {profile && (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50"
              >
                {isFamily ? 'My Case Status' : role === 'VOLUNTEER' ? 'Volunteer Hub' : t('nav_dashboard')}
              </Link>
            )}
            {canViewCases && (
              <Link
                to="/cases"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50"
              >
                {isFamily || role === 'VOLUNTEER' ? 'Public Directory' : t('nav_cases')}
              </Link>
            )}
            {canReportMissing && (
              <Link
                to="/report/missing"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50"
              >
                {t('nav_report_missing')}
              </Link>
            )}
            {canReportFound && (
              <Link
                to="/report/found"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50"
              >
                {t('nav_report_found')}
              </Link>
            )}
            {canReportHospital && (
              <Link
                to="/report/hospital"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50"
              >
                {t('nav_report_hospital')}
              </Link>
            )}
            {canReview && (
              <Link
                to="/review"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50"
              >
                {t('nav_review')}
              </Link>
            )}
            {canVoice && (
              <Link
                to="/report/voice"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50"
              >
                {t('nav_voice_ai')}
              </Link>
            )}
            {canDossier && (
              <Link
                to="/dossier"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50"
              >
                {t('nav_forensic_dossiers')}
              </Link>
            )}
          </div>

          {isDemoMode && (
            <div className="pt-3 border-t border-slate-100">
              <div className="text-xs text-slate-500 mb-2 font-medium">
                {roleLabelText} (Simulation Mode):
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(DEMO_USERS) as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      handleRoleChange(r);
                      setMobileMenuOpen(false);
                    }}
                    className={`text-left px-2.5 py-1.5 text-xs rounded-lg border transition-colors ${
                      profile?.role === r
                        ? 'bg-slate-900 text-white font-semibold border-slate-900'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {r.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          )}

          {profile ? (
            <div className="pt-3 border-t border-slate-100">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => signOut()}
                leftIcon={<LogOut className="w-4 h-4" />}
                className="w-full"
              >
                {t('nav_sign_out')} ({profile.full_name})
              </Button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-100 flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/login')}
                className="flex-1"
              >
                {t('nav_sign_in')}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/signup')}
                className="flex-1"
              >
                {t('nav_sign_up')}
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
