import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, DEMO_USERS } from '../context/AuthContext.tsx';
import type { UserRole } from '../types/index.ts';
import {
  Users,
  ShieldCheck,
  Building2,
  Stethoscope,
  Search,
  CheckCircle2,
  Clock,
  ChevronRight,
  Database,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../components/ui/Button.tsx';
import { Badge } from '../components/ui/Badge.tsx';

export const LandingPage: React.FC = () => {
  const { profile, switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const handleLaunchRole = (role: UserRole, targetRoute: string) => {
    switchDemoRole(role);
    navigate(targetRoute);
  };

  return (
    <div className="bg-canvas-night text-on-dark min-h-screen">
      {/* ── Cinematic Hero Section ── */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 pb-16 sm:pb-28 border-b border-hairline-dark">
        <div className="container-cinematic relative z-10">
          <div className="max-w-4xl space-y-8">
            {/* Eyebrow */}
            <div className="hero-eyebrow">
              <Badge variant="dark" size="md">
                Multi-Source Disaster Reconciliation
              </Badge>
            </div>

            {/* Headline in thin display style */}
            <h1 className="hero-title type-display-xxl text-on-dark">
              Reuniting Families in Crisis When Names & Faces Aren't Enough.
            </h1>

            {/* Supporting Copy */}
            <p className="hero-copy type-body-lg text-shade-30 max-w-2xl leading-relaxed">
              MILAN connects missing person inquiries from families with field rescue camps, NGOs, and hospital triage records using explainable weighted multi-attribute matching and human verification.
            </p>

            {/* Pill CTA System */}
            <div className="hero-ctas flex flex-wrap items-center gap-4 pt-4">
              <Button
                variant="aloe"
                size="lg"
                onClick={() => handleLaunchRole('FAMILY', '/report/missing')}
                leftIcon={<Users className="w-4 h-4" />}
              >
                File Missing Person Report
              </Button>
              <Button
                variant="outline-dark"
                size="lg"
                onClick={() => handleLaunchRole('NGO', '/report/found')}
                leftIcon={<Building2 className="w-4 h-4" />}
              >
                Register Rescued Person
              </Button>
              <Button
                variant="ghost-dark"
                size="lg"
                onClick={() => navigate('/cases')}
                leftIcon={<Search className="w-4 h-4" />}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Browse Cases
              </Button>
            </div>
          </div>
        </div>

        {/* Cinematic Subtle Optical Glow */}
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* ── 4 Intake Portals (Cinematic Cards) ── */}
      <section className="section-cinematic border-b border-hairline-dark">
        <div className="container-cinematic space-y-12">
          <div className="max-w-2xl space-y-3">
            <span className="type-eyebrow text-shade-40">Operational Architecture</span>
            <h2 className="type-display-md text-on-dark">
              Structured Intake Across 4 Channels
            </h2>
            <p className="type-body-md text-shade-40 leading-relaxed">
              Standardized data capture for families, rescue units, medical facilities, and human verification coordinators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Family Portal */}
            <div className="card-cinematic flex flex-col justify-between group hover:border-shade-60 transition-all duration-200">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-pill bg-white/10 flex items-center justify-center text-on-dark">
                  <Users className="w-5 h-5" />
                </div>
                <div className="space-y-2">
                  <Badge variant="dark" size="sm">Families & Relatives</Badge>
                  <h3 className="type-heading-lg text-on-dark pt-1">Missing Person Intake</h3>
                  <p className="type-caption text-shade-40 leading-relaxed">
                    6-step comprehensive intake: physical identifiers, clothing, birthmarks, and distinguishing personal clues.
                  </p>
                </div>
              </div>
              <div className="pt-6">
                <Button
                  variant="outline-dark"
                  size="sm"
                  onClick={() => handleLaunchRole('FAMILY', '/report/missing')}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                  className="w-full justify-between"
                >
                  Open Family Form
                </Button>
              </div>
            </div>

            {/* NGO & Army Rescue Portal */}
            <div className="card-cinematic flex flex-col justify-between group hover:border-shade-60 transition-all duration-200">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-pill bg-white/10 flex items-center justify-center text-on-dark">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="space-y-2">
                  <Badge variant="dark" size="sm">NGO & Army Rescue</Badge>
                  <h3 className="type-heading-lg text-on-dark pt-1">Found Person Intake</h3>
                  <p className="type-caption text-shade-40 leading-relaxed">
                    Branching form designed for field camps: handles communicative and non-verbal shock survivors.
                  </p>
                </div>
              </div>
              <div className="pt-6">
                <Button
                  variant="outline-dark"
                  size="sm"
                  onClick={() => handleLaunchRole('NGO', '/report/found')}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                  className="w-full justify-between"
                >
                  Open Rescue Form
                </Button>
              </div>
            </div>

            {/* Hospital Portal */}
            <div className="card-cinematic flex flex-col justify-between group hover:border-shade-60 transition-all duration-200">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-pill bg-white/10 flex items-center justify-center text-on-dark">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div className="space-y-2">
                  <Badge variant="dark" size="sm">Hospitals & Clinics</Badge>
                  <h3 className="type-heading-lg text-on-dark pt-1">Medical Intake</h3>
                  <p className="type-caption text-shade-40 leading-relaxed">
                    Triage observations, blood group, trauma markings, and referral tracking with strict privacy locks.
                  </p>
                </div>
              </div>
              <div className="pt-6">
                <Button
                  variant="outline-dark"
                  size="sm"
                  onClick={() => handleLaunchRole('HOSPITAL', '/report/hospital')}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                  className="w-full justify-between"
                >
                  Open Hospital Form
                </Button>
              </div>
            </div>

            {/* Reviewer Portal */}
            <div className="card-cinematic flex flex-col justify-between group hover:border-shade-60 transition-all duration-200">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-pill bg-white/10 flex items-center justify-center text-on-dark">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="space-y-2">
                  <Badge variant="dark" size="sm">Review Coordinators</Badge>
                  <h3 className="type-heading-lg text-on-dark pt-1">Match Review Portal</h3>
                  <p className="type-caption text-shade-40 leading-relaxed">
                    Side-by-side candidate comparison with confidence tiers, evidence scores, and human verify/reject actions.
                  </p>
                </div>
              </div>
              <div className="pt-6">
                <Button
                  variant="outline-dark"
                  size="sm"
                  onClick={() => handleLaunchRole('REVIEWER', '/review')}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                  className="w-full justify-between"
                >
                  Open Reviewer Portal
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Instant Evaluation Sandbox (Dark Chrome) ── */}
      <section className="section-cinematic border-b border-hairline-dark">
        <div className="container-cinematic">
          <div className="card-cinematic space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="type-heading-lg text-on-dark flex items-center gap-2">
                  <Database className="w-4 h-4 text-aloe" />
                  1-Click Demo Personas (Evaluation Sandbox)
                </h3>
                <p className="type-caption text-shade-40 mt-1">
                  Select any persona to immediately evaluate the platform with pre-configured authority credentials:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {(Object.keys(DEMO_USERS) as UserRole[]).map((r) => {
                const user = DEMO_USERS[r];
                const isCurrent = profile?.role === r;
                return (
                  <button
                    key={r}
                    onClick={() => handleLaunchRole(r, '/dashboard')}
                    className={`p-3.5 rounded-md border text-left transition-all duration-200 select-none ${
                      isCurrent
                        ? 'bg-aloe text-ink border-aloe shadow-sm font-semibold'
                        : 'bg-canvas-night border-hairline-dark text-on-dark hover:bg-white/5 hover:border-shade-60'
                    }`}
                  >
                    <div className={`text-[10px] font-semibold uppercase tracking-wider ${isCurrent ? 'text-ink' : 'text-shade-40'}`}>
                      {r.replace('_', ' ')}
                    </div>
                    <div className="text-xs font-semibold truncate mt-1">{user.fullName}</div>
                    <div className={`text-[10px] truncate mt-0.5 ${isCurrent ? 'text-shade-70' : 'text-shade-50'}`}>
                      {user.orgName?.split(' ')[0]}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Core Principles (Editorial 3-Column) ── */}
      <section className="section-cinematic">
        <div className="container-cinematic">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-pill bg-white/10 flex items-center justify-center text-on-dark">
                <Search className="w-4 h-4" />
              </div>
              <h4 className="type-heading-md text-on-dark">
                Deterministic Weighted Matching
              </h4>
              <p className="type-caption text-shade-40 leading-relaxed">
                Transparent, explainable scoring across names, age brackets, scars, tattoos, and clothing without black-box false positives.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-9 h-9 rounded-pill bg-white/10 flex items-center justify-center text-on-dark">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h4 className="type-heading-md text-on-dark">
                Mandatory Human Verification
              </h4>
              <p className="type-caption text-shade-40 leading-relaxed">
                Matches are never confirmed automatically. Authorized reviewers audit evidence side-by-side before notifying families.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-9 h-9 rounded-pill bg-white/10 flex items-center justify-center text-on-dark">
                <Clock className="w-4 h-4" />
              </div>
              <h4 className="type-heading-md text-on-dark">
                Honest Family Status Timeline
              </h4>
              <p className="type-caption text-shade-40 leading-relaxed">
                Transparent case milestones (SUBMITTED → SEARCHING → POSSIBLE_MATCH → VERIFIED) so families always know their case is actively tracked.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
