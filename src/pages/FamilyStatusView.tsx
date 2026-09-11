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
      <div className="max-w-xl mx-auto my-12 p-8 bg-white border border-[#dddddd] rounded-xl text-center space-y-4 shadow-elevation-1">
        <h2 className="font-display text-xl font-normal text-[#181d26]">Case Not Found</h2>
        <p className="text-xs text-[#41454d]">
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
          variant="secondary"
          size="sm"
          onClick={() => navigate(-1)}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Back to Case Record
        </Button>

        <span className="text-xs text-[#9297a0] flex items-center gap-1 font-mono">
          <Clock className="w-3.5 h-3.5" /> Updated Live
        </span>
      </div>

      {/* Main Empathetic Card (Airtable White Canvas Card) */}
      <div className="bg-white border border-[#dddddd] rounded-xl p-6 sm:p-10 shadow-elevation-1 space-y-8">
        {/* Header with Heart Icon */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-[#f5e9d4] text-[#181d26] rounded-full flex items-center justify-center mx-auto border border-[#e0d0b5]">
            <Heart className="w-5 h-5 fill-[#181d26]/10 text-[#181d26]" />
          </div>
          <div>
            <div className="flex items-center justify-center gap-2 mb-2 flex-wrap">
              <span className="text-xs font-mono font-bold text-[#181d26] bg-[#f8fafc] px-2.5 py-1 rounded border border-[#dddddd]">
                CASE #{c.case_uid}
              </span>
              <Badge variant={c.status === 'VERIFIED_MATCH' ? 'verified' : c.status === 'POSSIBLE_MATCH' ? 'pending' : 'shade'} size="sm">
                {c.status.replace('_', ' ')}
              </Badge>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-normal text-[#181d26] mt-1">
              Case Status: {a.full_name || 'Missing Relative'}
            </h1>
            <p className="text-sm text-[#41454d] max-w-md mx-auto mt-1.5 leading-relaxed">
              We know waiting in a disaster is difficult. Here is the exact, honest status of what relief teams are doing for your case right now.
            </p>
          </div>
        </div>

        {/* Dynamic Status Block */}
        {c.status === 'VERIFIED_MATCH' ? (
          <div className="p-6 bg-[#a8d8c4]/30 border border-[#a8d8c4] rounded-lg text-[#006400] space-y-4">
            <div className="flex items-center gap-2 font-bold text-base">
              <CheckCircle2 className="w-5 h-5 text-[#006400]" />
              Verified Match Confirmed!
            </div>
            <p className="text-xs leading-relaxed text-[#181d26]">
              Relief coordinators have verified that {a.full_name || 'your loved one'} has been located and safe at a designated relief shelter.
            </p>

            <div className="p-4 bg-white rounded-lg border border-[#dddddd] space-y-2 text-xs text-[#181d26] shadow-sm">
              <div className="font-bold text-sm flex items-center gap-1.5 text-[#181d26]">
                <MapPin className="w-4 h-4 text-[#006400]" /> Current Location & Contact
              </div>
              <div><strong>Relief Center:</strong> Camp Relief Zone 2 (NDRF Battalion 4 Shelter)</div>
              <div><strong>Coordinating Officer:</strong> Major Vikram Rathore</div>
              <div><strong>Case Tracking UID:</strong> <span className="font-mono font-bold bg-[#f8fafc] px-2 py-0.5 rounded border border-[#dddddd] text-[#181d26]">{c.case_uid}</span></div>
              <div className="pt-2 border-t border-[#dddddd] flex items-center gap-2 text-[#006400] font-semibold">
                <Phone className="w-4 h-4" /> 24/7 Family Reunion Desk: +91 98765 43210
              </div>
            </div>
          </div>
        ) : c.status === 'POSSIBLE_MATCH' ? (
          <div className="p-6 bg-[#f5e9d4] border border-[#e0d0b5] rounded-lg space-y-4">
            <div className="flex items-center gap-2 font-bold text-base text-[#181d26]">
              <Clock className="w-5 h-5 text-[#aa2d00]" />
              Potential Match Being Verified by Relief Coordinators
            </div>
            <p className="text-xs text-[#333840] leading-relaxed">
              A potential candidate survivor in one of our rescue shelters shares key physical characteristics with your report.
            </p>
            <div className="p-4 bg-white rounded-lg border border-[#dddddd] text-xs space-y-1">
              <strong className="text-[#181d26]">Why hasn't this been confirmed yet?</strong>
              <p className="text-xs text-[#41454d] leading-relaxed">
                We never make automatic decisions that could cause false hope. An authorized humanitarian reviewer is verifying the physical clues before connecting you directly.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-[#f8fafc] border border-[#dddddd] rounded-lg space-y-3">
            <div className="flex items-center gap-2 font-bold text-base text-[#181d26]">
              <RefreshCw className="w-5 h-5 text-[#181d26]" />
              Active Search & Continuous Cross-Matching
            </div>
            <p className="text-xs text-[#41454d] leading-relaxed">
              Your report is registered and continuously checked against every incoming survivor admission across all field rescue camps and hospital beds.
            </p>
          </div>
        )}

        {/* Transparency Counters (Airtable Demo Grids) */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-4 bg-[#f8fafc] border border-[#dddddd] rounded-lg">
            <div className="font-display text-2xl font-normal text-[#181d26]">94</div>
            <div className="text-[10px] text-[#9297a0] font-semibold uppercase tracking-wider mt-1">Shelter Intakes Checked</div>
          </div>
          <div className="p-4 bg-[#f8fafc] border border-[#dddddd] rounded-lg">
            <div className="font-display text-2xl font-normal text-[#181d26]">6</div>
            <div className="text-[10px] text-[#9297a0] font-semibold uppercase tracking-wider mt-1">Relief Camps Active</div>
          </div>
          <div className="p-4 bg-[#f8fafc] border border-[#dddddd] rounded-lg">
            <div className="font-display text-2xl font-normal text-[#181d26]">24/7</div>
            <div className="text-[10px] text-[#9297a0] font-semibold uppercase tracking-wider mt-1">Matching Frequency</div>
          </div>
        </div>

        {/* Recorded Details Snapshot */}
        <div className="p-5 bg-[#f8fafc] border border-[#dddddd] rounded-lg text-xs space-y-2">
          <div className="font-semibold text-[#181d26]">Attributes Tracked in System:</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#41454d] text-xs">
            <div>• Name: <strong className="text-[#181d26]">{a.full_name || '—'}</strong></div>
            <div>• Age: <strong className="text-[#181d26]">{a.age || '—'} yrs</strong></div>
            <div>• Clothing: <strong className="text-[#181d26]">{a.clothing || '—'}</strong></div>
            <div>• Key Clue: <strong className="text-[#181d26]">{a.identifying_clue || '—'}</strong></div>
          </div>
        </div>

        {/* Need Help CTA */}
        <div className="text-center pt-2">
          <p className="text-xs text-[#41454d] mb-3">
            Have more photographs or updated details about what they were wearing?
          </p>
          <a
            href="tel:1078"
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
