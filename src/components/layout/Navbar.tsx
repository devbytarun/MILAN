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
import { Badge } from '../ui/Badge.tsx';
import { LanguageSwitcher } from '../common/LanguageSwitcher.tsx';
import { LiveStatusBeacon } from '../common/LiveStatusBeacon.tsx';

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
      className={`sticky top-0 z-40 h-16 bg-white border-b border-[#dddddd] w-full max-w-full overflow-x-clip transition-shadow duration-150 ${
        scrolled ? 'shadow-elevation-1' : ''
      }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 h-full max-w-full">
        <div className="flex items-center justify-between h-full gap-2 sm:gap-4">
          {/* Brand Logo & Live Status */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/"
              className="flex items-center gap-2 group select-none whitespace-nowrap"
              aria-label="MILAN Home"
            >
              <span className="font-display text-xl font-black tracking-wider uppercase text-[#181d26]">
                MILAN
              </span>
              <Badge variant="shade" size="sm">
                DISASTER GRID
              </Badge>
            </Link>
            <div className="hidden 2xl:block border-l border-[#dddddd] pl-3 shrink-0">
              <LiveStatusBeacon />
            </div>
          </div>

          {/* Desktop Nav Links (Streamlined, role-aware, overflow-free) */}
          <nav className="hidden lg:flex items-center gap-1 shrink-0" aria-label="Main Navigation">
            {profile && (
              <Link
                to="/dashboard"
                className={`whitespace-nowrap px-2.5 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors ${
                  isActive('/dashboard')
                    ? 'bg-[#f8fafc] text-[#181d26] font-semibold'
                    : 'text-[#333840] hover:text-[#181d26] hover:bg-[#f8fafc]'
                }`}
              >
                {isFamily ? 'My Case Status' : t('nav_dashboard')}
              </Link>
            )}

            {canViewCases && (
              <Link
                to="/cases"
                className={`whitespace-nowrap flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors ${
                  isActive('/cases')
                    ? 'bg-[#f8fafc] text-[#181d26] font-semibold'
                    : 'text-[#333840] hover:text-[#181d26] hover:bg-[#f8fafc]'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>{isFamily ? 'Public Directory' : t('nav_cases')}</span>
              </Link>
            )}

            {/* If FAMILY: single direct link to Report Missing */}
            {isFamily && canReportMissing && (
              <Link
                to="/report/missing"
                className={`whitespace-nowrap flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors ${
                  isActive('/report/missing')
                    ? 'bg-[#f8fafc] text-[#181d26] font-semibold'
                    : 'text-[#333840] hover:text-[#181d26] hover:bg-[#f8fafc]'
                }`}
              >
                <FilePlus className="w-3.5 h-3.5" />
                <span>{t('nav_report_missing')}</span>
              </Link>
            )}

            {/* If OPERATIONAL: consolidated Intake Forms dropdown */}
            {!isFamily && (canReportMissing || canReportFound || canReportHospital || canVoice) && (
              <div className="relative" ref={intakeMenuRef}>
                <button
                  type="button"
                  onClick={() => setIntakeMenuOpen(!intakeMenuOpen)}
                  className={`whitespace-nowrap flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors ${
                    isActive('/report/missing') ||
                    isActive('/report/found') ||
                    isActive('/report/hospital') ||
                    isActive('/report/voice')
                      ? 'bg-[#f8fafc] text-[#181d26] font-semibold'
                      : 'text-[#333840] hover:text-[#181d26] hover:bg-[#f8fafc]'
                  }`}
                  aria-expanded={intakeMenuOpen}
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Intake Forms</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>

                {intakeMenuOpen && (
                  <div className="absolute left-0 mt-2 w-64 rounded-xl shadow-elevation-3 py-1.5 z-50 border border-[#dddddd] bg-white text-[#181d26]">
                    {canReportMissing && (
                      <Link
                        to="/report/missing"
                        onClick={() => setIntakeMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs hover:bg-[#f8fafc] transition-colors"
                      >
                        <FilePlus className="w-3.5 h-3.5 text-[#aa2d00]" />
                        <div>
                          <span className="font-semibold block">{t('nav_report_missing')}</span>
                          <span className="text-[10px] text-[#9297a0]">Family missing person report</span>
                        </div>
                      </Link>
                    )}
                    {canReportFound && (
                      <Link
                        to="/report/found"
                        onClick={() => setIntakeMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs hover:bg-[#f8fafc] transition-colors"
                      >
                        <FilePlus className="w-3.5 h-3.5 text-[#006400]" />
                        <div>
                          <span className="font-semibold block">{t('nav_report_found')}</span>
                          <span className="text-[10px] text-[#9297a0]">Field rescue shelter intake</span>
                        </div>
                      </Link>
                    )}
                    {canReportHospital && (
                      <Link
                        to="/report/hospital"
                        onClick={() => setIntakeMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs hover:bg-[#f8fafc] transition-colors"
                      >
                        <Building2 className="w-3.5 h-3.5 text-[#1b61c9]" />
                        <div>
                          <span className="font-semibold block">{t('nav_report_hospital')}</span>
                          <span className="text-[10px] text-[#9297a0]">Clinical patient triage</span>
                        </div>
                      </Link>
                    )}
                    {canVoice && (
                      <Link
                        to="/report/voice"
                        onClick={() => setIntakeMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs hover:bg-[#f8fafc] transition-colors border-t border-[#f1f3f5] mt-1 pt-1.5"
                      >
                        <Radio className="w-3.5 h-3.5 text-[#181d26]" />
                        <div>
                          <span className="font-semibold block">{t('nav_voice_ai')}</span>
                          <span className="text-[10px] text-[#9297a0]">Radio dispatch & voice parser</span>
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
                className={`whitespace-nowrap flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors ${
                  isActive('/review')
                    ? 'bg-[#f8fafc] text-[#181d26] font-semibold'
                    : 'text-[#333840] hover:text-[#181d26] hover:bg-[#f8fafc]'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t('nav_review')}</span>
              </Link>
            )}

            {canDossier && (
              <Link
                to="/dossier"
                className={`whitespace-nowrap flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors ${
                  isActive('/dossier')
                    ? 'bg-[#f8fafc] text-[#181d26] font-semibold'
                    : 'text-[#333840] hover:text-[#181d26] hover:bg-[#f8fafc]'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-[#181d26]" />
                <span>{t('nav_forensic_dossiers')}</span>
              </Link>
            )}
          </nav>

          {/* Right Controls (Language / Role Switcher / Profile) */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            {/* Language Switcher */}
            <LanguageSwitcher variant="pill" />

            {/* Quick Persona Switcher (Simulation Mode) */}
            {isDemoMode ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
                  className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-[#dddddd] bg-white text-[#333840] hover:bg-[#f8fafc] font-medium transition-colors whitespace-nowrap"
                  title="Switch evaluation persona (Simulation Mode)"
                  aria-expanded={roleSwitcherOpen}
                >
                  <span className="text-[#9297a0]">Sim:</span>
                  <span className="font-semibold text-[#181d26]">
                    {profile ? profile.role.replace('_', ' ') : t('nav_guest')}
                  </span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>

                {roleSwitcherOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-xl shadow-elevation-3 py-2 z-50 border border-[#dddddd] bg-white text-[#181d26]">
                    <div className="px-3.5 py-2 border-b border-[#dddddd] mb-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#9297a0]">
                        Simulation Persona
                      </div>
                      <div className="text-[11px] text-[#41454d] mt-0.5">
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
                            ? 'bg-[#f8fafc] text-[#181d26] font-semibold'
                            : 'text-[#333840] hover:bg-[#f8fafc]'
                        }`}
                      >
                        <div>
                          <span className="font-semibold block">{r.replace('_', ' ')}</span>
                          <span className="text-[10px] text-[#9297a0]">
                            {DEMO_USERS[r].fullName} ({DEMO_USERS[r].orgName})
                          </span>
                        </div>
                        {profile?.role === r && (
                          <span className="w-2 h-2 rounded-full bg-[#006400]"></span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              profile && (
                <div className="px-2.5 py-1 text-xs rounded-md bg-[#f8fafc] border border-[#dddddd] font-semibold text-[#181d26]">
                  {profile.role.replace('_', ' ')}
                </div>
              )
            )}

            {/* Profile or Auth CTAs */}
            {profile ? (
              <div className="flex items-center gap-2 pl-2 border-l border-[#dddddd] shrink-0">
                <div className="hidden 2xl:block text-right whitespace-nowrap">
                  <div className="text-xs font-semibold text-[#181d26] leading-tight truncate max-w-[110px]">
                    {profile.full_name || 'Coordinator'}
                  </div>
                  <div className="text-[10px] text-[#9297a0] truncate max-w-[110px]">
                    {profile.organization_name || profile.role}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="p-1.5 rounded-lg text-[#41454d] hover:text-[#aa2d00] hover:bg-[#f8fafc] transition-colors"
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
              className="p-2 rounded-lg text-[#333840] hover:text-[#181d26] hover:bg-[#f8fafc] transition-colors"
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
        <div className="lg:hidden border-b border-[#dddddd] bg-white text-[#181d26] px-4 pt-3 pb-6 space-y-4 shadow-elevation-3">
          <div className="pb-2 border-b border-[#dddddd]">
            <LiveStatusBeacon />
          </div>

          <div className="space-y-1">
            {profile && (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold hover:bg-[#f8fafc]"
              >
                {isFamily ? 'My Case Status' : t('nav_dashboard')}
              </Link>
            )}
            {canViewCases && (
              <Link
                to="/cases"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold hover:bg-[#f8fafc]"
              >
                {isFamily ? 'Public Directory' : t('nav_cases')}
              </Link>
            )}
            {canReportMissing && (
              <Link
                to="/report/missing"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold hover:bg-[#f8fafc]"
              >
                {t('nav_report_missing')}
              </Link>
            )}
            {canReportFound && (
              <Link
                to="/report/found"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold hover:bg-[#f8fafc]"
              >
                {t('nav_report_found')}
              </Link>
            )}
            {canReportHospital && (
              <Link
                to="/report/hospital"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold hover:bg-[#f8fafc]"
              >
                {t('nav_report_hospital')}
              </Link>
            )}
            {canReview && (
              <Link
                to="/review"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold hover:bg-[#f8fafc]"
              >
                {t('nav_review')}
              </Link>
            )}
            {canVoice && (
              <Link
                to="/report/voice"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold hover:bg-[#f8fafc]"
              >
                {t('nav_voice_ai')}
              </Link>
            )}
            {canDossier && (
              <Link
                to="/dossier"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold hover:bg-[#f8fafc]"
              >
                {t('nav_forensic_dossiers')}
              </Link>
            )}
          </div>

          {isDemoMode && (
            <div className="pt-3 border-t border-[#dddddd]">
              <div className="text-xs text-[#9297a0] mb-2 font-medium">
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
                        ? 'bg-[#181d26] text-white font-semibold border-[#181d26]'
                        : 'bg-white border-[#dddddd] text-[#333840] hover:bg-[#f8fafc]'
                    }`}
                  >
                    {r.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          )}

          {profile ? (
            <div className="pt-3 border-t border-[#dddddd]">
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
            <div className="pt-3 border-t border-[#dddddd] flex gap-2">
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
