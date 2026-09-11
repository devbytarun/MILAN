import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, DEMO_USERS } from '../../context/AuthContext.tsx';
import { useI18n } from '../../context/I18nContext.tsx';
import type { UserRole } from '../../types/index.ts';
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
} from 'lucide-react';
import { Button } from '../ui/Button.tsx';
import { Badge } from '../ui/Badge.tsx';
import { LanguageSwitcher } from '../common/LanguageSwitcher.tsx';
import { LiveStatusBeacon } from '../common/LiveStatusBeacon.tsx';

export const Navbar: React.FC = () => {
  const { profile, signOut, switchDemoRole } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setRoleSwitcherOpen(false);
  }, [location.pathname]);

  // Handle escape key and click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setRoleSwitcherOpen(false);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setRoleSwitcherOpen(false);
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

  return (
    <header
      className={`sticky top-0 z-sticky h-16 bg-white border-b border-[#dddddd] transition-shadow duration-150 ${
        scrolled ? 'shadow-elevation-1' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Brand Logo & Live Status */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-2.5 group select-none"
              aria-label="MILAN Home"
            >
              <span className="font-display text-xl font-black tracking-wider uppercase text-[#181d26]">
                MILAN
              </span>
              <Badge variant="shade" size="sm">
                DISASTER GRID
              </Badge>
            </Link>
            <div className="hidden lg:block border-l border-[#dddddd] pl-3">
              <LiveStatusBeacon />
            </div>
          </div>

          {/* Desktop Nav Links (Haas / Inter 14px modest weight) */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
            <Link
              to="/dashboard"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive('/dashboard')
                  ? 'bg-[#f8fafc] text-[#181d26] font-semibold'
                  : 'text-[#333840] hover:text-[#181d26] hover:bg-[#f8fafc]'
              }`}
            >
              {t('nav_dashboard')}
            </Link>

            <Link
              to="/cases"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive('/cases')
                  ? 'bg-[#f8fafc] text-[#181d26] font-semibold'
                  : 'text-[#333840] hover:text-[#181d26] hover:bg-[#f8fafc]'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              {t('nav_cases')}
            </Link>

            {/* Role-Specific Action Links with Airtable Sub-colors */}
            {profile?.role === 'FAMILY' && (
              <Link
                to="/report/missing"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/report/missing')
                    ? 'bg-[#aa2d00] text-white font-semibold'
                    : 'text-[#aa2d00] hover:bg-[#aa2d00]/10'
                }`}
              >
                <FilePlus className="w-3.5 h-3.5" />
                Report Missing
              </Link>
            )}

            {(profile?.role === 'NGO' || profile?.role === 'ARMY_RESCUE' || profile?.role === 'ADMIN') && (
              <Link
                to="/report/found"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/report/found')
                    ? 'bg-[#0a2e0e] text-white font-semibold'
                    : 'text-[#0a2e0e] hover:bg-[#0a2e0e]/10'
                }`}
              >
                <FilePlus className="w-3.5 h-3.5" />
                Report Rescued
              </Link>
            )}

            {(profile?.role === 'HOSPITAL' || profile?.role === 'ADMIN') && (
              <Link
                to="/report/hospital"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/report/hospital')
                    ? 'bg-[#254fad] text-white font-semibold'
                    : 'text-[#254fad] hover:bg-[#254fad]/10'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                Hospital Intake
              </Link>
            )}

            {(profile?.role === 'REVIEWER' || profile?.role === 'ADMIN') && (
              <Link
                to="/review"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/review')
                    ? 'bg-[#181d26] text-white font-semibold'
                    : 'text-[#181d26] hover:bg-[#f8fafc]'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {t('nav_review')}
              </Link>
            )}
          </nav>

          {/* Right Action / Language / Persona Switcher / Profile */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Language Switcher */}
            <LanguageSwitcher variant="pill" />

            {/* Quick Persona Switcher */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-[#dddddd] bg-white text-[#333840] hover:bg-[#f8fafc] font-medium transition-colors"
                title="Switch demo evaluation persona"
                aria-expanded={roleSwitcherOpen}
              >
                <span className="text-[#9297a0]">Role:</span>
                <span className="font-semibold text-[#181d26]">{profile ? profile.role.replace('_', ' ') : 'Guest'}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {roleSwitcherOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl shadow-elevation-3 py-2 z-dropdown border border-[#dddddd] bg-white text-[#181d26]">
                  <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#9297a0] border-b border-[#dddddd] mb-1">
                    Select Evaluation Persona
                  </div>
                  {(Object.keys(DEMO_USERS) as UserRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => handleRoleChange(r)}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors ${
                        profile?.role === r
                          ? 'bg-[#f8fafc] text-[#181d26] font-semibold'
                          : 'text-[#333840] hover:bg-[#f8fafc]'
                      }`}
                    >
                      <span className="font-medium">{r.replace('_', ' ')}</span>
                      <span className="text-[10px] text-[#9297a0] truncate max-w-[100px]">
                        {DEMO_USERS[r].fullName.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Profile or Auth CTAs (Airtable primary near-black button) */}
            {profile ? (
              <div className="flex items-center gap-2 pl-2 border-l border-[#dddddd]">
                <div className="text-right">
                  <div className="text-xs font-semibold text-[#181d26] leading-tight">{profile.full_name || 'Coordinator'}</div>
                  <div className="text-[10px] text-[#9297a0] truncate max-w-[110px]">
                    {profile.organization_name || profile.role}
                  </div>
                </div>
                <button
                  onClick={() => signOut()}
                  className="p-1.5 rounded-lg text-[#41454d] hover:text-[#aa2d00] hover:bg-[#f8fafc] transition-colors"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/login')}
                  leftIcon={<LogIn className="w-3.5 h-3.5" />}
                >
                  Log In
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/signup')}
                >
                  Sign up for free
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageSwitcher variant="compact" />
            <button
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
        <div className="md:hidden border-b border-[#dddddd] bg-white text-[#181d26] px-4 pt-3 pb-6 space-y-4 shadow-elevation-3">
          <div className="pb-2 border-b border-[#dddddd]">
            <LiveStatusBeacon />
          </div>

          <div className="space-y-1">
            <Link
              to="/dashboard"
              className="block px-3 py-2 rounded-lg text-sm font-semibold hover:bg-[#f8fafc]"
            >
              {t('nav_dashboard')}
            </Link>
            <Link
              to="/cases"
              className="block px-3 py-2 rounded-lg text-sm font-semibold hover:bg-[#f8fafc]"
            >
              {t('nav_cases')}
            </Link>
            <Link
              to="/report/missing"
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#aa2d00] hover:bg-[#aa2d00]/10"
            >
              Report Missing Person
            </Link>
            <Link
              to="/report/found"
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#0a2e0e] hover:bg-[#0a2e0e]/10"
            >
              Report Rescued Person
            </Link>
            <Link
              to="/report/hospital"
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#254fad] hover:bg-[#254fad]/10"
            >
              Hospital Intake
            </Link>
            <Link
              to="/review"
              className="block px-3 py-2 rounded-lg text-sm font-semibold hover:bg-[#f8fafc]"
            >
              {t('nav_review')}
            </Link>
          </div>

          <div className="pt-3 border-t border-[#dddddd]">
            <div className="text-xs text-[#9297a0] mb-2 font-medium">Switch Persona:</div>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(DEMO_USERS) as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => handleRoleChange(r)}
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

          {profile ? (
            <div className="pt-3 border-t border-[#dddddd]">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => signOut()}
                leftIcon={<LogOut className="w-4 h-4" />}
                className="w-full"
              >
                Sign Out ({profile.full_name})
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
                Log In
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/signup')}
                className="flex-1"
              >
                Sign up for free
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
