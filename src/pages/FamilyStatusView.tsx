import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLocalCases, FullCaseData } from '../services/caseService.ts';
import {
  Heart,
  Clock,
  CheckCircle2,
  Phone,
  ArrowLeft,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../components/ui/Button.tsx';
import { Badge } from '../components/ui/Badge.tsx';

export const FamilyStatusView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const caseData: FullCaseData | null = React.useMemo(() => {
    const all = getLocalCases();
    return all.find((c) => c.case.id === id || c.case.case_uid === id) || null;
  }, [id]);

  if (!caseData) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-canvas-light border border-hairline-light rounded-lg text-center space-y-4 shadow-elevation-3">
        <h2 className="type-heading-lg text-ink">Case Not Found</h2>
        <p className="type-caption text-shade-50">
          The requested case identifier does not exist in the active shelter registry.
        </p>
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/cases')}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Back to Cases Registry
        </Button>
      </div>
    );
  }

  const { case: c, attributes: a } = caseData;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline-light"
          size="sm"
          onClick={() => navigate(-1)}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Back to Case Record
        </Button>

        <span className="text-xs text-shade-40 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" /> Updated Live
        </span>
      </div>

      {/* Main Empathetic Card */}
      <div className="bg-canvas-light border border-hairline-light rounded-lg p-6 sm:p-10 shadow-elevation-3 space-y-8">
        {/* Header with Heart Icon */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-aloe text-ink rounded-pill flex items-center justify-center mx-auto border border-aloe/40">
            <Heart className="w-5 h-5 fill-ink/10 text-ink" />
          </div>
          <div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Badge variant="shade" size="sm">CASE #{c.case_uid}</Badge>
              <Badge variant={c.status === 'VERIFIED_MATCH' ? 'verified' : c.status === 'POSSIBLE_MATCH' ? 'pending' : 'mint'} size="sm">
                {c.status}
              </Badge>
            </div>
            <h1 className="type-display-md text-ink mt-1">
              Case Status: {a.full_name || 'Missing Relative'}
            </h1>
            <p className="type-caption text-shade-50 max-w-md mx-auto mt-1.5">
              We know waiting in a disaster is difficult. Here is the exact, honest status of what relief teams are doing for your case right now.
            </p>
          </div>
        </div>

        {/* Dynamic Status Block */}
        {c.status === 'VERIFIED_MATCH' ? (
          <div className="p-6 bg-aloe border border-aloe/80 rounded-md text-ink space-y-4">
            <div className="flex items-center gap-2 font-bold text-base text-ink">
              <CheckCircle2 className="w-5 h-5 text-ink" />
              Verified Match Confirmed!
            </div>
            <p className="type-caption text-ink leading-relaxed">
              Relief coordinators have verified that {a.full_name || 'your loved one'} has been located and safe at a designated relief shelter.
            </p>

            <div className="p-4 bg-canvas-light rounded-md border border-hairline-light space-y-2 text-xs text-ink shadow-sm">
              <div className="font-bold text-ink text-sm flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-ink" /> Current Location & Contact
              </div>
              <div><strong>Relief Center:</strong> Camp Relief Zone 2 (NDRF Battalion 4 Shelter)</div>
              <div><strong>Coordinating Officer:</strong> Major Vikram Rathore</div>
              <div><strong>Identification Case UID:</strong> <span className="font-mono font-bold bg-shade-30 px-2 py-0.5 rounded text-ink">{c.case_uid}</span></div>
              <div className="pt-2 border-t border-hairline-light flex items-center gap-2 text-ink font-semibold">
                <Phone className="w-4 h-4" /> 24/7 Family Reunion Desk: +91 98765 43210
              </div>
            </div>
          </div>
        ) : c.status === 'POSSIBLE_MATCH' ? (
          <div className="p-6 bg-canvas-cream border border-hairline-light rounded-md space-y-4">
            <div className="flex items-center gap-2 font-bold text-base text-ink">
              <Clock className="w-5 h-5 text-amber-600" />
              Potential Match Being Verified by Relief Coordinators
            </div>
            <p className="type-caption text-shade-60 leading-relaxed">
              A potential candidate survivor in one of our rescue shelters shares key physical characteristics with your report.
            </p>
            <div className="p-4 bg-canvas-light rounded-md border border-hairline-light text-xs space-y-1">
              <strong className="text-ink">Why hasn't this been confirmed yet?</strong>
              <p className="type-caption text-shade-50 leading-relaxed">
                We never make automatic decisions that could cause false hope. An authorized humanitarian reviewer is verifying the physical clues before connecting you directly.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-canvas-cream border border-hairline-light rounded-md space-y-3">
            <div className="flex items-center gap-2 font-bold text-base text-ink">
              <RefreshCw className="w-5 h-5 text-ink" />
              Active Search & Continuous Cross-Matching
            </div>
            <p className="type-caption text-shade-60 leading-relaxed">
              Your report is registered and continuously checked against every incoming survivor admission across all field rescue camps and hospital beds.
            </p>
          </div>
        )}

        {/* Transparency Counters */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-4 bg-canvas-cream border border-hairline-light rounded-md">
            <div className="type-heading-xl font-light text-ink">94</div>
            <div className="text-[10px] text-shade-50 font-semibold uppercase tracking-wider mt-1">Shelter Intakes Checked</div>
          </div>
          <div className="p-4 bg-canvas-cream border border-hairline-light rounded-md">
            <div className="type-heading-xl font-light text-ink">6</div>
            <div className="text-[10px] text-shade-50 font-semibold uppercase tracking-wider mt-1">Relief Camps Active</div>
          </div>
          <div className="p-4 bg-canvas-cream border border-hairline-light rounded-md">
            <div className="type-heading-xl font-light text-ink">24/7</div>
            <div className="text-[10px] text-shade-50 font-semibold uppercase tracking-wider mt-1">Matching Frequency</div>
          </div>
        </div>

        {/* Recorded Details Snapshot */}
        <div className="p-5 bg-canvas-cream border border-hairline-light rounded-md text-xs space-y-2">
          <div className="font-semibold text-ink">Attributes Tracked in System:</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-shade-60 text-xs">
            <div>• Name: <strong className="text-ink">{a.full_name || '—'}</strong></div>
            <div>• Age: <strong className="text-ink">{a.age || '—'} yrs</strong></div>
            <div>• Clothing: <strong className="text-ink">{a.clothing || '—'}</strong></div>
            <div>• Key Clue: <strong className="text-ink">{a.identifying_clue || '—'}</strong></div>
          </div>
        </div>

        {/* Need Help CTA */}
        <div className="text-center pt-2">
          <p className="type-caption text-shade-50 mb-3">
            Have more photographs or updated details about what they were wearing?
          </p>
          <a
            href="tel:+919876543210"
            className="inline-flex items-center gap-2"
          >
            <Button
              variant="primary"
              size="md"
              leftIcon={<Phone className="w-4 h-4" />}
            >
              Call National Disaster Helpline (1078)
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
};
