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

  const isCinematic = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 16);
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
      className={`sticky top-0 z-sticky transition-all duration-200 ${
        isCinematic
          ? 'bg-slate-950/95 text-white border-b border-slate-800'
          : 'bg-white/95 text-slate-900 border-b border-slate-200 shadow-xs'
      } ${scrolled ? 'backdrop-blur-md shadow-sm' : ''}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Brand Logo & Live Status */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-2.5 group select-none"
              aria-label="MILAN Home"
            >
              <div className="flex items-center gap-2">
                <span className={`font-display text-xl sm:text-2xl font-black tracking-wider uppercase ${
                  isCinematic ? 'text-white group-hover:text-blue-400' : 'text-primary group-hover:text-blue-800'
                }`}>
                  MILAN
                </span>
                <Badge variant={isCinematic ? 'dark' : 'mint'} size="sm">
                  DISASTER GRID
                </Badge>
              </div>
            </Link>
            <div className={`hidden lg:block border-l pl-3 ${isCinematic ? 'border-slate-800' : 'border-slate-200'}`}>
              <LiveStatusBeacon />
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1.5" aria-label="Main Navigation">
            <Link
              to="/dashboard"
              className={`px-3 py-1.5 rounded-pill text-xs font-semibold transition-colors ${
                isActive('/dashboard')
                  ? isCinematic ? 'bg-white/15 text-white' : 'bg-primary text-white'
                  : isCinematic ? 'text-slate-300 hover:text-white hover:bg-white/10' : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              {t('nav_dashboard')}
            </Link>

            <Link
              to="/cases"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-xs font-semibold transition-colors ${
                isActive('/cases')
                  ? isCinematic ? 'bg-white/15 text-white' : 'bg-primary text-white'
                  : isCinematic ? 'text-slate-300 hover:text-white hover:bg-white/10' : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              {t('nav_cases')}
            </Link>

            {/* Role-Specific Action Links */}
            {profile?.role === 'FAMILY' && (
              <Link
                to="/report/missing"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-xs font-semibold transition-colors ${
                  isActive('/report/missing')
                    ? 'bg-rose-600 text-white'
                    : isCinematic ? 'text-rose-300 hover:bg-rose-950/40 hover:text-white' : 'text-rose-700 hover:bg-rose-50'
                }`}
              >
                <FilePlus className="w-3.5 h-3.5" />
                Report Missing
              </Link>
            )}

            {(profile?.role === 'NGO' || profile?.role === 'ARMY_RESCUE' || profile?.role === 'ADMIN') && (
              <Link
                to="/report/found"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-xs font-semibold transition-colors ${
                  isActive('/report/found')
                    ? 'bg-emerald-600 text-white'
                    : isCinematic ? 'text-emerald-300 hover:bg-emerald-950/40 hover:text-white' : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                <FilePlus className="w-3.5 h-3.5" />
                Report Rescued
              </Link>
            )}

            {(profile?.role === 'HOSPITAL' || profile?.role === 'ADMIN') && (
              <Link
                to="/report/hospital"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-xs font-semibold transition-colors ${
                  isActive('/report/hospital')
                    ? 'bg-sky-600 text-white'
                    : isCinematic ? 'text-sky-300 hover:bg-sky-950/40 hover:text-white' : 'text-sky-700 hover:bg-sky-50'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                Hospital Intake
              </Link>
            )}

            {(profile?.role === 'REVIEWER' || profile?.role === 'ADMIN') && (
              <Link
                to="/review"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-xs font-semibold transition-colors ${
                  isActive('/review')
                    ? 'bg-amber-600 text-white'
                    : isCinematic ? 'text-amber-300 hover:bg-amber-950/40 hover:text-white' : 'text-amber-800 hover:bg-amber-50'
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
                className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-pill border font-medium transition-colors ${
                  isCinematic
                    ? 'bg-slate-900 text-slate-200 border-slate-700 hover:bg-slate-800'
                    : 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200'
                }`}
                title="Switch demo evaluation persona"
                aria-expanded={roleSwitcherOpen}
              >
                <span className={isCinematic ? 'text-slate-400' : 'text-slate-500'}>Role:</span>
                <span className="font-semibold">{profile ? profile.role.replace('_', ' ') : 'Guest'}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {roleSwitcherOpen && (
                <div className={`absolute right-0 mt-2 w-64 rounded-xl shadow-elevation-3 py-2 z-dropdown border ${
                  isCinematic
                    ? 'bg-slate-900 border-slate-700 text-white'
                    : 'bg-white border-slate-200 text-slate-900'
                }`}>
                  <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200/50 mb-1">
                    Select Evaluation Persona
                  </div>
                  {(Object.keys(DEMO_USERS) as UserRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => handleRoleChange(r)}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors ${
                        profile?.role === r
                          ? isCinematic ? 'bg-blue-600/30 text-blue-300 font-semibold' : 'bg-blue-50 text-blue-900 font-semibold'
                          : isCinematic ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="font-medium">{r.replace('_', ' ')}</span>
                      <span className="text-[10px] text-slate-400 truncate max-w-[100px]">
                        {DEMO_USERS[r].fullName.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Profile or Auth CTAs */}
            {profile ? (
              <div className={`flex items-center gap-2 pl-2 border-l ${
                isCinematic ? 'border-slate-800' : 'border-slate-200'
              }`}>
                <div className="text-right">
                  <div className="text-xs font-semibold leading-tight">{profile.full_name || 'Coordinator'}</div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[110px]">
                    {profile.organization_name || profile.role}
                  </div>
                </div>
                <button
                  onClick={() => signOut()}
                  className={`p-1.5 rounded-pill transition-colors ${
                    isCinematic ? 'text-slate-400 hover:text-rose-400 hover:bg-slate-800' : 'text-slate-500 hover:text-rose-600 hover:bg-slate-100'
                  }`}
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant={isCinematic ? 'outline-dark' : 'outline-light'}
                  size="sm"
                  onClick={() => navigate('/login')}
                  leftIcon={<LogIn className="w-3.5 h-3.5" />}
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/signup')}
                >
                  Register
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageSwitcher variant="compact" />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-pill transition-colors ${
                isCinematic ? 'text-slate-300 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
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
        <div className={`md:hidden border-b px-4 pt-3 pb-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-150 ${
          isCinematic
            ? 'bg-slate-900 border-slate-800 text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}>
          {/* Mobile live status */}
          <div className="pb-2 border-b border-slate-200/40">
            <LiveStatusBeacon />
          </div>

          <div className="space-y-1">
            <Link
              to="/dashboard"
              className="block px-3 py-2 rounded-md text-sm font-semibold hover:bg-slate-100/10"
            >
              {t('nav_dashboard')}
            </Link>
            <Link
              to="/cases"
              className="block px-3 py-2 rounded-md text-sm font-semibold hover:bg-slate-100/10"
            >
              {t('nav_cases')}
            </Link>
            <Link
              to="/report/missing"
              className="block px-3 py-2 rounded-md text-sm font-semibold text-rose-600 hover:bg-rose-50/10"
            >
              Report Missing Person
            </Link>
            <Link
              to="/report/found"
              className="block px-3 py-2 rounded-md text-sm font-semibold text-emerald-600 hover:bg-emerald-50/10"
            >
              Report Rescued Person
            </Link>
            <Link
              to="/report/hospital"
              className="block px-3 py-2 rounded-md text-sm font-semibold text-sky-600 hover:bg-sky-50/10"
            >
              Hospital Intake
            </Link>
            <Link
              to="/review"
              className="block px-3 py-2 rounded-md text-sm font-semibold text-amber-600 hover:bg-amber-50/10"
            >
              {t('nav_review')}
            </Link>
          </div>

          {/* Persona selector for mobile */}
          <div className={`pt-3 border-t ${isCinematic ? 'border-slate-800' : 'border-slate-200'}`}>
            <div className="text-xs text-slate-400 mb-2 font-medium">Switch Persona:</div>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(DEMO_USERS) as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => handleRoleChange(r)}
                  className={`text-left px-2.5 py-1.5 text-xs rounded-lg border transition-colors ${
                    profile?.role === r
                      ? 'bg-blue-600 text-white font-semibold border-blue-600'
                      : isCinematic ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  {r.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Auth buttons */}
          {profile ? (
            <div className={`pt-3 border-t ${isCinematic ? 'border-slate-800' : 'border-slate-200'}`}>
              <Button
                variant={isCinematic ? 'outline-dark' : 'outline-light'}
                size="sm"
                onClick={() => signOut()}
                leftIcon={<LogOut className="w-4 h-4" />}
                className="w-full"
              >
                Sign Out ({profile.full_name})
              </Button>
            </div>
          ) : (
            <div className={`pt-3 border-t flex gap-2 ${isCinematic ? 'border-slate-800' : 'border-slate-200'}`}>
              <Button
                variant="outline-light"
                size="sm"
                onClick={() => navigate('/login')}
                className="flex-1"
              >
                Sign In
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/signup')}
                className="flex-1"
              >
                Register
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
