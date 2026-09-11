import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, DEMO_USERS } from '../../context/AuthContext.tsx';
import type { UserRole } from '../../types/index.ts';
import {
  LifeBuoy,
  FilePlus,
  CheckCircle2,
  LogOut,
  LogIn,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { profile, signOut, switchDemoRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);

  const handleRoleChange = (role: UserRole) => {
    switchDemoRole(role);
    setRoleSwitcherOpen(false);
    navigate('/dashboard');
  };

  const roleColors: Record<UserRole, string> = {
    FAMILY: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    NGO: 'bg-blue-100 text-blue-800 border-blue-300',
    ARMY_RESCUE: 'bg-amber-100 text-amber-800 border-amber-300',
    HOSPITAL: 'bg-purple-100 text-purple-800 border-purple-300',
    REVIEWER: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    ADMIN: 'bg-rose-100 text-rose-800 border-rose-300',
    VOLUNTEER: 'bg-teal-100 text-teal-800 border-teal-300',
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition">
              <LifeBuoy className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-wider text-white">MILAN</span>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/30">
                  DISASTER RELIEF
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Missing Person Reconciliation</p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/dashboard"
              className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                isActive('/dashboard') ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              Dashboard
            </Link>

            {/* Role-Specific Action Links */}
            {profile?.role === 'FAMILY' && (
              <Link
                to="/report/missing"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition ${
                  isActive('/report/missing') ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'text-emerald-400 hover:bg-slate-800'
                }`}
              >
                <FilePlus className="w-4 h-4" /> Report Missing Person
              </Link>
            )}

            {(profile?.role === 'NGO' || profile?.role === 'ARMY_RESCUE' || profile?.role === 'ADMIN') && (
              <Link
                to="/report/found"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition ${
                  isActive('/report/found') ? 'bg-blue-950 text-blue-300 border border-blue-700' : 'text-blue-400 hover:bg-slate-800'
                }`}
              >
                <FilePlus className="w-4 h-4" /> Report Found Person
              </Link>
            )}

            {(profile?.role === 'HOSPITAL' || profile?.role === 'ADMIN') && (
              <Link
                to="/report/hospital"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition ${
                  isActive('/report/hospital') ? 'bg-purple-950 text-purple-300 border border-purple-700' : 'text-purple-400 hover:bg-slate-800'
                }`}
              >
                <FilePlus className="w-4 h-4" /> Hospital Intake
              </Link>
            )}

            {(profile?.role === 'REVIEWER' || profile?.role === 'ADMIN') && (
              <Link
                to="/review"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition ${
                  isActive('/review') ? 'bg-indigo-950 text-indigo-300 border border-indigo-700' : 'text-indigo-400 hover:bg-slate-800'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" /> Match Reviewer
              </Link>
            )}

            <Link
              to="/cases"
              className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                isActive('/cases') ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
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
                className="flex items-center gap-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition"
                title="Switch role for demo evaluation"
              >
                <span className="text-slate-400">Demo Role:</span>
                <span className={`font-semibold px-2 py-0.5 rounded border text-[11px] ${profile ? roleColors[profile.role] : 'bg-slate-700 text-slate-300'}`}>
                  {profile ? profile.role : 'Guest'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {roleSwitcherOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-2 z-50">
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700/80 mb-1">
                    Select Demo Role
                  </div>
                  {(Object.keys(DEMO_USERS) as UserRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => handleRoleChange(r)}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-700/70 transition ${
                        profile?.role === r ? 'bg-blue-600/20 text-blue-300 font-medium' : 'text-slate-300'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${r === 'FAMILY' ? 'bg-emerald-400' : r === 'REVIEWER' ? 'bg-indigo-400' : 'bg-blue-400'}`}></span>
                        {r}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate max-w-[90px]">{DEMO_USERS[r].fullName.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {profile ? (
              <div className="flex items-center gap-3 border-l border-slate-800 pl-3">
                <div className="text-right">
                  <div className="text-xs font-semibold text-white leading-tight">{profile.full_name || 'User'}</div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{profile.organization_name || profile.role}</div>
                </div>
                <button
                  onClick={() => signOut()}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="flex items-center gap-1 text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition"
                >
                  <LogIn className="w-3.5 h-3.5" /> Sign In
                </Link>
                <Link
                  to="/signup"
                  className="text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-lg shadow-sm transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm text-slate-200 hover:bg-slate-800"
          >
            Dashboard
          </Link>
          <Link
            to="/cases"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm text-slate-200 hover:bg-slate-800"
          >
            Cases Registry
          </Link>
          <Link
            to="/report/missing"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm text-emerald-400 hover:bg-slate-800"
          >
            Report Missing Person
          </Link>
          <Link
            to="/report/found"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm text-blue-400 hover:bg-slate-800"
          >
            Report Found Person
          </Link>
          <Link
            to="/report/hospital"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm text-purple-400 hover:bg-slate-800"
          >
            Hospital Intake
          </Link>
          <Link
            to="/review"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm text-indigo-400 hover:bg-slate-800"
          >
            Match Reviewer Dashboard
          </Link>

          <div className="pt-3 border-t border-slate-800">
            <div className="text-xs text-slate-400 mb-2">Switch Demo Role:</div>
            <div className="grid grid-cols-2 gap-1.5">
              {(Object.keys(DEMO_USERS) as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    handleRoleChange(r);
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left px-2 py-1.5 text-xs rounded border ${
                    profile?.role === r ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {profile && (
            <button
              onClick={() => {
                signOut();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left text-sm text-rose-400 hover:bg-slate-800 px-3 py-2 rounded-md mt-2 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Sign Out ({profile.full_name})
            </button>
          )}
        </div>
      )}
    </header>
  );
};
