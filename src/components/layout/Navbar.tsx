import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, DEMO_USERS } from '../../context/AuthContext.tsx';
import type { UserRole } from '../../types/index.ts';
import {
  FilePlus,
  CheckCircle2,
  LogOut,
  LogIn,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { Button } from '../ui/Button.tsx';
import { Badge } from '../ui/Badge.tsx';

export const Navbar: React.FC = () => {
  const { profile, signOut, switchDemoRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setRoleSwitcherOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
          ? 'bg-canvas-night/95 text-on-dark border-b border-hairline-dark'
          : 'bg-canvas-light/95 text-ink border-b border-hairline-light'
      } ${scrolled ? 'backdrop-blur-md shadow-sm' : ''}`}
    >
      <div className={isCinematic ? 'container-cinematic' : 'container-transactional'}>
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Brand Logo — Editorial Wordmark */}
          <Link
            to="/"
            className="flex items-center gap-3 group select-none"
            aria-label="MILAN Home"
          >
            <div className="flex items-center gap-2.5">
              <span className={`font-display text-xl sm:text-2xl font-light tracking-[0.22em] uppercase transition-colors ${
                isCinematic ? 'text-on-dark group-hover:text-aloe' : 'text-ink group-hover:text-shade-70'
              }`}>
                MILAN
              </span>
              <Badge variant={isCinematic ? 'dark' : 'mint'} size="sm">
                RELIEF
              </Badge>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1.5" aria-label="Main Navigation">
            <Link
              to="/dashboard"
              className={`px-3.5 py-1.5 rounded-pill text-xs font-medium transition-colors ${
                isActive('/dashboard')
                  ? isCinematic ? 'bg-white/15 text-on-dark' : 'bg-shade-30 text-ink font-semibold'
                  : isCinematic ? 'text-shade-40 hover:text-on-dark hover:bg-white/5' : 'text-shade-60 hover:text-ink hover:bg-black/5'
              }`}
            >
              Dashboard
            </Link>

            {/* Role-Specific Action Links */}
            {profile?.role === 'FAMILY' && (
              <Link
                to="/report/missing"
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-pill text-xs font-medium transition-colors ${
                  isActive('/report/missing')
                    ? isCinematic ? 'bg-aloe/20 text-aloe' : 'bg-aloe text-ink font-semibold'
                    : isCinematic ? 'text-aloe/80 hover:text-aloe' : 'text-ink hover:bg-aloe/30'
                }`}
              >
                <FilePlus className="w-3.5 h-3.5" /> Report Missing
              </Link>
            )}

            {(profile?.role === 'NGO' || profile?.role === 'ARMY_RESCUE' || profile?.role === 'ADMIN') && (
              <Link
                to="/report/found"
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-pill text-xs font-medium transition-colors ${
                  isActive('/report/found')
                    ? isCinematic ? 'bg-white/15 text-on-dark' : 'bg-shade-30 text-ink font-semibold'
                    : isCinematic ? 'text-shade-40 hover:text-on-dark' : 'text-shade-60 hover:text-ink'
                }`}
              >
                <FilePlus className="w-3.5 h-3.5" /> Report Found
              </Link>
            )}

            {(profile?.role === 'HOSPITAL' || profile?.role === 'ADMIN') && (
              <Link
                to="/report/hospital"
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-pill text-xs font-medium transition-colors ${
                  isActive('/report/hospital')
                    ? isCinematic ? 'bg-white/15 text-on-dark' : 'bg-shade-30 text-ink font-semibold'
                    : isCinematic ? 'text-shade-40 hover:text-on-dark' : 'text-shade-60 hover:text-ink'
                }`}
              >
                <FilePlus className="w-3.5 h-3.5" /> Hospital Intake
              </Link>
            )}

            {(profile?.role === 'REVIEWER' || profile?.role === 'ADMIN') && (
              <Link
                to="/review"
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-pill text-xs font-medium transition-colors ${
                  isActive('/review')
                    ? isCinematic ? 'bg-white/15 text-on-dark' : 'bg-shade-30 text-ink font-semibold'
                    : isCinematic ? 'text-shade-40 hover:text-on-dark' : 'text-shade-60 hover:text-ink'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Match Reviewer
              </Link>
            )}

            <Link
              to="/cases"
              className={`px-3.5 py-1.5 rounded-pill text-xs font-medium transition-colors ${
                isActive('/cases')
                  ? isCinematic ? 'bg-white/15 text-on-dark' : 'bg-shade-30 text-ink font-semibold'
                  : isCinematic ? 'text-shade-40 hover:text-on-dark hover:bg-white/5' : 'text-shade-60 hover:text-ink hover:bg-black/5'
              }`}
            >
              Cases Registry
            </Link>
          </nav>

          {/* Right Action / Role Switcher / Profile */}
          <div className="hidden md:flex items-center gap-3">
            {/* Quick Role Switcher for Hackathon Demonstrations */}
            <div className="relative">
              <button
                onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
                className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-pill border transition-colors ${
                  isCinematic
                    ? 'bg-canvas-night-elevated text-on-dark border-hairline-dark hover:bg-white/10'
                    : 'bg-canvas-cream text-ink border-hairline-light hover:bg-shade-30/40'
                }`}
                title="Switch demo evaluation role"
                aria-expanded={roleSwitcherOpen}
              >
                <span className={isCinematic ? 'text-shade-40' : 'text-shade-50'}>Role:</span>
                <span className="font-semibold">{profile ? profile.role : 'Guest'}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {roleSwitcherOpen && (
                <div className={`absolute right-0 mt-2 w-60 rounded-lg shadow-elevation-3 py-2 z-dropdown border ${
                  isCinematic
                    ? 'bg-canvas-night-elevated border-hairline-dark text-on-dark'
                    : 'bg-canvas-light border-hairline-light text-ink'
                }`}>
                  <div className="px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-shade-40 border-b border-hairline-light/20 mb-1">
                    Select Evaluation Persona
                  </div>
                  {(Object.keys(DEMO_USERS) as UserRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => handleRoleChange(r)}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors ${
                        profile?.role === r
                          ? isCinematic ? 'bg-white/10 text-aloe font-medium' : 'bg-shade-30/50 text-ink font-semibold'
                          : isCinematic ? 'text-shade-30 hover:bg-white/5' : 'text-shade-60 hover:bg-canvas-cream'
                      }`}
                    >
                      <span>{r.replace('_', ' ')}</span>
                      <span className="text-[10px] text-shade-40 truncate max-w-[90px]">
                        {DEMO_USERS[r].fullName.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {profile ? (
              <div className={`flex items-center gap-3 pl-3 border-l ${
                isCinematic ? 'border-hairline-dark' : 'border-hairline-light'
              }`}>
                <div className="text-right">
                  <div className="text-xs font-semibold leading-tight">{profile.full_name || 'Coordinator'}</div>
                  <div className="text-[10px] text-shade-40 truncate max-w-[120px]">
                    {profile.organization_name || profile.role}
                  </div>
                </div>
                <button
                  onClick={() => signOut()}
                  className={`p-2 rounded-pill transition-colors ${
                    isCinematic ? 'text-shade-40 hover:text-rose-400 hover:bg-white/10' : 'text-shade-50 hover:text-rose-600 hover:bg-black/5'
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
                  variant={isCinematic ? 'aloe' : 'primary'}
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
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-pill transition-colors ${
                isCinematic ? 'text-shade-30 hover:text-on-dark hover:bg-white/10' : 'text-shade-60 hover:text-ink hover:bg-black/5'
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
        <div className={`md:hidden border-b px-4 pt-3 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150 ${
          isCinematic
            ? 'bg-canvas-night-elevated border-hairline-dark text-on-dark'
            : 'bg-canvas-light border-hairline-light text-ink'
        }`}>
          <div className="space-y-1">
            <Link
              to="/dashboard"
              className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-white/5"
            >
              Dashboard
            </Link>
            <Link
              to="/cases"
              className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-white/5"
            >
              Cases Registry
            </Link>
            <Link
              to="/report/missing"
              className="block px-3 py-2 rounded-md text-sm font-medium text-aloe hover:bg-white/5"
            >
              Report Missing Person
            </Link>
            <Link
              to="/report/found"
              className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-white/5"
            >
              Report Found Person
            </Link>
            <Link
              to="/report/hospital"
              className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-white/5"
            >
              Hospital Intake
            </Link>
            <Link
              to="/review"
              className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-white/5"
            >
              Match Reviewer Dashboard
            </Link>
          </div>

          <div className={`pt-3 border-t ${isCinematic ? 'border-hairline-dark' : 'border-hairline-light'}`}>
            <div className="text-xs text-shade-40 mb-2 font-medium">Switch Persona:</div>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(DEMO_USERS) as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => handleRoleChange(r)}
                  className={`text-left px-2.5 py-1.5 text-xs rounded border transition-colors ${
                    profile?.role === r
                      ? isCinematic ? 'bg-aloe text-ink font-semibold' : 'bg-ink text-on-primary font-semibold'
                      : isCinematic ? 'bg-canvas-night border-hairline-dark text-shade-30' : 'bg-canvas-cream border-hairline-light text-shade-70'
                  }`}
                >
                  {r.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {profile ? (
            <div className={`pt-3 border-t ${isCinematic ? 'border-hairline-dark' : 'border-hairline-light'}`}>
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
            <div className={`pt-3 border-t flex gap-2 ${isCinematic ? 'border-hairline-dark' : 'border-hairline-light'}`}>
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
